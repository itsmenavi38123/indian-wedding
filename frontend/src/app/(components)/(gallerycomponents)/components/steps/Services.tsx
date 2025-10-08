import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Check } from 'lucide-react';
import { RootState, useAppDispatch } from '@/store/store';
import { fetchServicesByCategory, setSelectedService } from '@/store/slices/planning';
import Image from 'next/image';
interface ServicesStepProps {
  selectedCategories: string[];
  selectedVendors: {
    photographer: string | null;
    venue: string | null;
    decorator: string | null;
  };
  onVendorSelect: (category: string, vendorId: string) => void;
}

export default function ServicesStep({ selectedCategories }: ServicesStepProps) {
  const dispatch = useAppDispatch();
  const { servicesByCategory, servicesLoading, selectedService } = useSelector(
    (state: RootState) => state.planning
  );

  useEffect(() => {
    selectedCategories.forEach((category) => {
      if (!servicesByCategory[category]) {
        dispatch(fetchServicesByCategory({ category, page: 1, limit: 4 }));
      }
    });
  }, [selectedCategories, servicesByCategory, dispatch]);

  if (servicesLoading) return <div>Loading services...</div>;
  if (!selectedCategories.length) return <div>No categories selected.</div>;

  return (
    <div className="space-y-8">
      {selectedCategories.map((category) => {
        const categoryServices = servicesByCategory[category] || [];
        const showViewMore = categoryServices.length > 4; // Only show "View More" if >4

        return (
          <div key={category}>
            <h2 className="text-2xl font-bold mb-4">{category}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
              {categoryServices.slice(0, 4).map((service) => (
                <div
                  key={service.id}
                  className={`relative border rounded-lg overflow-hidden shadow-sm cursor-pointer transform transition-transform hover:scale-105
                    ${selectedService?.id === service.id ? 'ring-4 ring-rose-500' : ''}`}
                  onClick={() => dispatch(setSelectedService(service))}
                >
                  <Image
                    src={service.media?.[0]?.url || 'https://via.placeholder.com/150'}
                    alt={service.title}
                    className="w-full h-32 object-cover"
                  />
                  <div className="p-3 font-semibold text-gray-800">{service.title}</div>
                  {selectedService?.id === service.id && (
                    <div className="absolute top-2 right-2 bg-rose-500 rounded-full p-2">
                      <Check size={16} className="text-white" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {showViewMore && (
              <div className="mt-2 text-right">
                <button className="text-sm bg-white px-3 py-1 rounded shadow">View More</button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
