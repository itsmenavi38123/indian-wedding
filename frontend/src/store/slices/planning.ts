import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Types
export interface Destination {
  id: string;
  name: string;
  country: string;
  baseCostMin: number;
  baseCostMax: number;
  heroImage?: string;
  photos: DestinationPhoto[];
}

export interface DestinationPhoto {
  id: string;
  destinationId: string;
  url: string;
  category?: string;
  vendorServiceId?: string;
  vendorService?: VendorService;
  createdAt: string;
}

export interface VendorService {
  city: any;
  id: string;
  vendorId: string;
  title: string;
  description?: string;
  category: string;
  price: number;
  locationId?: string;
  location?: Location;
  vendor: Vendor;
  media: VendorServiceMedia[];
  createdAt: string;
  updatedAt: string;
  state: string;
  country: string;
  destinationId: string;
}

export interface VendorServiceMedia {
  id: string;
  vendorServiceId: string;
  type: 'IMAGE' | 'VIDEO' | 'THUMBNAIL';
  url: string;
  createdAt: string;
}

export interface Vendor {
  id: string;
  name: string;
  contactNo?: string;
  email?: string;
  serviceTypes?: string;
}

export interface Location {
  id: string;
  country: string;
  state?: string;
  city?: string;
  name?: string;
  latitude?: number;
  longitude?: number;
}

export interface VendorCategory {
  category: string;
  count: number;
  thumbnail?: string;
  vendorName?: string;
  vendorId?: string;
}

export interface PlanningState {
  // Budget
  budgetMin?: number;
  budgetMax?: number;

  // Destinations
  destinations: Destination[];
  selectedDestinations: string[];
  destinationsLoading: boolean;
  destinationsError?: string;

  // Categories
  categories: VendorCategory[];
  categoriesLoading: boolean;
  categoriesError?: string;

  // Services
  services: VendorService[];
  servicesByCategory: Record<string, VendorService[]>;
  servicesLoading: boolean;
  servicesError?: string;

  // Selected Service & Recommendations
  selectedService?: VendorService;
  recommendedServices: VendorService[];
  recommendedServicesLoading: boolean;
  recommendedServicesError?: string;

  // Current step in planning flow
  currentStep: 'budget' | 'destinations' | 'categories' | 'services' | 'recommendations';

  // Pagination
  servicesPagination: {
    page: number;
    limit: number;
    total: number;
  };
}

const initialState: PlanningState = {
  destinations: [],
  selectedDestinations: [],
  destinationsLoading: false,
  destinationsError: undefined,

  categories: [],
  categoriesLoading: false,
  categoriesError: undefined,

  services: [],
  servicesByCategory: {},
  servicesLoading: false,
  servicesError: undefined,

  recommendedServices: [],
  recommendedServicesLoading: false,
  recommendedServicesError: undefined,

  currentStep: 'budget',

  servicesPagination: {
    page: 1,
    limit: 20,
    total: 0,
  },
};

// Async Thunks
export const fetchDestinationsByBudget = createAsyncThunk(
  'planning/fetchDestinationsByBudget',
  async (params: { budgetMin?: number; budgetMax?: number }) => {
    const queryParams = new URLSearchParams();
    if (params.budgetMin) queryParams.append('budgetMin', params.budgetMin.toString());
    if (params.budgetMax) queryParams.append('budgetMax', params.budgetMax.toString());
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/v1/destinations?${queryParams.toString()}`
    );
    if (!response.ok) throw new Error('Failed to fetch destinations');
    const data = await response.json();
    return data.data;
  }
);

export const fetchVendorCategories = createAsyncThunk(
  'planning/fetchVendorCategories',
  async (params: { budgetMin?: number; budgetMax?: number; destinationIds?: string[] }) => {
    const queryParams = new URLSearchParams();
    if (params.budgetMin) queryParams.append('budgetMin', params.budgetMin.toString());
    if (params.budgetMax) queryParams.append('budgetMax', params.budgetMax.toString());
    if (params.destinationIds?.length) {
      queryParams.append('destinationIds', params.destinationIds.join(','));
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/services/categories?${queryParams.toString()}`
    );
    if (!response.ok) throw new Error('Failed to fetch categories');
    const data = await response.json();
    return data.data;
  }
);

