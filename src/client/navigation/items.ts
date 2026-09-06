import {
  Bot,
  Brain,
  Layers,
  LayoutDashboard,
  Settings,
} from "lucide-react";
import { linkOptions } from "@tanstack/react-router";

const projectNavItems = [
  {
    to: "/p/$projectId" as const,
    label: "Dashboard",
    icon: LayoutDashboard,
    activeOptions: { exact: true, includeSearch: false },
  },
  {
    to: "/p/$projectId/items" as const,
    label: "Items",
    icon: Layers,
  },
  {
    to: "/p/$projectId/sam" as const,
    label: "AI Assistant",
    icon: Bot,
  },
  {
    to: "/p/$projectId/settings" as const,
    label: "Settings",
    icon: Settings,
  },
  {
    to: "/p/$projectId/settings/context" as const,
    label: "Project Context",
    icon: Brain,
  },
] as const;

const aiNavItem = linkOptions({
  to: "/ai" as const,
  label: "AI & MCP",
  icon: Bot,
});

// Always-visible sidebar group (not project-scoped, unlike the groups below).
export const connectNavGroup = {
  label: "Connect",
  items: [aiNavItem],
};

function getProjectNavItems(projectId: string) {
  return linkOptions(
    projectNavItems.map((item) => ({
      ...item,
      params: { projectId },
      search: {},
    })),
  );
}

export function getProjectNavGroups(projectId: string) {
  const all = getProjectNavItems(projectId);
  const byPath = (path: (typeof projectNavItems)[number]["to"]) =>
    all.find((i) => i.to === path)!;

  return [
    {
      label: "Main",
      items: [
        byPath("/p/$projectId"),
        byPath("/p/$projectId/items"),
        byPath("/p/$projectId/sam"),
      ],
    },
    {
      label: "Configuration",
      items: [
        byPath("/p/$projectId/settings"),
        byPath("/p/$projectId/settings/context"),
      ],
    },
  ];
}

