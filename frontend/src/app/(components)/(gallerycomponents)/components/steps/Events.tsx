'use client';

import { useEffect, useState } from 'react';
import { format, isSameDay, parseISO } from 'date-fns';
import { PlusCircle, Trash2 } from 'lucide-react';

interface WeddingEvent {
  id?: number;
  name: string;
  date: string;
  startTime: string;
  endTime: string;
}

interface EventsProps {
  selectedCategories: string[];
  photographerPreference: 'local' | 'travel' | 'either';
  onPreferenceSelect: (pref: 'local' | 'travel' | 'either') => void;
  events: WeddingEvent[];
  onEventsChange: (events: WeddingEvent[]) => void;
  onDateChange?: (range: { startDate: string; endDate: string }) => void;
  weddingDate?: { startDate: string; endDate: string };
  selectedTheme?: string | null;
  onThemeSelect?: (theme: string | null) => void;
}

const THEME_PRESETS: Record<string, string[]> = {
  'Traditional Indian': ['Haldi', 'Mehndi', 'Sangeet', 'Wedding', 'Reception'],
  'Classic Elegant': ['Engagement', 'Wedding Ceremony', 'Cocktail Party', 'Reception'],
  'Modern Minimal': ['Welcome Dinner', 'Intimate Wedding', 'After-Party'],
  'Start from Scratch': [],
};

