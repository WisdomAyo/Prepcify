export interface PracticeQuestion {
  question: string;
  options: string[];
  correct?: number;
  explanation?: string;
}

export const examQuestionTotal = 50;
export const examDurationSeconds = 60 * 45;

export const sampleExamQuestions: PracticeQuestion[] = [
  {
    question: "The capital of Senegal is:",
    options: ["Dakar", "Bamako", "Conakry", "Lomé"],
  },
  {
    question: "Photosynthesis primarily occurs in the:",
    options: ["Mitochondria", "Ribosome", "Chloroplast", "Nucleus"],
  },
];

export const quizQuestions: Required<PracticeQuestion>[] = [
  {
    question: "If 2x + 3 = 11, what is the value of x?",
    options: ["2", "3", "4", "5"],
    correct: 2,
    explanation: "Subtract 3 from both sides: 2x = 8. Divide by 2 → x = 4.",
  },
  {
    question: "The sum of two numbers is 24 and their difference is 6. The smaller number is:",
    options: ["6", "9", "12", "15"],
    correct: 1,
    explanation: "Let the numbers be a and b with a > b. a + b = 24 and a − b = 6 → b = 9.",
  },
  {
    question: "Solve: x² − 5x + 6 = 0",
    options: ["x = 1, 6", "x = 2, 3", "x = −2, −3", "x = −1, −6"],
    correct: 1,
    explanation: "Factor: (x − 2)(x − 3) = 0 → x = 2 or x = 3.",
  },
];
