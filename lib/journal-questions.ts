export const JOURNAL_QUESTIONS = [
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

export type QuestionKey = (typeof JOURNAL_QUESTIONS)[number]["key"];
