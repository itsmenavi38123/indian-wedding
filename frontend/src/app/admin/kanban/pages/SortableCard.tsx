'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, DollarSign, Clock, Edit, Archive, Loader2, MapPin } from 'lucide-react';
import { ShimmerLoadingBar } from '../components/LoadingIndicators';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { LeadStatus } from '@/types/lead/Lead';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const formatBudget = (min: number, max: number) => {
  const formatAmount = (amount: number) => {
    if (amount >= 10000000) return `${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `${(amount / 100000).toFixed(0)}L`;
    if (amount >= 1000) return `${(amount / 1000).toFixed(0)}K`;
    return amount.toString();
  };
  return `₹${formatAmount(min)}-${formatAmount(max)}`;
};

interface SortableCardProps {
  card: any;
  column: any;
  isMoving?: boolean;
  onArchiveLead: (leadId: string) => Promise<void>;
  // onStatusChange?: (leadId: string, newStatus: LeadStatus) => Promise<void>;
}

export const SortableCard = ({
  card,
  column,
  isMoving = false,
  onArchiveLead,
  // onStatusChange,
}: SortableCardProps) => {
  const router = useRouter();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : isMoving ? 0.8 : 1,
    willChange: 'transform',
  };

  const [open, setOpen] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  const leadData = card.leadData || {};
  const coupleNames =
    leadData.partner1Name && leadData.partner2Name
      ? `${leadData.partner1Name} & ${leadData.partner2Name}`
      : leadData.partner1Name || card.title;
  const daysInStage = leadData.daysInStage || 0;

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/admin/leads/edit/${card.id}`);
  };

  const handleArchiveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedLeadId(card.id);
    setOpen(true);
  };

  const handleCancel = () => {
    setOpen(false);
    setSelectedLeadId(null);
  };

  // const handleArchive = async (e: React.MouseEvent) => {
  //   e.stopPropagation();
  //   try {
  //     await onArchiveLead(card.id);
  //   } catch (e) {}
  // };

  const handleConfirm = async () => {
    if (!selectedLeadId) return;
    setOpen(false);
    try {
      await onArchiveLead(selectedLeadId);
      toast.success('Lead archived successfully!');
    } catch (e) {
      console.error('Failed to archive lead:', e);
      toast.error('Failed to archive lead');
    } finally {
      setSelectedLeadId(null);
    }
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={`bg-white border ${isMoving ? 'border-orange-400' : 'border-gray-200'} p-2 rounded-lg hover:shadow-lg transition-shadow relative group cursor-move touch-none`}
      >
        <ShimmerLoadingBar isLoading={isMoving} />

        {isMoving && (
          <div className="absolute inset-0 bg-white/70 rounded-lg flex items-center justify-center z-10">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
          </div>
        )}

        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block">
          <div className="flex gap-1 bg-white rounded-md shadow-sm border">
            <button
              className="p-1.5 hover:bg-gray-50 rounded-l-md transition-colors"
              onClick={handleEdit}
            >
              <Edit size={14} className="text-gray-600" />
            </button>
            <button
              className="p-1.5 hover:bg-gray-50 rounded-r-md transition-colors border-l"
              onClick={handleArchiveClick}
            >
              <Archive size={14} className="text-gray-600" />
            </button>
          </div>
        </div>

        <div
          className={`absolute top-0 left-0 w-full h-1 rounded-t-lg ${isMoving ? 'bg-orange-400' : 'bg-transparent'} transition-colors`}
        ></div>

        <h3 className="font-semibold text-sm mb-1 pr-8 text-gray-900 truncate antialiased">
          {coupleNames}
        </h3>

        {(leadData.initialNotes || card.description) && (
          <p className="text-xs text-gray-600 mb-2 line-clamp-2 antialiased">
            {leadData.initialNotes || card.description}
          </p>
        )}

        {/* Wedding Info */}
        <div className="space-y-1.5 mb-2">
          {leadData.weddingDate && (
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <Calendar size={12} className="text-blue-500 flex-shrink-0" />
              <span>
                {new Date(leadData.weddingDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          )}

          {leadData.budgetMin && leadData.budgetMax && (
            <div className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium">
              <DollarSign size={10} />
              <span>{formatBudget(leadData.budgetMin, leadData.budgetMax)}</span>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-xs">
            <Clock size={12} className="text-orange-500 flex-shrink-0" />
            <span className="text-orange-600 font-medium truncate">
              {daysInStage}d in {column.name}
            </span>
          </div>

          {leadData.preferredLocations && leadData.preferredLocations.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <MapPin size={12} className="text-red-500 flex-shrink-0" />
              <span className="truncate">
                {leadData.preferredLocations.slice(0, 2).join(', ')}
                {leadData.preferredLocations.length > 2 ? ' +more' : ''}
              </span>
            </div>
          )}
        </div>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Archive Lead</DialogTitle>
            <DialogDescription>Are you sure you want to archive this lead?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancel}>
              No
            </Button>
            <Button onClick={handleConfirm}>Yes, Archive</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
