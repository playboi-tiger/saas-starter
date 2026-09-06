import { sql } from "drizzle-orm";
import {
  index,
  pgTable,
  text,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { organization, user } from "./better-auth-schema";

const isoNow = sql`to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')`;
const timestampColumn = (name: string) => text(name);

export const userOnboardingAnswers = pgTable(
  "user_onboarding_answers",
  {
    userId: text("user_id")
      .primaryKey()
      .references(() => user.id, { onDelete: "cascade" }),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    interestedFeatures: text("interested_features").notNull().default("[]"),
    workFor: text("work_for"),
    foundVia: text("found_via"),
    mcpSetupIntent: text("mcp_setup_intent"),
    completedAt: timestampColumn("completed_at"),
    createdAt: timestampColumn("created_at").notNull().default(isoNow),
    updatedAt: timestampColumn("updated_at").notNull().default(isoNow),
  },
  (table) => [
    index("user_onboarding_answers_organization_idx").on(table.organizationId),
  ],
);

// Projects container within an organization
export const projects = pgTable(
  "projects",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    domain: text("domain"),
    createdAt: timestampColumn("created_at").notNull().default(isoNow),
    // Soft delete: archived projects are hidden
    archivedAt: timestampColumn("archived_at"),
  },
  (table) => [
    uniqueIndex("projects_one_default_per_organization_idx")
      .on(table.organizationId)
      .where(
        sql`${table.name} = 'Default' AND ${table.domain} IS NULL AND ${table.archivedAt} IS NULL`,
      ),
    index("projects_organization_id_idx").on(table.organizationId),
  ],
);

// Sample resource entity belonging to a project
export const items = pgTable(
  "items",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    status: text("status", {
      enum: ["active", "draft", "archived"],
    })
      .notNull()
      .default("active"),
    createdAt: timestampColumn("created_at").notNull().default(isoNow),
    updatedAt: timestampColumn("updated_at").notNull().default(isoNow),
  },
  (table) => [
    index("items_project_id_idx").on(table.projectId),
    index("items_project_status_idx").on(table.projectId, table.status),
  ],
);

// Activation milestones (MCP connection, etc.)
export const organizationActivationState = pgTable(
  "organization_activation_state",
  {
    organizationId: text("organization_id")
      .primaryKey()
      .references(() => organization.id, { onDelete: "cascade" }),
    firstMcpAuthorizedAt: timestampColumn("first_mcp_authorized_at"),
    firstMcpToolCallAt: timestampColumn("first_mcp_tool_call_at"),
    updatedAt: timestampColumn("updated_at").notNull().default(isoNow),
  },
);
