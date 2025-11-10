'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/store';
import { formatIndianCurrency } from '@/services/api/configurator';
import { format } from 'date-fns';
import { getWeddingUrl, getShortDisplayUrl } from '@/lib/weddingUrl';

export default function ReviewPage() {
  const router = useRouter();
  const configuratorState = useAppSelector((state) => state.configurator);

  // Redirect if prerequisites not met
  useEffect(() => {
    if (!configuratorState.weddingPlanId || !configuratorState.vibe || !configuratorState.region) {
      router.push('/wedding-configurator/budget');
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleContinue = () => {
    router.push('/wedding-configurator/vendors');
  };

  const handleEdit = (step: string) => {
    router.push(`/wedding-configurator/${step}`);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not set';
    try {
      return format(new Date(dateString), 'MMMM d, yyyy');
    } catch {
      return dateString;
    }
  };

  const summaryItems = [
    {
      icon: '💑',
      label: 'Couple Names',
      value: configuratorState.coupleNames,
      editStep: 'welcome',
    },
    {
      icon: '📅',
      label: 'Wedding Date',
      value: configuratorState.weddingEndDate
        ? `${formatDate(configuratorState.weddingStartDate)} - ${formatDate(configuratorState.weddingEndDate)}`
        : formatDate(configuratorState.weddingStartDate),
      editStep: 'welcome',
    },
    {
      icon: '👥',
      label: 'Guest Count',
      value: `${configuratorState.guests} guests`,
      editStep: 'welcome',
    },
    {
      icon: '🏠',
      label: 'Based In',
      value: configuratorState.baseLocation || 'Not specified',
      editStep: 'welcome',
    },
    {
      icon: '✨',
      label: 'Wedding Vibe',
      value: configuratorState.vibe,
      editStep: 'vibe',
    },
    {
      icon: '🌍',
      label: 'Region',
      value: configuratorState.region,
      editStep: 'location',
    },
    {
      icon: '💰',
      label: 'Budget Range',
      value:
        configuratorState.budgetMax > 0
          ? `${formatIndianCurrency(configuratorState.budgetMin || 0)} - ${formatIndianCurrency(configuratorState.budgetMax)}`
          : 'Flexible budget',
      editStep: 'budget',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-serif text-gray-900 mb-4">
          Here&apos;s Your Starting Wedding Plan
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Review your selections below. Everything looks good? Let&apos;s move on to finding the
          perfect vendors for your dream wedding.
        </p>
      </div>

      {/* Summary Card */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-gold to-purple-600 p-8 text-white text-center">
          <h2 className="text-3xl font-serif mb-2">{configuratorState.coupleNames}</h2>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 mt-3 mb-4 inline-block">
            <p className="text-xs text-white/70 mb-1">🌐 Your Wedding Website</p>
            <a
              href={getWeddingUrl(configuratorState.subdomain || '')}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm md:text-base font-medium text-white hover:text-white/80 transition-colors break-all"
            >
              {getShortDisplayUrl(configuratorState.subdomain || '')}
            </a>
          </div>
          <div className="mt-2 inline-block px-4 py-2 bg-white/20 rounded-full text-sm">
            📅 {formatDate(configuratorState.weddingStartDate)}
          </div>
        </div>

        {/* Details Section */}
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {summaryItems.map((item, index) => (
              <div
                key={index}
                className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="text-3xl flex-shrink-0">{item.icon}</div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">{item.label}</p>
                  <p className="text-lg font-medium text-gray-900">{item.value}</p>
                </div>
                <button
                  onClick={() => handleEdit(item.editStep)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-gold hover:text-gold/80 text-sm font-medium"
                >
                  Edit
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Budget Allocation Preview */}
        {configuratorState.budgetAllocation && configuratorState.budgetMax > 0 && (
          <div className="px-8 pb-8">
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Budget Breakdown</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl mb-1">🏰</div>
                  <p className="text-xs text-gray-600 mb-1">Venue</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatIndianCurrency(configuratorState.budgetAllocation.venue)}
                  </p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl mb-1">🍽️</div>
                  <p className="text-xs text-gray-600 mb-1">Catering</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatIndianCurrency(configuratorState.budgetAllocation.catering)}
                  </p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl mb-1">🌸</div>
                  <p className="text-xs text-gray-600 mb-1">Decoration</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatIndianCurrency(configuratorState.budgetAllocation.decoration)}
                  </p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl mb-1">📸</div>
                  <p className="text-xs text-gray-600 mb-1">Photography</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatIndianCurrency(configuratorState.budgetAllocation.photography)}
                  </p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl mb-1">🎵</div>
                  <p className="text-xs text-gray-600 mb-1">Entertainment</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatIndianCurrency(configuratorState.budgetAllocation.entertainment)}
                  </p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl mb-1">✨</div>
                  <p className="text-xs text-gray-600 mb-1">Other</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatIndianCurrency(configuratorState.budgetAllocation.other)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* What's Next Section */}
      <div className="bg-gradient-to-r from-gold/10 to-purple-50 rounded-2xl p-8 mb-8 border border-gold/20">
        <h3 className="text-2xl font-serif text-gray-900 mb-4 text-center">What Happens Next?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-4xl mb-3">🏰</div>
            <h4 className="font-medium text-gray-900 mb-2">Discover Vendors</h4>
            <p className="text-sm text-gray-600">
              Browse curated vendors matching your vibe, region, and budget
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-3">💾</div>
            <h4 className="font-medium text-gray-900 mb-2">Save & Compare</h4>
            <p className="text-sm text-gray-600">
              Shortlist your favorites and compare options side-by-side
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-3">🌐</div>
            <h4 className="font-medium text-gray-900 mb-2">Publish Website</h4>
            <p className="text-sm text-gray-600">
              Create your wedding website and share with guests
            </p>
          </div>
        </div>
      </div>

      {/* AI Suggestion */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
        <div className="flex items-start space-x-3">
          <div className="text-2xl">🤖</div>
          <div className="flex-1">
            <h4 className="font-medium text-gray-900 mb-2">AI Recommendations Ready</h4>
            <p className="text-sm text-gray-700">
              Based on your selections, we&apos;ve filtered{' '}
              <strong>{configuratorState.vibe}</strong> style vendors in{' '}
              <strong>{configuratorState.region}</strong> within your budget range. You&apos;ll only
              see options that perfectly match your vision!
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pb-8">
        <button
          onClick={() => router.push('/wedding-configurator/budget')}
          className="px-6 py-3 text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
        >
          ← Back to Budget
        </button>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push('/wedding-configurator/welcome')}
            className="px-6 py-3 text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Start Over
          </button>
          <button
            onClick={handleContinue}
            className="px-8 py-3 bg-gold text-white font-medium rounded-lg hover:bg-gold/90 transition-colors shadow-md hover:shadow-lg"
          >
            Discover Vendors →
          </button>
        </div>
      </div>
    </div>
  );
}
