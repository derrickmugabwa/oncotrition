'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BlogPostsTab from './BlogPostsTab';
import CategoriesTab from './CategoriesTab';
import AuthorsTab from './AuthorsTab';
import TagsTab from './TagsTab';

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

interface BlogManagementProps {
  posts: BlogPost[];
  categories: Category[];
  authors: Author[];
  tags: Tag[];
}

export default function BlogManagement({ posts, categories, authors, tags }: BlogManagementProps) {
  const [activeTab, setActiveTab] = useState('posts');

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="posts" className="flex items-center space-x-2">
            <span>Posts</span>
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              {posts.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center space-x-2">
            <span>Categories</span>
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
              {categories.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="authors" className="flex items-center space-x-2">
            <span>Authors</span>
            <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
              {authors.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="tags" className="flex items-center space-x-2">
            <span>Tags</span>
            <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
              {tags.length}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="mt-6">
          <BlogPostsTab 
            posts={posts} 
            categories={categories} 
            authors={authors}
            tags={tags}
          />
        </TabsContent>

        <TabsContent value="categories" className="mt-6">
          <CategoriesTab categories={categories} />
        </TabsContent>

        <TabsContent value="authors" className="mt-6">
          <AuthorsTab authors={authors} />
        </TabsContent>

        <TabsContent value="tags" className="mt-6">
          <TagsTab tags={tags} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
