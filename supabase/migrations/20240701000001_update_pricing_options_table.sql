-- Update pricing_options table to ensure it has all required fields

-- Check if the table exists, if not create it
CREATE TABLE IF NOT EXISTS pricing_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  features TEXT[] DEFAULT '{}',
  is_popular BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  delivery_speed TEXT DEFAULT 'standard',
  delivery_days TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add columns if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pricing_options' AND column_name = 'is_popular') THEN
    ALTER TABLE pricing_options ADD COLUMN is_popular BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pricing_options' AND column_name = 'sort_order') THEN
    ALTER TABLE pricing_options ADD COLUMN sort_order INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pricing_options' AND column_name = 'delivery_speed') THEN
    ALTER TABLE pricing_options ADD COLUMN delivery_speed TEXT DEFAULT 'standard';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pricing_options' AND column_name = 'delivery_days') THEN
    ALTER TABLE pricing_options ADD COLUMN delivery_days TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pricing_options' AND column_name = 'created_at') THEN
    ALTER TABLE pricing_options ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pricing_options' AND column_name = 'updated_at') THEN
    ALTER TABLE pricing_options ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- Enable RLS but allow all operations for now
ALTER TABLE pricing_options ENABLE ROW LEVEL SECURITY;

-- Create policies for pricing_options table
DROP POLICY IF EXISTS "Allow full access to pricing_options" ON pricing_options;
CREATE POLICY "Allow full access to pricing_options"
  ON pricing_options
  USING (true)
  WITH CHECK (true);

-- Enable realtime for pricing_options table (only if not already added)
DO $ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'pricing_options'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE pricing_options;
  END IF;
END $;
