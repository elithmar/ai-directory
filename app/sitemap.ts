import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://curatedailist.com';

  // 1. Static Pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    }
  ];

  // 2. Dynamic Tool Pages (from DB)
  const { data: tools } = await supabase.from('tools').select('slug, created_at');
  
  const dynamicPages: MetadataRoute.Sitemap = (tools || [])
    .filter(t => t.slug) // Avoid null slugs
    .map((tool) => ({
      url: `${baseUrl}/tool/${tool.slug}`,
      lastModified: new Date(tool.created_at || new Date()),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

  // 3. Fallback tools
  const fallbackTools = [
    'jasper-ai', 'elevenlabs', 'notion-ai', 'synthesia', 'midjourney', 'grammarlygo'
  ];
  
  const fallbackPages: MetadataRoute.Sitemap = fallbackTools.map(slug => ({
    url: `${baseUrl}/tool/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticPages, ...dynamicPages, ...fallbackPages];
}
