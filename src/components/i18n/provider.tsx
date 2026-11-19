'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import i18n from '@/lib/i18n';

interface I18nReadyContextValue {
  ready: boolean;
}

const I18nReadyContext = createContext<I18nReadyContextValue>({ ready: false });

export function I18nReadyProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (i18n.isInitialized) {
      setReady(true);
    } else {
      i18n.on('initialized', () => setReady(true));
    }
  }, []);

  return <I18nReadyContext.Provider value={{ ready }}>{children}</I18nReadyContext.Provider>;
}

export function useI18nReady() {
  return useContext(I18nReadyContext);
}
