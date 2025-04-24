import React, { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";

interface SortableItemProps {
  id: number;
  children: React.ReactNode;
}

export function SortableItem({ id, children }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1,
    position: 'relative' as const
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className={cn(
        "relative cursor-grab active:cursor-grabbing",
        isDragging && "z-10"
      )}
      {...attributes} 
      {...listeners}
    >
      {children}
    </div>
  );
}

interface SortableListProps<T extends { id: number }> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  onReorder?: (items: T[]) => void;
  className?: string;
}

export function SortableList<T extends { id: number }>({
  items,
  renderItem,
  onReorder,
  className
}: SortableListProps<T>) {
  const [sortedItems, setSortedItems] = useState<T[]>(items);

  // Aktualizuj stan gdy zmienią się elementy z zewnątrz
  React.useEffect(() => {
    setSortedItems(items);
  }, [items]);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setSortedItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        
        const newItems = arrayMove(items, oldIndex, newIndex);
        
        // Wywołaj funkcję zwrotną, jeśli została przekazana
        if (onReorder) {
          onReorder(newItems);
        }
        
        return newItems;
      });
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={sortedItems.map(item => ({ id: item.id }))}
        strategy={verticalListSortingStrategy}
      >
        <div className={className}>
          {sortedItems.map((item) => (
            <SortableItem key={item.id} id={item.id}>
              {renderItem(item)}
            </SortableItem>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}