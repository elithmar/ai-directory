import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function GET(request: Request) {
  // Security check for Vercel Cron
  if (
    process.env.NODE_ENV === 'production' &&
    request.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
      You are an expert SEO copywriter and AI strategist for a website called "Curated AI List".
      Write a highly engaging, long-form SEO guide (around 500-800 words) about a trending topic in Artificial Intelligence (e.g., "Top 10 AI Tools for Marketing in 2026", or "How to automate your small business with AI").
      
      Format the response strictly as a JSON object with no markdown formatting or extra text, using these exact keys:
      - "title": A catchy, SEO-optimized title for the guide.
      - "slug": A URL-friendly slug (e.g., top-10-ai-marketing-tools-2026).
      - "content": The full body of the article written in Markdown format (use ## for subheaders, * for bullet points). Ensure the content is deep, valuable, and well-structured.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean JSON parsing
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const data = JSON.parse(cleanedText);

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

    return NextResponse.json({ success: true, guide: data.title });
  } catch (error: any) {
    console.error('Error generating guide:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
