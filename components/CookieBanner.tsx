"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookie-consent', 'true');
    setShowBanner(false);
  };

  const declineCookies = () => {
    localStorage.setItem('cookie-consent', 'false');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="cookie-banner">
      <div className="cookie-content">
        <p>
          We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. 
          By clicking "Accept All", you consent to our use of cookies as described in our <Link href="/privacy" className="cookie-link">Privacy Policy</Link>.
        </p>
        <div className="cookie-buttons">
          <button onClick={declineCookies} className="cookie-button-secondary">Decline</button>
          <button onClick={acceptCookies} className="cookie-button">Accept All</button>
        </div>
      </div>
    </div>
  );
}
