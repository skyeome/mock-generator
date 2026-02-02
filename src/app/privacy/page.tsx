import type { Metadata } from 'next';
import { PRIVACY_POLICY_METADATA } from '@/lib/consent/privacy-content';
import PrivacyContent from './privacy-content';

/**
 * Privacy Policy Page Component
 * GDPR-compliant privacy policy for Mock Data Generator
 *
 * Features:
 * - Table of contents with anchor links
 * - Responsive design with Tailwind CSS
 * - Last updated date display
 * - Smooth scrolling to sections
 * - Print-friendly layout
 */

export const metadata: Metadata = {
  title: 'Privacy Policy | Mock Data Generator',
  description:
    'GDPR-compliant privacy policy for Mock Data Generator. Learn how we protect your data and your rights.',
  robots: 'index, follow',
};

export default function PrivacyPage() {
  return <PrivacyContent />;
}
