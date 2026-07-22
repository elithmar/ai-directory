import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { Metadata } from 'next';
import GuideGrid from '../components/GuideGrid';

export const revalidate = 0;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export const metadata: Metadata = {
  title: 'AI Guides & Tutorials | Curated AI List',
  description: 'Learn how to leverage Artificial Intelligence for your business with our deep-dive guides.',
};

export default async function GuidesPage() {
  // Fetch only the first 9 guides initially
  const { data: guides } = await supabase
    .from('guides')
    .select('id, title, slug, created_at')
    .order('created_at', { ascending: false })
    .limit(9);

  return (
    <main className="container">
      <div style={{ marginBottom: '2rem', paddingTop: '2rem' }}>
        <Link href="/" style={{ color: 'var(--accent)', textDecoration: 'none' }}>&larr; Back to Directory</Link>
      </div>
      <section className="hero" style={{ paddingBottom: '3rem', paddingTop: '1rem', textAlign: 'center' }}>
        <span style={{ display: 'inline-block', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold', letterSpacing: '2px', marginBottom: '1rem' }}>KNOWLEDGE BASE</span>
        <h1 style={{ fontSize: '4.5rem', marginBottom: '1rem', fontWeight: '800', background: 'linear-gradient(90deg, #fff, var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-1px' }}>AI Guides &amp; Tutorials</h1>
        <p style={{ fontSize: '1.2rem', color: '#aaa', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
          Deep-dive strategies and tutorials to help you maximize your productivity using the latest Artificial Intelligence tools.
        </p>
      </section>
      
      {/* Client Component that handles Filters and Grid */}
      <GuideGrid initialGuides={guides || []} />
      
    </main>
  );
}
