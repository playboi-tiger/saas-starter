import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { items } from "@/db/schema";

export type ItemRow = typeof items.$inferSelect;

async function listItems(projectId: string) {
  return db
    .select()
    .from(items)
    .where(eq(items.projectId, projectId))
    .orderBy(desc(items.createdAt));
}

async function getItemById(id: string, projectId: string) {
  const [row] = await db
    .select()
    .from(items)
    .where(and(eq(items.id, id), eq(items.projectId, projectId)))
    .limit(1);
  return row ?? null;
}

async function createItem(
  projectId: string,
  data: {
    id: string;
    name: string;
    description?: string | null;
    status?: "active" | "draft" | "archived";
  },
) {
  const [created] = await db
    .insert(items)
    .values({
      id: data.id,
      projectId,
      name: data.name,
      description: data.description ?? null,
      status: data.status ?? "active",
    })
    .returning();
  return created;
}

async function updateItem(
  id: string,
  projectId: string,
  data: {
    name?: string;
    description?: string | null;
    status?: "active" | "draft" | "archived";
  },
) {
  const [updated] = await db
    .update(items)
    .set({
      ...data,
      updatedAt: new Date().toISOString(),
    })
    .where(and(eq(items.id, id), eq(items.projectId, projectId)))
    .returning();
  return updated ?? null;
}

async function deleteItem(id: string, projectId: string) {
  const [deleted] = await db
    .delete(items)
    .where(and(eq(items.id, id), eq(items.projectId, projectId)))
    .returning();
  return deleted ?? null;
}

export const ItemRepository = {
  listItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
};
