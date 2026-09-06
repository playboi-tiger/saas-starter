import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { user, userOnboardingAnswers } from "@/db/schema";
import { db } from "@/db";
import { requireAuthenticatedContext } from "@/serverFunctions/middleware";

const onboardingAnswersSchema = z.object({
  interestedFeatures: z.array(z.string()).optional(),
  workFor: z.string().optional(),
  foundVia: z.string().optional(),
  mcpSetupIntent: z.enum(["yes", "no"]).optional(),
  completed: z.boolean().optional(),
});

export const getOnboardingAnswers = createServerFn({ method: "GET" })
  .middleware(requireAuthenticatedContext)
  .handler(async ({ context }) => {
    const answers = await db.query.userOnboardingAnswers.findFirst({
      columns: {
        completedAt: true,
        interestedFeatures: true,
        workFor: true,
        foundVia: true,
        mcpSetupIntent: true,
      },
      where: eq(userOnboardingAnswers.userId, context.userId),
    });
    const userRecord = await db.query.user.findFirst({
      columns: {
        createdAt: true,
      },
      where: eq(user.id, context.userId),
    });

    let interestedFeatures: string[] = [];
    if (answers?.interestedFeatures) {
      try {
        const parsed: unknown = JSON.parse(answers.interestedFeatures);
        if (Array.isArray(parsed)) {
          interestedFeatures = parsed.filter(
            (value): value is string => typeof value === "string",
          );
        }
      } catch {
        interestedFeatures = [];
      }
    }

    return {
      completedAt: answers?.completedAt ?? null,
      userCreatedAt: userRecord?.createdAt?.toISOString() ?? null,
      answers: {
        interestedFeatures,
        workFor: answers?.workFor ?? null,
        foundVia: answers?.foundVia ?? null,
        mcpSetupIntent: answers?.mcpSetupIntent ?? null,
      },
    };
  });

export const saveOnboardingAnswers = createServerFn({ method: "POST" })
  .middleware(requireAuthenticatedContext)
  .validator(onboardingAnswersSchema)
  .handler(async ({ data, context }) => {
    const now = new Date().toISOString();
    const completedAt = data.completed ? now : undefined;
    const set = {
      ...(data.interestedFeatures
        ? { interestedFeatures: JSON.stringify(data.interestedFeatures) }
        : {}),
      ...(data.workFor !== undefined ? { workFor: data.workFor } : {}),
      ...(data.foundVia !== undefined ? { foundVia: data.foundVia } : {}),
      ...(data.mcpSetupIntent !== undefined
        ? { mcpSetupIntent: data.mcpSetupIntent }
        : {}),
      ...(completedAt !== undefined ? { completedAt } : {}),
      updatedAt: now,
    };

    await db
      .insert(userOnboardingAnswers)
      .values({
        userId: context.userId,
        organizationId: context.organizationId,
        interestedFeatures: JSON.stringify(data.interestedFeatures ?? []),
        workFor: data.workFor,
        foundVia: data.foundVia,
        mcpSetupIntent: data.mcpSetupIntent,
        completedAt,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: userOnboardingAnswers.userId,
        set,
      });

    return { ok: true };
  });
