import Link from 'next/link';
import type { IntlLandingPage } from '@/lib/seo/types';
import { StructuredData } from './structured-data';
import { TrustBadges } from './trust-badges';
import { CTASection } from './cta-section';
import { PrivacySection } from './privacy-section';

interface IntlLandingPageTemplateProps {
  page: IntlLandingPage;
}

export function IntlLandingPageTemplate({
  page,
}: IntlLandingPageTemplateProps) {
  return (
    <article className="min-h-screen bg-zinc-900 text-zinc-100">
      {/* SoftwareApplication Structured Data */}
      <StructuredData
        type="SoftwareApplication"
        data={{
          name: page.title,
          description: page.description,
          applicationCategory: page.structuredData.applicationCategory,
          operatingSystem: page.structuredData.operatingSystem,
          ...(page.structuredData.offers && {
            offers: {
              '@type': 'Offer',
              price: page.structuredData.offers.price,
              priceCurrency: page.structuredData.offers.priceCurrency,
            },
          }),
        }}
      />

      {/* Hero Section */}
      <header className="py-16 px-6 text-center">
        <h1 className="text-4xl font-bold text-emerald-400 mb-4">{page.h1}</h1>
        <p className="text-xl text-zinc-300 max-w-2xl mx-auto">
          {page.content.intro}
        </p>
        <TrustBadges />
        <div className="mt-8">
          <Link
            href="/intl"
            className="inline-block px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors"
          >
            Try Now
          </Link>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-12 px-6 bg-zinc-800/50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-semibold mb-8 text-center">Features</h2>
          <ul className="grid md:grid-cols-2 gap-6">
            {page.content.features.map((feature, i) => (
              <li
                key={i}
                className="p-6 bg-zinc-800 rounded-lg border border-zinc-700"
              >
                <span className="text-emerald-400 mr-2">✓</span>
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* How To Section */}
      <section className="py-12 px-6">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-semibold mb-8 text-center">
            How to Use
          </h2>
          <ol className="space-y-4">
            {page.content.howTo.map((step, i) => (
              <li key={i} className="flex gap-4">
                <span className="shrink-0 w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
                  {i + 1}
                </span>
                <span className="pt-1">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA */}
      <CTASection />

      {/* FAQ Section */}
      {page.content.faq.length > 0 && (
        <section className="py-12 px-6 bg-zinc-800/50">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold mb-8 text-center">
              Frequently Asked Questions
            </h2>
            <StructuredData
              type="FAQPage"
              data={{
                mainEntity: page.content.faq.map(({ q, a }) => ({
                  '@type': 'Question',
                  name: q,
                  acceptedAnswer: { '@type': 'Answer', text: a },
                })),
              }}
            />
            <div className="space-y-6">
              {page.content.faq.map(({ q, a }, i) => (
                <div key={i}>
                  <h3 className="font-semibold text-emerald-400 mb-2">{q}</h3>
                  <p className="text-zinc-300">{a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Privacy Section */}
      <PrivacySection />

      {/* Related Pages */}
      <nav className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-semibold mb-6 text-center">
            Related Tools
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            {page.relatedPages.map((path) => (
              <Link
                key={path}
                href={path}
                className="px-4 py-2 bg-zinc-800 rounded hover:bg-zinc-700 transition-colors capitalize"
              >
                {path.split('/').pop()?.replace(/-/g, ' ')}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-zinc-800 text-center">
        <Link href="/" className="text-emerald-400 hover:underline">
          ← Back to Mock Data Generator
        </Link>
      </footer>
    </article>
  );
}
