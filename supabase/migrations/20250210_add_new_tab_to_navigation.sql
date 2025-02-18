-- Add new_tab column to navigation_items table
ALTER TABLE navigation_items 
ADD COLUMN IF NOT EXISTS open_in_new_tab BOOLEAN DEFAULT false;
