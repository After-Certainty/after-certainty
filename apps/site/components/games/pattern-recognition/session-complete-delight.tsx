"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useRef, type ReactNode } from "react";

import { trackSessionDelightShown } from "@/lib/games/pattern-recognition/analytics";
import type { SessionMode } from "@/lib/games/pattern-recognition/daily";
import {
  CONSTELLATION_VIEWBOX,
  layoutConstellation,
  selectDelightVariant,
  type SessionPatternInput,
} from "@/lib/games/pattern-recognition/delight";

const LABEL_LINE_HEIGHT = 12;

type SessionCompleteDelightProps = {
  mode: SessionMode;
  patterns: readonly SessionPatternInput[];
  insightXp: number;
  challengeCount: number;
  dominantCount: number;
  footnote?: ReactNode;
  children?: ReactNode;
};

const easeOut = [0.22, 1, 0.36, 1] as const;

/**
 * Session-complete results with Pattern Constellation sequencing.
 * Decorative SVG is non-interactive; CTAs (children) stay usable throughout.
 */
export function SessionCompleteDelight({
  mode,
  patterns,
  insightXp,
  challengeCount,
  dominantCount,
  footnote,
  children,
}: SessionCompleteDelightProps) {
  const reduceMotion = Boolean(useReducedMotion());
  const variant = selectDelightVariant();
  const trackedRef = useRef(false);

  const { nodes, edges } = useMemo(() => layoutConstellation(patterns), [patterns]);
  const patternCount = nodes.length;

  useEffect(() => {
    if (trackedRef.current) return;
    trackedRef.current = true;
    trackSessionDelightShown({ variantId: variant, mode });
  }, [mode, variant]);

  const supporting =
    challengeCount === 5
      ? `Five situations. ${patternCount} pattern${patternCount === 1 ? "" : "s"} noticed. The connections are starting to show.`
      : `${challengeCount} situations. ${patternCount} pattern${patternCount === 1 ? "" : "s"} noticed. The connections are starting to show.`;

  return (
    <div
      className="mx-auto max-w-xl px-4 py-10 sm:px-6"
      data-testid="session-complete-delight"
      data-variant={variant}
      data-reduced-motion={reduceMotion ? "true" : "false"}
    >
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">
        Session complete
      </p>

      <motion.p
        className="mt-3 font-display text-2xl font-semibold tracking-tight text-accent sm:text-3xl"
        data-testid="session-insight-xp"
        initial={reduceMotion ? false : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={
          reduceMotion
            ? { duration: 0.12 }
            : { duration: 0.4, delay: 0.12, ease: easeOut }
        }
      >
        {insightXp > 0 ? `+${insightXp} Insight XP` : "Insight logged"}
      </motion.p>

      <div
        className="pointer-events-none relative mx-auto mt-6 h-[280px] w-full max-w-lg sm:mt-8 sm:h-[320px]"
        aria-hidden="true"
        role="presentation"
      >
        <PatternConstellation
          nodes={nodes}
          edges={edges}
          reduceMotion={reduceMotion}
        />
      </div>

      <motion.div
        className="mt-2 text-center"
        initial={reduceMotion ? false : { opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={
          reduceMotion
            ? { duration: 0.12 }
            : { duration: 0.45, delay: 1.55, ease: easeOut }
        }
      >
        <p className="font-display text-xl font-medium tracking-tight text-fg sm:text-2xl">
          Patterns travel.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted">{supporting}</p>
      </motion.div>

      <motion.dl
        className="mt-8 grid grid-cols-3 gap-3 text-center"
        data-testid="session-complete-stats"
        initial={reduceMotion ? false : { opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={
          reduceMotion
            ? { duration: 0.12 }
            : { duration: 0.4, delay: 1.8, ease: easeOut }
        }
      >
        <div>
          <dt className="text-[10px] uppercase tracking-[0.18em] text-muted">Challenges</dt>
          <dd className="mt-1 font-display text-2xl text-fg">{challengeCount}</dd>
        </div>
        <div>
          <dt className="text-[10px] uppercase tracking-[0.18em] text-muted">Dominant</dt>
          <dd className="mt-1 font-display text-2xl text-fg">{dominantCount}</dd>
        </div>
        <div>
          <dt className="text-[10px] uppercase tracking-[0.18em] text-muted">Patterns</dt>
          <dd className="mt-1 font-display text-2xl text-fg">{patternCount}</dd>
        </div>
      </motion.dl>

      {footnote ? (
        <motion.div
          className="mt-5 text-sm leading-relaxed text-muted"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={
            reduceMotion
              ? { duration: 0.12 }
              : { duration: 0.35, delay: 1.9, ease: easeOut }
          }
        >
          {footnote}
        </motion.div>
      ) : null}

      {children ? <div className="relative z-20 mt-8">{children}</div> : null}
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
  const { width, height } = CONSTELLATION_VIEWBOX;
  const viewBox = `0 0 ${width} ${height}`;

  if (reduceMotion) {
    return (
      <motion.svg
        viewBox={viewBox}
        className="h-full w-full text-accent"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
      >
        <ConstellationStatic nodes={nodes} edges={edges} showLabels />
      </motion.svg>
    );
  }

  return (
    <svg viewBox={viewBox} className="h-full w-full text-accent">
      {edges.map((edge, i) => {
        const a = nodes[edge.from];
        const b = nodes[edge.to];
        if (!a || !b) return null;
        const d = `M ${a.x} ${a.y} L ${b.x} ${b.y}`;
        return (
          <motion.path
            key={`e-${edge.from}-${edge.to}`}
            d={d}
            stroke="currentColor"
            strokeWidth={1.15}
            strokeLinecap="round"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.48 }}
            transition={{
              pathLength: { duration: 0.52, delay: 0.48 + i * 0.1, ease: easeOut },
              opacity: { duration: 0.2, delay: 0.48 + i * 0.1 },
            }}
          />
        );
      })}

      {nodes.map((node, i) => (
        <motion.circle
          key={node.id}
          cx={node.x}
          cy={node.y}
          r={node.r}
          fill="currentColor"
          initial={{ opacity: 0, scale: 0.25 }}
          animate={{ opacity: 1, scale: [0.25, 1.22, 1] }}
          transition={{
            duration: 0.55,
            delay: 0.1 + i * 0.12,
            times: [0, 0.65, 1],
            ease: easeOut,
          }}
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
        />
      ))}

      {nodes.map((node, i) => (
        <ConstellationLabel
          key={`label-${node.id}`}
          node={node}
          animate
          delay={1.18 + i * 0.04}
        />
      ))}
    </svg>
  );
}

function ConstellationLabel({
  node,
  animate,
  delay = 0,
}: {
  node: ReturnType<typeof layoutConstellation>["nodes"][number];
  animate?: boolean;
  delay?: number;
}) {
  const { label } = node;
  const textProps = {
    x: label.x,
    textAnchor: label.anchor,
    className: "fill-current text-[11px]",
    style: {
      fill: "var(--muted)",
      dominantBaseline: label.baseline,
    } as const,
  };

  if (!animate) {
    return (
      <text {...textProps} y={label.y} opacity={0.85}>
        {label.lines.map((line, lineIndex) => (
          <tspan
            key={`${node.id}-line-${lineIndex}`}
            x={label.x}
            dy={lineIndex === 0 ? 0 : LABEL_LINE_HEIGHT}
          >
            {line}
          </tspan>
        ))}
      </text>
    );
  }

  return (
    <motion.text
      {...textProps}
      initial={{ opacity: 0, y: label.y + 4 }}
      animate={{ opacity: 0.85, y: label.y }}
      transition={{ duration: 0.4, delay, ease: easeOut }}
    >
      {label.lines.map((line, lineIndex) => (
        <tspan
          key={`${node.id}-line-${lineIndex}`}
          x={label.x}
          dy={lineIndex === 0 ? 0 : LABEL_LINE_HEIGHT}
        >
          {line}
        </tspan>
      ))}
    </motion.text>
  );
}

function ConstellationStatic({
  nodes,
  edges,
  showLabels,
}: {
  nodes: ReturnType<typeof layoutConstellation>["nodes"];
  edges: ReturnType<typeof layoutConstellation>["edges"];
  showLabels?: boolean;
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
            strokeWidth={1.15}
            strokeLinecap="round"
            opacity={0.48}
          />
        );
      })}
      {nodes.map((node) => (
        <circle
          key={node.id}
          cx={node.x}
          cy={node.y}
          r={node.r}
          fill="currentColor"
          opacity={0.95}
        />
      ))}
      {showLabels
        ? nodes.map((node) => (
            <ConstellationLabel key={`label-${node.id}`} node={node} />
          ))
        : null}
    </>
  );
}
