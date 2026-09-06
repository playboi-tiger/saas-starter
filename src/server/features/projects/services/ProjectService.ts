import {
  archiveProject,
  createProject,
  getProjectForOrganization,
  getProjectWithOrganization,
  listArchivedProjects,
  listProjects,
  listProjectsEnsuringOne,
  restoreProject,
  setProjectDomain,
  updateProject,
} from "@/server/features/projects/services/projects";

export const ProjectService = {
  listProjects,
  listProjectsEnsuringOne,
  createProject,
  updateProject,
  setProjectDomain,
  archiveProject,
  restoreProject,
  listArchivedProjects,
  getProjectForOrganization,
  getProjectWithOrganization,
} as const;
