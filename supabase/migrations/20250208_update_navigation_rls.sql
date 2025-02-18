-- Enable RLS on the navigation_items table
ALTER TABLE public.navigation_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access to navigation items" ON public.navigation_items;
DROP POLICY IF EXISTS "Allow admin users to manage navigation items" ON public.navigation_items;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read access for all users" ON public.navigation_items;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.navigation_items;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.navigation_items;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.navigation_items;

-- Create a policy to allow reading for everyone
CREATE POLICY "Enable read access for all users" 
ON public.navigation_items
FOR SELECT 
USING (true);

-- Create a policy to allow insert for authenticated admin users
CREATE POLICY "Enable insert for authenticated users only" 
ON public.navigation_items
FOR INSERT 
TO authenticated
WITH CHECK (auth.role() = 'authenticated' AND auth.uid() IN (
    SELECT auth.uid() 
    FROM auth.users 
    WHERE raw_user_meta_data->>'role' = 'admin'
));

-- Create a policy to allow update for authenticated admin users
CREATE POLICY "Enable update for authenticated users only" 
ON public.navigation_items
FOR UPDATE
TO authenticated
USING (auth.role() = 'authenticated' AND auth.uid() IN (
    SELECT auth.uid() 
    FROM auth.users 
    WHERE raw_user_meta_data->>'role' = 'admin'
))
WITH CHECK (auth.role() = 'authenticated' AND auth.uid() IN (
    SELECT auth.uid() 
    FROM auth.users 
    WHERE raw_user_meta_data->>'role' = 'admin'
));

-- Create a policy to allow delete for authenticated admin users
CREATE POLICY "Enable delete for authenticated users only" 
ON public.navigation_items
FOR DELETE
TO authenticated
USING (auth.role() = 'authenticated' AND auth.uid() IN (
    SELECT auth.uid() 
    FROM auth.users 
    WHERE raw_user_meta_data->>'role' = 'admin'
));
