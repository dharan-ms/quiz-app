"use client";

import { create } from "zustand";

import { User } from "@/types";

type AuthState = {
  user: User | null;
  isBootstrapping: boolean;
  setUser: (user: User | null) => void;
  setBootstrapping: (value: boolean) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isBootstrapping: true,
  setUser: (user) => set({ user }),
  setBootstrapping: (value) => set({ isBootstrapping: value }),
}));
