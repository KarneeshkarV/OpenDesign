import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, KeyRound, UserRound } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AuthMode = "login" | "signup";

type AuthFormProps = {
  mode: AuthMode;
};

function getAuthErrorMessage(error: unknown) {
  if (!error) {
    return "Something went wrong. Please try again.";
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

export function AuthForm({ mode }: AuthFormProps) {
  const navigate = useNavigate();
  const isLogin = mode === "login";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (isLogin) {
        const result = await authClient.signIn.email({
          email,
          password
        });

        if (result.error) {
          setError(getAuthErrorMessage(result.error));
          return;
        }

        navigate("/", { replace: true });
        return;
      }

      const signUpResult = await authClient.signUp.email({
        name,
        email,
        password
      });

      if (signUpResult.error) {
        setError(getAuthErrorMessage(signUpResult.error));
        return;
      }

      const sessionResult = await authClient.getSession();

      if (!sessionResult.data?.user) {
        const signInResult = await authClient.signIn.email({
          email,
          password
        });

        if (signInResult.error) {
          setError(getAuthErrorMessage(signInResult.error));
          return;
        }
      }

      navigate("/", { replace: true });
    } catch (submitError) {
      setError(getAuthErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-1 items-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid w-full gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="relative overflow-hidden rounded-[28px] border border-border/60 bg-card/55 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.32)] backdrop-blur xl:p-8">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.05),transparent_28%)]" />
          <div className="relative flex h-full flex-col justify-between gap-10">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/55 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.28em] text-muted-foreground">
                <span className="size-1.5 rounded-full bg-emerald-400" />
                Better Auth
              </div>
              <div className="space-y-3">
                <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                  {isLogin
                    ? "Return to the chat workspace without changing the feel."
                    : "Create an OpenDesign account inside the same quiet shell."}
                </h1>
                <p className="max-w-lg text-sm leading-6 text-muted-foreground sm:text-base">
                  The auth layer shares the same tone as the chat surface:
                  restrained, dark, and functional. Nothing ornamental that
                  fights the product.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                {
                  label: "Protected chat",
                  value: "Session-gated"
                },
                {
                  label: "Storage",
                  value: "Neon first"
                },
                {
                  label: "Backend",
                  value: "Worker native"
                }
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-border/60 bg-background/45 p-4"
                >
                  <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                    {item.label}
                  </p>
                  <p className="mt-2 text-sm font-medium text-foreground">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[28px] border border-border/70 bg-background/82 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.35)] backdrop-blur xl:p-8">
          <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
          <div className="flex h-full flex-col">
            <div className="mb-8 space-y-2">
              <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
                {isLogin ? "Sign in" : "Create account"}
              </p>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                {isLogin ? "Welcome back." : "Start a new session."}
              </h2>
              <p className="text-sm text-muted-foreground">
                {isLogin
                  ? "Use your email and password to continue."
                  : "Email and password only for v1. Verification and reset flows can be added later."}
              </p>
            </div>

            <form className="flex flex-1 flex-col gap-4" onSubmit={handleSubmit}>
              {!isLogin && (
                <label className="space-y-2">
                  <span className="text-sm font-medium text-foreground">
                    Name
                  </span>
                  <div className="relative">
                    <UserRound className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      autoComplete="name"
                      className="pl-9"
                      placeholder="A name for your account"
                      required
                    />
                  </div>
                </label>
              )}

              <label className="space-y-2">
                <span className="text-sm font-medium text-foreground">
                  Email
                </span>
                <Input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  type="email"
                  placeholder="you@company.com"
                  required
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-foreground">
                  Password
                </span>
                <div className="relative">
                  <KeyRound className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete={isLogin ? "current-password" : "new-password"}
                    className="pl-9"
                    minLength={8}
                    type="password"
                    placeholder="Minimum 8 characters"
                    required
                  />
                </div>
              </label>

              {error && (
                <div
                  role="alert"
                  className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
                >
                  {error}
                </div>
              )}

              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="mt-2 h-11 justify-between rounded-xl px-4"
              >
                <span>
                  {isSubmitting
                    ? isLogin
                      ? "Signing in..."
                      : "Creating account..."
                    : isLogin
                      ? "Sign in"
                      : "Create account"}
                </span>
                <ArrowRight className="size-4" />
              </Button>
            </form>

            <div className="mt-6 border-t border-border/60 pt-5 text-sm text-muted-foreground">
              {isLogin ? "Need an account?" : "Already have an account?"}{" "}
              <Link
                to={isLogin ? "/signup" : "/login"}
                className="font-medium text-foreground transition-colors hover:text-primary"
              >
                {isLogin ? "Create one" : "Sign in instead"}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
