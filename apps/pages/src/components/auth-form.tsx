import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Wordmark } from "@/components/wordmark";

type AuthMode = "login" | "signup";

type AuthFormProps = {
  mode: AuthMode;
};

function getAuthErrorMessage(error: unknown) {
  if (!error) return "Something went wrong. Please try again.";
  if (error instanceof Error && error.message) return error.message;
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string"
  ) {
    return (error as { message: string }).message;
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
        const result = await authClient.signIn.email({ email, password });
        if (result.error) {
          setError(getAuthErrorMessage(result.error));
          return;
        }
        navigate("/app", { replace: true });
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
        const signInResult = await authClient.signIn.email({ email, password });
        if (signInResult.error) {
          setError(getAuthErrorMessage(signInResult.error));
          return;
        }
      }

      navigate("/app", { replace: true });
    } catch (submitError) {
      setError(getAuthErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-dvh flex-col bg-background">
      <header className="flex items-center justify-between px-6 py-5 sm:px-8">
        <Link to="/" className="group inline-flex items-center gap-2">
          <Wordmark className="size-5" />
          <span className="text-[14px] font-semibold tracking-[-0.02em] text-foreground">
            OpenDesign
          </span>
        </Link>
        <Link
          to={isLogin ? "/signup" : "/login"}
          className="text-[13px] font-medium text-[#8a8a8a] transition-colors hover:text-foreground"
        >
          {isLogin ? "Create account" : "Sign in"}
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 pb-16">
        <div className="w-full max-w-[380px] animate-fade-up">
          <div className="mb-10 space-y-3 text-center">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#8a8a8a]">
              {isLogin ? "Welcome back" : "Get started"}
            </p>
            <h1 className="text-compressed-md text-[34px] font-semibold text-foreground">
              {isLogin ? "Sign in to OpenDesign" : "Create your account"}
            </h1>
            <p className="text-[14px] leading-relaxed text-[#8a8a8a]">
              {isLogin
                ? "Pick up where you left off."
                : "Start designing with AI in under a minute."}
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="space-y-1.5">
                <label
                  htmlFor="auth-name"
                  className="block text-[13px] font-medium text-foreground"
                >
                  Name
                </label>
                <Input
                  id="auth-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  autoComplete="name"
                  placeholder="Jane Doe"
                  required
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label
                htmlFor="auth-email"
                className="block text-[13px] font-medium text-foreground"
              >
                Email
              </label>
              <Input
                id="auth-email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                type="email"
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="auth-password"
                  className="block text-[13px] font-medium text-foreground"
                >
                  Password
                </label>
                {isLogin && (
                  <span className="text-[12px] text-[#666]">
                    Min. 8 characters
                  </span>
                )}
              </div>
              <Input
                id="auth-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete={isLogin ? "current-password" : "new-password"}
                minLength={8}
                type="password"
                placeholder={isLogin ? "••••••••" : "At least 8 characters"}
                required
              />
            </div>

            {error && (
              <p role="alert" className="text-[13px] text-[#ff5b4f]">
                {error}
              </p>
            )}

            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className="mt-2 w-full"
            >
              {isSubmitting
                ? isLogin
                  ? "Signing in…"
                  : "Creating account…"
                : isLogin
                  ? "Sign in"
                  : "Create account"}
            </Button>
          </form>

          <p className="mt-8 text-center text-[13px] text-[#8a8a8a]">
            {isLogin ? "New to OpenDesign?" : "Already have an account?"}{" "}
            <Link
              to={isLogin ? "/signup" : "/login"}
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              {isLogin ? "Create an account" : "Sign in"}
            </Link>
          </p>

          {!isLogin && (
            <p className="mt-6 text-center text-[12px] leading-relaxed text-[#666]">
              By creating an account, you agree to our Terms and Privacy Policy.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
