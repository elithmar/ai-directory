'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const getCategoryIcon = (category: string) => {
  const map: Record<string, string> = {
    'Marketing': '✍️',
    'Video': '🎥',
    'Audio': '🎵',
    'Productivity': '⚡️',
    'Design': '🎨',
    'Development': '💻',
    'Sales': '📈',
    'Support': '🤝'
  };
  return map[category] || '✨';
};

export default function ToolGrid({ 
  initialTools, 
  searchQuery = '', 
  categoryQuery = '',
  pricingQuery = ''
}: { 
  initialTools: any[], 
  searchQuery?: string, 
  categoryQuery?: string,
  pricingQuery?: string
}) {
  const [tools, setTools] = useState(initialTools);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialTools.length >= 6); // If initial is >= 6, there MIGHT be more

  // CRITICAL FIX: Update state when user clicks a filter (URL changes)
  useEffect(() => {
    setTools(initialTools);
    setHasMore(initialTools.length >= 6);
  }, [initialTools]);

  const loadMore = async () => {
    setLoading(true);
    let offset = tools.length; // We start fetching from the current length
    
    // If we are on the main page, the DB offset must be +1 because the featured tool took 1 slot
    if (!searchQuery && !categoryQuery) {
      offset += 1;
    }

    // Remember to fetch 6 items
    let query = supabase.from('tools').select('*').order('created_at', { ascending: false });

    if (searchQuery) {
      query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%`);
    }
    if (categoryQuery) {
      query = query.eq('category', categoryQuery);
    }

    // Supabase range is inclusive
    query = query.range(offset, offset + 5);

    const { data: nextTools, error } = await query;
    
    if (nextTools && nextTools.length > 0) {
      setTools([...tools, ...nextTools]);
      if (nextTools.length < 6) {
        setHasMore(false); // Reached the end
      }
    } else {
      setHasMore(false);
    }
    
    setLoading(false);
  };

  return (
    <div>
      {tools.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '5rem 2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px dashed rgba(255,255,255,0.1)', marginTop: '2rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem', animation: 'float 3s ease-in-out infinite' }}>🧐</div>
          <h3 style={{ fontSize: '2rem', marginBottom: '1rem' }}>No AI tools found</h3>
          <p style={{ color: '#888', marginBottom: '2rem', fontSize: '1.2rem' }}>Try adjusting your filters, or discover exactly what you need with our Auditor.</p>
          <Link href="/auditor" className="btn-hover" style={{ display: 'inline-block', padding: '14px 32px', background: 'linear-gradient(135deg, #10b981, #34d399)', color: '#000', borderRadius: '50px', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.1rem', boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)' }}>Take the Free Stack Audit</Link>
        </div>
      )}

      <div className="grid">
        {tools.map((tool, index) => (
          <article key={tool.id || tool.name} className="card" style={{ position: 'relative' }}>
            {index === 0 && !searchQuery && !categoryQuery && (
               <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'linear-gradient(90deg, #ff8a00, #e52e71)', color: '#fff', fontSize: '0.7rem', fontWeight: 'bold', padding: '6px 12px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(229, 46, 113, 0.5)', textTransform: 'uppercase', letterSpacing: '1px', zIndex: 10, transform: 'rotate(4deg)' }}>🔥 Trending</div>
            )}
            {index === 4 && (
               <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'linear-gradient(90deg, #8b5cf6, #d946ef)', color: '#fff', fontSize: '0.7rem', fontWeight: 'bold', padding: '6px 12px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(139, 92, 246, 0.5)', textTransform: 'uppercase', letterSpacing: '1px', zIndex: 10, transform: 'rotate(-4deg)' }}>💎 Hidden Gem</div>
            )}
            {/* Badges Container */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '1rem' }}>
              {tool.category && (
                <span style={{ 
                  fontSize: '0.75rem', 
                  textTransform: 'uppercase', 
                  color: 'var(--accent)', 
                  fontWeight: 'bold', 
                  letterSpacing: '1px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(255,255,255,0.05)',
                  padding: '4px 10px',
                  borderRadius: '12px'
                }}>
                  <span style={{ fontSize: '1rem' }}>{getCategoryIcon(tool.category)}</span> {tool.category}
                </span>
              )}
              
              <span style={{
                background: (tool.pricing || 'Freemium') === 'Free' ? 'rgba(16, 185, 129, 0.1)' : (tool.pricing || 'Freemium') === 'Paid' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                color: (tool.pricing || 'Freemium') === 'Free' ? '#10b981' : (tool.pricing || 'Freemium') === 'Paid' ? '#ef4444' : '#3b82f6',
                border: `1px solid ${(tool.pricing || 'Freemium') === 'Free' ? 'rgba(16, 185, 129, 0.3)' : (tool.pricing || 'Freemium') === 'Paid' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`,
                fontSize: '0.7rem',
                fontWeight: 'bold',
                padding: '4px 8px',
                borderRadius: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                display: 'inline-flex',
                alignItems: 'center'
              }}>
                {tool.pricing || 'Freemium'}
              </span>
            </div>
            <h2 className="card-title" style={{ marginTop: '0.5rem' }}>{tool.name}</h2>
            <p className="card-description">{tool.description}</p>
            <Link 
              href={`/tool/${tool.slug || tool.name.toLowerCase().replace(/\\s+/g, '-')}`} 
              className="card-link"
            >
              View Details
            </Link>
          </article>
        ))}
      </div>

      {loading && (
        <div className="grid" style={{ marginTop: tools.length > 0 ? '2rem' : '0' }}>
          {[1, 2, 3].map((i) => (
            <article key={i} className="card" style={{ animation: 'pulse 1.5s infinite ease-in-out', background: 'rgba(255,255,255,0.02)' }}>
              <div style={{ width: '40%', height: '1.2rem', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginBottom: '1rem' }}></div>
              <div style={{ width: '80%', height: '1.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', marginBottom: '0.5rem' }}></div>
              <div style={{ width: '100%', height: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginBottom: '0.5rem' }}></div>
              <div style={{ width: '90%', height: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginBottom: '1.5rem' }}></div>
              <div style={{ width: '30%', height: '2.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', marginTop: 'auto' }}></div>
            </article>
          ))}
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
      `}} />

      {hasMore && !loading && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '4rem', marginBottom: '4rem' }}>
          <button 
            onClick={loadMore} 
            disabled={loading}
            style={{ 
              padding: '12px 32px', 
              background: 'transparent', 
              color: '#fff', 
              border: '1px solid var(--accent)', 
              borderRadius: '30px', 
              cursor: loading ? 'not-allowed' : 'pointer', 
              fontWeight: 'bold',
              fontSize: '1rem',
              transition: 'all 0.2s',
              opacity: loading ? 0.7 : 1
            }}
            onMouseEnter={(e) => !loading && (e.currentTarget.style.background = 'var(--accent)')}
            onMouseLeave={(e) => !loading && (e.currentTarget.style.background = 'transparent')}
          >
            {loading ? 'Loading...' : 'Load More Tools'}
          </button>
        </div>
      )}
    </div>
  );
}
