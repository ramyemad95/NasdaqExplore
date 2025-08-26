import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type Theme = 'light' | 'dark' | 'system';
export type Language = 'en' | 'ar';

interface SettingsState {
  theme: Theme;
  language: Language;
  rtl: {
    isRTL: boolean;
    isSynced: boolean;
    lastLanguage: string;
  };
}

const initialState: SettingsState = {
  theme: 'system',
  language: 'en',
  rtl: {
    isRTL: false,
    isSynced: false,
    lastLanguage: 'en',
  },
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.theme = action.payload;
    },
    setLanguage: (state, action: PayloadAction<Language>) => {
      state.language = action.payload;
    },
    setRTL: (
      state,
      action: PayloadAction<{
        isRTL: boolean;
        isSynced: boolean;
        lastLanguage: string;
      }>,
    ) => {
      state.rtl = action.payload;
    },
    updateRTLSync: (state, action: PayloadAction<{ isSynced: boolean }>) => {
      state.rtl.isSynced = action.payload.isSynced;
    },
    // Migration action to fix corrupted RTL state
    migrateRTL: state => {
      if (!state.rtl) {
        state.rtl = {
          isRTL: state.language === 'ar',
          isSynced: false,
          lastLanguage: state.language,
        };
      } else {
        // Ensure RTL state is consistent with current language
        const targetRTL = state.language === 'ar';
        if (state.rtl.isRTL !== targetRTL) {
          state.rtl.isRTL = targetRTL;
          state.rtl.isSynced = false;
        }
        if (state.rtl.lastLanguage !== state.language) {
          state.rtl.lastLanguage = state.language;
        }
      }
    },
  },
});

export const { setTheme, setLanguage, setRTL, updateRTLSync, migrateRTL } =
  settingsSlice.actions;
export default settingsSlice.reducer;
