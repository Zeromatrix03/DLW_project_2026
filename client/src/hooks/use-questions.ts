import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type AnswerSubmitInput } from "@shared/routes";

const DEMO_USER_ID = 1;

export function useQuestions(topic?: string, type?: string) {
  return useQuery({
    queryKey: [api.questions.list.path, { topic, type }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (topic) params.append("topic", topic);
      if (type) params.append("type", type);
      
      const url = `${api.questions.list.path}${params.toString() ? `?${params.toString()}` : ''}`;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch questions");
      return api.questions.list.responses[200].parse(await res.json());
    },
  });
}

export function useSubmitAnswer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ questionId, answer }: { questionId: number, answer: string }) => {
      const payload: AnswerSubmitInput = { userId: DEMO_USER_ID, answer };
      const validated = api.questions.answer.input.parse(payload);
      const url = buildUrl(api.questions.answer.path, { id: questionId });
      
      const res = await fetch(url, {
        method: api.questions.answer.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to submit answer");
      return api.questions.answer.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      // Invalidate user to update points/streaks
      queryClient.invalidateQueries({ queryKey: [api.users.get.path, DEMO_USER_ID] });
    },
  });
}
