'use client';
import { Save } from 'lucide-react';
import React from 'react';

interface SectionCardProps {
  onSave?: () => void;
  children?: React.ReactNode;
}

const SectionCard: React.FC<SectionCardProps> = ({ onSave, children }) => {
  return (
    <div className="bg-white rounded-lg relative pb-4">
      <div className="flex items-center justify-end shadow-md p-4 bg-gray-100 rounded-t-lg">
        <button
          className="p-2 rounded-full bg-blue-600 hover:bg-blue-700 transition text-white"
          onClick={onSave}
          title="Save Changes"
        >
          <Save size={20} />
        </button>
      </div>
      <div>{children}</div>
    </div>
  );
};

export default SectionCard;
