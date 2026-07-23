import Image from "next/image";

const sizeClasses = {
  default: "h-40 w-[6.75rem]",
  compact: "h-28 w-[4.5rem]",
} as const;

const imageSizes = {
  default: "108px",
  compact: "72px",
} as const;

type BookCoverThumbnailProps = {
  src?: string | null;
  size?: keyof typeof sizeClasses;
  className?: string;
};

export function BookCoverThumbnail({
  src,
  size = "default",
  className = "",
}: BookCoverThumbnailProps) {
  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-sm border border-border/50 bg-bg-elevated ${sizeClasses[size]} ${className}`}
    >
      {src ? (
        <Image
          src={src}
          alt=""
          fill
          className="object-cover"
          sizes={imageSizes[size]}
        />
      ) : (
        <div
          className="absolute inset-0 bg-gradient-to-br from-accent/18 via-bg-elevated to-bg"
          aria-hidden
        />
      )}
    </div>
  );
}
