'use client';

import { formatINR, parseNumber } from '@/lib/format';
import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Package, Plus, Check, Loader2 } from 'lucide-react';
import { useGetWeddingPackages, WeddingPackage } from '@/services/api/proposal';

export type Service = {
  id: string;
  name: string;
  description: string;
  price: number;
  category?: string;
  vendorId?: string;
  vendor?: {
    id: string;
    name: string;
    email?: string;
    contactNo?: string;
    companyName?: string;
  } | null;
};

type Props = {
  services: Service[];
  onChange: (services: Service[]) => void;
};

function SortableServiceItem({
  service,
  onEdit,
  onRemove,
}: {
  service: Service;
  onEdit: (id: string, patch: Partial<Service>) => void;
  onRemove: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: service.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <li ref={setNodeRef} style={style} className="rounded border border-gray-200 bg-white p-3">
      <div className="flex items-start gap-3">
        <button
          type="button"
          className="mt-2 cursor-grab touch-none text-gray-400 hover:text-gray-600 focus:outline-none"
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-5 w-5" />
        </button>

        <div className="min-w-0 flex-1">
          <input
            value={service.name}
            onChange={(e) => onEdit(service.id, { name: e.target.value })}
            className="mb-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm font-medium focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            placeholder="Service name"
          />
          <textarea
            rows={2}
            value={service.description}
            onChange={(e) => onEdit(service.id, { description: e.target.value })}
            className="block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            placeholder="Service description"
          />
        </div>

        <div className="flex flex-col items-end gap-2">
          <input
            value={service.price.toString()}
            onChange={(e) => onEdit(service.id, { price: parseNumber(e.target.value) })}
            className="w-32 rounded border border-gray-300 px-3 py-2 text-sm text-right focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            inputMode="decimal"
            aria-label="Service price"
            placeholder="0"
          />
          <span className="text-xs text-gray-600">{formatINR(service.price)}</span>
        </div>

        <button
          type="button"
          onClick={() => onRemove(service.id)}
          className="mt-2 rounded p-1.5 text-red-500 hover:bg-red-50 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          aria-label="Remove service"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </li>
  );
}

