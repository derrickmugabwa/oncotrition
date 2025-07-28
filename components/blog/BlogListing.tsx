'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Clock, User, Tag } from 'lucide-react';
import { format } from 'date-fns';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featured_image_url: string;
  published_at: string;
  reading_time: number;
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
  color: string;
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Featured Posts */}
        {featuredPosts.length > 0 && (
          <section className="mb-20">
            <motion.h2 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="text-2xl font-bold text-gray-900 mb-6"
            >
              Featured Articles
            </motion.h2>
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {featuredPosts.map((post, index) => (
                <motion.article
                  key={post.id}
                  variants={itemVariants}
                  className={`group cursor-pointer ${index === 0 ? 'md:col-span-2 lg:col-span-2' : ''}`}
                >
                  <Link href={`/blog/${post.slug}`}>
                    <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
                      <div className="relative h-64 md:h-80 overflow-hidden">
                        <Image
                          src={post.featured_image_url || '/images/blog-placeholder.jpg'}
                          alt={post.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-4 left-4">
                          <span 
                            className="px-3 py-1 text-xs font-semibold text-white rounded-full"
                            style={{ backgroundColor: post.blog_categories?.color || '#3B82F6' }}
                          >
                            {post.blog_categories?.name}
                          </span>
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                          {post.title}
                        </h3>
                        <p className="text-gray-600 mb-3 line-clamp-3 text-sm">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <Image
                                src={post.blog_authors?.profile_image_url || '/images/default-avatar.jpg'}
                                alt={post.blog_authors?.name}
                                width={24}
                                height={24}
                                className="rounded-full"
                              />
                              <span>{post.blog_authors?.name}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>{format(new Date(post.published_at), 'MMM dd, yyyy')}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{post.reading_time} min read</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </motion.div>
          </section>
        )}

        {/* Category Filter */}
        <section className="mb-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-wrap gap-3 justify-center"
          >
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-blue-50 shadow-md'
              }`}
            >
              All Posts
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.slug)}
                className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                  selectedCategory === category.slug
                    ? 'text-white shadow-lg'
                    : 'bg-white text-gray-600 hover:bg-blue-50 shadow-md'
                }`}
                style={{
                  backgroundColor: selectedCategory === category.slug ? category.color : undefined
                }}
              >
                {category.name}
              </button>
            ))}
          </motion.div>
        </section>

        {/* Recent Posts Grid */}
        <section>
          <motion.h2 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-2xl font-bold text-gray-900 mb-6"
          >
            {selectedCategory === 'all' ? 'Latest Articles' : `${categories.find(c => c.slug === selectedCategory)?.name} Articles`}
          </motion.h2>
          
          {filteredPosts.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <p className="text-gray-500 text-lg">No posts found in this category.</p>
            </motion.div>
          ) : (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredPosts.map((post) => (
                <motion.article
                  key={post.id}
                  variants={itemVariants}
                  className="group cursor-pointer"
                >
                  <Link href={`/blog/${post.slug}`}>
                    <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
                      <div className="relative h-48 overflow-hidden">
                        <Image
                          src={post.featured_image_url || '/images/blog-placeholder.jpg'}
                          alt={post.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-4 left-4">
                          <span 
                            className="px-3 py-1 text-xs font-semibold text-white rounded-full"
                            style={{ backgroundColor: post.blog_categories?.color || '#3B82F6' }}
                          >
                            {post.blog_categories?.name}
                          </span>
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="text-base font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-gray-600 mb-3 line-clamp-3 text-sm">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center space-x-2">
                            <Image
                              src={post.blog_authors?.profile_image_url || '/images/default-avatar.jpg'}
                              alt={post.blog_authors?.name}
                              width={20}
                              height={20}
                              className="rounded-full"
                            />
                            <span className="truncate">{post.blog_authors?.name}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{post.reading_time}m</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </motion.div>
          )}
        </section>
      </div>
    </div>
  );
}
