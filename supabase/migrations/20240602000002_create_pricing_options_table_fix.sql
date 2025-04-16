-- Create the pricing_options table if it doesn't exist
CREATE TABLE IF NOT EXISTS pricing_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  features JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable row level security
ALTER TABLE pricing_options ENABLE ROW LEVEL SECURITY;

-- Create policy for public access to pricing options
DROP POLICY IF EXISTS "Public access to pricing options" ON pricing_options;
CREATE POLICY "Public access to pricing options"
  ON pricing_options FOR SELECT
  USING (true);

-- Enable realtime
alter publication supabase_realtime add table pricing_options;
