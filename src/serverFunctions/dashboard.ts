import { createServerFn } from "@tanstack/react-start";
import { DashboardService } from "@/server/features/dashboard/services/DashboardService";
import { requireProjectContext } from "@/serverFunctions/middleware";
import { z } from "zod";

export const getDashboardOverview = createServerFn({ method: "POST" })
  .middleware(requireProjectContext)
  .validator(z.object({ projectId: z.string() }))
  .handler(({ context }) =>
    DashboardService.getOverview({
      projectId: context.projectId,
    }),
  );
