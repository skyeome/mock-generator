import { MetadataRoute } from 'next';

// Landing page paths - will be imported from pages.ts once created
const LANDING_PAGES = [
  // Tools
  '/tools/json-to-csv',
  '/tools/json-to-sql',
  '/tools/json-to-typescript',
  '/tools/json-schema-generator',
  // Use Cases
  '/use-cases/api-testing',
  '/use-cases/frontend-development',
  '/use-cases/database-seeding',
  '/use-cases/unit-testing',
  // Mock Data
  '/mock-data/ecommerce',
  '/mock-data/users',
  '/mock-data/products',
  '/mock-data/orders',
  '/mock-data/companies',
  // Generators
  '/generators/fake-names',
  '/generators/fake-emails',
  '/generators/fake-addresses',
  '/generators/fake-phone-numbers',
  '/generators/fake-dates',
];

// i18n landing pages
const INTL_PAGES = [
  '/intl',
  '/intl/translate-json',
  '/intl/i18n-diff',
  '/intl/translation-sync',
  '/intl/json-localization',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://ai-utils.work';

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    ...LANDING_PAGES.map((path) => ({
      url: `${baseUrl}${path}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    // i18n pages - main tool gets higher priority
    {
      url: `${baseUrl}/intl`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    ...INTL_PAGES.filter((path) => path !== '/intl').map((path) => ({
      url: `${baseUrl}${path}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ];
}
