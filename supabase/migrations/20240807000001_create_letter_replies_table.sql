CREATE TABLE IF NOT EXISTS letter_replies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  letter_id UUID NOT NULL REFERENCES letters(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE letter_replies ENABLE ROW LEVEL SECURITY;

-- Create policies for letter_replies table
-- Allow anyone to insert a reply
DROP POLICY IF EXISTS "Anyone can insert a reply" ON letter_replies;
CREATE POLICY "Anyone can insert a reply"
  ON letter_replies
  FOR INSERT
  WITH CHECK (true);

-- Allow the original letter sender to view replies to their letters
DROP POLICY IF EXISTS "Letter senders can view replies" ON letter_replies;
CREATE POLICY "Letter senders can view replies"
  ON letter_replies
  FOR SELECT
  USING (letter_id IN (SELECT id FROM letters WHERE user_id = auth.uid()));

-- Realtime already enabled for letter_replies