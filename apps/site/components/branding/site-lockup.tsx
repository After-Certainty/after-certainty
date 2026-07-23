import Image from "next/image";
import Link from "next/link";
import { brandMarks } from "@/lib/branding";
import { siteConfig } from "@/lib/site-config";

type LockupVariant = "header" | "footer";

export function SiteLockup({ variant }: { variant: LockupVariant }) {
  const src = variant === "footer" ? brandMarks.whiteClear : brandMarks.goldClear;
  const isFooter = variant === "footer";

  return (
    <Link
      href="/"
      className="group inline-flex max-w-full flex-nowrap items-center gap-2 sm:gap-3 transition-opacity hover:opacity-90"
    >
      <Image
        src={src}
        alt=""
        width={768}
        height={512}
        className={
          isFooter
            ? "h-14 w-auto max-w-[200px] shrink-0 object-contain object-left md:h-[4.5rem]"
            : "h-8 w-auto max-w-[100px] shrink-0 object-contain object-left sm:h-9 sm:max-w-[120px] md:h-10 md:max-w-[140px]"
        }
        sizes={isFooter ? "(max-width: 768px) 180px, 200px" : "(max-width: 768px) 130px, 150px"}
      />
      <span
        className={`min-w-0 font-display text-fg transition-colors group-hover:text-accent ${
          isFooter
            ? "text-xl tracking-[0.28em] md:text-2xl"
            : "text-sm tracking-[0.22em] sm:text-base sm:tracking-[0.26em] md:text-lg md:tracking-[0.28em]"
        }`}
      >
        {siteConfig.name.toUpperCase()}
      </span>
    </Link>
  );
}
