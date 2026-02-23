import { Metadata } from 'next';
import { I18nSyncPage } from '@/components/intl';
import { StructuredData } from '@/components/seo/structured-data';

// ============================================================
// TODO: AdSense 승인 후 - 디스플레이 광고 추가
// ============================================================
// 1. 이 페이지를 src/app/(content)/ 그룹으로 이동 (AdSenseScript 자동 로드)
//    또는 직접 import:
//    import { AdSenseScript } from '@/components/ads/adsense-script';
//    import { DisplayAd } from '@/components/ads/display-ad';
//
// 2. 추천 광고 배치:
//    [상단 배너] I18nSyncPage 위 → 728x90 leaderboard 또는 반응형
//    [하단 배너] I18nSyncPage 아래 → 320x50 mobile 또는 반응형
//
// 3. 실제 슬롯 ID는 AdSense 대시보드에서 생성 후 교체
// ============================================================

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
      {/* [AdSense 승인 후] 상단 배너 광고 자리
      <DisplayAd slot="YOUR_SLOT_ID" format="horizontal" className="mb-4" />
      */}

      <I18nSyncPage />

      {/* [AdSense 승인 후] 하단 배너 광고 자리
      <DisplayAd slot="YOUR_SLOT_ID" format="horizontal" className="mt-4" />
      */}
    </>
  );
}
