import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import BlogManagement from '@/components/admin/blog/BlogManagement';

export default async function AdminBlogPage() {
  const supabase = createServerComponentClient({ cookies });

  // Fetch blog posts with related data
  const { data: posts } = await supabase
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
    .order('created_at', { ascending: false });

  // Fetch categories
  const { data: categories } = await supabase
    .from('blog_categories')
    .select('*')
    .order('name');

  // Fetch authors
  const { data: authors } = await supabase
    .from('blog_authors')
    .select('*')
    .order('name');

  // Fetch tags
  const { data: tags } = await supabase
    .from('blog_tags')
    .select('*')
    .order('name');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Blog Management</h1>
        <p className="text-gray-600 mt-2">
          Create and manage blog posts, categories, and authors.
        </p>
      </div>

      <BlogManagement 
        posts={posts || []}
        categories={categories || []}
        authors={authors || []}
        tags={tags || []}
      />
    </div>
  );
}
