'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Sidebar from "@/components/admin/Sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClientComponentClient();
  const [isLoading, setIsLoading] = useState(true);

  // Skip auth check for login page
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    const checkAuth = async () => {
      // Don't check auth for login page
      if (isLoginPage) {
        setIsLoading(false);
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/admin/login');
        }
      } catch (error) {
        console.error('Auth error:', error);
        router.push('/admin/login');
      } finally {
        setIsLoading(false);
      }
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session && !isLoginPage) {
        router.push('/admin/login');
      }
    });

    checkAuth();

    return () => subscription.unsubscribe();
  }, [router, supabase, isLoginPage]);

  if (isLoading) {
    return null;
  }

  // Use a simplified layout for the login page
  if (isLoginPage) {
    return <div className="min-h-screen bg-gray-100 dark:bg-gray-900">{children}</div>;
  }

  // Admin dashboard layout
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="flex">
        {/* Sidebar - hidden on mobile, visible on desktop */}
        <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
          <div className="flex min-h-0 flex-1 flex-col bg-white dark:bg-gray-800 shadow-sm">
            <Sidebar />
          </div>
        </div>

        {/* Main content - full width on mobile, adjusted for sidebar on desktop */}
        <div className="flex flex-1 flex-col md:pl-64">
          <div className="mx-auto w-full max-w-7xl py-6 px-4 sm:px-6 lg:px-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
