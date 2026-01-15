'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Clock, User, Eye, ArrowLeft, Share2, Bookmark } from 'lucide-react';
import { format } from 'date-fns';
import ImageGallery from './ImageGallery';
import RelatedPosts from './RelatedPosts';
import SocialShare from './SocialShare';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image_url: string;
  gallery_images: string[];
  published_at: string;
  reading_time: number;
  view_count: number;
  blog_authors: {
    id: string;
    name: string;
    bio: string;
    profile_image_url: string;
    social_links: any;
  };
  blog_categories: {
    id: string;
    name: string;
    slug: string;
    color: string;
  };
}

interface Tag {
  id: string;
  name: string;
  slug: string;
  color: string;
}

interface RelatedPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featured_image_url: string;
  published_at: string;
  reading_time: number;
  blog_authors: {
    name: string;
    profile_image_url: string;
  };
  blog_categories: {
    name: string;
    color: string;
  };
}

interface BlogPostProps {
  post: BlogPost;
  tags: Tag[];
  relatedPosts: RelatedPost[];
}

export default function BlogPost({ post, tags, relatedPosts }: BlogPostProps) {
  const galleryImages = post.gallery_images && post.gallery_images.length > 0 
    ? post.gallery_images 
    : post.featured_image_url 
    ? [post.featured_image_url] 
    : [];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        duration: 0.6
      }
    }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  };

  return (
    <motion.article 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen"
    >
      {/* Back Button */}
      <motion.div 
        variants={itemVariants}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8"
      >
        <Link 
          href="/blog"
          className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Blog</span>
        </Link>
      </motion.div>

      {/* Image Gallery */}
      {galleryImages.length > 0 && (
        <motion.div 
          variants={itemVariants}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        >
          <ImageGallery images={galleryImages} title={post.title} />
        </motion.div>
      )}

      {/* Article Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Article Header */}
        <motion.header variants={itemVariants} className="mb-12">
          {/* Category Badge */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <span 
              className="inline-block px-4 py-2 text-sm font-semibold text-white rounded-full"
              style={{ backgroundColor: post.blog_categories?.color || '#3B82F6' }}
            >
              {post.blog_categories?.name}
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1 
            variants={itemVariants}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight"
          >
            {post.title}
          </motion.h1>

          {/* Excerpt */}
          {post.excerpt && (
            <motion.p 
              variants={itemVariants}
              className="text-lg text-gray-600 mb-6 leading-relaxed"
            >
              {post.excerpt}
            </motion.p>
          )}

          {/* Meta Information */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-wrap items-center gap-6 text-gray-500 mb-8"
          >
            <div className="flex items-center space-x-3">
              <Image
                src={post.blog_authors?.profile_image_url || '/images/default-avatar.jpg'}
                alt={post.blog_authors?.name}
                width={48}
                height={48}
                className="rounded-full"
              />
              <div>
                <p className="font-semibold text-gray-900">{post.blog_authors?.name}</p>
                <p className="text-sm">Author</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{format(new Date(post.published_at), 'MMMM dd, yyyy')}</span>
            </div>
            
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{post.reading_time} min read</span>
            </div>
            
            <div className="flex items-center space-x-1">
              <Eye className="w-4 h-4" />
              <span>{post.view_count} views</span>
            </div>
          </motion.div>

          {/* Tags */}
          {tags.length > 0 && (
            <motion.div 
              variants={itemVariants}
              className="flex flex-wrap gap-2 mb-8"
            >
              {tags.map((tag) => (
                <span
                  key={tag.id}
                  className="px-3 py-1 text-sm font-medium text-white rounded-full"
                  style={{ backgroundColor: tag.color }}
                >
                  #{tag.name}
                </span>
              ))}
            </motion.div>
          )}

          {/* Social Share */}
          <motion.div variants={itemVariants}>
            <SocialShare 
              url={`${process.env.NEXT_PUBLIC_SITE_URL}/blog/${post.slug}`}
              title={post.title}
              description={post.excerpt}
            />
          </motion.div>
        </motion.header>

        {/* Article Content */}
        <motion.div 
          variants={itemVariants}
          className="prose prose-base prose-blue max-w-none mb-12"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Author Bio */}
        <motion.section 
          variants={itemVariants}
          className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mb-12"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-4">About the Author</h3>
          <div className="flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-6">
            <Image
              src={post.blog_authors?.profile_image_url || '/images/default-avatar.jpg'}
              alt={post.blog_authors?.name}
              width={80}
              height={80}
              className="rounded-full"
            />
            <div className="flex-1">
              <h4 className="text-xl font-semibold text-gray-900 mb-2">
                {post.blog_authors?.name}
              </h4>
              <p className="text-gray-600 leading-relaxed">
                {post.blog_authors?.bio}
              </p>
              {post.blog_authors?.social_links && (
                <div className="flex space-x-4 mt-4">
                  {/* Add social media links here based on social_links data */}
                </div>
              )}
            </div>
          </div>
        </motion.section>
      </div>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <motion.section 
          variants={itemVariants}
          className="bg-gray-50 py-16"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <RelatedPosts posts={relatedPosts} />
          </div>
        </motion.section>
      )}
    </motion.article>
  );
}
