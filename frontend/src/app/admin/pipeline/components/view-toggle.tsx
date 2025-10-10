'use client';

type Props = {
  value: 'kanban' | 'list' | 'calendar';
  onChange: (v: 'kanban' | 'list' | 'calendar') => void;
};
export default function ViewToggle({ value, onChange }: Props) {
  const base =
    'px-2 sm:px-3 py-1.5 text-xs sm:text-sm rounded-md border transition-colors select-none focus:outline-none focus:ring-2 focus:ring-gold flex-1 sm:flex-initial';
  const active = 'bg-blue-600 text-white border-blue-600';
  const inactive = 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50';
  return (
    <div className="flex items-center gap-1 sm:gap-2 w-80 sm:w-auto">
      <button
        type="button"
        className={`${base} ${value === 'kanban' ? active : inactive} bg-gold border-0 :  `}
        onClick={() => onChange('kanban')}
        aria-pressed={value === 'kanban'}
      >
        Kanban
      </button>
      <button
        type="button"
        className={`${base} ${value === 'list' ? active : inactive} bg-gold border-0 `}
        onClick={() => onChange('list')}
        aria-pressed={value === 'list'}
      >
        List
      </button>
      <button
        type="button"
        className={`${base} ${value === 'calendar' ? active : inactive} bg-gold border-0`}
        onClick={() => onChange('calendar')}
        aria-pressed={value === 'calendar'}
      >
        Calendar
      </button>
    </div>
  );
}
