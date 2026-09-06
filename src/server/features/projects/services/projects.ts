import type {
  ArchiveProjectInput,
  CreateProjectInput,
  RestoreProjectInput,
  SetProjectDomainInput,
  UpdateProjectInput,
} from "@/types/schemas/projects";
import { ProjectRepository } from "@/server/features/projects/repositories/ProjectRepository";
import { AppError } from "@/server/lib/errors";

function mapProject(project: {
  id: string;
  name: string;
  domain: string | null;
  description?: string | null;
  createdAt: string;
}) {
  return {
    id: project.id,
    name: project.name,
    domain: project.domain,
    description: project.description ?? null,
    createdAt: project.createdAt,
  };
}

function isReservedDefaultConflict(
  error: unknown,
  input: { name: string; domain?: string },
) {
  return (
    input.name === "Default" &&
    !input.domain &&
    error instanceof Error &&
    error.message.includes("UNIQUE constraint failed")
  );
}

const RESERVED_DEFAULT_MESSAGE =
  'A project named "Default" with no domain already exists. Pick a different name or add a domain.';

export async function listProjects(organizationId: string) {
  const rows = await ProjectRepository.listProjects(organizationId);
  return rows.map(mapProject);
}

export async function listProjectsEnsuringOne(organizationId: string) {
  const existing = await listProjects(organizationId);
  if (existing.length > 0) {
    return existing;
  }

  await ProjectRepository.tryCreateDefaultProject(organizationId);
  return listProjects(organizationId);
}

function normalizeProjectDomain(domain: string | undefined) {
  if (!domain) return undefined;
  let d = domain.trim().toLowerCase();
  d = d.replace(/^https?:\/\//i, "").replace(/^www\./i, "").replace(/\/.*$/, "");
  return d || undefined;
}

export async function createProject(
  organizationId: string,
  input: CreateProjectInput,
) {
  try {
    const row = await ProjectRepository.createProject(
      organizationId,
      input.name,
      normalizeProjectDomain(input.domain),
      input.description,
    );
    return mapProject(row);
  } catch (error) {
    if (isReservedDefaultConflict(error, input)) {
      throw new AppError("CONFLICT", RESERVED_DEFAULT_MESSAGE);
    }
    throw error;
  }
}

export async function updateProject(
  organizationId: string,
  input: UpdateProjectInput,
) {
  try {
    const row = await ProjectRepository.updateProject(
      input.projectId,
      organizationId,
      {
        name: input.name,
        domain: normalizeProjectDomain(input.domain),
        description: input.description,
      },
    );
    return mapProject(row);
  } catch (error) {
    if (isReservedDefaultConflict(error, input)) {
      throw new AppError("CONFLICT", RESERVED_DEFAULT_MESSAGE);
    }
    throw error;
  }
}

export async function setProjectDomain(
  organizationId: string,
  input: SetProjectDomainInput,
) {
  const domain = normalizeProjectDomain(input.domain);
  if (domain === undefined) {
    throw new AppError("VALIDATION_ERROR", "Enter a valid domain.");
  }
  const row = await ProjectRepository.updateProjectDomain(
    input.projectId,
    organizationId,
    domain,
  );
  return mapProject(row);
}

export async function archiveProject(
  organizationId: string,
  input: ArchiveProjectInput,
) {
  const remaining = await ProjectRepository.countProjects(organizationId);
  if (remaining <= 1) {
    throw new AppError("CONFLICT", "You can't archive your only project.");
  }

  await ProjectRepository.archiveProject(input.projectId, organizationId);
  return { success: true };
}

export async function listArchivedProjects(organizationId: string) {
  const rows = await ProjectRepository.listArchivedProjects(organizationId);
  return rows.map(mapProject);
}

export async function restoreProject(
  organizationId: string,
  input: RestoreProjectInput,
) {
  try {
    await ProjectRepository.restoreProject(
      input.archivedProjectId,
      organizationId,
    );
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("UNIQUE constraint failed")
    ) {
      throw new AppError(
        "CONFLICT",
        'An active project named "Default" with no domain already exists. Rename it first, then restore this one.',
      );
    }
    throw error;
  }
  return { success: true };
}

export async function getProjectForOrganization(
  organizationId: string,
  projectId: string,
) {
  const project = await ProjectRepository.getProjectForOrganization(
    projectId,
    organizationId,
  );
  if (!project) {
    throw new AppError("NOT_FOUND");
  }

  return mapProject(project);
}

export async function getProjectWithOrganization(projectId: string) {
  const project = await ProjectRepository.getProjectById(projectId);
  if (!project) return null;
  return {
    organizationId: project.organizationId,
    project: mapProject(project),
  };
}
