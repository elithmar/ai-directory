import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: Request) {
  // Security check for Vercel Cron
  if (
    process.env.NODE_ENV === 'production' &&
    request.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY || '';
    
    // 1. Fetch available models to find one that works for her specific key
    const modelsRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const modelsData = await modelsRes.json();
    
    if (!modelsRes.ok) {
        throw new Error(`Failed to list models: ${JSON.stringify(modelsData)}`);
    }

    // Find the first model that supports generateContent
    let selectedModel = 'models/gemini-1.5-flash';
    if (modelsData.models && modelsData.models.length > 0) {
        const supportedModels = modelsData.models.filter((m: any) => 
            m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent')
        );
        
        const flashModel = supportedModels.find((m: any) => m.name.includes('gemini-1.5-flash'));
        const proModel = supportedModels.find((m: any) => m.name.includes('gemini-pro'));
        
        selectedModel = flashModel?.name || proModel?.name || supportedModels[0]?.name || 'models/gemini-1.5-flash';
    }

    const prompt = `
      You are an expert SEO copywriter and AI strategist for a website called "Curated AI List".
      Write a highly engaging, long-form SEO guide (around 500-800 words) about a trending topic in Artificial Intelligence (e.g., "Top 10 AI Tools for Marketing in 2026", or "How to automate your small business with AI").
      
      Format the response strictly as a JSON object with no markdown formatting or extra text, using these exact keys:
      - "title": A catchy, SEO-optimized title for the guide.
      - "slug": A URL-friendly slug (e.g., top-10-ai-marketing-tools-2026).
      - "content": The full body of the article written in Markdown format (use ## for subheaders, * for bullet points). Ensure the content is deep, valuable, and well-structured.
    `;

    // 2. Generate content using raw fetch to avoid any SDK version issues
    const generateRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/${selectedModel}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.7 }
        })
    });
    
    const generateData = await generateRes.json();
    
    if (!generateRes.ok) {
        throw new Error(`Generation failed with model ${selectedModel}: ${JSON.stringify(generateData)}`);
    }

    const text = generateData.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Clean JSON parsing
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    let data;
    try {
        data = JSON.parse(cleanedText);
    } catch (e) {
        throw new Error(`Failed to parse AI response as JSON: ${cleanedText}`);
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

    return NextResponse.json({ success: true, guide: data.title, modelUsed: selectedModel });
  } catch (error: any) {
    console.error('Error generating guide:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
