import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

export const revalidate = 0;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const fallbackTools = [
  { id: '1', slug: 'jasper-ai', category: 'Marketing', name: 'Jasper AI', description: 'The ultimate AI writing assistant for enterprise marketing teams. Generate blog posts, ads, and emails 10x faster.', affiliate_link: 'https://jasper.ai' },
  { id: '2', slug: 'elevenlabs', category: 'Audio', name: 'ElevenLabs', description: 'State-of-the-art AI voice generator. Create incredibly realistic text-to-speech for videos, podcasts, and audiobooks.', affiliate_link: 'https://elevenlabs.io' },
  { id: '3', slug: 'notion-ai', category: 'Productivity', name: 'Notion AI', description: 'Your connected workspace enhanced with AI. Automate meeting notes, summarize documents, and write better instantly.', affiliate_link: 'https://notion.so' },
  { id: '4', slug: 'synthesia', category: 'Video', name: 'Synthesia', description: 'Create professional AI videos from text in 120+ languages. No cameras, microphones, or actors required.', affiliate_link: 'https://synthesia.io' },
  { id: '5', slug: 'midjourney', category: 'Design', name: 'Midjourney', description: 'The industry-leading AI image generation model. Create breathtaking artwork and hyper-realistic photos from simple text prompts.', affiliate_link: 'https://midjourney.com' },
  { id: '6', slug: 'grammarlygo', category: 'Productivity', name: 'GrammarlyGO', description: 'On-demand AI communication assistance. Compose, rewrite, ideate, and reply effortlessly across all your apps.', affiliate_link: 'https://grammarly.com' },
];

export default async function ToolPage({ params }: { params: { slug: string } }) {
  // 1. Try to find in database by exact slug
  const { data: tools } = await supabase
    .from('tools')
    .select('*')
    .eq('slug', params.slug)
    .limit(1);

  let tool = tools?.[0];

  // 2. If not found by slug, maybe it's an older DB entry missing a slug?
  // We fetch all and find it by formatting the name
  if (!tool) {
    const { data: allTools } = await supabase.from('tools').select('*');
    if (allTools) {
      tool = allTools.find(t => t.name.toLowerCase().replace(/\s+/g, '-') === params.slug);
    }
  }

  // 3. Try to find in fallback tools
  if (!tool) {
    tool = fallbackTools.find(t => t.slug === params.slug);
  }

  if (!tool) {
    return (
      <main className="container">
        <h1>Tool not found</h1>
        <Link href="/" style={{ color: 'var(--accent)' }}>&larr; Back to Directory</Link>
      </main>
    );
  }

  return (
    <main className="container">
      <div style={{ marginBottom: '2rem' }}>
        <Link href="/" style={{ color: 'var(--accent)', textDecoration: 'none' }}>&larr; Back to Directory</Link>
      </div>
      
      <article className="tool-detail">
        <span style={{ 
          display: 'inline-block',
          background: 'var(--accent)', 
          color: '#fff', 
          padding: '4px 12px', 
          borderRadius: '20px', 
          fontSize: '0.9rem',
          marginBottom: '1rem',
          fontWeight: 'bold'
        }}>
          {tool.category || 'AI Tool'}
        </span>
        
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem', background: 'linear-gradient(45deg, #fff, #888)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          {tool.name}
        </h1>
        
        <div style={{ padding: '2rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', marginBottom: '2rem' }}>
          <p style={{ fontSize: '1.2rem', lineHeight: '1.8', color: '#ccc' }}>
            {tool.description}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <a 
            href={tool.affiliate_link} 
            target="_blank" 
            rel="noopener noreferrer" 
            style={{
              display: 'inline-block',
              background: 'linear-gradient(45deg, var(--accent), #10b981)',
              color: 'var(--bg)',
              padding: '16px 32px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 'bold',
              fontSize: '1.1rem',
              transition: 'transform 0.2s ease',
            }}
          >
            Try {tool.name} Now
          </a>
        </div>
      </article>
    </main>
  );
}
