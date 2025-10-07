'use client';

import { useMemo, useRef, useState } from 'react';

import LeadCard from './lead-card';
import { Lead, Stage, stageDisplayNames, stageIndex, STAGES } from './types';
import ConfirmModal from './confirm-modal';
import EditLeadModal from './edit-lead-modal';

type Props = {
  leads: Lead[];
  allLeads: Lead[];
  setLeads: (updater: (prev: Lead[]) => Lead[]) => void;
  updateLead: (id: string, patch: Partial<Lead>) => void;
  archiveLead: (id: string) => void;
  stages?: Stage[];
};

export default function KanbanBoard({
  leads,
  setLeads,
  updateLead,
  archiveLead,
  stages = STAGES,
}: Props) {
  const byStage = useMemo(() => {
    const map = new Map<Stage, Lead[]>();
    stages.forEach((s) => map.set(s, []));
    leads.forEach((l) => map.get(l.stage)?.push(l));
    return map;
  }, [leads, stages]);

  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<Stage | null>(null);
  const [pendingMove, setPendingMove] = useState<{ id: string; from: Stage; to: Stage } | null>(
    null
  );

  const scrollRef = useRef<HTMLDivElement>(null);
  // Auto-scroll horizontally near edges during drag
  function handleAutoScroll(clientX: number) {
    const el = scrollRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const threshold = 80;
    const speed = 12;
    if (clientX - rect.left < threshold) {
      el.scrollLeft -= speed;
    } else if (rect.right - clientX < threshold) {
      el.scrollLeft += speed;
    }
  }

  function onDropToStage(stage: Stage) {
    if (!dragId) return;
    const lead = leads.find((l) => l.id === dragId);
    if (!lead || lead.stage === stage) return;
    const fromIdx = stageIndex[lead.stage];
    const toIdx = stageIndex[stage];

    if (toIdx < fromIdx) {
      setPendingMove({ id: lead.id, from: lead.stage, to: stage });
      return;
    }
    // forward progress
    moveLead(lead.id, stage);
  }

  function moveLead(id: string, to: Stage) {
    const now = new Date().toISOString();
    updateLead(id, { stage: to, dateInStage: now });
  }

  const [editLead, setEditLead] = useState<Lead | undefined>(undefined);
  const [leadToArchive, setLeadToArchive] = useState<Lead | undefined>(undefined);

  // Column settings
  const [visibleStages, setVisibleStages] = useState<Record<Stage, boolean>>({
    INQUIRY: true,
    PROPOSAL: true,
    BOOKED: true,
    COMPLETED: true,
  });
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <section className="relative">
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {stages.map((stage) => {
            if (!visibleStages[stage]) return null;
            const list = byStage.get(stage) ?? [];
            const totalValue = list.reduce((s, l) => s + l.budget, 0);
            return (
              <span key={stage} className="text-xs sm:text-sm text-gray-700">
                <span className="hidden sm:inline">{stageDisplayNames[stage]}: </span>
                <span className="sm:hidden">{stageDisplayNames[stage].slice(0, 3)}: </span>
                <strong className="font-semibold text-gray-900">{list.length}</strong>
                <span className="hidden sm:inline"> • {formatCurrency(totalValue)}</span>
              </span>
            );
          })}
        </div>
        <button
          type="button"
          aria-label="Column settings"
          className="inline-flex h-8 sm:h-9 w-8 sm:w-auto  items-center gap-1 sm:gap-2 rounded-md border border-gray-300 bg-white px-2 sm:px-3 text-xs sm:text-sm text-gray-700 hover:bg-gray-50 focus:outline-none"
          onClick={() => setSettingsOpen(true)}
        >
          <SettingsIcon className="h-4 w-4 text-gray-700" />
          <span className="hidden sm:inline ml-2">Settings</span>
        </button>
      </div>

      {/* Board - horizontal scroll on mobile */}
      <div
        ref={scrollRef}
        className="flex snap-x snap-mandatory overflow-x-auto gap-3 sm:gap-4 w-[80%]  sm:w-full"
        onDragOver={(e) => {
          e.preventDefault();
          handleAutoScroll(e.clientX);
        }}
      >
        {stages.map((stage) => {
          if (!visibleStages[stage]) return null;
          const list = byStage.get(stage) ?? [];
          const totalValue = list.reduce((s, l) => s + l.budget, 0);
          return (
            <div
              key={stage}
              role="list"
              aria-label={`${stageDisplayNames[stage]} column`}
              className={`min-w-[85%] sm:min-w-[260px] md:min-w-[320px] snap-start rounded-lg border bg-gray-50 p-2 sm:p-3 transition-colors ${
                dragOverStage === stage ? 'border-blue-400 bg-blue-50' : 'border-gray-200'
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverStage(stage);
              }}
              onDragLeave={() => setDragOverStage((s) => (s === stage ? null : s))}
              onDrop={(e) => {
                e.preventDefault();
                setDragOverStage(null);
                onDropToStage(stage);
              }}
            >
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <h3 className="text-xs sm:text-sm font-semibold text-gray-900">
                    {stageDisplayNames[stage]}
                  </h3>
                  <p className="text-[10px] sm:text-xs text-gray-600">
                    {list.length} • {formatCurrency(totalValue)}
                  </p>
                </div>
              </div>

              {/* Card list */}
              <div className="flex max-h-[45vh] sm:max-h-[60vh] md:max-h-[70vh] flex-col gap-2 sm:gap-3 overflow-y-auto pr-0.5 sm:pr-1">
                {list.map((lead) => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    dragging={dragId === lead.id}
                    onEdit={() => setEditLead(lead)}
                    onArchive={() => setLeadToArchive(lead)}
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', lead.id);
                      setDragId(lead.id);
                      e.dataTransfer.effectAllowed = 'move';
                    }}
                    onDragEnd={() => setDragId(null)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Regression confirmation */}
      <ConfirmModal
        open={!!pendingMove}
        title="Move lead to earlier stage?"
        description={
          pendingMove
            ? `You're moving this lead from ${stageDisplayNames[pendingMove.from]} to ${stageDisplayNames[pendingMove.to]}. Do you want to proceed?`
            : ''
        }
        confirmText="Move"
        cancelText="Cancel"
        onConfirm={() => {
          if (!pendingMove) return;
          moveLead(pendingMove.id, pendingMove.to);
          setPendingMove(null);
        }}
        onCancel={() => setPendingMove(null)}
      />

      {/* Edit modal */}
      <EditLeadModal
        open={!!editLead}
        lead={editLead}
        onClose={() => setEditLead(undefined)}
        onSave={(patch) => {
          if (!editLead) return;
          updateLead(editLead.id, patch);
        }}
      />

      {/* Archive confirmation */}
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

      {/* Column settings */}
      <ColumnSettings
        open={settingsOpen}
        stages={stages}
        visible={visibleStages}
        onChange={(s) => setVisibleStages(s)}
        onClose={() => setSettingsOpen(false)}
      />
    </section>
  );
}

function ColumnSettings({
  open,
  stages,
  visible,
  onChange,
  onClose,
}: {
  open: boolean;
  stages: Stage[];
  visible: Record<Stage, boolean>;
  onChange: (v: Record<Stage, boolean>) => void;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-4 shadow-lg">
        <h2 className="text-base font-semibold text-gray-900">Column settings</h2>
        <p className="mt-1 text-sm text-gray-600">Show or hide pipeline columns.</p>
        <div className="mt-3 flex flex-col gap-2">
          {stages.map((s) => (
            <label key={s} className="flex items-center gap-2 text-sm text-gray-800">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={visible[s]}
                onChange={(e) => onChange({ ...visible, [s]: e.target.checked })}
              />
              {stageDisplayNames[s]}
            </label>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-9 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function SettingsIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      role="img"
      focusable="false"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.54-.89 3.31.88 2.42 2.42a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.89 1.54-.88 3.31-2.42 2.42a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.54.89-3.31-.88-2.42-2.42a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35.62-.15 1.13-.56 1.38-1.15.25-.59.21-1.27-.11-1.83-.89-1.54.88-3.31 2.42-2.42.56.32 1.24.36 1.83.11.59-.25 1-.76 1.15-1.38z"
      />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n);
}
