'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function TermsPage() {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchTermsDocument = async () => {
      try {
        const { data, error } = await supabase
          .from('documents')
          .select('file_url')
          .eq('type', 'terms')
          .single();

        if (error) throw error;
        if (data) {
          setPdfUrl(data.file_url);
        }
      } catch (error) {
        console.error('Error fetching terms document:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTermsDocument();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!pdfUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Terms and conditions document is not available.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Terms and Conditions</h1>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <iframe
            src={pdfUrl}
            className="w-full h-[calc(100vh-12rem)]"
            title="Terms and Conditions"
          />
        </div>
      </div>
    </div>
  );
}
