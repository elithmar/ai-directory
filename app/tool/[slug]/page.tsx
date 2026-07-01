import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

export const revalidate = 0;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function ToolPage({ params }: { params: { slug: string } }) {
  // Query tool by slug
  const { data: tools } = await supabase
    .from('tools')
    .select('*')
    .eq('slug', params.slug)
    .limit(1);

  const tool = tools?.[0];

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
