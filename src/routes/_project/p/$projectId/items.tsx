import { createFileRoute } from "@tanstack/react-router";
import { ItemsPage } from "@/client/features/items/ItemsPage";

export const Route = createFileRoute("/_project/p/$projectId/items")({
  component: ItemsRoute,
});

function ItemsRoute() {
  const { projectId } = Route.useParams();
  return <ItemsPage projectId={projectId} />;
}
