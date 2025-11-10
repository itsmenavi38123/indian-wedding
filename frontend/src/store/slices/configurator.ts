import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ConfiguratorState {
  // Step 1: Welcome & Basic Info
  coupleNames: string;
  weddingStartDate: string;
  weddingEndDate: string;
  guests: number;
  baseLocation: string;

  // Step 2: Choose Your Vibe
  vibe: string;
  vibeDescription?: string;

  // Step 3: Location Preferences
  region: string;
  selectedVenueId?: string;

  // Step 4: Budget Setup
  budgetMin: number;
  budgetMax: number;
  budgetAllocation?: {
    venue: number;
    catering: number;
    decoration: number;
    photography: number;
    entertainment: number;
    other: number;
  };

  // Step 6: Vendor Discovery
  selectedVendors: {
    [category: string]: string[]; // category -> vendorServiceIds[]
  };

  // Step 7: Publish Site
  siteCoverPhoto?: string;
  siteThemeColor: string;
  siteIntroMessage?: string;

  // Metadata
  currentStep: number;
  wizardCompleted: boolean;
  weddingPlanId?: string; // Created immediately after Step 1
  subdomain?: string;
  guestSessionToken?: string; // For guest mode tracking
}

const initialState: ConfiguratorState = {
  coupleNames: '',
  weddingStartDate: '',
  weddingEndDate: '',
  guests: 100,
  baseLocation: '',
  vibe: '',
  region: '',
  budgetMin: 0,
  budgetMax: 0,
  selectedVendors: {},
  siteThemeColor: '#ad8b3a',
  currentStep: 1,
  wizardCompleted: false,
};

// Load state from localStorage
const loadState = (): ConfiguratorState => {
  try {
    const serializedState = localStorage.getItem('weddingConfigurator');
    if (serializedState === null) {
      return initialState;
    }
    return JSON.parse(serializedState);
  } catch {
    return initialState;
  }
};

// Save state to localStorage
const saveState = (state: ConfiguratorState) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem('weddingConfigurator', serializedState);
  } catch {
    // Ignore write errors
  }
};

const configuratorSlice = createSlice({
  name: 'configurator',
  initialState: typeof window !== 'undefined' ? loadState() : initialState,
  reducers: {
    // Step 1: Set basic info
    setBasicInfo: (
      state,
      action: PayloadAction<{
        coupleNames: string;
        weddingStartDate: string;
        weddingEndDate: string;
        guests: number;
        baseLocation: string;
      }>
    ) => {
      state.coupleNames = action.payload.coupleNames;
      state.weddingStartDate = action.payload.weddingStartDate;
      state.weddingEndDate = action.payload.weddingEndDate;
      state.guests = action.payload.guests;
      state.baseLocation = action.payload.baseLocation;
      state.currentStep = Math.max(state.currentStep, 2);
      saveState(state);
    },

    // Step 2: Set vibe
    setVibe: (state, action: PayloadAction<{ vibe: string; description?: string }>) => {
      state.vibe = action.payload.vibe;
      state.vibeDescription = action.payload.description;
      state.currentStep = Math.max(state.currentStep, 3);
      saveState(state);
    },

    // Step 3: Set region
    setRegion: (state, action: PayloadAction<{ region: string; venueId?: string }>) => {
      state.region = action.payload.region;
      state.selectedVenueId = action.payload.venueId;
      state.currentStep = Math.max(state.currentStep, 4);
      saveState(state);
    },

    // Step 4: Set budget
    setBudget: (
      state,
      action: PayloadAction<{
        budgetMin: number;
        budgetMax: number;
        allocation?: ConfiguratorState['budgetAllocation'];
      }>
    ) => {
      state.budgetMin = action.payload.budgetMin;
      state.budgetMax = action.payload.budgetMax;
      state.budgetAllocation = action.payload.allocation;
      state.currentStep = Math.max(state.currentStep, 5);
      saveState(state);
    },

    // Step 6: Add vendor to selection
    addVendor: (state, action: PayloadAction<{ category: string; vendorServiceId: string }>) => {
      if (!state.selectedVendors[action.payload.category]) {
        state.selectedVendors[action.payload.category] = [];
      }
      if (
        !state.selectedVendors[action.payload.category].includes(action.payload.vendorServiceId)
      ) {
        state.selectedVendors[action.payload.category].push(action.payload.vendorServiceId);
      }
      saveState(state);
    },

    // Step 6: Remove vendor from selection
    removeVendor: (state, action: PayloadAction<{ category: string; vendorServiceId: string }>) => {
      if (state.selectedVendors[action.payload.category]) {
        state.selectedVendors[action.payload.category] = state.selectedVendors[
          action.payload.category
        ].filter((id) => id !== action.payload.vendorServiceId);
      }
      saveState(state);
    },

    // Step 7: Set site customization
    setSiteCustomization: (
      state,
      action: PayloadAction<{
        coverPhoto?: string;
        themeColor: string;
        introMessage?: string;
      }>
    ) => {
      state.siteCoverPhoto = action.payload.coverPhoto;
      state.siteThemeColor = action.payload.themeColor;
      state.siteIntroMessage = action.payload.introMessage;
      saveState(state);
    },

    // Set wedding plan ID (after Step 1 creates it in DB)
    setWeddingPlanId: (
      state,
      action: PayloadAction<{ weddingPlanId: string; subdomain: string; guestSessionToken: string }>
    ) => {
      state.weddingPlanId = action.payload.weddingPlanId;
      state.subdomain = action.payload.subdomain;
      state.guestSessionToken = action.payload.guestSessionToken;
      saveState(state);
    },

    // After successful wedding plan claim (Step 7 login)
    setWeddingPlanClaimed: (
      state,
      action: PayloadAction<{ weddingPlanId: string; subdomain: string }>
    ) => {
      state.weddingPlanId = action.payload.weddingPlanId;
      state.subdomain = action.payload.subdomain;
      state.wizardCompleted = true;
      state.currentStep = 7;
      saveState(state);
    },

    // Set current step manually
    setCurrentStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload;
      saveState(state);
    },

    // Reset wizard
    resetConfigurator: (state) => {
      Object.assign(state, initialState);
      localStorage.removeItem('weddingConfigurator');
    },
  },
});

export const {
  setBasicInfo,
  setVibe,
  setRegion,
  setBudget,
  addVendor,
  removeVendor,
  setSiteCustomization,
  setWeddingPlanId,
  setWeddingPlanClaimed,
  setCurrentStep,
  resetConfigurator,
} = configuratorSlice.actions;

export default configuratorSlice.reducer;
