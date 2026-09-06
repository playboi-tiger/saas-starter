import { sql } from "drizzle-orm";
import {
  pgTable,
  primaryKey,
  text,
} from "drizzle-orm/pg-core";
import { projects } from "./app.schema";

// Timestamps are stored as *text* (same column shape as the SQLite schema); see
// the note in pg/app.schema.ts. `isoNow` matches `new Date().toISOString()` so
// DB-defaulted and app-written values sort together lexicographically.
const isoNow = sql`to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')`;

// ============================================================================
// Project memory: the shared AI context every surface (SAM, MCP, settings UI)
// reads and writes. Prose lives in the sections table; list-shaped knowledge is
// normalized so it stays joinable instead of buried in markdown.
// ============================================================================

// One row per (project, section). `key` is either a typed key
// ("business_overview", "current_goal", "positioning", "writing_preferences")
// or "custom:<slug>" for an agent-created section, in which case `title` holds
// its display name.
export const projectContextSections = pgTable(
  "project_context_sections",
  {
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    key: text("key").notNull(),
    title: text("title"),
    content: text("content").notNull(),
    updatedAt: text("updated_at").notNull().default(isoNow),
    updatedBy: text("updated_by", { enum: ["user", "sam", "mcp"] }).notNull(),
  },
  // The composite PK is project-leading, so it also serves the "load every
  // section for this project" read.
  (table) => [primaryKey({ columns: [table.projectId, table.key] })],
);
