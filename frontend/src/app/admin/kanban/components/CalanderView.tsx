'use client';

import { useState, useMemo } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import moment from 'moment';
import { SortableCard } from '../pages/SortableCard';

interface CalendarViewProps {
  data: any[];
  onArchiveLead: (leadId: string) => Promise<void>;
}

const locales = { 'en-US': enUS };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

export default function CalendarView({ data, onArchiveLead }: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<string>(moment().format('YYYY-MM-DD'));
  const events = useMemo(
    () =>
      data
        .flatMap((col) =>
          col.cards?.map((card: any) => {
            const rawDate = card.date || card.createdAt || card.updatedAt;
            if (!rawDate) return null;

            const normalizedDate = moment(rawDate).format('YYYY-MM-DD');

            return {
              id: card.id,
              title: card.title,
              start: moment(normalizedDate, 'YYYY-MM-DD').toDate(),
              end: moment(normalizedDate, 'YYYY-MM-DD').toDate(),
              card,
              col,
            };
          })
        )
        .filter(Boolean),
    [data]
  );
  const selectedEvents = useMemo(
    () => events.filter((ev) => moment(ev.start).isSame(moment(selectedDate, 'YYYY-MM-DD'), 'day')),
    [events, selectedDate]
  );
  return (
    <div className="flex flex-col h-full overflow-y-auto px-4 py-4 space-y-4 bg-white border rounded-md shadow-sm">
      {/* Date Picker */}
      <div className="p-4 border-b bg-white flex items-center gap-4">
        <input
          type="date"
          className="border rounded px-3 py-2 text-sm"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />

        {/* Display selected date as a “popover” label */}
        {selectedDate && (
          <div className="ml-auto bg-gray-100 px-3 py-1 rounded text-sm text-gray-700">
            {new Date(selectedDate).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </div>
        )}
      </div>

      {/* Big Calendar */}
      <div className="p-4 bg-gray-50">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '60vh' }}
          date={moment(selectedDate, 'YYYY-MM-DD').toDate()}
          onNavigate={(date) => setSelectedDate(moment(date).format('YYYY-MM-DD'))}
          selectable
          onSelectSlot={(slotInfo) => setSelectedDate(moment(slotInfo.start).format('YYYY-MM-DD'))}
          onSelectEvent={(event) => setSelectedDate(moment(event.start).format('YYYY-MM-DD'))}
          dayPropGetter={(date) => {
            const isSelected = moment(date).isSame(moment(selectedDate, 'YYYY-MM-DD'), 'day');
            return {
              className: isSelected ? 'bg-blue-200 text-blue-900 font-semibold rounded' : undefined,
              style: {
                borderRadius: '0.25rem',
              },
            };
          }}
        />
      </div>

      {/* Wedding cards below */}
      <div className="p-4 bg-white border-t">
        <h2 className="font-semibold text-md mb-2">
          {moment(selectedDate).format('MMMM Do, YYYY')}
        </h2>

        {selectedEvents.length > 0 ? (
          <div className="grid gap-2 grid-cols-1 sm:grid-cols-3 lg:grid-cols-5">
            {selectedEvents.map((ev) => (
              <SortableCard
                key={ev.card.id}
                card={ev.card}
                column={ev.col}
                isMoving={false}
                onArchiveLead={onArchiveLead}
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic text-sm">No weddings scheduled for this date.</p>
        )}
      </div>
    </div>
  );
}
