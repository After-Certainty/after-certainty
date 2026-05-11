import { cn } from "@/lib/books/when-others-look-to-you/cn";

type ContainerProps = {
  children: React.ReactNode;
  className?: string;
};

export function Container({ children, className }: ContainerProps) {
  return (
    <div className={cn("container-centered w-full", className)}>
      {children}
    </div>
  );
}
