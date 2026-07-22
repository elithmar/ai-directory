import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import SearchAndFilter from './components/SearchAndFilter';
import ToolGrid from './components/ToolGrid';

export const revalidate = 0;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function Home({ searchParams }: { searchParams: { q?: string; category?: string } }) {
  let query = supabase.from('tools').select('*').order('created_at', { ascending: false });

  if (searchParams.q) {
    query = query.or(`name.ilike.%${searchParams.q}%,description.ilike.%${searchParams.q}%,category.ilike.%${searchParams.q}%`);
  }
  if (searchParams.category) {
    query = query.eq('category', searchParams.category);
  }

  // Límite reducido a 6 para que la página no sea tan larga
  query = query.limit(6);

  const { data: dbTools } = await query;

  const tools = dbTools || [];
  const featuredTool = tools[0];

  return (
    <main className="container">
      <section className="hero">
        <h1 className="hero-h1">Automate your workflow.<br/>Save 20 hours a week.</h1>
        <p className="hero-p">Discover the ultimate directory of high-leverage AI tools, curated programmatically.</p>
        

        {/* Interactive Search & Filter Client Component */}
        <SearchAndFilter tools={dbTools || []} initialQuery={searchParams.q} initialCategory={searchParams.category} />
      </section>

      {/* Featured Section */}
      {!searchParams.q && !searchParams.category && featuredTool && (
        <section style={{ marginBottom: '4rem' }}>
          <div style={{ padding: '3rem 2rem', background: 'linear-gradient(135deg, rgba(62, 172, 252, 0.1), rgba(255,255,255,0.02))', borderRadius: '24px', border: '1px solid rgba(62, 172, 252, 0.3)', display: 'grid', gridTemplateColumns: '1fr', gap: '2rem', alignItems: 'center' }} className="featured-grid">
            <div style={{ textAlign: 'left' }}>
              <span style={{ background: 'var(--accent)', color: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '1.5rem', display: 'inline-block', letterSpacing: '1px', textTransform: 'uppercase' }}>Featured Tool</span>
              <h2 style={{ fontSize: '3rem', marginBottom: '1rem', fontWeight: '800', letterSpacing: '-1px', lineHeight: '1.2' }}>{featuredTool.name}</h2>
              <p style={{ fontSize: '1.2rem', color: '#cbd5e1', marginBottom: '2rem', lineHeight: '1.6', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{featuredTool.description}</p>
              <Link 
                href={`/tool/${featuredTool.slug || featuredTool.name.toLowerCase().replace(/\\s+/g, '-')}`}
                style={{ display: 'inline-block', padding: '14px 32px', background: '#fff', color: '#000', borderRadius: '50px', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.1rem', transition: 'all 0.3s ease', boxShadow: '0 4px 20px rgba(255,255,255,0.3)' }}
                className="btn-hover"
              >
                Read Full Review &rarr;
              </Link>
            </div>
            <div className="featured-visual" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
               <div style={{ width: '250px', height: '250px', background: 'radial-gradient(circle, rgba(74, 222, 128, 0.3) 0%, transparent 70%)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '6rem', borderRadius: '50%', animation: 'pulseGlow 3s infinite alternate' }}>
                  🚀
               </div>
            </div>
          </div>
        </section>
      )}

      {/* Grid with Load More Pagination */}
      <ToolGrid 
        initialTools={searchParams.q || searchParams.category ? tools : tools.slice(1)} 
        searchQuery={searchParams.q} 
        categoryQuery={searchParams.category} 
      />
    </main>
  );
}
// Trigger rebuild for daily guides cron
