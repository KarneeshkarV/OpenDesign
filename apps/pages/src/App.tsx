import { useEffect, useState } from "react";
import { Link, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { LoaderCircle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthForm } from "@/components/auth-form";
import { Chat } from "@/components/chat";
import { Landing } from "@/components/landing";
import { Wordmark } from "@/components/wordmark";
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

type Session = Awaited<ReturnType<typeof authClient.getSession>>["data"];

function AppChrome({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { data: session } = authClient.useSession();
  const { health, error } = useBackendHealth();
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
      <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between border-b border-white/[0.06] bg-background/80 px-4 backdrop-blur-xl sm:px-6">
        <div className="flex items-center gap-4">
          <Link to="/" className="inline-flex items-center gap-2">
            <Wordmark className="size-4" />
            <span className="text-[13px] font-semibold tracking-[-0.02em]">
              OpenDesign
            </span>
          </Link>
          <span className="h-4 w-px bg-white/[0.08]" />
          <div
            className="flex items-center gap-2 text-[11px] text-[#8a8a8a]"
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
                    ? "bg-[#ff5b4f]"
                    : "bg-[#666]"
              )}
            />
            <span className="hidden font-mono uppercase tracking-[0.18em] sm:inline">
              {health ? "online" : error ? "offline" : "connecting"}
            </span>
          </div>
        </div>

        {session?.user ? (
          <div className="flex items-center gap-3">
            <span className="hidden text-[13px] text-[#cfcfcf] sm:inline">
              {userLabel}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void handleSignOut()}
              disabled={isSigningOut}
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
    <div className="flex min-h-dvh flex-1 items-center justify-center bg-background px-4">
      <div className="flex items-center gap-3 rounded-lg bg-white/[0.02] px-4 py-3 shadow-border">
        <LoaderCircle className="size-4 animate-spin text-[#8a8a8a]" />
        <span className="text-[13px] text-[#8a8a8a]">Restoring session…</span>
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
  session: Session;
}) {
  if (isPending) {
    return <LoadingState />;
  }

  if (session?.user) {
    return <Navigate to="/app" replace />;
  }

  return <AuthForm mode={mode} />;
}

function ChatRoute({
  isPending,
  session
}: {
  isPending: boolean;
  session: Session;
}) {
  if (isPending) {
    return <LoadingState />;
  }

  if (!session?.user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <AppChrome>
      <Chat />
    </AppChrome>
  );
}

export default function App() {
  const { data: session, isPending } = authClient.useSession();

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route
        path="/app"
        element={<ChatRoute session={session} isPending={isPending} />}
      />
      <Route
        path="/login"
        element={
          <AuthRoute mode="login" session={session} isPending={isPending} />
        }
      />
      <Route
        path="/signup"
        element={
          <AuthRoute mode="signup" session={session} isPending={isPending} />
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
