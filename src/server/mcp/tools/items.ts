import { z } from "zod";
import { ItemService } from "@/server/features/items/services/ItemService";
import { buildProjectMeta } from "@/server/mcp/context";
import { mcpResponse } from "@/server/mcp/formatters";
import {
  looseObjectOutputSchema,
  optionalMetaOutputSchema,
} from "@/server/mcp/output-schemas";
import { withMcpProjectAuth } from "@/server/mcp/project-auth";
import { projectIdSchema } from "@/server/mcp/schemas";

const listInputSchema = {
  projectId: projectIdSchema,
} as const;

export const listItemsTool = {
  name: "list_items",
  config: {
    title: "List items",
    description: "List all items belonging to a project.",
    inputSchema: listInputSchema,
    outputSchema: {
      items: z.array(looseObjectOutputSchema),
      ...optionalMetaOutputSchema,
    },
    annotations: {
      readOnlyHint: true,
      openWorldHint: false,
      destructiveHint: false,
    },
  },
  handler: withMcpProjectAuth(
    async (args: z.infer<z.ZodObject<typeof listInputSchema>>, context) => {
      const items = await ItemService.listItems(args.projectId);
      return mcpResponse({
        text: `Found ${items.length} item(s).\n${items
          .map((i) => `- [${i.status}] ${i.name} (id: ${i.id})`)
          .join("\n")}`,
        meta: buildProjectMeta(
          context,
          args.projectId,
          `/p/${args.projectId}/items`,
        ),
        structuredContent: { items },
      });
    },
  ),
};

const createInputSchema = {
  projectId: projectIdSchema,
  name: z.string().trim().min(1).max(255).describe("Name of the item"),
  description: z.string().trim().max(1000).optional().describe("Optional description of the item"),
  status: z
    .enum(["active", "draft", "archived"])
    .optional()
    .describe("Status of the item (default: active)"),
} as const;

export const createItemTool = {
  name: "create_item",
  config: {
    title: "Create item",
    description: "Create a new item in a project.",
    inputSchema: createInputSchema,
    outputSchema: {
      item: looseObjectOutputSchema,
      ...optionalMetaOutputSchema,
    },
    annotations: {
      readOnlyHint: false,
      openWorldHint: false,
      destructiveHint: false,
    },
  },
  handler: withMcpProjectAuth(
    async (args: z.infer<z.ZodObject<typeof createInputSchema>>, context) => {
      const item = await ItemService.createItem({
        projectId: args.projectId,
        name: args.name,
        description: args.description,
        status: args.status ?? "active",
      });
      return mcpResponse({
        text: `Created item "${item.name}" (id: ${item.id}).`,
        meta: buildProjectMeta(
          context,
          args.projectId,
          `/p/${args.projectId}/items`,
        ),
        structuredContent: { item },
      });
    },
  ),
};
