'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

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
            {tool.category && <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 'bold', letterSpacing: '1px' }}>{tool.category}</span>}
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

      {hasMore && (
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
