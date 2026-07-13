import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // Security check for Vercel Cron
  if (
    process.env.NODE_ENV === 'production' &&
    request.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const groqApiKey = process.env.GROQ_API_KEY;
    
    if (!groqApiKey) {
        return NextResponse.json({ error: 'GROQ_API_KEY is not set in Vercel environment variables' }, { status: 500 });
    }

    // 1. Obtener títulos existentes para no duplicar temas
    const { data: existingGuides } = await supabase.from('guides').select('title').order('created_at', { ascending: false }).limit(20);
    const existingTitles = existingGuides ? existingGuides.map((g: any) => g.title).join('\\n- ') : 'None';

      const prompt = `
      You are an expert SEO copywriter and AI strategist for a website called "Curated AI List".
      Write a highly engaging, long-form SEO guide (around 500-800 words) about a trending topic in Artificial Intelligence.
      CRITICAL INSTRUCTION 1: Make the content highly didactic, dynamic, and practical. For every tool or concept you mention, you MUST include a specific, real-world example of how it is used practically by businesses or individuals. Do not just describe what a tool does; explain *how* it is used in a specific scenario.
      CRITICAL INSTRUCTION 2: Under NO circumstances should you mention traditional software or web 2.0 tools that merely have AI features bolted on (e.g., Google Analytics, Microsoft Excel, Canva, traditional CRMs). You MUST exclusively recommend 100% native, pure-blood AI tools (e.g., Midjourney, Jasper, ElevenLabs, ChatGPT, Claude, etc.).
      CRITICAL INSTRUCTION 3: You MUST choose a completely unique topic and title. Explore diverse niches like AI for Healthcare, AI for Finance, Generative Video, AI for Coding, AI for Graphic Design, etc. DO NOT start your title with the word "Revolutionizing".
      
      Here are the guides we have already published. DO NOT write about these topics or use similar titles:
      - ${existingTitles}

      Format the response strictly as a JSON object with no markdown formatting or extra text, using these exact keys:
      {
        "title": "A catchy, SEO-optimized title for the guide",
        "slug": "a-url-friendly-slug",
        "content": "The full body of the article written in Markdown format (use ## for subheaders, * for bullet points)."
      }
    `;

    // 2. Fetch available models from Groq
    const modelsRes = await fetch('https://api.groq.com/openai/v1/models', {
        headers: { 'Authorization': `Bearer ${groqApiKey}` }
    });
    const modelsData = await modelsRes.json();
    
    let selectedModel = 'llama3-70b-8192'; // fallback
    if (modelsRes.ok && modelsData.data) {
        // Find the best available Llama model (preferring 70b or larger)
        const availableModels = modelsData.data.map((m: any) => m.id);
        const bestModel = availableModels.find((m: string) => m.includes('70b') && !m.includes('tool-use')) 
            || availableModels.find((m: string) => m.includes('llama'))
            || availableModels[0];
        if (bestModel) {
            selectedModel = bestModel;
        }
    }

    // 3. Generate content using Groq API
    const generateRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${groqApiKey}`
        },
        body: JSON.stringify({
            model: selectedModel,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            response_format: { type: 'json_object' }
        })
    });
    
    const generateData = await generateRes.json();
    
    if (!generateRes.ok) {
        throw new Error(`Groq generation failed: ${JSON.stringify(generateData)}`);
    }

    const text = generateData.choices?.[0]?.message?.content || '';
    
    let data;
    try {
        data = JSON.parse(text);
    } catch (e) {
        throw new Error(`Failed to parse AI response as JSON: ${text}`);
    }

    // Insert into Supabase
    const { error } = await supabase
      .from('guides')
      .insert([
        {
          title: data.title,
          slug: data.slug,
          content: data.content,
        }
      ]);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, guide: data.title, modelUsed: 'llama3-70b' });
  } catch (error: any) {
    console.error('Error generating guide:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
