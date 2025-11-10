'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/store';
import { setRegion } from '@/store/slices/configurator';
import {
  getRegions,
  getVenuesByRegion,
  updateGuestWeddingPlan,
  Region,
  Venue,
} from '@/services/api/configurator';
import Image from 'next/image';

export default function LocationPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const configuratorState = useAppSelector((state) => state.configurator);

  const [regions, setRegions] = useState<Region[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingVenues, setLoadingVenues] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>('');

  // Redirect if prerequisites not met
  useEffect(() => {
    if (!configuratorState.weddingPlanId || !configuratorState.vibe) {
      router.push('/wedding-configurator/vibe');
      return;
    }
    fetchRegions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchRegions = async () => {
    try {
      setLoading(true);
      // 💡 CLIENT REQUIREMENT: Filter regions based on selected vibe
      const response = await getRegions({ vibe: configuratorState.vibe });

      if (response.data?.regions) {
        setRegions(response.data.regions);

        // Pre-select if already chosen
        if (configuratorState.region) {
          const preSelected = response.data.regions.find(
            (r: Region) => r.name === configuratorState.region
          );
          if (preSelected) {
            setSelectedRegion(preSelected);
            fetchVenuesForRegion(preSelected.name);
          }
        }
      }
    } catch (err: any) {
      setError('Failed to load regions. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchVenuesForRegion = async (regionName: string) => {
    try {
      setLoadingVenues(true);
      const response = await getVenuesByRegion(regionName, {
        budgetMax: configuratorState.budgetMax || undefined,
        limit: 6,
        sortBy: 'price',
        sortOrder: 'asc',
      });

      if (response.data?.venues) {
        setVenues(response.data.venues);
      }
    } catch (err: any) {
      console.error('Failed to load venues:', err);
      setVenues([]);
    } finally {
      setLoadingVenues(false);
    }
  };

  const handleRegionSelect = async (region: Region) => {
    setSelectedRegion(region);
    await fetchVenuesForRegion(region.name);
  };

  const handleContinue = async () => {
    if (!selectedRegion) {
      setError('Please select a region');
      return;
    }

    setSubmitting(true);
    try {
      // Save to Redux
      dispatch(setRegion({ region: selectedRegion.name }));

      // Update DB
      if (configuratorState.weddingPlanId) {
        await updateGuestWeddingPlan(configuratorState.weddingPlanId, {
          region: selectedRegion.name,
          wizardStep: 3,
        });
      }

      // Navigate to Step 4
      router.push('/wedding-configurator/budget');
    } catch (err: any) {
      setError('Failed to save your selection. Please try again.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    router.push('/wedding-configurator/vibe');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gold mx-auto mb-4"></div>
          <p className="text-gray-600">Loading destinations for {configuratorState.vibe}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-serif text-gray-900 mb-4">
          Where Do You Imagine Saying Your Vows?
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Based on your <span className="font-medium text-gold">{configuratorState.vibe}</span>{' '}
          vibe, we&apos;ve curated the perfect destinations for your dream wedding.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {/* AI Filter Badge */}
      <div className="bg-gradient-to-r from-gold/10 to-purple-50 rounded-xl p-4 mb-8 text-center">
        <p className="text-sm text-gray-700">
          ✨ <span className="font-medium">AI-Filtered Destinations:</span> We&apos;re showing you
          only the regions that perfectly match your &ldquo;{configuratorState.vibe}&rdquo; vibe
        </p>
      </div>

      {/* Regions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {regions.map((region) => (
          <div
            key={region.id}
            onClick={() => handleRegionSelect(region)}
            className={`
              relative cursor-pointer rounded-2xl overflow-hidden shadow-lg transition-all duration-300 bg-white
              ${
                selectedRegion?.id === region.id
                  ? 'ring-4 ring-gold scale-105 shadow-2xl'
                  : 'hover:scale-105 hover:shadow-2xl'
              }
            `}
          >
            <div className="p-6">
              {/* Flag Icon */}
              <div className="text-6xl mb-4 text-center">{region.icon}</div>

              {/* Region Name */}
              <h3 className="text-2xl font-serif text-gray-900 mb-3 text-center">{region.name}</h3>

              {/* Popular Cities */}
              <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-600 font-medium">Popular cities:</p>
                <div className="flex flex-wrap gap-2">
                  {region.popularCities.slice(0, 4).map((city, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                    >
                      {city}
                    </span>
                  ))}
                </div>
              </div>

              {/* Selected Checkmark */}
              {selectedRegion?.id === region.id && (
                <div className="flex items-center justify-center mt-4">
                  <div className="bg-gold rounded-full p-2">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Venue Previews */}
      {selectedRegion && (
        <div className="mb-12">
          <div className="mb-6">
            <h2 className="text-2xl font-serif text-gray-900 mb-2">
              Sample Venues in {selectedRegion.name}
            </h2>
            <p className="text-gray-600">
              Here are some of our featured venues. You&apos;ll explore more options in the next
              steps.
            </p>
          </div>

          {loadingVenues ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4"></div>
              <p className="text-gray-600">Loading venues...</p>
            </div>
          ) : venues.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {venues.map((venue) => (
                <div
                  key={venue.id}
                  className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
                >
                  {/* Venue Image */}
                  <div className="relative h-48 bg-gray-200">
                    {venue.images && venue.images.length > 0 ? (
                      <Image src={venue.images[0]} alt={venue.name} fill className="object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-gray-300">
                        <span className="text-gray-500">No image</span>
                      </div>
                    )}
                  </div>

                  {/* Venue Info */}
                  <div className="p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-1">{venue.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{venue.location}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{venue.capacity}</span>
                      <span className="text-sm font-medium text-gold">
                        ₹{(venue.basePrice / 100000).toFixed(1)}L+
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <p className="text-gray-600">
                No venues available in this region yet. Don&apos;t worry, we&apos;ll help you find
                the perfect spot!
              </p>
            </div>
          )}
        </div>
      )}

      {/* Selected Region Summary */}
      {selectedRegion && (
        <div className="bg-gradient-to-r from-gold/10 via-purple-50 to-gold/10 rounded-2xl p-6 mb-8 border border-gold/20">
          <div className="flex items-center space-x-4">
            <div className="text-4xl">{selectedRegion.icon}</div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                You&apos;ve selected: {selectedRegion.name}
              </h3>
              <p className="text-sm text-gray-600">
                Popular cities: {selectedRegion.popularCities.join(', ')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pb-8">
        <button
          onClick={handleBack}
          className="px-6 py-3 text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
        >
          ← Back
        </button>

        <button
          onClick={handleContinue}
          disabled={!selectedRegion || submitting}
          className={`
            px-8 py-3 font-medium rounded-lg transition-colors shadow-md
            ${
              selectedRegion && !submitting
                ? 'bg-gold text-white hover:bg-gold/90 hover:shadow-lg'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          {submitting ? (
            <span className="flex items-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Saving...
            </span>
          ) : (
            'Next: Set Your Budget →'
          )}
        </button>
      </div>
    </div>
  );
}
