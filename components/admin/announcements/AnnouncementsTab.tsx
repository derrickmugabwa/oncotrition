'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'react-hot-toast';
import { Bell, Plus, Edit, Trash2, Eye, Search, ToggleLeft, ToggleRight } from 'lucide-react';
import { Announcement } from '@/types/events';
import AnnouncementEditor from './AnnouncementEditor';
import { format } from 'date-fns';

export default function AnnouncementsTab() {
  const supabase = createClientComponentClient();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  useEffect(() => {
    filterAnnouncements();
  }, [announcements, searchQuery, typeFilter]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('priority', { ascending: false });

      if (error) throw error;
      setAnnouncements(data || []);
    } catch (error: any) {
      console.error('Error fetching announcements:', error);
      toast.error('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  const filterAnnouncements = () => {
    let filtered = [...announcements];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        announcement =>
          announcement.title.toLowerCase().includes(query) ||
          announcement.message.toLowerCase().includes(query)
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(announcement => announcement.announcement_type === typeFilter);
    }

    setFilteredAnnouncements(filtered);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;

    try {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setAnnouncements(announcements.filter(a => a.id !== id));
      toast.success('Announcement deleted successfully');
    } catch (error: any) {
      console.error('Error deleting announcement:', error);
      toast.error('Failed to delete announcement');
    }
  };

  const handleToggleActive = async (announcement: Announcement) => {
    try {
      const { error } = await supabase
        .from('announcements')
        .update({ is_active: !announcement.is_active })
        .eq('id', announcement.id);

      if (error) throw error;

      setAnnouncements(announcements.map(a =>
        a.id === announcement.id ? { ...a, is_active: !a.is_active } : a
      ));
      toast.success(`Announcement ${!announcement.is_active ? 'activated' : 'deactivated'}`);
    } catch (error: any) {
      console.error('Error toggling announcement:', error);
      toast.error('Failed to update announcement');
    }
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setShowEditor(true);
  };

  const handleCreate = () => {
    setEditingAnnouncement(null);
    setShowEditor(true);
  };

  const handleEditorClose = () => {
    setShowEditor(false);
    setEditingAnnouncement(null);
    fetchAnnouncements();
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'event':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'promotion':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'alert':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const isActive = (announcement: Announcement) => {
    const now = new Date();
    const start = new Date(announcement.start_date);
    const end = new Date(announcement.end_date);
    return announcement.is_active && now >= start && now <= end;
  };

  if (showEditor) {
    return <AnnouncementEditor announcement={editingAnnouncement} onClose={handleEditorClose} />;
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white p-6 rounded-lg shadow-sm">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Announcements Management</h2>
          <p className="text-gray-600 mt-1">Manage site-wide announcement popups</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-[#009688] text-white rounded-lg hover:bg-[#00796b] transition-colors shadow-md"
        >
          <Plus className="w-5 h-5" />
          Create Announcement
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search announcements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009688]"
            />
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009688]"
          >
            <option value="all">All Types</option>
            <option value="event">Event</option>
            <option value="general">General</option>
            <option value="promotion">Promotion</option>
            <option value="alert">Alert</option>
          </select>
        </div>

        {/* Results Count */}
        <div className="mt-3 text-sm text-gray-600">
          Showing {filteredAnnouncements.length} of {announcements.length} announcements
        </div>
      </div>

      {/* Announcements List */}
      {filteredAnnouncements.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No announcements found</h3>
          <p className="text-gray-500 mb-4">
            {searchQuery || typeFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Get started by creating your first announcement'}
          </p>
          {!searchQuery && typeFilter === 'all' && (
            <button
              onClick={handleCreate}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#009688] text-white rounded-lg hover:bg-[#00796b] transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Announcement
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAnnouncements.map((announcement) => (
            <div
              key={announcement.id}
              className={`bg-white rounded-lg shadow-sm border-2 p-6 hover:shadow-md transition-shadow ${
                isActive(announcement) ? 'border-green-200 bg-green-50/30' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Title and Badges */}
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="text-xl font-bold text-gray-900">{announcement.title}</h3>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getTypeColor(announcement.announcement_type)}`}>
                      {announcement.announcement_type}
                    </span>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      isActive(announcement)
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {isActive(announcement) ? 'Active' : 'Inactive'}
                    </span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                      Priority: {announcement.priority}
                    </span>
                  </div>

                  {/* Message */}
                  <p className="text-gray-600 mb-4 line-clamp-2">{announcement.message}</p>

                  {/* Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Start Date:</span>
                      <span className="ml-2 font-medium text-gray-900">
                        {format(new Date(announcement.start_date), 'MMM dd, yyyy')}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">End Date:</span>
                      <span className="ml-2 font-medium text-gray-900">
                        {format(new Date(announcement.end_date), 'MMM dd, yyyy')}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Frequency:</span>
                      <span className="ml-2 font-medium text-gray-900 capitalize">
                        {announcement.display_frequency}
                      </span>
                    </div>
                  </div>

                  {/* CTA */}
                  {announcement.cta_text && (
                    <div className="mt-3 text-sm">
                      <span className="text-gray-500">CTA:</span>
                      <span className="ml-2 font-medium text-[#009688]">
                        {announcement.cta_text}
                      </span>
                      {announcement.cta_link && (
                        <span className="ml-2 text-gray-400">→ {announcement.cta_link}</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleToggleActive(announcement)}
                    className={`p-2 rounded-lg transition-colors ${
                      announcement.is_active
                        ? 'text-green-600 hover:bg-green-50'
                        : 'text-gray-400 hover:bg-gray-100'
                    }`}
                    title={announcement.is_active ? 'Deactivate' : 'Activate'}
                  >
                    {announcement.is_active ? (
                      <ToggleRight className="w-6 h-6" />
                    ) : (
                      <ToggleLeft className="w-6 h-6" />
                    )}
                  </button>
                  <button
                    onClick={() => handleEdit(announcement)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Edit announcement"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(announcement.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete announcement"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
