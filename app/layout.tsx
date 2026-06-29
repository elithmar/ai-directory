import './globals.css';

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
      <head>
        <meta name="impact-site-verification" content="25d4e176-b6c3-45ad-82ed-1f04cb641400" />
      </head>
      <body>{children}</body>
    </html>
  );
}
