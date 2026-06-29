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
        <script dangerouslySetInnerHTML={{ __html: `(function(i,m,p,a,c,t){c.ire_o=p;c[p]=c[p]||function(){(c[p].a=c[p].a||[]).push(arguments)};t=a.createElement(m);var z=a.getElementsByTagName(m)[0];t.async=1;t.src=i;z.parentNode.insertBefore(t,z)})('https://utt.impactcdn.com/P-A7444445-5e30-4f16-a164-df4c0ae8131a1.js','script','impactStat',document,window);impactStat('transformLinks');impactStat('trackImpression');` }} />
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
