import { Request, Response } from "express";

import { prisma } from "../config/prisma";
import { asyncHandler } from "../middleware/asyncHandler";
import { ApiError } from "../utils/apiError";
import { comparePassword, hashPassword } from "../utils/password";
import { successResponse } from "../utils/response";
import { generateRandomToken, hashToken } from "../utils/token";

function publicUser(user: {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: Date;
}) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt,
  };
}

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body as {
    name: string;
    email: string;
    password: string;
  };

  const normalizedEmail = email.toLowerCase().trim();

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    throw new ApiError(409, "Email already registered");
  }

  const user = await prisma.user.create({
    data: {
      name: name.trim(),
      email: normalizedEmail,
      passwordHash: await hashPassword(password),
    },
  });

  req.session.userId = user.id;
  req.session.role = user.role;

  res.status(201).json(successResponse("Registered successfully", { user: publicUser(user) }));
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as {
    email: string;
    password: string;
  };

  const normalizedEmail = email.toLowerCase().trim();
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

  if (!user || !user.isActive || user.deletedAt) {
    throw new ApiError(401, "Invalid credentials");
  }

  const isPasswordValid = await comparePassword(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials");
  }

  req.session.userId = user.id;
  req.session.role = user.role;

  res.json(successResponse("Logged in successfully", { user: publicUser(user) }));
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  await new Promise<void>((resolve, reject) => {
    req.session.destroy((error) => {
      if (error) reject(error);
      else resolve();
    });
  });

  res.clearCookie("qid");
  res.json(successResponse("Logged out successfully"));
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  if (!req.session.userId) {
    throw new ApiError(401, "Unauthorized");
  }

  const user = await prisma.user.findUnique({ where: { id: req.session.userId } });
  if (!user || user.deletedAt) {
    throw new ApiError(401, "Unauthorized");
  }

  res.json(successResponse("Current user fetched", { user: publicUser(user) }));
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body as { email: string };
  const normalizedEmail = email.toLowerCase().trim();

  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (!user) {
    res.json(
      successResponse(
        "If the email exists, a reset link has been generated. Check your inbox integration.",
      ),
    );
    return;
  }

  const resetToken = generateRandomToken();
  const tokenHash = hashToken(resetToken);
  const expiresAt = new Date(Date.now() + 1000 * 60 * 30);

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt,
    },
  });

  res.json(
    successResponse("Password reset token generated", {
      // In production, send token by email provider and do not return it.
      resetToken,
      expiresAt,
    }),
  );
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, password } = req.body as {
    token: string;
    password: string;
  };

  const tokenHash = hashToken(token);
  const resetRecord = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
  });

  if (!resetRecord || resetRecord.usedAt || resetRecord.expiresAt < new Date()) {
    throw new ApiError(400, "Invalid or expired reset token");
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetRecord.userId },
      data: { passwordHash: await hashPassword(password) },
    }),
    prisma.passwordResetToken.update({
      where: { id: resetRecord.id },
      data: { usedAt: new Date() },
    }),
  ]);

  res.json(successResponse("Password reset successful"));
});
