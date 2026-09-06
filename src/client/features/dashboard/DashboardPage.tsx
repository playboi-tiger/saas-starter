import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  Bot,
  Brain,
  Layers,
  Settings,
  Sparkles,
  ArrowRight,
  Cpu,
  Code2,
} from "lucide-react";
import { getDashboardOverview } from "@/serverFunctions/dashboard";

export function DashboardPage({ projectId }: { projectId: string }) {
  const { data: overview, isLoading } = useQuery({
    queryKey: ["dashboardOverview", projectId],
    queryFn: () => getDashboardOverview({ data: { projectId } }),
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-base-content/70 mt-1">
          Welcome to your SaaS application starter. Manage items, interact with AI agents, and customize your application.
        </p>
      </div>

      {/* Metric Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card bg-base-100 border border-base-300 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-base-content/60">Total Items</span>
            <Layers className="size-4 text-primary" />
          </div>
          <div className="mt-2 text-3xl font-bold">
            {isLoading ? "—" : (overview?.itemsCount.total ?? 0)}
          </div>
          <span className="text-xs text-base-content/60 mt-1">
            {isLoading
              ? "Loading..."
              : `${overview?.itemsCount.active ?? 0} active, ${overview?.itemsCount.draft ?? 0} draft`}
          </span>
        </div>

        <div className="card bg-base-100 border border-base-300 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-base-content/60">Active Items</span>
            <span className="badge badge-success badge-sm font-medium">Live</span>
          </div>
          <div className="mt-2 text-3xl font-bold">
            {isLoading ? "—" : (overview?.itemsCount.active ?? 0)}
          </div>
          <span className="text-xs text-base-content/60 mt-1">Ready for production</span>
        </div>

        <div className="card bg-base-100 border border-base-300 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-base-content/60">Project Memory</span>
            <Brain className="size-4 text-accent" />
          </div>
          <div className="mt-2 text-3xl font-bold">
            {isLoading
              ? "—"
              : `${overview?.contextCount.filled ?? 0}/${overview?.contextCount.total ?? 4}`}
          </div>
          <span className="text-xs text-base-content/60 mt-1">Sections configured</span>
        </div>

        <div className="card bg-base-100 border border-base-300 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-base-content/60">AI Integration</span>
            <Bot className="size-4 text-info" />
          </div>
          <div className="mt-2 text-3xl font-bold text-success">Active</div>
          <span className="text-xs text-base-content/60 mt-1">MCP + In-app Agent</span>
        </div>
      </div>

      {/* Feature Navigation Cards */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Core Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Items Card */}
          <Link
            to="/p/$projectId/items"
            params={{ projectId }}
            className="card bg-base-100 border border-base-300 hover:border-primary/50 transition-all shadow-xs hover:shadow-md group p-6"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
                <Layers className="size-5" />
              </div>
              <ArrowRight className="size-4 text-base-content/40 group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="font-semibold text-base mb-1">Items Manager</h3>
            <p className="text-sm text-base-content/70">
              Sample CRUD feature with dual D1 SQLite and Postgres ORM parity, TanStack Query, and mutations.
            </p>
          </Link>

          {/* AI Chat Card */}
          <Link
            to="/p/$projectId/sam"
            params={{ projectId }}
            className="card bg-base-100 border border-base-300 hover:border-info/50 transition-all shadow-xs hover:shadow-md group p-6"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="rounded-lg bg-info/10 text-info p-2.5">
                <Bot className="size-5" />
              </div>
              <ArrowRight className="size-4 text-base-content/40 group-hover:text-info group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="font-semibold text-base mb-1">AI Assistant</h3>
            <p className="text-sm text-base-content/70">
              Streaming chat agent running on Cloudflare Durable Objects, with function calling and project memory.
            </p>
          </Link>

          {/* Project Context */}
          <Link
            to="/p/$projectId/settings/context"
            params={{ projectId }}
            className="card bg-base-100 border border-base-300 hover:border-accent/50 transition-all shadow-xs hover:shadow-md group p-6"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="rounded-lg bg-accent/10 text-accent p-2.5">
                <Brain className="size-5" />
              </div>
              <ArrowRight className="size-4 text-base-content/40 group-hover:text-accent group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="font-semibold text-base mb-1">Project Context</h3>
            <p className="text-sm text-base-content/70">
              Shared qualitative memory and preferences accessible to both human users and AI agents.
            </p>
          </Link>

          {/* MCP Server Setup */}
          <Link
            to="/ai"
            className="card bg-base-100 border border-base-300 hover:border-warning/50 transition-all shadow-xs hover:shadow-md group p-6"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="rounded-lg bg-warning/10 text-warning p-2.5">
                <Cpu className="size-5" />
              </div>
              <ArrowRight className="size-4 text-base-content/40 group-hover:text-warning group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="font-semibold text-base mb-1">Model Context Protocol</h3>
            <p className="text-sm text-base-content/70">
              Connect external AI coding agents (Claude Code, Cursor, Windsurf) to your backend over SSE/OAuth.
            </p>
          </Link>

          {/* Settings */}
          <Link
            to="/p/$projectId/settings"
            params={{ projectId }}
            className="card bg-base-100 border border-base-300 hover:border-base-content/30 transition-all shadow-xs hover:shadow-md group p-6"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="rounded-lg bg-base-200 p-2.5 text-base-content/70">
                <Settings className="size-5" />
              </div>
              <ArrowRight className="size-4 text-base-content/40 group-hover:text-base-content group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="font-semibold text-base mb-1">Project Settings</h3>
            <p className="text-sm text-base-content/70">
              Manage project name, root domain, metadata, and organization permissions.
            </p>
          </Link>

          {/* Architecture info */}
          <div className="card bg-base-200/50 border border-base-300 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-base-content/60 mb-2">
                <Code2 className="size-4 text-primary" />
                Template Stack
              </div>
              <p className="text-xs text-base-content/70 leading-relaxed">
                TanStack Start (SSR) • Cloudflare Workers • Better-Auth Multi-Tenant • Drizzle ORM (D1 + Postgres) • DaisyUI 5 • MCP Server.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-base-300/50 flex items-center justify-between text-xs text-base-content/50">
              <span>Ready for your features</span>
              <Sparkles className="size-3.5 text-primary" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
