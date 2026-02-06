'use client';

import { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

/**
 * Back to Top Button Component
 * Client-side button with scroll position tracking
 */

export default function BackToTop() {
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const main = document.querySelector('main');
      if (main) {
        setShowBackToTop(main.scrollTop > 300);
      }
    };

    const main = document.querySelector('main');
    if (main) {
      main.addEventListener('scroll', handleScroll);
      return () => main.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const scrollToTop = () => {
    const main = document.querySelector('main');
    if (main) {
      main.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (!showBackToTop) {
    return null;
  }

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-8 right-8 flex items-center justify-center rounded-full bg-blue-600 p-3 text-white shadow-lg transition-all hover:bg-blue-700"
      aria-label="Back to top"
    >
      <ChevronUp size={24} />
    </button>
  );
}
