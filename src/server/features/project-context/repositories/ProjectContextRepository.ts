import { and, asc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import type { runBatch } from "@/db/runBatch";
import { projectContextSections } from "@/db/schema";
import type { ContextAuthor } from "@/types/schemas/projectContext";

// Backing store for project memory. Every surface (settings UI, MCP tools, SAM)
// reads and writes these same rows through ProjectContextService. Reads execute
// directly; writes are statement builders the service runs atomically inside
// one `runBatch`, so a failing op can't leave the project half-updated.

type Tx = Parameters<Parameters<typeof runBatch>[0]>[0];

async function listSections(projectId: string) {
  return db
    .select()
    .from(projectContextSections)
    .where(eq(projectContextSections.projectId, projectId))
    .orderBy(asc(projectContextSections.key));
}

function upsertSection(
  tx: Tx,
  params: {
    projectId: string;
    key: string;
    title: string | null;
    content: string;
    updatedBy: ContextAuthor;
  },
) {
  const updatedAt = new Date().toISOString();
  return tx
    .insert(projectContextSections)
    .values({ ...params, updatedAt })
    .onConflictDoUpdate({
      target: [projectContextSections.projectId, projectContextSections.key],
      set: {
        // A title is only sent when the caller renames a custom section, so an
        // omitted one keeps the stored name.
        title: sql`coalesce(excluded.title, ${projectContextSections.title})`,
        content: params.content,
        updatedAt,
        updatedBy: params.updatedBy,
      },
    });
}

function deleteSection(tx: Tx, projectId: string, key: string) {
  return tx
    .delete(projectContextSections)
    .where(
      and(
        eq(projectContextSections.projectId, projectId),
        eq(projectContextSections.key, key),
      ),
    );
}

export const ProjectContextRepository = {
  listSections,
  upsertSection,
  deleteSection,
} as const;
