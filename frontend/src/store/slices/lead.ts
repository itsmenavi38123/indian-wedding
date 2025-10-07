import { Lead, LeadStatus } from '@/types/lead/Lead';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PaginationState, SortingState } from '@tanstack/react-table';

interface LeadState {
  loading: boolean;
  leadsList: Lead[];
  sorting: SortingState;
  pagination: PaginationState;
  statusFilter: LeadStatus | 'ALL';
  search: string;
}

const initialState: LeadState = {
  loading: false,
  leadsList: [],
  sorting: [],
  pagination: {
    pageIndex: 0,
    pageSize: 25,
  },
  statusFilter: 'ALL',
  search: '',
};

const leadSlice = createSlice({
  name: 'lead',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setSorting: (state, action: PayloadAction<SortingState>) => {
      state.sorting = action.payload;
    },
    setPagination: (state, action: PayloadAction<PaginationState>) => {
      state.pagination = action.payload;
    },
    setStatusFilter: (state, action: PayloadAction<LeadStatus | 'ALL'>) => {
      state.statusFilter = action.payload;
    },
    setSearch: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
    },
    setClearFilters: (state) => {
      state.statusFilter = 'ALL';
      state.search = '';
      state.sorting = [];
    },
  },
});

export const {
  setLoading,
  setSorting,
  setPagination,
  setStatusFilter,
  setSearch,
  setClearFilters,
} = leadSlice.actions;
export default leadSlice.reducer;
