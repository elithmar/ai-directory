import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <main className="container" style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '4rem', paddingBottom: '4rem' }}>
      <div style={{ marginBottom: '3rem' }}>
        <Link href="/" style={{ color: 'var(--accent)', textDecoration: 'none' }}>&larr; Back to Directory</Link>
      </div>
      <h1 style={{ fontSize: '3rem', marginBottom: '2rem' }}>Privacy Policy</h1>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', color: 'var(--text-muted)' }}>
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        
        <section>
          <h2 style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>1. Introduction</h2>
          <p>Welcome to our AI Tool Directory. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website.</p>
        </section>

        <section>
          <h2 style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>2. The Data We Collect</h2>
          <p>We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:</p>
          <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
            <li><strong>Technical Data</strong> includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform, and other technology on the devices you use to access this website.</li>
            <li><strong>Usage Data</strong> includes information about how you use our website, products and services.</li>
          </ul>
        </section>

        <section>
          <h2 style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>3. Affiliate Disclosure</h2>
          <p>Some of the links on this website are affiliate links, which means that we may earn a commission if you click on the link or make a purchase using the link. When you make a purchase, the price you pay will be the same whether you use the affiliate link or go directly to the vendor's website using a non-affiliate link.</p>
        </section>

        <section>
          <h2 style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>4. Cookies</h2>
          <p>You can set your browser to refuse all or some browser cookies, or to alert you when websites set or access cookies. If you disable or refuse cookies, please note that some parts of this website may become inaccessible or not function properly.</p>
        </section>

        <section>
          <h2 style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>5. Third-Party Links</h2>
          <p>This website may include links to third-party websites, plug-ins and applications. Clicking on those links or enabling those connections may allow third parties to collect or share data about you. We do not control these third-party websites and are not responsible for their privacy statements.</p>
        </section>
      </div>
    </main>
  );
}
