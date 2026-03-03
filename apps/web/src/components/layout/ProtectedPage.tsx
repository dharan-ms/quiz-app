"use client";

import { ReactNode } from "react";

import { useRequireAuth } from "@/hooks/useRequireAuth";

import { Skeleton } from "../ui/Skeleton";

type ProtectedPageProps = {
  children: ReactNode;
  adminOnly?: boolean;
};

export function ProtectedPage({ children, adminOnly = false }: ProtectedPageProps) {
  const { user, isBootstrapping } = useRequireAuth({ adminOnly });

  if (isBootstrapping || !user || (adminOnly && user.role !== "ADMIN")) {
    return (
      <div className="mx-auto w-full max-w-4xl space-y-4 p-4">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return <>{children}</>;
}
