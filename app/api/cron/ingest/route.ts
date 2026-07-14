import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const authHeader = request.headers.get('authorization');
  
  // Permitir prueba manual con ?test=true
  if (url.searchParams.get('test') !== 'true' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const groqApiKey = process.env.GROQ_API_KEY;

    if (!supabaseUrl || !supabaseKey || !groqApiKey) {
        throw new Error("Missing configuration (Supabase or Groq)");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Obtener herramientas existentes para no duplicar
    const { data: existingTools } = await supabase.from('tools').select('name');
    const existingNames = existingTools ? existingTools.map((t: any) => t.name).join(', ') : '';

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

    const categories = ['Video', 'Audio', 'Marketing', 'Productivity', 'Design'];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];

    const prompt = `
      You are an expert AI curator for a B2B SaaS directory.
      We already have these tools in our database: ${existingNames || 'None'}.
      
      Suggest ONE high-quality, real AI tool that is NOT in the list above, specifically in the **${randomCategory}** category.
      Provide the response strictly as a JSON object with no markdown formatting or extra text, using these exact keys:
      {
        "name": "The official name of the tool",
        "slug": "url-friendly-slug",
        "category": "${randomCategory}",
        "description": "2-sentence SEO-optimized description",
        "affiliate_link": "URL",
        "review_data": {
          "features": ["feature 1", "feature 2", "feature 3"],
          "pros": ["pro 1", "pro 2", "pro 3"],
          "cons": ["con 1", "con 2"],
          "pricing": "pricing summary"
        }
      }
    `;

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
    
    let newTool;
    try {
        newTool = JSON.parse(text);
    } catch (e) {
        throw new Error(`Failed to parse AI response as JSON: ${text}`);
    }

    // 4. Guardar en la base de datos
    const { error } = await supabase.from('tools').insert([newTool]);
    if (error) throw error;

    return NextResponse.json({ success: true, inserted: newTool, modelUsed: selectedModel });
  } catch (error: any) {
    console.error("Cron Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
