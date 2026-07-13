import Link from 'next/link';

export default function TermsOfService() {
  return (
    <main className="container" style={{ padding: '4rem 2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '3rem' }}>
        <Link href="/" style={{ color: 'var(--accent)', textDecoration: 'none' }}>&larr; Back to Directory</Link>
      </div>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Terms of Service</h1>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', color: 'var(--text-muted)' }}>
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        
        <section>
          <h2 style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>1. Agreement to Terms</h2>
          <p>By viewing or using this website, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.</p>
        </section>

        <section>
          <h2 style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>2. Informational Purpose</h2>
          <p>The content on this website is provided for general information purposes only. While we strive to keep the information up to date and correct, we make no representations or warranties of any kind about the completeness, accuracy, reliability, suitability, or availability with respect to the website or the information, products, services, or related graphics contained on the website.</p>
        </section>

        <section>
          <h2 style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>3. Affiliate Links & Endorsements</h2>
          <p>This directory features reviews and listings of third-party software tools. We participate in various affiliate marketing programs, which means we may get paid commissions on purchases made through our links to vendor sites. Our reviews and recommendations are independent, but you should assume any link to a product is an affiliate link.</p>
        </section>

        <section>
          <h2 style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>4. Limitations of Liability</h2>
          <p>In no event shall we or our suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on this website, even if we or an authorized representative has been notified orally or in writing of the possibility of such damage.</p>
        </section>

        <section>
          <h2 style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>5. Revisions and Errata</h2>
          <p>The materials appearing on this website could include technical, typographical, or photographic errors. We do not warrant that any of the materials on its website are accurate, complete, or current. We may make changes to the materials contained on its website at any time without notice.</p>
        </section>
      </div>
    </main>
  );
}
