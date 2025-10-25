import { Admin } from '@/types/user/User';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface LeadState {
  loading: boolean;
  user: any;
  adminLoginEmail: string | null;
  teamMemberLoginEmail: string | null;
  vendorLoginEmail: string | null;
  userLoginEmail: string | null;
}

const initialState: LeadState = {
  loading: false,
  user: null,
  adminLoginEmail: null,
  teamMemberLoginEmail: null,
  vendorLoginEmail: null,
  userLoginEmail: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setUser: (state, action: PayloadAction<Admin>) => {
      state.user = action.payload;
    },
    setAdminLoginEmail: (state, action: PayloadAction<string>) => {
      state.adminLoginEmail = action.payload;
    },
    setVendorLoginEmail: (state, action: PayloadAction<string>) => {
      state.vendorLoginEmail = action.payload;
    },
    setUserLoginEmail: (state, action: PayloadAction<string>) => {
      state.userLoginEmail = action.payload;
    },
    setTeamMemberLoginEmail: (state, action: PayloadAction<string>) => {
      state.teamMemberLoginEmail = action.payload;
    },
    logout: (state) => {
      state.user = null;
    },
  },
});

export const {
  setLoading,
  setUser,
  setAdminLoginEmail,
  setTeamMemberLoginEmail,
  setVendorLoginEmail,
  setUserLoginEmail,
  logout,
} = authSlice.actions;
export default authSlice.reducer;
