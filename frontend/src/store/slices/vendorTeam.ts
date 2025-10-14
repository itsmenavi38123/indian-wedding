import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PaginationState, SortingState } from '@tanstack/react-table';

interface VendorTeamState {
  search: string;
  roleFilter: string | 'ALL';
  pagination: PaginationState;
  sorting: SortingState;
  loading: boolean;
}

const initialState: VendorTeamState = {
  search: '',
  roleFilter: 'ALL',
  pagination: {
    pageIndex: 0,
    pageSize: 25,
  },
  sorting: [],
  loading: false,
};

const vendorTeamSlice = createSlice({
  name: 'vendorTeam',
  initialState,
  reducers: {
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload;
    },
    setRoleFilter(state, action: PayloadAction<string | 'ALL'>) {
      state.roleFilter = action.payload;
    },
    setPagination(state, action: PayloadAction<PaginationState>) {
      state.pagination = action.payload;
    },
    setSorting(state, action: PayloadAction<SortingState>) {
      state.sorting = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    clearTeamFilters(state) {
      state.search = '';
      state.roleFilter = 'ALL';
      state.sorting = [];
      state.pagination = { pageIndex: 0, pageSize: 10 };
    },
  },
});

export const { setSearch, setRoleFilter, setPagination, setSorting, setLoading, clearTeamFilters } =
  vendorTeamSlice.actions;

export default vendorTeamSlice.reducer;
