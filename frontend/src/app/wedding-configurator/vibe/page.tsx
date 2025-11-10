'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAppDispatch, useAppSelector } from '@/store/store';
import { setVibe } from '@/store/slices/configurator';
import { updateGuestWeddingPlan } from '@/services/api/configurator';
import axios from 'axios';
import { API_BASE_URL } from '@/lib/constant';

interface Vibe {
  id: string;
  name: string;
  tagline: string;
  image: string;
  description: string;
  order: number;
  isActive: boolean;
}

export default function VibePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const configuratorState = useAppSelector((state) => state.configurator);

  const [vibes, setVibes] = useState<Vibe[]>([]);
  const [filteredVibes, setFilteredVibes] = useState<Vibe[]>([]);
  const [hoveredVibe, setHoveredVibe] = useState<string | null>(null);
  const [selectedVibe, setSelectedVibe] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [personalizedDescriptions, setPersonalizedDescriptions] = useState<Record<string, string>>(
    {}
  );
  const [loadingDescriptions, setLoadingDescriptions] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const vibesPerPage = 6;

  // Redirect if no wedding plan created
  useEffect(() => {
    if (!configuratorState.weddingPlanId) {
      router.push('/wedding-configurator/welcome');
      return;
    }

    // Pre-select if already chosen
    if (configuratorState.vibe) {
      setSelectedVibe(configuratorState.vibe);
    }

    // Fetch vibes from API
    fetchVibes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchVibes = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/configurator/vibes`);
      if (response.data?.data?.vibes) {
        setVibes(response.data.data.vibes);
        setFilteredVibes(response.data.data.vibes);
      }
    } catch (err: any) {
      setError('Failed to load vibes. Please refresh the page.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filter vibes based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredVibes(vibes);
      setCurrentPage(1);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = vibes.filter(
      (vibe) =>
        vibe.name.toLowerCase().includes(query) ||
        vibe.tagline.toLowerCase().includes(query) ||
        vibe.description.toLowerCase().includes(query)
    );
    setFilteredVibes(filtered);
    setCurrentPage(1);
  }, [searchQuery, vibes]);

  const handleVibeSelect = (vibeName: string) => {
    setSelectedVibe(vibeName);
  };

  const handleContinue = async () => {
    if (!selectedVibe) {
      setError('Please select a wedding vibe');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // Find selected vibe details
      const vibeDetails = vibes.find((v) => v.name === selectedVibe);

      // Save to Redux
      dispatch(
        setVibe({
          vibe: selectedVibe,
          description: vibeDetails?.description || '',
        })
      );

      // Update DB
      if (configuratorState.weddingPlanId) {
        await updateGuestWeddingPlan(configuratorState.weddingPlanId, {
          vibe: selectedVibe,
          wizardStep: 2,
        });
      }

      // Navigate to Step 3
      router.push('/wedding-configurator/location');
    } catch (err: any) {
      setError('Failed to save your vibe. Please try again.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    router.push('/wedding-configurator/welcome');
  };

  // Fetch AI-generated personalized description for a vibe
  const fetchPersonalizedDescription = async (vibeName: string) => {
    // If already loaded or loading, skip
    if (personalizedDescriptions[vibeName] || loadingDescriptions[vibeName]) {
      return;
    }

    setLoadingDescriptions((prev) => ({ ...prev, [vibeName]: true }));

    try {
      const response = await axios.post(
        `${API_BASE_URL}/configurator/vibes/personalized-description`,
        {
          vibeName,
          coupleNames: configuratorState.coupleNames,
          guests: configuratorState.guests,
          weddingDate: configuratorState.weddingStartDate,
        }
      );

      if (response.data?.data?.description) {
        setPersonalizedDescriptions((prev) => ({
          ...prev,
          [vibeName]: response.data.data.description,
        }));
      }
    } catch (err: any) {
      console.error('Failed to fetch personalized description:', err);
      // Set a fallback description
      setPersonalizedDescriptions((prev) => ({
        ...prev,
        [vibeName]: `Perfect for your ${configuratorState.guests || 100}-guest celebration!`,
      }));
    } finally {
      setLoadingDescriptions((prev) => ({ ...prev, [vibeName]: false }));
    }
  };

  // Handle hover - trigger description fetch
  const handleVibeHover = (vibeName: string) => {
    setHoveredVibe(vibeName);
    fetchPersonalizedDescription(vibeName);
  };

  // Get personalized description (either from cache or show loading)
  const getPersonalizedBlurb = (vibeName: string): string => {
    if (personalizedDescriptions[vibeName]) {
      return personalizedDescriptions[vibeName];
    }

    if (loadingDescriptions[vibeName]) {
      return 'Generating your personalized recommendation...';
    }

    return 'Hover to see personalized insights...';
  };

  // Calculate pagination
  const totalPages = Math.ceil(filteredVibes.length / vibesPerPage);
  const indexOfLastVibe = currentPage * vibesPerPage;
  const indexOfFirstVibe = indexOfLastVibe - vibesPerPage;
  const currentVibes = filteredVibes.slice(indexOfFirstVibe, indexOfLastVibe);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-serif text-gray-900 mb-4">
          Choose Your Wedding Vibe
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Select the style that speaks to your heart. Hover over each option to see personalized
          recommendations based on your guest count and dates.
        </p>
        {configuratorState.coupleNames && (
          <p className="mt-3 text-sm text-gold font-medium">
            Planning for {configuratorState.coupleNames} • {configuratorState.guests} guests
            {configuratorState.weddingStartDate &&
              ` • ${new Date(configuratorState.weddingStartDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`}
          </p>
        )}
      </div>

      {/* Search Bar */}
      {!loading && (
        <div className="mb-8 max-w-2xl mx-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Search vibes by name, style, or theme..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-4 pr-12 text-gray-900 bg-white border-2 border-gray-200 rounded-full shadow-sm focus:border-gold focus:ring-2 focus:ring-gold/20 focus:outline-none transition-all"
            />
            <svg
              className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          {searchQuery && (
            <p className="text-center text-sm text-gray-600 mt-3">
              Found {filteredVibes.length} vibe{filteredVibes.length !== 1 ? 's' : ''} matching
              &quot;{searchQuery}&quot;
              {filteredVibes.length > 0 && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="ml-2 text-gold hover:underline"
                >
                  Clear search
                </button>
              )}
            </p>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gold mx-auto mb-4"></div>
            <p className="text-gray-600">Loading wedding vibes...</p>
          </div>
        </div>
      )}

      {/* No Results Message */}
      {!loading && filteredVibes.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-2xl font-serif text-gray-900 mb-2">No vibes found</h3>
          <p className="text-gray-600 mb-4">
            We couldn&apos;t find any vibes matching &quot;{searchQuery}&quot;
          </p>
          <button
            onClick={() => setSearchQuery('')}
            className="px-6 py-2 bg-gold text-white rounded-lg hover:bg-gold/90 transition-colors"
          >
            Clear search and see all vibes
          </button>
        </div>
      )}

      {/* Vibes Grid */}
      {!loading && filteredVibes.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {currentVibes.map((vibe) => (
              <div
                key={vibe.id}
                className={`
                  relative rounded-xl overflow-hidden shadow-lg cursor-pointer transition-all duration-300 group
                  ${selectedVibe === vibe.name ? 'ring-4 ring-gold scale-105' : 'hover:scale-105 hover:shadow-2xl'}
                `}
                onClick={() => handleVibeSelect(vibe.name)}
                onMouseEnter={() => handleVibeHover(vibe.name)}
                onMouseLeave={() => setHoveredVibe(null)}
              >
                {/* Image */}
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src={vibe.image}
                    alt={vibe.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

                  {/* Selected Badge */}
                  {selectedVibe === vibe.name && (
                    <div className="absolute top-4 right-4 bg-gold text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Selected
                    </div>
                  )}

                  {/* Text Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="text-2xl font-serif font-bold mb-1">{vibe.name}</h3>
                    <p className="text-sm text-white/90 font-medium">{vibe.tagline}</p>
                  </div>
                </div>

                {/* Hover Overlay - AI Personalized Blurb */}
                <div
                  className={`
                    absolute inset-0 bg-gold/95 backdrop-blur-sm p-6 flex items-center justify-center
                    transition-opacity duration-300
                    ${hoveredVibe === vibe.name ? 'opacity-100' : 'opacity-0 pointer-events-none'}
                  `}
                >
                  <div className="text-center text-white">
                    {loadingDescriptions[vibe.name] ? (
                      <>
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white mx-auto mb-3"></div>
                        <h4 className="text-xl font-serif font-bold mb-3">{vibe.name}</h4>
                        <p className="text-sm leading-relaxed">
                          Generating your unique, personalized recommendation...
                        </p>
                        <div className="mt-4 text-xs opacity-80">
                          🤖 AI Creating Custom Insights
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-3xl mb-3">✨</div>
                        <h4 className="text-xl font-serif font-bold mb-3">{vibe.name}</h4>
                        <p className="text-sm leading-relaxed">{getPersonalizedBlurb(vibe.name)}</p>
                        <div className="mt-4 text-xs opacity-80">
                          {personalizedDescriptions[vibe.name]
                            ? '🤖 AI-Generated Unique for You'
                            : '💡 Hover for AI Insights'}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Info Box */}
          <div className="bg-gradient-to-r from-purple-50 to-gold/10 rounded-xl p-6 mb-8 border border-gold/20">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                <svg className="w-6 h-6 text-gold" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-900 mb-1">
                  🤖 AI-Powered Unique Recommendations
                </h3>
                <p className="text-sm text-gray-600">
                  Hover over any vibe to see a <strong>unique, AI-generated</strong> recommendation
                  created specifically for {configuratorState.coupleNames || 'your celebration'}{' '}
                  with {configuratorState.guests} guests
                  {configuratorState.weddingStartDate &&
                    ` on ${new Date(configuratorState.weddingStartDate).toLocaleDateString(
                      'en-US',
                      {
                        month: 'long',
                        year: 'numeric',
                      }
                    )}`}
                  . Each description is freshly generated and completely unique to your wedding!
                </p>
              </div>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mb-8">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gold hover:text-white border-2 border-gray-200'
                }`}
              >
                ← Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentPage === pageNum
                      ? 'bg-gold text-white'
                      : 'bg-white text-gray-700 hover:bg-gold/10 border-2 border-gray-200'
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gold hover:text-white border-2 border-gray-200'
                }`}
              >
                Next →
              </button>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center pb-8">
            <button
              onClick={handleBack}
              className="px-6 py-3 text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              ← Back
            </button>

            <button
              onClick={handleContinue}
              disabled={!selectedVibe || submitting}
              className={`
                px-8 py-3 font-medium rounded-lg transition-all shadow-md
                ${
                  !selectedVibe || submitting
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gold text-white hover:bg-gold/90 hover:shadow-lg'
                }
              `}
            >
              {submitting ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5"
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
                `Continue to Location →`
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
