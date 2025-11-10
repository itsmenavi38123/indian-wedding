import axios from 'axios';
import { API_BASE_URL } from '@/lib/constant';

export interface WeddingVibe {
  id: string;
  name: string;
  tagline: string;
  description: string;
  image: string;
  order: number;
  isActive: boolean;
}

export interface Region {
  id: string;
  name: string;
  icon: string;
  popularCities: string[];
}

export interface Venue {
  id: string;
  name: string;
  location: string;
  description: string;
  capacity: string;
  basePrice: number;
  images: string[];
  country: string;
  state: string;
  city: string;
}

export interface VendorService {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  country: string;
  city: string;
  vendor: {
    id: string;
    name: string;
    email: string;
  };
  media: Array<{
    id: string;
    type: string;
    url: string;
  }>;
}

export interface WeddingPlan {
  id: string;
  coupleNames: string;
  subdomain: string;
  wizardCompleted: boolean;
}

// ================= PUBLIC APIS (GUEST MODE) =================

/**
 * Get all wedding vibes
 */
export const getVibes = async (params?: { search?: string; page?: number; limit?: number }) => {
  const response = await axios.get(`${API_BASE_URL}/configurator/vibes`, { params });
  return response.data;
};

/**
 * Get regions filtered by vibe
 */
export const getRegions = async (params?: { vibe?: string; search?: string }) => {
  const response = await axios.get(`${API_BASE_URL}/configurator/regions`, { params });
  return response.data;
};

/**
 * Get venues by region
 */
export const getVenuesByRegion = async (
  region: string,
  params?: {
    budgetMax?: number;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
  }
) => {
  const response = await axios.get(`${API_BASE_URL}/configurator/venues/${region}`, { params });
  return response.data;
};

/**
 * Get vendors with filters
 */
export const getVendors = async (params?: {
  category?: string;
  region?: string;
  budgetMax?: number;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
}) => {
  const response = await axios.get(`${API_BASE_URL}/configurator/vendors`, { params });
  return response.data;
};

/**
 * Get public wedding site by subdomain
 */
export const getPublicSite = async (subdomain: string) => {
  const response = await axios.get(`${API_BASE_URL}/configurator/wedding-site/${subdomain}`);
  return response.data;
};

// ================= GUEST MODE APIS (NO AUTH REQUIRED) =================

/**
 * Create guest wedding plan (Step 1 - as soon as "Next" is clicked)
 */
export const createGuestWeddingPlan = async (data: {
  person1Name: string;
  person2Name: string;
  weddingStartDate?: string;
  weddingEndDate?: string;
  guests?: number;
  baseLocation?: string;
}) => {
  const response = await axios.post(`${API_BASE_URL}/configurator/guest/create`, data);
  return response.data;
};

/**
 * Update guest wedding plan as they progress through steps
 */
export const updateGuestWeddingPlan = async (
  weddingPlanId: string,
  data: {
    vibe?: string;
    region?: string;
    budgetMin?: number;
    budgetMax?: number;
    wizardStep?: number;
    siteCoverPhoto?: string;
    siteThemeColor?: string;
    siteIntroMessage?: string;
  }
) => {
  const response = await axios.put(
    `${API_BASE_URL}/configurator/guest/update/${weddingPlanId}`,
    data
  );
  return response.data;
};

// ================= AUTHENTICATED APIS (REQUIRES LOGIN) =================

/**
 * Claim guest wedding plan (Step 7 - when user logs in)
 */
export const claimWeddingPlan = async (weddingPlanId: string, token: string) => {
  const response = await axios.post(
    `${API_BASE_URL}/configurator/claim`,
    { weddingPlanId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

/**
 * Create wedding plan (legacy - for direct authenticated creation)
 */
export const createWeddingPlan = async (
  data: {
    coupleNames: string;
    weddingStartDate?: string;
    weddingEndDate?: string;
    guests?: number;
    baseLocation?: string;
    vibe?: string;
    region?: string;
    budgetMin?: number;
    budgetMax?: number;
  },
  token: string
) => {
  const response = await axios.post(`${API_BASE_URL}/configurator/create`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

/**
 * Publish wedding site (after wedding plan created)
 */
export const publishWeddingSite = async (
  data: {
    weddingPlanId: string;
    siteCoverPhoto?: string;
    siteThemeColor?: string;
    siteIntroMessage?: string;
  },
  token: string
) => {
  const response = await axios.post(`${API_BASE_URL}/configurator/publish-site`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// ================= HELPER FUNCTIONS =================

/**
 * Calculate budget allocation based on total budget
 */
export const calculateBudgetAllocation = (totalBudget: number) => {
  return {
    venue: Math.round(totalBudget * 0.3), // 30%
    catering: Math.round(totalBudget * 0.25), // 25%
    decoration: Math.round(totalBudget * 0.15), // 15%
    photography: Math.round(totalBudget * 0.12), // 12%
    entertainment: Math.round(totalBudget * 0.1), // 10%
    other: Math.round(totalBudget * 0.08), // 8%
  };
};

/**
 * Format currency
 */
export const formatCurrency = (amount: number, currency: string = 'INR') => {
  if (currency === 'INR') {
    // Indian currency format: ₹12,34,567
    return `₹${amount.toLocaleString('en-IN')}`;
  }
  return `$${amount.toLocaleString('en-US')}`;
};

/**
 * Convert INR to Lakhs/Crores format
 */
export const formatIndianCurrency = (amount: number) => {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)}Cr`;
  } else if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)}L`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
};
