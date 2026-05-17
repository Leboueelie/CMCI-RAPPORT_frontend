import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api";

export function useChangePassword() {
  return useMutation({
    mutationFn: async (data: { oldPassword: string; newPassword: string }) => {
      const res = await api.post("/auth/change-password", data);
      return res.data;
    },
  });
}
