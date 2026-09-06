import { z } from "zod";

export const itemStatusSchema = z.enum(["active", "draft", "archived"]);

export const createItemSchema = z.object({
  projectId: z.string().min(1),
  name: z.string().trim().min(1, "Name is required").max(200),
  description: z.string().trim().max(1000).optional(),
  status: itemStatusSchema.default("active"),
});

export const updateItemSchema = z.object({
  id: z.string().min(1),
  projectId: z.string().min(1),
  name: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(1000).nullish(),
  status: itemStatusSchema.optional(),
});

export const deleteItemSchema = z.object({
  id: z.string().min(1),
  projectId: z.string().min(1),
});

export const getItemsSchema = z.object({
  projectId: z.string().min(1),
});

export type ItemStatus = z.infer<typeof itemStatusSchema>;
export type CreateItemInput = z.infer<typeof createItemSchema>;
export type UpdateItemInput = z.infer<typeof updateItemSchema>;
export type DeleteItemInput = z.infer<typeof deleteItemSchema>;
