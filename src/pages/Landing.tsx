import { Chip } from "@/components/Badges";
import { GlassBackground } from "@/components/GlassBackground";
import { GlassCard } from "@/components/GlassCard";
import { Wordmark } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Briefcase,
  CheckCircle2,
  Flame,
  GraduationCap,
  Mic,
  Sparkles,
  Star,
  Target,
  Zap,
} from "lucide-react";
import { Link } from "react-router";

const STEPS = [
  {
    number: "01",
    title: "Choose your level",
    description: "Basic or intermediate. The coach changes its questions and hints.",
  },
  {
    number: "02",
    title: "Choose a career topic",
    description: "Interviews, meetings, customer service — the English you will really use.",
  },
  {
    number: "03",
    title: "Practice out loud",
    description: "Speak your answer and watch it appear in the conversation instantly.",
  },
  {
    number: "04",
    title: "Get feedback",
    description: "Your sentence comes back more natural, with a short explanation and a tip.",
  },
  {
    number: "05",
    title: "Level up",
    description: "Earn XP, keep your streak and unlock badges as your confidence grows.",
  },
];

const PRACTICE_TYPES = [
  {
    emoji: "🎮",
    title: "Vocabulary",
    description: "Guess the meaning of workplace words and read a real example sentence.",
    to: "/games/vocabulary",
  },
  {
    emoji: "⚡",
    title: "Quick quiz",
    description: "Short workplace situations: choose the best response and learn why.",
    to: "/games/quiz",
  },
  {
    emoji: "🎙️",
    title: "Speaking",
    description: "The main event: multi-turn conversations with feedback after every answer.",
    to: "/speaking",
    highlight: true,
  },
  {
    emoji: "💼",
    title: "Career English",
    description: "Eight career topics, from self introduction to professional emails.",
    to: "/learn",
  },
];

const LOOP = [
  "You speak",
  "The coach understands",
  "It corrects your sentence",
  "You try again",
  "You improve",
  "You earn XP",
];

const CONVERSATION = [
  { role: "ai" as const, text: "Hi! Nice to meet you. Tell me about yourself." },
  { role: "user" as const, text: "I am a student and I am interested in marketing." },
  { role: "ai" as const, text: "Great! What are your skills?" },
];

