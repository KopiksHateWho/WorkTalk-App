import { cn } from "@/lib/utils";
import type { ElementType, ReactNode } from "react";

type GlassTone = "default" | "strong" | "subtle" | "inset";

const TONES: Record<GlassTone, string> = {
  default: "glass",
  strong: "glass-strong",
  subtle: "glass-subtle",
  inset: "glass-inset",
};

export interface GlassCardProps {
  children: ReactNode;
  id?: string;
  className?: string;
  tone?: GlassTone;
  /** Adds hover lift + pointer styling for clickable cards. */
  interactive?: boolean;
  as?: ElementType;
}

export function GlassCard({
  children,
  id,
  className,
  tone = "default",
  interactive = false,
  as: Component = "div",
}: GlassCardProps) {
  return (
    <Component
      id={id}
      className={cn(
        "rounded-3xl",
        TONES[tone],
        interactive && "glass-hover",
        className,
      )}
    >
      {children}
    </Component>
  );
}
