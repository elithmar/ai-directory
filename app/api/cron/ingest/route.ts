import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const authHeader = request.headers.get('authorization');
  
  // Permitir prueba manual con ?test=true
  if (url.searchParams.get('test') !== 'true' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    if (!supabaseUrl || !supabaseKey || !geminiKey) {
        throw new Error("Missing configuration (Supabase or Gemini)");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Obtener herramientas existentes para no duplicar
    const { data: existingTools } = await supabase.from('tools').select('name');
    const existingNames = existingTools ? existingTools.map((t: any) => t.name).join(', ') : '';

    // 2. Conectar con Gemini
    const genAI = new GoogleGenerativeAI(geminiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      You are an expert AI curator for a B2B SaaS directory.
      We already have these tools in our database: ${existingNames || 'None'}.
      
      Suggest ONE high-quality, real AI tool that is NOT in the list above.
      Provide the response strictly as a JSON object with no markdown formatting or extra text, using these exact keys:
      - "name": The official name of the tool.
      - "slug": A URL-friendly version of the name (e.g., "heygen", "jasper-ai").
      - "category": A single category word (e.g., "Video", "Text", "Audio", "Marketing", "Productivity", "Design").
      - "description": A compelling, 2-sentence SEO-optimized description explaining the core value proposition.
      - "affiliate_link": The direct URL to their official website (e.g., https://example.com).
      - "review_data": A nested JSON object containing:
          - "features": Array of 3 strings detailing key features.
          - "pros": Array of 3 strings.
          - "cons": Array of 2 strings.
          - "pricing": A short string summarizing pricing (e.g. "Freemium, starts at $15/mo").
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();
    
    // Limpiar si Gemini devuelve markdown (```json ... ```)
    const jsonString = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const newTool = JSON.parse(jsonString);

    // 3. Guardar en la base de datos
    const { error } = await supabase.from('tools').insert([newTool]);
    if (error) throw error;

    return NextResponse.json({ success: true, inserted: newTool });
  } catch (error: any) {
    console.error("Cron Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
