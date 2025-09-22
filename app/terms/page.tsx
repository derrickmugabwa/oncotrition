import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// Function to format text content with proper line breaks and paragraphs
const formatTextContent = (content: string): string => {
  if (!content) return '';
  
  // If content already contains HTML tags, return as is
  if (content.includes('<') && content.includes('>')) {
    return content;
  }
  
  // Convert plain text to HTML with proper formatting
  return content
    .split('\n\n') // Split by double line breaks (paragraphs)
    .map(paragraph => paragraph.trim())
    .filter(paragraph => paragraph.length > 0)
    .map(paragraph => {
      // Convert single line breaks within paragraphs to <br> tags
      const formattedParagraph = paragraph.replace(/\n/g, '<br>');
      return `<p class="mb-4">${formattedParagraph}</p>`;
    })
    .join('');
};

export default async function TermsPage() {
  const supabase = createServerComponentClient<Database>({ cookies });

  // Fetch terms content server-side
  const { data, error } = await supabase
    .from('terms_and_conditions')
    .select('content')
    .eq('is_active', true)
    .single();

  let termsContent = '';
  if (!error && data) {
    termsContent = data.content || '';
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              Terms and Conditions
            </h1>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8">
              {termsContent ? (
                <div 
                  className="prose prose-lg max-w-none text-gray-900 dark:text-white"
                  dangerouslySetInnerHTML={{ __html: formatTextContent(termsContent) }}
                />
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400 text-lg">
                    Terms and conditions content is not available at the moment.
                  </p>
                  <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                    Please check back later or contact us if you need this information.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
