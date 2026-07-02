import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { Metadata } from 'next';

export const revalidate = 0;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export const metadata: Metadata = {
  title: 'AI Guides & Tutorials | Curated AI List',
  description: 'Learn how to leverage Artificial Intelligence for your business with our deep-dive guides.',
};

export default async function GuidesPage() {
  const { data: guides } = await supabase
    .from('guides')
    .select('id, title, slug, created_at')
    .order('created_at', { ascending: false });

  return (
    <main className="container">
      <section className="hero" style={{ paddingBottom: '2rem' }}>
        <h1 style={{ fontSize: '4rem', marginBottom: '1rem' }}>AI Guides &amp; Tutorials</h1>
        <p style={{ fontSize: '1.2rem', color: '#aaa', maxWidth: '600px', margin: '0 auto' }}>
          Deep-dive strategies and tutorials to help you maximize your productivity using the latest Artificial Intelligence tools.
        </p>
      </section>
      
      <div className="grid">
        {guides && guides.length > 0 ? (
          guides.map((guide) => (
            <Link key={guide.id} href={`/guides/${guide.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <article className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '2rem', transition: 'transform 0.2s', cursor: 'pointer' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', lineHeight: '1.4' }}>{guide.title}</h2>
                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#888', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--accent)' }}>Read Guide &rarr;</span>
                  <span>{new Date(guide.created_at).toLocaleDateString()}</span>
                </div>
              </article>
            </Link>
          ))
        ) : (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', background: 'rgba(255,255,255,0.03)', borderRadius: '16px' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Guides are being written...</h3>
            <p style={{ color: '#888' }}>Our AI is currently researching and writing the first deep-dive tutorials. Check back soon!</p>
          </div>
        )}
      </div>
    </main>
  );
}
