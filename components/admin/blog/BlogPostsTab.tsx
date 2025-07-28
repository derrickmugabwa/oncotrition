'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Plus, Edit, Trash2, Eye, Calendar, Clock, User } from 'lucide-react';
import { format } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';
import toast from 'react-hot-toast';
import BlogPostEditor from './BlogPostEditor';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image_url: string;
  gallery_images: string[];
  status: string;
  published_at: string;
  reading_time: number;
  view_count: number;
  is_featured: boolean;
  blog_authors: {
    id: string;
    name: string;
    profile_image_url: string;
  };
  blog_categories: {
    id: string;
    name: string;
    slug: string;
    color: string;
  };
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
}

interface Author {
  id: string;
  name: string;
  email: string;
  bio: string;
  profile_image_url: string;
  social_links: any;
}

interface Tag {
  id: string;
  name: string;
  slug: string;
  color: string;
}

interface BlogPostsTabProps {
  posts: BlogPost[];
  categories: Category[];
  authors: Author[];
  tags: Tag[];
}

export default function BlogPostsTab({ posts, categories, authors, tags }: BlogPostsTabProps) {
  const [filteredPosts, setFilteredPosts] = useState(posts);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const supabase = createClientComponentClient();

  // Filter posts based on status and search query
  const handleFilter = (status: string, query: string) => {
    let filtered = posts;
    
    if (status !== 'all') {
      filtered = filtered.filter(post => post.status === status);
    }
    
    if (query) {
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(query.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    setFilteredPosts(filtered);
  };

  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
    handleFilter(status, searchQuery);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    handleFilter(statusFilter, query);
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      toast.success('Post deleted successfully');
      window.location.reload();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      published: 'bg-green-100 text-green-800',
      draft: 'bg-yellow-100 text-yellow-800',
      archived: 'bg-gray-100 text-gray-800',
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusStyles[status as keyof typeof statusStyles]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Blog Posts</h2>
          <p className="text-gray-600">Manage your blog content</p>
        </div>
        <button
          onClick={() => {
            setSelectedPost(null);
            setIsEditorOpen(true);
          }}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Post</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex space-x-2">
          {['all', 'published', 'draft', 'archived'].map((status) => (
            <button
              key={status}
              onClick={() => handleStatusChange(status)}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                statusFilter === status
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search posts..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Posts Grid */}
      <div className="grid gap-6">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No posts found.</p>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <div key={post.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Featured Image */}
                <div className="lg:w-48 h-32 relative rounded-lg overflow-hidden bg-gray-100">
                  {post.featured_image_url ? (
                    <Image
                      src={post.featured_image_url}
                      alt={post.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(post.status)}
                      {post.is_featured && (
                        <span className="bg-purple-100 text-purple-800 px-2 py-1 text-xs font-medium rounded-full">
                          Featured
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {post.status === 'published' && (
                        <Link
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                          title="View post"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          setSelectedPost(post);
                          setIsEditorOpen(true);
                        }}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Edit post"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete post"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {post.title}
                  </h3>

                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {post.excerpt}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <User className="w-4 h-4" />
                      <span>{post.blog_authors?.name}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {post.published_at 
                          ? format(new Date(post.published_at), 'MMM dd, yyyy')
                          : 'Not published'
                        }
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{post.reading_time} min read</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Eye className="w-4 h-4" />
                      <span>{post.view_count} views</span>
                    </div>
                    {post.blog_categories && (
                      <span 
                        className="px-2 py-1 text-xs font-medium text-white rounded-full"
                        style={{ backgroundColor: post.blog_categories.color }}
                      >
                        {post.blog_categories.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Blog Post Editor Modal */}
      {isEditorOpen && (
        <BlogPostEditor
          post={selectedPost}
          categories={categories}
          authors={authors}
          tags={tags}
          onClose={() => {
            setIsEditorOpen(false);
            setSelectedPost(null);
          }}
          onSave={() => {
            setIsEditorOpen(false);
            setSelectedPost(null);
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}
