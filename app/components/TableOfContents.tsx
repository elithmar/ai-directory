'use client';

import React, { useEffect, useState } from 'react';

export default function TableOfContents({ toc }: { toc: { id: string, title: string, level: number }[] }) {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '0px 0px -80% 0px' }
    );

    toc.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [toc]);

  return (
    <aside className="toc-container" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
      <h4 style={{ color: '#fff', marginBottom: '1rem', fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Table of Contents</h4>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {toc.map((item, idx) => {
          const isActive = activeId === item.id;
          return (
            <li key={idx} style={{ marginBottom: '0.75rem', paddingLeft: item.level === 3 ? '1rem' : '0' }}>
              <a 
                href={`#${item.id}`} 
                className="toc-link"
                style={{ 
                  color: isActive ? 'var(--accent)' : '#888',
                  textDecoration: 'none', 
                  fontSize: '0.95rem', 
                  transition: 'all 0.2s',
                  fontWeight: isActive ? '600' : '400',
                  borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                  paddingLeft: '10px',
                  display: 'block'
                }}
              >
                {item.title}
              </a>
            </li>
          );
        })}
      </ul>
      <style dangerouslySetInnerHTML={{__html: `
        .toc-link:hover {
          color: var(--accent) !important;
          transform: translateX(4px);
        }
      `}} />
    </aside>
  );
}
