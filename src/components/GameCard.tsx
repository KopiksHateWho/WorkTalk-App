import { GlassCard } from "@/components/GlassCard";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router";

export interface GameCardProps {
  emoji: string;
  title: string;
  description: string;
  href: string;
  ctaLabel: string;
  meta?: ReactNode;
  featured?: boolean;
  tone?: "indigo" | "amber" | "teal";
  className?: string;
}

const TONE_RING = {
  indigo: "from-indigo-500/20 via-blue-400/10 to-transparent",
  amber: "from-amber-400/25 via-orange-300/10 to-transparent",
  teal: "from-teal-400/25 via-cyan-300/10 to-transparent",
} as const;

export function GameCard({
  emoji,
  title,
  description,
  href,
  ctaLabel,
  meta,
  featured = false,
  tone = "indigo",
  className,
}: GameCardProps) {
  return (
    <GlassCard
      interactive
      tone={featured ? "strong" : "default"}
      className={cn(
        "relative flex h-full flex-col gap-4 overflow-hidden p-5",
        featured && "sm:p-6",
        className,
      )}
    >
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute -top-16 -right-10 size-40 rounded-full bg-gradient-to-br blur-2xl",
          TONE_RING[tone],
        )}
      />
      <div className="relative flex items-center gap-3">
        <span
          className={cn(
            "grid shrink-0 place-items-center rounded-2xl bg-white/80 shadow-sm",
            featured ? "size-14 text-3xl" : "size-12 text-2xl",
          )}
          aria-hidden="true"
        >
          {emoji}
        </span>
        <h3
          className={cn(
            "font-bold text-slate-900",
            featured ? "text-lg" : "text-base",
          )}
        >
          {title}
        </h3>
      </div>

      <p className="relative text-sm leading-6 text-slate-600">{description}</p>
      {meta ? <div className="relative flex flex-wrap gap-2">{meta}</div> : null}

      <Link
        to={href}
        className={cn(
          buttonVariants({ size: featured ? "lg" : "default" }),
          "relative mt-auto w-full gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-blue-500 text-white shadow-sm hover:opacity-95",
        )}
      >
        {ctaLabel}
        <ChevronRight className="size-4" aria-hidden="true" />
      </Link>
    </GlassCard>
  );
}
