'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/store';
import { setBasicInfo, setWeddingPlanId } from '@/store/slices/configurator';
import { createGuestWeddingPlan } from '@/services/api/configurator';
import { SUBDOMAIN_CONFIG } from '@/lib/constant';

export default function WelcomePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const configuratorState = useAppSelector((state) => state.configurator);

  // Parse existing couple names if coming back to edit
  const parseExistingNames = () => {
    if (configuratorState.coupleNames) {
      const names = configuratorState.coupleNames.split(' & ');
      return {
        person1Name: names[0] || '',
        person2Name: names[1] || '',
      };
    }
    return { person1Name: '', person2Name: '' };
  };

  const existingNames = parseExistingNames();

  const [formData, setFormData] = useState({
    person1Name: existingNames.person1Name,
    person2Name: existingNames.person2Name,
    weddingStartDate: configuratorState.weddingStartDate || '',
    weddingEndDate: configuratorState.weddingEndDate || '',
    guests: configuratorState.guests || 100,
    baseLocation: configuratorState.baseLocation || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.person1Name.trim()) {
      newErrors.person1Name = 'Please enter first person name';
    }

    if (!formData.person2Name.trim()) {
      newErrors.person2Name = 'Please enter second person name';
    }

    if (!formData.weddingStartDate) {
      newErrors.weddingStartDate = 'Please select wedding start date';
    }

    if (formData.guests < 10) {
      newErrors.guests = 'Guest count must be at least 10';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Merge names with " & " separator for display
      const coupleNames = `${formData.person1Name.trim()} & ${formData.person2Name.trim()}`;

      // Save to Redux first
      dispatch(
        setBasicInfo({
          coupleNames,
          weddingStartDate: formData.weddingStartDate,
          weddingEndDate: formData.weddingEndDate,
          guests: formData.guests,
          baseLocation: formData.baseLocation,
        })
      );

      // 💡 CLIENT REQUIREMENT: Auto-generate wedding instance in DB when "Next" is clicked
      // Backend will create subdomain by slugifying each name and joining with "-"
      const response = await createGuestWeddingPlan({
        person1Name: formData.person1Name.trim(),
        person2Name: formData.person2Name.trim(),
        weddingStartDate: formData.weddingStartDate,
        weddingEndDate: formData.weddingEndDate,
        guests: formData.guests,
        baseLocation: formData.baseLocation,
      });

      // Save wedding plan ID to Redux
      if (response.data?.weddingPlan) {
        dispatch(
          setWeddingPlanId({
            weddingPlanId: response.data.weddingPlan.id,
            subdomain: response.data.weddingPlan.subdomain,
            guestSessionToken: response.data.weddingPlan.guestSessionToken,
          })
        );

        // Store subdomain in localStorage for easy access
        localStorage.setItem('weddingSubdomain', response.data.weddingPlan.subdomain);
        localStorage.setItem('weddingPlanId', response.data.weddingPlan.id);
      }

      // Navigate to Step 2
      router.push('/wedding-configurator/vibe');
    } catch (error: any) {
      console.error('Error creating wedding plan:', error);
      setErrors({
        submit: error.response?.data?.message || 'Failed to create wedding plan. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const guestOptions = [
    { value: 50, label: '50 or fewer' },
    { value: 100, label: '50-100 guests' },
    { value: 200, label: '100-200 guests' },
    { value: 300, label: '200-300 guests' },
    { value: 500, label: '300-500 guests' },
    { value: 1000, label: '500+ guests' },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-serif text-gray-900 mb-4">
          Let&apos;s Start Building Your Wedding
        </h1>
        <p className="text-lg text-gray-600">
          We&apos;ll guide you through creating your dream wedding in just a few steps
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Couple Names - Separate Fields */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Couple Names <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <input
                  type="text"
                  id="person1Name"
                  placeholder="First person name (e.g., Rahul)"
                  value={formData.person1Name}
                  onChange={(e) => setFormData({ ...formData, person1Name: e.target.value })}
                  className={`
                    w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent
                    ${errors.person1Name ? 'border-red-500' : 'border-gray-300'}
                  `}
                />
                {errors.person1Name && (
                  <p className="mt-1 text-sm text-red-500">{errors.person1Name}</p>
                )}
              </div>
              <div>
                <input
                  type="text"
                  id="person2Name"
                  placeholder="Second person name (e.g., Anjali)"
                  value={formData.person2Name}
                  onChange={(e) => setFormData({ ...formData, person2Name: e.target.value })}
                  className={`
                    w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent
                    ${errors.person2Name ? 'border-red-500' : 'border-gray-300'}
                  `}
                />
                {errors.person2Name && (
                  <p className="mt-1 text-sm text-red-500">{errors.person2Name}</p>
                )}
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              💡 These names will be used for your wedding website URL
            </p>
          </div>

          {/* Wedding Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="weddingStartDate"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Wedding Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="weddingStartDate"
                value={formData.weddingStartDate}
                onChange={(e) => setFormData({ ...formData, weddingStartDate: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                className={`
                  w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent
                  ${errors.weddingStartDate ? 'border-red-500' : 'border-gray-300'}
                `}
              />
              {errors.weddingStartDate && (
                <p className="mt-1 text-sm text-red-500">{errors.weddingStartDate}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="weddingEndDate"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Wedding End Date (Optional)
              </label>
              <input
                type="date"
                id="weddingEndDate"
                value={formData.weddingEndDate}
                onChange={(e) => setFormData({ ...formData, weddingEndDate: e.target.value })}
                min={formData.weddingStartDate || new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
              />
              <p className="mt-1 text-sm text-gray-500">For multi-day celebrations</p>
            </div>
          </div>

          {/* Guest Count */}
          <div>
            <label htmlFor="guests" className="block text-sm font-medium text-gray-700 mb-2">
              Expected Guest Count <span className="text-red-500">*</span>
            </label>
            <select
              id="guests"
              value={formData.guests}
              onChange={(e) => setFormData({ ...formData, guests: Number(e.target.value) })}
              className={`
                w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent
                ${errors.guests ? 'border-red-500' : 'border-gray-300'}
              `}
            >
              {guestOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.guests && <p className="mt-1 text-sm text-red-500">{errors.guests}</p>}
          </div>

          {/* Base Location */}
          <div>
            <label htmlFor="baseLocation" className="block text-sm font-medium text-gray-700 mb-2">
              Where are you based? (Optional)
            </label>
            <input
              type="text"
              id="baseLocation"
              placeholder="e.g., Mumbai, India"
              value={formData.baseLocation}
              onChange={(e) => setFormData({ ...formData, baseLocation: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
            />
            <p className="mt-1 text-sm text-gray-500">
              Helps us recommend venues and vendors near you
            </p>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              {errors.submit}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-between items-center pt-6">
            <div className="text-sm text-gray-500">
              Step 1 of 7 • Creating your wedding in database...
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`
                px-8 py-3 bg-gold text-white font-medium rounded-lg transition-colors shadow-md hover:shadow-lg
                ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gold/90'}
              `}
            >
              {loading ? (
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
                  Creating your wedding...
                </span>
              ) : (
                'Next: Choose Your Vibe →'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Preview Card */}
      {formData.person1Name && formData.person2Name && (
        <div className="mt-8 bg-gradient-to-r from-gold/10 to-purple-100 rounded-xl p-6 text-center">
          <div className="bg-white rounded-lg p-3 border border-gold/20">
            <p className="text-xs text-gray-500 mb-1">Your Wedding Website URL:</p>
            <code className="text-sm text-gold font-mono">
              {SUBDOMAIN_CONFIG.generateSubdomainUrl(formData.person1Name, formData.person2Name)}
            </code>
          </div>
        </div>
      )}
    </div>
  );
}
