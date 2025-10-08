'use client';

import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Calendar,
  Users,
  MapPin,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  Edit,
  Trash,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LeadStatus } from '@/types/lead/Lead';
import { useRouter } from 'next/navigation';

interface BoardListViewProps {
  data: any[];
  onStatusChange: (leadId: string, newStatus: LeadStatus) => Promise<void>;
  onArchiveLead: (leadId: string) => Promise<void>;
  movingLeadId: string | null;
}

export const BoardListView = ({
  data,
  onStatusChange,
  onArchiveLead,
  movingLeadId,
}: BoardListViewProps) => {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const router = useRouter();
  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const allCards = data.flatMap((col) => {
    return col.cards.map((c: any) => {
      return {
        ...c,
        columnId: col.id,
        columnName: col.name,
        couple: c.title,
        guestCount: c.guestCount ?? 0,
        location: c.location ?? 'Not set',
      };
    });
  });

  const handleEdit = (e: React.MouseEvent, id: any) => {
    e.stopPropagation();
    router.push(`/admin/leads/edit/${id}`);
  };

  const archiveCard = async (leadId: string) => {
    try {
      await onArchiveLead(leadId);
    } catch {}
  };

  const columns = [
    { key: 'couple', label: 'Couple', span: 3 },
    { key: 'status', label: 'Status', span: 2 },
    { key: 'weddingDate', label: 'Wedding Date', span: 2 },
    { key: 'location', label: 'Location', span: 2 },
    { key: 'actions', label: 'Actions', span: 1, center: true },
  ];

  return (
    <div className="flex flex-col h-full overflow-y-auto px-4 py-4 space-y-4 border border-[#e5e5e521]  shadow-sm black-bg rounded-md">
      {allCards.length > 0 ? (
        <>
          <div className="hidden md:grid md:grid-cols-12 gap-4 px-4 py-3 border-b font-semibold text-sm text-white">
            {columns.map((col) => (
              <div
                key={col.key}
                className={`col-span-${col.span} ${col.center ? 'text-center' : ''}`}
              >
                {col.label}
              </div>
            ))}
          </div>
          <div className="divide-y divide-gray-200">
            {allCards.map((card) => {
              const isExpanded = expanded.has(card.id);
              const isMoving = movingLeadId === card.id;
              const formattedDate = card?.leadData?.weddingDate
                ? new Date(card?.leadData.weddingDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : 'Not set';
              console.log(card?.leadData);
              return (
                <div
                  key={card.id}
                  className={`${isMoving ? 'opacity-50 bg-orange-50' : 'hover:dark-bg'} transition-all`}
                >
                  {/* Desktop */}
                  <div className="hidden md:grid md:grid-cols-12 gap-4 px-4 py-4 items-center">
                    <div className="col-span-3 font-medium text-white">{card.couple}</div>
                    <div className="col-span-2">
                      <Select
                        value={card.columnId}
                        onValueChange={(v: any) =>
                          onStatusChange(card.id, v.toUpperCase() as LeadStatus)
                        }
                        disabled={isMoving}
                      >
                        <SelectTrigger className="w-full border text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {data.map((col) => (
                            <SelectItem key={col.id} value={col.id}>
                              {col.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2 flex items-center gap-1 text-sm text-white">
                      <Calendar className="w-4 h-4" />
                      {formattedDate}
                    </div>
                    <div className="col-span-2 flex items-center gap-1 text-sm text-white">
                      <MapPin className="w-4 h-4" />
                      {Array.isArray(card?.leadData?.preferredLocations)
                        ? card.leadData.preferredLocations.join(', ')
                        : card?.leadData?.preferredLocations || 'N/A'}
                    </div>
                    <div className="col-span-1 flex justify-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button className="bg-white" variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="min-w-[140px]">
                          <DropdownMenuItem
                            onClick={(e: any) => handleEdit(e, card.id)}
                            className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 rounded-md"
                          >
                            <Edit className="w-4 h-4 text-gray-600" />
                            <span className="text-gray-800">Edit</span>
                          </DropdownMenuItem>
                          {card?.leadData?.saveStatus !== 'ARCHIVED' && (
                            <DropdownMenuItem
                              onClick={() => archiveCard(card.id)}
                              className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-red-50 rounded-md"
                            >
                              <Trash className="w-4 h-4 text-red-600" />
                              <span className="text-red-700">Archive</span>
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Mobile */}
                  <div className="md:hidden px-4 py-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{card.couple}</div>
                        <div className="mt-2 w-full">
                          <Select
                            value={card.columnId}
                            onValueChange={(v: any) =>
                              onStatusChange(card.id, v.toUpperCase() as LeadStatus)
                            }
                            disabled={isMoving}
                          >
                            <SelectTrigger className="w-full border text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {data.map((col) => (
                                <SelectItem key={col.id} value={col.id}>
                                  {col.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => toggleExpand(card.id)}>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    {isExpanded && (
                      <div className="mt-3 space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {formattedDate}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {card.location}
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          {card.guestCount}
                        </div>
                      </div>
                    )}
                  </div>

                  {isMoving && (
                    <div className="px-4 py-1 bg-orange-100 border-t border-orange-200 text-orange-700 text-xs flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                      Updating status...
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <p className="p-4 text-gray-500 italic text-center">No weddings scheduled.</p>
      )}
    </div>
  );
};
