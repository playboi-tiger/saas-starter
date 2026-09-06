import { beforeEach, describe, expect, it, vi } from "vitest";
import { createProjectTool } from "./create-project";
import { makeToolContext } from "./tool-test-support";

const mocks = vi.hoisted(() => ({
  createProject: vi.fn(),
  listMembershipsForUser: vi.fn(),
}));

vi.mock("@/server/features/projects/services/ProjectService", () => ({
  ProjectService: {
    createProject: mocks.createProject,
  },
}));

vi.mock("@/server/auth/repositories/AuthRepository", () => ({
  AuthRepository: {
    listMembershipsForUser: mocks.listMembershipsForUser,
  },
}));

const toolContext = makeToolContext();

describe("create_project MCP tool", () => {
  beforeEach(() => {
    mocks.createProject.mockReset();
    mocks.listMembershipsForUser.mockReset();
  });

  it("creates a project scoped to the caller's organization and returns it", async () => {
    mocks.createProject.mockResolvedValue({
      id: "project_new",
      name: "Acme",
      domain: "acme.com",
      description: "Sample project",
    });

    const result = await createProjectTool.handler(
      { name: "Acme", domain: "acme.com", description: "Sample project" },
      toolContext,
    );

    expect(mocks.createProject).toHaveBeenCalledWith("org_123", {
      name: "Acme",
      domain: "acme.com",
      description: "Sample project",
    });
    expect(result.structuredContent?.project).toMatchObject({
      id: "project_new",
      name: "Acme",
      domain: "acme.com",
      description: "Sample project",
    });
  });

  it("creates a minimal project with only a name", async () => {
    mocks.createProject.mockResolvedValue({
      id: "project_min",
      name: "Just a name",
      domain: null,
      description: null,
    });

    await createProjectTool.handler({ name: "Just a name" }, toolContext);

    expect(mocks.createProject).toHaveBeenCalledWith("org_123", {
      name: "Just a name",
    });
  });

  it("rejects a foreign organizationId on a pinned connection", async () => {
    await expect(
      createProjectTool.handler(
        { name: "Acme", organizationId: "org_other" },
        toolContext,
      ),
    ).rejects.toThrow("bound to a single organization");
    expect(mocks.createProject).not.toHaveBeenCalled();
  });

  it("rejects a member role from creating projects", async () => {
    const memberContext = makeToolContext({ role: "member" });

    await expect(
      createProjectTool.handler({ name: "Acme" }, memberContext),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(mocks.createProject).not.toHaveBeenCalled();
  });
});

describe("create_project with a user-scoped credential", () => {
  const userScopedContext = makeToolContext({ orgScope: "user" });
  const memberships = [
    { organizationId: "org_a", organizationName: "Alpha", role: "owner" },
    { organizationId: "org_b", organizationName: "Beta", role: "admin" },
  ];

  beforeEach(() => {
    mocks.createProject.mockResolvedValue({
      id: "project_new",
      name: "Acme",
      domain: null,
      description: null,
    });
    mocks.listMembershipsForUser.mockResolvedValue(memberships);
  });

  it("errors with the organization list when no organizationId is given and the user has several", async () => {
    await expect(
      createProjectTool.handler({ name: "Acme" }, userScopedContext),
    ).rejects.toThrow(/org_a {2}Alpha[\s\S]*org_b {2}Beta/);
    expect(mocks.createProject).not.toHaveBeenCalled();
  });

  it("creates in the named organization when the user is a member of it", async () => {
    await createProjectTool.handler(
      { name: "Acme", organizationId: "org_b" },
      userScopedContext,
    );

    expect(mocks.createProject).toHaveBeenCalledWith("org_b", {
      name: "Acme",
    });
  });

  it("rejects a organizationId the user is not a member of", async () => {
    await expect(
      createProjectTool.handler(
        { name: "Acme", organizationId: "org_stranger" },
        userScopedContext,
      ),
    ).rejects.toThrow("not a member");
    expect(mocks.createProject).not.toHaveBeenCalled();
  });

  it("resolves implicitly when the user belongs to exactly one organization", async () => {
    mocks.listMembershipsForUser.mockResolvedValue([memberships[0]]);

    await createProjectTool.handler({ name: "Acme" }, userScopedContext);

    expect(mocks.createProject).toHaveBeenCalledWith("org_a", {
      name: "Acme",
    });
  });
});
