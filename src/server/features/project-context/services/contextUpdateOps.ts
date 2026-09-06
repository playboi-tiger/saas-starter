import { AppError } from "@/server/lib/errors";
import {
  CUSTOM_SECTION_KEY_PREFIX,
  PROSE_MAX_CHARS,
  type ProjectContextUpdate,
} from "@/types/schemas/projectContext";

const MAX_CUSTOM_SECTIONS = 20;

function assertProseFits(content: string) {
  if (content.length > PROSE_MAX_CHARS) {
    throw new AppError(
      "VALIDATION_ERROR",
      `Sections are capped at ${PROSE_MAX_CHARS} characters. Summarize instead of pasting.`,
    );
  }
}

type ResolvedOp =
  | {
      kind: "upsertSection";
      key: string;
      title: string | null;
      content: string;
    }
  | { kind: "deleteSection"; key: string };

export function resolveContextUpdates(
  updates: ProjectContextUpdate[],
  current: {
    customKeys: Set<string>;
  },
): ResolvedOp[] {
  const { customKeys } = current;
  const resolved: ResolvedOp[] = [];

  const resolveOne = (update: ProjectContextUpdate) => {
    if ("section" in update) {
      const content = update.content.trim();
      assertProseFits(content);
      resolved.push(
        content === ""
          ? { kind: "deleteSection", key: update.section }
          : {
              kind: "upsertSection",
              key: update.section,
              title: null,
              content,
            },
      );
      return;
    }

    if ("customSection" in update) {
      const key = `${CUSTOM_SECTION_KEY_PREFIX}${update.customSection}`;
      const content = update.content.trim();
      assertProseFits(content);
      if (content === "") {
        resolved.push({ kind: "deleteSection", key });
        customKeys.delete(key);
        return;
      }
      if (!customKeys.has(key) && customKeys.size >= MAX_CUSTOM_SECTIONS) {
        throw new AppError(
          "VALIDATION_ERROR",
          `A project can hold ${MAX_CUSTOM_SECTIONS} custom sections. Delete one first.`,
        );
      }
      resolved.push({
        kind: "upsertSection",
        key,
        title: update.title ?? null,
        content,
      });
      customKeys.add(key);
      return;
    }

    if ("deleteCustomSection" in update) {
      const key = `${CUSTOM_SECTION_KEY_PREFIX}${update.deleteCustomSection}`;
      resolved.push({ kind: "deleteSection", key });
      customKeys.delete(key);
      return;
    }
  };

  updates.forEach((update, index) => {
    try {
      resolveOne(update);
    } catch (error) {
      throw error instanceof AppError
        ? new AppError(
            error.code,
            `updates[${index}] was rejected (nothing in this batch was applied): ${error.message}`,
          )
        : error;
    }
  });

  return resolved;
}