export default function Landing() {
  const { isAuthenticated } = useAuth();

  const primaryTo = isAuthenticated ? "/home" : "/signup";
  const primaryLabel = isAuthenticated ? "Go to dashboard" : "Get started free";

  return (
    <div className="relative min-h-dvh overflow-x-hidden">
      <GlassBackground />

      {/* Top bar */}
      <header className="sticky top-0 z-40 px-3 pt-3 sm:px-5">
        <nav
          aria-label="Landing navigation"
          className="glass-strong mx-auto flex w-full max-w-6xl items-center justify-between gap-3 rounded-3xl px-4 py-2.5"
        >
          <Wordmark />
          <div className="hidden items-center gap-1 md:flex">
            <a
              href="#how-it-works"
              className="rounded-full px-3.5 py-2 text-sm font-semibold text-slate-600 hover:bg-white/60 hover:text-slate-900"
            >
              How it works
            </a>
            <a
              href="#practice"
              className="rounded-full px-3.5 py-2 text-sm font-semibold text-slate-600 hover:bg-white/60 hover:text-slate-900"
            >
              What you can practice
            </a>
            <a
              href="#why"
              className="rounded-full px-3.5 py-2 text-sm font-semibold text-slate-600 hover:bg-white/60 hover:text-slate-900"
            >
              Why it works
            </a>
          </div>
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <Button asChild className="bg-brand rounded-full text-white">
                <Link to="/home">Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button
                  asChild
                  variant="ghost"
                  className="rounded-full text-slate-700"
                >
                  <Link to="/login">Log in</Link>
                </Button>
                <Button asChild className="bg-brand rounded-full text-white">
                  <Link to="/signup">Sign up</Link>
                </Button>
              </>
            )}
          </div>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6">
        {/* Hero */}
        <section className="grid gap-10 pt-14 pb-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:pt-20">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-6"
          >
            <Chip className="w-fit">
              <Mic className="size-3.5 text-indigo-600" aria-hidden="true" />
              Speaking first · built for contests and careers
            </Chip>

            <div>
              <p className="text-sm font-bold tracking-[0.3em] text-slate-500 uppercase">
                WorkTalk Quest
              </p>
              <h1 className="mt-3 text-4xl leading-[1.06] text-slate-900 sm:text-5xl lg:text-6xl">
                English Speaking
                <br />
                Practice for
                <br />
                <span className="text-gradient-cool">Your Career</span>
              </h1>
            </div>

            <p className="max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
              Learn something new every day — then say it out loud. WorkTalk Quest
              turns
              real workplace English into a friendly challenge: you speak, the
              coach listens, your sentence comes back more natural, and you try
              again until it sounds like you.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="bg-brand gap-2 rounded-full px-8 text-white shadow-sm"
              >
                <Link to={primaryTo}>
                  {primaryLabel}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full border-white/80 bg-white/65 px-8 text-slate-700 backdrop-blur-md"
              >
                <a href="#how-it-works">Explore</a>
              </Button>
            </div>

            <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2
                  className="size-4 text-emerald-600"
                  aria-hidden="true"
                />
                No password needed
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2
                  className="size-4 text-emerald-600"
                  aria-hidden="true"
                />
                Guest mode included
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2
                  className="size-4 text-emerald-600"
                  aria-hidden="true"
                />
                Works on your phone
              </span>
            </div>
          </motion.div>

          {/* Conversation preview */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="relative"
          >
            <GlassCard
              tone="strong"
              className="relative flex flex-col gap-4 p-5 sm:p-6"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span
                    className="bg-brand-mark grid size-9 place-items-center rounded-2xl text-white"
                    aria-hidden="true"
                  >
                    <Sparkles className="size-4" />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      Speaking practice
                    </p>
                    <p className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
                      Topic · Self introduction
                    </p>
                  </div>
                </div>
                <Chip className="hidden sm:inline-flex">🟢 Basic</Chip>
              </div>

              <div className="flex flex-col gap-3">
                {CONVERSATION.map((line, index) => (
                  <motion.div
                    key={line.text}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.5 + index * 0.45 }}
                    className={
                      line.role === "ai"
                        ? "flex items-end gap-2"
                        : "flex flex-row-reverse items-end gap-2"
                    }
                  >
                    <span
                      className={
                        line.role === "ai"
                          ? "bg-brand-mark grid size-8 shrink-0 place-items-center rounded-2xl text-[10px] font-bold text-white"
                          : "grid size-8 shrink-0 place-items-center rounded-2xl bg-white/80 text-[10px] font-bold text-slate-600"
                      }
                      aria-hidden="true"
                    >
                      {line.role === "ai" ? "COACH" : "YOU"}
                    </span>
                    <p
                      className={
                        line.role === "ai"
                          ? "max-w-[85%] rounded-3xl rounded-bl-md border border-white/70 bg-white/70 px-4 py-3 text-sm text-slate-800 shadow-sm"
                          : "max-w-[85%] rounded-3xl rounded-br-md border border-indigo-500/20 bg-indigo-500/12 px-4 py-3 text-sm text-slate-800 shadow-sm"
                      }
                    >
                      {line.text}
                    </p>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.9 }}
                className="rounded-3xl border border-emerald-600/20 bg-emerald-500/10 p-4"
              >
                <p className="text-[11px] font-bold tracking-[0.12em] text-emerald-700 uppercase">
                  Coaching moment
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  You said “I am good{" "}
                  <span className="font-semibold text-rose-600">in</span>{" "}
                  communication.”
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  A more natural way: “I am good{" "}
                  <span className="text-emerald-700">at</span> communication.”
                </p>
                <p className="mt-1 text-xs text-slate-600">
                  Use “good at” before a skill. +15 XP earned 🎉
                </p>
              </motion.div>

              <div className="flex items-center justify-between gap-3 rounded-2xl bg-white/55 p-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                  <span className="relative flex size-3" aria-hidden="true">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-rose-400/70" />
                    <span className="relative inline-flex size-3 rounded-full bg-rose-500" />
                  </span>
                  Recording 0:08 / 0:20
                </div>
                <span
                  className="bg-brand-mark grid size-11 place-items-center rounded-full text-white"
                  aria-hidden="true"
                >
                  <Mic className="size-5" />
                </span>
              </div>
            </GlassCard>

            <div
              aria-hidden="true"
              className="animate-float absolute -top-6 -right-4 hidden rounded-2xl border border-white/70 bg-white/70 px-4 py-3 shadow-lg backdrop-blur-md sm:block"
            >
              <p className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <Star className="size-3.5 fill-amber-400 text-amber-500" />
                +140 XP per session
              </p>
            </div>
            <div
              aria-hidden="true"
              className="animate-float absolute -bottom-6 -left-4 hidden rounded-2xl border border-white/70 bg-white/70 px-4 py-3 shadow-lg backdrop-blur-md [animation-delay:-5s] sm:block"
            >
              <p className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <Flame className="size-3.5 text-orange-500" />
                5 day streak
              </p>
            </div>
          </motion.div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="scroll-mt-24 py-16">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold tracking-[0.18em] text-indigo-700 uppercase">
              How it works
            </p>
            <h2 className="mt-3 text-3xl text-slate-900 sm:text-4xl">
              Five steps from “hello” to hired
            </h2>
            <p className="mt-3 text-base leading-7 text-slate-600">
              A repeatable loop you can finish in five minutes a day.
            </p>
          </div>

          <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {STEPS.map((step, index) => (
              <motion.li
                key={step.number}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.35, delay: index * 0.06 }}
              >
                <GlassCard interactive className="flex h-full flex-col gap-2 p-5">
                  <span className="text-sm font-bold text-indigo-700">
                    {step.number}
                  </span>
                  <h3 className="text-base font-bold text-slate-900">
                    {step.title}
                  </h3>
                  <p className="text-sm leading-6 text-slate-600">
                    {step.description}
                  </p>
                </GlassCard>
              </motion.li>
            ))}
          </ol>
        </section>

        {/* Practice types */}
        <section id="practice" className="scroll-mt-24 py-16">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold tracking-[0.18em] text-indigo-700 uppercase">
              What can you practice?
            </p>
            <h2 className="mt-3 text-3xl text-slate-900 sm:text-4xl">
              Three quick actions, one goal
            </h2>
            <p className="mt-3 text-base leading-7 text-slate-600">
              🎮 Play · ⚡ Quiz · 🎙️ Speak. Speaking is the main event — the others
              warm you up for it.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PRACTICE_TYPES.map((item) => (
              <GlassCard
                key={item.title}
                tone={item.highlight ? "strong" : "default"}
                interactive
                className="flex h-full flex-col gap-3 p-5"
              >
                <span className="text-3xl" aria-hidden="true">
                  {item.emoji}
                </span>
                <h3 className="flex items-center gap-2 text-base font-bold text-slate-900">
                  {item.title}
                  {item.highlight ? (
                    <span className="rounded-full border border-indigo-600/25 bg-indigo-500/10 px-2 py-0.5 text-[10px] font-bold tracking-wide text-indigo-700 uppercase">
                      Main
                    </span>
                  ) : null}
                </h3>
                <p className="text-sm leading-6 text-slate-600">
                  {item.description}
                </p>
                <Link
                  to={item.to}
                  className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-indigo-700 hover:underline"
                >
                  Try it
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </Link>
              </GlassCard>
            ))}
          </div>
        </section>

        {/* Why it works */}
        <section id="why" className="scroll-mt-24 py-16">
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div className="flex flex-col gap-4">
              <p className="text-xs font-bold tracking-[0.18em] text-indigo-700 uppercase">
                Why it works
              </p>
              <h2 className="text-3xl text-slate-900 sm:text-4xl">
                Speaking is the skill contests and employers actually test
              </h2>
              <p className="text-base leading-7 text-slate-600">
                Reading grammar rules rarely prepares you for the moment you have
                to answer “Tell me about yourself” — in an interview, on stage, or
                in front of a panel of judges. WorkTalk Quest puts you in that moment,
                safely, every day.
              </p>
              <ul className="flex flex-col gap-3">
                {[
                  {
                    icon: Target,
                    text: "Eight career topics: interviews, meetings, teamwork, customer service and more.",
                  },
                  {
                    icon: GraduationCap,
                    text: "Basic and intermediate modes, so you are never thrown in at the deep end.",
                  },
                  {
                    icon: BadgeCheck,
                    text: "Honest feedback: real transcript analysis, no invented pronunciation scores.",
                  },
                  {
                    icon: Flame,
                    text: "A daily mission you can finish in one minute — the easiest way to build the habit before contest day.",
                  },
                ].map((item) => (
                  <li key={item.text} className="flex items-start gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-2xl bg-white/70 text-indigo-700 shadow-sm">
                      <item.icon className="size-4" aria-hidden="true" />
                    </span>
                    <p className="pt-1 text-sm leading-6 text-slate-700">
                      {item.text}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            <GlassCard tone="strong" className="flex flex-col gap-4 p-6">
              <h3 className="text-lg font-bold text-slate-900">
                The improvement loop
              </h3>
              <ol className="flex flex-col gap-2">
                {LOOP.map((step, index) => (
                  <li
                    key={step}
                    className="flex items-center gap-3 rounded-2xl border border-white/70 bg-white/60 p-3"
                  >
                    <span className="bg-brand-mark grid size-7 shrink-0 place-items-center rounded-full text-[11px] font-bold text-white">
                      {index + 1}
                    </span>
                    <span className="text-sm font-semibold text-slate-700">
                      {step}
                    </span>
                  </li>
                ))}
              </ol>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="rounded-2xl bg-white/60 p-3">
                  <p className="flex items-center gap-1.5 text-xs font-bold tracking-wide text-slate-500 uppercase">
                    <BookOpen className="size-3.5" aria-hidden="true" />
                    Vocabulary
                  </p>
                  <p className="font-display text-xl font-semibold text-slate-900">
                    60 words
                  </p>
                </div>
                <div className="rounded-2xl bg-white/60 p-3">
                  <p className="flex items-center gap-1.5 text-xs font-bold tracking-wide text-slate-500 uppercase">
                    <Briefcase className="size-3.5" aria-hidden="true" />
                    Career topics
                  </p>
                  <p className="font-display text-xl font-semibold text-slate-900">
                    8 topics
                  </p>
                </div>
              </div>
            </GlassCard>
          </div>
        </section>

        {/* Final CTA */}
        <section className="pb-8">
          <GlassCard
            tone="strong"
            className="relative overflow-hidden px-6 py-10 text-center sm:px-12"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-24 left-1/2 size-[28rem] -translate-x-1/2 rounded-full bg-gradient-to-b from-indigo-300/25 to-transparent blur-3xl"
            />
            <div className="relative flex flex-col items-center gap-5">
              <span className="text-4xl" aria-hidden="true">
                🎙️
              </span>
              <h2 className="max-w-2xl text-3xl text-slate-900 sm:text-4xl">
                Your first conversation takes five minutes
              </h2>
              <p className="max-w-xl text-base leading-7 text-slate-600">
                Start today and speak for 30 seconds to earn your first 100 XP.
                You can practice as a guest, then create an account whenever you
                are ready.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="bg-brand gap-2 rounded-full px-8 text-white"
                >
                  <Link to={isAuthenticated ? "/home" : "/signup"}>
                    {primaryLabel}
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="rounded-full border-white/80 bg-white/70 px-8 text-slate-700"
                >
                  <Link to="/login">I already have an account</Link>
                </Button>
              </div>
              <p className="flex items-center gap-1.5 text-xs text-slate-500">
                <Zap className="size-3.5" aria-hidden="true" />
                No credit card, no downloads — it runs in your browser.
              </p>
            </div>
          </GlassCard>
        </section>
      </main>

      <footer className="mx-auto w-full max-w-6xl px-4 pb-10 sm:px-6">
        <div className="glass flex flex-col items-center justify-between gap-3 rounded-3xl px-5 py-4 sm:flex-row">
          <Wordmark compact />
          <p className="text-center text-xs text-slate-500">
            WorkTalk Quest — speak, get corrected, level up.
          </p>
        </div>
      </footer>
    </div>
  );
}
