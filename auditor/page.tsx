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
  const [consent, setConsent] = useState(false);
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
      const { error: insertError } = await supabase.from('leads').insert([{ email, source: 'auditor', score }]);
      if (insertError) console.log('Leads table not ready or error:', insertError);

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
      
      <div style={{ width: '100%', maxWidth: '800px', marginBottom: '2rem' }}>
        <Link href="/" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 'bold' }}>&larr; Back to Directory</Link>
      </div>

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
                    className="auditor-card"
                    style={{ 
                      background: isSelected ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${isSelected ? '#10b981' : 'rgba(255,255,255,0.05)'}`,
                      padding: '1.5rem 1rem',
                      borderRadius: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                      transform: isSelected ? 'scale(1.05) translateY(-5px)' : 'scale(1)',
                      boxShadow: isSelected ? '0 10px 30px rgba(16, 185, 129, 0.2)' : 'none',
                      backdropFilter: 'blur(10px)'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.border = '1px solid rgba(16, 185, 129, 0.5)';
                        e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.border = '1px solid rgba(255,255,255,0.05)';
                        e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                      }
                    }}
                  >
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.8rem', filter: isSelected ? 'drop-shadow(0 0 10px rgba(16, 185, 129, 0.5))' : 'none', transition: 'all 0.3s' }}>{tool.icon}</div>
                    <div style={{ fontWeight: 'bold', fontSize: '0.95rem', color: isSelected ? '#fff' : '#aaa' }}>{tool.name}</div>
                  </div>
                );
              })}
            </div>

              <button 
                onClick={startScan}
                disabled={selectedTools.length === 0}
                className={selectedTools.length > 0 ? 'btn-hover' : ''}
                style={{
                  background: selectedTools.length > 0 ? 'linear-gradient(90deg, var(--accent), #34d399)' : 'rgba(255,255,255,0.05)',
                  color: selectedTools.length > 0 ? '#000' : '#555',
                  padding: '1.2rem 3.5rem',
                  border: 'none',
                  borderRadius: '50px',
                  fontSize: '1.2rem',
                  fontWeight: '800',
                  cursor: selectedTools.length > 0 ? 'pointer' : 'not-allowed',
                  transition: 'all 0.3s ease',
                  boxShadow: selectedTools.length > 0 ? '0 10px 25px rgba(16, 185, 129, 0.4)' : 'none',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}
              >
              Analyze My Stack &rarr;
            </button>
          </div>
        )}

        {/* STAGE 2: SCANNING */}
        {stage === 'scan' && (
          <div style={{ textAlign: 'center', padding: '6rem 0', animation: 'fadeIn 0.5s ease' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '3rem', fontWeight: '800', background: 'linear-gradient(90deg, #fff, #aaa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Scanning for Inefficiencies...</h2>
            
            <div style={{ width: '100%', height: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden', boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5)', position: 'relative' }}>
              <div style={{ width: `${scanProgress}%`, height: '100%', background: 'linear-gradient(90deg, #10b981, var(--accent), #fff)', transition: 'width 0.1s linear', boxShadow: '0 0 20px rgba(16, 185, 129, 0.8)' }} />
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)', animation: 'shimmer 1.5s infinite' }} />
            </div>
            
            <p style={{ marginTop: '2.5rem', color: 'var(--accent)', fontFamily: 'monospace', fontSize: '1.2rem', letterSpacing: '1px' }}>
              {scanProgress < 30 ? '> Analyzing legacy workflow nodes...' : scanProgress < 70 ? '> Identifying critical automation gaps...' : '> Synthesizing AI Readiness Matrix...'}
            </p>
          </div>
        )}

        {/* STAGE 3: EMAIL GATE */}
        {stage === 'email' && (
          <div style={{ textAlign: 'center', animation: 'fadeIn 0.5s ease' }}>
            <div style={{ 
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', 
              width: '140px', height: '140px', borderRadius: '50%', 
              background: 'rgba(239, 68, 68, 0.05)', border: '2px solid rgba(239, 68, 68, 0.8)', 
              color: '#ef4444', fontSize: '4rem', fontWeight: '900', margin: '0 auto 2.5rem auto',
              boxShadow: '0 0 40px rgba(239, 68, 68, 0.4)',
              animation: 'pulseGlowRed 1.5s infinite alternate'
            }}>
              {score}
            </div>
            <h2 style={{ fontSize: '3rem', marginBottom: '1rem', fontWeight: '800', letterSpacing: '-1px' }}>Dangerously Low AI Score</h2>
            <p style={{ fontSize: '1.3rem', color: '#aaa', marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem auto', lineHeight: '1.6' }}>
              Based on your stack, your team is likely wasting <strong style={{ color: '#ef4444' }}>15-20 hours a week</strong> on manual tasks that AI can automate right now.
            </p>
            
            <div style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.03), transparent)', padding: '3rem 2rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)' }}>
              <h3 style={{ marginBottom: '1rem', fontSize: '1.6rem', fontWeight: '800' }}>Unlock Your Free Automation Report</h3>
              <p style={{ color: '#888', marginBottom: '2.5rem', fontSize: '1.05rem' }}>We found 3 specific AI tools that can instantly replace your legacy software. Enter your work email to view your personalized results.</p>
              
              <form onSubmit={submitEmail} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', maxWidth: '450px', margin: '0 auto' }}>
                <div style={{ display: 'flex', gap: '0.8rem' }}>
                  <input 
                    type="email" 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Enter your work email" 
                    required
                    style={{ flex: 1, padding: '1.2rem 1.5rem', borderRadius: '50px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: '1.05rem', outline: 'none', transition: 'all 0.3s' }}
                    onFocus={(e) => { e.currentTarget.style.border = '1px solid var(--accent)'; e.currentTarget.style.boxShadow = '0 0 15px rgba(16, 185, 129, 0.2)'; }}
                    onBlur={(e) => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.1)'; e.currentTarget.style.boxShadow = 'none'; }}
                  />
                  <button 
                    type="submit"
                    disabled={loading || !consent}
                    className={consent ? 'btn-hover' : ''}
                    style={{ background: consent ? 'linear-gradient(90deg, var(--accent), #34d399)' : 'rgba(255,255,255,0.05)', color: consent ? '#000' : '#555', padding: '0 2.5rem', border: 'none', borderRadius: '50px', fontWeight: '800', fontSize: '1.05rem', cursor: consent ? 'pointer' : 'not-allowed', transition: 'all 0.3s', boxShadow: consent ? '0 5px 15px rgba(16, 185, 129, 0.3)' : 'none' }}
                  >
                    {loading ? '...' : 'Unlock'}
                  </button>
                </div>
                
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.8rem', color: '#888', textAlign: 'left', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={consent}
                    onChange={e => setConsent(e.target.checked)}
                    required
                    style={{ marginTop: '0.2rem' }}
                  />
                  <span>
                    I agree to the <Link href="/privacy" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Privacy Policy</Link> and consent to receive emails regarding AI tools and updates. You can unsubscribe at any time.
                  </span>
                </label>
              </form>
            </div>
          </div>
        )}

        {/* STAGE 4: RESULTS */}
        {stage === 'results' && (
          <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', padding: '6px 16px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Report Unlocked</span>
              <h2 style={{ fontSize: '3rem', marginTop: '1.5rem', marginBottom: '1rem', fontWeight: '800', letterSpacing: '-1px' }}>Your Missing AI Tools</h2>
              <p style={{ color: '#aaa', fontSize: '1.2rem', maxWidth: '500px', margin: '0 auto' }}>Integrate these into your workflow this week to automate your legacy tasks.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '3rem' }}>
              {recommendations.map(tool => (
                <Link key={tool.id} href={`/tool/${tool.slug}`} style={{ textDecoration: 'none' }}>
                  <div 
                    style={{ 
                      display: 'flex', alignItems: 'center', gap: '1.5rem', 
                      background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '20px', 
                      border: '1px solid rgba(255,255,255,0.05)', transition: 'all 0.3s ease',
                      backdropFilter: 'blur(10px)'
                    }} 
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateX(10px)';
                      e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                      e.currentTarget.style.border = '1px solid rgba(16, 185, 129, 0.3)';
                      e.currentTarget.style.boxShadow = '0 5px 20px rgba(16, 185, 129, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateX(0)';
                      e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                      e.currentTarget.style.border = '1px solid rgba(255,255,255,0.05)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ width: '70px', height: '70px', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.05))', border: '1px solid rgba(16, 185, 129, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', boxShadow: 'inset 0 0 10px rgba(16, 185, 129, 0.2)' }}>✨</div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '0.4rem', fontWeight: 'bold' }}>{tool.name}</h4>
                      <p style={{ color: '#aaa', fontSize: '0.95rem', lineHeight: '1.5' }}>{tool.description?.substring(0, 100)}...</p>
                    </div>
                    <div style={{ color: 'var(--accent)', fontSize: '1.5rem', padding: '0 1rem' }}>&rarr;</div>
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
