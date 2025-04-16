-- Add foreign key relationship between letters and public.users tables
ALTER TABLE letters
ADD CONSTRAINT letters_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Enable realtime for the letters table (only if not already added)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'letters'
  ) THEN
    alter publication supabase_realtime add table public.letters;
  END IF;
END
$$;