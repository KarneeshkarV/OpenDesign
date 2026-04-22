import { useEffect, useState } from "react";
import { Link, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { LoaderCircle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthForm } from "@/components/auth-form";
import { Chat } from "@/components/chat";
import { apiBasePath } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

type HealthResponse = {
  service: string;
  status: string;
  timestamp: string;
};

function useBackendHealth() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      try {
        const response = await fetch(`${apiBasePath}/health`, {
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error(`Request failed with ${response.status}`);
        }

        const data = (await response.json()) as HealthResponse;
        setHealth(data);
      } catch (loadError) {
        if (controller.signal.aborted) {
          return;
        }

        const message =
          loadError instanceof Error ? loadError.message : "Unknown error";
        setError(message);
      }
    };

    void load();

    return () => controller.abort();
  }, []);

  return { health, error };
}

function AppChrome({
  children,
  error,
  health,
  session
}: {
  children: React.ReactNode;
  error: string | null;
  health: HealthResponse | null;
  session: Awaited<ReturnType<typeof authClient.getSession>>["data"];
}) {
  const navigate = useNavigate();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await authClient.signOut();
      navigate("/login", { replace: true });
    } finally {
      setIsSigningOut(false);
    }
  };

  const userLabel =
    session?.user?.name?.trim() || session?.user?.email || "Signed in";

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_30%),linear-gradient(to_bottom,rgba(255,255,255,0.02),transparent_24%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.04),transparent)]" />

      <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b border-border/40 bg-background/80 px-4 backdrop-blur sm:px-6">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-[13px] font-semibold tracking-tight">
            OpenDesign
          </Link>
          <div
            className="flex items-center gap-2 text-[11px] text-muted-foreground"
            title={
              health
                ? `backend ok · ${new Date(health.timestamp).toLocaleTimeString()}`
                : error
                  ? `backend unavailable: ${error}`
                  : "checking backend..."
            }
          >
            <span
              className={cn(
                "size-1.5 rounded-full",
                health
                  ? "bg-emerald-400"
                  : error
                    ? "bg-destructive"
                    : "bg-muted-foreground/60"
              )}
            />
            <span className="hidden sm:inline">
              {health ? "online" : error ? "offline" : "connecting"}
            </span>
          </div>
        </div>

        {session?.user ? (
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-foreground">{userLabel}</p>
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                authenticated
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void handleSignOut()}
              disabled={isSigningOut}
              className="rounded-full border-border/70 bg-card/50 px-3"
            >
              {isSigningOut ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <LogOut className="size-4" />
              )}
              <span className="hidden sm:inline">
                {isSigningOut ? "Signing out" : "Sign out"}
              </span>
            </Button>
          </div>
        ) : null}
      </header>

      <main className="relative flex min-h-0 flex-1 flex-col">{children}</main>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-1 items-center justify-center px-4">
      <div className="rounded-3xl border border-border/60 bg-card/55 px-5 py-4 text-sm text-muted-foreground shadow-[0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur">
        <div className="flex items-center gap-3">
          <LoaderCircle className="size-4 animate-spin" />
          <span>Restoring your session...</span>
        </div>
      </div>
    </div>
  );
}

function AuthRoute({
  mode,
  isPending,
  session
}: {
  mode: "login" | "signup";
  isPending: boolean;
  session: Awaited<ReturnType<typeof authClient.getSession>>["data"];
}) {
  if (isPending) {
    return <LoadingState />;
  }

  if (session?.user) {
    return <Navigate to="/" replace />;
  }

  return <AuthForm mode={mode} />;
}

function ChatRoute({
  isPending,
  session
}: {
  isPending: boolean;
  session: Awaited<ReturnType<typeof authClient.getSession>>["data"];
}) {
  if (isPending) {
    return <LoadingState />;
  }

  if (!session?.user) {
    return <Navigate to="/login" replace />;
  }

  return <Chat />;
}

export default function App() {
  const { health, error } = useBackendHealth();
  const { data: session, isPending } = authClient.useSession();

  return (
    <AppChrome health={health} error={error} session={session}>
      <Routes>
        <Route
          path="/"
          element={<ChatRoute session={session} isPending={isPending} />}
        />
        <Route
          path="/login"
          element={<AuthRoute mode="login" session={session} isPending={isPending} />}
        />
        <Route
          path="/signup"
          element={<AuthRoute mode="signup" session={session} isPending={isPending} />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppChrome>
  );
}
