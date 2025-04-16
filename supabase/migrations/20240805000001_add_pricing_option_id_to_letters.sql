-- Add pricing_option_id column to letters table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'letters' AND column_name = 'pricing_option_id') THEN
        ALTER TABLE public.letters ADD COLUMN pricing_option_id UUID REFERENCES public.pricing_options(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'letters' AND column_name = 'price') THEN
        ALTER TABLE public.letters ADD COLUMN price INTEGER;
    END IF;
END
$$;