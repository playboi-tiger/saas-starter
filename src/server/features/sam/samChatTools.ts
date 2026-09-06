import { tool, type Tool, type ToolSet } from "ai";
import { z, type ZodRawShape } from "zod";
import { withPgClient } from "@/db";
import type { CallToolResult } from "@modelcontextprotocol/server";
import { type ToolAuthContext, type ToolContext } from "@/server/mcp/context";
import { instrumentMcpToolHandler } from "@/server/mcp/instrumentation";
import { buildUpdateProjectContextTool } from "@/server/mcp/tools/project-context";
import { whoamiTool } from "@/server/mcp/tools/whoami";
import { listItemsTool, createItemTool } from "@/server/mcp/tools/items";

// Shape of the MCP tool objects exported from src/server/mcp/tools/*. SAM reuses
// the exact same definitions the MCP server registers, so the in-app agent and
// the MCP server can never drift in what a tool does or how it bills.
type McpToolDefinition<Shape extends ZodRawShape> = {
  name: string;
  config: { description?: string; inputSchema: Shape };
  handler: (
    args: z.infer<z.ZodObject<Shape>>,
    context: ToolContext,
  ) => Promise<CallToolResult>;
};

// Flatten an MCP CallToolResult into a plain value for the model: the handler's
// human-readable text summary plus the structured data it returned.
function toModelOutput(result: CallToolResult): unknown {
  const summary = (result.content ?? [])
    .filter(
      (part): part is { type: "text"; text: string } => part.type === "text",
    )
    .map((part) => part.text)
    .join("\n");
  return result.structuredContent
    ? { summary, data: result.structuredContent }
    : { summary };
}

// Adapt one tool into an AI SDK tool.
function adaptMcpTool<Shape extends ZodRawShape>(
  def: McpToolDefinition<Shape>,
  context: ToolContext,
  projectId: string,
): Tool {
  const { projectId: _projectIdSchema, ...modelShape } = def.config.inputSchema;
  const bindsProject = "projectId" in def.config.inputSchema;
  const handler = instrumentMcpToolHandler(def.name, undefined, def.handler);

  return tool({
    description: def.config.description,
    inputSchema: z.object(bindsProject ? modelShape : def.config.inputSchema),
    execute: async (args) => {
      const fullArgs = (bindsProject
        ? { ...args, projectId }
        : args) as unknown as z.infer<z.ZodObject<Shape>>;
      try {
        return toModelOutput(
          await withPgClient(() => handler(fullArgs, context)),
        );
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : String(error),
        };
      }
    },
  });
}

/**
 * Builds the AI assistant's tool surface as an AI SDK ToolSet.
 */
export function buildSamMcpTools(
  authContext: ToolAuthContext,
  project: { id: string; domain: string | null },
): ToolSet {
  const projectId = project.id;
  const toolContext: ToolContext = { auth: authContext };
  const adaptTool = <Shape extends ZodRawShape>(
    definition: McpToolDefinition<Shape>,
  ) => adaptMcpTool(definition, toolContext, projectId);

  return {
    whoami: adaptTool(whoamiTool),
    update_project_context: adaptTool(buildUpdateProjectContextTool("sam")),
    list_items: adaptTool(listItemsTool),
    create_item: adaptTool(createItemTool),
  };
}
