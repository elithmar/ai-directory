import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { Metadata } from 'next';
import ShareButtons from '../../components/ShareButtons';
import TableOfContents from '../../components/TableOfContents';

export const revalidate = 0;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { data: guides } = await supabase
    .from('guides')
    .select('title, content')
    .eq('slug', params.slug)
    .limit(1);

  let guide = guides?.[0];

  if (!guide) {
    return {
      title: 'Guide Not Found | Curated AI List',
    };
  }

  // Generate a short description from the first 150 chars of content
  const desc = (guide.content || '').substring(0, 150).replace(/#|\*/g, '').trim() + '...';

  return {
    title: `${guide.title} | Curated AI List`,
    description: desc,
    openGraph: {
      title: guide.title,
      description: desc,
      url: `https://curatedailist.com/guides/${params.slug}`,
      type: 'article',
      siteName: 'Curated AI List',
      images: [
        {
          url: '/opengraph-image.jpg',
          width: 1200,
          height: 630,
          alt: guide.title,
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: guide.title,
      description: desc,
      images: ['/twitter-image.jpg'],
    }
  };
}

// Ultra-lightweight markdown parser for safe, internal AI content
function parseMarkdownToHTML(markdown: string) {
  let html = markdown;
  let toc: { id: string, title: string, level: number }[] = [];
  
  // Headers
  html = html.replace(/^### (.*$)/gim, (match, title) => {
    const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    toc.push({ id, title, level: 3 });
    return `<h3 id="${id}" style="margin-top: 2.5rem; margin-bottom: 1rem; color: #fff; font-size: 1.4rem; scroll-margin-top: 100px;">${title}</h3>`;
  });
  html = html.replace(/^## (.*$)/gim, (match, title) => {
    const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    toc.push({ id, title, level: 2 });
    return `<h2 id="${id}" style="margin-top: 3.5rem; margin-bottom: 1.5rem; color: #fff; font-size: 1.8rem; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.5rem; scroll-margin-top: 100px;">${title}</h2>`;
  });
  html = html.replace(/^# (.*$)/gim, '<h1 style="margin-top: 3rem; margin-bottom: 1.5rem;">$1</h1>');
  
  // Bold and Emphasis (AI often uses single asterisk for tool names)
  html = html.replace(/\*\*(.*?)\*\*/gim, '<strong style="color: #fff; font-weight: 600;">$1</strong>');
  html = html.replace(/\*([^\*]+?)\*/gim, '<strong style="color: #fff; font-weight: 500;">$1</strong>');
  
  // Links
  html = html.replace(/\[(.*?)\]\((.*?)\)/gim, "<a href='$2' target='_blank' rel='noopener noreferrer' style='color: var(--accent);'>$1</a>");
  
  // Lists
  html = html.replace(/^\* (.*$)/gim, '<li style="margin-bottom: 1.2rem; color: #cbd5e1; font-size: 1.15rem; font-weight: 300; line-height: 1.8;">$1</li>');
  html = html.replace(/^- (.*$)/gim, '<li style="margin-bottom: 1.2rem; color: #cbd5e1; font-size: 1.15rem; font-weight: 300; line-height: 1.8;">$1</li>');
  html = html.replace(/(<li style=[\s\S]*<\/li>)/gi, '<ul style="margin-bottom: 2rem; padding-left: 1.5rem;">$1</ul>');
  
  // Paragraphs (Lines that don't start with a tag)
  html = html.split('\n').map(line => {
    line = line.trim();
    if (line.length > 0 && !line.startsWith('<')) {
      return `<p style="margin-bottom: 1.75rem; color: #cbd5e1; line-height: 2; font-size: 1.15rem; font-weight: 300;">${line}</p>`;
    }
    return line;
  }).join('\n');

  return { html, toc };
}

export default async function GuidePage({ params }: { params: { slug: string } }) {
  const { data: guides } = await supabase
    .from('guides')
    .select('*')
    .eq('slug', params.slug)
    .limit(1);

  let guide = guides?.[0];

  if (!guide) {
    return (
      <main className="container">
        <h1>Guide not found</h1>
        <Link href="/" style={{ color: 'var(--accent)' }}>&larr; Back to Directory</Link>
      </main>
    );
  }

  const { html: htmlContent, toc } = parseMarkdownToHTML(guide.content || '');

  // Fetch 3 recent tools for Internal Linking
  const { data: recentTools } = await supabase
    .from('tools')
    .select('id, name, slug, description, category')
    .order('created_at', { ascending: false })
    .limit(3);

  const relatedTools = recentTools || [];

  return (
    <main className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '3rem' }}>
        <Link href="/" style={{ color: 'var(--accent)', textDecoration: 'none' }}>&larr; Back to Directory</Link>
      </div>
      
      <article>
        <header style={{ marginBottom: '4rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h1 style={{ fontSize: '3.5rem', marginBottom: '1.5rem', lineHeight: '1.2', letterSpacing: '-1px' }}>
            {guide.title}
          </h1>
          <div style={{ color: '#888', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1.5rem' }}>
            Published on {new Date(guide.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          <ShareButtons url={`https://curatedailist.com/guides/${guide.slug}`} title={guide.title} />
        </header>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '4rem', alignItems: 'start' }}>
          {/* Floating Table of Contents */}
          <TableOfContents toc={toc} />

          {/* Render the markdown as HTML */}
          <div>
            <div 
              className="markdown-content" 
              style={{ paddingBottom: '3rem' }}
              dangerouslySetInnerHTML={{ __html: htmlContent }} 
            />

            <div style={{ textAlign: 'right', fontStyle: 'italic', color: 'var(--primary)', fontWeight: '500', fontSize: '1.1rem', marginTop: '1rem' }}>
              — The Curated AI List Team
            </div>

            {/* Editorial Methodology & Sources */}
            <div style={{ 
              marginTop: '4rem',
              padding: '2rem', 
              background: 'var(--surface)', 
              borderTop: '2px solid var(--border)',
              fontSize: '0.95rem',
              color: '#94a3b8',
              borderRadius: '16px'
            }}>
              <h4 style={{ color: '#fff', marginBottom: '1rem', fontSize: '1.1rem' }}>Editorial Methodology & Sources</h4>
              <p style={{ marginBottom: '0.5rem' }}>
                At <strong>Curated AI List</strong>, we pride ourselves on being the most reliable destination for AI software discovery. 
                To bring you the most accurate and up-to-date information, our editorial team leverages advanced AI algorithms to aggregate 
                data directly from official software documentation, verified user reviews, and live market testing.
              </p>
              <p>
                While we utilize technology to process information at scale, every guide is rigorously curated and structured 
                to ensure 100% reliability, objectivity, and value for our readers.
              </p>
            </div>
          </div>
        </div>

        {/* Related Tools for Internal Linking (SEO) */}
        {relatedTools.length > 0 && (
          <div style={{ marginTop: '5rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '3rem' }}>
            <h3 style={{ fontSize: '2rem', marginBottom: '2rem', textAlign: 'center' }}>Trending AI Tools</h3>
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
              {relatedTools.map((tool) => (
                <Link 
                  key={tool.id} 
                  href={`/tool/${tool.slug || tool.name.toLowerCase().replace(/\\s+/g, '-')}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '1.5rem', cursor: 'pointer', transition: 'transform 0.2s' }}>
                    {tool.category && (
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
                        {tool.category}
                      </span>
                    )}
                    <h4 style={{ fontSize: '1.25rem', marginTop: '0.5rem', marginBottom: '0.5rem' }}>{tool.name}</h4>
                    <p style={{ fontSize: '0.9rem', color: '#888', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{tool.description}</p>
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
