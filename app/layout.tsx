import './globals.css';
import Link from 'next/link';
import CookieBanner from '@/components/CookieBanner';

export const metadata = {
  title: 'AI Tool Directory',
  description: 'The best AI tools curated for your productivity.',
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
          <div className="container header-container">
            <Link href="/" className="logo-link">
              <img src="/logo.png" alt="AI Directory Logo" className="logo-image" />
              <span className="logo-text">AI Directory</span>
            </Link>
          </div>
        </header>
        {children}
        <footer className="footer">
          <div className="container">
            <p>&copy; {new Date().getFullYear()} AI Directory. All rights reserved.</p>
            <div className="footer-links">
              <Link href="/privacy">Privacy Policy</Link>
              <Link href="/terms">Terms of Service</Link>
            </div>
          </div>
        </footer>
        <CookieBanner />
      </body>
    </html>
  );
}
