# Cloudflare SaaS & AI Starter Template

A modern, production-ready full-stack SaaS and AI starter template built for Cloudflare Workers and modern edge runtimes.

## Highlights

- ⚡ **Full-Stack TanStack**: TanStack Start (SSR), TanStack Router (file-based routing), TanStack Query, and TanStack Form.
- 🎨 **Modern Styling**: Tailwind CSS v4 + DaisyUI v5 with dark/light theme switching.
- 🔐 **Multi-Tenant Auth**: [Better-Auth](https://better-auth.com/) with email/password, social login, organizations, invitations, roles, and API key management.
- 💾 **Dual-Backend Drizzle ORM**: Native support for **Cloudflare D1 (SQLite)** and **PostgreSQL** with 100% schema parity guarded by automated tests.
- 🤖 **AI Streaming Chat**: Built-in AI chat agent powered by Cloudflare Agents Durable Objects and OpenRouter.
- 🔌 **Built-in Model Context Protocol (MCP)**: Native MCP server exposing tools with OAuth and API key authentication for Claude Code, Cursor, and custom agents.
- 💳 **Billing Ready**: Integrated Autumn billing lifecycle and checkout.
- 📦 **Canonical CRUD Example**: Includes a clean `items` feature demonstrating the full stack (schema, repository, service, server function, queries, UI, and MCP tools).
- 🧪 **High Quality Gates**: Pre-configured with Vitest (380+ tests passing), Oxlint, and TypeScript strict mode.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Runtime** | Cloudflare Workers & Durable Objects |
| **Framework** | TanStack Start (Vite + SSR) |
| **Routing** | TanStack Router (Type-safe file-based routes) |
| **Database** | Drizzle ORM (Cloudflare D1 SQLite & PostgreSQL) |
| **Auth** | Better-Auth (Multi-tenancy & Organizations) |
| **Styling** | Tailwind CSS v4, DaisyUI v5, Lucide Icons |
| **AI / DO** | Cloudflare Agents, Durable Objects, OpenRouter |
| **Protocol** | Model Context Protocol (MCP) server |
| **Billing** | Autumn billing |
| **Testing & Linting** | Vitest, Playwright, Oxlint, TypeScript |

---

## Quick Start

### 1. Prerequisites

- Node.js >= 20
- [pnpm](https://pnpm.io/) >= 9

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Environment Setup

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Configure your secrets:
- `BETTER_AUTH_SECRET`: Generate a random 32+ character string.
- `OPENROUTER_API_KEY`: (Optional) For AI chat agent features.

### 4. Database Setup

Apply local Cloudflare D1 migrations:

```bash
pnpm db:migrate:local
```

*(If using Postgres instead, set `DATABASE_PROVIDER=postgres` and `POSTGRES_URL`, then run `pnpm db:migrate:pg`)*.

### 5. Start Development Server

```bash
pnpm dev
```

Visit [http://localhost:3001](http://localhost:3001) in your browser.

---

## Project Structure

```
├── .agents/               # Agent skills and workflows
├── drizzle/               # D1 SQLite migrations
├── drizzle-pg/            # Postgres migrations
├── src/
│   ├── client/            # Frontend React features, components, and hooks
│   │   ├── components/    # Reusable UI primitives (Chat, Tables, Modals)
│   │   └── features/      # Feature-specific components (items, projects, auth, billing)
│   ├── db/                # Drizzle schemas for both SQLite and Postgres
│   │   ├── d1/            # D1 SQLite schema
│   │   ├── pg/            # Postgres schema
│   │   └── schema-parity.test.ts # Schema parity tests
│   ├── routes/            # TanStack Router file-based route definitions
│   ├── server/            # Backend services, repositories, and handlers
│   │   ├── auth/          # Better-Auth configuration and repositories
│   │   ├── features/      # Feature domain services (items, projects, sam agent)
│   │   └── mcp/           # Built-in Model Context Protocol (MCP) server & tools
│   ├── serverFunctions/   # Type-safe RPC server functions
│   ├── shared/            # Universal schemas, errors, and utilities
│   └── types/             # Zod contracts and shared TypeScript types
```

---

## Adding a New Feature (The Canonical Pattern)

Follow the structure demonstrated by the canonical `items` sample:

1. **Define Schema**:
   - Add SQLite table in `src/db/d1/schema.ts`
   - Add matching Postgres table in `src/db/pg/schema.ts`
   - Ensure `pnpm test` passes (`src/db/schema-parity.test.ts` validates parity)
2. **Define Validation & Types**:
   - Create Zod schemas in `src/types/schemas/<feature>.ts`
3. **Add Repository**:
   - Implement database queries in `src/server/features/<feature>/repositories/<Feature>Repository.ts`
4. **Add Service**:
   - Implement business logic in `src/server/features/<feature>/services/<feature>.ts`
5. **Add Server Functions**:
   - Expose endpoints via `createServerRpc` in `src/serverFunctions/<feature>.ts`
6. **Add UI & Queries**:
   - Create query hooks in `src/client/features/<feature>/<feature>Queries.ts`
   - Build page components in `src/client/features/<feature>/`
   - Add route in `src/routes/_project/p/$projectId/<feature>.tsx`
7. **Expose MCP Tools (Optional)**:
   - Add agent tool definitions in `src/server/mcp/tools/<feature>.ts`

---

## Available Scripts

- `pnpm dev` - Start local development server
- `pnpm build` - Production build (Vite client + SSR + type-check)
- `pnpm test` - Run Vitest test suite
- `pnpm lint` - Run Oxlint linter
- `pnpm types:check` - Check TypeScript types with `tsc --noEmit`
- `pnpm db:generate` - Generate Drizzle migrations for D1 and Postgres
- `pnpm db:migrate:local` - Apply D1 migrations to local SQLite
- `pnpm db:migrate:prod` - Apply D1 migrations to Cloudflare remote D1
- `pnpm db:migrate:pg` - Apply migrations to PostgreSQL
- `pnpm ci:check` - Run full CI checks (format, types, lint, tests)
- `pnpm deploy` - Deploy to Cloudflare Workers

---

## License

MIT
