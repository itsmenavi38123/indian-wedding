'use client';

import { useSortable } from '@dnd-kit/sortable';
import { useState, useEffect, useRef, ReactNode } from 'react';
import { Settings, MoreVertical, Plus, SortAsc, TrendingUp, Trash2 } from 'lucide-react';
import { LeadStatus } from '@/types/lead/Lead';

interface DroppableColumnProps {
  column: any;
  children: ReactNode;
  // onStatusChange?: (leadId: string, newStatus: LeadStatus) => Promise<void>;
}

export const DroppableColumn = ({ column, children }: DroppableColumnProps) => {
  const [showSettings, setShowSettings] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { setNodeRef, isOver } = useSortable({
    id: column.id,
    data: { type: 'column', column },
  });

  const calculateTotalValue = () => column.cards.length * 1500000; // placeholder

  const formatCurrency = (value: number) => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(0)}L`;
    return `₹${value.toLocaleString('en-IN')}`;
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSettings(false);
      }
    };
    if (showSettings) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showSettings]);

  return (
    <div
      ref={setNodeRef}
      className={`dark-bg rounded-lg shadow-md w-full sm:w-[24%] min-h-[20rem] sm:min-h-[28rem] sm:max-h-[calc(100vh-12rem)] flex flex-col transition-shadow duration-200
      ${isOver ? 'ring-2 ring-blue-400' : 'hover:shadow-lg'}
    `}
    >
      {/* Column Header */}
      <div className="p-3 border-b border-[#e5e5e521] dark-bg rounded-t-lg relative">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="font-semibold text-sm sm:text-base text-white truncate">
              {column.name}
            </h2>
            <div className="flex items-center gap-3 mt-1 text-xs text-white">
              <span>
                <span className="font-medium">{column.cards.length}</span> cards
              </span>
              <span>
                Revenue:{' '}
                <span className="font-medium text-gold">
                  {formatCurrency(calculateTotalValue())}
                </span>
              </span>
            </div>
          </div>

          {/* Settings Button */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-1 hover:bg-gold rounded transition-colors"
              title="Column settings"
            >
              <MoreVertical size={16} className="text-white" />
            </button>

            {showSettings && (
              <div className="absolute right-0 top-8 w-48 rounded-lg shadow-lg border z-30 dark-bg">
                <button className="w-full text-left px-3 py-2 hover:bg-gold text-sm text-white flex items-center gap-2 rounded-t-lg">
                  <Settings size={14} />
                  Column Settings
                </button>
                <button className="w-full text-left px-3 py-2 hover:bg-gold text-sm text-white flex items-center gap-2">
                  <Plus size={14} />
                  Add Card
                </button>
                <button className="w-full text-left px-3 py-2 hover:bg-gold text-sm text-white flex items-center gap-2">
                  <SortAsc size={14} />
                  Sort by Date
                </button>
                <button className="w-full text-left px-3 py-2 hover:bg-gold text-sm text-white flex items-center gap-2">
                  <TrendingUp size={14} />
                  Sort by Value
                </button>
                <hr className="my-1" />
                <button className="w-full text-left px-3 py-2 hover:bg-gold text-sm text-red-600 flex items-center gap-2 rounded-b-lg">
                  <Trash2 size={14} />
                  Clear Column
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 p-2 sm:p-3 space-y-2 overflow-y-auto overflow-x-hidden">
        {children}
      </div>
    </div>
  );
};
