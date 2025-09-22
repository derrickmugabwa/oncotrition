import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Metadata } from 'next';
import BlogListing from '@/components/blog/BlogListing';

export const metadata: Metadata = {
  title: 'Blog - Oncotrition',
  description: 'Discover expert nutrition tips, healthy recipes, and wellness advice from our team of nutrition professionals.',
  keywords: 'nutrition blog, healthy recipes, cancer care nutrition, wellness tips, meal planning',
};

export default async function BlogPage() {
  const supabase = createServerComponentClient({ cookies });

  // Fetch featured posts
  const { data: featuredPosts } = await supabase
    .from('blog_posts')
    .select(`
      *,
      blog_authors (
        id,
        name,
        profile_image_url
      ),
      blog_categories (
        id,
        name,
        slug,
        color
      )
    `)
    .eq('status', 'published')
    .eq('is_featured', true)
    .order('published_at', { ascending: false })
    .limit(3);

  // Fetch recent posts
  const { data: recentPosts } = await supabase
    .from('blog_posts')
    .select(`
      *,
      blog_authors (
        id,
        name,
        profile_image_url
      ),
      blog_categories (
        id,
        name,
        slug,
        color
      )
    `)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(12);

  // Fetch categories
  const { data: categories } = await supabase
    .from('blog_categories')
    .select('*')
    .order('name');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 pt-20 font-poppins">
      <BlogListing 
        featuredPosts={featuredPosts || []}
        recentPosts={recentPosts || []}
        categories={categories || []}
      />
    </div>
  );
}
