"use client";

import { useEffect } from "react";

import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { ApiResponse, User } from "@/types";

export function useAuthBootstrap() {
  const setUser = useAuthStore((state) => state.setUser);
  const setBootstrapping = useAuthStore((state) => state.setBootstrapping);

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      try {
        const response = await api.get<ApiResponse<{ user: User }>>("/auth/me");
        if (mounted) {
          setUser(response.data.data.user);
        }
      } catch {
        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setBootstrapping(false);
        }
      }
    }

    bootstrap();

    return () => {
      mounted = false;
    };
  }, [setBootstrapping, setUser]);
}
