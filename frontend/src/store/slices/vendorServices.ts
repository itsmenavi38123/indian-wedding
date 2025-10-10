import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PaginationState, SortingState } from '@tanstack/react-table';

export interface Media {
  id: string;
  vendorServiceId: string;
  type: string;
  url: string;
  createdAt: string;
}

export interface VendorService {
  id: string;
  vendorId: string;
  title: string;
  description: string;
  category: string;
  price: number;
  locationId: string | null;
  country: string;
  state: string;
  city: string;
  name: string;
  latitude: number;
  longitude: number;
  createdAt: string;
  updatedAt: string;
  thumbnailId: string;
  media: Media[];
  thumbnail: Media | null;
}

interface VendorServiceState {
  loading: boolean;
  vendorServices: VendorService[];
  sorting: SortingState;
  pagination: PaginationState;
  categoryFilter: string | 'ALL';
  search: string;
}

const initialState: VendorServiceState = {
  loading: false,
  vendorServices: [],
  sorting: [],
  pagination: {
    pageIndex: 0,
    pageSize: 25,
  },
  categoryFilter: 'ALL',
  search: '',
};

const vendorServiceSlice = createSlice({
  name: 'vendorService',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setVendorServices: (state, action: PayloadAction<VendorService[]>) => {
      state.vendorServices = action.payload;
    },
    addVendorService: (state, action: PayloadAction<VendorService>) => {
      state.vendorServices.push(action.payload);
    },
    updateVendorService: (state, action: PayloadAction<VendorService>) => {
      const index = state.vendorServices.findIndex((service) => service.id === action.payload.id);
      if (index !== -1) {
        state.vendorServices[index] = action.payload;
      }
    },
    deleteVendorService: (state, action: PayloadAction<string>) => {
      state.vendorServices = state.vendorServices.filter(
        (service) => service.id !== action.payload
      );
    },
    setSorting: (state, action: PayloadAction<SortingState>) => {
      state.sorting = action.payload;
    },
    setPagination: (state, action: PayloadAction<PaginationState>) => {
      state.pagination = action.payload;
    },
    setCategoryFilter: (state, action: PayloadAction<string | 'ALL'>) => {
      state.categoryFilter = action.payload;
    },
    setSearch: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
    },
    clearFilters: (state) => {
      state.categoryFilter = 'ALL';
      state.search = '';
      state.sorting = [];
    },
  },
});

export const {
  setLoading,
  setVendorServices,
  addVendorService,
  updateVendorService,
  deleteVendorService,
  setSorting,
  setPagination,
  setCategoryFilter,
  setSearch,
  clearFilters,
} = vendorServiceSlice.actions;

export default vendorServiceSlice.reducer;
