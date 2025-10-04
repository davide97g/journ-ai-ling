export const JOURNAL_QUESTIONS = [
  {
    key: "mood",
    question: "How are you feeling today? What's your overall mood?",
  },
  {
    key: "stress",
    question: "What's your stress level today? What's contributing to it?",
  },
  {
    key: "activity",
    question: "What physical activities did you do today?",
  },
  {
    key: "diet",
    question: "How was your eating today? What did you have?",
  },
  {
    key: "leisure",
    question: "What did you do for fun or relaxation today?",
  },
  {
    key: "relationships",
    question: "How were your interactions with others today?",
  },
  {
    key: "work",
    question: "How was your work or productivity today?",
  },
  {
    key: "other",
    question: "Is there anything else you'd like to share about your day?",
  },
] as const

export type QuestionKey = (typeof JOURNAL_QUESTIONS)[number]["key"]
