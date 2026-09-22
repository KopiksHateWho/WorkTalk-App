import { StreakBadge, XPBadge } from "@/components/Badges";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { useQuery } from "convex/react";
import { GraduationCap, LayoutDashboard, LogOut, Settings, User } from "lucide-react";
import { NavLink, useNavigate } from "react-router";

const LINKS = [
  { label: "Home", to: "/home" },
  { label: "Learn", to: "/learn" },
  { label: "Games", to: "/games" },
  { label: "Speaking", to: "/speaking" },
  { label: "Progress", to: "/progress" },
];

export function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <span
        className="grid size-9 place-items-center rounded-2xl bg-gradient-to-br from-indigo-600 via-blue-500 to-cyan-400 text-white shadow-sm"
        aria-hidden="true"
      >
        <GraduationCap className="size-5" />
      </span>
      <span className="leading-tight">
        <span className="block text-sm font-extrabold tracking-[0.2em] text-slate-900">
          VERITASS
        </span>
        {!compact ? (
          <span className="block text-[10px] font-semibold tracking-[0.14em] text-slate-500 uppercase">
            English Career Quest
          </span>
        ) : null}
      </span>
    </span>
  );
}

export function Navbar() {
  const { user, signOut } = useAuth();
  const me = useQuery(api.progress.me);
  const navigate = useNavigate();

  const displayName = me?.profile.displayName ?? user?.name ?? "Learner";
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="fixed inset-x-0 top-0 z-40 px-3 pt-3 sm:px-5">
      <nav
        aria-label="Main navigation"
        className="glass-strong mx-auto flex w-full max-w-6xl items-center justify-between gap-3 rounded-3xl px-3 py-2.5 sm:px-4"
      >
        <NavLink to="/home" className="rounded-xl focus-visible:outline-none">
          <Wordmark />
        </NavLink>

        <ul className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    "rounded-full px-3.5 py-2 text-sm font-semibold transition-colors",
                    isActive
                      ? "bg-white/80 text-indigo-700 shadow-sm"
                      : "text-slate-600 hover:bg-white/60 hover:text-slate-900",
                  )
                }
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 sm:flex">
            {me ? <XPBadge xp={me.profile.xp} /> : null}
            {me ? <StreakBadge streak={me.profile.streak} /> : null}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Open profile menu"
                className="size-10 rounded-2xl border border-white/70 bg-white/70 hover:bg-white"
              >
                <span className="grid size-7 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 text-[11px] font-bold text-white">
                  {initials || "V"}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="glass-strong w-56 rounded-2xl border-white/80"
            >
              <DropdownMenuLabel className="flex flex-col gap-0.5">
                <span className="text-sm font-bold text-slate-900">
                  {displayName}
                </span>
                <span className="text-xs text-slate-500">
                  {me?.isGuest
                    ? "Guest learner"
                    : (me?.profile.email ?? "Signed in")}
                </span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/profile")}>
                <User className="mr-2 size-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/home")}>
                <LayoutDashboard className="mr-2 size-4" />
                Dashboard
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/settings")}>
                <Settings className="mr-2 size-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="text-destructive focus:text-destructive"
              >
                <LogOut className="mr-2 size-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
    </header>
  );
}
