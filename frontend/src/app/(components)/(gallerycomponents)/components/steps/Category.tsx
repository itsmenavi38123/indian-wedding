import React from 'react';
import { Check } from 'lucide-react';
import { SERVICE_TYPE_VALUES, serviceTypeToImageMap } from '@/types/lead/Lead';
import Image from 'next/image';

interface CategoryProps {
  selectedCategories: string[];
  onChange: (categories: string[]) => void;
}

export default function Category({ selectedCategories, onChange }: CategoryProps) {
  const toggleCategory = (service: string) => {
    if (selectedCategories.includes(service)) {
      onChange(selectedCategories.filter((s) => s !== service));
    } else {
      onChange([...selectedCategories, service]);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 p-5">
      {SERVICE_TYPE_VALUES.map((service) => {
        const isSelected = selectedCategories.includes(service);
        return (
          <button
            key={service}
            onClick={() => toggleCategory(service)}
            className={`relative border border-gray-300 rounded-lg overflow-hidden text-center shadow-sm cursor-pointer transform transition-transform duration-200 ease-in-out hover:scale-105
              ${isSelected ? 'ring-4 ring-rose-500' : ''}`}
          >
            <Image
              src={serviceTypeToImageMap[service]}
              alt={service}
              loading="lazy"
              className="w-full h-32 object-cover"
              width={400}
              height={192}
            />
            <div className="p-3 font-semibold text-gray-800 text-base">{service}</div>
            {isSelected && (
              <div className="absolute top-2 right-2 bg-rose-500 rounded-full p-2">
                <Check size={16} className="text-white" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
