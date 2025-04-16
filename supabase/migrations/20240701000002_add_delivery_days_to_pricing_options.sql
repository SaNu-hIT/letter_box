-- Add delivery_days column to pricing_options table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pricing_options' AND column_name = 'delivery_days') THEN
    ALTER TABLE pricing_options ADD COLUMN delivery_days TEXT;
  END IF;
END $$;
