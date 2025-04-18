-- Add sender_name and is_read columns to letter_replies table if they don't exist
ALTER TABLE letter_replies ADD COLUMN IF NOT EXISTS sender_name TEXT;
ALTER TABLE letter_replies ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false;

-- Enable realtime for letter_replies table (only if not already added)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'letter_replies'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE letter_replies;
  END IF;
END
$$;