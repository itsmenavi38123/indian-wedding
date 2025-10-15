import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Check, ArrowLeft } from 'lucide-react';
import { RootState, useAppDispatch } from '@/store/store';
import { setSelectedService } from '@/store/slices/planning';
import { getImageUrl } from './Services';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

interface CategoryServicesViewProps {
  category: string;
  selectedServices: any[];
  onBack: () => void;
  onUpdateSelection: (updated: any[]) => void;
  destination?: string | null;
}

export default function CategoryServicesView({
  category,
  selectedServices,
  onBack,
  onUpdateSelection,
  destination,
}: CategoryServicesViewProps) {
  const dispatch = useAppDispatch();
  const { servicesByCategory } = useSelector((state: RootState) => state.planning);
  const categoryServices = useMemo(
    () => servicesByCategory[category] || [],
    [servicesByCategory, category]
  );

  const filteredCategoryServices = useMemo(() => {
    if (!destination) return categoryServices;

    const dest = destination.trim().toLowerCase();

    return categoryServices.filter((service) => {
      const city = service.city?.trim().toLowerCase();
      const state = service.state?.trim().toLowerCase();
      const country = service.country?.trim().toLowerCase();

      return city === dest || state === dest || country === dest;
    });
  }, [categoryServices, destination]);

  const calculateSimilarity = (selected: any, candidate: any) => {
    let score = 0;

    if (candidate.category?.toLowerCase() !== selected.category?.toLowerCase()) return 0;

    if (selected.price && candidate.price) {
      const priceDiff = Math.abs(candidate.price - selected.price) / selected.price;
      if (priceDiff <= 0.25) score += 2;
    }

    if (
      candidate.city?.toLowerCase() === selected.city?.toLowerCase() ||
      candidate.state?.toLowerCase() === selected.state?.toLowerCase()
    ) {
      score += 3;
    }

    const keywords = selected.title?.toLowerCase().split(' ') || [];
    if (keywords.some((k: any) => candidate.title?.toLowerCase().includes(k))) score += 1;
    if (keywords.some((k: any) => candidate.description?.toLowerCase().includes(k))) score += 1;

    return score;
  };

  const recommended = useMemo(() => {
    if (!selectedServices.length) return [];

    const sameCategoryServices = filteredCategoryServices.filter(
      (s) => s.category?.toLowerCase() === category.toLowerCase()
    );

    const scored = sameCategoryServices
      .filter((s) => !selectedServices.some((sel) => sel.id === s.id))
      .map((s) => {
        const bestScore = Math.max(...selectedServices.map((sel) => calculateSimilarity(sel, s)));
        return { ...s, score: bestScore };
      })
      .filter((s) => s.score > 2)
      .sort((a, b) => b.score - a.score);

    return scored.slice(0, 8);
  }, [filteredCategoryServices, selectedServices, category]);

  const allNonRecommended = useMemo(() => {
    const recommendedIds = recommended.map((r) => r.id);
    return filteredCategoryServices.filter(
      (s) => !recommendedIds.includes(s.id) || selectedServices.some((sel) => sel.id === s.id)
    );
  }, [filteredCategoryServices, recommended, selectedServices]);

  const handleToggle = (service: any) => {
    const isSelected = selectedServices.some((s) => s.id === service.id);
    const updated = isSelected
      ? selectedServices.filter((s) => s.id !== service.id)
      : [...selectedServices, service];
    onUpdateSelection(updated);
    dispatch(setSelectedService(service));
  };

  const ServiceCard = ({ service, isSelected }: { service: any; isSelected: boolean }) => (
    <div
      key={service.id}
      className={`relative border rounded-lg overflow-hidden shadow-sm cursor-pointer transform transition-transform hover:scale-105
        ${isSelected ? 'ring-4 ring-rose-500' : ''}`}
      onClick={() => handleToggle(service)}
    >
      <img
        src={getImageUrl(service.media?.[0]?.url)}
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

  const selectedMedia = useMemo(() => {
    const mediaItems: { url: string; type: 'image' | 'video' }[] = [];
    selectedServices.forEach((service) => {
      service.media?.forEach((m: any) => {
        const ext = m.url.split('.').pop()?.toLowerCase();
        const type = ext === 'mp4' || ext === 'mov' ? 'video' : 'image';
        mediaItems.push({ url: getImageUrl(m.url), type });
      });
    });
    return mediaItems;
  }, [selectedServices]);

  return (
    <div>
      <button onClick={onBack} className="flex items-center text-sm text-gray-600 mb-4">
        <ArrowLeft size={16} className="mr-2" /> Back
      </button>

      <h2 className="text-2xl font-bold mb-6 capitalize">{category} Services</h2>
      {/* All Services Section (excluding recommended unless selected) */}
      <h3 className="text-xl font-semibold mb-4 text-gray-700">All Services</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
        {allNonRecommended.map((service) => {
          const isSelected = selectedServices.some((s) => s.id === service.id);
          return <ServiceCard key={service.id} service={service} isSelected={isSelected} />;
        })}
      </div>
      {recommended.length > 0 && (
        <>
          <h3 className="text-xl mb-4 font-semibold mt-6 text-gray-700">Recommended for You</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 mb-10">
            {recommended.map((service) => {
              const isSelected = selectedServices.some((s) => s.id === service.id);
              return <ServiceCard key={service.id} service={service} isSelected={isSelected} />;
            })}
          </div>
        </>
      )}

      {/* Selected Media Gallery */}
      {selectedMedia.length > 0 && (
        <>
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Images</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-10">
            {selectedMedia.map((m, index) =>
              m.type === 'video' ? (
                <video
                  key={index}
                  src={m.url}
                  controls
                  className="w-full h-32 object-cover rounded-lg"
                />
              ) : (
                <Image
                  key={index}
                  src={m.url}
                  alt={`media-${index}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
              )
            )}
          </div>
        </>
      )}
    </div>
  );
}
