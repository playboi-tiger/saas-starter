import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Plus, Trash2, Layers, Loader2 } from "lucide-react";
import { createItem, deleteItem, updateItem } from "@/serverFunctions/items";
import { invalidateItems, itemsQueryOptions } from "./itemsQueries";
import { itemStatusSchema, type ItemStatus } from "@/types/schemas/items";

function parseItemStatus(val: string): ItemStatus {
  const parsed = itemStatusSchema.safeParse(val);
  return parsed.success ? parsed.data : "draft";
}

function StatusBadge({ status }: { status: ItemStatus }) {
  switch (status) {
    case "active":
      return <span className="badge badge-success badge-sm font-medium">Active</span>;
    case "draft":
      return <span className="badge badge-warning badge-sm font-medium">Draft</span>;
    case "archived":
      return <span className="badge badge-neutral badge-sm font-medium">Archived</span>;
  }
}

export function ItemsPage({ projectId }: { projectId: string }) {
  const { data: items = [], isLoading } = useQuery(itemsQueryOptions(projectId));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<ItemStatus>("active");
  const [search, setSearch] = useState("");

  const createMutation = useMutation({
    mutationFn: () =>
      createItem({
        data: {
          projectId,
          name,
          description: description || undefined,
          status,
        },
      }),
    onSuccess: () => {
      invalidateItems(projectId);
      setIsModalOpen(false);
      setName("");
      setDescription("");
      setStatus("active");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteItem({ data: { id, projectId } }),
    onSuccess: () => invalidateItems(projectId),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, nextStatus }: { id: string; nextStatus: ItemStatus }) =>
      updateItem({ data: { id, projectId, status: nextStatus } }),
    onSuccess: () => invalidateItems(projectId),
  });

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Items</h1>
          <p className="text-sm text-base-content/70">
            Canonical CRUD sample entity demonstrating TanStack Query, Forms, and SQLite/Postgres parity.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary btn-sm gap-2"
        >
          <Plus className="size-4" />
          Create item
        </button>
      </div>

      <div className="flex items-center justify-between gap-4">
        <input
          type="text"
          placeholder="Filter items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input input-bordered input-sm w-full max-w-xs"
        />
        <div className="text-xs text-base-content/60">
          Showing {filteredItems.length} of {items.length} item(s)
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-12 text-base-content/60">
          <Loader2 className="size-6 animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="card bg-base-100 border border-base-300 p-12 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="rounded-full bg-base-200 p-3">
              <Layers className="size-6 text-base-content/60" />
            </div>
            <h3 className="font-semibold text-lg">No items yet</h3>
            <p className="text-sm text-base-content/60 max-w-sm">
              Create your first item here, or ask the AI assistant or MCP tool to create items for you.
            </p>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="btn btn-primary btn-sm mt-2"
            >
              <Plus className="size-4" />
              Add item
            </button>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-box border border-base-300 bg-base-100">
          <table className="table">
            <thead>
              <tr className="bg-base-200/50">
                <th>Name</th>
                <th>Description</th>
                <th>Status</th>
                <th>Created</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-base-200/30">
                  <td className="font-medium">{item.name}</td>
                  <td className="text-sm text-base-content/70 max-w-xs truncate">
                    {item.description ?? "—"}
                  </td>
                  <td>
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="text-xs text-base-content/60">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <select
                        aria-label="Change status"
                        value={item.status}
                        onChange={(e) =>
                          statusMutation.mutate({
                            id: item.id,
                            nextStatus: parseItemStatus(e.target.value),
                          })
                        }
                        className="select select-bordered select-xs"
                      >
                        <option value="active">Active</option>
                        <option value="draft">Draft</option>
                        <option value="archived">Archived</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm("Delete this item?")) {
                            deleteMutation.mutate(item.id);
                          }
                        }}
                        className="btn btn-ghost btn-xs text-error"
                        title="Delete item"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box max-w-md">
            <h3 className="font-bold text-lg mb-4">Create New Item</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (name.trim()) createMutation.mutate();
              }}
              className="space-y-4"
            >
              <div>
                <label className="label text-xs font-medium" htmlFor="item-name">
                  Name
                </label>
                <input
                  id="item-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Item name"
                  className="input input-bordered w-full input-sm"
                  autoFocus
                />
              </div>

              <div>
                <label className="label text-xs font-medium" htmlFor="item-desc">
                  Description
                </label>
                <textarea
                  id="item-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional description"
                  className="textarea textarea-bordered w-full text-sm"
                  rows={3}
                />
              </div>

              <div>
                <label className="label text-xs font-medium" htmlFor="item-status">
                  Status
                </label>
                <select
                  id="item-status"
                  value={status}
                  onChange={(e) => setStatus(parseItemStatus(e.target.value))}
                  className="select select-bordered w-full select-sm"
                >
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div className="modal-action mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-ghost btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || !name.trim()}
                  className="btn btn-primary btn-sm"
                >
                  {createMutation.isPending ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
          <div className="modal-backdrop" onClick={() => setIsModalOpen(false)} />
        </div>
      )}
    </div>
  );
}
