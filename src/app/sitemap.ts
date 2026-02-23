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

// Blog post slugs
const BLOG_POSTS = [
  '/blog/complete-guide-mock-data-generation',
  '/blog/faker-js-deep-dive',
  '/blog/json-schema-developer-guide',
  '/blog/database-seeding-best-practices',
  '/blog/i18n-best-practices-javascript',
  '/blog/api-testing-with-mock-data',
  '/blog/typescript-types-from-json',
  '/blog/csv-json-sql-export-formats',
  '/blog/localization-pipeline-react',
  '/blog/test-data-anti-patterns',
];

// Doc page slugs
const DOC_PAGES = [
  '/docs/mock-data-generator',
  '/docs/i18n-sync-tool',
  '/docs/export-formats',
  '/docs/ai-semantic-detection',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://ai-utils.work';
  const now = new Date();

  return [
    // Landing page - highest priority
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    // Mock generator - core feature
    {
      url: `${baseUrl}/mock`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    // i18n tool - main feature
    {
      url: `${baseUrl}/intl`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    // Privacy page
    {
      url: `${baseUrl}/privacy`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    // Generator pages - high priority for SEO
    ...LANDING_PAGES.filter((path) => path.startsWith('/generators/')).map((path) => ({
      url: `${baseUrl}${path}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    // Mock data pages - high priority for SEO
    ...LANDING_PAGES.filter((path) => path.startsWith('/mock-data/')).map((path) => ({
      url: `${baseUrl}${path}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    // Tools pages - high priority for SEO
    ...LANDING_PAGES.filter((path) => path.startsWith('/tools/')).map((path) => ({
      url: `${baseUrl}${path}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    // Use case pages - medium priority
    ...LANDING_PAGES.filter((path) => path.startsWith('/use-cases/')).map((path) => ({
      url: `${baseUrl}${path}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    // i18n sub-pages
    ...INTL_PAGES.filter((path) => path !== '/intl').map((path) => ({
      url: `${baseUrl}${path}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
    // Blog index
    {
      url: `${baseUrl}/blog`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    // About page
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    // Docs index
    {
      url: `${baseUrl}/docs`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    // Blog posts
    ...BLOG_POSTS.map((path) => ({
      url: `${baseUrl}${path}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    // Doc pages
    ...DOC_PAGES.map((path) => ({
      url: `${baseUrl}${path}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ];
}
