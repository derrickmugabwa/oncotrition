'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import { FaSave, FaEdit } from 'react-icons/fa';
import toast from 'react-hot-toast';

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

export default function DocumentsTab() {
  const [termsContent, setTermsContent] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    fetchTermsContent();
  }, []);

  const fetchTermsContent = async () => {
    try {
      const { data, error } = await supabase
        .from('terms_and_conditions')
        .select('content')
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      if (data) {
        setTermsContent(data.content || '');
      }
    } catch (error: any) {
      console.error('Error fetching terms content:', error);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Get current active terms
      const { data: existingData, error: fetchError } = await supabase
        .from('terms_and_conditions')
        .select('id')
        .eq('is_active', true)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

      let updateOperation;
      
      if (existingData) {
        // Update existing terms
        updateOperation = supabase
          .from('terms_and_conditions')
          .update({
            content: termsContent,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingData.id);
      } else {
        // Insert new terms
        updateOperation = supabase
          .from('terms_and_conditions')
          .insert({
            content: termsContent,
            is_active: true,
            title: 'Terms and Conditions',
            version: '1.0'
          });
      }

      const { error: dbError } = await updateOperation;
      if (dbError) throw dbError;

      setEditing(false);
      toast.success('Terms and conditions saved successfully');
    } catch (error: any) {
      console.error('Error saving terms:', error);
      toast.error(error.message || 'Failed to save terms and conditions');
    } finally {
      setSaving(false);
    }
  };

  const handleClear = async () => {
    if (window.confirm('Are you sure you want to clear all content?')) {
      setTermsContent('');
      setEditing(true);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Documents</h2>

        {/* Terms and Conditions Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Terms and Conditions</h3>
            <div className="flex items-center space-x-2">
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FaEdit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    <FaSave className="w-4 h-4" />
                    <span>{saving ? 'Saving...' : 'Save'}</span>
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleClear}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Clear
                  </button>
                </>
              )}
            </div>
          </div>
          
          <div className="space-y-4">
            {editing ? (
              <div className="space-y-4">
                <textarea
                  value={termsContent}
                  onChange={(e) => setTermsContent(e.target.value)}
                  placeholder="Enter your terms and conditions content here..."
                  className="w-full h-96 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <div className="text-sm text-gray-500 dark:text-gray-400 space-y-2">
                  <p><strong>Formatting Tips:</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Use double line breaks (Enter twice) to create new paragraphs</li>
                    <li>Use single line breaks (Enter once) for line breaks within a paragraph</li>
                    <li>You can also use basic HTML tags like &lt;strong&gt;, &lt;em&gt;, &lt;ul&gt;, &lt;li&gt;</li>
                  </ul>
                  <p className="mt-2">This content will be displayed at /terms</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {termsContent ? (
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg max-h-96 overflow-y-auto">
                    <div 
                      className="text-gray-900 dark:text-white prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: formatTextContent(termsContent) }}
                    />
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                    <p>No terms and conditions content available.</p>
                    <p className="text-sm mt-2">Click "Edit" to add content.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
