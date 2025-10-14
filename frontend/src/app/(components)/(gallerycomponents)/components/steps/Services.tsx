import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Check } from 'lucide-react';
import { RootState, useAppDispatch } from '@/store/store';
import { fetchServicesByCategory, setSelectedService } from '@/store/slices/planning';
import CategoryServicesView from './CategoryServicesView';

interface ServicesStepProps {
  selectedCategories: string[];
  selectedVendors: {
    photographer: string | null;
    venue: string | null;
    decorator: string | null;
  };
  destination?: string | null;
  services: any[];
  onVendorSelect: (category: string, vendorId: string) => void;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function ServicesStep({ selectedCategories, destination }: ServicesStepProps) {
  const dispatch = useAppDispatch();
  const { servicesByCategory, servicesLoading, selectedService } = useSelector(
    (state: RootState) => state.planning
  );

  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [selectedServices, setSelectedServices] = useState<Record<string, any[]>>({});

  useEffect(() => {
    selectedCategories.forEach((category) => {
      if (!servicesByCategory[category]) {
        dispatch(fetchServicesByCategory({ category }));
      }
    });
  }, [selectedCategories, servicesByCategory, dispatch]);

  const handleSelectService = (category: string, service: any) => {
    setSelectedServices((prev) => {
      const alreadySelected = prev[category]?.find((s) => s.id === service.id);
      const updated = alreadySelected
        ? prev[category].filter((s) => s.id !== service.id)
        : [...(prev[category] || []), service];
      return { ...prev, [category]: updated };
    });
    dispatch(setSelectedService(service));
  };

  const filterByDestination = (service: any) => {
    if (!destination) return true;
    const dest = destination.toLowerCase();
    return (
      service.city?.toLowerCase().includes(dest) ||
      service.state?.toLowerCase().includes(dest) ||
      service.country?.toLowerCase().includes(dest)
    );
  };

  if (openCategory) {
    return (
      <CategoryServicesView
        category={openCategory}
        selectedServices={selectedServices[openCategory] || []}
        destination={destination}
        onBack={() => setOpenCategory(null)}
        onUpdateSelection={(updated) =>
          setSelectedServices((prev) => ({ ...prev, [openCategory]: updated }))
        }
      />
    );
  }

  if (servicesLoading) return <div>Loading services...</div>;
  if (!selectedCategories.length) return <div>No categories selected.</div>;

  return (
    <div className="space-y-8">
      {selectedCategories.map((category) => {
        const categoryServices = servicesByCategory[category] || [];
        const filteredServices = categoryServices.filter(filterByDestination);
        const showViewMore =
          filteredServices.length > 4 ||
          (selectedServices[category] && selectedServices[category].length > 0);

        return (
          <div key={category}>
            <h2 className="text-2xl font-bold mb-4 capitalize">{category}</h2>

            {filteredServices.length === 0 ? (
              <div className="text-gray-500 italic">No services found for this category.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
                {filteredServices.slice(0, 4).map((service) => {
                  const isSelected = selectedServices[category]?.some((s) => s.id === service.id);
                  return (
                    <div
                      key={service.id}
                      className={`relative border rounded-lg overflow-hidden shadow-sm cursor-pointer transform transition-transform hover:scale-105
                      ${isSelected ? 'ring-4 ring-rose-500' : ''}`}
                      onClick={() => handleSelectService(category, service)}
                    >
                      <img
                        src={`${BASE_URL}${service.media?.[0]?.url}`}
                        alt={service.title}
                        className="w-full h-32 object-cover"
                      />
                      <div className="p-3 font-semibold text-gray-800">{service.title}</div>
                      {isSelected && (
                        <div className="absolute top-2 right-2 bg-rose-500 rounded-full p-2">
                          <Check size={16} className="text-white" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            {showViewMore && (
              <div className="mt-2 text-right">
                <button
                  onClick={() => setOpenCategory(category)}
                  className="text-sm bg-white px-3 py-1 rounded shadow hover:bg-gray-100 transition"
                >
                  View More
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
