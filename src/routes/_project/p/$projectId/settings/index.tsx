import { createFileRoute } from "@tanstack/react-router";
import { ProjectGeneralSettings } from "@/client/features/projects/ProjectGeneralSettings";

export const Route = createFileRoute("/_project/p/$projectId/settings/")({
  component: ProjectGeneralSettingsRoute,
});

function ProjectGeneralSettingsRoute() {
  const { projectId } = Route.useParams();
  return <ProjectGeneralSettings projectId={projectId} />;
}
