import { useEffect, useCallback } from 'react';
import { I18nManager, Platform } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { setRTL, updateRTLSync, migrateRTL } from '../store/settingsSlice';

/**
 * Hook to ensure RTL synchronization between language changes and I18nManager
 * This fixes the issue where RTL layout doesn't update immediately when language changes
 * Now uses Redux for persistent RTL state management
 */
export const useRTLSync = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { language, rtl } = useSelector((state: RootState) => state.settings);

  // Ensure rtl has default values if undefined
  const safeRTL = rtl || {
    isRTL: false,
    isSynced: false,
    lastLanguage: language || 'en',
  };

  // Sync RTL with language changes and ensure consistency
  const syncRTL = useCallback(() => {
    const targetRTL = language === 'ar';
    const currentRTL = I18nManager.isRTL;

    // Only force RTL if it's different from current state
    if (currentRTL !== targetRTL) {
      I18nManager.forceRTL(targetRTL);
    }

    dispatch(
      setRTL({
        isRTL: targetRTL,
        isSynced: true,
        lastLanguage: language,
      }),
    );
  }, [language, dispatch]);

  // Check and fix RTL synchronization
  const checkSync = useCallback(() => {
    const targetRTL = language === 'ar';
    const currentRTL = I18nManager.isRTL;
    const isSynced = currentRTL === targetRTL;

    // If not synced, fix it immediately
    if (!isSynced) {
      I18nManager.forceRTL(targetRTL);
      dispatch(updateRTLSync({ isSynced: true }));
    }

    // Update local state if needed
    if (safeRTL.isSynced !== isSynced) {
      dispatch(updateRTLSync({ isSynced }));
    }
  }, [language, safeRTL.isSynced, dispatch]);

  // Initial RTL migration and synchronization when app opens
  useEffect(() => {
    // First, migrate any corrupted RTL state
    dispatch(migrateRTL());

    // Then ensure I18nManager is in sync
    const targetRTL = language === 'ar';
    const currentRTL = I18nManager.isRTL;

    // If there's a mismatch, fix it immediately
    if (currentRTL !== targetRTL) {
      I18nManager.forceRTL(targetRTL);
      dispatch(
        setRTL({
          isRTL: targetRTL,
          isSynced: true,
          lastLanguage: language,
        }),
      );
    }
  }, []); // Only run once when component mounts

  // Sync RTL when language changes
  useEffect(() => {
    if (language !== safeRTL.lastLanguage) {
      syncRTL();
    }
  }, [language, safeRTL.lastLanguage, syncRTL]);

  // Periodically check RTL synchronization
  useEffect(() => {
    const interval = setInterval(checkSync, 1000);
    return () => clearInterval(interval);
  }, [checkSync]);

  // Force sync function
  const forceSync = useCallback(() => {
    syncRTL();
  }, [syncRTL]);

  // Get RTL status
  const getRTLStatus = useCallback(() => {
    const targetRTL = language === 'ar';
    const currentRTL = I18nManager.isRTL;
    const isSynced = currentRTL === targetRTL;

    return {
      targetRTL,
      currentRTL,
      isSynced,
      platform: Platform.OS,
      needsRestart: Platform.OS === 'android' && !isSynced,
    };
  }, [language]);

  return {
    isRTL: safeRTL.isRTL,
    isSynced: safeRTL.isSynced,
    forceSync,
    getRTLStatus,
  };
};
