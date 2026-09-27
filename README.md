# Enterprise BugTracker & Engineering Management SaaS (Phase 1)

A production-grade, multi-tenant engineering management and defect-tracking SaaS built with Next.js 16 (App Router), React 19, Auth.js (NextAuth v5), Prisma ORM, Tailwind CSS, and Redis.

Inspired by Jira, Linear, and Zoho BugTracker.

---

## Architecture & Features (Phase 1 Foundation)

* **Multi-Tenancy & Tenant Isolation:** Complete organizational boundary enforcement. Every resource (memberships, squads, teams, settings) belongs to an organization with strict backend isolation checks.
* **Production Authentication:**
  * User Registration with automated organization provisioning
  * Credential authentication with bcrypt (10 salt rounds)
  * Signed `HttpOnly` JWT session management with `SameSite=Lax` and production `Secure` flags
  * Password reset tokens with account enumeration defense
  * Email verification token management
  * Session refresh and credential rotation
  * Rate-limiting across all authentication endpoints
* **Role-Based Access Control (RBAC):**
  * Granular hierarchy: `ORGANIZATION_OWNER`, `ORGANIZATION_ADMIN`, `PROJECT_ADMIN`, `PROJECT_MANAGER`, `DEVELOPER`, `QA_ENGINEER`, `PRODUCT_MANAGER`, `REPORTER`, `VIEWER`, `GUEST`
  * Permission guards at service and API layers
  * Protected sole owner guarantees (`LAST_OWNER_PROTECTION`)
* **Organizations & Squads (Teams):**
  * Multi-organization switching and active context cookies
  * Organization settings and profile management
  * Squad/team creation, updating, member assignment, and deletion
* **Resilient Infrastructure:**
  * Redis sliding window rate limiter with zero-downtime in-memory fallback
  * Centralized audit logging for organizational mutations
  * OpenAPI 3.0 specification available at `/api/v1/docs`

---

## Quick Start

### 1. Prerequisites
* Node.js >= 20.x
* npm >= 9.x
* (Optional) Docker for local PostgreSQL and Redis

### 2. Installation
```bash
git clone <repo-url>
cd bug-tracker
npm install
```

### 3. Environment Configuration
```bash
cp .env.example .env
```
Ensure `AUTH_SECRET` is generated:
```bash
openssl rand -hex 32
```

### 4. Database Setup & Seeding
```bash
npx prisma db push
npx tsx prisma/seed.ts
```

### 5. Running the Application
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Test Suite & Verification

Run the full automated test suite (75 tests across 10 suites):
```bash
npm test
```

Run linter:
```bash
npm run lint
```

Run TypeScript compiler check:
```bash
npx tsc --noEmit
```

Build for production:
```bash
npm run build
```

---

## Documentation Links

* [ARCHITECTURE.md](ARCHITECTURE.md) — System architecture, layering, and multi-tenant design
* [DATABASE.md](DATABASE.md) — Relational schema models, indexes, and relations
* [ENVIRONMENT.md](ENVIRONMENT.md) — Complete environment variables and infrastructure setup
* [SECURITY.md](SECURITY.md) — Tenant isolation, password hashing, and security policies
* [TESTING.md](TESTING.md) — Test architecture and verification commands
* [PROJECT_STATUS.md](PROJECT_STATUS.md) — Phase 1 verification report and completion checklist
