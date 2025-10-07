import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface LeadState {
  loading: boolean;
  email: string | null;
  otpToken: string | null;
}

const initialState: LeadState = {
  loading: false,
  email: null,
  otpToken: null,
};

const authSlice = createSlice({
  name: 'forgotPassword',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setEmail: (state, action: PayloadAction<string>) => {
      state.email = action.payload;
    },
    setOtpToken: (state, action: PayloadAction<string>) => {
      state.otpToken = action.payload;
    },
  },
});

export const { setLoading, setEmail, setOtpToken } = authSlice.actions;
export default authSlice.reducer;
