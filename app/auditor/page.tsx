'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const TRADITIONAL_TOOLS = [
  { id: 'salesforce', name: 'Salesforce', category: 'Sales', icon: '☁️' },
  { id: 'zendesk', name: 'Zendesk', category: 'Support', icon: '🎧' },
  { id: 'jira', name: 'Jira', category: 'Development', icon: '🎫' },
  { id: 'photoshop', name: 'Photoshop', category: 'Design', icon: '🎨' },
  { id: 'hubspot', name: 'HubSpot', category: 'Marketing', icon: '🎯' },
  { id: 'excel', name: 'Excel / Sheets', category: 'Productivity', icon: '📊' },
  { id: 'premiere', name: 'Premiere Pro', category: 'Video', icon: '🎬' },
  { id: 'audacity', name: 'Audacity', category: 'Audio', icon: '🎙️' },
];

export default function AuditorPage() {
  const [stage, setStage] = useState<'select' | 'scan' | 'email' | 'results'>('select');
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState(0);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [scanProgress, setScanProgress] = useState(0);

  const toggleTool = (id: string) => {
    setSelectedTools(prev => 
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const startScan = () => {
    if (selectedTools.length === 0) return;
    setStage('scan');
    
    // Calculate a dynamic score based on selected tools
    const calculatedScore = Math.max(15, 100 - (selectedTools.length * 15) + Math.floor(Math.random() * 10));
    setScore(calculatedScore);

    // Fake scanning animation
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setScanProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => setStage('email'), 500);
      }
    }, 100);
  };

  const submitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);

    try {
      // 1. Save Lead to Supabase (Ignore errors if table doesn't exist yet for demo)
      await supabase.from('leads').insert([{ email, source: 'auditor', score }]).catch(() => console.log('Leads table not ready'));

      // 2. Fetch 3 AI tools to recommend
      const selectedCategories = TRADITIONAL_TOOLS.filter(t => selectedTools.includes(t.id)).map(t => t.category);
      
      const { data: tools } = await supabase
        .from('tools')
        .select('*')
        .in('category', selectedCategories.length > 0 ? selectedCategories : ['Productivity'])
        .limit(3);

      if (tools && tools.length > 0) {
        setRecommendations(tools);
      } else {
        // Fallback if no matching tools
        const { data: fallback } = await supabase.from('tools').select('*').limit(3);
        setRecommendations(fallback || []);
      }
      
      setStage('results');
    } catch (error) {
      console.error(error);
      setStage('results'); // Show results anyway
    } finally {
      setLoading(false);
    }
  };

  const shareText = `My company's AI Readiness Score is just ${score}/100! 🤯\n\nI just ran the free AI Stack Auditor and found 3 AI tools to replace my outdated software and save 15h a week.\n\nCheck your score here:`;
  const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=https://curatedailist.com/auditor`;

  return (
    <main className="container" style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 1rem' }}>
      
      <div style={{ maxWidth: '800px', width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '3rem', position: 'relative', overflow: 'hidden' }}>
        
        {/* STAGE 1: SELECT */}
        {stage === 'select' && (
          <div style={{ textAlign: 'center', animation: 'fadeIn 0.5s ease' }}>
            <span style={{ color: 'var(--accent)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.8rem' }}>Free Audit</span>
            <h1 style={{ fontSize: '3rem', marginBottom: '1rem', marginTop: '1rem' }}>The AI Stack Auditor</h1>
            <p style={{ fontSize: '1.2rem', color: '#888', marginBottom: '3rem' }}>Select the traditional software your team currently relies on.</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem', marginBottom: '3rem' }}>
              {TRADITIONAL_TOOLS.map(tool => {
                const isSelected = selectedTools.includes(tool.id);
                return (
                  <div 
                    key={tool.id}
                    onClick={() => toggleTool(tool.id)}
                    style={{ 
                      background: isSelected ? 'rgba(16, 185, 129, 0.2)' : 'rgba(0,0,0,0.3)',
                      border: `1px solid ${isSelected ? '#10b981' : 'rgba(255,255,255,0.1)'}`,
                      padding: '1.5rem 1rem',
                      borderRadius: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                    }}
                  >
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{tool.icon}</div>
                    <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: isSelected ? '#fff' : '#aaa' }}>{tool.name}</div>
                  </div>
                );
              })}
            </div>

            <button 
              onClick={startScan}
              disabled={selectedTools.length === 0}
              style={{
                background: selectedTools.length > 0 ? 'linear-gradient(45deg, var(--accent), #10b981)' : 'rgba(255,255,255,0.1)',
                color: selectedTools.length > 0 ? '#fff' : '#666',
                padding: '1rem 3rem',
                border: 'none',
                borderRadius: '50px',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                cursor: selectedTools.length > 0 ? 'pointer' : 'not-allowed',
                transition: 'all 0.3s ease'
              }}
            >
              Analyze My Stack &rarr;
            </button>
          </div>
        )}

        {/* STAGE 2: SCANNING */}
        {stage === 'scan' && (
          <div style={{ textAlign: 'center', padding: '4rem 0', animation: 'fadeIn 0.5s ease' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Scanning for Inefficiencies...</h2>
            <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${scanProgress}%`, height: '100%', background: 'linear-gradient(90deg, var(--accent), #10b981)', transition: 'width 0.1s linear' }} />
            </div>
            <p style={{ marginTop: '2rem', color: '#888', fontFamily: 'monospace' }}>
              {scanProgress < 30 ? 'Analyzing current workflows...' : scanProgress < 70 ? 'Identifying legacy software bottlenecks...' : 'Calculating AI Readiness Score...'}
            </p>
          </div>
        )}

        {/* STAGE 3: EMAIL GATE */}
        {stage === 'email' && (
          <div style={{ textAlign: 'center', animation: 'fadeIn 0.5s ease' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', border: '2px solid rgba(239, 68, 68, 0.5)', color: '#ef4444', fontSize: '3rem', fontWeight: 'bold', margin: '0 auto 2rem auto' }}>
              {score}
            </div>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Dangerously Low AI Score</h2>
            <p style={{ fontSize: '1.2rem', color: '#aaa', marginBottom: '2rem' }}>
              Based on your stack, your team is likely wasting <strong>15-20 hours a week</strong> on manual tasks that AI can automate right now.
            </p>
            
            <div style={{ background: 'rgba(0,0,0,0.4)', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <h3 style={{ marginBottom: '1.5rem', fontSize: '1.3rem' }}>Unlock Your Free Automation Report</h3>
              <p style={{ color: '#888', marginBottom: '2rem', fontSize: '0.9rem' }}>We found 3 specific AI tools that can instantly replace your legacy software. Enter your email to view your personalized results.</p>
              
              <form onSubmit={submitEmail} style={{ display: 'flex', gap: '1rem', maxWidth: '400px', margin: '0 auto' }}>
                <input 
                  type="email" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter your work email" 
                  required
                  style={{ flex: 1, padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '1rem' }}
                />
                <button 
                  type="submit"
                  disabled={loading}
                  style={{ background: 'var(--accent)', color: '#fff', padding: '0 1.5rem', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  {loading ? '...' : 'Unlock'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* STAGE 4: RESULTS */}
        {stage === 'results' && (
          <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', padding: '4px 12px', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 'bold' }}>Report Unlocked</span>
              <h2 style={{ fontSize: '2.5rem', marginTop: '1rem', marginBottom: '1rem' }}>Your Missing AI Tools</h2>
              <p style={{ color: '#888', fontSize: '1.1rem' }}>Integrate these into your workflow this week to automate your legacy tasks.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '3rem' }}>
              {recommendations.map(tool => (
                <Link key={tool.id} href={`/tool/${tool.slug}`} style={{ textDecoration: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', transition: 'transform 0.2s ease' }} className="tool-card-hover">
                    <div style={{ width: '60px', height: '60px', borderRadius: '12px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>✨</div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: '1.3rem', color: '#fff', marginBottom: '0.2rem' }}>{tool.name}</h4>
                      <p style={{ color: '#aaa', fontSize: '0.9rem' }}>{tool.description?.substring(0, 80)}...</p>
                    </div>
                    <div style={{ color: 'var(--accent)', fontSize: '1.5rem' }}>&rarr;</div>
                  </div>
                </Link>
              ))}
            </div>

            <div style={{ textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '3rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>Share your AI Readiness Score</h3>
              <a 
                href={shareUrl}
                target="_blank"
                rel="noreferrer"
                style={{ display: 'inline-block', background: '#1DA1F2', color: '#fff', textDecoration: 'none', padding: '1rem 2rem', borderRadius: '50px', fontWeight: 'bold' }}
              >
                🐦 Share on Twitter
              </a>
            </div>
          </div>
        )}

      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .tool-card-hover:hover {
          transform: translateX(10px) !important;
          border-color: var(--accent) !important;
        }
      `}} />
    </main>
  );
}
