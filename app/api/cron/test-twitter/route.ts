import { NextResponse } from 'next/server';
import { TwitterApi } from 'twitter-api-v2';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { TWITTER_API_KEY, TWITTER_API_SECRET, TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_SECRET } = process.env;
    
    if (!TWITTER_API_KEY || !TWITTER_ACCESS_TOKEN) {
         return NextResponse.json({ error: 'Twitter API keys are missing in Vercel environment variables' }, { status: 500 });
    }

    const client = new TwitterApi({
      appKey: TWITTER_API_KEY,
      appSecret: TWITTER_API_SECRET,
      accessToken: TWITTER_ACCESS_TOKEN,
      accessSecret: TWITTER_ACCESS_SECRET,
    });

    const rwClient = client.readWrite;

    // Test 1: Can we read? (Needs Read permission)
    const me = await rwClient.v2.me();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Las llaves SÍ funcionan para leer (Read). Si el Cron de publicar falla con 401, significa 100% que tus tokens nacieron con permisos de SOLO LECTURA y DEBES regenerarlos.',
      user: me.data 
    });

  } catch (error: any) {
    return NextResponse.json({ 
      error: 'Fallo total de las llaves. Ni siquiera pueden leer.', 
      details: error.message 
    }, { status: 500 });
  }
}
