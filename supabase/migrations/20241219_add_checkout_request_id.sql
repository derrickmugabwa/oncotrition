-- Add checkout_request_id column to event_bookings table
ALTER TABLE event_bookings
ADD COLUMN checkout_request_id TEXT;

-- Create index for faster lookups
CREATE INDEX idx_event_bookings_checkout_request_id 
ON event_bookings(checkout_request_id);
