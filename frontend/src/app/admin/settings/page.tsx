'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface CardData {
  id: number;
  title: string;
  description: string;
}

const cardsData: CardData[] = [
  {
    id: 1,
    title: 'Hero Section Settings',
    description:
      'Customize the main banner of your landing page, including background image, headline, and call-to-action buttons.',
  },
];

export default function Settings() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCards = cardsData.filter((card) =>
    card.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const handleCardClick = (id: number) => {
    if (id === 1) {
      router.push('/admin/settings/banner-edit');
    }
  };

  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold text-white">Settings</h1>
      </div>

      <div className="relative w-full max-w-sm">
        <input
          type="text"
          placeholder="Search..."
          className="w-full border border-gray-300 rounded-md px-10 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Search
          size={20}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
      </div>

      {/* Layout settings div*/}
      <div className="flex flex-col gap-4 shadow-lg p-4 rounded-md">
        <h2 className="text-xl font-semibold mb-2 text-white">Layout Settings</h2>
        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredCards.length > 0 ? (
            filteredCards.map(({ id, title, description }) => (
              <div
                key={id}
                onClick={() => handleCardClick(id)}
                className="border rounded-md p-4 shadow hover:shadow-lg transition cursor-pointer"
              >
                <h2 className="text-lg font-semibold mb-2 text-white">{title}</h2>
                <p className="text-md text-muted-foreground">{description}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500 col-span-full text-center">No cards found</p>
          )}
        </div>
      </div>
    </div>
  );
}
