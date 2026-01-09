'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Plus, Edit, Trash2, Upload } from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';

interface Author {
  id: string;
  name: string;
  email: string;
  bio: string;
  profile_image_url: string;
  social_links: any;
}

interface AuthorsTabProps {
  authors: Author[];
}

export default function AuthorsTab({ authors }: AuthorsTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    profile_image_url: '',
    social_links: {},
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const supabase = createClient();

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `authors/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true);
    try {
      const imageUrl = await uploadImage(file);
      setFormData(prev => ({
        ...prev,
        profile_image_url: imageUrl
      }));
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleEdit = (author: Author) => {
    setEditingAuthor(author);
    setFormData({
      name: author.name,
      email: author.email || '',
      bio: author.bio || '',
      profile_image_url: author.profile_image_url || '',
      social_links: author.social_links || {},
    });
    setIsEditing(true);
  };

  const handleDelete = async (authorId: string) => {
    if (!confirm('Are you sure you want to delete this author?')) return;

    try {
      const { error } = await supabase
        .from('blog_authors')
        .delete()
        .eq('id', authorId);

      if (error) throw error;

      toast.success('Author deleted successfully');
      window.location.reload();
    } catch (error) {
      console.error('Error deleting author:', error);
      toast.error('Failed to delete author');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingAuthor) {
        // Update existing author
        const { error } = await supabase
          .from('blog_authors')
          .update(formData)
          .eq('id', editingAuthor.id);

        if (error) throw error;
        toast.success('Author updated successfully');
      } else {
        // Create new author
        const { error } = await supabase
          .from('blog_authors')
          .insert([formData]);

        if (error) throw error;
        toast.success('Author created successfully');
      }

      setIsEditing(false);
      setEditingAuthor(null);
      setFormData({ name: '', email: '', bio: '', profile_image_url: '', social_links: {} });
      window.location.reload();
    } catch (error) {
      console.error('Error saving author:', error);
      toast.error('Failed to save author');
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditingAuthor(null);
    setFormData({ name: '', email: '', bio: '', profile_image_url: '', social_links: {} });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Authors</h2>
          <p className="text-gray-600">Manage blog authors and contributors</p>
        </div>
        <button
          onClick={() => setIsEditing(true)}
          className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Author</span>
        </button>
      </div>

      {/* Author Form */}
      {isEditing && (
        <div className="bg-gray-50 p-6 rounded-lg border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingAuthor ? 'Edit Author' : 'Create New Author'}
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
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Author's biography..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile Image
              </label>
              <div className="space-y-4">
                {formData.profile_image_url && (
                  <div className="relative w-24 h-24 rounded-full overflow-hidden">
                    <Image
                      src={formData.profile_image_url}
                      alt="Profile"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                {uploadingImage && (
                  <p className="text-sm text-gray-500">Uploading image...</p>
                )}
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
                disabled={uploadingImage}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {editingAuthor ? 'Update Author' : 'Create Author'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Authors List */}
      <div className="grid gap-4">
        {authors.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No authors found.</p>
          </div>
        ) : (
          authors.map((author) => (
            <div key={author.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-100">
                    {author.profile_image_url ? (
                      <Image
                        src={author.profile_image_url}
                        alt={author.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <span className="text-xl font-semibold">
                          {author.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg">{author.name}</h3>
                    {author.email && (
                      <p className="text-sm text-gray-500 mb-2">{author.email}</p>
                    )}
                    {author.bio && (
                      <p className="text-sm text-gray-600 line-clamp-3">{author.bio}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(author)}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Edit author"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(author.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete author"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
