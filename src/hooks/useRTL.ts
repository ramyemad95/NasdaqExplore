import { useMemo } from 'react';
import { useSettings } from './useSettings';

export const useRTL = () => {
  const { rtl } = useSettings();
  console.log('rtl', rtl);
  const isRTL = rtl.isRTL;

  return {
    isRTL,
    flexDirection: isRTL ? 'row-reverse' : 'row',
    textAlign: isRTL ? 'right' : 'left',
    writingDirection: isRTL ? 'rtl' : 'ltr',
    marginStart: isRTL ? 'marginRight' : 'marginLeft',
    marginEnd: isRTL ? 'marginLeft' : 'marginRight',
    paddingStart: isRTL ? 'paddingRight' : 'paddingLeft',
    paddingEnd: isRTL ? 'paddingLeft' : 'paddingRight',
  };
};
