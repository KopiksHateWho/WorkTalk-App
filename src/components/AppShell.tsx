import { GlassBackground } from "@/components/GlassBackground";
import { MobileNav } from "@/components/MobileNav";
import { Navbar } from "@/components/Navbar";
import { LoadingState } from "@/components/states";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Navigate, Outlet, useLocation } from "react-router";

/**
 * Layout for every signed-in screen. Also gates first-time learners into
 * onboarding before they can reach the dashboard.
 */
export function AppShell() {
  const status = useQuery(api.progress.status);
  const location = useLocation();

  if (status === undefined) {
    return (
      <div className="relative flex min-h-dvh items-center justify-center">
        <GlassBackground />
        <LoadingState message="Loading your learning space..." />
      </div>
    );
  }

  if (!status.onboardingCompleted && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <div className="relative flex min-h-dvh flex-col">
      <GlassBackground />
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-24 pb-32 sm:px-6 md:pb-16">
        <Outlet />
      </main>
      <MobileNav />
    </div>
  );
}
