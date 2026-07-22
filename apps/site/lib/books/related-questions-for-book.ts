import { getPublishedQuestions } from "@/lib/questions/loadQuestions";
import type { QuestionDefinition } from "@/types/questions";

/** Published questions whose primary book matches, limited for overview continue sections. */
export function findPublishedQuestionsForBook(bookId: string, limit = 2): QuestionDefinition[] {
  return getPublishedQuestions()
    .filter((question) => question.primaryBookId === bookId)
    .slice(0, limit);
}
