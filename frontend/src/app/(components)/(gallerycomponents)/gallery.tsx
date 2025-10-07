import React, { useEffect, useState } from 'react';
import {
  ChevronRight,
  ChevronLeft,
  Check,
  Heart,
  MapPin,
  Camera,
  Users,
  Calendar,
  ListFilterPlus,
} from 'lucide-react';
import BudgetStep from './components/steps/BudgetStep';
import { RootState, useAppDispatch, useAppSelector } from '@/store/store';
import { fetchDestinationsFromServices } from '@/store/slices/planning';
import Category from './components/steps/Category';
import ServicesStep from './components/steps/Services';

// Types
type WizardStep =
  | 'budget'
  | 'destination'
  | 'category'
  | 'photos'
  | 'services'
  | 'guests'
  | 'review';

interface WizardData {
  budget: { min: number; max: number } | null;
  destination: string | null;
  weddingDate: string | null;
  guestCount: number | null;
  likedPhotos: string[];
  selectedVendors: {
    photographer: string | null;
    venue: string | null;
    decorator: string | null;
  };
  photographerPreference: 'local' | 'travel' | 'either';
  selectedCategories: string[];
}

// Sample data
// const destinations = [
//   {
//     id: 'fiji',
//     name: 'Fiji',
//     image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400',
//     priceRange: '₹15L-₹50L',
//   },
//   {
//     id: 'bali',
//     name: 'Bali',
//     image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400',
//     priceRange: '₹10L-₹35L',
//   },
//   {
//     id: 'thailand',
//     name: 'Thailand',
//     image: 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=400',
//     priceRange: '₹8L-₹30L',
//   },
//   {
//     id: 'goa',
//     name: 'Goa',
//     image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=400',
//     priceRange: '₹5L-₹20L',
//   },
//   {
//     id: 'udaipur',
//     name: 'Udaipur',
//     image: 'https://images.unsplash.com/photo-1609920658906-8223bd289001?w=400',
//     priceRange: '₹12L-₹40L',
//   },
//   {
//     id: 'jaipur',
//     name: 'Jaipur',
//     image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=400',
//     priceRange: '₹8L-₹25L',
//   },
// ];

const samplePhotos = [
  {
    id: '1',
    url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=300',
    vendor: 'Raj Photography',
    type: 'photographer',
  },
  {
    id: '2',
    url: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=300',
    vendor: 'Luxury Venues',
    type: 'venue',
  },
  {
    id: '3',
    url: 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=300',
    vendor: 'Elegant Decor',
    type: 'decorator',
  },
  {
    id: '4',
    url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=300',
    vendor: 'Wedding Bells Photo',
    type: 'photographer',
  },
  {
    id: '5',
    url: 'https://images.unsplash.com/photo-1530023367847-a683933f4172?w=300',
    vendor: 'Dream Venues',
    type: 'venue',
  },
  {
    id: '6',
    url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=300',
    vendor: 'Floral Dreams',
    type: 'decorator',
  },
  {
    id: '7',
    url: 'https://images.unsplash.com/photo-1592107761705-30a1bbc641e7?w=300',
    vendor: 'Capture Moments',
    type: 'photographer',
  },
  {
    id: '8',
    url: 'https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=300',
    vendor: 'Royal Palaces',
    type: 'venue',
  },
];

