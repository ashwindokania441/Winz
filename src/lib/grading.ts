/** Exact-match grading for enter-answer questions (trimmed, case-sensitive). */
export function gradeAnswer(
  type: string,
  givenAnswer: string,
  correctAnswer: string
): boolean {
  const given = givenAnswer.trim();
  const correct = correctAnswer.trim();
  if (type === "enter_answer") {
    return given === correct;
  }
  // MCQ: compare choice keys case-insensitively for robustness
  return given.toLowerCase() === correct.toLowerCase();
}
