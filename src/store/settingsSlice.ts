import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type Theme = 'light' | 'dark' | 'system';
export type Language = 'en' | 'ar';

interface SettingsState {
  theme: Theme;
  language: Language;
  rtl: {
    isRTL: boolean;
    lastLanguage: string;
  };
}

const initialState: SettingsState = {
  theme: 'system',
  language: 'en',
  rtl: {
    isRTL: false,
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
      // Automatically update RTL state when language changes
      state.rtl = {
        isRTL: action.payload === 'ar',
        lastLanguage: action.payload,
      };
    },
  },
});

export const { setTheme, setLanguage } = settingsSlice.actions;
export default settingsSlice.reducer;
