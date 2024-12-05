'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTrash2, FiMail, FiUser, FiMessageSquare, FiCalendar, FiSearch } from 'react-icons/fi';

interface ContactSubmission {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
}

export default function ContactSubmissionsTab() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const ITEMS_PER_PAGE = 10;
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchSubmissions(true);
  }, [searchQuery]);

  const fetchSubmissions = async (reset = false) => {
    try {
      if (reset) {
        setPage(0);
        setHasMore(true);
      }
      
      setLoading(true);
      const currentPage = reset ? 0 : page;
      const query = supabase
        .from('form_submissions')
        .select('*')
        .order('created_at', { ascending: false })
        .range(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE - 1);

      // Add search filter if query exists
      if (searchQuery) {
        query.or(`name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,subject.ilike.%${searchQuery}%,message.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      if (reset) {
        setSubmissions(data || []);
      } else {
        setSubmissions(prev => [...prev, ...(data || [])]);
      }
      
      setHasMore((data?.length || 0) === ITEMS_PER_PAGE);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to fetch contact submissions');
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
      fetchSubmissions();
    }
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const deleteSubmission = async (id: number) => {
    try {
      const { error } = await supabase
        .from('form_submissions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSubmissions(prev => prev.filter(sub => sub.id !== id));
      setSelectedSubmission(null);
      toast.success('Submission deleted successfully');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to delete submission');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Submissions List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Recent Submissions ({submissions.length})
            </h3>
            <div className="relative">
              <input
                type="text"
                placeholder="Search submissions..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                  focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          <div 
            className="divide-y divide-gray-200 dark:divide-gray-700 overflow-y-auto flex-1"
            style={{ maxHeight: 'calc(100vh - 300px)' }}
          >
            <AnimatePresence>
              {submissions.map((submission) => (
                <motion.div
                  key={submission.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-700
                    ${selectedSubmission?.id === submission.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                  onClick={() => setSelectedSubmission(submission)}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <FiUser className="text-gray-400" />
                        <span className="font-medium text-gray-900 dark:text-white">{submission.name}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                        <FiMail className="text-gray-400" />
                        <span>{submission.email}</span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {formatDate(submission.created_at)}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-1">
                    {submission.subject}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {hasMore && (
              <div className="p-4 text-center">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-primary hover:text-primary/80
                    disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Submission Details */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm h-fit">
          {selectedSubmission ? (
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                    {selectedSubmission.subject}
                  </h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                    <FiCalendar className="text-gray-400" />
                    <span>{formatDate(selectedSubmission.created_at)}</span>
                  </div>
                </div>
                <button
                  onClick={() => deleteSubmission(selectedSubmission.id)}
                  className="p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300
                    hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <FiTrash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <FiUser className="text-gray-400" />
                    <span className="font-medium text-gray-900 dark:text-white">{selectedSubmission.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FiMail className="text-gray-400" />
                    <a 
                      href={`mailto:${selectedSubmission.email}`}
                      className="text-primary hover:text-primary/80"
                    >
                      {selectedSubmission.email}
                    </a>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <FiMessageSquare className="text-gray-400" />
                    <span className="font-medium text-gray-900 dark:text-white">Message</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap pl-7">
                    {selectedSubmission.message}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              <FiMessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>Select a submission to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
