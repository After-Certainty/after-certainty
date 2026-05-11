import { cn } from "@/lib/books/when-others-look-to-you/cn";

/**
 * Official Medium symbol (black RGB).
 * Source file: https://github.com/Medium/medium-logos/blob/master/03_Symbol/01_Black/SVG/Medium-Symbol-Black-RGB.svg
 * Brand guidelines: https://medium.design/logos-and-brand-guidelines-f1a01a733592
 */
export function MediumSymbol({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1633.77 1150.51"
      className={cn("shrink-0", className)}
      aria-hidden
    >
      <path
        fill="currentColor"
        d="M883.45,576.26c0,163.67-131.78,296.35-294.33,296.35S294.78,739.93,294.78,576.26,426.56,279.9,589.12,279.9,883.45,412.59,883.45,576.26"
      />
      <path
        fill="currentColor"
        d="M1206.34,576.26c0,154.06-65.89,279-147.17,279S912,730.32,912,576.26s65.88-279,147.16-279,147.17,124.9,147.17,279"
      />
      <path
        fill="currentColor"
        d="M1338.41,576.26c0,138-23.17,249.94-51.76,249.94s-51.75-111.91-51.75-249.94,23.17-249.94,51.75-249.94,51.76,111.9,51.76,249.94"
      />
    </svg>
  );
}
