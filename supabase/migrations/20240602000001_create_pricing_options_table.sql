-- Create pricing_options table
CREATE TABLE IF NOT EXISTS pricing_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  features TEXT[] DEFAULT '{}',
  is_popular BOOLEAN DEFAULT FALSE,
  sort_order INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable row level security
ALTER TABLE pricing_options ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
DROP POLICY IF EXISTS "Allow public read access" ON pricing_options;
CREATE POLICY "Allow public read access"
  ON pricing_options
  FOR SELECT
  USING (true);

-- Create policy for admin write access
DROP POLICY IF EXISTS "Allow admin write access" ON pricing_options;
CREATE POLICY "Allow admin write access"
  ON pricing_options
  FOR ALL
  USING (auth.uid() IN (SELECT user_id FROM admin_users));

-- Insert default pricing options
INSERT INTO pricing_options (name, description, price, features, is_popular, sort_order)
VALUES 
  ('Standard', 'For the patient romantic', 799, ARRAY['Premium paper', 'Standard delivery (5-7 days)', 'QR code for reply'], FALSE, 1),
  ('Premium', 'For the passionate heart', 1199, ARRAY['Luxury paper with scent', 'Express delivery (2-3 days)', 'QR code for reply', 'Wax seal with rose petals'], TRUE, 2),
  ('Luxury', 'For the ultimate romantic', 1999, ARRAY['Handmade artisan paper', 'Priority delivery (1-2 days)', 'QR code for reply', 'Custom wax seal & gift box'], FALSE, 3);

-- Enable realtime for pricing_options
alter publication supabase_realtime add table pricing_options;
