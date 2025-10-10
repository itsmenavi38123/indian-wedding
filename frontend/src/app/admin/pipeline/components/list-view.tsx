'use client';

import { useMemo, useState } from 'react';
import type { Lead } from './types';
import EditLeadModal from './edit-lead-modal';
import ConfirmModal from './confirm-modal';

type Props = {
  leads: Lead[];
  updateLead: (id: string, patch: Partial<Lead>) => void;
  archiveLead: (id: string) => void;
};

export default function ListView({ leads, updateLead, archiveLead }: Props) {
  const sorted = useMemo(() => {
    return [...leads].sort(
      (a, b) => new Date(a.weddingDate).getTime() - new Date(b.weddingDate).getTime()
    );
  }, [leads]);

  const [editing, setEditing] = useState<Lead | undefined>(undefined);
  const [leadToArchive, setLeadToArchive] = useState<Lead | undefined>(undefined);

  return (
    <section className="w-full h-full flex flex-col rounded-lg border border-[#e5e5e521] overflow-hidden">
      {/* Scrollable wrapper with fixed height */}
      <div className="flex-1 w-full overflow-auto">
        <table className="min-w-[700px] w-full border-collapse">
          <thead className="sticky top-0 z-10">
            <tr className="bg-gold text-left text-xs font-medium text-gray-700 border-b border-[#e5e5e521]">
              <th className="px-3 py-2 sm:px-4 sm:py-3 text-white font-medium text-sm">Couple</th>
              <th className="px-3 py-2 sm:px-4 sm:py-3 text-white font-medium text-sm">
                Wedding date
              </th>
              <th className="px-3 py-2 sm:px-4 sm:py-3 text-white font-medium text-sm">Budget</th>
              <th className="px-3 py-2 sm:px-4 sm:py-3 text-white font-medium text-sm">Stage</th>
              <th className="px-3 py-2 sm:px-4 sm:py-3 hidden sm:table-cell text-white font-medium text-sm">
                Days in stage
              </th>
              <th className="px-3 py-2 sm:px-4 sm:py-3 hidden sm:table-cell text-white font-medium text-sm">
                Assignee
              </th>
              <th className="px-3 py-2 sm:px-4 sm:py-3 text-right text-white font-medium text-sm">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((lead) => {
              const d = new Date(lead.weddingDate);
              const dateFmt = d.toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });
              const days = daysInStage(lead);
              const assignee = lead.assignee?.name ?? 'Unassigned';
              return (
                <tr
                  key={lead.id}
                  className="border-t border-gray-200 text-xs sm:text-sm hover:bg-gray-50"
                >
                  <td className="px-3 py-2 sm:px-4 sm:py-3">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">{lead.couple}</span>
                      <span className="text-[10px] sm:text-xs text-gray-600 mt-0.5">
                        {lead.id.slice(0, 8)}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2 sm:px-4 sm:py-3 text-gray-700">{dateFmt}</td>
                  <td className="px-3 py-2 sm:px-4 sm:py-3">
                    <span className="inline-flex rounded-full bg-blue-50 px-2 py-0.5 text-[10px] sm:text-xs font-semibold text-blue-700">
                      {formatCurrency(lead.budget)}
                    </span>
                  </td>
                  <td className="px-3 py-2 sm:px-4 sm:py-3">
                    <span className="inline-flex rounded-md bg-gray-100 px-2 py-0.5 text-[10px] sm:text-xs text-gray-700">
                      {lead.stage}
                    </span>
                  </td>
                  <td className="px-3 py-2 sm:px-4 sm:py-3 hidden sm:table-cell text-gray-700">
                    {days}d
                  </td>
                  <td className="px-3 py-2 sm:px-4 sm:py-3 hidden sm:table-cell text-gray-700">
                    {assignee}
                  </td>
                  <td className="px-3 py-2 sm:px-4 sm:py-3">
                    <div className="flex items-center justify-end gap-1 sm:gap-2">
                      <button
                        type="button"
                        className="rounded-md px-2 py-1 text-[10px] sm:text-xs text-gray-700 hover:bg-gray-100"
                        onClick={() => setEditing(lead)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="rounded-md px-2 py-1 text-[10px] sm:text-xs text-red-700 hover:bg-red-50"
                        onClick={() => setLeadToArchive(lead)}
                      >
                        Archive
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-white">
                  No leads match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <EditLeadModal
        open={!!editing}
        lead={editing}
        onClose={() => setEditing(undefined)}
        onSave={(patch) => {
          if (!editing) return;
          updateLead(editing.id, patch);
        }}
      />

      <ConfirmModal
        open={!!leadToArchive}
        title="Archive lead?"
        description={
          leadToArchive
            ? `Are you sure you want to archive the lead for ${leadToArchive.couple}? This will remove it from the pipeline.`
            : ''
        }
        confirmText="Archive"
        cancelText="Cancel"
        onConfirm={() => {
          if (!leadToArchive) return;
          archiveLead(leadToArchive.id);
          setLeadToArchive(undefined);
        }}
        onCancel={() => setLeadToArchive(undefined)}
      />
    </section>
  );
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n);
}

function daysInStage(lead: Lead): number {
  const then = new Date(lead.dateInStage).getTime();
  const diff = Date.now() - then;
  return Math.max(0, Math.floor(diff / (24 * 60 * 60 * 1000)));
}
