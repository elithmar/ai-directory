import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export const revalidate = 3600;

export default async function Home() {
  const { data: tools } = await supabase
    .from('tools')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <main className="container">
      <section className="hero">
        <h1>Automated AI Directory</h1>
        <p>Discover the latest high-leverage AI tools. Curated programmatically.</p>
        <p>Impact-Site-Verification: a13883f9-8ed7-47ef-8888-daa25a189851</p>
      </section>

      <div className="grid">
        {tools?.map((tool) => (
          <article key={tool.id} className="card">
            <h2 className="card-title">{tool.name}</h2>
            <p className="card-description">{tool.description}</p>
            <a href={tool.affiliate_link} target="_blank" rel="noopener noreferrer" className="card-link">
              Try It Now
            </a>
          </article>
        ))}
        {(!tools || tools.length === 0) && (
          <p style={{textAlign: "center", gridColumn: "1 / -1", color: "var(--text-muted)"}}>
            No tools indexed yet. The automated engine will populate this soon.
          </p>
        )}
      </div>
    </main>
  );
}
