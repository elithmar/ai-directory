import { createClient } from '@supabase/supabase-js';

export const revalidate = 0;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function Home() {
  const { data: dbTools } = await supabase
    .from('tools')
    .select('*')
    .order('created_at', { ascending: false });

  // Fallback data so the site never looks empty to affiliate managers
  const fallbackTools = [
    { id: '1', name: 'Jasper AI', description: 'The ultimate AI writing assistant for enterprise marketing teams. Generate blog posts, ads, and emails 10x faster.', affiliate_link: 'https://jasper.ai' },
    { id: '2', name: 'ElevenLabs', description: 'State-of-the-art AI voice generator. Create incredibly realistic text-to-speech for videos, podcasts, and audiobooks.', affiliate_link: 'https://elevenlabs.io' },
    { id: '3', name: 'Notion AI', description: 'Your connected workspace enhanced with AI. Automate meeting notes, summarize documents, and write better instantly.', affiliate_link: 'https://notion.so' },
    { id: '4', name: 'Synthesia', description: 'Create professional AI videos from text in 120+ languages. No cameras, microphones, or actors required.', affiliate_link: 'https://synthesia.io' },
    { id: '5', name: 'Midjourney', description: 'The industry-leading AI image generation model. Create breathtaking artwork and hyper-realistic photos from simple text prompts.', affiliate_link: 'https://midjourney.com' },
    { id: '6', name: 'GrammarlyGO', description: 'On-demand AI communication assistance. Compose, rewrite, ideate, and reply effortlessly across all your apps.', affiliate_link: 'https://grammarly.com' },
  ];

  const tools = dbTools && dbTools.length > 0 ? [...dbTools, ...fallbackTools] : fallbackTools;

  return (
    <main className="container">
      <section className="hero">
        <h1>Automated AI Directory</h1>
        <p>Discover the latest high-leverage AI tools. Curated programmatically.</p>
      </section>

      <div className="grid">
        {tools.map((tool) => (
          <article key={tool.id} className="card">
            <h2 className="card-title">{tool.name}</h2>
            <p className="card-description">{tool.description}</p>
            <a href={tool.affiliate_link} target="_blank" rel="noopener noreferrer" className="card-link">
              Try It Now
            </a>
          </article>
        ))}
      </div>
    </main>
  );
}
