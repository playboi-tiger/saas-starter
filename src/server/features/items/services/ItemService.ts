import { ItemRepository } from "@/server/features/items/repositories/ItemRepository";
import { AppError } from "@/server/lib/errors";
import type {
  CreateItemInput,
  UpdateItemInput,
  DeleteItemInput,
} from "@/types/schemas/items";

async function listItems(projectId: string) {
  return ItemRepository.listItems(projectId);
}

async function getItem(id: string, projectId: string) {
  const item = await ItemRepository.getItemById(id, projectId);
  if (!item) {
    throw new AppError("NOT_FOUND", "Item not found");
  }
  return item;
}

async function createItem(input: CreateItemInput) {
  const id = crypto.randomUUID();
  return ItemRepository.createItem(input.projectId, {
    id,
    name: input.name,
    description: input.description,
    status: input.status,
  });
}

async function updateItem(input: UpdateItemInput) {
  const existing = await ItemRepository.getItemById(input.id, input.projectId);
  if (!existing) {
    throw new AppError("NOT_FOUND", "Item not found");
  }
  return ItemRepository.updateItem(input.id, input.projectId, {
    name: input.name,
    description: input.description,
    status: input.status,
  });
}

async function deleteItem(input: DeleteItemInput) {
  const existing = await ItemRepository.getItemById(input.id, input.projectId);
  if (!existing) {
    throw new AppError("NOT_FOUND", "Item not found");
  }
  return ItemRepository.deleteItem(input.id, input.projectId);
}

export const ItemService = {
  listItems,
  getItem,
  createItem,
  updateItem,
  deleteItem,
};
