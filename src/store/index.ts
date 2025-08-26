import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import stocksReducer from './stocksSlice';
import filtersReducer from './filtersSlice';
import settingsReducer from './settingsSlice';

// Root reducer
const rootReducer = combineReducers({
  stocks: stocksReducer,
  filters: filtersReducer,
  settings: settingsReducer,
});

// Persist configuration for settings only
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['settings'], // Only persist settings
  blacklist: ['stocks', 'filters'], // Don't persist stocks and filters
};

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store with persistence
export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

// Create persistor
export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
