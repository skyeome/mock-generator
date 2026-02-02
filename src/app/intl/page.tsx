import { Metadata } from 'next';
import { I18nSyncPage } from '@/components/intl';
import { StructuredData } from '@/components/seo/structured-data';

export const metadata: Metadata = {
  title: 'i18n JSON Sync Tool - AI-Powered Translation Synchronization',
  description:
    'Sync and translate JSON i18n files with AI. Compare translation files, detect missing keys, and maintain consistent localizations across your project. Free online tool.',
  keywords: [
    'i18n json sync',
    'translation file synchronization',
    'json translation tool',
    'localization tool',
    'i18n diff tool',
    'ai translation',
    'compare translation files',
    'missing translations',
  ],
  openGraph: {
    title: 'i18n JSON Sync Tool - AI-Powered Translation Synchronization',
    description:
      'Sync and translate JSON i18n files with AI. Compare translation files, detect missing keys, and maintain consistent localizations.',
    type: 'website',
    url: 'https://ai-utils.work/intl',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'i18n JSON Sync Tool',
    description: 'AI-powered i18n JSON synchronization and translation',
  },
  alternates: {
    canonical: 'https://ai-utils.work/intl',
  },
};

export default function IntlPage() {
  return (
    <>
      <StructuredData
        type="SoftwareApplication"
        data={{
          name: 'i18n JSON Sync Tool',
          description:
            'AI-powered translation synchronization for i18n JSON files. Compare, translate, and export localization files.',
          applicationCategory: 'DeveloperApplication',
          operatingSystem: 'Web Browser',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
          },
        }}
      />
      <I18nSyncPage />
    </>
  );
}
