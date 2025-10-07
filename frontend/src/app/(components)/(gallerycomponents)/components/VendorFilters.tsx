'use client';
import React from 'react';
import { Search, MapPin, Tag, X } from 'lucide-react';

interface VendorFiltersProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  locationFilter: string;
  setLocationFilter: (value: string) => void;
  categoryFilter: string;
  setCategoryFilter: (value: string) => void;
  locations: string[];
  categories: string[];
  onReset: () => void;
}

export default function VendorFilters({
  searchQuery,
  setSearchQuery,
  locationFilter,
  setLocationFilter,
  categoryFilter,
  setCategoryFilter,
  locations,
  categories,
  onReset,
}: VendorFiltersProps) {
  return (
    <div className="mb-8 p-6 bg-white/5 border border-[#AD8B3A]/30 rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search vendors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-black/50 border border-[#AD8B3A]/30 rounded-md text-white placeholder-gray-500 focus:outline-none focus:border-[#AD8B3A]"
          />
        </div>

        {/* Location Filter */}
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-black/50 border border-[#AD8B3A]/30 rounded-md text-white focus:outline-none focus:border-[#AD8B3A] appearance-none cursor-pointer"
          >
            {locations.map((loc) => (
              <option key={loc} value={loc} className="bg-black">
                {loc === 'all' ? 'All Locations' : loc}
              </option>
            ))}
          </select>
        </div>

        {/* Category Filter */}
        <div className="relative">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-black/50 border border-[#AD8B3A]/30 rounded-md text-white focus:outline-none focus:border-[#AD8B3A] appearance-none cursor-pointer"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat} className="bg-black">
                {cat === 'all' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Reset Filters Button */}
      <div className="flex justify-end mt-4">
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-4 py-2 text-sm rounded-md bg-white/10 text-white hover:bg-white/20 transition-colors"
        >
          <X size={16} /> Reset Filters
        </button>
      </div>
    </div>
  );
}