export const fetchServicesByCategory = createAsyncThunk(
  'planning/fetchServicesByCategory',
  async (params: {
    category: string;
    budgetMin?: number;
    budgetMax?: number;
    destinationIds?: string[];
    page?: number;
    limit?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params.budgetMin) queryParams.append('budgetMin', params.budgetMin.toString());
    if (params.budgetMax) queryParams.append('budgetMax', params.budgetMax.toString());
    if (params.destinationIds?.length) {
      queryParams.append('destinationIds', params.destinationIds.join(','));
    }
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/v1/vendor/get/services/category/${params.category}?${queryParams.toString()}`;

    const response = await fetch(url);

    if (!response.ok) throw new Error('Failed to fetch services');
    const data = await response.json();
    return {
      services: data.data.services,
      pagination: data.data.pagination,
      category: params.category,
    };
  }
);

export const fetchRecommendedServices = createAsyncThunk(
  'planning/fetchRecommendedServices',
  async (params: { vendorId: string; excludeServiceId?: string; category?: string }) => {
    const queryParams = new URLSearchParams();
    if (params.excludeServiceId) queryParams.append('excludeServiceId', params.excludeServiceId);
    if (params.category) queryParams.append('category', params.category);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/services/vendor/${params.vendorId}/recommended?${queryParams.toString()}`
    );
    if (!response.ok) throw new Error('Failed to fetch recommended services');
    const data = await response.json();
    return data.data;
  }
);

export const fetchServiceDetails = createAsyncThunk(
  'planning/fetchServiceDetails',
  async (serviceId: string) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/services/${serviceId}`
    );
    if (!response.ok) throw new Error('Failed to fetch service details');
    const data = await response.json();
    return data.data;
  }
);

export const fetchDestinationsFromServices = createAsyncThunk<
  Destination[],
  { budgetMin?: number; budgetMax?: number }
>('planning/fetchDestinationsFromServices', async ({ budgetMin, budgetMax }) => {
  const queryParams = new URLSearchParams();
  if (budgetMin !== undefined) queryParams.append('budgetMin', budgetMin.toString());
  if (budgetMax !== undefined) queryParams.append('budgetMax', budgetMax.toString());

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/v1/vendor/get/services?${queryParams.toString()}`
  );

  if (!res.ok) throw new Error('Failed to fetch vendor services');

  const data = await res.json();
  const services: VendorService[] = data.data;
  console.log('Raw services:', services);

  const grouped = new Map<string, Destination>();

  for (const service of services) {
    const destinationId = service.destinationId || service.id || service.state || service.country;
    const state = service.state || '';
    const country = service.country || 'Unknown';

    const groupKey = state || country;
    const displayName = state || country;

    const existing = grouped.get(groupKey);

    // const mediaUrls = service.media?.map((m) => m.url) || [];

    if (!existing) {
      grouped.set(groupKey, {
        id: destinationId,
        name: displayName,
        country,
        baseCostMin: service.price,
        baseCostMax: service.price,
        heroImage: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
        photos: [],
      });
    } else {
      existing.baseCostMin = Math.min(existing.baseCostMin, service.price);
      existing.baseCostMax = Math.max(existing.baseCostMax, service.price);
      existing.photos.push();
    }
  }

  // Remove duplicate photos per group
  for (const destination of grouped.values()) {
    destination.photos = Array.from(new Set(destination.photos));
  }

  return Array.from(grouped.values());
});

