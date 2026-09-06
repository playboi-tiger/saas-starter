import { ItemRepository, type ItemRow } from "@/server/features/items/repositories/ItemRepository";
import { ProjectContextRepository } from "@/server/features/project-context/repositories/ProjectContextRepository";
import { PROJECT_CONTEXT_SECTION_KEYS } from "@/types/schemas/projectContext";

export type DashboardOverview = {
  itemsCount: {
    total: number;
    active: number;
    draft: number;
    archived: number;
  };
  contextCount: {
    filled: number;
    total: number;
  };
};

async function getOverview(params: { projectId: string }): Promise<DashboardOverview> {
  const [items, sections] = await Promise.all([
    ItemRepository.listItems(params.projectId),
    ProjectContextRepository.listSections(params.projectId),
  ]);

  const active = items.filter((i: ItemRow) => i.status === "active").length;
  const draft = items.filter((i: ItemRow) => i.status === "draft").length;
  const archived = items.filter((i: ItemRow) => i.status === "archived").length;

  const filledSections = sections.filter((s) => !s.key.startsWith("custom:")).length;

  return {
    itemsCount: {
      total: items.length,
      active,
      draft,
      archived,
    },
    contextCount: {
      filled: filledSections,
      total: PROJECT_CONTEXT_SECTION_KEYS.length,
    },
  };
}

export const DashboardService = {
  getOverview,
} as const;
