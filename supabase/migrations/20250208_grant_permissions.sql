-- Grant necessary permissions to roles
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Grant SELECT permission to anon and authenticated roles
GRANT SELECT ON public.navigation_items TO anon;
GRANT SELECT ON public.navigation_items TO authenticated;

-- Grant all permissions to authenticated role (RLS will still apply)
GRANT ALL ON public.navigation_items TO authenticated;
