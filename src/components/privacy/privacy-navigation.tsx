'use client';

import { useState, useEffect } from 'react';
import { PRIVACY_POLICY_TOC } from '@/lib/consent/privacy-content';

/**
 * Privacy Navigation Component
 * Client-side TOC navigation with active section tracking and smooth scrolling
 */

export default function PrivacyNavigation() {
  const [activeSection, setActiveSection] = useState<string>('introduction');

  useEffect(() => {
    const handleScroll = () => {
      // Find the section that is currently in view
      const sections = PRIVACY_POLICY_TOC.map((item) => item.id);

      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const rect = element.getBoundingClientRect();
          // Check if section is in viewport (with some offset for header)
          if (rect.top <= 250 && rect.bottom >= 250) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    // Listen to scroll on the main element
    const main = document.querySelector('main');
    if (main) {
      main.addEventListener('scroll', handleScroll);
      return () => main.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <aside className="sticky top-[200px] hidden w-64 flex-shrink-0 lg:block">
      <div className="mx-6 rounded-lg border border-gray-200 bg-gray-50 p-6">
        <h2 className="mb-4 text-sm font-semibold text-gray-900">
          Table of Contents
        </h2>
        <nav className="space-y-2">
          {PRIVACY_POLICY_TOC.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className={`block w-full rounded px-3 py-2 text-left text-sm transition-colors ${
                activeSection === item.id
                  ? 'bg-blue-100 font-medium text-blue-900'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
}
