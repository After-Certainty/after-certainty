import Image from "next/image";
import { cn } from "@/lib/cn";

export type ContributorCardProps = {
  name: string;
  role?: string;
  bio?: string;
  links?: { label: string; href: string }[];
  avatarUrl?: string;
  /** Reserved slot styling for forthcoming profiles */
  placeholder?: boolean;
  className?: string;
};

export function ContributorCard({
  name,
  role,
  bio,
  links,
  avatarUrl,
  placeholder,
  className,
}: ContributorCardProps) {
  return (
    <article
      className={cn(
        "relative flex flex-col rounded-sm border p-6 transition-colors duration-300 md:p-7",
        placeholder
          ? "border-dashed border-border/40 bg-bg/[0.2]"
          : "border-border/35 bg-bg-elevated/[0.06] hover:border-accent/18 hover:bg-bg-elevated/[0.09]",
        className,
      )}
    >
      <div className="flex gap-4">
        <div
          className={cn(
            "relative h-14 w-14 shrink-0 overflow-hidden rounded-full border border-border/35 bg-bg-elevated/[0.2]",
            placeholder && "border-dashed",
          )}
        >
          {avatarUrl ? (
            <Image src={avatarUrl} alt="" fill className="object-cover" sizes="56px" />
          ) : (
            <span className="flex h-full w-full items-center justify-center font-display text-xs tracking-[0.2em] text-muted">
              {placeholder ? "—" : name.slice(0, 1)}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs uppercase tracking-[0.28em] text-muted">{role ?? "Contributor"}</p>
          <h3 className="mt-1 font-display text-xl tracking-tight text-fg">{name}</h3>
        </div>
      </div>
      {bio ? <p className="mt-5 text-[15px] leading-relaxed text-muted">{bio}</p> : null}
      {links && links.length > 0 ? (
        <ul className="mt-5 space-y-2 border-t border-border/25 pt-5">
          {links.map((link) => (
            <li key={`${link.href}-${link.label}`}>
              <a
                className="text-sm text-accent underline-offset-4 transition-colors duration-200 hover:text-fg hover:underline"
                href={link.href}
                {...(link.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}
