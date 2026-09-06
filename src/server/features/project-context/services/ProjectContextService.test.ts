import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  applyContextUpdates,
  getProjectContext,
  renderProjectContextMarkdown,
} from "./ProjectContextService";

const mocks = vi.hoisted(() => ({
  listSections: vi.fn(),
  upsertSection: vi.fn(),
  deleteSection: vi.fn(),
}));

vi.mock(
  "@/server/features/project-context/repositories/ProjectContextRepository",
  () => ({ ProjectContextRepository: mocks }),
);

const runBatch = vi.hoisted(() =>
  vi.fn(async (build: (tx: unknown) => readonly Promise<unknown>[]) => {
    for (const statement of build({})) await statement;
  }),
);

vi.mock("@/db/runBatch", () => ({ runBatch }));

const section = (
  key: string,
  content: string,
  title: string | null = null,
) => ({
  key,
  title,
  content,
  updatedAt: "2026-08-15T10:00:00.000Z",
  updatedBy: "user" as const,
});

describe("project context service", () => {
  beforeEach(() => {
    mocks.listSections.mockResolvedValue([]);
  });

  it("splits typed from custom sections and reports the empty typed ones", async () => {
    mocks.listSections.mockResolvedValue([
      section("business_overview", "We sell paint."),
      section("custom:launch", "Launch date in Q4", "Launch plan"),
    ]);

    const context = await getProjectContext("proj_1");
    expect(context.sections).toEqual([
      {
        key: "business_overview",
        content: "We sell paint.",
        updatedAt: "2026-08-15T10:00:00.000Z",
        updatedBy: "user",
      },
    ]);
    expect(context.missingSections).toEqual([
      "current_goal",
      "positioning",
      "writing_preferences",
    ]);
    expect(context.customSections).toEqual([
      {
        slug: "launch",
        title: "Launch plan",
        content: "Launch date in Q4",
        updatedAt: "2026-08-15T10:00:00.000Z",
        updatedBy: "user",
      },
    ]);
  });

  it("applies updates atomically and converts empty string to delete", async () => {
    mocks.listSections.mockResolvedValue([]);
    await applyContextUpdates(
      "proj_1",
      [
        { section: "business_overview", content: "Updated overview" },
        { section: "current_goal", content: "   " },
      ],
      "user",
    );

    expect(mocks.upsertSection).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        projectId: "proj_1",
        key: "business_overview",
        content: "Updated overview",
      }),
    );
    expect(mocks.deleteSection).toHaveBeenCalledWith(
      expect.anything(),
      "proj_1",
      "current_goal",
    );
    expect(mocks.upsertSection).toHaveBeenCalledOnce();
  });

  it("rejects an update batch if any section exceeds the character cap", async () => {
    await expect(
      applyContextUpdates(
        "proj_1",
        [{ section: "business_overview", content: "x".repeat(4001) }],
        "user",
      ),
    ).rejects.toThrow("capped at 4000");
    expect(runBatch).not.toHaveBeenCalled();
  });

  it("renders markdown representation cleanly", async () => {
    const markdown = renderProjectContextMarkdown({
      sections: [
        {
          key: "business_overview",
          content: "We sell widgets.",
          updatedAt: "2026-08-15T10:00:00.000Z",
          updatedBy: "user",
        },
      ],
      missingSections: ["current_goal"],
      customSections: [
        {
          slug: "notes",
          title: "General notes",
          content: "Keep it simple",
          updatedAt: "2026-08-15T10:00:00.000Z",
          updatedBy: "user",
        },
      ],
    });

    expect(markdown).toContain("# Project context");
    expect(markdown).toContain("## Business overview\n\nWe sell widgets.");
    expect(markdown).toContain("## General notes\n\nKeep it simple");
    expect(markdown).toContain("Missing sections: current_goal");
  });
});
