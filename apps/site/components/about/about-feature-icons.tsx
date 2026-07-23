import type { SVGProps } from "react";

function IconFrame(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.15}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    />
  );
}

export function IconBooks(props: SVGProps<SVGSVGElement>) {
  return (
    <IconFrame {...props}>
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
      <path d="M8 7h8M8 11h6" opacity={0.55} />
    </IconFrame>
  );
}

export function IconEssays(props: SVGProps<SVGSVGElement>) {
  return (
    <IconFrame {...props}>
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <path d="M14 2v6h6M8 13h8M8 17h5" opacity={0.55} />
    </IconFrame>
  );
}

export function IconPodcast(props: SVGProps<SVGSVGElement>) {
  return (
    <IconFrame {...props}>
      <path d="M12 14a3 3 0 100-6 3 3 0 000 6z" />
      <path d="M19 10v2a7 7 0 01-14 0v-2" />
      <path d="M12 18v3M9 21h6" />
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
      <path d="M10 8h4M8 10v4M16 10v4M10 16h4" opacity={0.55} />
    </IconFrame>
  );
}

export function IconCollaboration(props: SVGProps<SVGSVGElement>) {
  return (
    <IconFrame {...props}>
      <path d="M12 3v3M5 9l2 2M19 9l-2 2M5 15l2-2M19 15l-2-2M12 18v3" />
      <circle cx={12} cy={12} r={3} />
    </IconFrame>
  );
}

export function IconInfrastructure(props: SVGProps<SVGSVGElement>) {
  return (
    <IconFrame {...props}>
      <rect x={3} y={4} width={18} height={6} rx={1} />
      <rect x={3} y={14} width={18} height={6} rx={1} />
      <path d="M7 10v4M12 10v4M17 10v4" opacity={0.55} />
    </IconFrame>
  );
}
