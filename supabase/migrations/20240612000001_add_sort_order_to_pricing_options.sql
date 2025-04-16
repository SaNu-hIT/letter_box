-- Add sort_order column to pricing_options table
ALTER TABLE pricing_options
ADD COLUMN IF NOT EXISTS sort_order INTEGER;
