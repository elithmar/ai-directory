export default function Loading() {
  return (
    <main className="container" style={{ maxWidth: '1200px', margin: '0 auto', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
      {/* Breadcrumb Skeleton */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '3rem' }}>
        <div style={{ width: '40px', height: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }} />
        <div style={{ width: '10px', height: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }} />
        <div style={{ width: '60px', height: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }} />
        <div style={{ width: '10px', height: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }} />
        <div style={{ width: '200px', height: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }} />
      </div>
      
      <article>
        <header style={{ marginBottom: '4rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Title Skeleton */}
          <div style={{ width: '80%', height: '56px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', marginBottom: '1rem' }} />
          <div style={{ width: '60%', height: '56px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', marginBottom: '1.5rem' }} />
          
          {/* Date & Share Skeleton */}
          <div style={{ width: '200px', height: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginBottom: '1.5rem' }} />
          <div style={{ width: '150px', height: '40px', background: 'rgba(255,255,255,0.05)', borderRadius: '20px' }} />
        </header>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '4rem', alignItems: 'start' }}>
          {/* TOC Skeleton */}
          <div style={{ height: '300px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px' }} />

          {/* Content Skeleton */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ width: '100%', height: '24px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px' }} />
            <div style={{ width: '90%', height: '24px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px' }} />
            <div style={{ width: '95%', height: '24px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px' }} />
            <div style={{ width: '85%', height: '24px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px', marginBottom: '2rem' }} />
            
            <div style={{ width: '40%', height: '36px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', marginBottom: '1rem' }} />
            <div style={{ width: '100%', height: '24px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px' }} />
            <div style={{ width: '90%', height: '24px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px' }} />
          </div>
        </div>
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
