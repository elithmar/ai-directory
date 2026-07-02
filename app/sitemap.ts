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

  // 2. Dynamic Tool and Guide Pages (from DB)
  const { data: tools } = await supabase.from('tools').select('slug, created_at');
  const { data: guides } = await supabase.from('guides').select('slug, created_at');
  
  const toolPages: MetadataRoute.Sitemap = (tools || [])
    .filter(t => t.slug)
    .map((tool) => ({
      url: `${baseUrl}/tool/${tool.slug}`,
      lastModified: new Date(tool.created_at || new Date()),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

  const guidePages: MetadataRoute.Sitemap = (guides || [])
    .filter(g => g.slug)
    .map((guide) => ({
      url: `${baseUrl}/guides/${guide.slug}`,
      lastModified: new Date(guide.created_at || new Date()),
      changeFrequency: 'monthly',
      priority: 0.7,
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

  return [...staticPages, ...toolPages, ...guidePages, ...fallbackPages];
}
