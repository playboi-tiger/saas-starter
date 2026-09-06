import { z } from "zod";

// Shared vocabulary for project memory. The MCP tools, the server functions and
// the settings UI all validate against these, so the wire shape of a patch op is
// defined exactly once.

export const PROJECT_CONTEXT_SECTION_KEYS = [
  "business_overview",
  "current_goal",
  "positioning",
  "writing_preferences",
] as const;

const projectContextSectionKeySchema = z.enum(PROJECT_CONTEXT_SECTION_KEYS);

export type ProjectContextSectionKey = z.infer<
  typeof projectContextSectionKeySchema
>;

export const PROJECT_CONTEXT_SECTION_LABELS: Record<
  ProjectContextSectionKey,
  string
> = {
  business_overview: "Business overview",
  current_goal: "Current goal",
  positioning: "Positioning",
  writing_preferences: "Writing preferences",
};

/** Cap on every prose section, enforced by the service and hinted in the UI. */
export const PROSE_MAX_CHARS = 4000;

export const CONTEXT_AUTHORS = ["user", "sam", "mcp"] as const;
export const contextAuthorSchema = z.enum(CONTEXT_AUTHORS);
export type ContextAuthor = z.infer<typeof contextAuthorSchema>;

// Custom sections are addressed by slug; the stored key is `custom:<slug>`.
const customSectionSlugSchema = z
  .string()
  .trim()
  .max(60)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Use a lowercase slug like 'launch-plan'",
  );

export const CUSTOM_SECTION_KEY_PREFIX = "custom:";

// A patch op, discriminated by which key it carries. Strict objects keep the
// members disjoint, so a typo like `{ section, contents }` fails validation
// instead of silently matching another member.
const projectContextUpdateSchema = z.union([
  z.strictObject({
    section: projectContextSectionKeySchema,
    // An empty string clears the section.
    content: z.string(),
  }),
  z.strictObject({
    customSection: customSectionSlugSchema,
    title: z.string().trim().min(1).max(120).optional(),
    content: z.string(),
  }),
  z.strictObject({ deleteCustomSection: customSectionSlugSchema }),
]);

export type ProjectContextUpdate = z.infer<typeof projectContextUpdateSchema>;

export const getProjectContextSchema = z.object({
  projectId: z.string().min(1),
});

export const updateProjectContextSchema = z.object({
  projectId: z.string().min(1),
  updates: z.array(projectContextUpdateSchema).min(1).max(50),
});
