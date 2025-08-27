import reducer, { setTheme, setLanguage } from '../../src/store/settingsSlice';

describe('settingsSlice', () => {
  const initialState = {
    theme: 'system' as const,
    language: 'en' as const,
    rtl: {
      isRTL: false,
      lastLanguage: 'en',
    },
  };

  it('should return initial state', () => {
    expect(reducer(undefined, { type: undefined })).toEqual(initialState);
  });

  it('should handle setTheme action', () => {
    const newState = reducer(initialState, setTheme('dark'));
    expect(newState.theme).toBe('dark');
    expect(newState.language).toBe('en'); // Should preserve other settings
    expect(newState.rtl).toEqual(initialState.rtl);
  });

  it('should handle setLanguage action', () => {
    const newState = reducer(initialState, setLanguage('ar'));
    expect(newState.language).toBe('ar');
    expect(newState.theme).toBe('system'); // Should preserve other settings
    expect(newState.rtl).toEqual({
      isRTL: true,
      lastLanguage: 'ar',
    });
  });

  it('should handle theme changes', () => {
    const themes = ['light', 'dark', 'system'] as const;

    themes.forEach(theme => {
      const newState = reducer(initialState, setTheme(theme));
      expect(newState.theme).toBe(theme);
    });
  });

  it('should handle language changes', () => {
    const languages = ['en', 'ar'] as const;

    languages.forEach(language => {
      const newState = reducer(initialState, setLanguage(language));
      expect(newState.language).toBe(language);
      expect(newState.rtl.isRTL).toBe(language === 'ar');
      expect(newState.rtl.lastLanguage).toBe(language);
    });
  });

  it('should handle chained actions', () => {
    let state = initialState;

    state = reducer(state, setTheme('dark'));
    state = reducer(state, setLanguage('ar'));

    expect(state.theme).toBe('dark');
    expect(state.language).toBe('ar');
    expect(state.rtl.isRTL).toBe(true);
    expect(state.rtl.lastLanguage).toBe('ar');
  });

  it('should handle edge cases for theme', () => {
    const edgeThemes = ['light', 'dark', 'system'] as const;

    edgeThemes.forEach(theme => {
      const newState = reducer(initialState, setTheme(theme));
      expect(newState.theme).toBe(theme);
    });
  });

  it('should handle edge cases for language', () => {
    const edgeLanguages = ['en', 'ar'] as const;

    edgeLanguages.forEach(language => {
      const newState = reducer(initialState, setLanguage(language));
      expect(newState.language).toBe(language);
    });
  });
});
