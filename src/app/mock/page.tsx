import { MockGeneratorClient } from '@/components/mock/mock-generator-client';

// ============================================================
// TODO: AdSense 승인 후 - 디스플레이 광고 추가
// ============================================================
// 1. 이 페이지를 src/app/(content)/ 그룹으로 이동 (AdSenseScript 자동 로드)
//    또는 아래처럼 직접 import:
//    import { AdSenseScript } from '@/components/ads/adsense-script';
//    import { DisplayAd } from '@/components/ads/display-ad';
//
// 2. 추천 광고 배치:
//    [상단 배너] MockGeneratorClient 위 → 728x90 leaderboard 또는 반응형
//    [하단 배너] MockGeneratorClient 아래 → 320x50 mobile 또는 반응형
//
// 3. 실제 슬롯 ID는 AdSense 대시보드에서 생성 후 교체
// ============================================================

export default function MockPage() {
  return (
    <>
      {/* [AdSense 승인 후] 상단 배너 광고 자리
      <DisplayAd slot="YOUR_SLOT_ID" format="horizontal" className="mb-4" />
      */}

      <MockGeneratorClient />

      {/* [AdSense 승인 후] 하단 배너 광고 자리
      <DisplayAd slot="YOUR_SLOT_ID" format="horizontal" className="mt-4" />
      */}
    </>
  );
}
