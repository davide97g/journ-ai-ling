-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for profiles
CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "profiles_delete_own"
  ON profiles FOR DELETE
  USING (auth.uid() = id);

-- Create journal_sessions table
CREATE TABLE IF NOT EXISTS journal_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date TIMESTAMP DEFAULT NOW() NOT NULL,
  completed INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Enable RLS on journal_sessions
ALTER TABLE journal_sessions ENABLE ROW LEVEL SECURITY;

-- RLS policies for journal_sessions
CREATE POLICY "journal_sessions_select_own"
  ON journal_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "journal_sessions_insert_own"
  ON journal_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "journal_sessions_update_own"
  ON journal_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "journal_sessions_delete_own"
  ON journal_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- Create journal_entries table
CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES journal_sessions(id) ON DELETE CASCADE,
  question_key TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  audio_url TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Enable RLS on journal_entries
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- RLS policies for journal_entries (check ownership via session)
CREATE POLICY "journal_entries_select_own"
  ON journal_entries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM journal_sessions
      WHERE journal_sessions.id = journal_entries.session_id
      AND journal_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "journal_entries_insert_own"
  ON journal_entries FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM journal_sessions
      WHERE journal_sessions.id = journal_entries.session_id
      AND journal_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "journal_entries_update_own"
  ON journal_entries FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM journal_sessions
      WHERE journal_sessions.id = journal_entries.session_id
      AND journal_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "journal_entries_delete_own"
  ON journal_entries FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM journal_sessions
      WHERE journal_sessions.id = journal_entries.session_id
      AND journal_sessions.user_id = auth.uid()
    )
  );

-- Create messages table for chat messages
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES journal_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Enable RLS on messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for messages (check ownership via session)
CREATE POLICY "messages_select_own"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM journal_sessions
      WHERE journal_sessions.id = messages.session_id
      AND journal_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "messages_insert_own"
  ON messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM journal_sessions
      WHERE journal_sessions.id = messages.session_id
      AND journal_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "messages_update_own"
  ON messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM journal_sessions
      WHERE journal_sessions.id = messages.session_id
      AND journal_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "messages_delete_own"
  ON messages FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM journal_sessions
      WHERE journal_sessions.id = messages.session_id
      AND journal_sessions.user_id = auth.uid()
    )
  );

-- Create trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (
    new.id,
    new.email
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
