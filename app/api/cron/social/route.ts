import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { TwitterApi } from 'twitter-api-v2';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // Security check for Vercel Cron
  const authHeader = request.headers.get('Authorization');
  const url = new URL(request.url);
  
  if (
    process.env.NODE_ENV === 'production' &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}` &&
    url.searchParams.get('test') !== 'true'
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
        return NextResponse.json({ error: 'GROQ_API_KEY is not set' }, { status: 500 });
    }
    
    const { TWITTER_API_KEY, TWITTER_API_SECRET, TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_SECRET } = process.env;
    if (!TWITTER_API_KEY || !TWITTER_API_SECRET || !TWITTER_ACCESS_TOKEN || !TWITTER_ACCESS_SECRET) {
         return NextResponse.json({ error: 'Twitter API keys are missing in environment variables' }, { status: 500 });
    }

    // 1. Fetch the latest guide from today
    // We fetch the most recent guide to post about.
    const { data: guides, error: guidesError } = await supabase
      .from('guides')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);

    if (guidesError || !guides || guides.length === 0) {
      return NextResponse.json({ error: 'No guides found to tweet about' }, { status: 404 });
    }

    const latestGuide = guides[0];
    const guideUrl = `https://www.curatedailist.com/guides/${latestGuide.slug}`;

    // 2. Generate a Viral Tweet using Groq
    const prompt = `
      You are an expert Social Media Manager and "Tech Bro" influencer on Twitter (X).
      Your job is to write a highly viral, hook-driven tweet to promote a new AI guide we just published.
      
      Guide Title: "${latestGuide.title}"
      Guide Link: ${guideUrl}
      
      CRITICAL INSTRUCTIONS:
      1. DO NOT sound like a corporate robot. Sound like a passionate tech founder building in public.
      2. The opening sentence MUST be a strong hook (e.g., controversial statement, bold claim, or high curiosity).
      3. Keep it under 280 characters total, including the link.
      4. Because this is a new account, you MUST include 2-3 highly targeted hashtags at the very end of the tweet (e.g., #AI #Tech #ArtificialIntelligence) to help the algorithm discover the post.
      5. Include the link exactly as provided.
      
      Format your response STRICTLY as a JSON object with this exact key:
      {
        "tweet": "The full text of the tweet including the link"
      }
    `;

    // 2. Fetch available models from Groq to avoid decommissioned models
    const modelsRes = await fetch('https://api.groq.com/openai/v1/models', {
        headers: { 'Authorization': `Bearer ${groqApiKey}` }
    });
    const modelsData = await modelsRes.json();
    
    let selectedModel = 'llama3-8b-8192'; // extremely safe fallback
    if (modelsRes.ok && modelsData.data) {
        const availableModels = modelsData.data.map((m: any) => m.id);
        const bestModel = availableModels.find((m: string) => m.includes('70b') && !m.includes('tool-use')) 
            || availableModels.find((m: string) => m.includes('llama'))
            || availableModels[0];
        if (bestModel) {
            selectedModel = bestModel;
        }
    }

    // 3. Generate a Viral Tweet using Groq
    const generateRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${groqApiKey}`
        },
        body: JSON.stringify({
            model: selectedModel,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.8,
            response_format: { type: 'json_object' }
        })
    });
    
    if (!generateRes.ok) {
        const errorText = await generateRes.text();
        throw new Error(`Failed to generate tweet with Groq: ${generateRes.status} ${errorText}`);
    }

    const generateData = await generateRes.json();
    const text = generateData.choices?.[0]?.message?.content || '';
    
    let tweetContent = '';
    try {
        const parsed = JSON.parse(text);
        tweetContent = parsed.tweet;
    } catch (e) {
        throw new Error('Failed to parse AI response as JSON');
    }

    // 3. Post to Twitter
    const client = new TwitterApi({
      appKey: TWITTER_API_KEY,
      appSecret: TWITTER_API_SECRET,
      accessToken: TWITTER_ACCESS_TOKEN,
      accessSecret: TWITTER_ACCESS_SECRET,
    });

    // v2 API rwClient
    const rwClient = client.readWrite;
    
    // Post tweet
    const { data: createdTweet } = await rwClient.v2.tweet(tweetContent);

    return NextResponse.json({ success: true, tweet_id: createdTweet.id, text: createdTweet.text });
  } catch (error: any) {
    console.error('Error in social cron:', error);
    return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 });
  }
}
