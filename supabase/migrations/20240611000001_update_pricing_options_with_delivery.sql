-- Add delivery_speed and delivery_days columns to pricing_options table
ALTER TABLE pricing_options ADD COLUMN IF NOT EXISTS delivery_speed text;
ALTER TABLE pricing_options ADD COLUMN IF NOT EXISTS delivery_days text;

-- Update existing records with delivery information
UPDATE pricing_options SET delivery_speed = 'standard', delivery_days = '5-7 days' WHERE id = 'standard';
UPDATE pricing_options SET delivery_speed = 'express', delivery_days = '2-3 days' WHERE id = 'premium';
UPDATE pricing_options SET delivery_speed = 'overnight', delivery_days = '1-2 days' WHERE id = 'luxury';
