-- Add delivery_speed column to pricing_options table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pricing_options' AND column_name = 'delivery_speed') THEN
    ALTER TABLE pricing_options ADD COLUMN delivery_speed TEXT DEFAULT 'standard';
  END IF;
END $$;
