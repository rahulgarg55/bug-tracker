"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { User, Shield, Building2, Users, Layers } from "lucide-react"

const NAV_ITEMS = [
  { href: "/settings/profile", label: "Profile", icon: User },
  { href: "/settings/security", label: "Security", icon: Shield },
  { href: "/settings/organizations", label: "Organizations", icon: Building2 },
  { href: "/settings/members", label: "Members & RBAC", icon: Users },
  { href: "/settings/teams", label: "Teams & Squads", icon: Layers },
]

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Workspace Settings</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Manage your account profile, organization configuration, functional squads, and RBAC permissions.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Settings Sub-Navigation */}
        <aside className="w-full md:w-56 shrink-0">
          <nav className="flex md:flex-col gap-1 overflow-x-auto pb-2 md:pb-0">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </aside>

        {/* Content Panel */}
        <main className="flex-1 bg-card border border-border rounded-xl p-6 shadow-xs">
          {children}
        </main>
      </div>
    </div>
  )
}
