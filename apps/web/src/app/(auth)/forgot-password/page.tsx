"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { api, getApiErrorMessage } from "@/lib/api";
import { ApiResponse } from "@/types";

const schema = z.object({
  email: z.string().email(),
});

type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setServerMessage(null);
    setServerError(null);
    try {
      const response = await api.post<ApiResponse<{ resetToken?: string }>>("/auth/forgot-password", values);
      const token = response.data.data?.resetToken;
      setServerMessage(
        token
          ? `Reset token generated for demo/testing: ${token}`
          : "If your account exists, a reset link has been generated.",
      );
    } catch (error) {
      setServerError(getApiErrorMessage(error, "Could not process request"));
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <Card>
        <h1 className="mb-1 text-2xl font-bold text-slate-900">Forgot password</h1>
        <p className="mb-5 text-sm text-slate-600">Enter your email and we will generate a reset token.</p>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <Input label="Email" type="email" error={errors.email?.message} {...register("email")} />

          {serverMessage ? <p className="text-sm text-emerald-700">{serverMessage}</p> : null}
          {serverError ? <p className="text-sm text-rose-600">{serverError}</p> : null}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Generate Reset Token"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
