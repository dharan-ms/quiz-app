"use client";

import axios from "axios";

import { API_BASE_URL } from "./constants";

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

type ApiErrorShape = {
  response?: {
    data?: {
      message?: string;
    };
  };
};

export function getApiErrorMessage(error: unknown, fallback = "Something went wrong") {
  const typed = error as ApiErrorShape;
  return typed.response?.data?.message ?? fallback;
}
