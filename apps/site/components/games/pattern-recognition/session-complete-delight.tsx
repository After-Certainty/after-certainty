"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

import { trackSessionDelightShown } from "@/lib/games/pattern-recognition/analytics";
import type { SessionMode } from "@/lib/games/pattern-recognition/daily";
import {
  DELIGHT_DURATION_MS,
  DELIGHT_REDUCED_MOTION_MS,
  layoutConstellation,
  selectDelightVariant,
} from "@/lib/games/pattern-recognition/delight";

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
      className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-center overflow-visible"
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

/** Compact 4-point sparkle centered at origin; translate via transform. */
function sparklePath(size: number): string {
  const tip = size;
  const waist = size * 0.22;
  return `M 0 ${-tip} L ${waist} 0 L 0 ${tip} L ${-waist} 0 Z M ${-tip} 0 L 0 ${-waist} L ${tip} 0 L 0 ${waist} Z`;
}

function PatternConstellation({
  nodes,
  edges,
  reduceMotion,
}: PatternConstellationProps) {
  const duration = DELIGHT_DURATION_MS / 1000;

  if (reduceMotion) {
    return (
      <motion.svg
        viewBox="0 0 320 140"
        className="h-36 w-full max-w-md text-accent"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.85 }}
        transition={{ duration: 0.12 }}
      >
        <ConstellationStatic nodes={nodes} edges={edges} />
      </motion.svg>
    );
  }

  return (
    <motion.svg
      viewBox="0 0 320 140"
      className="h-36 w-full max-w-md text-accent drop-shadow-[0_0_18px_color-mix(in_srgb,var(--accent)_45%,transparent)]"
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 1, 0] }}
      transition={{
        duration,
        times: [0, 0.1, 0.78, 1],
        ease: "easeInOut",
      }}
    >
      {/* Soft ambient bloom — no SVG filter (Safari-friendly). */}
      <motion.ellipse
        cx={160}
        cy={72}
        rx={130}
        ry={48}
        fill="currentColor"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.18, 0.14, 0] }}
        transition={{ duration, times: [0, 0.2, 0.7, 1] }}
      />

      {edges.map((edge, i) => {
        const a = nodes[edge.from];
        const b = nodes[edge.to];
        if (!a || !b) return null;
        const d = `M ${a.x} ${a.y} L ${b.x} ${b.y}`;
        const delay = 0.16 + i * 0.07;
        return (
          <g key={`e-${edge.from}-${edge.to}`}>
            <motion.path
              d={d}
              stroke="currentColor"
              strokeWidth={3.5}
              strokeLinecap="round"
              fill="none"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.28 }}
              transition={{ duration: 0.5, delay, ease: "easeOut" }}
            />
            <motion.path
              d={d}
              stroke="currentColor"
              strokeWidth={1.75}
              strokeLinecap="round"
              fill="none"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.95 }}
              transition={{ duration: 0.5, delay, ease: "easeOut" }}
            />
          </g>
        );
      })}

      {nodes.map((node, i) => {
        const delay = 0.06 + i * 0.08;
        const sparkleDelay = 0.42 + i * 0.09;
        return (
          <g key={node.id}>
            <motion.circle
              cx={node.x}
              cy={node.y}
              r={14}
              fill="currentColor"
              initial={{ opacity: 0, scale: 0.2 }}
              animate={{ opacity: [0, 0.35, 0.22, 0], scale: [0.2, 1.15, 1, 0.9] }}
              transition={{
                duration: 1.1,
                delay,
                times: [0, 0.25, 0.65, 1],
                ease: "easeOut",
              }}
              style={{ transformBox: "fill-box", transformOrigin: "center" }}
            />
            <motion.circle
              cx={node.x}
              cy={node.y}
              r={5.5}
              fill="currentColor"
              initial={{ opacity: 0, scale: 0.3 }}
              animate={{ opacity: [0, 1, 1, 0.85], scale: [0.3, 1.2, 1, 1] }}
              transition={{
                duration: 0.55,
                delay,
                times: [0, 0.45, 0.75, 1],
                ease: "easeOut",
              }}
              style={{ transformBox: "fill-box", transformOrigin: "center" }}
            />
            <motion.circle
              cx={node.x}
              cy={node.y}
              r={2.25}
              fill="var(--fg)"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0.9] }}
              transition={{ duration: 0.35, delay: delay + 0.12 }}
            />
            <motion.g
              initial={{ opacity: 0, scale: 0.2, rotate: -12, x: node.x, y: node.y }}
              animate={{
                opacity: [0, 1, 0.85, 0],
                scale: [0.2, 1.25, 1, 0.4],
                rotate: [-12, 8, 16],
                x: node.x,
                y: node.y,
              }}
              transition={{
                duration: 0.7,
                delay: sparkleDelay,
                times: [0, 0.35, 0.65, 1],
                ease: "easeOut",
              }}
            >
              <path d={sparklePath(9)} fill="currentColor" />
            </motion.g>
          </g>
        );
      })}

      {/* A few free sparkles that drift briefly — low count, high sparkle. */}
      {nodes.slice(0, 3).map((node, i) => {
        const ox = i === 0 ? -18 : i === 1 ? 16 : -6;
        const oy = i === 0 ? -16 : i === 1 ? -12 : 14;
        return (
          <motion.g
            key={`free-sparkle-${node.id}`}
            initial={{ opacity: 0, scale: 0, x: node.x + ox, y: node.y + oy }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1.1, 0.2],
              x: node.x + ox,
              y: [node.y + oy, node.y + oy - 6, node.y + oy - 10],
            }}
            transition={{
              duration: 0.55,
              delay: 0.75 + i * 0.1,
              times: [0, 0.4, 1],
              ease: "easeOut",
            }}
          >
            <path d={sparklePath(5.5)} fill="currentColor" />
          </motion.g>
        );
      })}
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
      <ellipse cx={160} cy={72} rx={120} ry={44} fill="currentColor" opacity={0.14} />
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
            strokeWidth={1.75}
            strokeLinecap="round"
            opacity={0.7}
          />
        );
      })}
      {nodes.map((node) => (
        <g key={node.id}>
          <circle cx={node.x} cy={node.y} r={12} fill="currentColor" opacity={0.22} />
          <circle cx={node.x} cy={node.y} r={5.5} fill="currentColor" opacity={0.95} />
          <circle cx={node.x} cy={node.y} r={2.25} fill="var(--fg)" opacity={0.9} />
        </g>
      ))}
    </>
  );
}
