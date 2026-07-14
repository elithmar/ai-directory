export default function Loading() {
  return (
    <main className="container" style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
      {/* Breadcrumb Skeleton */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
        <div style={{ width: '40px', height: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }} />
        <div style={{ width: '10px', height: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }} />
        <div style={{ width: '60px', height: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }} />
        <div style={{ width: '10px', height: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }} />
        <div style={{ width: '100px', height: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }} />
      </div>
      
      <article className="tool-detail">
        <header style={{ marginBottom: '3rem' }}>
          {/* Category Pill Skeleton */}
          <div style={{ width: '100px', height: '32px', background: 'rgba(255,255,255,0.05)', borderRadius: '20px', marginBottom: '1rem' }} />
          {/* Title Skeleton */}
          <div style={{ width: '50%', height: '64px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', marginBottom: '1.5rem' }} />
          {/* Description Skeletons */}
          <div style={{ width: '80%', height: '24px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginBottom: '0.5rem' }} />
          <div style={{ width: '70%', height: '24px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }} />
        </header>

        {/* Review Grid Skeleton */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
          <div style={{ height: '300px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ height: '134px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px' }} />
            <div style={{ height: '134px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px' }} />
          </div>
        </div>

        {/* Pricing Footer Skeleton */}
        <div style={{ height: '104px', background: 'rgba(255,255,255,0.05)', borderRadius: '16px' }} />
      </article>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
      `}} />
    </main>
  );
}
