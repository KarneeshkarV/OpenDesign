import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Wordmark } from "@/components/wordmark";

export function Landing() {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-background">
      <BackgroundGrid />

      <header className="sticky top-0 z-20 border-b border-white/[0.06] bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-[1200px] items-center justify-between px-6 sm:px-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <Wordmark className="size-5" />
            <span className="text-[14px] font-semibold tracking-[-0.02em] text-foreground">
              OpenDesign
            </span>
          </Link>

          <nav className="hidden items-center gap-7 md:flex">
            <a
              href="#features"
              className="text-[13px] font-medium text-[#8a8a8a] transition-colors hover:text-foreground"
            >
              Features
            </a>
            <a
              href="#how"
              className="text-[13px] font-medium text-[#8a8a8a] transition-colors hover:text-foreground"
            >
              How it works
            </a>
            <a
              href="#pricing"
              className="text-[13px] font-medium text-[#8a8a8a] transition-colors hover:text-foreground"
            >
              Pricing
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="hidden text-[#cfcfcf] sm:inline-flex"
            >
              <Link to="/login">Sign in</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/signup">Sign up</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex flex-1 flex-col">
        <Hero />
        <FeatureTriptych />
        <HowItWorks />
        <ClosingCTA />
      </main>

      <footer className="relative z-10 border-t border-white/[0.06]">
        <div className="mx-auto flex w-full max-w-[1200px] flex-col items-start justify-between gap-3 px-6 py-8 sm:flex-row sm:items-center sm:px-8">
          <div className="flex items-center gap-2">
            <Wordmark className="size-4 text-[#8a8a8a]" />
            <span className="text-[12px] text-[#8a8a8a]">
              © {new Date().getFullYear()} OpenDesign
            </span>
          </div>
          <div className="flex items-center gap-6 text-[12px] text-[#8a8a8a]">
            <a href="#" className="hover:text-foreground">
              Privacy
            </a>
            <a href="#" className="hover:text-foreground">
              Terms
            </a>
            <a href="#" className="hover:text-foreground">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function BackgroundGrid() {
  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse 80% 60% at 50% 10%, #000 40%, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 60% at 50% 10%, #000 40%, transparent 80%)"
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[600px]"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(10,114,239,0.12), transparent 70%)"
        }}
      />
    </>
  );
}

function Hero() {
  return (
    <section className="relative">
      <div className="mx-auto w-full max-w-[1200px] px-6 pt-24 pb-20 sm:px-8 sm:pt-28 sm:pb-28 lg:pt-36">
        <div className="mx-auto max-w-[820px] text-center">
          <div
            className="animate-fade-up mx-auto inline-flex items-center gap-2 rounded-full bg-white/[0.03] px-3 py-1 shadow-border"
            style={{ animationDelay: "0ms" }}
          >
            <span className="relative flex size-1.5">
              <span className="absolute inset-0 animate-ping rounded-full bg-[#0a72ef] opacity-70" />
              <span className="relative size-1.5 rounded-full bg-[#0a72ef]" />
            </span>
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#cfcfcf]">
              Now in beta · AI design
            </span>
          </div>

          <h1
            className="animate-fade-up mt-8 text-[44px] font-semibold text-foreground sm:text-[64px] lg:text-[76px]"
            style={{
              letterSpacing: "-0.055em",
              lineHeight: "0.98",
              animationDelay: "80ms"
            }}
          >
            Design anything.
            <br />
            <span className="text-[#8a8a8a]">Just describe it.</span>
          </h1>

          <p
            className="animate-fade-up mx-auto mt-7 max-w-[560px] text-[17px] leading-[1.55] text-[#a1a1a1] sm:text-[18px]"
            style={{ animationDelay: "160ms" }}
          >
            OpenDesign turns a sentence into a production-ready interface.
            Prompt a layout, iterate by chat, ship the code.
          </p>

          <div
            className="animate-fade-up mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
            style={{ animationDelay: "240ms" }}
          >
            <Button asChild size="xl" className="w-full sm:w-auto">
              <Link to="/signup">Start designing — it's free</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="xl"
              className="w-full sm:w-auto"
            >
              <Link to="/login">
                Sign in
                <ArrowUpRight className="size-4" />
              </Link>
            </Button>
          </div>

          <p
            className="animate-fade-up mt-6 text-[12px] text-[#666]"
            style={{ animationDelay: "320ms" }}
          >
            No credit card required · Cancel anytime
          </p>
        </div>

        <ProductPreview />
      </div>
    </section>
  );
}

