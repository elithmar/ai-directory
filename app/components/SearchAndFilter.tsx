'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function SearchAndFilter({ tools, initialQuery = '', initialCategory = '' }: { tools: any[], initialQuery?: string, initialCategory?: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [showPredictions, setShowPredictions] = useState(false);
  const [highlightedCategory, setHighlightedCategory] = useState<string | null>(initialCategory || null);
  const [placeholderText, setPlaceholderText] = useState("Search AI tools...");
  
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);

  const categories = ['Video', 'Audio', 'Marketing', 'Productivity', 'Design'];

  // Typewriter effect for placeholder
  useEffect(() => {
    const texts = [
      "Search 'video generator'...",
      "Search 'SEO writer'...",
      "Search 'logo creator'...",
      "Search 'voice cloning'...",
      "Search 'meeting notes'..."
    ];
    let currentIndex = 0;
    let currentText = '';
    let isDeleting = false;
    let charIndex = 0;
    let typingSpeed = 100;

    const type = () => {
      const fullText = texts[currentIndex];
      
      if (isDeleting) {
        currentText = fullText.substring(0, charIndex - 1);
        charIndex--;
        typingSpeed = 50;
      } else {
        currentText = fullText.substring(0, charIndex + 1);
        charIndex++;
        typingSpeed = 100;
      }

      setPlaceholderText(currentText);

      if (!isDeleting && currentText === fullText) {
        typingSpeed = 2000; // Pause at end
        isDeleting = true;
      } else if (isDeleting && currentText === '') {
        isDeleting = false;
        currentIndex = (currentIndex + 1) % texts.length;
        typingSpeed = 500; // Pause before new word
      }

      setTimeout(type, typingSpeed);
    };

    const timerId = setTimeout(type, 1000);
    return () => clearTimeout(timerId);
  }, []);

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
    const searchVal = val.toLowerCase();
    const matches = tools.filter(t => 
      (t.name && t.name.toLowerCase().includes(searchVal)) || 
      (t.category && t.category.toLowerCase().includes(searchVal))
    );
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '600px', margin: '0 auto' }}>
      
      {/* Search Form with Dropdown */}
      <div ref={searchRef} style={{ position: 'relative', width: '100%', maxWidth: '500px', margin: '0 auto 2rem auto' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', width: '100%', background: 'rgba(255,255,255,0.03)', padding: '8px', borderRadius: '50px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 0 20px rgba(74, 222, 128, 0.1)' }}>
          <input 
            type="text" 
            placeholder={placeholderText} 
            value={query}
            onChange={handleInputChange}
            onFocus={() => { if(query) setShowPredictions(true) }}
            style={{ 
              flex: 1, 
              padding: '16px 24px', 
              borderRadius: '30px', 
              border: 'none', 
              background: 'transparent', 
              color: '#fff',
              outline: 'none',
              fontSize: '1.1rem'
            }}
          />
          <button type="submit" style={{ padding: '0 32px', borderRadius: '30px', background: 'var(--accent)', color: '#000', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem' }} className="btn-hover">
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
                  {getCategoryIcon(p.category)} {p.category}
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
                padding: '12px 24px', 
                borderRadius: '30px', 
                fontSize: '1rem',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                background: isSelected ? 'var(--accent)' : (isHighlighted ? 'rgba(74, 222, 128, 0.2)' : 'rgba(255,255,255,0.05)'),
                color: isSelected ? '#000' : (isHighlighted ? 'var(--primary)' : '#aaa'),
                border: isHighlighted && !isSelected ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.05)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: isSelected ? 'bold' : 'normal',
                boxShadow: isSelected ? '0 4px 15px rgba(74, 222, 128, 0.4)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.borderColor = 'var(--accent)';
                  e.currentTarget.style.color = '#fff';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.borderColor = isHighlighted ? 'var(--primary)' : 'rgba(255,255,255,0.05)';
                  e.currentTarget.style.color = isHighlighted ? 'var(--primary)' : '#aaa';
                }
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>{getCategoryIcon(cat)}</span> {cat}
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
