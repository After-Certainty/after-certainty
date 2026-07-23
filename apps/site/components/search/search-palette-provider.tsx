"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";

import { QuickSearchDialog } from "@/components/search/quick-search-dialog";
import { trackSearchOpen } from "@/lib/analytics/track";
import type { SearchOpenParams } from "@/lib/analytics/events";

type SearchPaletteContextValue = {
  open: boolean;
  openSearch: (method: SearchOpenParams["method"]) => void;
  closeSearch: () => void;
  triggerRef: RefObject<HTMLButtonElement | null>;
};

const SearchPaletteContext = createContext<SearchPaletteContextValue | null>(null);

export function useSearchPalette(): SearchPaletteContextValue {
  const ctx = useContext(SearchPaletteContext);
  if (!ctx) {
    throw new Error("useSearchPalette must be used within SearchPaletteProvider");
  }
  return ctx;
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}

export function SearchPaletteProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const openSearch = useCallback((method: SearchOpenParams["method"]) => {
    setOpen(true);
    trackSearchOpen({ method });
  }, []);

  const closeSearch = useCallback(() => {
    setOpen(false);
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const isModK = (e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey);
      if (isModK) {
        e.preventDefault();
        if (open) {
          closeSearch();
        } else {
          openSearch("shortcut");
        }
        return;
      }

      if (e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey && !isEditableTarget(e.target)) {
        e.preventDefault();
        openSearch("shortcut");
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, openSearch, closeSearch]);

  const value = useMemo(
    () => ({ open, openSearch, closeSearch, triggerRef }),
    [open, openSearch, closeSearch],
  );

  return (
    <SearchPaletteContext.Provider value={value}>
      {children}
      <QuickSearchDialog open={open} onClose={closeSearch} restoreFocusRef={triggerRef} />
    </SearchPaletteContext.Provider>
  );
}
