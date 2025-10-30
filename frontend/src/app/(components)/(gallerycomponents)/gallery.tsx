import React, { useCallback, useEffect, useState } from 'react';
import {
  ChevronRight,
  ChevronLeft,
  Check,
  MapPin,
  Camera,
  Users,
  Calendar,
  ListFilterPlus,
  BookImage,
} from 'lucide-react';
import BudgetStep from './components/steps/BudgetStep';
import { RootState, useAppDispatch, useAppSelector } from '@/store/store';
import { fetchDestinationsFromServices } from '@/store/slices/planning';
import Category from './components/steps/Category';
import ServicesStep from './components/steps/Services';
import Events from './components/steps/Events';
import { useCreateWeddingPlan } from '@/services/api/weddingPlan';
import Image from 'next/image';
import { useGetCurrentUser } from '@/services/api/userAuth';
import { useRouter } from 'next/navigation';

// Types
type WizardStep =
  | 'budget'
  | 'destination'
  | 'category'
  | 'events'
  | 'photos'
  | 'services'
  | 'guests'
  | 'review';

interface WizardData {
  budget: { min: number; max: number } | null;
  destinationId: string | null;
  destination: string | null;
  weddingDate: { startDate: string; endDate: string };
  category: string | null;
  guestCount: number | null;
  likedPhotos: string[];
  selectedVendors: {
    photographer: string | null;
    venue: string | null;
    decorator: string | null;
  };
  events: {
    name: string;
    date: string;
    startTime: string;
    endTime: string;
  }[];
  selectedServices: Record<string, any[]>;
  photographerPreference: 'local' | 'travel' | 'either';
  selectedCategories: string[];
}

