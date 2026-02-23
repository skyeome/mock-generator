import type { Metadata } from 'next';
import { JsonValidatorPage } from '@/components/json-validator';
import { StructuredData } from '@/components/seo/structured-data';

export const metadata: Metadata = {
  title: 'JSON Validator & Formatter - Validate, Format, and Repair JSON Online',
  description:
    'Validate, format, and repair JSON instantly with an AI-powered JSON Validator & Formatter. Detect syntax issues, beautify JSON, and fix malformed payloads in your browser.',
  keywords: [
    'json validator',
    'json formatter',
    'json beautifier',
    'json lint',
    'json repair tool',
    'fix invalid json',
    'online json parser',
    'developer tools',
  ],
  openGraph: {
    title: 'JSON Validator & Formatter - Validate, Format, and Repair JSON Online',
    description:
      'Validate, format, and repair JSON instantly. Detect syntax issues, beautify payloads, and fix malformed JSON online.',
    type: 'website',
    url: 'https://ai-utils.work/json-validator',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JSON Validator & Formatter',
    description: 'Validate, beautify, and repair JSON with AI assistance',
  },
  alternates: {
    canonical: 'https://ai-utils.work/json-validator',
  },
};

export default function JsonValidatorRoutePage() {
  return (
    <>
      <StructuredData
        type="SoftwareApplication"
        data={{
          name: 'JSON Validator & Formatter',
          description:
            'AI-powered JSON validation, formatting, and repair tool for developers. Detect errors, prettify content, and export clean JSON.',
          applicationCategory: 'DeveloperApplication',
          operatingSystem: 'Web Browser',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
          },
        }}
      />
      <JsonValidatorPage />
    </>
  );
}
