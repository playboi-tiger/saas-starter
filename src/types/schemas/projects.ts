import { z } from "zod";

const projectNameField = z
  .string()
  .trim()
  .min(1, "Project name is required")
  .max(120);

const projectDomainField = z
  .string()
  .trim()
  .max(255)
  .transform((value) => value || undefined)
  .optional();

export const createProjectSchema = z.object({
  name: projectNameField,
  domain: projectDomainField,
  description: z.string().trim().max(500).optional(),
});

export const updateProjectSchema = z.object({
  projectId: z.string().min(1),
  name: projectNameField,
  domain: projectDomainField,
  description: z.string().trim().max(500).optional(),
});

export const setProjectDomainSchema = z.object({
  projectId: z.string().min(1),
  domain: z.string().trim().min(1).max(255),
});

export const archiveProjectSchema = z.object({
  projectId: z.string().min(1),
});

export const restoreProjectSchema = z.object({
  archivedProjectId: z.string().min(1),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type SetProjectDomainInput = z.infer<typeof setProjectDomainSchema>;
export type ArchiveProjectInput = z.infer<typeof archiveProjectSchema>;
export type RestoreProjectInput = z.infer<typeof restoreProjectSchema>;
