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

import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { data: tools } = await supabase
    .from('tools')
    .select('name, description')
    .eq('slug', params.slug)
    .limit(1);

  let tool = tools?.[0];

  if (!tool) {
    const { data: allTools } = await supabase.from('tools').select('name, description');
    if (allTools) {
      tool = allTools.find(t => t.name.toLowerCase().replace(/\s+/g, '-') === params.slug);
    }
  }

  if (!tool) {
    tool = fallbackTools.find(t => t.slug === params.slug);
  }

  if (!tool) {
    return {
      title: 'Tool Not Found | Curated AI List',
    };
  }

  return {
    title: `${tool.name} Review 2026 - Pros, Cons & Pricing | Curated AI List`,
    description: tool.description,
  };
}

export default async function ToolPage({ params }: { params: { slug: string } }) {
  const { data: tools } = await supabase
    .from('tools')
    .select('*')
    .eq('slug', params.slug)
    .limit(1);

  let tool = tools?.[0];

  if (!tool) {
    const { data: allTools } = await supabase.from('tools').select('*');
    if (allTools) {
      tool = allTools.find(t => t.name.toLowerCase().replace(/\s+/g, '-') === params.slug);
    }
  }

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

  const review = tool.review_data || null;

  // Fetch related tools in the same category
  const { data: relatedToolsDb } = await supabase
    .from('tools')
    .select('id, name, slug, description, category')
    .eq('category', tool.category)
    .neq('slug', tool.slug)
    .limit(3);

  const relatedTools = relatedToolsDb || [];

  const getCategoryIcon = (category: string) => {
    const map: Record<string, string> = {
      'Marketing': '✍️',
      'Video': '🎥',
      'Audio': '🎵',
      'Productivity': '⚡️',
      'Design': '🎨',
      'Development': '💻',
      'Sales': '📈',
      'Support': '🤝'
    };
    return map[category] || '✨';
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": tool.name,
    "operatingSystem": "Web",
    "applicationCategory": tool.category,
    "offers": {
      "@type": "Offer",
      "price": review?.pricing?.includes('Free') ? "0.00" : "9.99",
      "priceCurrency": "USD"
    },
    "description": tool.description,
    "url": `https://www.curatedailist.com/tool/${tool.slug}`
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [{
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://www.curatedailist.com/"
    },{
      "@type": "ListItem",
      "position": 2,
      "name": tool.category || "Tools",
      "item": `https://www.curatedailist.com/?category=${tool.category || ''}`
    },{
      "@type": "ListItem",
      "position": 3,
      "name": tool.name
    }]
  };

  return (
    <main className="container">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      
      <nav className="breadcrumb-nav" aria-label="breadcrumb">
        <ol style={{ listStyle: 'none', padding: 0, display: 'flex', gap: '0.5rem', color: '#888' }}>
          <li><Link href="/" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Home</Link></li>
          <li>/</li>
          <li><Link href={`/?category=${tool.category || ''}`} style={{ color: '#ccc', textDecoration: 'none' }}>{tool.category || 'Tools'}</Link></li>
          <li>/</li>
          <li style={{ color: '#fff' }} aria-current="page">{tool.name}</li>
        </ol>
      </nav>
      
      <article className="tool-detail">
        <header style={{ marginBottom: '3rem' }}>
          <span style={{ 
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'var(--accent)', 
            color: '#fff', 
            padding: '6px 16px', 
            borderRadius: '20px', 
            fontSize: '0.9rem',
            marginBottom: '1rem',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            <span style={{ fontSize: '1.1rem' }}>{getCategoryIcon(tool.category)}</span> {tool.category || 'AI Tool'}
          </span>
          
          <h1 style={{ fontSize: '4rem', marginBottom: '1.5rem', background: 'linear-gradient(45deg, #fff, #aaa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-1px' }}>
            {tool.name} Review
          </h1>
          
          <p style={{ fontSize: '1.4rem', lineHeight: '1.8', color: '#ddd', maxWidth: '800px' }}>
            {tool.description}
          </p>
        </header>
        
        {/* Deep Review Section */}
        {review && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
            
            {/* Features */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '2rem', borderRadius: '16px' }}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#fff' }}>✨ Key Features</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {review.features?.map((feat: string, i: number) => (
                  <li key={i} style={{ marginBottom: '1rem', color: '#bbb', paddingLeft: '1.5rem', position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 0, color: 'var(--accent)' }}>•</span>
                    {feat}
                  </li>
                ))}
              </ul>
            </div>

            {/* Pros & Cons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '2rem', borderRadius: '16px' }}>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#10b981' }}>👍 Pros</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {review.pros?.map((pro: string, i: number) => (
                    <li key={i} style={{ marginBottom: '0.8rem', color: '#bbb' }}>✓ {pro}</li>
                  ))}
                </ul>
              </div>

              <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '2rem', borderRadius: '16px' }}>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#ef4444' }}>👎 Cons</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {review.cons?.map((con: string, i: number) => (
                    <li key={i} style={{ marginBottom: '0.8rem', color: '#bbb' }}>✕ {con}</li>
                  ))}
                </ul>
              </div>
            </div>
            
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', padding: '2rem', background: 'rgba(0,0,0,0.3)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div>
            <span style={{ display: 'block', fontSize: '0.9rem', color: '#888', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Pricing</span>
            <strong style={{ fontSize: '1.5rem', color: '#fff' }}>{review?.pricing || 'Visit website for pricing'}</strong>
          </div>
          <a 
            href={tool.affiliate_link} 
            target="_blank" 
            rel="noopener noreferrer" 
            style={{
              display: 'inline-block',
              background: 'linear-gradient(45deg, var(--accent), #10b981)',
              color: 'var(--bg)',
              padding: '20px 40px',
              borderRadius: '12px',
              textDecoration: 'none',
              fontWeight: 'bold',
              fontSize: '1.2rem',
              transition: 'transform 0.2s ease',
              marginLeft: 'auto'
            }}
          >
            Go to {tool.name} &rarr;
          </a>
        </div>

        {/* Related Tools for Internal Linking (SEO) */}
        {relatedTools.length > 0 && (
          <div style={{ marginTop: '5rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '3rem' }}>
            <h3 style={{ fontSize: '2rem', marginBottom: '2rem', textAlign: 'center' }}>Related {tool.category} Tools</h3>
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
              {relatedTools.map((rt) => (
                <Link 
                  key={rt.id} 
                  href={`/tool/${rt.slug || rt.name.toLowerCase().replace(/\\s+/g, '-')}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '1.5rem', cursor: 'pointer', transition: 'transform 0.2s' }}>
                    <span style={{ 
                      fontSize: '0.75rem', 
                      textTransform: 'uppercase', 
                      color: 'var(--accent)', 
                      fontWeight: 'bold', 
                      letterSpacing: '1px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: 'rgba(255,255,255,0.05)',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      width: 'fit-content'
                    }}>
                      {rt.category}
                    </span>
                    <h4 style={{ fontSize: '1.25rem', marginTop: '0.5rem', marginBottom: '0.5rem' }}>{rt.name}</h4>
                    <p style={{ fontSize: '0.9rem', color: '#888', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{rt.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
    </main>
  );
}
