'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/store';
import {
  setSiteCustomization,
  setWeddingPlanClaimed,
  resetConfigurator,
} from '@/store/slices/configurator';
import { claimWeddingPlan, publishWeddingSite } from '@/services/api/configurator';
import { getWeddingUrl, getShortDisplayUrl } from '@/lib/weddingUrl';

// Helper to check if user is logged in (from cookies/localStorage)
const isUserLoggedIn = (): boolean => {
  if (typeof window === 'undefined') return false;

  // Check if user data exists in localStorage
  const userData = localStorage.getItem('user');
  if (!userData) return false;

  // Check if access token cookie exists
  const hasAccessToken = document.cookie.includes('accessToken=');
  return hasAccessToken;
};

// Helper to get access token from cookies
const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null;

  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'accessToken') {
      return value;
    }
  }
  return null;
};

export default function PublishPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const configuratorState = useAppSelector((state) => state.configurator);

  const [step, setStep] = useState<'login' | 'customize' | 'publishing'>('login');

  // Site customization
  const [coverPhoto, setCoverPhoto] = useState(configuratorState.siteCoverPhoto || '');
  const [themeColor, setThemeColor] = useState(configuratorState.siteThemeColor || '#ad8b3a');
  const [introMessage, setIntroMessage] = useState(configuratorState.siteIntroMessage || '');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [publishedUrl, setPublishedUrl] = useState('');

  // Redirect if prerequisites not met
  useEffect(() => {
    if (!configuratorState.weddingPlanId) {
      router.push('/wedding-configurator/vendors');
      return;
    }

    // Check if user is logged in from cookies/localStorage
    if (isUserLoggedIn()) {
      // If logged in but plan not claimed yet, auto-claim it
      if (!configuratorState.wizardCompleted) {
        handleClaimPlan();
      } else {
        setStep('customize');
      }
    } else {
      setStep('login');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configuratorState.weddingPlanId, router]);

  const handleLogin = () => {
    // Redirect to login page with redirect parameter
    router.push('/user/login?redirect=/wedding-configurator/publish');
  };

  const handleSignup = () => {
    // Redirect to signup page
    router.push('/user/signup');
  };

  const handleClaimPlan = async () => {
    const accessToken = getAccessToken();
    if (!accessToken || !configuratorState.weddingPlanId) {
      setError('Please login first');
      return;
    }

    setLoading(true);
    try {
      const response = await claimWeddingPlan(configuratorState.weddingPlanId, accessToken);

      if (response.data?.weddingPlan) {
        dispatch(
          setWeddingPlanClaimed({
            weddingPlanId: response.data.weddingPlan.id,
            subdomain: response.data.weddingPlan.subdomain,
          })
        );
        setStep('customize');
      }
    } catch (err: any) {
      setError('Failed to claim wedding plan. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    const accessToken = getAccessToken();
    if (!accessToken || !configuratorState.weddingPlanId) {
      setError('Please login first');
      return;
    }

    setLoading(true);
    setStep('publishing');

    try {
      // Save customization to Redux
      dispatch(
        setSiteCustomization({
          coverPhoto,
          themeColor,
          introMessage,
        })
      );

      // Publish site
      const response = await publishWeddingSite(
        {
          weddingPlanId: configuratorState.weddingPlanId,
          siteCoverPhoto: coverPhoto,
          siteThemeColor: themeColor,
          siteIntroMessage: introMessage,
        },
        accessToken
      );

      if (response.data?.siteUrl) {
        setPublishedUrl(response.data.siteUrl);
        // Success! Show success screen
      }
    } catch (err: any) {
      setError('Failed to publish site. Please try again.');
      console.error(err);
      setStep('customize');
    } finally {
      setLoading(false);
    }
  };

  const handleViewSite = () => {
    if (publishedUrl) {
      window.open(publishedUrl, '_blank');
    }
  };

  const handleGoToDashboard = () => {
    // Reset configurator state
    dispatch(resetConfigurator());
    router.push('/dashboard');
  };

  // Step 1: Login Required
  if (step === 'login') {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif text-gray-900 mb-4">
            Almost There! Create Your Account
          </h1>
          <p className="text-lg text-gray-600">
            Sign up to claim your wedding plan and publish your website
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-serif text-gray-900 mb-2">Your Wedding Plan is Ready!</h2>
            <p className="text-gray-600">
              You&apos;ve completed the configuration for{' '}
              <strong>{configuratorState.coupleNames}</strong>
            </p>
          </div>

          <div className="bg-gradient-to-r from-gold/10 to-purple-50 rounded-xl p-6 mb-8">
            <h3 className="font-medium text-gray-900 mb-3">What you&apos;ve created:</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center">
                <span className="mr-2">✓</span>
                Wedding vibe: {configuratorState.vibe}
              </li>
              <li className="flex items-center">
                <span className="mr-2">✓</span>
                Location: {configuratorState.region}
              </li>
              <li className="flex items-center">
                <span className="mr-2">✓</span>
                Budget plan: Set and allocated
              </li>
              <li className="flex items-center">
                <span className="mr-2">✓</span>
                Vendors: Explored and shortlisted
              </li>
              <li className="flex items-center">
                <span className="mr-2">✓</span>
                Website URL:{' '}
                <a
                  href={getWeddingUrl(configuratorState.subdomain || '')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gold hover:text-gold/80 underline ml-1"
                >
                  {getShortDisplayUrl(configuratorState.subdomain || '')}
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleSignup}
              className="w-full px-8 py-4 bg-gold text-white font-medium rounded-lg hover:bg-gold/90 transition-colors shadow-md hover:shadow-lg text-lg"
            >
              Create Free Account →
            </button>

            <button
              onClick={handleLogin}
              className="w-full px-8 py-4 bg-white text-gray-700 font-medium rounded-lg border-2 border-gray-300 hover:bg-gray-50 transition-colors"
            >
              I Already Have an Account
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center mt-6">
            By creating an account, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    );
  }

  // Step 2: Customize Site
  if (step === 'customize') {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif text-gray-900 mb-4">
            Customize Your Wedding Website
          </h1>
          <p className="text-lg text-gray-600">
            Make it uniquely yours with a cover photo, theme color, and welcome message
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          {/* Cover Photo */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cover Photo (Optional)
            </label>
            <input
              type="url"
              placeholder="https://example.com/your-photo.jpg"
              value={coverPhoto}
              onChange={(e) => setCoverPhoto(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
            />
            <p className="mt-1 text-sm text-gray-500">Enter a URL to your favorite couple photo</p>
          </div>

          {/* Theme Color */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">Theme Color</label>
            <div className="flex items-center space-x-4">
              <input
                type="color"
                value={themeColor}
                onChange={(e) => setThemeColor(e.target.value)}
                className="w-20 h-12 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={themeColor}
                onChange={(e) => setThemeColor(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
              />
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Choose a color that represents your wedding theme
            </p>
          </div>

          {/* Intro Message */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Welcome Message (Optional)
            </label>
            <textarea
              rows={4}
              placeholder="Welcome to our wedding celebration! We're so excited to share this special day with you..."
              value={introMessage}
              onChange={(e) => setIntroMessage(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
            />
            <p className="mt-1 text-sm text-gray-500">A personal message for your guests</p>
          </div>

          {/* Preview */}
          <div className="mb-8 p-6 bg-gray-50 rounded-xl">
            <h3 className="text-sm font-medium text-gray-700 mb-4">Preview</h3>
            <div
              className="rounded-lg p-8 text-white text-center"
              style={{ backgroundColor: themeColor }}
            >
              <h2 className="text-3xl font-serif mb-2">{configuratorState.coupleNames}</h2>
              <a
                href={getWeddingUrl(configuratorState.subdomain || '')}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/90 hover:text-white transition-colors"
              >
                {getShortDisplayUrl(configuratorState.subdomain || '')}
              </a>
              {introMessage && (
                <p className="mt-4 text-sm text-white/80 max-w-md mx-auto">{introMessage}</p>
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center pb-8">
          <button
            onClick={() => router.push('/wedding-configurator/vendors')}
            className="px-6 py-3 text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            ← Back
          </button>

          <button
            onClick={handlePublish}
            disabled={loading}
            className={`
              px-8 py-3 font-medium rounded-lg transition-colors shadow-md
              ${
                !loading
                  ? 'bg-gold text-white hover:bg-gold/90 hover:shadow-lg'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            {loading ? 'Publishing...' : 'Publish My Wedding Website 🚀'}
          </button>
        </div>
      </div>
    );
  }

  // Step 3: Publishing/Success
  if (step === 'publishing' && publishedUrl) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="text-8xl mb-6">🎉</div>
          <h1 className="text-4xl md:text-5xl font-serif text-gray-900 mb-4">Congratulations!</h1>
          <p className="text-lg text-gray-600">
            Your wedding website is now live and ready to share
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-serif text-gray-900 mb-4">🌐 Your Wedding Website URL</h2>
            <div className="bg-gradient-to-r from-gold/10 to-purple-50 rounded-xl p-6 mb-6">
              <a
                href={publishedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xl md:text-2xl font-medium text-gold hover:text-gold/80 transition-colors break-all block"
              >
                {publishedUrl}
              </a>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={publishedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3 bg-gold text-white font-medium rounded-lg hover:bg-gold/90 transition-colors shadow-md hover:shadow-lg inline-flex items-center justify-center"
              >
                🔗 View Your Website →
              </a>
              <button
                onClick={handleGoToDashboard}
                className="px-8 py-3 bg-white text-gray-700 font-medium rounded-lg border-2 border-gray-300 hover:bg-gray-50 transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">What&apos;s Next?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4">
                <div className="text-3xl mb-2">📧</div>
                <h4 className="font-medium text-gray-900 mb-1">Invite Guests</h4>
                <p className="text-sm text-gray-600">Share your website URL with guests</p>
              </div>
              <div className="text-center p-4">
                <div className="text-3xl mb-2">📅</div>
                <h4 className="font-medium text-gray-900 mb-1">Plan Timeline</h4>
                <p className="text-sm text-gray-600">Create your wedding day schedule</p>
              </div>
              <div className="text-center p-4">
                <div className="text-3xl mb-2">💍</div>
                <h4 className="font-medium text-gray-900 mb-1">Book Vendors</h4>
                <p className="text-sm text-gray-600">Contact your shortlisted vendors</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gold mx-auto mb-4"></div>
        <p className="text-gray-600">Setting up your wedding website...</p>
      </div>
    </div>
  );
}
