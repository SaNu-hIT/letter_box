-- Add is_popular column to pricing_options table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pricing_options' AND column_name = 'is_popular') THEN
    ALTER TABLE pricing_options ADD COLUMN is_popular BOOLEAN DEFAULT false;
  END IF;
END $$;
