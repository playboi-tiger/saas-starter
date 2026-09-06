import { z } from "zod";

export const projectIdSchema = z
  .string()
  .min(1)
  .describe(
    "Required. The project ID to scope this call to. Get one from list_projects.",
  );