// Planning Slice
const planningSlice = createSlice({
  name: 'planning',
  initialState,
  reducers: {
    setBudget: (state, action: PayloadAction<{ budgetMin?: number; budgetMax?: number }>) => {
      state.budgetMin = action.payload.budgetMin;
      state.budgetMax = action.payload.budgetMax;
    },

    setSelectedDestinations: (state, action: PayloadAction<string[]>) => {
      state.selectedDestinations = action.payload;
    },

    setCurrentStep: (state, action: PayloadAction<PlanningState['currentStep']>) => {
      state.currentStep = action.payload;
    },

    setSelectedService: (state, action: PayloadAction<VendorService>) => {
      state.selectedService = action.payload;
    },

    clearPlanningData: (state) => {
      state.destinations = [];
      state.selectedDestinations = [];
      state.categories = [];
      state.services = [];
      state.servicesByCategory = {};
      state.recommendedServices = [];
      state.selectedService = undefined;
      state.currentStep = 'budget';
    },

    resetErrors: (state) => {
      state.destinationsError = undefined;
      state.categoriesError = undefined;
      state.servicesError = undefined;
      state.recommendedServicesError = undefined;
    },
  },

  extraReducers: (builder) => {
    // Fetch Destinations
    builder
      .addCase(fetchDestinationsByBudget.pending, (state) => {
        state.destinationsLoading = true;
        state.destinationsError = undefined;
      })
      .addCase(fetchDestinationsByBudget.fulfilled, (state, action) => {
        state.destinationsLoading = false;
        state.destinations = action.payload;
      })
      .addCase(fetchDestinationsByBudget.rejected, (state, action) => {
        state.destinationsLoading = false;
        state.destinationsError = action.error.message || 'Failed to fetch destinations';
      });

    // Fetch Categories
    builder
      .addCase(fetchVendorCategories.pending, (state) => {
        state.categoriesLoading = true;
        state.categoriesError = undefined;
      })
      .addCase(fetchVendorCategories.fulfilled, (state, action) => {
        state.categoriesLoading = false;
        state.categories = action.payload;
      })
      .addCase(fetchVendorCategories.rejected, (state, action) => {
        state.categoriesLoading = false;
        state.categoriesError = action.error.message || 'Failed to fetch categories';
      });

    // Fetch Services by Category
    builder
      .addCase(fetchServicesByCategory.pending, (state) => {
        state.servicesLoading = true;
        state.servicesError = undefined;
      })
      .addCase(fetchServicesByCategory.fulfilled, (state, action) => {
        state.servicesLoading = false;
        const { services, pagination, category } = action.payload;

        // Update services for this category
        state.servicesByCategory[category] = services;

        // Update pagination
        state.servicesPagination = pagination;

        // Update all services array (for search/filtering)
        const allServices = Object.values(state.servicesByCategory).flat();
        state.services = allServices;
      })
      .addCase(fetchServicesByCategory.rejected, (state, action) => {
        state.servicesLoading = false;
        state.servicesError = action.error.message || 'Failed to fetch services';
      });

    // Fetch Recommended Services
    builder
      .addCase(fetchRecommendedServices.pending, (state) => {
        state.recommendedServicesLoading = true;
        state.recommendedServicesError = undefined;
      })
      .addCase(fetchRecommendedServices.fulfilled, (state, action) => {
        state.recommendedServicesLoading = false;
        state.recommendedServices = action.payload;
      })
      .addCase(fetchRecommendedServices.rejected, (state, action) => {
        state.recommendedServicesLoading = false;
        state.recommendedServicesError =
          action.error.message || 'Failed to fetch recommended services';
      });

    // Fetch Service Details
    builder.addCase(fetchServiceDetails.fulfilled, (state, action) => {
      state.selectedService = action.payload;
    });

    builder.addCase(fetchDestinationsFromServices.fulfilled, (state, action) => {
      state.destinations = action.payload;
    });
  },
});

export const {
  setBudget,
  setSelectedDestinations,
  setCurrentStep,
  setSelectedService,
  clearPlanningData,
  resetErrors,
} = planningSlice.actions;

export default planningSlice.reducer;
