"use client";

import { useReducedMotion } from "framer-motion";

type ObservatoryAtmosphereProps = {
  /** Defer particles on dense graphs */
  particleCount?: number;
};

export function ObservatoryAtmosphere({ particleCount = 16 }: ObservatoryAtmosphereProps) {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) return null;

  const count = Math.min(particleCount, 20);
  const particles = Array.from({ length: count }, (_, i) => i);

  return (
    <div className="obs-atmosphere pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {particles.map((i) => (
        <span
          key={i}
          className="obs-atmosphere-particle"
          style={{
            left: `${(i * 17) % 100}%`,
            top: `${(i * 23) % 100}%`,
            animationDelay: `${(i % 7) * 0.8}s`,
            animationDuration: `${14 + (i % 5) * 2}s`,
          }}
        />
      ))}
    </div>
  );
}
