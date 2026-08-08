"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

import { trackSessionDelightShown } from "@/lib/games/pattern-recognition/analytics";
import {
  DELIGHT_DURATION_MS,
  DELIGHT_REDUCED_MOTION_MS,
  layoutConstellation,
  selectDelightVariant,
} from "@/lib/games/pattern-recognition/delight";
import type { SessionMode } from "@/lib/games/pattern-recognition/daily";

type SessionCompleteDelightProps = {
  mode: SessionMode;
  patternIds: readonly string[];
};

/**
 * Non-blocking decorative wink after a Daily/Practice pack.
 * Does not own scoring, XP, or session state.
 */
export function SessionCompleteDelight({
  mode,
  patternIds,
}: SessionCompleteDelightProps) {
  const reduceMotion = useReducedMotion();
  const variant = selectDelightVariant();
  const [active, setActive] = useState(true);
  const trackedRef = useRef(false);

  const { nodes, edges } = useMemo(
    () => layoutConstellation(patternIds),
    [patternIds],
  );

  useEffect(() => {
    if (trackedRef.current) return;
    trackedRef.current = true;
    trackSessionDelightShown({ variantId: variant, mode });
  }, [mode, variant]);

  useEffect(() => {
    if (!active) return;
    const ms = reduceMotion ? DELIGHT_REDUCED_MOTION_MS : DELIGHT_DURATION_MS;
    const timer = window.setTimeout(() => setActive(false), ms);
    return () => window.clearTimeout(timer);
  }, [active, reduceMotion]);

  if (!active || variant !== "pattern-constellation") {
    return null;
  }

  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-center overflow-hidden"
      aria-hidden="true"
      role="presentation"
      data-testid="session-complete-delight"
      data-variant={variant}
      data-reduced-motion={reduceMotion ? "true" : "false"}
    >
      <PatternConstellation
        nodes={nodes}
        edges={edges}
        reduceMotion={Boolean(reduceMotion)}
      />
    </div>
  );
}

type PatternConstellationProps = {
  nodes: ReturnType<typeof layoutConstellation>["nodes"];
  edges: ReturnType<typeof layoutConstellation>["edges"];
  reduceMotion: boolean;
};

function PatternConstellation({
  nodes,
  edges,
  reduceMotion,
}: PatternConstellationProps) {
  if (reduceMotion) {
    return (
      <motion.svg
        viewBox="0 0 320 120"
        className="h-28 w-full max-w-sm text-accent"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.55 }}
        transition={{ duration: 0.12 }}
      >
        <ConstellationStatic nodes={nodes} edges={edges} />
      </motion.svg>
    );
  }

  return (
    <motion.svg
      viewBox="0 0 320 120"
      className="h-28 w-full max-w-sm text-accent"
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 1, 0] }}
      transition={{ duration: DELIGHT_DURATION_MS / 1000, times: [0, 0.12, 0.72, 1], ease: "easeInOut" }}
    >
      {edges.map((edge, i) => {
        const a = nodes[edge.from];
        const b = nodes[edge.to];
        if (!a || !b) return null;
        return (
          <motion.path
            key={`e-${edge.from}-${edge.to}`}
            d={`M ${a.x} ${a.y} L ${b.x} ${b.y}`}
            stroke="currentColor"
            strokeWidth={1.25}
            strokeLinecap="round"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.55 }}
            transition={{ duration: 0.55, delay: 0.18 + i * 0.06, ease: "easeOut" }}
          />
        );
      })}
      {nodes.map((node, i) => (
        <motion.circle
          key={node.id}
          cx={node.x}
          cy={node.y}
          r={4.5}
          fill="currentColor"
          initial={{ opacity: 0, scale: 0.4 }}
          animate={{ opacity: 0.9, scale: 1 }}
          transition={{ duration: 0.35, delay: 0.08 + i * 0.07, ease: "easeOut" }}
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
        />
      ))}
    </motion.svg>
  );
}

function ConstellationStatic({
  nodes,
  edges,
}: {
  nodes: ReturnType<typeof layoutConstellation>["nodes"];
  edges: ReturnType<typeof layoutConstellation>["edges"];
}) {
  return (
    <>
      {edges.map((edge) => {
        const a = nodes[edge.from];
        const b = nodes[edge.to];
        if (!a || !b) return null;
        return (
          <line
            key={`e-${edge.from}-${edge.to}`}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke="currentColor"
            strokeWidth={1.25}
            strokeLinecap="round"
            opacity={0.45}
          />
        );
      })}
      {nodes.map((node) => (
        <circle
          key={node.id}
          cx={node.x}
          cy={node.y}
          r={4.5}
          fill="currentColor"
          opacity={0.75}
        />
      ))}
    </>
  );
}
