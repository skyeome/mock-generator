import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import {
  getIntlLandingPage,
  getAllIntlLandingPages,
} from '@/lib/seo/intl-pages';
import { IntlLandingPageTemplate } from '@/components/seo/intl-landing-page-template';

interface Props {
  params: Promise<{ feature: string }>;
}

export async function generateStaticParams() {
  const pages = getAllIntlLandingPages();
  return pages.map((p) => ({ feature: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { feature } = await params;
  const page = getIntlLandingPage(feature);
  if (!page) return {};

  return {
    title: page.title,
    description: page.description,
    keywords: page.keywords,
    openGraph: {
      title: page.title,
      description: page.description,
      type: 'website',
      url: `https://ai-utils.work${page.path}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: page.title,
      description: page.description,
    },
    alternates: {
      canonical: `https://ai-utils.work${page.path}`,
    },
  };
}

export default async function IntlFeaturePage({ params }: Props) {
  const { feature } = await params;
  const page = getIntlLandingPage(feature);

  if (!page) {
    notFound();
  }

  return <IntlLandingPageTemplate page={page} />;
}
