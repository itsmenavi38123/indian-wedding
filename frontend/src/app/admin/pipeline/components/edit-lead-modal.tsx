'use client';

import { useEffect, useState } from 'react';
import type { Lead } from './types';

type Props = {
  open: boolean;
  lead?: Lead;
  onClose: () => void;
  onSave: (patch: Partial<Lead>) => void;
};

export default function EditLeadModal({ open, lead, onClose, onSave }: Props) {
  const [couple, setCouple] = useState('');
  const [date, setDate] = useState('');
  const [budget, setBudget] = useState<number>(0);
  const [assignee, setAssignee] = useState('');

  useEffect(() => {
    if (!open || !lead) return;
    setCouple(lead.couple);
    setDate(lead.weddingDate.slice(0, 10));
    setBudget(lead.budget);
    setAssignee(lead.assignee?.name ?? '');
  }, [open, lead]);

  if (!open || !lead) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4">
      <div className="w-full sm:max-w-md rounded-t-xl sm:rounded-lg border border-gray-200 bg-white p-4 sm:p-5 shadow-lg animate-in slide-in-from-bottom sm:slide-in-from-bottom-0">
        <h2 className="text-lg font-semibold text-gray-900">Edit Lead</h2>
        <div className="mt-4 grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Couple</label>
            <input
              className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={couple}
              onChange={(e) => setCouple(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Wedding date</label>
            <input
              type="date"
              className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Budget (USD)</label>
            <input
              type="number"
              inputMode="numeric"
              className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assignee</label>
            <input
              className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              placeholder="Unassigned"
            />
          </div>
        </div>
        <div className="mt-6 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-md border border-gray-300 bg-white px-4 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onSave({
                couple,
                weddingDate: new Date(date).toISOString(),
                budget,
                assignee: assignee ? { name: assignee } : undefined,
              });
              onClose();
            }}
            className="h-10 rounded-md bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
