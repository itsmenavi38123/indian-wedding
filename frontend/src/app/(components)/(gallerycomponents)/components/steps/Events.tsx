'use client';

import { useState } from 'react';
import { format, isSameDay, parseISO } from 'date-fns';
import { PlusCircle, Trash2 } from 'lucide-react';

interface EventsProps {
  selectedCategories: string[];
  photographerPreference: 'local' | 'travel' | 'either';
  onPreferenceSelect: (pref: 'local' | 'travel' | 'either') => void;
}

export default function Events({
  selectedCategories,
  photographerPreference,
  onPreferenceSelect,
}: EventsProps) {
  const [dateRange, setDateRange] = useState<{ startDate: string; endDate: string }>({
    startDate: '',
    endDate: '',
  });

  const [events, setEvents] = useState<
    { id: number; name: string; date: string; startTime: string; endTime: string }[]
  >([]);

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
    // Filter events within range
    setEvents((prev) => prev.filter((ev) => new Date(ev.date) >= new Date(startDate)));
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const endDate = e.target.value;
    setDateRange((prev) => ({ ...prev, endDate }));
    // Filter events within range
    setEvents((prev) => prev.filter((ev) => new Date(ev.date) <= new Date(endDate)));
  };

  const addEvent = () => {
    if (!dateRange.startDate || !dateRange.endDate)
      return alert('Please select your wedding timeline first.');
    setEvents((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: '',
        date: dateRange.startDate,
        startTime: '10:00',
        endTime: '12:00',
      },
    ]);
  };

  const updateEvent = (id: number, field: string, value: string) => {
    setEvents((prev) => prev.map((ev) => (ev.id === id ? { ...ev, [field]: value } : ev)));
  };

  const removeEvent = (id: number) => {
    setEvents((prev) => prev.filter((ev) => ev.id !== id));
  };

  const showPreferenceSelector =
    (selectedCategories || []).includes('Photography') ||
    (selectedCategories || []).includes('Videography');

  return (
    <div className="space-y-10 animate-fade-in w-full max-w-4xl mx-auto">
      {/* Wedding Timeline */}
      <div className="text-center text-gray-800 text-lg font-semibold tracking-tight">
        {dateRange.startDate && dateRange.endDate ? (
          <>
            Wedding Timeline:{' '}
            <span className="text-rose-500">
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
          className="px-5 py-3 rounded-full border border-rose-200 text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-400 hover:shadow-md transition-all w-full sm:w-auto"
        />
        <span className="hidden sm:inline-block text-gray-400 font-semibold">→</span>
        <input
          type="date"
          value={dateRange.endDate}
          onChange={handleEndDateChange}
          min={dateRange.startDate}
          className="px-5 py-3 rounded-full border border-rose-200 text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-400 hover:shadow-md transition-all w-full sm:w-auto"
        />
      </div>

      {/* Photographer/Videographer Preference */}
      {showPreferenceSelector && (
        <div className="space-y-6 mt-10">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Choose your services</h2>
            <p className="text-gray-600">Based on your style preferences</p>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Photographer Preference</h3>
              <div className="grid grid-cols-3 gap-3">
                {['local', 'travel', 'either'].map((pref) => (
                  <button
                    key={pref}
                    onClick={() => onPreferenceSelect(pref as any)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      photographerPreference === pref
                        ? 'border-rose-500 bg-rose-50'
                        : 'border-gray-200 hover:border-rose-200'
                    }`}
                  >
                    <div className="font-medium capitalize">{pref}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {pref === 'local'
                        ? 'From destination'
                        : pref === 'travel'
                          ? 'Flies with you'
                          : 'No preference'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Wedding Events Section */}
      {dateRange.startDate && dateRange.endDate && (
        <div className="space-y-6 mt-10">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Wedding Events</h2>
            <button
              onClick={addEvent}
              className="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-all"
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
                  className="flex flex-col sm:flex-row flex-wrap items-center gap-4 border border-gray-200 p-4 rounded-xl shadow-sm hover:shadow-md transition-all"
                >
                  {/* Event name */}
                  <input
                    type="text"
                    placeholder="Event name (e.g. Haldi)"
                    value={ev.name}
                    onChange={(e) => updateEvent(ev.id, 'name', e.target.value)}
                    className="flex-1 min-w-[140px] px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-rose-300"
                  />
                  {/* Date */}
                  <input
                    type="date"
                    min={dateRange.startDate}
                    max={dateRange.endDate}
                    value={ev.date}
                    onChange={(e) => updateEvent(ev.id, 'date', e.target.value)}
                    className="px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-rose-300"
                  />
                  {/* Start time */}
                  <div className="flex flex-col items-start">
                    <label className="text-xs text-gray-500 ml-1">Start Time</label>
                    <input
                      type="time"
                      value={ev.startTime}
                      onChange={(e) => updateEvent(ev.id, 'startTime', e.target.value)}
                      className="px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-rose-300"
                    />
                  </div>
                  {/* End time */}
                  <div className="flex flex-col items-start">
                    <label className="text-xs text-gray-500 ml-1">End Time</label>
                    <input
                      type="time"
                      value={ev.endTime}
                      min={ev.startTime}
                      onChange={(e) => updateEvent(ev.id, 'endTime', e.target.value)}
                      className="px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-rose-300"
                    />
                  </div>

                  <button
                    onClick={() => removeEvent(ev.id)}
                    className="p-2 text-gray-400 hover:text-red-500 transition"
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
