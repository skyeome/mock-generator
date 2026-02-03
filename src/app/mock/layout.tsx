import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mock Data Generator - Generate Test Data from JSON | AI Utils',
  description: 'Generate realistic mock data from JSON schemas. AI-powered semantic detection, export to JSON, CSV, SQL, TypeScript. 100% free, runs in your browser.',
};

export default function MockLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
