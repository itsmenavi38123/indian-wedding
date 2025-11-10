'use client';

import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

import authReducer from './slices/auth';
import leadReducer from './slices/lead';
import vendorReducer from '@/store/slices/vendor';
import forgotPasswordReducer from './slices/forgotPassword';
import planningReducer from './slices/planning';
import vendorServiceReducer from './slices/vendorServices';
import vendorTeamReducer from './slices/vendorTeam';
import configuratorReducer from './slices/configurator';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['forgotPassword', 'configurator'],
};

const rootReducer = combineReducers({
  auth: authReducer,
  lead: leadReducer,
  vendor: vendorReducer,
  vendorService: vendorServiceReducer,
  forgotPassword: forgotPasswordReducer,
  planning: planningReducer,
  vendorTeam: vendorTeamReducer,
  configurator: configuratorReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
