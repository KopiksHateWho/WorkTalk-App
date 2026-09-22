import { GlassBackground } from "@/components/GlassBackground";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowLeft, Compass } from "lucide-react";
import { Link } from "react-router";

export default function NotFound() {
  return (
    <div className="relative flex min-h-dvh items-center justify-center px-4">
      <GlassBackground />
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <GlassCard tone="strong" className="flex flex-col items-center gap-4 p-8 text-center">
          <span
            className="grid size-14 place-items-center rounded-3xl bg-brand-mark text-white shadow-lg"
            aria-hidden="true"
          >
            <Compass className="size-7" />
          </span>
          <div>
            <p className="text-4xl font-extrabold text-slate-900">404</p>
            <h1 className="mt-1 text-xl text-slate-900">
              We couldn't find that page
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              The link may be old, or the page moved. Your XP is safe — head back
              to your dashboard and keep practicing.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              asChild
              className="gap-2 rounded-full bg-brand text-white"
            >
              <Link to="/home">
                <ArrowLeft className="size-4" aria-hidden="true" />
                Back to dashboard
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="rounded-full border-white/80 bg-white/70 text-slate-700"
            >
              <Link to="/">Go to landing page</Link>
            </Button>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
