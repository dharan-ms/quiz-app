import "dotenv/config";

import bcrypt from "bcryptjs";
import { PrismaClient, Difficulty, QuestionType, Role } from "@prisma/client";

const prisma = new PrismaClient();

const adminEmail = "admin@quizapp.com";
const adminPassword = "Admin@12345";
const userEmail = "user@quizapp.com";
const userPassword = "User@12345";

async function main() {
  const hashedAdmin = await bcrypt.hash(adminPassword, 12);
  const hashedUser = await bcrypt.hash(userPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash: hashedAdmin,
      name: "System Admin",
      role: Role.ADMIN,
      emailVerified: true,
    },
  });

  await prisma.user.upsert({
    where: { email: userEmail },
    update: {},
    create: {
      email: userEmail,
      passwordHash: hashedUser,
      name: "Sample User",
      role: Role.USER,
      emailVerified: true,
    },
  });

  const categories = await Promise.all(
    [
      { name: "JavaScript", slug: "javascript" },
      { name: "Computer Science", slug: "computer-science" },
      { name: "General Knowledge", slug: "general-knowledge" },
    ].map((category) =>
      prisma.category.upsert({
        where: { slug: category.slug },
        update: { name: category.name },
        create: category,
      }),
    ),
  );

  const quiz = await prisma.quiz.upsert({
    where: { id: "sample-quiz-001" },
    update: {
      title: "Full-Stack Fundamentals Assessment",
      description: "Covers frontend, backend, and deployment basics.",
      difficulty: Difficulty.MEDIUM,
      durationSeconds: 900,
      published: true,
      totalMarks: 30,
      createdById: admin.id,
      availableFrom: new Date(Date.now() - 1000 * 60 * 60),
      availableTo: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
      shuffleQuestions: true,
      shuffleOptions: true,
    },
    create: {
      id: "sample-quiz-001",
      title: "Full-Stack Fundamentals Assessment",
      description: "Covers frontend, backend, and deployment basics.",
      instructions:
        "One attempt at a time. Whole quiz timer is enabled. Review answers after submission.",
      difficulty: Difficulty.MEDIUM,
      durationSeconds: 900,
      published: true,
      totalMarks: 30,
      createdById: admin.id,
      availableFrom: new Date(Date.now() - 1000 * 60 * 60),
      availableTo: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
      shuffleQuestions: true,
      shuffleOptions: true,
    },
  });

  await prisma.quizCategory.deleteMany({ where: { quizId: quiz.id } });
  await prisma.quizCategory.createMany({
    data: [
      { quizId: quiz.id, categoryId: categories[0].id },
      { quizId: quiz.id, categoryId: categories[1].id },
    ],
    skipDuplicates: true,
  });

  await prisma.choice.deleteMany({
    where: {
      question: {
        quizId: quiz.id,
      },
    },
  });
  await prisma.question.deleteMany({ where: { quizId: quiz.id } });

  const q1 = await prisma.question.create({
    data: {
      quizId: quiz.id,
      type: QuestionType.MCQ,
      text: "Which HTTP method is idempotent?",
      explanation: "GET requests are idempotent and safe for retrieval.",
      points: 10,
      order: 1,
    },
  });

  await prisma.choice.createMany({
    data: [
      { questionId: q1.id, text: "POST", isCorrect: false, order: 1 },
      { questionId: q1.id, text: "PATCH", isCorrect: false, order: 2 },
      { questionId: q1.id, text: "GET", isCorrect: true, order: 3 },
      { questionId: q1.id, text: "CONNECT", isCorrect: false, order: 4 },
    ],
  });

  const q2 = await prisma.question.create({
    data: {
      quizId: quiz.id,
      type: QuestionType.TRUE_FALSE,
      text: "PostgreSQL supports ACID transactions.",
      explanation: "PostgreSQL is fully ACID compliant.",
      points: 10,
      order: 2,
    },
  });

  await prisma.choice.createMany({
    data: [
      { questionId: q2.id, text: "True", isCorrect: true, order: 1 },
      { questionId: q2.id, text: "False", isCorrect: false, order: 2 },
    ],
  });

  await prisma.question.create({
    data: {
      quizId: quiz.id,
      type: QuestionType.FILL_BLANK,
      text: "Fill in the blank: Stateless authentication often uses ______ tokens.",
      acceptedAnswers: ["jwt", "json web token", "json web tokens"],
      explanation: "JWT stands for JSON Web Token.",
      points: 10,
      order: 3,
    },
  });

  console.log("Seed completed.");
  console.log("Admin:", adminEmail, "/", adminPassword);
  console.log("User:", userEmail, "/", userPassword);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
