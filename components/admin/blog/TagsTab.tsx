'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Plus, Edit, Trash2, Tag } from 'lucide-react';
import toast from 'react-hot-toast';

interface BlogTag {
  id: string;
  name: string;
  slug: string;
  color: string;
}

interface TagsTabProps {
  tags: BlogTag[];
}

export default function TagsTab({ tags }: TagsTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingTag, setEditingTag] = useState<BlogTag | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    color: '#6B7280',
  });
  const supabase = createClientComponentClient();

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
    }));
  };

  const handleEdit = (tag: BlogTag) => {
    setEditingTag(tag);
    setFormData({
      name: tag.name,
      slug: tag.slug,
      color: tag.color || '#6B7280',
    });
    setIsEditing(true);
  };

  const handleDelete = async (tagId: string) => {
    if (!confirm('Are you sure you want to delete this tag?')) return;

    try {
      const { error } = await supabase
        .from('blog_tags')
        .delete()
        .eq('id', tagId);

      if (error) throw error;

      toast.success('Tag deleted successfully');
      window.location.reload();
    } catch (error) {
      console.error('Error deleting tag:', error);
      toast.error('Failed to delete tag');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingTag) {
        // Update existing tag
        const { error } = await supabase
          .from('blog_tags')
          .update(formData)
          .eq('id', editingTag.id);

        if (error) throw error;
        toast.success('Tag updated successfully');
      } else {
        // Create new tag
        const { error } = await supabase
          .from('blog_tags')
          .insert([formData]);

        if (error) throw error;
        toast.success('Tag created successfully');
      }

      setIsEditing(false);
      setEditingTag(null);
      setFormData({ name: '', slug: '', color: '#6B7280' });
      window.location.reload();
    } catch (error) {
      console.error('Error saving tag:', error);
      toast.error('Failed to save tag');
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditingTag(null);
    setFormData({ name: '', slug: '', color: '#6B7280' });
  };

  const predefinedColors = [
    '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6',
    '#EC4899', '#6B7280', '#059669', '#7C3AED', '#DC2626'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tags</h2>
          <p className="text-gray-600">Create and manage blog post tags</p>
        </div>
        <button
          onClick={() => setIsEditing(true)}
          className="flex items-center space-x-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Tag</span>
        </button>
      </div>

      {/* Tag Form */}
      {isEditing && (
        <div className="bg-gray-50 p-6 rounded-lg border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingTag ? 'Edit Tag' : 'Create New Tag'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slug *
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color
              </label>
              <div className="space-y-3">
                <div className="flex items-center space-x-4">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="#6B7280"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {predefinedColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, color }))}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        formData.color === color ? 'border-gray-900 scale-110' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                {editingTag ? 'Update Tag' : 'Create Tag'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tags List */}
      <div className="grid gap-4">
        {tags.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No tags found.</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {tags.map((tag) => (
              <div
                key={tag.id}
                className="group relative bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-all"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <Tag className="w-4 h-4 text-gray-400" />
                    <span
                      className="px-3 py-1 text-sm font-medium text-white rounded-full"
                      style={{ backgroundColor: tag.color }}
                    >
                      #{tag.name}
                    </span>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1">
                    <button
                      onClick={() => handleEdit(tag)}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Edit tag"
                    >
                      <Edit className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleDelete(tag.id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete tag"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">/{tag.slug}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
