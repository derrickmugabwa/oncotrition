'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import Sidebar from "@/components/admin/Sidebar";
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar - mobile drawer and desktop fixed */}
        <div className={`
          fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out md:relative md:z-auto md:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="flex min-h-0 flex-1 flex-col bg-white dark:bg-gray-800 shadow-sm h-full">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>

        {/* Main content - full width on mobile, adjusted for sidebar on desktop */}
        <div className="flex flex-1 flex-col">
          {/* Mobile header with hamburger menu */}
          <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white dark:bg-gray-800 shadow md:hidden">
            <button
              type="button"
              className="border-r border-gray-200 dark:border-gray-700 px-4 text-gray-500 dark:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-500"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>
            <div className="flex flex-1 items-center justify-center px-4">
              <h1 className="text-lg font-semibold bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">
                Oncotrition Admin
              </h1>
            </div>
          </div>

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
