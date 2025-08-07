import { QUESTIONS_FOR_OO } from "./constants";

const generateRandomPastDate = (now: Date): Date => {
  const monthsBack = Math.floor(Math.random() * 2) + 1; // 1–2 months
  const daysBack = Math.floor(Math.random() * 6) + 10; // 10–15 days

  const pastDate = new Date(now);
  pastDate.setMonth(pastDate.getMonth() - monthsBack);
  pastDate.setDate(pastDate.getDate() - daysBack);

  return pastDate;
};

const replaceDatePlaceholders = (question: string): string => {
  const now = new Date();
  const past = generateRandomPastDate(now);

  return question
    .replace(/\{DAY\}/g, past.getDate().toString())
    .replace(/\{MONTH\}/g, past.toLocaleDateString("en-US", { month: "long" }))
    .replace(/\{YEAR\}/g, past.getFullYear().toString());
};

export const getRandomQuestion = (): string => {
  const randomIndex = Math.floor(Math.random() * QUESTIONS_FOR_OO.length);
  const question = QUESTIONS_FOR_OO[randomIndex];
  return replaceDatePlaceholders(question);
};
