-- Insert default journal questions for all users
-- This script should be run after the user_questions table is created

-- Insert default questions with a special user_id that represents "default questions"
-- We'll use a special UUID for default questions that all users can inherit from
INSERT INTO user_questions (id, user_id, question, "order", is_active, created_at, updated_at)
VALUES 
  (
    gen_random_uuid(),
    '2dd6945c-4912-4ad3-9cb3-3ad36aec15f7'::uuid, -- Special UUID for default questions
    'Come ti senti oggi? Qual è il tuo umore generale?',
    1,
    1,
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    '2dd6945c-4912-4ad3-9cb3-3ad36aec15f7'::uuid,
    'Qual è il tuo livello di stress oggi? Cosa lo sta contribuendo?',
    2,
    1,
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    '2dd6945c-4912-4ad3-9cb3-3ad36aec15f7'::uuid,
    'Che attività fisiche hai fatto oggi?',
    3,
    1,
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    '2dd6945c-4912-4ad3-9cb3-3ad36aec15f7'::uuid,
    'Come è andata la tua alimentazione oggi? Cosa hai mangiato?',
    4,
    1,
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    '2dd6945c-4912-4ad3-9cb3-3ad36aec15f7'::uuid,
    'Cosa hai fatto per divertimento o relax oggi?',
    5,
    1,
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    '2dd6945c-4912-4ad3-9cb3-3ad36aec15f7'::uuid,
    'Come sono state le tue interazioni con gli altri oggi?',
    6,
    1,
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    '2dd6945c-4912-4ad3-9cb3-3ad36aec15f7'::uuid,
    'Come è andato il tuo lavoro o la tua produttività oggi?',
    7,
    1,
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    '2dd6945c-4912-4ad3-9cb3-3ad36aec15f7'::uuid,
    'C''è qualcos''altro che vorresti condividere sulla tua giornata?',
    8,
    1,
    NOW(),
    NOW()
  );

-- Create a function to copy default questions to a new user
CREATE OR REPLACE FUNCTION copy_default_questions_to_user(target_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO user_questions (user_id, question, "order", is_active, created_at, updated_at)
  SELECT 
    target_user_id,
    question,
    "order",
    is_active,
    NOW(),
    NOW()
  FROM user_questions 
  WHERE user_id = '2dd6945c-4912-4ad3-9cb3-3ad36aec15f7'::uuid
  AND is_active = 1
  ORDER BY "order";
END;
$$;

-- Create a trigger to automatically copy default questions when a new user is created
CREATE OR REPLACE FUNCTION handle_new_user_questions()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Copy default questions to the new user
  PERFORM copy_default_questions_to_user(NEW.id);
  RETURN NEW;
END;
$$;

-- Create trigger to copy default questions when a new profile is created
DROP TRIGGER IF EXISTS on_profile_created ON profiles;

CREATE TRIGGER on_profile_created
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user_questions();
