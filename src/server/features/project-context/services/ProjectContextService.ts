import { runBatch } from "@/db/runBatch";
import { ProjectContextRepository } from "@/server/features/project-context/repositories/ProjectContextRepository";
import { resolveContextUpdates } from "@/server/features/project-context/services/contextUpdateOps";
import {
  CUSTOM_SECTION_KEY_PREFIX,
  PROJECT_CONTEXT_SECTION_KEYS,
  PROJECT_CONTEXT_SECTION_LABELS,
  type ContextAuthor,
  type ProjectContextSectionKey,
  type ProjectContextUpdate,
} from "@/types/schemas/projectContext";

export type ProjectContext = {
  sections: {
    key: ProjectContextSectionKey;
    content: string;
    updatedAt: string;
    updatedBy: ContextAuthor;
  }[];
  /** Typed sections with nothing stored, so agents know what to fill. */
  missingSections: ProjectContextSectionKey[];
  customSections: {
    slug: string;
    title: string | null;
    content: string;
    updatedAt: string;
    updatedBy: ContextAuthor;
  }[];
};

export async function getProjectContext(
  projectId: string,
): Promise<ProjectContext> {
  const sectionRows = await ProjectContextRepository.listSections(projectId);

  const stored = new Map(sectionRows.map((row) => [row.key, row]));
  const sections = PROJECT_CONTEXT_SECTION_KEYS.flatMap((key) => {
    const row = stored.get(key);
    return row
      ? [
          {
            key,
            content: row.content,
            updatedAt: row.updatedAt,
            updatedBy: row.updatedBy,
          },
        ]
      : [];
  });

  return {
    sections,
    missingSections: PROJECT_CONTEXT_SECTION_KEYS.filter(
      (key) => !stored.has(key),
    ),
    customSections: sectionRows
      .filter((row) => row.key.startsWith(CUSTOM_SECTION_KEY_PREFIX))
      .map((row) => ({
        slug: row.key.slice(CUSTOM_SECTION_KEY_PREFIX.length),
        title: row.title,
        content: row.content,
        updatedAt: row.updatedAt,
        updatedBy: row.updatedBy,
      })),
  };
}

export async function applyContextUpdates(
  projectId: string,
  updates: ProjectContextUpdate[],
  updatedBy: ContextAuthor,
): Promise<ProjectContext> {
  const sectionRows = await ProjectContextRepository.listSections(projectId);

  const resolved = resolveContextUpdates(updates, {
    customKeys: new Set(
      sectionRows
        .map((row) => row.key)
        .filter((key) => key.startsWith(CUSTOM_SECTION_KEY_PREFIX)),
    ),
  });

  await runBatch((tx) =>
    resolved.map((op) => {
      switch (op.kind) {
        case "upsertSection":
          return ProjectContextRepository.upsertSection(tx, {
            projectId,
            key: op.key,
            title: op.title,
            content: op.content,
            updatedBy,
          });
        case "deleteSection":
          return ProjectContextRepository.deleteSection(tx, projectId, op.key);
      }
    }),
  );

  return getProjectContext(projectId);
}

function pushSection(lines: string[], heading: string, body: string[]) {
  lines.push(
    `## ${heading}`,
    "",
    ...(body.length > 0 ? body : ["_Empty_"]),
    "",
  );
}

export function renderProjectContextMarkdown(context: ProjectContext): string {
  const lines = ["# Project context", ""];

  for (const key of PROJECT_CONTEXT_SECTION_KEYS) {
    const section = context.sections.find((entry) => entry.key === key);
    pushSection(
      lines,
      PROJECT_CONTEXT_SECTION_LABELS[key],
      section ? [section.content] : [],
    );
  }

  for (const custom of context.customSections) {
    pushSection(lines, custom.title ?? custom.slug, [custom.content]);
  }

  lines.push(
    context.missingSections.length > 0
      ? `Missing sections: ${context.missingSections.join(", ")}`
      : "Missing sections: none",
  );

  return lines.join("\n");
}

export const ProjectContextService = {
  getProjectContext,
  applyContextUpdates,
  renderProjectContextMarkdown,
} as const;
