'use client';

import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Calendar,
  Users,
  Phone,
  Mail,
  MapPin,
  MoreVertical,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ListViewProps {
  data: any[];
  onStatusChange: (cardId: string, newColumnId: string) => Promise<void>;
  movingCardId: string | null;
}

export const ListView = ({ data, onStatusChange, movingCardId }: ListViewProps) => {
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const toggleCardExpansion = (cardId: string) => {
    setExpandedCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  };

  const extractCoupleNames = (title: string) => {
    const parts = title.split(' - ');
    return parts[0] || title;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const allCards = data.flatMap((column) =>
    column.cards.map((card: any) => ({
      ...card,
      columnId: column.id,
      columnName: column.name,
      columnColor: getColumnColor(column.name),
    }))
  );

  function getColumnColor(columnName: string) {
    const colors: Record<string, string> = {
      'New Inquiries': 'bg-blue-100 text-blue-800 border-blue-200',
      'Initial Contact': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Proposal Sent': 'bg-purple-100 text-purple-800 border-purple-200',
      Negotiation: 'bg-orange-100 text-orange-800 border-orange-200',
      Confirmed: 'bg-green-100 text-green-800 border-green-200',
      Completed: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return colors[columnName] || 'bg-gray-100 text-gray-800 border-gray-200';
  }

  return (
    <div className="w-full">
      {/* Table Header */}
      <div className="hidden md:grid md:grid-cols-12 gap-4 px-4 py-3 bg-gray-50 border-b font-semibold text-sm text-gray-700">
        <div className="col-span-3">Couple Name</div>
        <div className="col-span-2">Status</div>
        <div className="col-span-2">Wedding Date</div>
        <div className="col-span-2">Location</div>
        <div className="col-span-2">Guest Count</div>
        <div className="col-span-1 text-center">Actions</div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-gray-200">
        {allCards.map((card) => {
          const isExpanded = expandedCards.has(card.id);
          const isMoving = movingCardId === card.id;

          return (
            <div
              key={card.id}
              className={`${isMoving ? 'opacity-50 bg-orange-50' : 'hover:dark-bg'} transition-all`}
            >
              {/* Desktop View */}
              <div className="hidden md:grid md:grid-cols-12 gap-4 px-4 py-4 items-center">
                <div className="col-span-3">
                  <div className="font-medium text-white">{extractCoupleNames(card.title)}</div>
                  <div className="text-sm text-white mt-1">{card.email}</div>
                </div>

                <div className="col-span-2">
                  <Select
                    value={card.columnId}
                    onValueChange={(value) => onStatusChange(card.id, value)}
                    disabled={isMoving}
                  >
                    <SelectTrigger className={`w-full ${card.columnColor} border`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {data.map((column) => (
                        <SelectItem key={column.id} value={column.id}>
                          {column.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-2 flex items-center gap-1 text-sm text-white">
                  <Calendar className="w-4 h-4" />
                  {formatDate(card.weddingDate)}
                </div>

                <div className="col-span-2 flex items-center gap-1 text-sm text-white">
                  <MapPin className="w-4 h-4" />
                  {card.location || 'Not specified'}
                </div>

                <div className="col-span-2 flex items-center gap-1 text-sm text-white">
                  <Users className="w-4 h-4" />
                  {card.guestCount || '0'} guests
                </div>

                <div className="col-span-1 flex justify-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="bg-gold">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem>Send Email</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Mobile View */}
              <div className="md:hidden px-4 py-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {extractCoupleNames(card.title)}
                    </div>
                    <div className="mt-2">
                      <Select
                        value={card.columnId}
                        onValueChange={(value) => onStatusChange(card.id, value)}
                        disabled={isMoving}
                      >
                        <SelectTrigger
                          className={`w-full max-w-[200px] ${card.columnColor} border text-xs`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {data.map((column) => (
                            <SelectItem key={column.id} value={column.id}>
                              {column.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button variant="ghost" size="sm" onClick={() => toggleCardExpansion(card.id)}>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </Button>
                </div>

                {isExpanded && (
                  <div className="mt-3 space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(card.weddingDate)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{card.location || 'Not specified'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{card.guestCount || '0'} guests</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span>{card.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      <span>{card.phoneNumber || 'Not provided'}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Loading indicator for moving cards */}
              {isMoving && (
                <div className="px-4 py-1 bg-orange-100 border-t border-orange-200">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                    <span className="text-xs text-orange-700">Updating status...</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {allCards.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <div className="text-lg">No weddings found</div>
          <div className="text-sm mt-2">Add your first wedding to get started</div>
        </div>
      )}
    </div>
  );
};
