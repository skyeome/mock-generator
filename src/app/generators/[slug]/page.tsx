import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getLandingPage, getLandingPagesByCategory } from '@/lib/seo/pages';
import { LandingPageTemplate } from '@/components/seo/landing-page-template';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const pages = getLandingPagesByCategory('generators');
  return pages.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = getLandingPage(slug, 'generators');
  if (!page) return {};

  return {
    title: page.title,
    description: page.description,
    keywords: page.keywords,
    openGraph: {
      title: page.title,
      description: page.description,
    },
  };
}

export default async function GeneratorPage({ params }: Props) {
  const { slug } = await params;
  const page = getLandingPage(slug, 'generators');
  if (!page) notFound();

  return <LandingPageTemplate page={page} />;
}
