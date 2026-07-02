'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function SearchAndFilter({ tools, initialQuery = '', initialCategory = '' }: { tools: any[], initialQuery?: string, initialCategory?: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [showPredictions, setShowPredictions] = useState(false);
  const [highlightedCategory, setHighlightedCategory] = useState<string | null>(initialCategory || null);
  
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);

  const categories = ['Video', 'Audio', 'Marketing', 'Productivity', 'Design'];

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowPredictions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setShowPredictions(false);
    if (query.trim() === '') {
      router.push('/');
    } else {
      router.push(`/?q=${encodeURIComponent(query)}`);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    
    if (val.trim() === '') {
      setPredictions([]);
      setShowPredictions(false);
      setHighlightedCategory(category || null);
      return;
    }

    // Find predictions
    const matches = tools.filter(t => t.name.toLowerCase().includes(val.toLowerCase()));
    setPredictions(matches.slice(0, 5));
    setShowPredictions(true);

    // Highlight category of the best match
    if (matches.length > 0) {
      setHighlightedCategory(matches[0].category);
    } else {
      setHighlightedCategory(category || null);
    }
  };

  const selectPrediction = (slug: string) => {
    setShowPredictions(false);
    router.push(`/tool/${slug}`);
  };

  const selectCategory = (cat: string) => {
    if (category === cat) {
      setCategory('');
      setHighlightedCategory(null);
      router.push('/');
    } else {
      setCategory(cat);
      setHighlightedCategory(cat);
      setQuery('');
      router.push(`/?category=${encodeURIComponent(cat)}`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '600px', margin: '0 auto' }}>
      
      {/* Search Form with Dropdown */}
      <div ref={searchRef} style={{ position: 'relative', width: '100%', maxWidth: '400px', marginTop: '2rem' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', width: '100%' }}>
          <input 
            type="text" 
            placeholder="Search AI tools (e.g. Jasper)..." 
            value={query}
            onChange={handleInputChange}
            onFocus={() => { if(query) setShowPredictions(true) }}
            style={{ 
              flex: 1, 
              padding: '12px 24px', 
              borderRadius: '30px', 
              border: '1px solid rgba(255,255,255,0.2)', 
              background: 'rgba(255,255,255,0.05)', 
              color: '#fff',
              outline: 'none'
            }}
          />
          <button type="submit" style={{ padding: '12px 24px', borderRadius: '30px', background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
            Search
          </button>
        </form>

        {/* Predictive Dropdown */}
        {showPredictions && predictions.length > 0 && (
          <div style={{ 
            position: 'absolute', 
            top: '100%', 
            left: 0, 
            right: 0, 
            background: 'var(--surface)', 
            border: '1px solid var(--border)', 
            borderRadius: '12px', 
            marginTop: '0.5rem', 
            overflow: 'hidden', 
            zIndex: 10,
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)' 
          }}>
            {predictions.map(p => (
              <div 
                key={p.id} 
                onClick={() => selectPrediction(p.slug || p.name.toLowerCase().replace(/\\s+/g, '-'))}
                style={{ 
                  padding: '12px 20px', 
                  cursor: 'pointer', 
                  borderBottom: '1px solid var(--border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <span style={{ fontWeight: 'bold' }}>{p.name}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--primary)', textTransform: 'uppercase', padding: '2px 8px', background: 'rgba(74, 222, 128, 0.1)', borderRadius: '10px' }}>
                  {p.category}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Categories */}
      <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        {categories.map(cat => {
          const isSelected = category === cat;
          const isHighlighted = highlightedCategory === cat && !isSelected;
          
          return (
            <button 
              key={cat} 
              onClick={() => selectCategory(cat)}
              style={{
                padding: '8px 16px', 
                borderRadius: '20px', 
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                background: isSelected ? 'var(--accent)' : (isHighlighted ? 'rgba(74, 222, 128, 0.2)' : 'rgba(255,255,255,0.05)'),
                color: isSelected ? '#fff' : (isHighlighted ? 'var(--primary)' : '#aaa'),
                border: isHighlighted && !isSelected ? '1px solid var(--primary)' : '1px solid transparent'
              }}
            >
              {cat}
            </button>
          )
        })}
        {category && (
          <button 
            onClick={() => selectCategory(category)} 
            style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', fontSize: '0.85rem', marginLeft: '0.5rem' }}
          >
            Clear Filter
          </button>
        )}
      </div>
    </div>
  );
}
