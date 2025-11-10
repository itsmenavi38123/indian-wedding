'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import axios from 'axios';
import { API_BASE_URL, SUBDOMAIN_CONFIG } from '@/lib/constant';

interface WeddingDetails {
  id: string;
  coupleNames: string;
  subdomain: string;
  weddingStartDate: string | null;
  weddingEndDate: string | null;
  guests: number;
  vibe: string | null;
  region: string | null;
  siteCoverPhoto: string | null;
  siteThemeColor: string;
  siteIntroMessage: string | null;
  sitePublished: boolean;
}

export default function WeddingSitePage() {
  const params = useParams();
  const router = useRouter();
  const subdomain = params.subdomain as string;

  const [weddingData, setWeddingData] = useState<WeddingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [unpublishedMessage, setUnpublishedMessage] = useState('');
  const [unpublishedCoupleNames, setUnpublishedCoupleNames] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  const [editForm, setEditForm] = useState({
    person1Name: '',
    person2Name: '',
    weddingStartDate: '',
    weddingEndDate: '',
    guests: 100,
  });

  useEffect(() => {
    fetchWeddingData();
    checkOwnership();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subdomain]);

  const checkOwnership = () => {
    // Check if user created this wedding (stored in localStorage)
    const storedSubdomain = localStorage.getItem('weddingSubdomain');
    const storedWeddingPlanId = localStorage.getItem('weddingPlanId');

    // User is owner if their stored subdomain matches current subdomain
    if (storedSubdomain === subdomain && storedWeddingPlanId) {
      setIsOwner(true);
    } else {
      setIsOwner(false);
    }
  };

  const fetchWeddingData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/configurator/wedding-site/${subdomain}`);

      // Check if wedding is published
      if (response.data?.data?.published === false) {
        // Wedding exists but not published
        setIsPublished(false);
        setUnpublishedMessage(
          response.data.data.message || 'This wedding has not been published yet.'
        );
        setUnpublishedCoupleNames(response.data.data.coupleNames || '');
        return;
      }

      if (response.data?.data?.weddingSite) {
        const site = response.data.data.weddingSite;
        setIsPublished(true);
        setWeddingData({
          ...site,
          id: site.id || '',
          subdomain: subdomain,
        });

        // Parse couple names for editing
        if (site.coupleNames) {
          const names = site.coupleNames.split(' & ');
          setEditForm({
            person1Name: names[0] || '',
            person2Name: names[1] || '',
            weddingStartDate: site.dates?.start || '',
            weddingEndDate: site.dates?.end || '',
            guests: site.guests || 100,
          });
        }
      }
    } catch (err: any) {
      setError(
        err.response?.data?.errorMessage ||
          err.response?.data?.message ||
          'Wedding website not found'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDetails = async () => {
    // Only allow owner to edit
    if (!isOwner) {
      setError('You do not have permission to edit this wedding');
      return;
    }

    try {
      setLoading(true);
      const weddingPlanId = localStorage.getItem('weddingPlanId');

      if (!weddingPlanId) {
        setError('Session not found. Please start from the beginning.');
        return;
      }

      await axios.put(`${API_BASE_URL}/configurator/guest/update/${weddingPlanId}`, {
        person1Name: editForm.person1Name,
        person2Name: editForm.person2Name,
        weddingStartDate: editForm.weddingStartDate,
        weddingEndDate: editForm.weddingEndDate,
        guests: editForm.guests,
      });

      setEditMode(false);
      fetchWeddingData();
      alert('Wedding details updated successfully! ✨');
    } catch {
      setError('Failed to update details');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    // Only allow owner to delete
    if (!isOwner) {
      setError('You do not have permission to delete this wedding');
      return;
    }

    try {
      setLoading(true);
      const weddingPlanId = localStorage.getItem('weddingPlanId');

      if (!weddingPlanId) {
        setError('Session not found');
        return;
      }

      await axios.delete(`${API_BASE_URL}/configurator/guest/delete/${weddingPlanId}`);

      // Clear local storage
      localStorage.removeItem('weddingPlanId');
      localStorage.removeItem('guestSessionToken');
      localStorage.removeItem('weddingSubdomain');

      // Redirect to home
      alert('Wedding account deleted successfully');
      router.push('/');
    } catch {
      setError('Failed to delete account');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gold mx-auto mb-4"></div>
          <p className="text-gray-600">Loading wedding website...</p>
        </div>
      </div>
    );
  }

  // Show unpublished wedding message
  if (!isPublished && unpublishedMessage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-purple-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="text-6xl mb-4">🏗️</div>
          <h1 className="text-2xl font-serif text-gray-900 mb-4">
            Wedding Website Not Published Yet
          </h1>
          {unpublishedCoupleNames && (
            <p className="text-lg font-medium text-gold mb-3">{unpublishedCoupleNames}</p>
          )}
          <p className="text-gray-600 mb-6">{unpublishedMessage}</p>
          <div className="flex flex-col gap-3">
            {isOwner ? (
              <button
                onClick={() => router.push('/wedding-configurator/welcome')}
                className="px-6 py-3 bg-gold text-white rounded-lg hover:bg-gold/90 transition-colors font-medium"
              >
                Continue Planning Your Wedding →
              </button>
            ) : (
              <p className="text-sm text-gray-500">
                This wedding is still being planned by the couple.
              </p>
            )}
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Go to Homepage
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show wedding not found error
  if (error || !weddingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-purple-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="text-6xl mb-4">💔</div>
          <h1 className="text-2xl font-serif text-gray-900 mb-4">Wedding Website Not Found</h1>
          <p className="text-gray-600 mb-6">
            {error || 'This wedding website does not exist or has been removed.'}
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-gold text-white rounded-lg hover:bg-gold/90 transition-colors"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  const themeColor = weddingData.siteThemeColor || '#ad8b3a';

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50"
      style={{
        background: `linear-gradient(to bottom right, ${themeColor}10, white, ${themeColor}10)`,
      }}
    >
      {/* Hero Section */}
      <div className="relative h-[60vh] min-h-[400px]">
        {weddingData.siteCoverPhoto ? (
          <Image
            src={weddingData.siteCoverPhoto}
            alt="Wedding Cover"
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ backgroundColor: themeColor }}
          >
            <div className="text-center text-white">
              <h1 className="text-6xl font-serif mb-4">💍</h1>
              <p className="text-2xl">Welcome to Our Wedding</p>
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="text-5xl md:text-7xl font-serif mb-4">{weddingData.coupleNames}</h1>
            {weddingData.weddingStartDate && (
              <p className="text-xl md:text-2xl">
                {new Date(weddingData.weddingStartDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Introduction Message */}
        {weddingData.siteIntroMessage && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 text-center">
            <p className="text-lg text-gray-700 leading-relaxed italic">
              &ldquo;{weddingData.siteIntroMessage}&rdquo;
            </p>
          </div>
        )}

        {/* Wedding Details Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-serif text-gray-900">Wedding Details</h2>
            {isOwner && (
              <button
                onClick={() => setEditMode(!editMode)}
                className="px-4 py-2 text-sm border-2 border-gold text-gold rounded-lg hover:bg-gold hover:text-white transition-colors"
              >
                {editMode ? 'Cancel' : '✏️ Edit'}
              </button>
            )}
            {!isOwner && (
              <span className="px-4 py-2 text-sm bg-gray-100 text-gray-500 rounded-lg">
                👁️ View Only
              </span>
            )}
          </div>

          {!editMode ? (
            <div className="space-y-4">
              <div className="flex items-start">
                <span className="text-2xl mr-3">💑</span>
                <div>
                  <p className="text-sm text-gray-500">Couple</p>
                  <p className="text-lg font-medium text-gray-900">{weddingData.coupleNames}</p>
                </div>
              </div>

              {weddingData.weddingStartDate && (
                <div className="flex items-start">
                  <span className="text-2xl mr-3">📅</span>
                  <div>
                    <p className="text-sm text-gray-500">Wedding Date</p>
                    <p className="text-lg font-medium text-gray-900">
                      {new Date(weddingData.weddingStartDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                      {weddingData.weddingEndDate &&
                        weddingData.weddingEndDate !== weddingData.weddingStartDate && (
                          <>
                            {' '}
                            -{' '}
                            {new Date(weddingData.weddingEndDate).toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric',
                            })}
                          </>
                        )}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-start">
                <span className="text-2xl mr-3">👥</span>
                <div>
                  <p className="text-sm text-gray-500">Expected Guests</p>
                  <p className="text-lg font-medium text-gray-900">{weddingData.guests} guests</p>
                </div>
              </div>

              {weddingData.vibe && (
                <div className="flex items-start">
                  <span className="text-2xl mr-3">✨</span>
                  <div>
                    <p className="text-sm text-gray-500">Wedding Vibe</p>
                    <p className="text-lg font-medium text-gray-900">{weddingData.vibe}</p>
                  </div>
                </div>
              )}

              {weddingData.region && (
                <div className="flex items-start">
                  <span className="text-2xl mr-3">🌍</span>
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="text-lg font-medium text-gray-900">{weddingData.region}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start">
                <span className="text-2xl mr-3">🌐</span>
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Wedding Website</p>
                  <p className="text-lg font-medium mb-2" style={{ color: themeColor }}>
                    {subdomain}.indianweddings.com
                  </p>
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">Access your site at:</p>
                    <code className="text-sm text-gray-900 font-mono block">
                      {SUBDOMAIN_CONFIG.protocol}://{subdomain}.{SUBDOMAIN_CONFIG.baseDomain}:
                      {SUBDOMAIN_CONFIG.port}
                    </code>
                    <button
                      onClick={() => {
                        const url = `${SUBDOMAIN_CONFIG.protocol}://${subdomain}.${SUBDOMAIN_CONFIG.baseDomain}:${SUBDOMAIN_CONFIG.port}`;
                        navigator.clipboard.writeText(url);
                        alert('URL copied to clipboard!');
                      }}
                      className="mt-2 text-xs text-gold hover:text-gold/80 underline"
                    >
                      📋 Copy URL
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Person Name
                  </label>
                  <input
                    type="text"
                    value={editForm.person1Name}
                    onChange={(e) => setEditForm({ ...editForm, person1Name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Second Person Name
                  </label>
                  <input
                    type="text"
                    value={editForm.person2Name}
                    onChange={(e) => setEditForm({ ...editForm, person2Name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={editForm.weddingStartDate}
                    onChange={(e) => setEditForm({ ...editForm, weddingStartDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={editForm.weddingEndDate}
                    onChange={(e) => setEditForm({ ...editForm, weddingEndDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Guests
                </label>
                <input
                  type="number"
                  value={editForm.guests}
                  onChange={(e) => setEditForm({ ...editForm, guests: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                />
              </div>

              <button
                onClick={handleUpdateDetails}
                disabled={loading}
                className="w-full py-3 bg-gold text-white rounded-lg hover:bg-gold/90 transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>

        {/* Delete Account Section - Only for Owner */}
        {isOwner && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6">
            <h3 className="text-lg font-medium text-red-900 mb-2">Delete Wedding Account</h3>
            <p className="text-sm text-red-700 mb-4">
              This will permanently delete your wedding website and all associated data. This action
              cannot be undone.
            </p>

            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete My Account
              </button>
            ) : (
              <div className="space-y-3">
                <p className="font-medium text-red-900">Are you absolutely sure?</p>
                <div className="flex space-x-3">
                  <button
                    onClick={handleDeleteAccount}
                    disabled={loading}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Deleting...' : 'Yes, Delete Forever'}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Public View Notice */}
        {!isOwner && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 text-center">
            <p className="text-sm text-blue-700">
              💍 You&apos;re viewing this wedding website as a guest. Only the couple who created
              this can edit or manage the details.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
