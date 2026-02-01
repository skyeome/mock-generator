export interface LandingPage {
  slug: string;
  path: string;
  category: 'tools' | 'use-cases' | 'mock-data' | 'generators';
  title: string;
  description: string;
  h1: string;
  keywords: string[];
  content: {
    intro: string;
    features: string[];
    howTo: string[];
    faq: { q: string; a: string }[];
  };
  relatedPages: string[];
}