export default function GalleryPage() {
  const dispatch = useAppDispatch();
  const destinations = useAppSelector((state: RootState) => state.planning.destinations);
  const allServices = useAppSelector((state: RootState) => state.planning.services);
  const { mutate: createWeddingPlan } = useCreateWeddingPlan();
  const router = useRouter();
  const { data: currentUser } = useGetCurrentUser();

  useEffect(() => {
    dispatch(fetchDestinationsFromServices({}))
      .unwrap()
      .then((data) => {
        console.log('Fetched destinations from services:', data);
      })
      .catch((error) => {
        console.error('Failed to fetch destinations:', error);
      });
  }, [dispatch]);

  const [wizardData, setWizardData] = useState<WizardData>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pendingWeddingPlan');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          console.warn('Failed to parse saved wizard data');
        }
      }
    }
    return {
      budget: null,
      destination: null,
      destinationId: null,
      weddingDate: { startDate: '', endDate: '' },
      guestCount: null,
      category: null,
      likedPhotos: [],
      selectedVendors: {
        photographer: null,
        venue: null,
        decorator: null,
      },
      events: [],
      photographerPreference: 'either',
      selectedCategories: [],
      selectedServices: {},
    };
  });

  const [currentStep, setCurrentStep] = useState<WizardStep>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('currentStep') as WizardStep) || 'budget';
    }
    return 'budget';
  });

  useEffect(() => {
    localStorage.setItem('pendingWeddingPlan', JSON.stringify(wizardData));
    localStorage.setItem('currentStep', currentStep);
  }, [wizardData, currentStep]);

  const steps: { id: WizardStep; title: string; icon: any }[] = [
    { id: 'budget', title: 'Budget', icon: Calendar },
    { id: 'destination', title: 'Destination', icon: MapPin },
    { id: 'category', title: 'Category', icon: ListFilterPlus },
    { id: 'events', title: 'Events', icon: BookImage },
    { id: 'services', title: 'Services', icon: Camera },
    { id: 'guests', title: 'Guests', icon: Users },
    { id: 'review', title: 'Review', icon: Check },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  const nextStep = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex].id);
    }
  };

  const prevStep = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].id);
    }
  };

  // const togglePhotoLike = (photoId: string) => {
  //   setWizardData((prev) => ({
  //     ...prev,
  //     likedPhotos: prev.likedPhotos.includes(photoId)
  //       ? prev.likedPhotos.filter((id) => id !== photoId)
  //       : [...prev.likedPhotos, photoId],
  //   }));
  // };
  const selectedVendorsPayload = Object.entries(wizardData.selectedVendors || {})
    .filter(([vendorId]) => !!vendorId)
    .reduce(
      (acc, [categoryKey, vendorId]) => {
        const category = categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1).toLowerCase();

        acc[category] = {
          vendorId: vendorId ?? '',
          name: '',
          email: '',
        };
        return acc;
      },
      {} as Record<string, { vendorId: string; name?: string; email?: string }>
    );

  const handleVendorSelect = useCallback((category: string, vendorId: string) => {
    setWizardData((prev) => ({
      ...prev,
      selectedVendors: { ...prev.selectedVendors, [category]: vendorId },
    }));
  }, []);

  const handleSubmit = () => {
    if (!currentUser) {
      localStorage.setItem('pendingWeddingPlan', JSON.stringify(wizardData));
      router.push(`/user/login?redirect=/gallery`);
      return;
    }
    if (!wizardData.destination || !wizardData.budget) {
      return alert('Please complete all steps before submitting.');
    }

    const services = Object.entries(wizardData.selectedVendors || {})
      // .filter(([vendorServiceId]) => !!vendorServiceId && vendorServiceId.trim() !== '')
      .filter(([, vendorServiceId]) => !!vendorServiceId && vendorServiceId.trim() !== '')
      .map(([category, vendorServiceId]) => ({
        vendorServiceId: vendorServiceId ?? '',
        quantity: 1,
        notes: `${category} service`,
      }));

    console.log('wizardData.selectedVendors:', wizardData.selectedVendors);

    const payload = {
      destinationId: wizardData.destinationId,
      totalBudget: wizardData.budget.max,
      minBudget: wizardData.budget.min,
      maxBudget: wizardData.budget.max,
      category: wizardData.selectedCategories,
      weddingDate: wizardData.weddingDate || {
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
      },
      guestCount: wizardData.guestCount || 0,
      selectedVendors: selectedVendorsPayload,
      events: wizardData.events.map((ev) => ({
        name: ev.name,
        date: ev.date,
        startTime: ev.startTime,
        endTime: ev.endTime,
      })),
      services,
    };

    console.log('Sending payload:', payload);
    createWeddingPlan(payload);
  };

  return (
    <div className="mt-26 min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-amber-600 bg-clip-text text-transparent">
              Plan Your Dream Wedding
            </h1>
            <div className="text-sm text-gray-500">
              Step {currentStepIndex + 1} of {steps.length}
            </div>
          </div>

          {/* Step indicators */}
          <div className="flex items-center justify-between mt-6">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isCompleted = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;

              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        isCompleted
                          ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white'
                          : isCurrent
                            ? 'bg-white border-2 border-rose-500 text-rose-500'
                            : 'bg-gray-200 text-gray-400'
                      }`}
                    >
                      {isCompleted ? <Check size={20} /> : <Icon size={20} />}
                    </div>
                    <span
                      className={`text-xs mt-1 ${isCurrent ? 'text-rose-600 font-medium' : 'text-gray-500'}`}
                    >
                      {step.title}
                    </span>
                  </div>
                  {idx < steps.length - 1 && (
                    <div
                      className={`h-0.5 flex-1 mx-2 ${isCompleted ? 'bg-gradient-to-r from-rose-500 to-amber-500' : 'bg-gray-200'}`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 min-h-[500px]">
          {/* Step 1: Budget */}
          {currentStep === 'budget' && (
            <BudgetStep
              budget={wizardData.budget}
              onChange={(upd) => setWizardData({ ...wizardData, ...upd })}
            />
          )}

          {/* Step 2: Destination */}
          {currentStep === 'destination' && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Choose your destination</h2>
                <p className="text-gray-600">Where would you like to celebrate?</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {destinations
                  .filter(
                    (d) =>
                      !wizardData.budget ||
                      (d.baseCostMin <= wizardData.budget.max &&
                        d.baseCostMax >= wizardData.budget.min)
                  )
                  .map((dest) => {
                    console.log('🧭 Destination option:', dest);

                    return (
                      <button
                        key={dest.id}
                        onClick={() =>
                          setWizardData({
                            ...wizardData,
                            destination: dest.name,
                            destinationId: dest.id,
                          })
                        }
                        className={`group relative overflow-hidden rounded-xl transition-all hover:scale-105 ${
                          wizardData.destinationId === dest.id ? 'ring-4 ring-rose-500' : ''
                        }`}
                      >
                        <Image
                          src={dest.heroImage ? dest.heroImage : ''}
                          alt={dest.name}
                          className="w-full h-48 object-cover"
                          width={400}
                          height={300}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                          <h3 className="text-xl font-bold">{dest.name}</h3>
                          <p className="text-sm text-gray-200">
                            ₹{(dest.baseCostMin / 100000).toFixed(0)}L - ₹
                            {(dest.baseCostMax / 100000).toFixed(0)}L
                          </p>{' '}
                        </div>
                        {wizardData.destination === dest.id && (
                          <div className="absolute top-2 right-2 bg-rose-500 rounded-full p-2">
                            <Check size={16} className="text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Step 3 : Category */}
          {currentStep === 'category' && (
            <Category
              selectedCategories={wizardData.selectedCategories}
              onChange={(categories) =>
                setWizardData({
                  ...wizardData,
                  selectedCategories: categories,
                  category: categories[0] ?? null,
                })
              }
            />
          )}

          {/* Step 4: Events */}
          {currentStep === 'events' && (
            <Events
              selectedCategories={wizardData.selectedCategories}
              photographerPreference={wizardData.photographerPreference}
              onPreferenceSelect={(pref) =>
                setWizardData({ ...wizardData, photographerPreference: pref })
              }
              weddingDate={wizardData.weddingDate}
              events={wizardData.events || []}
              onEventsChange={(newEvents) => setWizardData({ ...wizardData, events: newEvents })}
              onDateChange={(range) => setWizardData((prev) => ({ ...prev, weddingDate: range }))}
            />
          )}

          {/* Step 5: services */}
          {currentStep === 'services' && (
            <ServicesStep
              services={allServices}
              selectedCategories={wizardData.selectedCategories}
              selectedVendors={wizardData.selectedVendors}
              destination={wizardData.destination}
              selectedServices={wizardData.selectedServices}
              onVendorSelect={handleVendorSelect}
              onUpdateServices={(updated) => {
                setWizardData((prev) => ({
                  ...prev,
                  selectedServices: updated,
                }));
              }}
            />
          )}

          {/* Step 6: Guests */}
          {currentStep === 'guests' && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">How many guests?</h2>
                <p className="text-gray-600">Approximate headcount for planning</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                {[
                  { range: '50-100', value: 75 },
                  { range: '100-200', value: 150 },
                  { range: '200-500', value: 350 },
                  { range: '500-1000', value: 750 },
                  { range: '1000-2000', value: 1500 },
                  { range: '2000+', value: 2500 },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setWizardData({ ...wizardData, guestCount: option.value })}
                    className={`p-6 rounded-xl border-2 transition-all hover:shadow-lg ${
                      wizardData.guestCount === option.value
                        ? 'border-rose-500 bg-rose-50 shadow-md'
                        : 'border-gray-200 hover:border-rose-200'
                    }`}
                  >
                    <div className="text-xl font-bold text-gray-900">{option.range}</div>
                    <div className="text-sm text-gray-500 mt-1">guests</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 7: Review */}
          {currentStep === 'review' && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Review your wedding plan</h2>
                <p className="text-gray-600">Everything looks perfect! Ready to start planning?</p>
              </div>

              <div className="max-w-2xl mx-auto space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="font-semibold text-gray-700">Budget</div>
                  <div className="text-lg">
                    {wizardData.budget
                      ? `₹${(wizardData.budget.min / 100000).toFixed(0)}L - ₹${(wizardData.budget.max / 100000).toFixed(0)}L`
                      : 'No budget selected'}
                  </div>{' '}
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="font-semibold text-gray-700">Destination</div>
                  <div className="text-lg capitalize">{wizardData.destination}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="font-semibold text-gray-700">Wedding Date</div>
                  <div className="text-lg">
                    {wizardData.weddingDate?.startDate && wizardData.weddingDate?.endDate
                      ? wizardData.weddingDate.startDate === wizardData.weddingDate.endDate
                        ? wizardData.weddingDate.startDate
                        : `${wizardData.weddingDate.startDate} → ${wizardData.weddingDate.endDate}`
                      : 'No date selected'}
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="font-semibold text-gray-700">Guest Count</div>
                  <div className="text-lg">{wizardData.guestCount} guests</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="font-semibold text-gray-700">Photographer</div>
                  {/* <div className="text-lg">
                    {wizardData.selectedVendors.photographer || 'Not selected'}
                  </div> */}
                  {wizardData.photographerPreference && (
                    <div className="text-sm text-gray-500 mt-1">
                      <span className="capitalize">{wizardData.photographerPreference}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <button
            onClick={prevStep}
            disabled={currentStepIndex === 0}
            className="flex items-center gap-2 px-6 py-3 rounded-lg border-2 border-gray-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            <ChevronLeft size={20} />
            Previous
          </button>

          {currentStepIndex === steps.length - 1 ? (
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 px-8 py-3 rounded-lg bg-gradient-to-r from-rose-500 to-amber-500 text-white font-semibold hover:shadow-lg transition-all"
            >
              {currentUser ? 'Create My Wedding' : 'Login to continue'}
              <Check size={20} />
            </button>
          ) : (
            <button
              onClick={nextStep}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-rose-500 to-amber-500 text-white font-semibold hover:shadow-lg transition-all"
            >
              Continue
              <ChevronRight size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
