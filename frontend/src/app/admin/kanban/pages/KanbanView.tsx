'use client';

import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCorners,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableCard } from './SortableCard';
import { DroppableColumn } from './DroppableColumn';

interface KanbanViewProps {
  data: any[];
  onDragEnd: (cardId: string, newColumnId: string) => Promise<void>;
  movingCardId: string | null;
}

export const KanbanView = ({ data, onDragEnd, movingCardId }: KanbanViewProps) => {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(KeyboardSensor, {})
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      return;
    }

    const activeCard = findCardById(active.id as string, data);
    const overColumn =
      findColumnByCardId(over.id as string, data) || findColumnById(over.id as string, data);

    if (activeCard && overColumn) {
      const activeColumn = findColumnByCardId(active.id as string, data);

      // Only update if the card moved to a different column
      if (activeColumn?.id !== overColumn.id) {
        await onDragEnd(activeCard.id, overColumn.id);
      }
    }

    setActiveId(null);
  };

  const findCardById = (id: string, data: any[]) => {
    for (const column of data) {
      const card = column.cards.find((c: any) => c.id === id);
      if (card) return card;
    }
    return null;
  };

  const findColumnById = (id: string, data: any[]) => {
    return data.find((col: any) => col.id === id);
  };

  const findColumnByCardId = (cardId: string, data: any[]) => {
    for (const column of data) {
      if (column.cards.some((c: any) => c.id === cardId)) {
        return column;
      }
    }
    return null;
  };

  const extractCoupleNames = (title: string) => {
    const parts = title.split(' - ');
    return parts[0] || title;
  };

  const activeCard = activeId ? findCardById(activeId, data) : null;
  const activeColumn = activeId ? findColumnByCardId(activeId, data) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex-1 overflow-y-auto sm:overflow-y-hidden overflow-x-hidden sm:overflow-x-auto">
        <div className="flex flex-col sm:flex-row gap-3 px-4 py-4 sm:h-full">
          {data.map((column) => (
            <SortableContext
              key={column.id}
              items={[...column.cards.map((c: any) => c.id), column.id]}
              strategy={verticalListSortingStrategy}
            >
              <DroppableColumn column={column}>
                {column.cards.map((card: any) => (
                  <SortableCard
                    key={card.id}
                    card={card}
                    column={column}
                    isMoving={movingCardId === card.id}
                  />
                ))}
                {column.cards.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <div className="text-sm">No cards in this column</div>
                    <div className="text-xs mt-2">Drag cards here to add them</div>
                  </div>
                )}
              </DroppableColumn>
            </SortableContext>
          ))}
        </div>
      </div>
      <DragOverlay>
        {activeCard && activeColumn && (
          <div className="bg-white border-8 border-dotted border-gray-500 p-4 rounded-lg shadow-xl opacity-90 transform rotate-3 max-w-[380px]">
            <h3 className="font-bold text-lg mb-1 text-gray-800">
              {extractCoupleNames(activeCard.title)}
            </h3>
            <p className="text-sm text-gray-500">{activeCard.description}</p>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
};
