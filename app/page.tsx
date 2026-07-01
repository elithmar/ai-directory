import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export const revalidate = 0;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function Home({ searchParams }: { searchParams: { q?: string; category?: string } }) {
  let query = supabase.from('tools').select('*').order('created_at', { ascending: false });

  if (searchParams.q) {
    query = query.ilike('name', `%${searchParams.q}%`);
  }
  if (searchParams.category) {
    query = query.eq('category', searchParams.category);
  }

  // Límite de 12 para la paginación de la Fase 2 (Performance 100/100)
  query = query.limit(12);

  const { data: dbTools } = await query;

  const fallbackTools = [
    { id: '1', slug: 'jasper-ai', category: 'Marketing', name: 'Jasper AI', description: 'The ultimate AI writing assistant for enterprise marketing teams. Generate blog posts, ads, and emails 10x faster.', affiliate_link: 'https://jasper.ai' },
    { id: '2', slug: 'elevenlabs', category: 'Audio', name: 'ElevenLabs', description: 'State-of-the-art AI voice generator. Create incredibly realistic text-to-speech for videos, podcasts, and audiobooks.', affiliate_link: 'https://elevenlabs.io' },
    { id: '3', slug: 'notion-ai', category: 'Productivity', name: 'Notion AI', description: 'Your connected workspace enhanced with AI. Automate meeting notes, summarize documents, and write better instantly.', affiliate_link: 'https://notion.so' },
    { id: '4', slug: 'synthesia', category: 'Video', name: 'Synthesia', description: 'Create professional AI videos from text in 120+ languages. No cameras, microphones, or actors required.', affiliate_link: 'https://synthesia.io' },
    { id: '5', slug: 'midjourney', category: 'Design', name: 'Midjourney', description: 'The industry-leading AI image generation model. Create breathtaking artwork and hyper-realistic photos from simple text prompts.', affiliate_link: 'https://midjourney.com' },
    { id: '6', slug: 'grammarlygo', category: 'Productivity', name: 'GrammarlyGO', description: 'On-demand AI communication assistance. Compose, rewrite, ideate, and reply effortlessly across all your apps.', affiliate_link: 'https://grammarly.com' },
  ];

  const tools = dbTools && dbTools.length > 0 ? dbTools : fallbackTools;
  const featuredTool = tools[0];

  return (
    <main className="container">
      <section className="hero">
        <h1>Automated AI Directory</h1>
        <p>Discover the latest high-leverage AI tools. Curated programmatically.</p>
        
        {/* Simple Search Form */}
        <form style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <input 
            type="text" 
            name="q" 
            placeholder="Search AI tools..." 
            defaultValue={searchParams.q}
            style={{ padding: '12px 24px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', color: '#fff', width: '300px' }}
          />
          <button type="submit" style={{ padding: '12px 24px', borderRadius: '30px', background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
            Search
          </button>
        </form>
        
        {/* Categories */}
        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {['Video', 'Audio', 'Marketing', 'Productivity', 'Design'].map(cat => (
            <Link key={cat} href={`/?category=${cat}`} style={{
              padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem', textDecoration: 'none',
              background: searchParams.category === cat ? 'var(--accent)' : 'rgba(255,255,255,0.1)',
              color: '#fff'
            }}>
              {cat}
            </Link>
          ))}
          {searchParams.category && <Link href="/" style={{ padding: '6px 12px', fontSize: '0.8rem', color: '#888' }}>Clear</Link>}
        </div>
      </section>

      {/* Featured Section */}
      {!searchParams.q && !searchParams.category && featuredTool && (
        <section style={{ marginBottom: '4rem' }}>
          <div style={{ padding: '3rem', background: 'linear-gradient(135deg, rgba(62, 172, 252, 0.1), rgba(255,255,255,0.02))', borderRadius: '24px', border: '1px solid rgba(62, 172, 252, 0.3)', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <span style={{ background: 'var(--accent)', color: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '1rem' }}>Featured Tool of the Day</span>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{featuredTool.name}</h2>
            <p style={{ fontSize: '1.2rem', color: '#aaa', marginBottom: '2rem', maxWidth: '600px' }}>{featuredTool.description}</p>
            <Link 
              href={`/tool/${featuredTool.slug || featuredTool.name.toLowerCase().replace(/\\s+/g, '-')}`}
              style={{ padding: '16px 32px', background: '#fff', color: '#000', borderRadius: '12px', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.1rem' }}
            >
              Read Full Review &rarr;
            </Link>
          </div>
        </section>
      )}

      {/* Grid */}
      <div className="grid">
        {tools.map((tool) => (
          <article key={tool.id || tool.name} className="card">
            {tool.category && <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 'bold', letterSpacing: '1px' }}>{tool.category}</span>}
            <h2 className="card-title" style={{ marginTop: '0.5rem' }}>{tool.name}</h2>
            <p className="card-description">{tool.description}</p>
            <Link 
              href={`/tool/${tool.slug || tool.name.toLowerCase().replace(/\\s+/g, '-')}`} 
              className="card-link"
            >
              View Details
            </Link>
          </article>
        ))}
      </div>
    </main>
  );
}
