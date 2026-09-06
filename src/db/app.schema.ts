import {
  sqliteTable,
  text,
  uniqueIndex,
  index,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { organization, user } from "./better-auth-schema";

export const userOnboardingAnswers = sqliteTable(
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
    completedAt: text("completed_at"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(current_timestamp)`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (table) => [
    index("user_onboarding_answers_organization_idx").on(table.organizationId),
  ],
);

// Projects container within an organization
export const projects = sqliteTable(
  "projects",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    domain: text("domain"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(current_timestamp)`),
    // Soft delete: archived projects are hidden
    archivedAt: text("archived_at"),
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
export const items = sqliteTable(
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
    createdAt: text("created_at")
      .notNull()
      .default(sql`(current_timestamp)`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (table) => [
    index("items_project_id_idx").on(table.projectId),
    index("items_project_status_idx").on(table.projectId, table.status),
  ],
);

// Activation milestones (MCP connection, etc.)
export const organizationActivationState = sqliteTable(
  "organization_activation_state",
  {
    organizationId: text("organization_id")
      .primaryKey()
      .references(() => organization.id, { onDelete: "cascade" }),
    firstMcpAuthorizedAt: text("first_mcp_authorized_at"),
    firstMcpToolCallAt: text("first_mcp_tool_call_at"),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`(current_timestamp)`),
  },
);
