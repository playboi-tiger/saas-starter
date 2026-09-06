import { queryOptions } from "@tanstack/react-query";
import { queryClient } from "@/client/tanstack-db";
import { getItems } from "@/serverFunctions/items";

export const itemsQueryOptions = (projectId: string) =>
  queryOptions({
    queryKey: ["items", projectId],
    queryFn: () => getItems({ data: { projectId } }),
  });

export function invalidateItems(projectId: string) {
  void queryClient.invalidateQueries({ queryKey: ["items", projectId] });
}
