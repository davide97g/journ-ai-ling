// Legacy hardcoded questions - kept for fallback
export const DEFAULT_JOURNAL_QUESTIONS = [
  {
    key: "mood",
    question: "Come ti senti oggi? Qual è il tuo umore generale?",
  },
  {
    key: "stress",
    question: "Qual è il tuo livello di stress oggi? Cosa lo sta contribuendo?",
  },
  {
    key: "activity",
    question: "Che attività fisiche hai fatto oggi?",
  },
  {
    key: "diet",
    question: "Come è andata la tua alimentazione oggi? Cosa hai mangiato?",
  },
  {
    key: "leisure",
    question: "Cosa hai fatto per divertimento o relax oggi?",
  },
  {
    key: "relationships",
    question: "Come sono state le tue interazioni con gli altri oggi?",
  },
  {
    key: "work",
    question: "Come è andato il tuo lavoro o la tua produttività oggi?",
  },
  {
    key: "other",
    question: "C'è qualcos'altro che vorresti condividere sulla tua giornata?",
  },
] as const;

export type QuestionKey = (typeof DEFAULT_JOURNAL_QUESTIONS)[number]["key"];

// Interface for database questions
export interface DatabaseQuestion {
  id: string;
  question: string;
  order: number;
  isActive: number;
  createdAt: string;
  updatedAt: string;
}

// Function to fetch questions from database
export async function fetchUserQuestions(): Promise<DatabaseQuestion[]> {
  try {
    const response = await fetch("/api/journal/questions/user");
    if (response.ok) {
      const data = await response.json();
      return data.questions || [];
    }
    return [];
  } catch (error) {
    console.error("Error fetching user questions:", error);
    return [];
  }
}

// Function to get questions with fallback to hardcoded ones
export async function getUserQuestions(): Promise<DatabaseQuestion[]> {
  const customQuestions = await fetchUserQuestions();

  // If no questions from database, return empty array
  // The API will handle copying default questions
  if (customQuestions.length === 0) {
    return [];
  }

  return customQuestions;
}
