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
    mutationFn: async ({ questionId, answer, userId }: { questionId: number, answer: string, userId: number }) => {
      // Use the userId passed from the component (Adrian, this fixes the mismatch)
      const payload: AnswerSubmitInput = { userId: userId || DEMO_USER_ID, answer };
      
      const validated = api.questions.answer.input.parse(payload);
      const url = buildUrl(api.questions.answer.path, { id: questionId });
      
      const res = await fetch(url, {
        method: api.questions.answer.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to submit answer");
      }
      
      const data = await res.json();
console.log("Raw Server Data:", data); // This will show up in F12 console
return data;
    },
    onSuccess: (_, variables) => {
      // Refreshes the user data so the UI shows the new points immediately
      queryClient.invalidateQueries({ queryKey: [api.users.get.path, variables.userId] });
    },
  });
}