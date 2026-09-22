import { GlassBackground } from "@/components/GlassBackground";
import { GlassCard } from "@/components/GlassCard";
import { Wordmark } from "@/components/Navbar";
import { ConversationBubble } from "@/components/ConversationBubble";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { ArrowRight, Loader2, Mail, ShieldCheck, Sparkles, UserX } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";

interface AuthProps {
  redirectAfterAuth?: string;
  mode?: "login" | "signup";
}

function resolveRedirectAfterAuth(returnTo: string | null, fallback = "/home") {
  if (returnTo?.startsWith("/") && !returnTo.startsWith("//")) {
    return returnTo;
  }
  return fallback;
}

function Auth({ redirectAfterAuth, mode = "login" }: AuthProps = {}) {
  const {
    isLoading: authLoading,
    isAuthenticated,
    user,
    signIn,
    signOut,
  } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = resolveRedirectAfterAuth(
    searchParams.get("returnTo"),
    redirectAfterAuth,
  );

  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSignup = mode === "signup";
  // Guests are authenticated anonymously: they must still be able to reach this
  // page to create a real account later.
  const isGuest = user?.isAnonymous === true;

  useEffect(() => {
    if (!authLoading && isAuthenticated && !isGuest) {
      navigate(redirect);
    }
  }, [authLoading, isAuthenticated, isGuest, navigate, redirect]);

  const handleEmailSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget);
      const value = formData.get("email") as string;
      // Leave the anonymous guest session first so the new account starts clean.
      if (isGuest) {
        await signOut();
      }
      await signIn("email-otp", formData);
      setEmail(value);
      setStep("otp");
    } catch (submitError) {
      console.error("Email sign-in error:", submitError);
      setError(
        "We couldn't send the code to that address. Please check the email and try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget);
      await signIn("email-otp", formData);
      navigate(redirect);
    } catch (submitError) {
      console.error("OTP verification error:", submitError);
      setError("That code doesn't match. Check the newest email and try again.");
      setOtp("");
      setIsLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signIn("anonymous");
      navigate(redirect);
    } catch (guestError) {
      console.error("Guest sign-in error:", guestError);
      setError(
        "We couldn't start a guest session. Please try again or create an account.",
      );
      setIsLoading(false);
    }
  };

  const handleGoogle = () => {
    toast.info("Google sign-in isn't configured in this project yet.", {
      description:
        "Use your email or continue as a guest — the learning experience is identical.",
    });
  };

  return (
    <div className="relative min-h-dvh">
      <GlassBackground />
      <div className="mx-auto grid min-h-dvh w-full max-w-6xl items-center gap-10 px-4 py-10 lg:grid-cols-2 lg:gap-14 lg:px-8">
        {/* Story side */}
        <section className="hidden flex-col gap-6 lg:flex">
          <Link to="/" className="w-fit">
            <Wordmark />
          </Link>
          <h1 className="text-4xl text-slate-900">
            Welcome to <span className="text-gradient-cool">Veritass</span>
          </h1>
          <p className="max-w-md text-base leading-7 text-slate-600">
            Practice real workplace English out loud. The coach listens, corrects
            your sentence naturally, and you try again — every answer earns XP.
          </p>
          <GlassCard className="flex flex-col gap-3 p-5">
            <ConversationBubble role="ai" text="Tell me about yourself." />
            <ConversationBubble
              role="user"
              text="I am good in communication."
            />
            <div className="ml-11 rounded-2xl border border-emerald-500/25 bg-emerald-500/12 p-3">
              <p className="text-[11px] font-bold tracking-[0.12em] text-emerald-700 uppercase">
                A more natural way
              </p>
              <p className="text-sm font-medium text-slate-800">
                “I am good at communication.”
              </p>
            </div>
          </GlassCard>
        </section>

        {/* Form side */}
        <section className="flex w-full items-center justify-center">
          <GlassCard
            tone="strong"
            className="w-full max-w-md p-6 sm:p-8"
            as="div"
          >
            <div className="mb-6 flex flex-col items-center gap-3 text-center lg:hidden">
              <Link to="/">
                <Wordmark />
              </Link>
            </div>

            {step === "email" ? (
              <>
                <header className="mb-5 text-center">
                  <h2 className="text-2xl text-slate-900">
                    {isSignup ? "Create your account" : "Welcome back"}
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    {isSignup
                      ? "Save your XP, streak and speaking progress."
                      : "Sign in to continue your speaking practice."}
                  </p>
                </header>

                <form onSubmit={handleEmailSubmit} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail
                        className="pointer-events-none absolute top-3 left-3 size-4 text-slate-400"
                        aria-hidden="true"
                      />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        placeholder="name@university.edu"
                        className="h-11 rounded-2xl border-white/70 bg-white/70 pl-9"
                        disabled={isLoading}
                        required
                      />
                    </div>
                    <p className="text-xs leading-5 text-slate-500">
                      No password needed — we email you a 6-digit code.
                    </p>
                  </div>

                  {error ? (
                    <p role="alert" className="text-sm text-rose-600">
                      {error}
                    </p>
                  ) : null}

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="h-11 gap-2 rounded-full bg-brand text-white"
                  >
                    {isLoading ? (
                      <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <Sparkles className="size-4" aria-hidden="true" />
                    )}
                    {isSignup ? "Sign up" : "Log in"}
                  </Button>
                </form>

                <div className="relative my-5">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-white/70" />
                  </div>
                  <div className="relative flex justify-center text-[11px] font-bold tracking-widest uppercase">
                    <span className="bg-white/70 px-2 text-slate-500">or</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGoogle}
                    className="h-11 rounded-full border-white/80 bg-white/70 text-slate-700"
                  >
                    Continue with Google
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleGuestLogin}
                    disabled={isLoading}
                    className="h-11 gap-2 rounded-full text-slate-600 hover:bg-white/60"
                  >
                    <UserX className="size-4" aria-hidden="true" />
                    Continue as Guest
                  </Button>
                </div>

                {isGuest ? (
                  <p className="mt-4 rounded-2xl border border-amber-400/30 bg-amber-300/15 p-3 text-xs leading-5 text-amber-900">
                    You are practicing as a guest right now. Creating an account
                    starts a saved profile — the guest XP stays in the guest
                    session and is not transferred.
                  </p>
                ) : (
                  <p className="mt-4 rounded-2xl border border-amber-400/30 bg-amber-300/15 p-3 text-xs leading-5 text-amber-900">
                    Guest progress may not be permanently saved. You can create an
                    account later and keep practicing the same way.
                  </p>
                )}

                <p className="mt-5 text-center text-sm text-slate-600">
                  {isSignup ? "Already have an account? " : "New to Veritass? "}
                  <Link
                    to={isSignup ? "/login" : "/signup"}
                    className="font-semibold text-indigo-700 underline-offset-4 hover:underline"
                  >
                    {isSignup ? "Log in" : "Sign up"}
                  </Link>
                </p>
              </>
            ) : (
              <>
                <header className="mb-5 text-center">
                  <h2 className="text-2xl text-slate-900">
                    Check your email
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    We sent a 6-digit code to{" "}
                    <span className="font-semibold text-slate-800">{email}</span>
                  </p>
                </header>

                <form onSubmit={handleOtpSubmit} className="flex flex-col gap-4">
                  <input type="hidden" name="email" value={email} />
                  <input type="hidden" name="code" value={otp} />

                  <div className="flex justify-center">
                    <InputOTP
                      value={otp}
                      onChange={setOtp}
                      maxLength={6}
                      disabled={isLoading}
                      autoFocus
                      aria-label="Verification code"
                    >
                      <InputOTPGroup>
                        {Array.from({ length: 6 }).map((_, index) => (
                          <InputOTPSlot key={index} index={index} />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </div>

                  {error ? (
                    <p role="alert" className="text-center text-sm text-rose-600">
                      {error}
                    </p>
                  ) : null}

                  <Button
                    type="submit"
                    disabled={isLoading || otp.length !== 6}
                    className="h-11 gap-2 rounded-full bg-brand text-white"
                  >
                    {isLoading ? (
                      <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <ArrowRight className="size-4" aria-hidden="true" />
                    )}
                    Verify &amp; continue
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    disabled={isLoading}
                    onClick={() => {
                      setStep("email");
                      setOtp("");
                      setError(null);
                    }}
                    className="rounded-full text-slate-600"
                  >
                    Use a different email
                  </Button>
                </form>
              </>
            )}

            <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-[11px] text-slate-500">
              <ShieldCheck className="size-3.5" aria-hidden="true" />
              Your progress is stored in your account, never your voice.
            </p>
          </GlassCard>
        </section>
      </div>
    </div>
  );
}

export default function AuthPage(props: AuthProps) {
  return (
    <Suspense
      fallback={
        <div className={cn("flex min-h-dvh items-center justify-center")}>
          <Loader2 className="size-6 animate-spin text-slate-400" />
        </div>
      }
    >
      <Auth {...props} />
    </Suspense>
  );
}
