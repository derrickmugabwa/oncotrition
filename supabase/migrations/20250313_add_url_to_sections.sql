-- Add URL column to navigation sections
ALTER TABLE navigation_sections 
ADD COLUMN url TEXT DEFAULT NULL;
