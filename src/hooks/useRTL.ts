import { useMemo, useState, useEffect } from 'react';
import { I18nManager } from 'react-native';
import { useSettings } from './useSettings';

export const useRTL = () => {
  const { language } = useSettings();
  const [forceUpdate, setForceUpdate] = useState(0);

  // Get target RTL value based on language
  const targetRTL = language === 'ar';

  // Force re-render if I18nManager.isRTL doesn't match targetRTL
  useEffect(() => {
    if (I18nManager.isRTL !== targetRTL) {
      setForceUpdate(prev => prev + 1);
    }
  }, [targetRTL]);

  // RTL properties
  const rtlProps = {
    flexDirection: targetRTL ? 'row-reverse' : 'row',
    textAlign: targetRTL ? 'right' : 'left',
    writingDirection: targetRTL ? 'rtl' : 'ltr',
    marginStart: targetRTL ? 'marginRight' : 'marginLeft',
    marginEnd: targetRTL ? 'marginLeft' : 'marginRight',
    paddingStart: targetRTL ? 'paddingRight' : 'paddingLeft',
    paddingEnd: targetRTL ? 'paddingLeft' : 'paddingRight',
  };

  return {
    isRTL: targetRTL,
    flexDirection: rtlProps.flexDirection,
    textAlign: rtlProps.textAlign,
    writingDirection: rtlProps.writingDirection,
    marginStart: rtlProps.marginStart,
    marginEnd: rtlProps.marginEnd,
    paddingStart: rtlProps.paddingStart,
    paddingEnd: rtlProps.paddingEnd,
  };
};
