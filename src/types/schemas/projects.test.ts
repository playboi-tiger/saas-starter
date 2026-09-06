import { describe, expect, it } from "vitest";
import { createProjectSchema, updateProjectSchema } from "./projects";

describe("project schemas", () => {
  it("validates valid project inputs", () => {
    expect(
      createProjectSchema.safeParse({
        name: "Acme",
        domain: "acme.com",
        description: "A great project",
      }).success,
    ).toBe(true);

    expect(
      updateProjectSchema.safeParse({
        projectId: "p_1",
        name: "Acme Updated",
        domain: "acme.com",
      }).success,
    ).toBe(true);
  });

  it("rejects empty name", () => {
    expect(createProjectSchema.safeParse({ name: "   " }).success).toBe(false);
  });

  it("accepts a project with only name", () => {
    expect(createProjectSchema.safeParse({ name: "Acme" }).success).toBe(true);
  });
});
