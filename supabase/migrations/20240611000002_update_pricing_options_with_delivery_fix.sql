-- Add delivery-related columns to pricing_options table
ALTER TABLE pricing_options
ADD COLUMN IF NOT EXISTS delivery_type TEXT,
ADD COLUMN IF NOT EXISTS delivery_time TEXT,
ADD COLUMN IF NOT EXISTS delivery_description TEXT;
