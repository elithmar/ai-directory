import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { Metadata } from 'next';

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
  };
}

// Ultra-lightweight markdown parser for safe, internal AI content
function parseMarkdownToHTML(markdown: string) {
  let html = markdown;
  
  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
  
  // Bold
  html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
  
  // Links
  html = html.replace(/\[(.*?)\]\((.*?)\)/gim, "<a href='$2' target='_blank' rel='noopener noreferrer' style='color: var(--accent);'>$1</a>");
  
  // Lists
  html = html.replace(/^\* (.*$)/gim, '<li>$1</li>');
  html = html.replace(/^- (.*$)/gim, '<li>$1</li>');
  html = html.replace(/(<li>[\s\S]*<\/li>)/gi, '<ul style="margin-bottom: 1.5rem; padding-left: 1.5rem; color: #ccc; line-height: 1.8;">$1</ul>');
  
  // Paragraphs (Lines that don't start with a tag)
  html = html.split('\n').map(line => {
    line = line.trim();
    if (line.length > 0 && !line.startsWith('<')) {
      return `<p style="margin-bottom: 1.5rem; color: #ccc; line-height: 1.8; font-size: 1.1rem;">${line}</p>`;
    }
    return line;
  }).join('\n');

  return html;
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
        <Link href="/guides" style={{ color: 'var(--accent)' }}>&larr; Back to Guides</Link>
      </main>
    );
  }

  const htmlContent = parseMarkdownToHTML(guide.content || '');

  return (
    <main className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '3rem' }}>
        <Link href="/guides" style={{ color: 'var(--accent)', textDecoration: 'none' }}>&larr; Back to Guides</Link>
      </div>
      
      <article>
        <header style={{ marginBottom: '4rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '3.5rem', marginBottom: '1.5rem', lineHeight: '1.2', letterSpacing: '-1px' }}>
            {guide.title}
          </h1>
          <div style={{ color: '#888', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Published on {new Date(guide.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </header>
        
        {/* Render the markdown as HTML */}
        <div 
          className="markdown-content" 
          style={{ paddingBottom: '5rem' }}
          dangerouslySetInnerHTML={{ __html: htmlContent }} 
        />
        
      </article>
    </main>
  );
}
