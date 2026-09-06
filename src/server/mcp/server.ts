import {
  type CallToolResult,
  McpServer,
  type ToolAnnotations,
} from "@modelcontextprotocol/server";
import type { z } from "zod";
import {
  createMcpToolContext,
  type McpProps,
  type ToolContext,
} from "@/server/mcp/context";
import { objectSchema } from "@/server/mcp/output-schemas";
import { instrumentMcpToolHandler } from "@/server/mcp/instrumentation";
import { whoamiTool } from "@/server/mcp/tools/whoami";
import { listProjectsTool } from "@/server/mcp/tools/list-projects";
import { createProjectTool } from "@/server/mcp/tools/create-project";
import {
  getProjectContextTool,
  updateProjectContextTool,
} from "@/server/mcp/tools/project-context";
import { listItemsTool, createItemTool } from "@/server/mcp/tools/items";

type ToolSchema = z.ZodType | z.ZodRawShape;

type ToolArgs<Input extends ToolSchema> = Input extends z.ZodType
  ? z.infer<Input>
  : Input extends z.ZodRawShape
    ? z.infer<z.ZodObject<Input>>
    : never;

type StarterToolDefinition<Input extends ToolSchema> = {
  name: string;
  config: {
    title?: string;
    description?: string;
    inputSchema: Input;
    outputSchema?: ToolSchema;
    annotations?: ToolAnnotations;
  };
  handler: (
    args: ToolArgs<Input>,
    context: ToolContext,
  ) => CallToolResult | Promise<CallToolResult>;
};

function registerStarterTool<Input extends ToolSchema>(
  server: McpServer,
  tool: StarterToolDefinition<Input>,
  authProps: McpProps,
) {
  const outputSchema = objectSchema(tool.config.outputSchema);
  const handler = instrumentMcpToolHandler(
    tool.name,
    outputSchema,
    tool.handler,
  );

  server.registerTool(
    tool.name,
    {
      ...tool.config,
      inputSchema: objectSchema(tool.config.inputSchema),
      outputSchema,
    },
    (args, context) => {
      return handler(
        // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- args were validated against the tool's own inputSchema just above
        args as ToolArgs<Input>,
        createMcpToolContext(context, authProps),
      );
    },
  );
}

export function createStarterMcpServer(authProps: McpProps) {
  const server = new McpServer(
    {
      name: "SaaS Starter MCP",
      title: "SaaS Starter",
      version: "0.1.0",
      description: "Model Context Protocol server for SaaS Starter application.",
    },
    {
      capabilities: { tools: { listChanged: false } },
    },
  );

  const register = <Input extends ToolSchema>(
    tool: StarterToolDefinition<Input>,
  ) => registerStarterTool(server, tool, authProps);

  register(whoamiTool);
  register(listProjectsTool);
  register(createProjectTool);
  register(getProjectContextTool);
  register(updateProjectContextTool);
  register(listItemsTool);
  register(createItemTool);

  return server;
}

export const createOpenSeoMcpServer = createStarterMcpServer;

