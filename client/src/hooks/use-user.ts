import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type UserUpdateInput } from "@shared/routes";

// Hardcoded user ID for demonstration since auth is not defined
const DEMO_USER_ID = 1;

export function useUser() {
  return useQuery({
    queryKey: [api.users.get.path, DEMO_USER_ID],
    queryFn: async () => {
      const url = buildUrl(api.users.get.path, { id: DEMO_USER_ID });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch user");
      return api.users.get.responses[200].parse(await res.json());
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (updates: UserUpdateInput) => {
      const validated = api.users.update.input.parse(updates);
      const url = buildUrl(api.users.update.path, { id: DEMO_USER_ID });
      const res = await fetch(url, {
        method: api.users.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update user");
      return api.users.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.users.get.path, DEMO_USER_ID] });
    },
  });
}
