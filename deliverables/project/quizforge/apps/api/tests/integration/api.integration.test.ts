import bcrypt from "bcryptjs";
import request from "supertest";

import { ApiError } from "../../src/utils/apiError";

const mockFinalizeAttempt = jest.fn();

jest.mock("../../src/services/attempt.service", () => ({
  finalizeAttempt: (...args: unknown[]) => mockFinalizeAttempt(...args),
  isAttemptExpired: jest.fn(() => false),
  logAudit: jest.fn(),
}));

jest.mock("../../src/config/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      upsert: jest.fn(),
    },
    passwordResetToken: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

import { app } from "../../src/app";
import { prisma } from "../../src/config/prisma";

const mockedPrisma = prisma as unknown as {
  user: {
    findUnique: jest.Mock;
  };
};

describe("API integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 401 on login invalid password", async () => {
    const hashed = await bcrypt.hash("ValidPass1", 10);
    mockedPrisma.user.findUnique.mockResolvedValue({
      id: "user-1",
      email: "user@example.com",
      passwordHash: hashed,
      name: "User One",
      role: "USER",
      isActive: true,
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });

    const response = await request(app).post("/api/v1/auth/login").send({
      email: "user@example.com",
      password: "WrongPass1",
    });

    expect(response.status).toBe(401);
  });

  it("returns 401 when starting quiz without auth", async () => {
    const response = await request(app).post("/api/v1/quizzes/quiz-1/start").send({});
    expect(response.status).toBe(401);
  });

  it("prevents double submission for attempt", async () => {
    const hashed = await bcrypt.hash("ValidPass1", 10);
    mockedPrisma.user.findUnique.mockResolvedValue({
      id: "user-1",
      email: "user@example.com",
      passwordHash: hashed,
      name: "User One",
      role: "USER",
      isActive: true,
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });

    mockFinalizeAttempt.mockRejectedValue(new ApiError(409, "Attempt already submitted"));

    const agent = request.agent(app);
    await agent.post("/api/v1/auth/login").send({
      email: "user@example.com",
      password: "ValidPass1",
    });

    const response = await agent.post("/api/v1/attempts/attempt-1/submit").send({});
    expect(response.status).toBe(409);
  });

  it("denies admin route for normal user", async () => {
    const hashed = await bcrypt.hash("ValidPass1", 10);
    mockedPrisma.user.findUnique.mockResolvedValue({
      id: "user-1",
      email: "user@example.com",
      passwordHash: hashed,
      name: "User One",
      role: "USER",
      isActive: true,
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });

    const agent = request.agent(app);
    await agent.post("/api/v1/auth/login").send({
      email: "user@example.com",
      password: "ValidPass1",
    });

    const response = await agent.post("/api/v1/admin/quizzes").send({
      title: "Unauthorized quiz",
      description: "Should not be allowed",
      difficulty: "EASY",
      durationSeconds: 600,
    });

    expect(response.status).toBe(403);
  });
});
