'use client';

import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2 } from 'lucide-react';

export type WeddingEvent = {
  id: string;
  name: string;
  date: string;
  startTime: string;
  endTime: string;
  budget?: number;
};

type Props = {
  events: WeddingEvent[];
  onChange: (events: WeddingEvent[]) => void;
};

function SortableEventItem({
  event,
  onEdit,
  onRemove,
}: {
  event: WeddingEvent;
  onEdit: (id: string, patch: Partial<WeddingEvent>) => void;
  onRemove: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: event.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="rounded border border-gray-200 bg-white p-3 shadow-sm"
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          className="mt-2 cursor-grab touch-none text-gray-400 hover:text-gray-600 focus:outline-none"
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-5 w-5" />
        </button>

        <div className="min-w-0 flex-1 grid grid-cols-1 sm:grid-cols-5 gap-2">
          <input
            type="text"
            value={event.name}
            onChange={(e) => onEdit(event.id, { name: e.target.value })}
            className="col-span-2 rounded border border-gray-300 px-3 py-2 text-sm font-medium focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            placeholder="Event name (e.g. Haldi)"
          />

          <input
            type="date"
            value={event.date || ''}
            onChange={(e) => onEdit(event.id, { date: e.target.value })}
            className="col-span-1 rounded border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
          />

          <input
            type="time"
            value={event.startTime || ''}
            onChange={(e) => onEdit(event.id, { startTime: e.target.value })}
            className="col-span-1 rounded border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
          />

          <input
            type="time"
            value={event.endTime || ''}
            onChange={(e) => onEdit(event.id, { endTime: e.target.value })}
            className="col-span-1 rounded border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
          />
        </div>

        <button
          type="button"
          onClick={() => onRemove(event.id)}
          className="mt-2 rounded p-1.5 text-red-500 hover:bg-red-50 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          aria-label="Remove event"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </li>
  );
}

export function EventsSection({ events, onChange }: Props) {
  const [newEvent, setNewEvent] = useState<Partial<WeddingEvent>>({
    name: '',
    date: '',
    startTime: '',
    endTime: '',
    budget: undefined,
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function addEvent() {
    if (!newEvent.name?.trim() || !newEvent.date) return;
    const next = [
      ...events,
      {
        id: crypto.randomUUID(),
        name: newEvent.name.trim(),
        date: newEvent.date,
        startTime: newEvent.startTime || '',
        endTime: newEvent.endTime || '',
        budget: newEvent.budget ?? 0,
      },
    ];
    onChange(next);
    setNewEvent({ name: '', date: '', startTime: '', endTime: '', budget: undefined });
  }

  function removeEvent(id: string) {
    onChange(events.filter((e) => e.id !== id));
  }

  function editEvent(id: string, patch: Partial<WeddingEvent>) {
    onChange(events.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = events.findIndex((e) => e.id === active.id);
      const newIndex = events.findIndex((e) => e.id === over.id);
      onChange(arrayMove(events, oldIndex, newIndex));
    }
  }

  return (
    <section aria-labelledby="events-heading" className="w-full">
      <div className="flex items-center justify-between">
        <h2 id="events-heading" className="text-lg font-semibold text-white">
          Events
        </h2>
      </div>

      <div className="mt-3 space-y-3">
        {/* Add Event Form */}
        <div className="rounded border border-gray-200 bg-gray-50 p-3">
          <p className="text-sm font-medium mb-2">Add Event</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-6">
            <input
              placeholder="Event name"
              value={newEvent.name ?? ''}
              onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
              className="sm:col-span-2 rounded border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            />
            <input
              type="date"
              value={newEvent.date ?? ''}
              onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
              className="sm:col-span-1 rounded border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            />
            <input
              type="time"
              value={newEvent.startTime ?? ''}
              onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
              className="sm:col-span-1 rounded border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            />
            <input
              type="time"
              value={newEvent.endTime ?? ''}
              onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
              className="sm:col-span-1 rounded border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            />
          </div>
          <div className="mt-2">
            <button
              type="button"
              onClick={addEvent}
              disabled={!newEvent.name?.trim() || !newEvent.date}
              className="rounded bg-teal-600 px-3 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Event
            </button>
          </div>
        </div>

        {/* Event List */}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={events.map((e) => e.id)} strategy={verticalListSortingStrategy}>
            <ul className="grid grid-cols-1 gap-3">
              {events.map((event) => (
                <SortableEventItem
                  key={event.id || `${event.name || 'event'}`}
                  event={event}
                  onEdit={editEvent}
                  onRemove={removeEvent}
                />
              ))}
              {events.length === 0 && (
                <li className="rounded border border-dashed border-gray-300 p-6 text-center text-sm text-gray-600">
                  No events yet. Add your first event above.
                </li>
              )}
            </ul>
          </SortableContext>
        </DndContext>
      </div>
    </section>
  );
}
