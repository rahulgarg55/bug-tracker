import Link from "next/link";
import {
  CheckCircle2,
  XCircle,
  Zap,
  ShieldCheck,
  Terminal,
  ArrowRight,
  Sparkles,
  Bug,
  Lock,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Bug Tracker vs Linear: The Defect-Focused Linear Alternative",
  description:
    "Love Linear's speed but need deep QA defect reproduction, stack trace tagging, SLA compliance, and self-hosting? Compare Bug Tracker with Linear.",
};

export default function LinearComparisonPage() {
  const comparisonItems = [
    {
      feature: "Specialized Defect Schemas",
      bugTracker: "First-class reproduction steps, environment tags & stack traces",
      linear: "Generic markdown issue field requiring manual formatting",
      btWinner: true,
    },
    {
      feature: "SLA Timers & Severity Badging",
      bugTracker: "Automated countdown timers for blocker/critical SLA compliance",
      linear: "Basic priority tags (No built-in SLA timers)",
      btWinner: true,
    },
    {
      feature: "Self-Hosting & Data Sovereignty",
      bugTracker: "1-Click Docker Compose deployment to run in your private cloud",
      linear: "Closed-source, cloud SaaS only",
      btWinner: true,
    },
    {
      feature: "Developer API & Playground",
      bugTracker: "OpenAPI 3.0.3 + Stoplight Elements interactive sandbox",
      linear: "GraphQL API only (No in-browser REST playground)",
      btWinner: true,
    },
    {
      feature: "Desktop Companion",
      bugTracker: "Electron companion with global HUD & system tray",
      linear: "Electron desktop app",
      btWinner: false,
    },
    {
      feature: "Keyboard-First Command Palette",
      bugTracker: "Sub-20ms ⌘K spotlight search across all defects",
      linear: "Native ⌘K command menu",
      btWinner: false,
    },
    {
      feature: "Free Tier & Accessibility",
      bugTracker: "Generous free tier + open-core self-hosted edition",
      linear: "Strict 250 active issue limit on free plan",
      btWinner: true,
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20">
      {/* Header */}
      <header className="border-b border-border/60 bg-background/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-black text-sm shadow-md shadow-primary/20">
              BT
            </div>
            <span className="text-base font-black tracking-tight">BugTracker</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/pricing">
              <Button variant="ghost" size="sm" className="text-xs font-bold">
                Pricing
              </Button>
            </Link>
            <Link href="/login">
              <Button size="sm" className="text-xs font-bold gap-1.5 shadow-sm">
                Try 1-Click Demo
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center space-y-6">
        <Badge variant="outline" className="px-3 py-1 text-xs border-primary/30 text-primary gap-1.5">
          <Sparkles className="h-3.5 w-3.5" />
          The Defect-First Linear Alternative
        </Badge>
        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-foreground leading-tight">
          Love Linear&apos;s Elegance, <br />
          <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Need True Defect Intelligence?
          </span>
        </h1>
        <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          Linear is great for general tasks, but mission-critical engineering requires reproducible defect schemas, embedded stack traces, SLA tracking, and complete self-hosting privacy.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link href="/login">
            <Button size="lg" className="h-12 px-8 font-bold text-sm shadow-lg shadow-primary/20 gap-2">
              Launch 1-Click Demo
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <a
            href="https://github.com/rahulgarg55/bug-tracker"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="lg" className="h-12 px-6 font-semibold text-sm gap-2">
              <Terminal className="h-4 w-4" />
              Self-Host on GitHub
            </Button>
          </a>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        <div className="text-center space-y-2 mb-10">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">How Bug Tracker Compares to Linear</h2>
          <p className="text-sm text-muted-foreground">The best of both worlds: Linear speed with QA engineering depth.</p>
        </div>

        <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xl">
          <div className="grid grid-cols-12 bg-muted/60 p-4 border-b border-border/80 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <div className="col-span-5 md:col-span-4">Capability</div>
            <div className="col-span-7 md:col-span-4 text-primary font-black">Bug Tracker</div>
            <div className="hidden md:block md:col-span-4 text-muted-foreground">Linear.app</div>
          </div>

          <div className="divide-y divide-border/60 text-sm">
            {comparisonItems.map((item, idx) => (
              <div key={idx} className="grid grid-cols-12 p-4 md:p-5 items-center hover:bg-muted/30 transition-colors">
                <div className="col-span-12 md:col-span-4 font-semibold text-foreground mb-2 md:mb-0">
                  {item.feature}
                </div>
                <div className="col-span-12 md:col-span-4 flex items-start gap-2 text-primary font-medium mb-1 md:mb-0">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{item.bugTracker}</span>
                </div>
                <div className="col-span-12 md:col-span-4 flex items-start gap-2 text-muted-foreground text-xs md:text-sm">
                  {item.btWinner ? (
                    <XCircle className="h-4 w-4 text-amber-500/80 shrink-0 mt-0.5 md:block hidden" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500/80 shrink-0 mt-0.5 md:block hidden" />
                  )}
                  <span>{item.linear}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black tracking-tight">Engineered for Triage Accuracy</h2>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            Why QA teams and developers resolve defects 50% faster with Bug Tracker.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-card border border-border/70 space-y-3 hover:border-primary/50 transition-all">
            <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Bug className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-lg text-foreground">Reproducible Defect Schemas</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Standardized reproduction steps, expected vs. actual outcomes, browser/OS tagging, and raw error logs eliminate vague bug descriptions.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-card border border-border/70 space-y-3 hover:border-primary/50 transition-all">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-lg text-foreground">Automated SLA Timers</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Never miss a blocker SLA again. Visual compliance countdowns notify the team before an escalation occurs.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-card border border-border/70 space-y-3 hover:border-primary/50 transition-all">
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500">
              <Lock className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-lg text-foreground">100% Self-Hosted Privacy</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Keep your source code and vulnerability reports inside your own infrastructure with Docker Compose. Zero telemetry or vendor lock-in.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Footer Banner */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
        <div className="p-8 md:p-12 rounded-3xl bg-gradient-to-br from-card to-muted/40 border border-primary/25 space-y-6 shadow-2xl">
          <h2 className="text-3xl md:text-4xl font-black text-foreground">Experience the Speed & Depth</h2>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            Test the live demo workspace in seconds. All features unlocked.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login">
              <Button size="lg" className="h-12 px-8 font-bold text-sm shadow-md gap-2">
                Launch Live Demo
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="outline" size="lg" className="h-12 px-6 font-semibold text-sm">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60 py-8 text-center text-xs text-muted-foreground">
        <p>© 2026 Bug Tracker SaaS. Built for mission-critical software engineering teams.</p>
      </footer>
    </div>
  );
}
