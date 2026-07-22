'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';

// Helper to get a generative icon based on title
function getIconForTitle(title: string) {
  const t = title.toLowerCase();
  if (t.includes('video') || t.includes('movie') || t.includes('production')) return '🎬';
  if (t.includes('audio') || t.includes('music') || t.includes('sonic')) return '🎵';
  if (t.includes('design') || t.includes('art') || t.includes('visual') || t.includes('fashion')) return '🎨';
  if (t.includes('code') || t.includes('software') || t.includes('developer') || t.includes('cybersecurity')) return '💻';
  if (t.includes('medical') || t.includes('patient') || t.includes('health') || t.includes('clinical') || t.includes('genomic')) return '🏥';
  if (t.includes('finance') || t.includes('trading') || t.includes('money') || t.includes('business')) return '📈';
  if (t.includes('marketing') || t.includes('sales') || t.includes('brand') || t.includes('content')) return '🎯';
  if (t.includes('research') || t.includes('science') || t.includes('data')) return '🔬';
  return '🧠';
}

const THEMES = [
  { label: 'All', keywords: [] },
  { label: '🎬 Video', keywords: ['video', 'movie', 'production'] },
  { label: '🎵 Audio', keywords: ['audio', 'music', 'sonic', 'voice'] },
  { label: '🎨 Design', keywords: ['design', 'art', 'visual', 'fashion', 'image'] },
  { label: '💻 Code', keywords: ['code', 'software', 'developer', 'cybersecurity'] },
  { label: '🏥 Medical', keywords: ['medical', 'patient', 'health', 'clinical', 'genomic', 'biomedical'] },
  { label: '📈 Finance', keywords: ['finance', 'trading', 'money', 'business'] },
  { label: '🎯 Marketing', keywords: ['marketing', 'sales', 'brand', 'content'] },
  { label: '🔬 Research', keywords: ['research', 'science', 'data', 'hypothesis'] }
];

export default function GuideGrid({ initialGuides }: { initialGuides: any[] }) {
  const [guides, setGuides] = useState(initialGuides);
  const [activeTheme, setActiveTheme] = useState('All');
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialGuides.length >= 9);
  
  const supabase = createClientComponentClient();

  const handleFilter = async (themeLabel: string) => {
    setActiveTheme(themeLabel);
    setLoading(true);
    
    let query = supabase.from('guides').select('id, title, slug, created_at').order('created_at', { ascending: false });
    
    const theme = THEMES.find(t => t.label === themeLabel);
    if (theme && theme.keywords.length > 0) {
      const orQuery = theme.keywords.map(kw => `title.ilike.%${kw}%`).join(',');
      query = query.or(orQuery);
    }
    
    // Initial fetch for the new filter
    query = query.range(0, 8); // 9 items
    
    const { data, error } = await query;
    if (data) {
      setGuides(data);
      setHasMore(data.length >= 9);
    }
    setLoading(false);
  };

  const loadMore = async () => {
    setLoading(true);
    const offset = guides.length;
    
    let query = supabase.from('guides').select('id, title, slug, created_at').order('created_at', { ascending: false });
    
    const theme = THEMES.find(t => t.label === activeTheme);
    if (theme && theme.keywords.length > 0) {
      const orQuery = theme.keywords.map(kw => `title.ilike.%${kw}%`).join(',');
      query = query.or(orQuery);
    }
    
    // Fetch next 9 items
    query = query.range(offset, offset + 8);
    
    const { data, error } = await query;
    if (data) {
      setGuides([...guides, ...data]);
      if (data.length < 9) {
        setHasMore(false);
      }
    }
    setLoading(false);
  };

  return (
    <>
      {/* Theme Filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem', justifyContent: 'center', marginBottom: '3rem' }}>
        {THEMES.map((theme) => (
          <button
            key={theme.label}
            onClick={() => handleFilter(theme.label)}
            style={{
              padding: '0.6rem 1.2rem',
              borderRadius: '50px',
              border: `1px solid ${activeTheme === theme.label ? 'var(--accent)' : 'rgba(255,255,255,0.1)'}`,
              background: activeTheme === theme.label ? 'rgba(16, 185, 129, 0.1)' : 'rgba(0,0,0,0.3)',
              color: activeTheme === theme.label ? '#fff' : '#aaa',
              fontWeight: activeTheme === theme.label ? 'bold' : 'normal',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: activeTheme === theme.label ? '0 0 15px rgba(16, 185, 129, 0.2)' : 'none',
              backdropFilter: 'blur(10px)'
            }}
          >
            {theme.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid" style={{ gap: '2rem' }}>
        {guides && guides.length > 0 ? (
          guides.map((guide) => {
            const icon = getIconForTitle(guide.title);
            return (
              <Link key={guide.id} href={`/guides/${guide.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <article 
                  style={{ 
                    height: '100%', display: 'flex', flexDirection: 'column', 
                    padding: '2.5rem', transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)', cursor: 'pointer',
                    background: 'rgba(255,255,255,0.02)', borderRadius: '24px',
                    border: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(16, 185, 129, 0.15)';
                    e.currentTarget.style.border = '1px solid rgba(16, 185, 129, 0.3)';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.border = '1px solid rgba(255,255,255,0.05)';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                  }}
                >
                  <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.05))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '1.5rem', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                    {icon}
                  </div>
                  <h2 style={{ fontSize: '1.4rem', marginBottom: '2rem', lineHeight: '1.5', fontWeight: 'bold', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{guide.title}</h2>
                  <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
                    <span style={{ background: 'var(--accent)', color: '#000', padding: '8px 20px', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.85rem', transition: 'all 0.2s', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)' }}>Read Guide &rarr;</span>
                    <span style={{ color: '#666', fontFamily: 'monospace', fontSize: '0.8rem' }}>{new Date(guide.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </article>
              </Link>
            );
          })
        ) : (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', background: 'rgba(255,255,255,0.03)', borderRadius: '16px' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>No guides found</h3>
            <p style={{ color: '#888' }}>Try selecting a different theme.</p>
          </div>
        )}
      </div>

      {/* Load More Button */}
      {hasMore && guides.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '4rem' }}>
          <button 
            onClick={loadMore}
            disabled={loading}
            className="btn-hover"
            style={{ 
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#fff', padding: '1rem 3rem', borderRadius: '50px', fontSize: '1.1rem',
              fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                e.currentTarget.style.border = '1px solid rgba(255,255,255,0.2)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                e.currentTarget.style.border = '1px solid rgba(255,255,255,0.1)';
              }
            }}
          >
            {loading ? 'Loading...' : 'Load More Guides ↓'}
          </button>
        </div>
      )}
    </>
  );
}
