'use client';

import type React from 'react';
import { type Lead, daysInStage } from './types';

type Props = {
  lead: Lead;
  dragging?: boolean;
  onEdit: (lead: Lead) => void;
  onArchive: (id: string) => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
};

export default function LeadCard({
  lead,
  dragging = false,
  onEdit,
  onArchive,
  draggable = true,
  onDragStart,
  onDragEnd,
}: Props) {
  const d = new Date(lead.weddingDate);
  const dateFmt = d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const initial = (lead.assignee?.name ?? 'U').slice(0, 1).toUpperCase();

  return (
    <article
      role="listitem"
      className={`group relative rounded-lg border bg-white p-3 sm:p-4 shadow-sm transition-shadow ${
        dragging ? 'border-2 border-dashed border-blue-400' : 'border-gray-200 hover:shadow'
      }`}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      aria-grabbed={dragging}
    >
      {/* Header: Couple + Budget */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-0">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm sm:text-base font-semibold text-gray-900 break-words">
            {lead.couple}
          </h3>
          <p className="mt-0.5 text-xs sm:text-sm text-gray-600">Wedding: {dateFmt}</p>
        </div>
        <span className="inline-flex items-center rounded-full bg-blue-50 px-2 sm:px-3 py-0.5 text-xs sm:text-sm font-medium text-blue-700 w-fit">
          {formatCurrency(lead.budget)}
        </span>
      </div>

      {/* Footer: Assignee + Actions */}
      <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-2">
          <div
            aria-label={`Assigned to ${lead.assignee?.name ?? 'Unassigned'}`}
            className="grid h-7 w-7 place-items-center rounded-full bg-gray-100 text-xs font-semibold text-gray-700"
            title={lead.assignee?.name ?? 'Unassigned'}
          >
            {initial}
          </div>
          <p className="text-xs sm:text-sm text-gray-600">In stage {daysInStage(lead)}d</p>
        </div>

        {/* Buttons - always visible on mobile, hover-reveal on desktop */}
        <div className="flex items-center gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={() => onEdit(lead)}
            className="rounded-md px-2 py-1 text-xs sm:text-sm text-gray-700 hover:bg-gray-100 active:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onArchive(lead.id)}
            className="rounded-md px-2 py-1 text-xs sm:text-sm text-red-700 hover:bg-red-50 active:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Archive
          </button>
        </div>
      </div>
    </article>
  );
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n);
}