function ProductPreview() {
  return (
    <div
      className="animate-fade-up mt-20 sm:mt-24"
      style={{ animationDelay: "400ms" }}
    >
      <div className="relative mx-auto max-w-[1080px]">
        <div
          className="relative overflow-hidden rounded-[14px] bg-[#0d0d0d]"
          style={{
            boxShadow:
              "0 0 0 1px rgba(255,255,255,0.08), 0 30px 80px -20px rgba(0,0,0,0.6), 0 0 80px -20px rgba(10,114,239,0.1)"
          }}
        >
          <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3">
            <div className="flex gap-1.5">
              <span className="size-2.5 rounded-full bg-white/10" />
              <span className="size-2.5 rounded-full bg-white/10" />
              <span className="size-2.5 rounded-full bg-white/10" />
            </div>
            <div className="ml-3 flex-1 rounded-md bg-white/[0.04] px-3 py-1 font-mono text-[11px] text-[#666]">
              opendesign.app/canvas
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr]">
            <aside className="hidden border-r border-white/[0.06] p-5 lg:block">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#666]">
                Prompt
              </p>
              <div className="mt-3 space-y-3">
                <div className="rounded-lg bg-white/[0.04] p-3 shadow-border">
                  <p className="text-[12px] leading-relaxed text-[#cfcfcf]">
                    A pricing page for a SaaS. Three tiers. Dark. Monospace
                    headings.
                  </p>
                </div>
                <div className="rounded-lg p-3 shadow-border">
                  <p className="text-[12px] leading-relaxed text-[#8a8a8a]">
                    Make the middle tier glow.
                  </p>
                </div>
                <div className="rounded-lg p-3 shadow-border">
                  <p className="text-[12px] leading-relaxed text-[#8a8a8a]">
                    Replace copy with something playful.
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-lg bg-white/[0.02] p-3 shadow-border">
                <div className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-emerald-400" />
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#8a8a8a]">
                    Generating
                  </span>
                </div>
                <div className="mt-2 flex gap-1">
                  <span
                    className="size-1 rounded-full bg-[#cfcfcf]"
                    style={{ animation: "pulse-dot 1.2s infinite", animationDelay: "0ms" }}
                  />
                  <span
                    className="size-1 rounded-full bg-[#cfcfcf]"
                    style={{ animation: "pulse-dot 1.2s infinite", animationDelay: "150ms" }}
                  />
                  <span
                    className="size-1 rounded-full bg-[#cfcfcf]"
                    style={{ animation: "pulse-dot 1.2s infinite", animationDelay: "300ms" }}
                  />
                </div>
              </div>
            </aside>

            <div className="relative min-h-[320px] p-6 sm:p-10">
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { tier: "Starter", price: "$0", glow: false },
                  { tier: "Pro", price: "$18", glow: true },
                  { tier: "Team", price: "$48", glow: false }
                ].map((plan) => (
                  <div
                    key={plan.tier}
                    className="relative overflow-hidden rounded-xl bg-[#0a0a0a] p-5"
                    style={{
                      boxShadow: plan.glow
                        ? "0 0 0 1px rgba(10,114,239,0.4), 0 0 40px -10px rgba(10,114,239,0.4)"
                        : "0 0 0 1px rgba(255,255,255,0.08)"
                    }}
                  >
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#8a8a8a]">
                      {plan.tier}
                    </p>
                    <p className="mt-3 text-[28px] font-semibold tracking-[-0.03em] text-foreground">
                      {plan.price}
                      <span className="text-[13px] font-normal text-[#666]">
                        /mo
                      </span>
                    </p>
                    <div className="mt-4 space-y-1.5">
                      <div className="h-1 w-full rounded-full bg-white/[0.06]" />
                      <div className="h-1 w-4/5 rounded-full bg-white/[0.06]" />
                      <div className="h-1 w-3/5 rounded-full bg-white/[0.06]" />
                    </div>
                    <div
                      className="mt-6 h-8 rounded-md text-center"
                      style={{
                        background: plan.glow ? "#ffffff" : "rgba(255,255,255,0.04)",
                        boxShadow: plan.glow
                          ? "none"
                          : "0 0 0 1px rgba(255,255,255,0.1)"
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureTriptych() {
  const features = [
    {
      eyebrow: "01 · Prompt",
      title: "Describe, don't draw",
      body: "Type what you want. A landing page, a dashboard, a sign-up flow — OpenDesign turns natural language into pixel-accurate layouts."
    },
    {
      eyebrow: "02 · Refine",
      title: "Chat your way to polish",
      body: "Iterate like you would with a teammate. Change copy, tighten spacing, swap a color. Every reply keeps the rest intact."
    },
    {
      eyebrow: "03 · Ship",
      title: "Export clean code",
      body: "Production-ready React and Tailwind. No lorem ipsum, no sloppy markup — just the component you asked for, ready to paste."
    }
  ];

  return (
    <section id="features" className="relative border-t border-white/[0.06]">
      <div className="mx-auto w-full max-w-[1200px] px-6 py-24 sm:px-8 sm:py-32">
        <div className="max-w-[620px]">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#8a8a8a]">
            What it does
          </p>
          <h2 className="mt-3 text-[36px] font-semibold tracking-[-0.035em] leading-[1.05] text-foreground sm:text-[44px]">
            A design tool that{" "}
            <span className="text-[#8a8a8a]">thinks in sentences.</span>
          </h2>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.eyebrow}
              className="group relative overflow-hidden rounded-xl bg-[#0c0c0c] p-7 shadow-border transition-[box-shadow] duration-200 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.16)]"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#666]">
                {feature.eyebrow}
              </p>
              <h3 className="mt-5 text-[22px] font-semibold tracking-[-0.025em] leading-[1.2] text-foreground">
                {feature.title}
              </h3>
              <p className="mt-3 text-[14px] leading-[1.6] text-[#a1a1a1]">
                {feature.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      step: "01",
      title: "Write a prompt",
      body: "Start with any idea. One sentence is enough."
    },
    {
      step: "02",
      title: "Watch it render",
      body: "A live canvas appears. Layouts, type, spacing — handled."
    },
    {
      step: "03",
      title: "Chat to iterate",
      body: "Adjust anything. Each reply refines the design in place."
    },
    {
      step: "04",
      title: "Copy the code",
      body: "Clean React + Tailwind, ready for your codebase."
    }
  ];

  return (
    <section id="how" className="relative border-t border-white/[0.06]">
      <div className="mx-auto w-full max-w-[1200px] px-6 py-24 sm:px-8 sm:py-32">
        <div className="max-w-[620px]">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#8a8a8a]">
            How it works
          </p>
          <h2 className="mt-3 text-[36px] font-semibold tracking-[-0.035em] leading-[1.05] text-foreground sm:text-[44px]">
            From prompt to production{" "}
            <span className="text-[#8a8a8a]">in four steps.</span>
          </h2>
        </div>

        <ol className="mt-14 grid gap-0 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <li
              key={step.step}
              className="relative border-t border-white/[0.06] px-0 py-8 sm:border-t-0 sm:border-l sm:pl-6 sm:pr-4 lg:pl-7"
              style={{
                borderLeftColor:
                  index === 0 ? "transparent" : "rgba(255,255,255,0.06)"
              }}
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#666]">
                {step.step}
              </p>
              <h3 className="mt-4 text-[18px] font-semibold tracking-[-0.02em] text-foreground">
                {step.title}
              </h3>
              <p className="mt-2 text-[14px] leading-[1.6] text-[#a1a1a1]">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function ClosingCTA() {
  return (
    <section id="pricing" className="relative border-t border-white/[0.06]">
      <div className="mx-auto w-full max-w-[1200px] px-6 py-24 sm:px-8 sm:py-32">
        <div
          className="relative overflow-hidden rounded-2xl bg-[#0c0c0c] px-8 py-16 text-center sm:px-16 sm:py-20"
          style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.08)" }}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 60% 80% at 50% 100%, rgba(10,114,239,0.18), transparent 70%)"
            }}
          />
          <div className="relative">
            <h2 className="mx-auto max-w-[560px] text-[36px] font-semibold tracking-[-0.04em] leading-[1.02] text-foreground sm:text-[48px]">
              Your next design is one sentence away.
            </h2>
            <p className="mx-auto mt-5 max-w-[460px] text-[16px] leading-[1.55] text-[#a1a1a1]">
              Create an account and generate your first layout in seconds.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="xl" className="w-full sm:w-auto">
                <Link to="/signup">Get started free</Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                size="xl"
                className="w-full text-[#cfcfcf] sm:w-auto"
              >
                <Link to="/login">
                  I have an account
                  <ArrowUpRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
