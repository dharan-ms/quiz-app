"use client";

import { ReactNode } from "react";

import { useAuthBootstrap } from "@/hooks/useAuthBootstrap";

type AuthBootstrapProps = {
  children: ReactNode;
};

export function AuthBootstrap({ children }: AuthBootstrapProps) {
  useAuthBootstrap();
  return <>{children}</>;
}
