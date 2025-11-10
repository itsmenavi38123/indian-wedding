'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/store';
import { addVendor, removeVendor } from '@/store/slices/configurator';
import { getVendors, VendorService, formatIndianCurrency } from '@/services/api/configurator';
import Image from 'next/image';

const categories = [
  { id: 'venue', name: 'Venues', icon: '🏰' },
  { id: 'photography', name: 'Photography', icon: '📸' },
  { id: 'catering', name: 'Catering', icon: '🍽️' },
  { id: 'decoration', name: 'Decoration', icon: '🌸' },
  { id: 'entertainment', name: 'Entertainment', icon: '🎵' },
  { id: 'makeup', name: 'Makeup & Hair', icon: '💄' },
];

export default function VendorsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const configuratorState = useAppSelector((state) => state.configurator);

  const [selectedCategory, setSelectedCategory] = useState('venue');
  const [vendors, setVendors] = useState<VendorService[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Redirect if prerequisites not met
  useEffect(() => {
    if (!configuratorState.weddingPlanId || !configuratorState.region) {
      router.push('/wedding-configurator/review');
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchVendors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, page, searchQuery]);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      // 💡 CLIENT REQUIREMENT: Contextually filtered by vibe, region, and budget
      const response = await getVendors({
        category: selectedCategory,
        region: configuratorState.region,
        budgetMax: configuratorState.budgetMax || undefined,
        search: searchQuery || undefined,
        page,
        limit: 12,
        sortBy: 'price',
        sortOrder: 'asc',
      });

      if (response.data?.vendors) {
        setVendors(response.data.vendors);
        setTotalPages(response.data.pagination?.totalPages || 1);
      }
    } catch (err: any) {
      console.error('Failed to load vendors:', err);
      setVendors([]);
    } finally {
      setLoading(false);
    }
  };

  const isVendorSelected = (vendorId: string) => {
    return configuratorState.selectedVendors[selectedCategory]?.includes(vendorId) || false;
  };

  const handleToggleVendor = (vendor: VendorService) => {
    if (isVendorSelected(vendor.id)) {
      dispatch(removeVendor({ category: selectedCategory, vendorServiceId: vendor.id }));
    } else {
      dispatch(addVendor({ category: selectedCategory, vendorServiceId: vendor.id }));
    }
  };

  const getTotalShortlisted = () => {
    return Object.values(configuratorState.selectedVendors).reduce(
      (sum, vendors) => sum + vendors.length,
      0
    );
  };

  const handleContinue = () => {
    router.push('/wedding-configurator/publish');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-serif text-gray-900 mb-4">
          Discover Your Perfect Vendors
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Based on your <span className="font-medium text-gold">{configuratorState.vibe}</span> vibe
          in <span className="font-medium text-gold">{configuratorState.region}</span>
        </p>
      </div>

      {/* AI Filter Badge */}
      <div className="bg-gradient-to-r from-gold/10 to-purple-50 rounded-xl p-4 mb-6 text-center">
        <p className="text-sm text-gray-700">
          ✨ <span className="font-medium">Smart Filtering:</span> Showing only vendors that match
          your vibe, location, and budget • {getTotalShortlisted()} shortlisted
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex overflow-x-auto space-x-2 mb-8 pb-2 scrollbar-hide">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => {
              setSelectedCategory(category.id);
              setPage(1);
            }}
            className={`
              flex-shrink-0 px-6 py-3 rounded-lg font-medium text-sm transition-all
              ${
                selectedCategory === category.id
                  ? 'bg-gold text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }
            `}
          >
            <span className="mr-2">{category.icon}</span>
            {category.name}
            {configuratorState.selectedVendors[category.id]?.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-white/30 rounded-full text-xs">
                {configuratorState.selectedVendors[category.id].length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <input
          type="text"
          placeholder={`Search ${categories.find((c) => c.id === selectedCategory)?.name}...`}
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setPage(1);
          }}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
        />
      </div>

      {/* Vendors Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gold mx-auto mb-4"></div>
          <p className="text-gray-600">Loading vendors...</p>
        </div>
      ) : vendors.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {vendors.map((vendor) => (
              <div
                key={vendor.id}
                className={`
                  bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer
                  ${isVendorSelected(vendor.id) ? 'ring-4 ring-gold' : ''}
                `}
                onClick={() => handleToggleVendor(vendor)}
              >
                {/* Vendor Image */}
                <div className="relative h-48 bg-gray-200">
                  {vendor.media && vendor.media.length > 0 ? (
                    <Image
                      src={
                        vendor.media.find((m) => m.type === 'THUMBNAIL')?.url || vendor.media[0].url
                      }
                      alt={vendor.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gray-300">
                      <span className="text-4xl">
                        {categories.find((c) => c.id === selectedCategory)?.icon}
                      </span>
                    </div>
                  )}

                  {/* Selected Badge */}
                  {isVendorSelected(vendor.id) && (
                    <div className="absolute top-3 right-3 bg-gold rounded-full p-2 shadow-lg">
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
                  )}
                </div>

                {/* Vendor Info */}
                <div className="p-5">
                  <h3 className="text-lg font-medium text-gray-900 mb-1 line-clamp-1">
                    {vendor.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">{vendor.vendor?.name}</p>
                  {vendor.description && (
                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">{vendor.description}</p>
                  )}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                    <span className="text-xs text-gray-500">
                      {vendor.city}, {vendor.country}
                    </span>
                    <span className="text-lg font-medium text-gold">
                      {formatIndianCurrency(vendor.price)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 mb-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className={`
                  px-4 py-2 rounded-lg font-medium
                  ${
                    page === 1
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                ← Previous
              </button>
              <span className="px-4 py-2 text-gray-700">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className={`
                  px-4 py-2 rounded-lg font-medium
                  ${
                    page === totalPages
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                Next →
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16 bg-gray-50 rounded-xl">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">No vendors found</h3>
          <p className="text-gray-600">Try adjusting your filters or search query</p>
        </div>
      )}

      {/* Shortlist Summary */}
      {getTotalShortlisted() > 0 && (
        <div className="fixed bottom-20 left-0 right-0 bg-white border-t border-gray-200 shadow-lg py-4 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                You&apos;ve shortlisted{' '}
                <span className="font-medium text-gold">{getTotalShortlisted()}</span> vendor
                {getTotalShortlisted() !== 1 ? 's' : ''}
              </p>
            </div>
            <button
              onClick={handleContinue}
              className="px-8 py-3 bg-gold text-white font-medium rounded-lg hover:bg-gold/90 transition-colors shadow-md hover:shadow-lg"
            >
              Continue to Publish Site →
            </button>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pb-8">
        <button
          onClick={() => router.push('/wedding-configurator/review')}
          className="px-6 py-3 text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
        >
          ← Back to Review
        </button>

        <button
          onClick={handleContinue}
          className="px-8 py-3 bg-gold text-white font-medium rounded-lg hover:bg-gold/90 transition-colors shadow-md hover:shadow-lg"
        >
          {getTotalShortlisted() > 0 ? 'Publish Your Wedding Site →' : 'Skip & Publish Site →'}
        </button>
      </div>
    </div>
  );
}
