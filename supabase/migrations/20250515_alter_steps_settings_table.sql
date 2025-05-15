-- Alter the smartspoon_steps_settings table to add title, subtitle, and description fields
ALTER TABLE IF EXISTS public.smartspoon_steps_settings
  ADD COLUMN IF NOT EXISTS title TEXT DEFAULT 'Step by step to get started',
  ADD COLUMN IF NOT EXISTS subtitle TEXT DEFAULT 'FAST SOLUTION',
  ADD COLUMN IF NOT EXISTS description TEXT DEFAULT 'Get started with our easy-to-follow process. We''ve simplified nutrition management into four straightforward steps to help you achieve your health goals.';
