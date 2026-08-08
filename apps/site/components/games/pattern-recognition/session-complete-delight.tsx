"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

import { trackSessionDelightShown } from "@/lib/games/pattern-recognition/analytics";
import type { SessionMode } from "@/lib/games/pattern-recognition/daily";
import {
  CONSTELLATION_VIEWBOX,
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
      className="pointer-events-none absolute inset-x-[-1.5rem] -top-6 z-10 flex h-[min(52vw,22rem)] max-h-[22rem] min-h-[16rem] justify-center overflow-visible sm:inset-x-[-2rem] sm:-top-8"
      aria-hidden="true"
      role="presentation"
      data-testid="session-complete-delight"
      data-variant={variant}
      data-reduced-motion={reduceMotion ? "true" : "false"}
    >
      {/* Large CSS bloom — cheaper + more visible than a tiny SVG ellipse alone. */}
      <div
        className="absolute inset-[-10%] rounded-full opacity-90"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 50% 42%, color-mix(in srgb, var(--accent) 55%, transparent) 0%, color-mix(in srgb, var(--accent) 22%, transparent) 38%, transparent 72%)",
        }}
      />
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
  const { width, height } = CONSTELLATION_VIEWBOX;
  const viewBox = `0 0 ${width} ${height}`;
  const cx = width / 2;
  const cy = height / 2;

  if (reduceMotion) {
    return (
      <motion.svg
        viewBox={viewBox}
        className="relative h-full w-full text-accent"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.9 }}
        transition={{ duration: 0.12 }}
      >
        <ConstellationStatic nodes={nodes} edges={edges} />
      </motion.svg>
    );
  }

  return (
    <motion.svg
      viewBox={viewBox}
      className="relative h-full w-full text-accent drop-shadow-[0_0_28px_color-mix(in_srgb,var(--accent)_55%,transparent)]"
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 1, 0] }}
      transition={{
        duration,
        times: [0, 0.1, 0.8, 1],
        ease: "easeInOut",
      }}
    >
      {/* Layered ambient blooms for a wide, readable glow. */}
      <motion.ellipse
        cx={cx}
        cy={cy}
        rx={188}
        ry={96}
        fill="currentColor"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.28, 0.2, 0] }}
        transition={{ duration, times: [0, 0.18, 0.72, 1] }}
      />
      <motion.ellipse
        cx={cx}
        cy={cy - 8}
        rx={120}
        ry={64}
        fill="currentColor"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.34, 0.22, 0] }}
        transition={{ duration, times: [0, 0.22, 0.7, 1] }}
      />

      {edges.map((edge, i) => {
        const a = nodes[edge.from];
        const b = nodes[edge.to];
        if (!a || !b) return null;
        const d = `M ${a.x} ${a.y} L ${b.x} ${b.y}`;
        const delay = 0.14 + i * 0.06;
        return (
          <g key={`e-${edge.from}-${edge.to}`}>
            <motion.path
              d={d}
              stroke="currentColor"
              strokeWidth={5}
              strokeLinecap="round"
              fill="none"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.35 }}
              transition={{ duration: 0.55, delay, ease: "easeOut" }}
            />
            <motion.path
              d={d}
              stroke="currentColor"
              strokeWidth={2.25}
              strokeLinecap="round"
              fill="none"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.55, delay, ease: "easeOut" }}
            />
          </g>
        );
      })}

      {nodes.map((node, i) => {
        const delay = 0.05 + i * 0.07;
        const sparkleDelay = 0.4 + i * 0.08;
        return (
          <g key={node.id}>
            <motion.circle
              cx={node.x}
              cy={node.y}
              r={22}
              fill="currentColor"
              initial={{ opacity: 0, scale: 0.2 }}
              animate={{ opacity: [0, 0.42, 0.28, 0], scale: [0.2, 1.2, 1, 0.85] }}
              transition={{
                duration: 1.2,
                delay,
                times: [0, 0.25, 0.65, 1],
                ease: "easeOut",
              }}
              style={{ transformBox: "fill-box", transformOrigin: "center" }}
            />
            <motion.circle
              cx={node.x}
              cy={node.y}
              r={8}
              fill="currentColor"
              initial={{ opacity: 0, scale: 0.3 }}
              animate={{ opacity: [0, 1, 1, 0.9], scale: [0.3, 1.25, 1, 1] }}
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
              r={3.25}
              fill="var(--fg)"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0.95] }}
              transition={{ duration: 0.35, delay: delay + 0.1 }}
            />
            <motion.g
              initial={{ opacity: 0, scale: 0.2, rotate: -12, x: node.x, y: node.y }}
              animate={{
                opacity: [0, 1, 0.9, 0],
                scale: [0.2, 1.35, 1.05, 0.35],
                rotate: [-12, 10, 18],
                x: node.x,
                y: node.y,
              }}
              transition={{
                duration: 0.75,
                delay: sparkleDelay,
                times: [0, 0.35, 0.65, 1],
                ease: "easeOut",
              }}
            >
              <path d={sparklePath(14)} fill="currentColor" />
            </motion.g>
          </g>
        );
      })}

      {nodes.map((node, i) => {
        const ox = i % 2 === 0 ? -28 : 26;
        const oy = i % 3 === 0 ? -24 : i % 3 === 1 ? -14 : 18;
        return (
          <motion.g
            key={`free-sparkle-${node.id}`}
            initial={{ opacity: 0, scale: 0, x: node.x + ox, y: node.y + oy }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1.25, 0.15],
              x: node.x + ox,
              y: [node.y + oy, node.y + oy - 10, node.y + oy - 18],
            }}
            transition={{
              duration: 0.65,
              delay: 0.7 + i * 0.08,
              times: [0, 0.4, 1],
              ease: "easeOut",
            }}
          >
            <path d={sparklePath(8)} fill="currentColor" />
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
  const { width, height } = CONSTELLATION_VIEWBOX;
  return (
    <>
      <ellipse
        cx={width / 2}
        cy={height / 2}
        rx={170}
        ry={88}
        fill="currentColor"
        opacity={0.22}
      />
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
            strokeWidth={2.25}
            strokeLinecap="round"
            opacity={0.8}
          />
        );
      })}
      {nodes.map((node) => (
        <g key={node.id}>
          <circle cx={node.x} cy={node.y} r={18} fill="currentColor" opacity={0.28} />
          <circle cx={node.x} cy={node.y} r={8} fill="currentColor" opacity={0.95} />
          <circle cx={node.x} cy={node.y} r={3.25} fill="var(--fg)" opacity={0.9} />
        </g>
      ))}
    </>
  );
}
