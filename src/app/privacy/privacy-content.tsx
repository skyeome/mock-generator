'use client';

import { useState } from 'react';
import { ChevronUp } from 'lucide-react';
import {
  PRIVACY_POLICY_SECTIONS,
  PRIVACY_POLICY_TOC,
  PRIVACY_POLICY_METADATA,
} from '@/lib/consent/privacy-content';

/**
 * Privacy Policy Content Component
 * Interactive client-side component for displaying GDPR-compliant privacy policy
 */

export default function PrivacyContent() {
  const [activeSection, setActiveSection] = useState<string>('introduction');
  const [showBackToTop, setShowBackToTop] = useState(false);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    setShowBackToTop(target.scrollTop > 300);
  };

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToTop = () => {
    const main = document.querySelector('main');
    if (main) {
      main.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <main
      onScroll={handleScroll}
      className="min-h-screen bg-white text-gray-900"
      style={{ height: '100vh', overflowY: 'auto' }}
    >
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-4xl px-6 py-8">
          <h1 className="mb-2 text-4xl font-bold">Privacy Policy</h1>
          <p className="text-gray-600">
            개인정보 처리방침 | GDPR-Compliant Privacy Policy for Mock Data
            Generator
          </p>
          <p className="mt-4 text-sm text-gray-500">
            Last Updated: {PRIVACY_POLICY_METADATA.lastUpdated}
          </p>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Table of Contents */}
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

        {/* Main Content */}
        <article className="flex-1 px-6 py-12">
          <div className="mx-auto max-w-3xl">
            {/* Introduction Section - Special formatting */}
            <section
              id="introduction"
              className="mb-12 scroll-mt-32"
              onMouseEnter={() => setActiveSection('introduction')}
            >
              <div className="rounded-lg border-l-4 border-blue-500 bg-blue-50 p-6 mb-8">
                <h2 className="mb-4 text-2xl font-bold text-gray-900">
                  {PRIVACY_POLICY_SECTIONS.introduction.title}
                </h2>
                <div className="prose prose-sm max-w-none text-gray-700">
                  {PRIVACY_POLICY_SECTIONS.introduction.content
                    .split('\n\n')
                    .map((para, idx) => (
                      <p key={idx} className="mb-4 leading-relaxed">
                        {para}
                      </p>
                    ))}
                </div>
              </div>
            </section>

            {/* Remaining Sections */}
            {PRIVACY_POLICY_TOC.slice(1).map((toc) => {
              const section =
                PRIVACY_POLICY_SECTIONS[
                  toc.id.replace(/-/g, '') as keyof typeof PRIVACY_POLICY_SECTIONS
                ];

              if (!section) return null;

              return (
                <section
                  key={toc.id}
                  id={toc.id}
                  className="mb-12 scroll-mt-32"
                  onMouseEnter={() => setActiveSection(toc.id)}
                >
                  <h2 className="mb-4 text-2xl font-bold text-gray-900">
                    {section.title}
                  </h2>

                  <div className="prose prose-sm max-w-none text-gray-700">
                    {section.content.split('\n').map((line, idx) => {
                      // Handle different line types
                      if (line.startsWith('**') && line.endsWith('**')) {
                        // Bold headings
                        return (
                          <h3
                            key={idx}
                            className="mt-4 mb-2 text-lg font-semibold text-gray-900"
                          >
                            {line.replace(/\*\*/g, '')}
                          </h3>
                        );
                      }

                      if (line.startsWith('###')) {
                        // Sub-headings
                        return (
                          <h4
                            key={idx}
                            className="mt-3 mb-2 text-base font-semibold text-gray-800"
                          >
                            {line.replace(/^#+\s/, '')}
                          </h4>
                        );
                      }

                      if (line.startsWith('- ')) {
                        // Bullet points
                        return (
                          <li key={idx} className="ml-4 mb-2 text-gray-700">
                            {line.replace(/^- /, '')}
                          </li>
                        );
                      }

                      if (line.match(/^\d+\./)) {
                        // Numbered lists
                        return (
                          <li key={idx} className="ml-4 mb-2 text-gray-700">
                            {line}
                          </li>
                        );
                      }

                      if (line.startsWith('|')) {
                        // Table rows - skip individual parsing, handle below
                        return null;
                      }

                      if (line.trim() === '') {
                        // Empty lines
                        return <div key={idx} className="mb-4" />;
                      }

                      // Regular paragraphs
                      return (
                        <p key={idx} className="mb-4 leading-relaxed">
                          {line}
                        </p>
                      );
                    })}
                  </div>

                  {/* Render tables if present */}
                  {section.content.includes('|') && (
                    <div className="my-6 overflow-x-auto rounded-lg border border-gray-200">
                      <table className="w-full text-sm">
                        <tbody>
                          {section.content
                            .split('\n')
                            .filter((line) => line.startsWith('|'))
                            .map((line, idx) => {
                              const cells = line
                                .split('|')
                                .slice(1, -1)
                                .map((cell) => cell.trim());

                              if (idx === 0) {
                                return (
                                  <thead key={idx}>
                                    <tr className="border-b border-gray-200 bg-gray-50">
                                      {cells.map((cell, cellIdx) => (
                                        <th
                                          key={cellIdx}
                                          className="px-4 py-2 text-left font-semibold text-gray-900"
                                        >
                                          {cell}
                                        </th>
                                      ))}
                                    </tr>
                                  </thead>
                                );
                              }

                              if (line.includes('---')) {
                                return null;
                              }

                              return (
                                <tr
                                  key={idx}
                                  className="border-b border-gray-100 hover:bg-gray-50"
                                >
                                  {cells.map((cell, cellIdx) => (
                                    <td
                                      key={cellIdx}
                                      className="px-4 py-3 text-gray-700"
                                    >
                                      {cell}
                                    </td>
                                  ))}
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              );
            })}

            {/* Footer */}
            <section className="mt-16 border-t border-gray-200 pt-8">
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">
                  About This Policy
                </h3>
                <div className="space-y-3 text-sm text-gray-700">
                  <p>
                    <strong>Effective Date:</strong>{' '}
                    {PRIVACY_POLICY_METADATA.lastUpdated}
                  </p>
                  <p>
                    <strong>Application:</strong> This policy applies to all
                    users of Mock Data Generator, regardless of location.
                  </p>
                  <p>
                    <strong>Compliance:</strong> This policy is designed to
                    comply with GDPR (EU), ePrivacy Directive (EU), and related
                    data protection regulations.
                  </p>
                  <p>
                    <strong>Contact:</strong> For privacy-related questions,
                    please email privacy@mockdatagenerator.com
                  </p>
                </div>
              </div>
            </section>

            {/* Disclaimer */}
            <div className="mt-8 rounded-lg border-l-4 border-amber-500 bg-amber-50 p-4 text-xs text-gray-600">
              <p className="font-semibold text-amber-900 mb-2">Disclaimer</p>
              <p>
                This privacy policy is provided in both Korean and English. In
                case of any discrepancy between the two versions, the Korean
                version shall prevail as this service primarily operates in the
                Korean jurisdiction.
              </p>
            </div>
          </div>
        </article>
      </div>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 flex items-center justify-center rounded-full bg-blue-600 p-3 text-white shadow-lg transition-all hover:bg-blue-700"
          aria-label="Back to top"
        >
          <ChevronUp size={24} />
        </button>
      )}
    </main>
  );
}
