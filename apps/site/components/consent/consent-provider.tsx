"use client";

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { ConsentState } from "@/lib/consent/constants";
import { getConsent, setConsent } from "@/lib/consent/storage";
import { syncStoredConsentToGtag, updateAnalyticsConsent } from "@/lib/consent/update-consent";

type ConsentContextValue = {
  consent: ConsentState;
  acceptAnalytics: () => void;
  rejectAnalytics: () => void;
};

const ConsentContext = createContext<ConsentContextValue | null>(null);

export function ConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsentState] = useState<ConsentState>("unknown");

  // Hydrate cookie choice after mount; server and client both start as "unknown".
  useLayoutEffect(() => {
    const stored = getConsent();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync from document.cookie
    setConsentState(stored);
    syncStoredConsentToGtag();
  }, []);

  const acceptAnalytics = useCallback(() => {
    setConsent("granted");
    setConsentState("granted");
    updateAnalyticsConsent(true);
  }, []);

  const rejectAnalytics = useCallback(() => {
    setConsent("denied");
    setConsentState("denied");
    updateAnalyticsConsent(false);
  }, []);

  const value = useMemo(
    () => ({ consent, acceptAnalytics, rejectAnalytics }),
    [consent, acceptAnalytics, rejectAnalytics],
  );

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}

export function useConsent(): ConsentContextValue {
  const ctx = useContext(ConsentContext);
  if (!ctx) {
    throw new Error("useConsent must be used within ConsentProvider");
  }
  return ctx;
}
