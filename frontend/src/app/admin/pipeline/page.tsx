'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { Lead, STAGES } from './components/types';
import Filters, { FiltersState } from './components/filters';
import ViewToggle from './components/view-toggle';
import MetricsBar from './components/metrics-bar';
import KanbanBoard from './components/kanban-board';
import ListView from './components/list-view';
import PipelineCalendarView from './components/calendar-view';
import ConnectionStatus from './components/connection-status';
import { pipelineApi, PipelineFilters } from '@/services/api/pipeline';
import { toast } from 'sonner';
import { usePipelineSocket } from '@/hooks/useSocket';
export default function PipelinePage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);

  const [filters, setFilters] = useState<FiltersState>({
    member: 'all',
    startDate: '',
    endDate: '',
    minBudget: '',
    maxBudget: '',
  });
  const [view, setView] = useState<'kanban' | 'list' | 'calendar'>('kanban');

  // Handle real-time updates from Socket.IO
  const handleSocketUpdate = useCallback((event: string, data: any) => {
    console.log('Received socket event:', event, data);

    switch (event) {
      case 'lead-updated':
        setLeads((prev) => prev.map((lead) => (lead.id === data.id ? data : lead)));
        toast.info('Lead updated by another user');
        break;

      case 'lead-status-updated':
        setLeads((prev) => prev.map((lead) => (lead.id === data.id ? data : lead)));
        toast.info('Lead status changed by another user');
        break;

      case 'lead-archived':
        setLeads((prev) => prev.filter((lead) => lead.id !== data.id));
        toast.info('Lead archived by another user');
        break;
    }
  }, []);

  // Initialize socket connection
  usePipelineSocket(handleSocketUpdate);

  // Fetch leads with filters - now only called on Apply
  const fetchLeads = useCallback(
    async (filterValues?: FiltersState) => {
      try {
        const isInitialLoad = !filterValues;
        if (!isInitialLoad) {
          setIsFiltering(true);
        } else {
          setIsLoading(true);
        }

        const filtersToUse = filterValues || filters;

        // Convert filters to API format
        const apiFilters: PipelineFilters = {
          assignee: filtersToUse.member !== 'all' ? filtersToUse.member : undefined,
          startDate: filtersToUse.startDate || undefined,
          endDate: filtersToUse.endDate || undefined,
          minBudget: filtersToUse.minBudget || undefined,
          maxBudget: filtersToUse.maxBudget || undefined,
        };

        const data = await pipelineApi.getLeads(apiFilters);
        setLeads(data);

        // Update the stored filters if this was from Apply button
        if (filterValues) {
          setFilters(filterValues);
        }
      } catch (error) {
        console.error('Failed to fetch leads:', error);
        toast.error('Failed to load pipeline data');
      } finally {
        setIsLoading(false);
        setIsFiltering(false);
      }
    },
    [filters]
  );

  // Handle filter apply
  const handleApplyFilters = useCallback(
    (newFilters: FiltersState) => {
      fetchLeads(newFilters);
    },
    [fetchLeads]
  );

  // Initial load only
  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Get unique assignees from current leads for filter dropdown
  const assignees = useMemo(() => {
    const set = new Set<string>();
    set.add('all');
    leads.forEach((l) => set.add(l.assignee?.name ?? 'Unassigned'));
    return Array.from(set);
  }, [leads]);

  // Handlers
  const updateLead = async (id: string, patch: Partial<Lead>) => {
    try {
      //   setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
      let updatedLead: Lead;

      if (patch.stage && Object.keys(patch).length === 1) {
        updatedLead = await pipelineApi.updateLeadStatus(id, patch.stage);
        toast.success('Lead status updated');
      } else if (patch.stage && patch.dateInStage) {
        updatedLead = await pipelineApi.updateLeadStatus(id, patch.stage);
        toast.success('Lead moved successfully');
      } else {
        updatedLead = await pipelineApi.updateLead(id, patch);
        toast.success('Lead details updated');
      }
      setLeads((prev) => prev.map((l) => (l.id === id ? updatedLead : l)));
    } catch (error) {
      console.error('Failed to update lead:', error);
      toast.error('Failed to update lead');
      // Revert on error by fetching fresh data with current filters
      await fetchLeads();
    }
  };

  const archiveLead = async (id: string) => {
    try {
      await pipelineApi.archiveLead(id);
      // Remove from local state immediately
      setLeads((prev) => prev.filter((l) => l.id !== id));
      toast.success('Lead archived successfully');
    } catch (error) {
      console.error('Failed to archive lead:', error);
      toast.error('Failed to archive lead');
      // Refresh data on error
      await fetchLeads();
    }
  };

  if (isLoading) {
    return (
      <main className="flex min-h-[100svh] flex-col gap-4 p-4 md:p-6 font-sans">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading pipeline data...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col min-h-[100svh] relative max-w-full mx-auto  gap-4">
      <header className="flex flex-col  gap-2 sm:gap-3 md:gap-4 w-full max-w-full">
        <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2 sm:gap-3 w-full max-w-full">
          <div className="flex items-center p-2 gap-2 sm:gap-3 flex-shrink-0 min-w-0 max-w-full">
            <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold tracking-tight truncate">
              Pipeline
            </h1>
            <div className="flex">
              <ConnectionStatus />
            </div>
          </div>
          <div className="flex w-full xs:w-auto p-2">
            <ViewToggle value={view} onChange={setView} />
          </div>
        </div>

        <div className="w-full max-w-full  p-2">
          <Filters
            assignees={assignees}
            value={filters}
            onChange={setFilters}
            onApply={handleApplyFilters}
            isLoading={isFiltering}
          />
        </div>
      </header>

      <div className="w-full max-w-full  my-2 p-2">
        <MetricsBar leads={leads} />
      </div>

      {/* Show loading overlay when filtering */}
      {isFiltering && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm">
          <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-sm border">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="text-sm text-gray-600">Applying filters...</div>
          </div>
        </div>
      )}

      {/* Main content area with proper mobile handling */}
      <div className="flex-1 w-full max-w-full px-2 pb-2 overflow-y-auto">
        {view === 'kanban' ? (
          <div className="h-full w-full overflow-auto">
            <KanbanBoard
              leads={leads}
              allLeads={leads}
              // setLeads={setLeads}
              updateLead={updateLead}
              archiveLead={archiveLead}
              stages={STAGES}
            />
          </div>
        ) : view === 'list' ? (
          <div className="h-full w-full overflow-auto">
            <ListView leads={leads} updateLead={updateLead} archiveLead={archiveLead} />
          </div>
        ) : (
          <div className="h-full w-full overflow-auto">
            <PipelineCalendarView
              leads={leads}
              //  updateLead={updateLead}
              archiveLead={archiveLead}
            />
          </div>
        )}
      </div>
    </main>
  );
}
