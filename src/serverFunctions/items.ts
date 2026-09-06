import { createServerFn } from "@tanstack/react-start";
import { ItemService } from "@/server/features/items/services/ItemService";
import { requireProjectContext } from "@/serverFunctions/middleware";
import {
  createItemSchema,
  deleteItemSchema,
  getItemsSchema,
  updateItemSchema,
} from "@/types/schemas/items";

export const getItems = createServerFn({ method: "POST" })
  .middleware(requireProjectContext)
  .validator(getItemsSchema)
  .handler(async ({ data }) => {
    return ItemService.listItems(data.projectId);
  });

export const createItem = createServerFn({ method: "POST" })
  .middleware(requireProjectContext)
  .validator(createItemSchema)
  .handler(async ({ data }) => {
    return ItemService.createItem(data);
  });

export const updateItem = createServerFn({ method: "POST" })
  .middleware(requireProjectContext)
  .validator(updateItemSchema)
  .handler(async ({ data }) => {
    return ItemService.updateItem(data);
  });

export const deleteItem = createServerFn({ method: "POST" })
  .middleware(requireProjectContext)
  .validator(deleteItemSchema)
  .handler(async ({ data }) => {
    return ItemService.deleteItem(data);
  });
