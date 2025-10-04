import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

// User profiles table
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(),
  email: text("email").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Journal sessions table - one per day
export const journalSessions = pgTable("journal_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  date: timestamp("date").defaultNow().notNull(),
  completed: integer("completed").default(0).notNull(), // 0-8 tracking progress
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Journal entries table - individual Q&A pairs
export const journalEntries = pgTable("journal_entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id")
    .notNull()
    .references(() => journalSessions.id, { onDelete: "cascade" }),
  questionKey: text("question_key").notNull(), // mood, stress, activity, diet, leisure, relationships, work, other
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  audioUrl: text("audio_url"), // Optional audio file URL
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Messages table - chat messages for journal sessions
export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id")
    .notNull()
    .references(() => journalSessions.id, { onDelete: "cascade" }),
  role: text("role").notNull(), // 'user' or 'assistant'
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
export type JournalSession = typeof journalSessions.$inferSelect;
export type NewJournalSession = typeof journalSessions.$inferInsert;
export type JournalEntry = typeof journalEntries.$inferSelect;
export type NewJournalEntry = typeof journalEntries.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
