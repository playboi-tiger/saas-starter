type McpTool = {
  name: string;
  title: string;
  description: string;
};

type ToolCategory = {
  label: string;
  tools: McpTool[];
};

const toolCategories: ToolCategory[] = [
  {
    label: "Account & Projects",
    tools: [
      {
        name: "whoami",
        title: "Who am I",
        description: "Check your user ID, email, role, and organization scopes.",
      },
      {
        name: "list_projects",
        title: "List projects",
        description: "List all projects in your organization.",
      },
      {
        name: "create_project",
        title: "Create project",
        description: "Create a new project in your organization.",
      },
    ],
  },
  {
    label: "Project Context",
    tools: [
      {
        name: "get_project_context",
        title: "Get project context",
        description: "Read your project's business overview, goals, positioning, and preferences.",
      },
      {
        name: "update_project_context",
        title: "Update project context",
        description: "Save facts, preferences, or updates back to your shared project context.",
      },
    ],
  },
  {
    label: "Items (CRUD Entity)",
    tools: [
      {
        name: "list_items",
        title: "List items",
        description: "List all items belonging to a project.",
      },
      {
        name: "create_item",
        title: "Create item",
        description: "Create a new item in a project.",
      },
    ],
  },
];

export function AvailableTools() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-sm font-medium">Available MCP Tools</h2>
        <p className="text-xs text-base-content/60">
          Tools your AI agent can call when connected over Model Context Protocol:
        </p>
      </div>

      <div className="space-y-6">
        {toolCategories.map((category) => (
          <div key={category.label} className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-base-content/50">
              {category.label}
            </h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {category.tools.map((tool) => (
                <div
                  key={tool.name}
                  className="rounded-lg border border-base-200 bg-base-100 p-3 text-left shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-medium text-primary">
                      {tool.name}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-base-content/70">
                    {tool.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
