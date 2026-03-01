import { useMutation } from "@tanstack/react-query";
import { api, type AICheckinInput } from "@shared/routes";

const DEMO_USER_ID = 1;

export function useAiCheckin() {
  return useMutation({
    mutationFn: async (userStatus: string) => {
      const payload: AICheckinInput = { userId: DEMO_USER_ID, userStatus };
      const validated = api.ai.checkin.input.parse(payload);
      
      const res = await fetch(api.ai.checkin.path, {
        method: api.ai.checkin.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      
      if (!res.ok) throw new Error("AI Check-in failed");
      return api.ai.checkin.responses[200].parse(await res.json());
    },
  });
}
