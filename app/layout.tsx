import './globals.css';
import Link from 'next/link';
import CookieBanner from '@/components/CookieBanner';
import ScrollToTop from './components/ScrollToTop';

export const metadata = {
  metadataBase: new URL('https://www.curatedailist.com'),
  title: 'Curated AI List | Discover the Best Artificial Intelligence Tools',
  description: 'The ultimate directory for discovering the best AI tools, softwares, and guides. Boost your productivity, marketing, and business with our curated AI list.',
  openGraph: {
    title: 'Curated AI List',
    description: 'The ultimate directory for discovering the best AI tools, softwares, and guides.',
    url: 'https://curatedailist.com',
    siteName: 'Curated AI List',
    type: 'website',
  },
  verification: {
    google: 'Jn2zgXDFpuyvMj3nAWHc-zm4FKeNcrG0taK7zlEbjuU',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <header className="header">
          <div className="container header-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <a href="/" className="logo-link">
              <img src="/logo.png" alt="Curated AI List Logo" className="logo-image" />
              <span className="logo-text">Curated AI List</span>
            </a>
            <nav style={{ display: 'flex', gap: '1.5rem' }}>
              <Link href="/guides" style={{ color: '#fff', textDecoration: 'none', fontWeight: 'bold' }}>Guides</Link>
              <Link href="/about" style={{ color: '#fff', textDecoration: 'none', fontWeight: 'bold' }}>About</Link>
            </nav>
          </div>
        </header>
        {children}
        <footer className="footer">
          <div className="container">
            <p>&copy; {new Date().getFullYear()} Curated AI List. All rights reserved.</p>
            <div className="footer-links">
              <Link href="/privacy">Privacy Policy</Link>
              <Link href="/terms">Terms of Service</Link>
            </div>
          </div>
        </footer>
        <CookieBanner />
        <ScrollToTop />
      </body>
    </html>
  );
}
