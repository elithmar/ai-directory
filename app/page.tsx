import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import SearchAndFilter from './components/SearchAndFilter';

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

  const tools = dbTools || [];
  const featuredTool = tools[0];

  return (
    <main className="container">
      <section className="hero">
        <h1>Curated AI List</h1>
        <p>Discover the latest high-leverage AI tools. Curated programmatically.</p>
        
        {/* Interactive Search & Filter Client Component */}
        <SearchAndFilter tools={dbTools || []} initialQuery={searchParams.q} initialCategory={searchParams.category} />
      </section>

      {/* Featured Section */}
      {!searchParams.q && !searchParams.category && featuredTool && (
        <section style={{ marginBottom: '4rem' }}>
          <div style={{ padding: '2rem 1.5rem', background: 'linear-gradient(135deg, rgba(62, 172, 252, 0.1), rgba(255,255,255,0.02))', borderRadius: '20px', border: '1px solid rgba(62, 172, 252, 0.3)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <span style={{ background: 'var(--accent)', color: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '1rem', letterSpacing: '1px', textTransform: 'uppercase' }}>Featured Tool</span>
            <h2 style={{ fontSize: '2.2rem', marginBottom: '1rem', fontWeight: '800', letterSpacing: '-0.5px' }}>{featuredTool.name}</h2>
            <p style={{ fontSize: '1.1rem', color: '#cbd5e1', marginBottom: '1.5rem', maxWidth: '700px', lineHeight: '1.6', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{featuredTool.description}</p>
            <Link 
              href={`/tool/${featuredTool.slug || featuredTool.name.toLowerCase().replace(/\\s+/g, '-')}`}
              style={{ padding: '12px 28px', background: '#fff', color: '#000', borderRadius: '24px', textDecoration: 'none', fontWeight: 'bold', fontSize: '1rem', transition: 'transform 0.2s ease', boxShadow: '0 4px 14px rgba(255,255,255,0.25)' }}
            >
              Read Full Review &rarr;
            </Link>
          </div>
        </section>
      )}

      {/* Grid */}
      <div className="grid">
        {(searchParams.q || searchParams.category ? tools : tools.slice(1)).map((tool) => (
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
