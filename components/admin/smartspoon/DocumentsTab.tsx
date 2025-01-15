'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { FaUpload, FaTrash } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function DocumentsTab() {
  const [termsFile, setTermsFile] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchTermsDocument();
  }, []);

  const fetchTermsDocument = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('file_url')
        .eq('type', 'terms')
        .single();

      if (error) throw error;
      if (data) {
        setTermsFile(data.file_url);
      }
    } catch (error: any) {
      console.error('Error fetching terms document:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (file.type !== 'application/pdf') {
        toast.error('Please upload a PDF file');
        return;
      }

      setUploading(true);

      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `terms-and-conditions-${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName);

      // Update or insert into documents table
      const { error: dbError } = await supabase
        .from('documents')
        .upsert({
          type: 'terms',
          file_url: publicUrl,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'type'
        });

      if (dbError) throw dbError;

      setTermsFile(publicUrl);
      toast.success('Terms and conditions document uploaded successfully');
    } catch (error: any) {
      console.error('Error uploading document:', error);
      toast.error(error.message || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    try {
      // Delete from documents table
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('type', 'terms');

      if (dbError) throw dbError;

      setTermsFile(null);
      toast.success('Document deleted successfully');
    } catch (error: any) {
      console.error('Error deleting document:', error);
      toast.error(error.message || 'Failed to delete document');
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Documents</h2>

        {/* Terms and Conditions Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Terms and Conditions</h3>
          
          <div className="space-y-4">
            {/* Current Document Status */}
            {termsFile && (
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-4">
                  <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" />
                    <path d="M3 8a2 2 0 012-2v10h8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Current Document</p>
                    <a 
                      href={termsFile} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400"
                    >
                      View Document
                    </a>
                  </div>
                </div>
                <button
                  onClick={handleDelete}
                  className="p-2 text-red-500 hover:text-red-600 transition-colors"
                >
                  <FaTrash className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Upload Section */}
            <div className="relative">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="hidden"
                id="terms-upload"
                disabled={uploading}
              />
              <label
                htmlFor="terms-upload"
                className={`flex items-center justify-center px-4 py-3 border-2 border-dashed rounded-xl cursor-pointer
                  ${uploading 
                    ? 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600' 
                    : 'border-primary/50 hover:border-primary dark:border-primary/30 dark:hover:border-primary'
                  }`}
              >
                <div className="flex items-center space-x-2">
                  <FaUpload className={`w-5 h-5 ${uploading ? 'text-gray-400' : 'text-primary'}`} />
                  <span className={`text-sm font-medium ${uploading ? 'text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                    {uploading ? 'Uploading...' : 'Upload PDF Document'}
                  </span>
                </div>
              </label>
            </div>

            {/* Help Text */}
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Upload your terms and conditions document in PDF format. This will be accessible at /terms
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
