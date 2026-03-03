import { QuestionType } from "@prisma/client";

import { evaluateQuestion, scoreAttempt } from "../../src/utils/scoring";

describe("scoring utility", () => {
  it("scores MCQ correctly", () => {
    const question = {
      id: "q1",
      quizId: "quiz-1",
      type: QuestionType.MCQ,
      text: "2+2",
      explanation: null,
      points: 5,
      negativeMarks: 1,
      order: 1,
      imageUrl: null,
      acceptedAnswers: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      choices: [
        { id: "o1", questionId: "q1", text: "3", isCorrect: false, order: 1, createdAt: new Date() },
        { id: "o2", questionId: "q1", text: "4", isCorrect: true, order: 2, createdAt: new Date() },
      ],
    };

    const correct = evaluateQuestion(question, {
      id: "a1",
      attemptId: "att-1",
      questionId: "q1",
      selectedChoiceId: "o2",
      textAnswer: null,
      isCorrect: null,
      awardedScore: null,
      answeredAt: new Date(),
    });
    expect(correct.awardedScore).toBe(5);
    expect(correct.isCorrect).toBe(true);

    const wrong = evaluateQuestion(question, {
      id: "a2",
      attemptId: "att-1",
      questionId: "q1",
      selectedChoiceId: "o1",
      textAnswer: null,
      isCorrect: null,
      awardedScore: null,
      answeredAt: new Date(),
    });
    expect(wrong.awardedScore).toBe(-1);
    expect(wrong.isCorrect).toBe(false);
  });

  it("scores fill-blank with normalization", () => {
    const questions = [
      {
        id: "q1",
        quizId: "quiz-1",
        type: QuestionType.FILL_BLANK,
        text: "JWT",
        explanation: null,
        points: 10,
        negativeMarks: 0,
        order: 1,
        imageUrl: null,
        acceptedAnswers: ["jwt", "json web token"],
        createdAt: new Date(),
        updatedAt: new Date(),
        choices: [],
      },
    ];

    const result = scoreAttempt(questions, [
      {
        id: "a1",
        attemptId: "att-1",
        questionId: "q1",
        selectedChoiceId: null,
        textAnswer: " JSON   WEB TOKEN ",
        isCorrect: null,
        awardedScore: null,
        answeredAt: new Date(),
      },
    ]);

    expect(result.totalScore).toBe(10);
    expect(result.percentage).toBe(100);
  });
});
