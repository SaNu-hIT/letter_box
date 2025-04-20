-- Add sender_address_id to letter_replies table
ALTER TABLE letter_replies
ADD COLUMN IF NOT EXISTS sender_address_id UUID REFERENCES addresses(id);

-- Add recipient_address_id to letters table
ALTER TABLE letters
ADD COLUMN IF NOT EXISTS sender_address_id UUID REFERENCES addresses(id);
