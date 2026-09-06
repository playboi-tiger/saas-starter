import { beforeEach, describe, expect, it, vi } from "vitest";
import { createItemTool, listItemsTool } from "./items";
import { makeToolContext, textContent } from "./tool-test-support";

vi.mock("cloudflare:workers", () => ({ env: {} }));

const mocks = vi.hoisted(() => ({
  getProjectForOrganization: vi.fn(),
  listItems: vi.fn(),
  createItem: vi.fn(),
}));

vi.mock("@/server/features/projects/services/ProjectService", () => ({
  ProjectService: {
    getProjectForOrganization: mocks.getProjectForOrganization,
  },
}));

vi.mock("@/server/features/items/services/ItemService", () => ({
  ItemService: {
    listItems: mocks.listItems,
    createItem: mocks.createItem,
  },
}));

const toolContext = makeToolContext();

describe("items MCP tools", () => {
  beforeEach(() => {
    mocks.getProjectForOrganization.mockResolvedValue({ id: "proj_1" });
    mocks.listItems.mockReset();
    mocks.createItem.mockReset();
  });

  it("lists items for a project", async () => {
    mocks.listItems.mockResolvedValue([
      { id: "item_1", projectId: "proj_1", name: "First item", status: "active" },
    ]);

    const result = await listItemsTool.handler({ projectId: "proj_1" }, toolContext);

    expect(mocks.listItems).toHaveBeenCalledWith("proj_1");
    expect(textContent(result)).toContain("First item");
  });

  it("creates a new item in a project", async () => {
    mocks.createItem.mockResolvedValue({
      id: "item_2",
      projectId: "proj_1",
      name: "New task",
      description: "Do something",
      status: "draft",
    });

    const result = await createItemTool.handler(
      {
        projectId: "proj_1",
        name: "New task",
        description: "Do something",
        status: "draft",
      },
      toolContext,
    );

    expect(mocks.createItem).toHaveBeenCalledWith({
      projectId: "proj_1",
      name: "New task",
      description: "Do something",
      status: "draft",
    });
    expect(textContent(result)).toContain('Created item "New task"');
  });
});
