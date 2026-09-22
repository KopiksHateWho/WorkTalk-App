import { AchievementCard } from "@/components/AchievementCard";
import { Chip, LevelBadge, StreakBadge, XPBadge } from "@/components/Badges";
import { GlassCard } from "@/components/GlassCard";
import { ProgressBar } from "@/components/ProgressBar";
import { PageHeader, SectionTitle } from "@/components/SectionTitle";
import { LoadingState } from "@/components/states";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "convex/react";
import { BookOpen, LogOut, Mic, Settings, Star, UserPlus } from "lucide-react";
import { Link, useNavigate } from "react-router";

function initialsOf(name: string): string {
  return (
    name
      .split(" ")
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "V"
  );
}

export default function Profile() {
  const me = useQuery(api.progress.me);
  const { signOut } = useAuth();
  const navigate = useNavigate();

  if (me === undefined) {
    return <LoadingState message="Loading your profile..." />;
  }

  if (me === null) {
    return <LoadingState message="Preparing your profile..." />;
  }

  const { profile, level, achievements, isGuest } = me;
  const displayName = profile.displayName ?? (isGuest ? "Guest User" : "Learner");

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Profile"
        subtitle="Your account, your level and everything you have unlocked."
      >
        <div className="flex flex-wrap gap-2">
          <LevelBadge level={level.level} title={level.title} />
          <XPBadge xp={profile.xp} />
          <StreakBadge streak={profile.streak} />
        </div>
      </PageHeader>

      <GlassCard tone="strong" className="flex flex-col gap-5 p-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
          <span
            className="grid size-20 shrink-0 place-items-center rounded-3xl bg-brand-mark text-2xl font-extrabold text-white shadow-lg"
            aria-hidden="true"
          >
            {initialsOf(displayName)}
          </span>
          <div className="min-w-0 text-center sm:text-left">
            <h2 className="text-2xl text-slate-900">
              {displayName}
            </h2>
            <p className="text-sm text-slate-600">
              {isGuest ? "Guest learner · progress not permanently saved" : profile.email}
            </p>
            <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
              <Chip>
                <Star className="size-3.5 text-amber-500" aria-hidden="true" />
                {profile.xp.toLocaleString()} XP
              </Chip>
              <Chip>
                <Mic className="size-3.5 text-indigo-500" aria-hidden="true" />
                {profile.speakingSessions} speaking sessions
              </Chip>
              <Chip>
                <BookOpen className="size-3.5 text-teal-600" aria-hidden="true" />
                {profile.wordsMastered} words mastered
              </Chip>
            </div>
          </div>
        </div>

        <ProgressBar
          label={`Level ${level.level} · ${level.title}`}
          valueLabel={
            level.nextXp === null
              ? "Max level"
              : `${profile.xp} / ${level.nextXp} XP`
          }
          value={level.progressPct}
        />

        <div className="flex flex-wrap gap-2">
          <Button
            asChild
            variant="outline"
            className="gap-2 rounded-full border-white/80 bg-white/70 text-slate-700"
          >
            <Link to="/settings">
              <Settings className="size-4" aria-hidden="true" />
              Settings
            </Link>
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => void handleSignOut()}
            className="gap-2 rounded-full border-white/80 bg-white/70 text-slate-700"
          >
            <LogOut className="size-4" aria-hidden="true" />
            Log out
          </Button>
        </div>
      </GlassCard>

      {isGuest ? (
        <GlassCard
          tone="subtle"
          className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="text-base font-bold text-slate-900">
              Create an account to save your progress
            </p>
            <p className="text-sm leading-6 text-slate-600">
              Right now you are a guest learner. An account keeps your XP, streak
              and pronunciation words on every device.
            </p>
          </div>
          <Button
            asChild
            className="w-fit gap-2 rounded-full bg-brand text-white"
          >
            <Link to="/signup">
              <UserPlus className="size-4" aria-hidden="true" />
              Create account
            </Link>
          </Button>
        </GlassCard>
      ) : null}

      <section className="flex flex-col gap-3">
        <SectionTitle
          eyebrow="Achievements"
          title="Your badges"
          description="Achievements unlock automatically as you practice."
        />
        <div className="grid gap-3 sm:grid-cols-2">
          {achievements.map((achievement) => (
            <AchievementCard
              key={achievement.id}
              emoji={achievement.emoji}
              title={achievement.title}
              description={achievement.description}
              requirement={achievement.requirement}
              unlocked={achievement.unlocked}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
