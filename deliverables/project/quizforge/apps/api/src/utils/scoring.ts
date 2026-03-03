import { AttemptAnswer, Choice, Question, QuestionType } from "@prisma/client";

type QuestionWithChoices = Question & { choices: Choice[] };
type AnswerMap = Record<string, AttemptAnswer | undefined>;

function normalizeText(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}

export type ScoredQuestion = {
  questionId: string;
  isCorrect: boolean;
  awardedScore: number;
  maxScore: number;
};

export function evaluateQuestion(
  question: QuestionWithChoices,
  answer: AttemptAnswer | undefined,
): ScoredQuestion {
  const maxScore = question.points;

  if (!answer) {
    return { questionId: question.id, isCorrect: false, awardedScore: 0, maxScore };
  }

  let isCorrect = false;

  if (question.type === QuestionType.FILL_BLANK) {
    const normalizedAnswer = normalizeText(answer.textAnswer);
    isCorrect = question.acceptedAnswers.some(
      (accepted) => normalizeText(accepted) === normalizedAnswer,
    );
  } else {
    const correctChoice = question.choices.find((choice) => choice.isCorrect);
    isCorrect = Boolean(correctChoice && correctChoice.id === answer.selectedChoiceId);
  }

  const awardedScore = isCorrect ? question.points : -Math.abs(question.negativeMarks);

  return {
    questionId: question.id,
    isCorrect,
    awardedScore,
    maxScore,
  };
}

export function scoreAttempt(questions: QuestionWithChoices[], answers: AttemptAnswer[]) {
  const answerMap: AnswerMap = {};
  answers.forEach((answer) => {
    answerMap[answer.questionId] = answer;
  });

  const questionScores = questions.map((question) => evaluateQuestion(question, answerMap[question.id]));
  const maxScore = questionScores.reduce((sum, item) => sum + item.maxScore, 0);
  const rawScore = questionScores.reduce((sum, item) => sum + item.awardedScore, 0);
  const totalScore = Math.max(0, rawScore);
  const percentage = maxScore > 0 ? Number(((totalScore / maxScore) * 100).toFixed(2)) : 0;

  return {
    questionScores,
    totalScore,
    maxScore,
    percentage,
  };
}