export function ServicesSection({ services, onChange }: Props) {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [price, setPrice] = useState('');
  const [showPackageBuilder, setShowPackageBuilder] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<WeddingPackage | null>(null);
  const [customizingServices, setCustomizingServices] = useState<Service[]>([]);

  // Fetch wedding packages from API
  const { data: weddingPackages = [], isLoading: isLoadingPackages } = useGetWeddingPackages();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Package Builder Functions
  function selectPackage(pkg: WeddingPackage) {
    setSelectedPackage(pkg);
    const servicesWithIds = pkg.services.map((service) => ({
      id: crypto.randomUUID(),
      name: service.name,
      description: service.description || '',
      price: service.price,
    }));
    setCustomizingServices(servicesWithIds);
  }

  function addPackageToServices() {
    if (!selectedPackage || customizingServices.length === 0) return;

    // Add all customized services to the current services
    const newServices = [...services, ...customizingServices];
    onChange(newServices);

    // Reset package builder state
    setSelectedPackage(null);
    setCustomizingServices([]);
    setShowPackageBuilder(false);
  }

  function removePackageService(serviceId: string) {
    setCustomizingServices(customizingServices.filter((s) => s.id !== serviceId));
  }

  function editPackageService(serviceId: string, patch: Partial<Service>) {
    setCustomizingServices(
      customizingServices.map((s) => (s.id === serviceId ? { ...s, ...patch } : s))
    );
  }

  function cancelPackageCustomization() {
    setSelectedPackage(null);
    setCustomizingServices([]);
    setShowPackageBuilder(false);
  }

  function addService() {
    if (!name.trim()) return;
    const next = [
      ...services,
      {
        id: crypto.randomUUID(),
        name: name.trim(),
        description: desc.trim(),
        price: parseNumber(price),
      },
    ];
    onChange(next);
    setName('');
    setDesc('');
    setPrice('');
  }

  function remove(id: string) {
    onChange(services.filter((s) => s.id !== id));
  }

  function edit(id: string, patch: Partial<Service>) {
    onChange(services.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = services.findIndex((s) => s.id === active.id);
      const newIndex = services.findIndex((s) => s.id === over.id);

      onChange(arrayMove(services, oldIndex, newIndex));
    }
  }

  return (
    <section aria-labelledby="services-heading" className="w-full">
      <div className="flex items-center justify-between">
        <h2 id="services-heading" className="text-lg font-semibold text-white">
          Services
        </h2>
        <button
          type="button"
          onClick={() => setShowPackageBuilder(!showPackageBuilder)}
          className="flex items-center gap-2 rounded-lg border border-purple-200 bg-purple-50 px-4 py-2 text-sm font-medium text-purple-700 hover:bg-purple-100 transition-colors"
        >
          <Package className="h-4 w-4" />
          Package Builder
        </button>
      </div>

      <div className="mt-3 grid gap-3">
        {/* Package Builder Interface */}
        {showPackageBuilder && (
          <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
            {!selectedPackage ? (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Package className="h-5 w-5 text-purple-600" />
                  <h3 className="text-base font-semibold text-purple-900">
                    Choose a Wedding Package
                  </h3>
                </div>

                {isLoadingPackages ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                    <span className="ml-2 text-purple-600">Loading packages...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {weddingPackages.map((pkg) => (
                      <div
                        key={pkg.id}
                        className="rounded-lg border border-purple-300 bg-white p-4 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => selectPackage(pkg)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">{pkg.name}</h4>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              pkg.category === 'BASIC'
                                ? 'bg-green-100 text-green-800'
                                : pkg.category === 'STANDARD'
                                  ? 'bg-blue-100 text-blue-800'
                                  : pkg.category === 'PREMIUM'
                                    ? 'bg-purple-100 text-purple-800'
                                    : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {pkg.category.toLowerCase()}
                          </span>
                        </div>

                        <p className="text-sm text-gray-600 mb-3">{pkg.description}</p>

                        <div className="text-lg font-bold text-purple-600 mb-2">
                          {formatINR(pkg.totalPrice)}
                        </div>

                        <div className="text-xs text-gray-500">
                          {pkg.services.length} services included
                        </div>

                        <div className="mt-3">
                          <button className="w-full flex items-center justify-center gap-2 rounded bg-purple-600 px-3 py-2 text-sm font-medium text-white hover:bg-purple-700 transition-colors">
                            <Plus className="h-4 w-4" />
                            Select Package
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-purple-600" />
                    <h3 className="text-base font-semibold text-purple-900">
                      Customizing: {selectedPackage.name}
                    </h3>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={cancelPackageCustomization}
                      className="rounded border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={addPackageToServices}
                      className="flex items-center gap-1.5 rounded bg-purple-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-purple-700 transition-colors"
                    >
                      <Check className="h-4 w-4" />
                      Add Package ({customizingServices.length} services)
                    </button>
                  </div>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {customizingServices.map((service) => (
                    <div key={service.id} className="rounded border border-purple-200 bg-white p-3">
                      <div className="flex items-start gap-3">
                        <div className="min-w-0 flex-1">
                          <input
                            value={service.name}
                            onChange={(e) =>
                              editPackageService(service.id, { name: e.target.value })
                            }
                            className="mb-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm font-medium focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                            placeholder="Service name"
                          />
                          <textarea
                            rows={2}
                            value={service.description}
                            onChange={(e) =>
                              editPackageService(service.id, { description: e.target.value })
                            }
                            className="block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                            placeholder="Service description"
                          />
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <input
                            value={service.price.toString()}
                            onChange={(e) =>
                              editPackageService(service.id, { price: parseNumber(e.target.value) })
                            }
                            className="w-32 rounded border border-gray-300 px-3 py-2 text-sm text-right focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                            inputMode="decimal"
                            aria-label="Service price"
                            placeholder="0"
                          />
                          <span className="text-xs text-gray-600">{formatINR(service.price)}</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => removePackageService(service.id)}
                          className="mt-2 rounded p-1.5 text-red-500 hover:bg-red-50 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                          aria-label="Remove service"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-3 bg-purple-100 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-purple-900">Total Package Value:</span>
                    <span className="font-bold text-purple-900">
                      {formatINR(customizingServices.reduce((sum, s) => sum + s.price, 0))}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        <div className="rounded border border-gray-200 bg-gray-50 p-3">
          <p className="text-sm font-medium mb-2">Add Service</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-6">
            <input
              placeholder="Service name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addService()}
              className="sm:col-span-2 rounded border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
            <input
              placeholder="Description (optional)"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addService()}
              className="sm:col-span-3 rounded border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
            <input
              placeholder="Price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addService()}
              className="sm:col-span-1 rounded border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              inputMode="decimal"
            />
          </div>
          <div className="mt-2">
            <button
              type="button"
              onClick={addService}
              disabled={!name.trim()}
              className="rounded bg-teal-600 px-3 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Service
            </button>
          </div>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={services.map((s) => s.id)} strategy={verticalListSortingStrategy}>
            <ul className="grid grid-cols-1 gap-3">
              {services.map((service) => (
                <SortableServiceItem
                  key={service.id}
                  service={service}
                  onEdit={edit}
                  onRemove={remove}
                />
              ))}
              {services.length === 0 && (
                <li className="rounded border border-dashed border-gray-300 p-6 text-center text-sm text-gray-600">
                  No services yet. Add your first service above.
                </li>
              )}
            </ul>
          </SortableContext>
        </DndContext>

        {services.length > 0 && (
          <div className="rounded border border-amber-200 bg-amber-50 p-3 text-sm">
            <p className="font-medium text-amber-900">💡 Tip</p>
            <p className="text-amber-800 mt-1">
              Drag services by the grip handle to reorder them. The order here will be reflected in
              your proposal.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
