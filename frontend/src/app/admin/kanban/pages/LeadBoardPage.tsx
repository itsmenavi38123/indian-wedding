'use client';

import { useLeadsBoardData, updateLeadStatus, updateLeadSaveStatus } from '@/services/api/leads';
import { LeadStatus } from '@/types/lead/Lead';
import { useState, useEffect } from 'react';
import {
  DndContext,
  DragEndEvent,
  closestCorners,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableCard } from './SortableCard';
import { DroppableColumn } from './DroppableColumn';
import { LeadFilters } from './LeadFilters';
import { locations } from '@/utils/data';
import { toast } from 'sonner';
import { Toggle } from '@/components/ui/toggle';
import { LeadFiltersAPI, Filters } from './type';
import { BoardListView } from '../components/board-list-view';
import CalendarView from '../components/CalanderView';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const LeadBoardPage = () => {
  const [movingLeadId, setMovingLeadId] = useState<string | null>(null);
  const [optimisticData, setOptimisticData] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'kanban' | 'list' | 'calendar'>('kanban');

  const [filters, setFilters] = useState<LeadFiltersAPI>({});
  const [localFilters, setLocalFilters] = useState<Filters>({
    searchQuery: '',
    selectedLocations: [],
    budgetRange: [500_000, 20_000_000],
    dateRange: {},
  });

  const { data, isLoading, error, refetch } = useLeadsBoardData(filters);
  const displayData = optimisticData.length > 0 ? optimisticData : data?.boards || [];
  const budgetRangeFromDB = data?.budgetRange as [number, number] | undefined;

  useEffect(() => {
    if (budgetRangeFromDB) {
      setLocalFilters((prev) => ({
        ...prev,
        budgetRange: budgetRangeFromDB,
      }));
    }
  }, [budgetRangeFromDB]);

  const sensors = useSensors(
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(PointerSensor, { activationConstraint: { distance: 10 } }),
    useSensor(KeyboardSensor)
  );

  // --- Drag & Drop ---
  const findLeadById = (id: string) =>
    displayData.flatMap((col: any) => col.cards).find((c: any) => c.id === id);

  const findColumnById = (id: string) => displayData.find((col: any) => col.id === id);

  const findColumnByLeadId = (leadId: string) =>
    displayData.find((col: any) => col.cards.some((c: any) => c.id === leadId));

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeLead = findLeadById(active.id as string);
    const overColumn = findColumnByLeadId(over.id as string) || findColumnById(over.id as string);
    if (!activeLead || !overColumn) return;

    const activeColumn = findColumnByLeadId(active.id as string);
    if (activeColumn?.id !== overColumn.id) {
      const newData = displayData.map((col: any) => {
        if (col.id === activeColumn.id)
          return { ...col, cards: col.cards.filter((c: any) => c.id !== activeLead.id) };
        if (col.id === overColumn.id)
          return { ...col, cards: [...col.cards, { ...activeLead, status: overColumn.id }] };
        return col;
      });

      setOptimisticData(newData);
      setMovingLeadId(activeLead.id);

      try {
        await updateLeadStatus(activeLead.id, {
          status: overColumn.id.toUpperCase() as LeadStatus,
        });
        toast.success('Lead status updated!');
        await refetch();
        setOptimisticData([]);
      } catch {
        toast.error('Failed to update lead status');
        setOptimisticData([]);
      }
      setTimeout(() => setMovingLeadId(null), 300);
    }
  };

  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    const newData = displayData.map((col: any) => ({
      ...col,
      cards: col.cards.map((lead: any) =>
        lead.id === leadId ? { ...lead, status: newStatus } : lead
      ),
    }));
    setOptimisticData(newData);

    try {
      await updateLeadStatus(leadId, { status: newStatus });
      toast.success('Lead status updated!');
      await refetch();
      setOptimisticData([]);
    } catch {
      toast.error('Failed to update lead status');
      setOptimisticData([]);
    }
  };

  const handleArchiveLead = async (leadId: string) => {
    try {
      const res = await updateLeadSaveStatus(leadId);
      if (res.statusCode === 200) {
        toast.success('Lead archived successfully!');
        await refetch();
      } else toast.error('Failed to archive lead');
    } catch {
      toast.error('Failed to archive lead');
    }
  };

  if (isLoading) return <div className="flex justify-center items-center h-screen">Loading…</div>;
  if (error)
    return (
      <div className="flex justify-center items-center h-screen text-red-500">Failed to load</div>
    );

  return (
    <div className="flex flex-col w-full overflow-hidden">
      {/* Topbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 mb-3 shrink-0">
        <h1 className="text-lg sm:text-2xl font-bold text-white">Wedding Planning Board</h1>
        <div className="flex items-center gap-2">
          {['kanban', 'list', 'calendar'].map((mode) => (
            <Toggle
              key={mode}
              pressed={viewMode === mode}
              onPressedChange={() => setViewMode(mode as any)}
              className={`px-3 py-1 rounded-lg text-sm text-black cursor-pointer ${mode == 'kanban' ? 'bg-white text-black' : ' text-black bg-white'}`}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </Toggle>
          ))}
        </div>
        <div>
          <Link href={`/admin/leads/archive`} className="text-white hover:underline  bg-gold">
            <Button
              variant={'outline'}
              className="hover:cursor-pointer text-white bg-gold border-0"
            >
              View archives
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <LeadFilters
        initialFilters={localFilters}
        onApplyFilters={(f: LeadFiltersAPI) => {
          setFilters(f); // for API

          // Map API filter back to LeadFilters shape
          setLocalFilters((prev) => ({
            searchQuery: f.search ?? prev.searchQuery,
            selectedLocations: f.location ? f.location.split(',') : prev.selectedLocations,
            budgetRange: f.budgetMin && f.budgetMax ? [f.budgetMin, f.budgetMax] : prev.budgetRange,
            dateRange: {
              from: f.dateFrom ? new Date(f.dateFrom) : prev.dateRange.from,
              to: f.dateTo ? new Date(f.dateTo) : prev.dateRange.to,
            },
          }));
        }}
        locations={locations}
      />

      {/* Board */}
      <div className="flex-1 overflow-y-auto">
        {viewMode === 'kanban' && (
          <div className="flex flex-col h-full overflow-y-auto px-4 py-4 space-y-4 border border-[#e5e5e521] rounded-md shadow-sm black-bg">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCorners}
              onDragEnd={handleDragEnd}
            >
              <div className="flex flex-col sm:flex-row gap-3 px-4 py-4">
                {displayData.map((column: any) => (
                  <SortableContext
                    key={column.id}
                    items={[...column.cards.map((c: any) => c.id), column.id]}
                    strategy={verticalListSortingStrategy}
                  >
                    <DroppableColumn column={column} onStatusChange={handleStatusChange}>
                      {column.cards.map((lead: any) => (
                        <SortableCard
                          key={lead.id}
                          card={lead}
                          column={column}
                          isMoving={movingLeadId === lead.id}
                          onArchiveLead={handleArchiveLead}
                          onStatusChange={handleStatusChange}
                        />
                      ))}
                    </DroppableColumn>
                  </SortableContext>
                ))}
              </div>
            </DndContext>
          </div>
        )}
        {viewMode === 'list' && (
          <BoardListView
            data={displayData}
            onStatusChange={handleStatusChange}
            onArchiveLead={handleArchiveLead}
            movingLeadId={movingLeadId}
          />
        )}

        {viewMode === 'calendar' && (
          <CalendarView data={displayData} onArchiveLead={handleArchiveLead} />
        )}
      </div>
    </div>
  );
};