export default function Events({
  selectedCategories,
  photographerPreference,
  onPreferenceSelect,
  events: initialEvents,
  onEventsChange,
  onDateChange,
  weddingDate,
  onThemeSelect,
  selectedTheme,
}: EventsProps) {
  const [dateRange, setDateRange] = useState<{ startDate: string; endDate: string }>(
    weddingDate || { startDate: '', endDate: '' }
  );

  useEffect(() => {
    if (weddingDate) setDateRange(weddingDate);
  }, [weddingDate]);

  const [events, setEvents] = useState(initialEvents || []);

  useEffect(() => {
    if (dateRange.startDate || dateRange.endDate) {
      onDateChange?.(dateRange);
    }
  }, [dateRange]);

  useEffect(() => {
    if (!selectedTheme || !dateRange.startDate) return;

    const defaults = THEME_PRESETS[selectedTheme] || [];

    if (selectedTheme === 'Start from Scratch') {
      setEvents([]);
      onEventsChange([]);
      return;
    }

    if (defaults.length === 0) return;

    const newEvents = defaults.map((name, i) => ({
      id: Date.now() + i,
      name,
      date: dateRange.startDate,
      startTime: '10:00',
      endTime: '12:00',
    }));

    setEvents(newEvents);
    onEventsChange(newEvents);
  }, [selectedTheme, dateRange.startDate]);

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'MMMM do, yyyy');
    } catch {
      return '';
    }
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const startDate = e.target.value;
    setDateRange((prev) => ({
      ...prev,
      startDate,
      endDate: prev.endDate && new Date(prev.endDate) < new Date(startDate) ? '' : prev.endDate,
    }));
    setEvents((prev) => prev.filter((ev) => new Date(ev.date) >= new Date(startDate)));
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const endDate = e.target.value;
    setDateRange((prev) => ({ ...prev, endDate }));
    setEvents((prev) => prev.filter((ev) => new Date(ev.date) <= new Date(endDate)));
  };

  const addEvent = () => {
    if (!dateRange.startDate || !dateRange.endDate)
      return alert('Please select your wedding timeline first.');

    const newEvent = {
      id: Date.now(),
      name: '',
      date: dateRange.startDate,
      startTime: '10:00',
      endTime: '12:00',
    };

    const updated = [...events, newEvent];
    setEvents(updated);
    onEventsChange(updated);
  };

  const updateEvent = (id: number | undefined, field: string, value: string) => {
    if (typeof id !== 'number') return;
    const updated = events.map((ev) => (ev.id === id ? { ...ev, [field]: value } : ev));
    setEvents(updated);
    onEventsChange(updated);
  };

  const removeEvent = (id: number | undefined) => {
    if (typeof id !== 'number') return;
    const updated = events.filter((ev) => ev.id !== id);
    setEvents(updated);
    onEventsChange(updated);
  };

  const showPreferenceSelector =
    (selectedCategories || []).includes('Photography') ||
    (selectedCategories || []).includes('Videography');

  return (
    <div className="space-y-12 animate-fade-in w-full max-w-5xl mx-auto px-4 sm:px-0">
      {/* Wedding Timeline */}
      <div className="text-center text-gray-800 text-xl font-semibold tracking-tight">
        {dateRange.startDate && dateRange.endDate ? (
          <>
            Wedding Timeline:{' '}
            <span className="text-rose-600 font-bold">
              {isSameDay(parseISO(dateRange.startDate), parseISO(dateRange.endDate))
                ? formatDate(dateRange.startDate)
                : `${formatDate(dateRange.startDate)} – ${formatDate(dateRange.endDate)}`}
            </span>
          </>
        ) : (
          <span className="text-gray-400 italic">Select your wedding timeline</span>
        )}
      </div>

      {/* Date Pickers */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
        <input
          type="date"
          value={dateRange.startDate}
          onChange={handleStartDateChange}
          className="px-5 py-3 rounded-lg border border-gray-300 text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-400 hover:shadow-md transition-all w-full sm:w-auto bg-white"
        />
        <span className="hidden sm:inline-block text-gray-500 font-semibold">→</span>
        <input
          type="date"
          value={dateRange.endDate}
          onChange={handleEndDateChange}
          min={dateRange.startDate}
          className="px-5 py-3 rounded-lg border border-gray-300 text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-400 hover:shadow-md transition-all w-full sm:w-auto bg-white"
        />
      </div>

      {/* Photographer Preference */}
      {showPreferenceSelector && (
        <div className="bg-white shadow-md rounded-2xl p-8 border border-gray-100 mt-10">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Choose Your Services</h2>
            <p className="text-gray-600">Based on your selected categories</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Photographer Preference</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {['local', 'travel', 'either'].map((pref) => (
                <button
                  key={pref}
                  onClick={() => onPreferenceSelect(pref as any)}
                  className={`p-5 rounded-xl border-2 text-center transition-all ${
                    photographerPreference === pref
                      ? 'border-rose-500 bg-rose-50 text-rose-700 shadow-sm'
                      : 'border-gray-200 hover:border-rose-300 hover:bg-rose-50 text-gray-700'
                  }`}
                >
                  <div className="font-medium capitalize text-lg">{pref}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    {pref === 'local'
                      ? 'From your destination'
                      : pref === 'travel'
                        ? 'Flies with you'
                        : 'No preference'}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Wedding Theme Selector */}
      <div className="bg-white shadow-md rounded-2xl p-8 border border-gray-100">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Wedding Theme</h2>
          <p className="text-gray-600">Choose a theme that best fits your style</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {['Traditional Indian', 'Classic Elegant', 'Modern Minimal', 'Start from Scratch'].map(
            (theme) => (
              <button
                key={theme}
                onClick={() => onThemeSelect?.(selectedTheme === theme ? null : theme)}
                className={`p-5 rounded-xl border-2 font-medium transition-all cursor-pointer ${
                  selectedTheme === theme
                    ? 'border-rose-500 bg-rose-50 text-rose-700 shadow-sm'
                    : 'border-gray-200 hover:border-rose-300 hover:bg-rose-50 text-gray-700'
                }`}
              >
                {theme}
              </button>
            )
          )}
        </div>
      </div>

      {/* Wedding Events */}
      {dateRange.startDate && dateRange.endDate && (
        <div className="bg-white shadow-md rounded-2xl p-8 border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Wedding Events</h2>
            <button
              onClick={addEvent}
              className="flex items-center gap-2 px-5 py-2 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-all shadow-sm cursor-pointer"
            >
              <PlusCircle className="w-5 h-5" />
              Add Event
            </button>
          </div>

          {events.length === 0 ? (
            <p className="text-gray-500 italic text-center py-6">
              {`No events added yet. Click "Add Event" to begin.`}
            </p>
          ) : (
            <div className="space-y-4">
              {events.map((ev) => (
                <div
                  key={ev.id}
                  className="flex flex-col sm:flex-row flex-wrap items-center gap-4 border border-gray-200 p-5 rounded-xl bg-gray-50 hover:bg-white shadow-sm hover:shadow-md transition-all"
                >
                  <input
                    type="text"
                    placeholder="Event name (e.g. Haldi)"
                    value={ev.name}
                    onChange={(e) => updateEvent(ev.id, 'name', e.target.value)}
                    className="flex-1 min-w-[140px] px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-rose-400 bg-white"
                  />
                  <input
                    type="date"
                    min={dateRange.startDate}
                    max={dateRange.endDate}
                    value={ev.date}
                    onChange={(e) => updateEvent(ev.id, 'date', e.target.value)}
                    className="px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-rose-400 bg-white cursor-pointer"
                  />
                  <div className="flex flex-col items-start">
                    <label className="text-xs text-gray-500 ml-1">Start Time</label>
                    <input
                      type="time"
                      value={ev.startTime}
                      onChange={(e) => updateEvent(ev.id, 'startTime', e.target.value)}
                      className="px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-rose-400 bg-white cursor-pointer"
                    />
                  </div>
                  <div className="flex flex-col items-start">
                    <label className="text-xs text-gray-500 ml-1">End Time</label>
                    <input
                      type="time"
                      value={ev.endTime}
                      min={ev.startTime}
                      onChange={(e) => updateEvent(ev.id, 'endTime', e.target.value)}
                      className="px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-rose-400 bg-white cursor-pointer"
                    />
                  </div>

                  <button
                    onClick={() => removeEvent(ev.id)}
                    className="p-2 text-gray-400 hover:text-red-500 transition cursor-pointer"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
