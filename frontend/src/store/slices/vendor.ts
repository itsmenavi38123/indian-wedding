import { Vendor } from '@/types/vendor/Vendor';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PaginationState, SortingState } from '@tanstack/react-table';

interface VendorState {
  data: Vendor[];
  selectedVendor: Vendor | null;
  search: string;
  sorting: SortingState;
  pagination: PaginationState;
  statusFilter: string;
  loading: boolean;
}

const initialState: VendorState = {
  data: [],
  selectedVendor: null,
  search: '',
  sorting: [],
  pagination: {
    pageIndex: 0,
    pageSize: 25,
  },
  statusFilter: 'ALL',
  loading: false,
};

const vendorSlice = createSlice({
  name: 'vendor',
  initialState,
  reducers: {
    setData(state, action: PayloadAction<Vendor[]>) {
      state.data = action.payload;
    },
    setSelectedVendor(state, action: PayloadAction<Vendor | null>) {
      state.selectedVendor = action.payload;
    },
    addVendor(state, action: PayloadAction<Vendor>) {
      state.data.unshift(action.payload);
    },
    updateVendorInStore(state, action: PayloadAction<Vendor>) {
      const index = state.data.findIndex((v) => v.id === action.payload.id);
      if (index !== -1) state.data[index] = action.payload;
    },
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload;
    },
    setSorting(state, action: PayloadAction<SortingState>) {
      state.sorting = action.payload;
    },
    setPagination(state, action: PayloadAction<PaginationState>) {
      state.pagination = action.payload;
    },
    setStatusFilter(state, action: PayloadAction<string>) {
      state.statusFilter = action.payload;
    },
    setClearFilters(state) {
      state.search = '';
      state.sorting = [];
      state.pagination = { pageIndex: 0, pageSize: 25 };
      state.statusFilter = 'ALL';
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
  },
});

export const {
  setData,
  setSelectedVendor,
  addVendor,
  updateVendorInStore,
  setSearch,
  setSorting,
  setPagination,
  setStatusFilter,
  setClearFilters,
  setLoading,
} = vendorSlice.actions;

export default vendorSlice.reducer;
