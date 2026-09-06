import { requireOrgPermission } from "@/server/auth/org-gate";
import { AuthRepository } from "@/server/auth/repositories/AuthRepository";
import { ProjectService } from "@/server/features/projects/services/ProjectService";
import { AppError } from "@/server/lib/errors";
import { mcpResponse } from "@/server/mcp/formatters";
import { type ToolContext } from "@/server/mcp/context";
import { optionalMetaOutputSchema } from "@/server/mcp/output-schemas";
import { buildDashboardUrl } from "@/server/mcp/urls";
import { createProjectSchema } from "@/types/schemas/projects";
import { z } from "zod";

const inputSchema = {
  name: z
    .string()
    .trim()
    .min(1)
    .max(120)
    .describe("Project name (1-120 characters)."),
  domain: z
    .string()
    .trim()
    .max(255)
    .optional()
    .describe('Optional root domain for the project, e.g. "example.com".'),
  description: z
    .string()
    .trim()
    .max(500)
    .optional()
    .describe("Optional project description."),
  organizationId: z
    .string()
    .trim()
    .min(1)
    .optional()
    .describe(
      "Organization id to create the project in. Required when the user belongs to more than one organization.",
    ),
} as const;

type Args = z.infer<z.ZodObject<typeof inputSchema>>;

// Which organization gets the project. Pinned credentials (OAuth tokens,
// self-host, SAM) are bound to one org. User-scoped credentials (API keys)
// span organizations, so an ambiguous target is an error listing the options —
// the agent must confirm the choice with the user rather than guessing.
async function resolveTargetOrganization(
  auth: Omit<ToolContext["auth"], "baseUrl">,
  organizationId: string | undefined,
) {
  if (auth.orgScope !== "user") {
    if (organizationId && organizationId !== auth.organizationId) {
      throw new AppError(
        "FORBIDDEN",
        "This connection is bound to a single organization — omit organizationId.",
      );
    }
    return { organizationId: auth.organizationId, role: auth.role };
  }

  const memberships = await AuthRepository.listMembershipsForUser(auth.userId);
  if (organizationId) {
    const membership = memberships.find(
      (candidate) => candidate.organizationId === organizationId,
    );
    if (!membership) {
      throw new AppError(
        "FORBIDDEN",
        "The user is not a member of that organization.",
      );
    }
    return { organizationId, role: membership.role };
  }
  if (memberships.length === 1) {
    const only = memberships[0];
    return { organizationId: only.organizationId, role: only.role };
  }
  if (memberships.length === 0) {
    throw new AppError("FORBIDDEN");
  }
  const organizationList = memberships
    .map(
      (membership) =>
        `- ${membership.organizationId}  ${membership.organizationName}`,
    )
    .join("\n");
  throw new AppError(
    "VALIDATION_ERROR",
    `The user belongs to ${memberships.length} organizations. Ask the user which organization this project should be created in, then retry with organizationId set:\n${organizationList}`,
  );
}

export const createProjectTool = {
  name: "create_project",
  config: {
    title: "Create project",
    description:
      "Create a new project in the user's organization. Provide a name, and optionally a domain and description. Returns the created project object; pass the returned `id` as `projectId` to other tools.",
    inputSchema,
    outputSchema: {
      project: z
        .object({
          id: z.string(),
          name: z.string(),
          domain: z.string().nullable().optional(),
          description: z.string().nullable().optional(),
          url: z.string(),
        })
        .passthrough(),
      ...optionalMetaOutputSchema,
    },
    annotations: {
      readOnlyHint: false,
      openWorldHint: false,
      destructiveHint: false,
    },
  },
  handler: async (args: Args, context: ToolContext) => {
    const { baseUrl, ...auth } = context.auth;
    const target = await resolveTargetOrganization(auth, args.organizationId);
    requireOrgPermission(target, { project: ["create"] });
    const parsedInput = createProjectSchema.safeParse(args);
    if (!parsedInput.success) {
      throw new AppError(
        "VALIDATION_ERROR",
        z.prettifyError(parsedInput.error),
      );
    }
    const input = parsedInput.data;
    const project = await ProjectService.createProject(
      target.organizationId,
      input,
    );
    return mcpResponse({
      text: `Created project ${project.id}  ${project.name}${
        project.domain ? ` (${project.domain})` : ""
      }`,
      meta: {
        url: buildDashboardUrl(baseUrl, `/p/${project.id}`),
      },
      structuredContent: {
        project: {
          id: project.id,
          name: project.name,
          domain: project.domain,
          description: project.description,
          url: buildDashboardUrl(baseUrl, `/p/${project.id}`),
        },
      },
    });
  },
};
