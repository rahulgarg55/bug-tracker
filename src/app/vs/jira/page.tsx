import Link from "next/link";
import {
  CheckCircle2,
  XCircle,
  Zap,
  ShieldCheck,
  Terminal,
  ArrowRight,
  Clock,
  Sparkles,
  Search,
  Code2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Bug Tracker vs Jira: The Fast, Lightweight Jira Alternative",
  description:
    "Compare Bug Tracker with Jira. Experience sub-second speed, instant ⌘K search, built-in defect schemas, and 1-click Docker self-hosting without enterprise ticket bloat.",
};

export default function JiraComparisonPage() {
  const comparisonItems = [
    {
      feature: "Page Load & Navigation Speed",
      bugTracker: "Instant (<200ms via Next.js 16 Turbopack)",
      jira: "Sluggish (2–5 seconds with heavy bundle weight)",
      btWinner: true,
    },
    {
      feature: "Search & Command Palette",
      bugTracker: "Instant floating ⌘K Spotlight across all tickets",
      jira: "Complex JQL syntax and full-page reloads",
      btWinner: true,
    },
    {
      feature: "Defect Reproduction Schemas",
      bugTracker: "Built-in structured steps, stack traces & OS/browser tags",
      jira: "Unstructured description box causing back-and-forth triage",
      btWinner: true,
    },
    {
      feature: "SLA Timers & Regression Timers",
      bugTracker: "Included out-of-the-box on every defect",
      jira: "Requires expensive Jira Service Management license",
      btWinner: true,
    },
    {
      feature: "Deployment Freedom",
      bugTracker: "Cloud Edge SaaS or 1-Click Docker Self-Hosted",
      jira: "Atlassian Cloud lock-in (Server deprecated)",
      btWinner: true,
    },
    {
      feature: "Developer API & Sandbox",
      bugTracker: "OpenAPI 3.0.3 + Live Stoplight Elements & Swagger UI",
      jira: "Complex OAuth 2.0 / Atlassian Connect REST APIs",
      btWinner: true,
    },
    {
      feature: "Pricing Transparency",
      bugTracker: "Predictable seat pricing with generous free tier",
      jira: "$8.15 - $16.00+/user/month with mandatory add-ons",
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
          The Modern Jira Alternative
        </Badge>
        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-foreground leading-tight">
          Tired of Jira Bloat? <br />
          <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Meet the Fast, Developer-First Alternative.
          </span>
        </h1>
        <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          Say goodbye to sluggish ticket reloads, infinite configuration menus, and Jira fatigue.
          Bug Tracker delivers sub-second sprint execution, instant ⌘K search, structured bug triage schemas, and full Docker self-hostability.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link href="/login">
            <Button size="lg" className="h-12 px-8 font-bold text-sm shadow-lg shadow-primary/20 gap-2">
              Explore Live Demo (1-Click)
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
              View GitHub & Docker
            </Button>
          </a>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        <div className="text-center space-y-2 mb-10">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Feature-by-Feature Comparison</h2>
          <p className="text-sm text-muted-foreground">See how Bug Tracker outperforms Jira where it matters most.</p>
        </div>

        <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xl">
          <div className="grid grid-cols-12 bg-muted/60 p-4 border-b border-border/80 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <div className="col-span-5 md:col-span-4">Capability</div>
            <div className="col-span-7 md:col-span-4 text-primary font-black">Bug Tracker</div>
            <div className="hidden md:block md:col-span-4 text-muted-foreground">Atlassian Jira</div>
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
                  <XCircle className="h-4 w-4 text-red-500/80 shrink-0 mt-0.5 md:block hidden" />
                  <span>{item.jira}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Switch Cards */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black tracking-tight">Why Engineering Teams Are Leaving Jira</h2>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            Built by engineers who were tired of administrative overhead getting between them and shipping code.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-card border border-border/70 space-y-3 hover:border-primary/50 transition-all">
            <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-lg text-foreground">Zero-Lag Execution</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Every action is instantaneous. Transition sprint columns, update story points, and triage bugs without waiting for heavy scripts to recompile.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-card border border-border/70 space-y-3 hover:border-primary/50 transition-all">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500">
              <Search className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-lg text-foreground">Raycast ⌘K Spotlight</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Find any ticket in milliseconds. Global keyboard navigation eliminates clicking through five nested Jira dropdowns just to find a stack trace.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-card border border-border/70 space-y-3 hover:border-primary/50 transition-all">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
              <Code2 className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-lg text-foreground">Live OpenAPI Explorer</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Integrate with CI/CD, GitHub Actions, and internal webhooks easily. Test queries inside the interactive Stoplight Elements playground.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Footer Banner */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
        <div className="p-8 md:p-12 rounded-3xl bg-gradient-to-br from-card to-muted/40 border border-primary/25 space-y-6 shadow-2xl">
          <h2 className="text-3xl md:text-4xl font-black text-foreground">Ready to Ditch Jira?</h2>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            Test the live application right now with preloaded demo data. No credit card or registration required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login">
              <Button size="lg" className="h-12 px-8 font-bold text-sm shadow-md gap-2">
                Launch 1-Click Sandbox
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="outline" size="lg" className="h-12 px-6 font-semibold text-sm">
                Create Free Workspace
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
