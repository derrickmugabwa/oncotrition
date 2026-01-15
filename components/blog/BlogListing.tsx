'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import { Clock } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image_url: string | null;
  published_at: string | null;
  reading_time: number | null;
  is_featured: boolean | null;
  blog_authors: {
    id: string;
    name: string;
    profile_image_url: string | null;
  } | null;
  blog_categories: {
    id: string;
    name: string;
    slug: string;
    color: string | null;
  } | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  color: string | null;
}

interface BlogListingProps {
  featuredPosts: BlogPost[];
  recentPosts: BlogPost[];
  categories: Category[];
}

export default function BlogListing({ featuredPosts, recentPosts, categories }: BlogListingProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredPosts = selectedCategory === 'all' 
    ? recentPosts 
    : recentPosts.filter(post => post.blog_categories?.slug === selectedCategory);

  return (
    <div className="min-h-screen py-4 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Category Filter */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-3 justify-center mb-8">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-5 py-2 rounded-lg font-medium transition-all duration-300 ${
                selectedCategory === 'all'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
              }`}
            >
              All Posts
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.slug)}
                className={`px-5 py-2 rounded-lg font-medium transition-all duration-300 ${
                  selectedCategory === category.slug
                    ? 'text-white shadow-md'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                }`}
                style={{
                  backgroundColor: selectedCategory === category.slug ? (category.color ?? '#6366F1') : undefined
                }}
              >
                {category.name}
              </button>
            ))}
          </div>
        )}

        {/* Posts Grid */}
        {filteredPosts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 dark:text-gray-400 text-lg">No posts found in this category.</p>
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-8">
            {filteredPosts.map((post) => (
              <article
                key={post.id}
                className="max-w-sm w-full hover:-translate-y-1 transition-transform duration-300"
              >
                <Link href={`/blog/${post.slug}`}>
                  <div className="relative h-48 w-full rounded-xl overflow-hidden mb-3">
                    <Image
                      src={post.featured_image_url || '/images/blog-placeholder.jpg'}
                      alt={post.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-3 left-3">
                      <span 
                        className="px-3 py-1 text-xs font-medium text-white rounded-full"
                        style={{ backgroundColor: post.blog_categories?.color || '#6366F1' }}
                      >
                        {post.blog_categories?.name}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-base text-slate-900 dark:text-white font-medium mb-2 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
                    {post.excerpt ?? 'No excerpt available'}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span>{format(new Date(post.published_at ?? new Date()), 'MMM dd, yyyy')}</span>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{post.reading_time ?? 5} min read</span>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
