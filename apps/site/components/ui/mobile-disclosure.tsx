"use client";

import {
  createContext,
  useCallback,
  useContext,
  useId,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { DisclosureChevron } from "@/components/ui/disclosure-chevron";

type MobileDisclosureGroupContextValue = {
  type: "single" | "multiple";
  openId: string | null;
  setOpenId: (id: string | null) => void;
};

const MobileDisclosureGroupContext = createContext<MobileDisclosureGroupContextValue | null>(
  null,
);

type MobileDisclosureGroupProps = {
  children: ReactNode;
  /**
   * `single` — at most one item open (Patterns item rows).
   * `multiple` — each item toggles independently (Books / Explore groups).
   */
  type?: "single" | "multiple";
  /** Initial open item id when `type="single"`. */
  defaultOpenId?: string | null;
  className?: string;
};

export function MobileDisclosureGroup({
  children,
  type = "single",
  defaultOpenId = null,
  className,
}: MobileDisclosureGroupProps) {
  const [openId, setOpenIdState] = useState<string | null>(defaultOpenId);
  const setOpenId = useCallback((id: string | null) => {
    setOpenIdState(id);
  }, []);

  const value = useMemo(
    () => ({ type, openId, setOpenId }),
    [type, openId, setOpenId],
  );

  return (
    <MobileDisclosureGroupContext.Provider value={value}>
      <div className={className}>{children}</div>
    </MobileDisclosureGroupContext.Provider>
  );
}

const defaultToggleClassName =
  "flex min-h-11 w-full items-center gap-3 py-[var(--explore-row-py)] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent";

type MobileDisclosureProps = {
  /**
   * Stable id for single-open groups. Required when using `MobileDisclosureGroup`
   * with `type="single"` if you need a predictable `defaultOpenId`.
   */
  id?: string;
  /** Toggle button contents (excluding the chevron). */
  summary: ReactNode;
  children: ReactNode;
  /** Accessible name for the expanded region. */
  regionLabel: string;
  /** Initial open state for uncontrolled / `multiple` group items. */
  defaultOpen?: boolean;
  className?: string;
  summaryClassName?: string;
  panelClassName?: string;
  /**
   * When true, the panel stays visible from `md` up (ExploreIndexGroup pattern).
   * Pair with `summaryClassName` including `md:hidden` when the desktop chrome
   * is rendered separately.
   */
  alwaysOpenFromMd?: boolean;
};

export function MobileDisclosure({
  id,
  summary,
  children,
  regionLabel,
  defaultOpen = false,
  className,
  summaryClassName = defaultToggleClassName,
  panelClassName,
  alwaysOpenFromMd = false,
}: MobileDisclosureProps) {
  const reactId = useId();
  const itemId = id ?? reactId;
  const panelId = `${itemId}-panel`;
  const group = useContext(MobileDisclosureGroupContext);
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);

  const open =
    group?.type === "single" ? group.openId === itemId : uncontrolledOpen;

  const toggle = () => {
    if (group?.type === "single") {
      group.setOpenId(open ? null : itemId);
      return;
    }
    setUncontrolledOpen((value) => !value);
  };

  const panelClass = alwaysOpenFromMd
    ? open
      ? "block md:block"
      : "hidden md:block"
    : open
      ? "block"
      : "hidden";

  return (
    <div className={className}>
      <button
        type="button"
        className={summaryClassName}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={toggle}
      >
        <span className="min-w-0 flex-1">{summary}</span>
        <DisclosureChevron expanded={open} />
      </button>
      <div
        id={panelId}
        className={[panelClass, panelClassName].filter(Boolean).join(" ")}
        role="region"
        aria-label={regionLabel}
      >
        {children}
      </div>
    </div>
  );
}
