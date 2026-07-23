import type { SVGProps } from "react";

function IconFrame(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.25} strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
      {props.children}
    </svg>
  );
}

export function IconWriting(props: SVGProps<SVGSVGElement>) {
  return (
    <IconFrame {...props}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
    </IconFrame>
  );
}

export function IconPodcast(props: SVGProps<SVGSVGElement>) {
  return (
    <IconFrame {...props}>
      <path d="M12 14a3 3 0 100-6 3 3 0 000 6z" />
      <path d="M12 18v3M9 21h6M8 11V9a4 4 0 018 0v2M16 11v1a4 4 0 01-8 0v-1" />
    </IconFrame>
  );
}

export function IconPatterns(props: SVGProps<SVGSVGElement>) {
  return (
    <IconFrame {...props}>
      <circle cx={8} cy={8} r={2} />
      <circle cx={16} cy={8} r={2} />
      <circle cx={8} cy={16} r={2} />
      <circle cx={16} cy={16} r={2} />
      <path d="M10 8h4M8 10v4M16 10v4M10 16h4" opacity={0.65} />
    </IconFrame>
  );
}

export function IconCritique(props: SVGProps<SVGSVGElement>) {
  return (
    <IconFrame {...props}>
      <path d="M8 10h8M8 14h5" />
      <rect x={4} y={5} width={16} height={14} rx={2} />
      <path d="M9 18l-2 3M15 18l2 3" />
    </IconFrame>
  );
}

export function IconTechnical(props: SVGProps<SVGSVGElement>) {
  return (
    <IconFrame {...props}>
      <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" />
    </IconFrame>
  );
}

export function IconFutureCommunity(props: SVGProps<SVGSVGElement>) {
  return (
    <IconFrame {...props}>
      <circle cx={12} cy={10} r={3} />
      <path d="M6.5 19a5.5 5.5 0 0111 0" />
      <path d="M4 12h2M18 12h2M12 4v2" opacity={0.55} />
    </IconFrame>
  );
}
