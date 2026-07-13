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
  categoryQuery = '' 
}: { 
  initialTools: any[], 
  searchQuery?: string, 
  categoryQuery?: string 
}) {
  const [tools, setTools] = useState(initialTools);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialTools.length === 12); // If initial is 12, there MIGHT be more

  // CRITICAL FIX: Update state when user clicks a filter (URL changes)
  useEffect(() => {
    setTools(initialTools);
    setHasMore(initialTools.length >= 12);
  }, [initialTools]);

  const loadMore = async () => {
    setLoading(true);
    const offset = tools.length; // We start fetching from the current length
    // Remember to fetch tools.length + 12
    let query = supabase.from('tools').select('*').order('created_at', { ascending: false });

    if (searchQuery) {
      query = query.ilike('name', `%${searchQuery}%`);
    }
    if (categoryQuery) {
      query = query.eq('category', categoryQuery);
    }

    // Supabase range is inclusive, e.g. range(12, 23) gets 12 items
    query = query.range(offset, offset + 11);

    const { data: nextTools, error } = await query;
    
    if (nextTools && nextTools.length > 0) {
      setTools([...tools, ...nextTools]);
      if (nextTools.length < 12) {
        setHasMore(false); // Reached the end
      }
    } else {
      setHasMore(false);
    }
    
    setLoading(false);
  };

  return (
    <div>
      <div className="grid">
        {tools.map((tool) => (
          <article key={tool.id || tool.name} className="card">
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
                borderRadius: '12px',
                width: 'fit-content'
              }}>
                <span style={{ fontSize: '1rem' }}>{getCategoryIcon(tool.category)}</span> {tool.category}
              </span>
            )}
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
