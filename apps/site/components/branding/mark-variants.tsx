import Image from "next/image";
import { brandMarks } from "@/lib/branding";

const variants = [
  {
    src: brandMarks.goldClear,
    label: "Gold · transparent field",
    detail: "Default mark on dark or photographic backgrounds.",
  },
  {
    src: brandMarks.whiteClear,
    label: "White · transparent field",
    detail: "Reversed spark when contrast calls for a lighter foreground.",
  },
  {
    src: brandMarks.goldDisc,
    label: "Gold · black disc",
    detail: "Contained lockup with halo room for social avatars or circular crops.",
  },
  {
    src: brandMarks.goldChip,
    label: "Gold · rounded chip",
    detail: "Button-like tile for UI chrome, badges, and favicon derivation.",
  },
] as const;

export function MarkVariants() {
  return (
    <div className="border-t border-border/60 pt-12">
      <h2 className="font-display text-2xl tracking-tight text-fg">Mark variants</h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
        Four exported treatments from the master artwork—use the minimal spark on photography, the disc where circular
        framing is required, and the chip inside interactive surfaces.
      </p>
      <ul className="mt-10 grid gap-10 sm:grid-cols-2">
        {variants.map((item) => (
          <li key={item.src}>
            <figure className="rounded-sm border border-border/50 bg-bg-elevated/40 p-6">
              <Image
                src={item.src}
                alt=""
                width={768}
                height={512}
                sizes="(max-width: 768px) 90vw, 42vw"
                className="mx-auto h-auto w-full max-h-52 object-contain object-center md:max-h-56"
              />
              <figcaption className="mt-4">
                <p className="text-sm font-medium text-fg">{item.label}</p>
                <p className="mt-1 text-sm text-muted">{item.detail}</p>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </div>
  );
}
