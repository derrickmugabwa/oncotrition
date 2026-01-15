import { createClient } from '@/utils/supabase/server';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BlogPost from '@/components/blog/BlogPost';

interface Tag {
  id: string;
  name: string;
  slug: string;
  color: string;
}

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('blog_posts')
    .select('title, excerpt, meta_title, meta_description, featured_image_url')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error || !data) {
    return {
      title: 'Post Not Found - Oncotrition',
    };
  }

  const post = data as any;

  return {
    title: post.meta_title || `${post.title} - Oncotrition Blog`,
    description: post.meta_description || post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt || '',
      images: post.featured_image_url ? [post.featured_image_url] : [],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt || '',
      images: post.featured_image_url ? [post.featured_image_url] : [],
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  // Fetch the blog post with all related data
  const { data } = await supabase
    .from('blog_posts')
    .select(`
      *,
      blog_authors (
        id,
        name,
        bio,
        profile_image_url,
        social_links
      ),
      blog_categories (
        id,
        name,
        slug,
        color
      )
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (!data) {
    notFound();
  }

  const post = data as any;

  // Fetch tags for this post
  const { data: postTags } = await supabase
    .from('blog_post_tags')
    .select(`
      blog_tags (
        id,
        name,
        slug,
        color
      )
    `)
    .eq('post_id', post.id);

  // Fetch related posts (same category, excluding current post)
  const { data: relatedPostsData } = await supabase
    .from('blog_posts')
    .select(`
      id,
      title,
      slug,
      excerpt,
      featured_image_url,
      published_at,
      reading_time,
      blog_authors (
        name,
        profile_image_url
      ),
      blog_categories (
        name,
        color
      )
    `)
    .eq('status', 'published')
    .eq('category_id', post.category_id)
    .neq('id', post.id)
    .order('published_at', { ascending: false })
    .limit(3);

  const relatedPosts = (relatedPostsData || []) as any[];

  // Update view count
  // TODO: Fix TypeScript error with Supabase types
  // await supabase
  //   .from('blog_posts')
  //   .update({ view_count: (post.view_count || 0) + 1 })
  //   .eq('id', post.id);

  const tags = (postTags?.map((pt: any) => pt.blog_tags).filter(Boolean) || []) as unknown as Tag[];

  // Transform relatedPosts to match expected type structure
  const transformedRelatedPosts = relatedPosts?.map((post: any) => ({
    ...post,
    blog_authors: Array.isArray(post.blog_authors) ? post.blog_authors[0] : post.blog_authors,
    blog_categories: Array.isArray(post.blog_categories) ? post.blog_categories[0] : post.blog_categories
  })) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 pt-16">
      <BlogPost 
        post={post}
        tags={tags}
        relatedPosts={transformedRelatedPosts}
      />
    </div>
  );
}
