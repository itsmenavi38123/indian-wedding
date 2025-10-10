'use client';

import { useState, useMemo } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Lead } from './types';
import LeadCard from './lead-card';
import ConfirmModal from './confirm-modal';

interface CalendarViewProps {
  leads: Lead[];
  // updateLead: (id: string, patch: Partial<Lead>) => void;
  archiveLead: (id: string) => void;
}

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

export default function PipelineCalendarView({
  leads,
  // updateLead,
  archiveLead,
}: CalendarViewProps) {
  // Default = today's date
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [leadToArchive, setLeadToArchive] = useState<Lead | undefined>(undefined);

  // Convert leads to calendar events
  const events = useMemo(() => {
    return leads
      .filter((lead) => lead.weddingDate && !lead.archived)
      .map((lead) => {
        const weddingDate = new Date(lead.weddingDate);
        return {
          id: lead.id,
          title: lead.couple,
          start: weddingDate,
          end: weddingDate,
          lead: lead,
        };
      });
  }, [leads]);

  // Filter events for selectedDate
  const selectedEvents = useMemo(() => {
    return leads.filter((lead) => {
      if (!lead.weddingDate || lead.archived) return false;
      const leadDate = format(new Date(lead.weddingDate), 'yyyy-MM-dd');
      return leadDate === selectedDate;
    });
  }, [leads, selectedDate]);

  return (
    <div className="flex flex-col h-full overflow-y-auto px-4 py-4 space-y-4 black-bg rounded-lg border border-[#e5e5e521]">
      {/* Date Picker */}
      <div className="p-4 border border-[#e5e5e521] order dark-bg flex items-center gap-4 rounded-lg">
        <input
          type="date"
          className="border border-[#e5e5e521] text-white rounded bg-gold px-3 py-2 text-sm"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
        <span className="text-sm text-white">
          {selectedEvents.length} wedding{selectedEvents.length !== 1 ? 's' : ''} on this date
        </span>
      </div>

      {/* Big Calendar - Month View Only */}
      <div className="p-4 dark-bg rounded-lg black-bg border border-[#e5e5e521]">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '60vh' }}
          view="month"
          views={['month']}
          date={new Date(selectedDate)}
          onNavigate={(date) => setSelectedDate(format(date, 'yyyy-MM-dd'))}
          selectable
          onSelectSlot={(slotInfo) => setSelectedDate(format(slotInfo.start, 'yyyy-MM-dd'))}
          onSelectEvent={(event) => setSelectedDate(format(event.start as Date, 'yyyy-MM-dd'))}
          eventPropGetter={(event) => {
            const lead = event.lead as Lead;
            let backgroundColor = '#3174ad';

            switch (lead.stage) {
              case 'INQUIRY':
                backgroundColor = '#6b7280';
                break;
              case 'PROPOSAL':
                backgroundColor = '#f59e0b';
                break;
              case 'BOOKED':
                backgroundColor = '#10b981';
                break;
              case 'COMPLETED':
                backgroundColor = '#3b82f6';
                break;
            }

            return {
              style: {
                backgroundColor,
                borderRadius: '3px',
                opacity: 0.8,
                color: 'white',
                border: '0px',
                display: 'block',
                fontSize: '12px',
              },
            };
          }}
        />
      </div>

      {/* Wedding cards below */}
      <div className="p-4 bg-gold rounded-lg">
        <h2 className="font-bold text-white text-lg mb-3">
          {format(new Date(selectedDate), 'MMMM do, yyyy')}
        </h2>

        {selectedEvents.length > 0 ? (
          <div className="grid gap-3">
            {selectedEvents.map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                dragging={false}
                onEdit={() => {
                  // Edit functionality can be added here
                }}
                onArchive={() => setLeadToArchive(lead)}
                onDragStart={() => {}}
                onDragEnd={() => {}}
              />
            ))}
          </div>
        ) : (
          <p className="text-white italic">No weddings scheduled for this date.</p>
        )}
      </div>

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
    </div>
  );
}