export default function GalleryPage() {
  const [currentStep, setCurrentStep] = useState<WizardStep>('budget');

  const dispatch = useAppDispatch();
  const destinations = useAppSelector((state: RootState) => state.planning.destinations);

  useEffect(() => {
    dispatch(fetchDestinationsFromServices({}));
  }, [dispatch]);

  const [wizardData, setWizardData] = useState<WizardData>({
    budget: null,
    destination: null,
    weddingDate: null,
    guestCount: null,
    likedPhotos: [],
    selectedVendors: {
      photographer: null,
      venue: null,
      decorator: null,
    },
    photographerPreference: 'either',
    selectedCategories: [],
  });

  const steps: { id: WizardStep; title: string; icon: any }[] = [
    { id: 'budget', title: 'Budget', icon: Calendar },
    { id: 'destination', title: 'Destination', icon: MapPin },
    { id: 'category', title: 'Category', icon: ListFilterPlus },
    { id: 'services', title: 'Services', icon: Camera },
    { id: 'guests', title: 'Guests', icon: Users },
    { id: 'review', title: 'Review', icon: Check },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

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

  const togglePhotoLike = (photoId: string) => {
    setWizardData((prev) => ({
      ...prev,
      likedPhotos: prev.likedPhotos.includes(photoId)
        ? prev.likedPhotos.filter((id) => id !== photoId)
        : [...prev.likedPhotos, photoId],
    }));
  };

  const handleSubmit = async () => {
    // API call to create wedding
    console.log('Creating wedding with:', wizardData);
    alert('Wedding created successfully! 🎉');
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
                  .map((dest) => (
                    <button
                      key={dest.id}
                      onClick={() => setWizardData({ ...wizardData, destination: dest.id })}
                      className={`group relative overflow-hidden rounded-xl transition-all hover:scale-105 ${
                        wizardData.destination === dest.id ? 'ring-4 ring-rose-500' : ''
                      }`}
                    >
                      <img
                        src={dest.heroImage}
                        alt={dest.name}
                        className="w-full h-48 object-cover"
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
                  ))}
              </div>
            </div>
          )}

          {/* Step 3 : Category */}
          {currentStep === 'category' && (
            <Category
              selectedCategories={wizardData.selectedCategories}
              onChange={(categories) =>
                setWizardData({ ...wizardData, selectedCategories: categories })
              }
            />
          )}

          {/* Step 4: services */}
          {currentStep === 'services' && (
            <ServicesStep
              selectedCategories={wizardData.selectedCategories}
              selectedVendors={wizardData.selectedVendors}
              onVendorSelect={(category, vendorId) =>
                setWizardData((prev) => ({
                  ...prev,
                  selectedVendors: { ...prev.selectedVendors, [category.toLowerCase()]: vendorId },
                }))
              }
            />
            // <div className="space-y-6 animate-fade-in">
            //   <div className="text-center mb-8">
            //     <h2 className="text-3xl font-bold text-gray-900 mb-2">Choose your services</h2>
            //     <p className="text-gray-600">Based on your style preferences</p>
            //   </div>

            //   <div className="space-y-6 max-w-4xl mx-auto">
            //     <div>
            //       <h3 className="text-lg font-semibold mb-3">Photographer Preference</h3>
            //       <div className="grid grid-cols-3 gap-3">
            //         {['local', 'travel', 'either'].map((pref) => (
            //           <button
            //             key={pref}
            //             onClick={() =>
            //               setWizardData({ ...wizardData, photographerPreference: pref as any })
            //             }
            //             className={`p-4 rounded-lg border-2 transition-all ${wizardData.photographerPreference === pref
            //               ? 'border-rose-500 bg-rose-50'
            //               : 'border-gray-200 hover:border-rose-200'
            //               }`}
            //           >
            //             <div className="font-medium capitalize">{pref}</div>
            //             <div className="text-xs text-gray-500 mt-1">
            //               {pref === 'local'
            //                 ? 'From destination'
            //                 : pref === 'travel'
            //                   ? 'Flies with you'
            //                   : 'No preference'}
            //             </div>
            //           </button>
            //         ))}
            //       </div>
            //     </div>

            //     {['photographer', 'venue', 'decorator'].map((vendorType) => {
            //       const relevantPhotos = samplePhotos.filter((p) => p.type === vendorType);
            //       return (
            //         <div key={vendorType}>
            //           <h3 className="text-lg font-semibold mb-3 capitalize">{vendorType}</h3>
            //           <div className="grid grid-cols-4 gap-3">
            //             {relevantPhotos.map((photo) => (
            //               <button
            //                 key={photo.id}
            //                 onClick={() =>
            //                   setWizardData({
            //                     ...wizardData,
            //                     selectedVendors: {
            //                       ...wizardData.selectedVendors,
            //                       [vendorType]: photo.vendor,
            //                     },
            //                   })
            //                 }
            //                 className={`relative overflow-hidden rounded-lg transition-all ${wizardData.selectedVendors[
            //                   vendorType as keyof typeof wizardData.selectedVendors
            //                 ] === photo.vendor
            //                   ? 'ring-4 ring-rose-500'
            //                   : ''
            //                   }`}
            //               >
            //                 <img src={photo.url} alt="" className="w-full h-24 object-cover" />
            //                 <div className="p-2 bg-white border-t">
            //                   <p className="text-xs font-medium truncate">{photo.vendor}</p>
            //                 </div>
            //               </button>
            //             ))}
            //           </div>
            //         </div>
            //       );
            //     })}
            //   </div>
            // </div>
          )}

          {/* Step 5: Guests */}
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

          {/* Step 6: Review */}
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
                  <div className="text-lg">{wizardData.weddingDate}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="font-semibold text-gray-700">Guest Count</div>
                  <div className="text-lg">{wizardData.guestCount} guests</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="font-semibold text-gray-700">Photographer</div>
                  <div className="text-lg">
                    {wizardData.selectedVendors.photographer || 'Not selected'}
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="font-semibold text-gray-700">Venue</div>
                  <div className="text-lg">
                    {wizardData.selectedVendors.venue || 'Not selected'}
                  </div>
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
              Create My Wedding
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
