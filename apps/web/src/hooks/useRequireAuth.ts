"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuthStore } from "@/store/auth-store";

type UseRequireAuthOptions = {
  adminOnly?: boolean;
};

export function useRequireAuth(options: UseRequireAuthOptions = {}) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isBootstrapping = useAuthStore((state) => state.isBootstrapping);

  useEffect(() => {
    if (isBootstrapping) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (options.adminOnly && user.role !== "ADMIN") {
      router.replace("/quizzes");
    }
  }, [isBootstrapping, options.adminOnly, router, user]);

  return { user, isBootstrapping };
}
