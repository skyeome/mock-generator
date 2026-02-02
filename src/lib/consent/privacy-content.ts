/**
 * GDPR-Compliant Privacy Policy Content for Mock Data Generator
 * Last Updated: February 2, 2026
 *
 * This file contains the privacy policy text and metadata in Korean.
 * All GDPR Articles and requirements are included to ensure compliance
 * with GDPR regulations for European users.
 */

export const PRIVACY_POLICY_METADATA = {
  lastUpdated: '2026-02-02',
  language: 'ko',
  applicationName: 'Mock Data Generator',
  applicationURL: 'https://mockdatagenerator.com',
  dataControllerName: 'Mock Data Generator',
  dataControllerEmail: 'privacy@mockdatagenerator.com',
};

export const PRIVACY_POLICY_SECTIONS = {
  introduction: {
    title: '개요',
    content: `Mock Data Generator(이하 "당사")는 귀하의 개인정보 보호를 매우 중요하게 생각합니다. 이 개인정보 처리방침(이하 "방침")은 당사의 웹 애플리케이션 https://mockdatagenerator.com(이하 "서비스")을 이용할 때 수집되는 개인정보의 처리 방식을 설명합니다.

당사는 GDPR(일반 데이터 보호 규정) 및 기타 적용되는 개인정보 보호 법률을 준수하고 있습니다. 귀하의 개인정보는 법적 근거에 따라서만 처리되며, 귀하는 항상 귀하의 데이터에 대한 통제권을 유지합니다.

본 방침은 2026년 2월 2일을 기준으로 작성되었습니다.`,
  },

  dataCollected: {
    title: '수집하는 개인정보',
    content: `당사는 다음과 같은 범주의 개인정보를 수집할 수 있습니다:

**1. 자동 수집 데이터 (Automatic Data)**
- 쿠키 식별자 및 세션 토큰
- 기기 정보 (브라우저 유형, 운영체제)
- IP 주소
- 페이지 방문 시간 및 기간
- 참조 소스 (Referrer)

**2. 사용자 설정 데이터 (User Preference Data)**
- 테마 선택 (라이트/다크 모드)
- 언어 선택
- 내보내기 형식 선택
- 생성 설정 (배치 수, 시드값, 로케일)

**3. 서비스 사용 데이터 (Service Usage Data)**
- 생성된 데이터의 양과 유형 (실제 데이터는 저장되지 않음)
- 사용된 기능 (AI 분석, 내보내기 형식)
- 오류 및 성능 지표

**4. AI 처리 데이터 (선택사항)**
당사의 AI 기능을 사용하는 경우 다음 데이터가 Cloudflare Workers로 전송될 수 있습니다:
- JSON 스키마 구조 (실제 데이터 값은 포함되지 않음)
- 필드명 및 데이터 타입
- 스키마 메타데이터

**중요: 개인 데이터는 저장되지 않습니다**
당사는 귀하가 생성한 실제 모의 데이터를 저장하지 않습니다. 브라우저를 닫으면 모든 생성된 데이터는 삭제됩니다.`,
  },

  legalBasis: {
    title: '개인정보 처리의 법적 근거 (GDPR 제6조)',
    content: `당사는 다음과 같은 법적 근거에 따라 개인정보를 처리합니다:

**1. 필수 쿠키 및 기술 데이터 (법적 이익)**
- GDPR 제6조(1f): 당사의 정당한 이익(서비스 제공, 보안, 성능 개선)
- 브라우저를 통한 기본 기술 데이터는 서비스 제공을 위해 필수적입니다

**2. 사용자 선호도 (사용자 동의 또는 법적 이익)**
- GDPR 제6조(1a): 쿠키 및 추적 기술에 대한 명시적 동의
- GDPR 제6조(1f): localStorage를 통한 설정 저장의 정당한 이익

**3. 분석 및 성능 데이터 (사용자 동의)**
- GDPR 제6조(1a): 선택적 분석 도구 사용에 대한 명시적 동의
- 귀하는 언제든지 동의를 철회할 수 있습니다

**4. AI 기능 (선택적 사용자 동의)**
- GDPR 제6조(1a): AI 분석 기능 사용에 대한 명시적 동의
- 스키마 분석만 처리되며 개인 데이터는 처리되지 않습니다

**동의 철회**
쿠키 및 추적 도구에 대한 동의는 언제든지 철회할 수 있습니다. 철회는 기본 서비스 기능에 영향을 주지 않습니다.`,
  },

  processingPurposes: {
    title: '개인정보 처리 목적',
    content: `당사는 다음 목적을 위해 개인정보를 처리합니다:

**1. 서비스 제공 및 유지보수**
- Mock Data Generator 기능의 안정적 제공
- 사용자 선호도 저장 (테마, 언어, 설정)
- 기술적 오류 진단 및 수정

**2. 보안 및 사기 방지**
- 비정상적인 접근 패턴 감지
- DDoS 공격 및 악성 활동 차단
- 서비스 가용성 및 안정성 보장

**3. 서비스 개선 및 최적화**
- 기능 사용 패턴 분석 (집계된 데이터)
- 성능 메트릭 수집 및 분석
- 사용자 경험 개선을 위한 인사이트 수집

**4. 법적 준수 및 규정 준수**
- GDPR, ePrivacy Directive 준수
- 법원 명령 또는 법 집행 기관의 요청에 대한 대응
- 법적 분쟁 해결

**5. AI 기반 기능 (선택사항)**
- JSON 스키마에서 의미 있는 필드 탐지
- 보다 정확한 모의 데이터 생성
- AI 모델 성능 개선 (익명화된 피드백)

**목적 제한**
당사는 개인정보를 수집된 목적 이외의 다른 목적으로 처리하지 않습니다. 새로운 목적으로 처리할 필요가 있는 경우 별도의 법적 근거를 제시합니다.`,
  },

  cookies: {
    title: '쿠키 및 추적 기술',
    content: `당사는 다음과 같은 쿠키 및 추적 기술을 사용합니다:

**1. 필수 쿠키 (Necessary Cookies)**
- 카테고리: 기술적으로 필수
- 동의 여부: 기술적 필수 요소이므로 동의 불필요
- 용도: 세션 관리, 보안, 서비스 기능
- 저장 방식: localStorage 및 브라우저 쿠키
- 예시:
  - 사용자 세션 추적
  - CSRF 방지 토큰
  - 기본 보안 헤더

**2. 성능 쿠키 (Performance Cookies)**
- 카테고리: 분석 및 성능 추적
- 동의 여부: 명시적 동의 필요
- 용도: 서비스 성능 메트릭, 오류 추적, 속도 분석
- 저장 방식: localStorage, sessionStorage, 제3자 분석 도구
- 예시:
  - 페이지 로드 시간
  - API 응답 속도
  - JavaScript 오류 로깅

**3. 선호도 쿠키 (Preference Cookies)**
- 카테고리: 사용자 경험 개선
- 동의 여부: 기술적 필수 또는 사용자 동의
- 용도: 테마(라이트/다크), 언어 선택, 내보내기 형식 저장
- 저장 방식: localStorage
- 예시:
  - theme-preference: 'dark'
  - locale: 'ko-KR'
  - generator-config: {...}

**4. 마케팅 쿠키 (Marketing Cookies)**
- 카테고리: 광고 및 마케팅 추적
- 동의 여부: 명시적 동의 필수
- 용도: Google AdSense, 광고 타겟팅, 전환 추적
- 저장 방식: 제3자 쿠키
- 공급자: Google (doubleclick.net)

**5. 분석 쿠키 (Analytics Cookies)**
- 카테고리: 사용자 행동 분석
- 동의 여부: 명시적 동의 필수 (선택사항)
- 용도: 방문 통계, 사용자 흐름 분석
- 저장 방식: Cloudflare Analytics 토큰
- 공급자: Cloudflare

**쿠키 관리 및 거부**
귀하는 다음 방법으로 쿠키를 관리할 수 있습니다:

1. **브라우저 설정**: 브라우저의 쿠키 설정에서 쿠키를 거부하거나 제한할 수 있습니다
   - Chrome: 설정 > 개인정보 및 보안 > 쿠키 및 기타 사이트 데이터
   - Firefox: 설정 > 개인정보 > 쿠키 및 사이트 데이터
   - Safari: 환경설정 > 개인정보 > 쿠키 및 웹사이트 데이터

2. **당사 쿠키 동의 배너**: 서비스 방문 시 쿠키 동의 배너에서 선택사항을 관리할 수 있습니다

3. **제3자 도구**:
   - Your Online Choices (www.youronlinechoices.eu)를 통해 광고 추적 거부 가능

**추적 기술**
- LocalStorage: 사용자 선택사항 저장
- SessionStorage: 세션 중 임시 데이터 저장
- IndexedDB: 클라이언트 측 데이터 캐싱
- WebBeacons/Pixels: 사용자 상호작용 추적

필수 쿠키를 거부하면 일부 서비스 기능이 작동하지 않을 수 있습니다.`,
  },

  dataRetention: {
    title: '개인정보 보관 기간',
    content: `당사는 다음 기준에 따라 개인정보를 보관합니다:

**1. 생성된 모의 데이터**
- 보관 기간: 0일 (브라우저 닫음 즉시 삭제)
- 근거: 당사는 모의 데이터를 저장하지 않습니다
- 저장 방식: 클라이언트 메모리에만 임시 저장

**2. 사용자 설정 및 선호도**
- 보관 기간: 사용자가 삭제할 때까지
- 근거: 서비스 편의성 제공을 위한 정당한 이익
- 저장 방식: localStorage (클라이언트 측)
- 삭제 방법: 브라우저 캐시/쿠키 삭제 또는 개발자도구에서 수동 삭제

**3. 세션 데이터**
- 보관 기간: 30일 (마지막 활동 후)
- 근거: 보안 및 서비스 안정성
- 저장 방식: 서버 측 세션 저장소
- 자동 삭제: 비활동 30일 후

**4. 분석 데이터 (선택사항)**
- 보관 기간: 90일 (집계되지 않은 데이터)
- 근거: 서비스 개선 및 성능 분석
- 저장 방식: Cloudflare Analytics
- 집계 데이터: 무기한 (개인식별 불가능)

**5. 성능 및 오류 로그**
- 보관 기간: 30일
- 근거: 기술적 문제 진단 및 보안
- 저장 방식: Cloudflare Workers Logs

**6. 법적 보관 의무**
- 보관 기간: 법률이 요구하는 기간
- 근거: 법적 준수 및 규정 준수
- 예시:
  - 부정행위 조사: 최대 1년
  - 법적 분쟁: 분쟁 해결까지

**7. AI 처리 데이터**
- 보관 기간: 처리 직후 삭제
- 근거: 개인정보 최소화 원칙
- 저장 방식: Cloudflare Workers (임시)

**보관 기간 초과 시 조치**
보관 기간이 초과된 개인정보는 다음과 같이 처리됩니다:
- 암호화 또는 익명화
- 보안 삭제 (데이터 복구 불가능하게)
- 법적 보관 의무가 있는 경우 보호된 환경에서 보관

**보관 기간 단축 요청**
귀하는 보관 기간을 단축해달라는 요청을 할 수 있습니다. 이 경우 당사는 법적 의무 범위 내에서 요청을 검토합니다.`,
  },

  thirdPartySharing: {
    title: '제3자 데이터 공유',
    content: `당사는 다음과 같은 제3자와 개인정보를 공유합니다:

**1. Cloudflare, Inc.**
- 역할: 호스팅, CDN, 워커, AI 서비스 공급자
- 공유 데이터:
  - 세션 데이터 및 쿠키
  - JSON 스키마 (AI 분석 선택 시에만)
  - 성능 및 보안 로그
  - IP 주소 및 요청 메타데이터
- 계약: Data Processing Agreement (DPA) 체결
- 데이터 보호: EU-US Data Privacy Framework 준수
- 위치: 미국 (표준 계약 조항으로 보호)
- 더 보기: https://www.cloudflare.com/privacy/

**2. Google (Google AdSense)**
- 역할: 광고 서버 및 광고 타겟팅
- 공유 데이터:
  - 광고 관련 쿠키 및 식별자
  - 페이지 방문 정보
  - 브라우저 및 기기 정보
- 계약: Google Ads Data Processing Terms
- 데이터 보호: GDPR 준수
- 더 보기: https://policies.google.com/privacy

**3. 분석 서비스 (Cloudflare Analytics)**
- 역할: 사용자 행동 분석 (선택사항)
- 공유 데이터:
  - 페이지 뷰 및 방문 시간
  - 기기 및 브라우저 정보
  - 트래픽 소스
  - 성능 메트릭
- 계약: Cloudflare DPA
- 데이터 보호: GDPR 준수

**4. 법 집행 기관 및 정부 기관**
- 역할: 법적 요청 대응
- 공유 데이터: 법원 명령에 따라 필요한 정보
- 조건:
  - 유효한 법원 명령 또는 영장 필요
  - 가능한 범위 내에서 사용자 통지
  - 법적 특권 보호

**5. 컨설턴트 및 서비스 제공자**
- 법무법인, 회계법인, IT 보안 업체
- 계약: 비밀유지 협약 체결
- 접근 제한: 필요한 정보에만 제한

**제3자 정책**
당사는 데이터를 공유할 때 다음을 보장합니다:
- 제3자도 GDPR을 준수해야 함
- 적절한 데이터 처리 계약 체결
- 제3자에 대한 정기적인 감시 및 감사
- 데이터 유출 시 책임 조항 포함

**데이터 처리 계약 (DPA)**
당사는 모든 데이터 처리자와 GDPR 제28조에 따른 데이터 처리 계약을 체결합니다. DPA 사본은 요청 시 제공됩니다.

**공유 제한**
당사는 다음 경우를 제외하고는 개인정보를 제3자에게 판매하거나 양도하지 않습니다:
- GDPR 준수 필요
- 법원 명령 또는 법 집행 기관의 요청
- 사용자의 명시적 동의`,
  },

  internationalTransfers: {
    title: '국제 데이터 전송',
    content: `당사는 다음과 같은 경우 데이터를 EU/EEA 외부로 전송합니다:

**1. Cloudflare (미국)**
- 법적 근거: 표준 계약 조항 (Standard Contractual Clauses, SCCs)
- 데이터: 서비스 제공에 필수적인 기술 데이터
- 보호 메커니즘:
  - Cloudflare의 Data Processing Agreement (DPA)
  - EU-US Data Privacy Framework 준수
  - 암호화 전송 (TLS/SSL)
  - 액세스 제어 및 최소 권한 원칙

**2. Google AdSense (미국)**
- 법적 근거: 표준 계약 조항 (SCCs)
- 데이터: 광고 서빙 및 성능 데이터
- 보호 메커니즘:
  - Google Ads Data Processing Terms
  - GDPR 준수 정책
  - 개인정보 보안 표준 준수

**법적 보호 메커니즘**

**1. 표준 계약 조항 (Standard Contractual Clauses, SCCs)**
- EU 위원회 승인: 2021/914, 2010/87
- 내용: 데이터 처리자의 의무 및 책임
- 강화: Schrems II 판결에 따른 추가 보호
  - 암호화된 전송
  - 액세스 제제 및 인증
  - 일반인에게 공개되지 않는 데이터 저장

**2. EU-US Data Privacy Framework**
- Cloudflare 인증: ✓ (https://www.privacyshield.gov)
- Google 인증: ✓
- 요구사항: 정기적인 모니터링 및 재인증

**3. 데이터 전송 절차**
1단계: 전송 필요성 평가 (적법성 검토)
2단계: 저장국의 법률 검토 (미국 감시 법률)
3단계: SCCs 또는 기타 메커니즘 적용
4단계: 추가 보호 조치 실행 (암호화 등)
5단계: 정기적 위험 평가

**4. 미국 법 감시 법률에 대한 대처**
미국의 FISA Section 702, Executive Order 12333 등의 감시 법률에 대해:
- Cloudflare의 투명성 보고서 (Transparency Report) 검토
- 정부 요청에 대한 최소주의 원칙
- 최대한 가능한 범위에서 사용자 통지
- 법적 분쟁 시 저항 권리

**5. 전송 주요 보호 사항**
- 암호화: 전송 중 AES-256 (또는 동등)
- 인증: TLS 1.3 이상
- 최소화: 필수 데이터만 전송
- 익명화: 개인식별 정보 제거 (가능한 경우)
- 감시: 정기적 보안 감사 및 침투 테스트

**귀하의 권리**
- 데이터 전송 거부: 제3자 서비스 거부 가능 (기본 기능 제외)
- 정보 요청: 전송 세부사항 공개 요청 가능
- 이의 제기: privacy@mockdatagenerator.com으로 문의

**추가 정보**
- EU 개인정보 보호 위원회 (EDPB) 권고사항: EDPB/00/2020
- SCCs 텍스트: https://ec.europa.eu/info/law/law-topic/data-protection_en`,
  },

  userRights: {
    title: '정보주체의 권리 (GDPR)',
    content: `GDPR에 따라 귀하는 다음과 같은 권리를 가지고 있습니다:

**1. 정보 접근권 (Right to Access, GDPR Article 15)**
- 귀하는 당사가 보유한 귀하의 개인정보 확인을 요청할 수 있습니다
- 포함 사항:
  - 처리되는 개인정보의 종류
  - 처리의 목적
  - 제3자 공유 여부
  - 보관 기간
  - 데이터 소스
- 요청 방법: privacy@mockdatagenerator.com으로 이메일 전송
- 응답 기간: 30일 (연장 가능)
- 비용: 원칙적으로 무료

**2. 수정권 (Right to Rectification, GDPR Article 16)**
- 귀하는 부정확하거나 불완전한 개인정보의 수정을 요청할 수 있습니다
- 예시:
  - 잘못된 언어 설정 수정
  - 오류가 있는 선호도 정정
- 요청 방법: privacy@mockdatagenerator.com으로 연락
- 당사는 합리적인 기간 내에 수정합니다

**3. 삭제권 (Right to Erasure/Right to be Forgotten, GDPR Article 17)**
- 다음 경우 귀하의 개인정보 삭제를 요청할 수 있습니다:
  - 목적이 달성되었을 때
  - 동의를 철회했을 때
  - 합법적 이의가 있을 때
  - 불법적으로 처리되었을 때
  - 법적 의무 충족을 위해 필요할 때

- 삭제되는 정보:
  - localStorage 설정
  - 세션 데이터
  - 분석 데이터

- 삭제되지 않는 정보:
  - 법적 의무가 있는 데이터 (예: 사기 조사)
  - 공익 목적 데이터

- 요청 방법: privacy@mockdatagenerator.com으로 "삭제 요청"
- 응답 기간: 30일 이내

**4. 처리 제한권 (Right to Restrict Processing, GDPR Article 18)**
- 다음 경우 개인정보 처리 제한을 요청할 수 있습니다:
  - 정확성에 이의가 있을 때
  - 처리가 불법이나 삭제를 원하지 않을 때
  - 당사에는 더 이상 필요 없지만 법적 청구를 위해 필요할 때
  - 정당한 이익에 대해 이의를 제기했을 때

- 효과:
  - 해당 데이터는 저장만 되고 처리되지 않음
  - 동의 철회 시까지 또는 이의 해결까지 유지

- 요청 방법: privacy@mockdatagenerator.com으로 "처리 제한 요청"

**5. 데이터 이동권 (Right to Data Portability, GDPR Article 20)**
- 귀하가 제공한 개인정보를 구조화되고 일반적으로 사용되는 기계 판독 가능한 형식으로 받을 수 있습니다
- 포함 범위:
  - 사용자 설정
  - 세션 데이터
  - 분석 정보

- 형식:
  - JSON 형식
  - CSV 형식

- 요청 방법: privacy@mockdatagenerator.com으로 "데이터 이동 요청"
- 응답 기간: 30일 이내

**6. 이의 제기권 (Right to Object, GDPR Article 21)**
- 정당한 이익 기반의 처리에 이의를 제기할 수 있습니다
- 예시:
  - 성능 분석에 대한 이의
  - 마케팅 목적의 데이터 처리에 대한 이의

- 영향:
  - 이의 수용 시 해당 처리 중단
  - 필수 기능은 계속 작동
  - 새로운 기술적 근거 필요

- 요청 방법: privacy@mockdatagenerator.com으로 "이의 제기"

**7. 동의 철회권**
- 동의 기반의 처리에 대해 언제든 동의를 철회할 수 있습니다
- 철회 대상:
  - 쿠키 동의
  - AI 기능 사용 동의
  - 분석 도구 동의

- 효과:
  - 철회 후 처리 중단
  - 철회 이전 처리는 합법적 (이미 동의했으므로)

- 요청 방법:
  - 쿠키 배너에서 직접 설정 변경
  - 또는 privacy@mockdatagenerator.com으로 이메일

**8. 자동화된 개별 결정에 대한 권리 (GDPR Article 22)**
- 귀하의 권리에만 영향을 미치는 자동화된 개별적 의사결정 대상이 되지 않을 권리
- 당사의 현황: 현재 자동화된 개별적 의사결정 시스템 없음

**9. 불만 제기권**
- 귀하는 감독 기관(데이터 보호 당국)에 불만을 제기할 수 있습니다
- 한국: 개인정보 보호위원회 (PIPC)
  - 웹사이트: https://www.pipc.go.kr
  - 전화: 1833-6237

- EU 회원국 데이터 보호 당국:
  - 벨기에: https://www.autoriteprotectiondonnees.be
  - 독일: https://www.bfdi.bund.de
  - 프랑스: https://www.cnil.fr

**10. 법적 대리인 통한 권리 행사**
- 귀하는 변호사 또는 권리 옹호자를 통해 권리를 행사할 수 있습니다

**권리 행사 절차**
1단계: 요청 작성 (이메일로 privacy@mockdatagenerator.com)
2단계: 신원 확인 (본인 확인을 위한 추가 정보 요청 가능)
3단계: 처리 (30일 이내, 복잡한 경우 60일까지 연장 가능)
4단계: 응답 및 조치 (이메일로 회신)

**거절 및 제한**
당사는 다음의 경우 요청을 거절할 수 있습니다:
- 신원 확인이 불가능할 때
- 명백히 근거 없는 반복 요청
- 제3자의 권리를 위반할 때
- 과도한 비용이 드는 경우

이 경우 거절 사유를 설명하고 이의 제기 권리를 안내합니다.`,
  },

  childrenPrivacy: {
    title: '아동의 개인정보 보호',
    content: `**아동 정의**
GDPR 제8조에 따라 아동은 16세 미만의 인물입니다 (국가별로 다를 수 있음).

**한국 기준**
- 만 14세 미만: 부모 또는 법정대리인의 동의 필수
- 만 14세 이상 만 16세 미만: 본인 동의 + 부모 동의 권장

**EU 회원국 기준**
- 벨기에, 불가리아, 크로아티아, 덴마크, 핀란드, 프랑스, 헝가리, 이탈리아, 라트비아, 리투아니아, 룩셈부르크, 몰타, 네덜란드, 폴란드, 루마니아, 슬로베니아, 스페인: 만 16세 미만
- 독일, 오스트리아, 체코, 키프로스, 그리스, 아일랜드, 포르투갈, 슬로바키아, 스웨덴: 만 13세 미만
- 국가별 법률 참조: https://gdpr-info.eu/art-8-gdpr/

**당사의 아동 정책**
당사 서비스는 주로 개발자와 기술 전문가를 대상으로 합니다. 다음과 같은 조치를 취합니다:

1. **명시적 나이 확인 없음**
   - 당사는 명시적인 나이 게이트 또는 확인 시스템을 운영하지 않습니다
   - 그러나 서비스의 기술적 성격상 아동 사용자는 많지 않을 것으로 예상됩니다

2. **아동 데이터 처리 제한**
   - 아동 데이터로 확인되는 경우 즉시 보호 조치 강화
   - 광고 및 마케팅 추적 제거
   - 분석 데이터 수집 중단

3. **부모 동의 정책**
   - 아동이 당사 서비스를 사용하는 경우 부모/법정대리인의 동의 권장
   - 부모가 아동 데이터의 삭제를 요청할 수 있습니다

4. **아동 보호 조치**
   - 개인정보 저장 최소화 (localStorage만 사용)
   - 프로파일링 및 자동화된 의사결정 없음
   - 서비스 내 명확한 개인정보 보호 안내

5. **부모 요청 처리**
   - 부모/법정대리인은 자녀의 개인정보에 대해 다음을 요청할 수 있습니다:
     - 접근 (GDPR Article 15)
     - 삭제 (GDPR Article 17)
     - 수정 (GDPR Article 16)
   - 요청: privacy@mockdatagenerator.com으로 부모 신원 증명과 함께 연락

6. **부모 또는 보호자의 책임**
   - 아동의 온라인 활동 감시 및 지도
   - 서비스 이용 약관 및 본 정책 검토
   - 아동이 개인정보를 공개하지 않도록 교육

**아동 관련 연락처**
아동 개인정보 문제가 있는 경우:
- 이메일: privacy@mockdatagenerator.com
- 제목: "아동 개인정보 보호 관련"

**추가 정보**
- UNICEF 아동 인터넷 안전 가이드: https://www.unicef.org/internet-safety
- EU 아동 보호 지침: https://ec.europa.eu/digital-single-market/en/news-redirect/699646`,
  },

  policyChanges: {
    title: '정책 변경 및 업데이트',
    content: `**정책 변경의 이유**
당사는 다음과 같은 이유로 이 개인정보 처리방침을 변경할 수 있습니다:
- 법률 또는 규정의 변경 (예: GDPR 강화)
- 당사 서비스의 기능 추가 또는 변경
- 보안 정책 강화
- 사용자 의견 반영

**변경 통지 방법**
당사는 정책 변경에 대해 다음과 같이 통지합니다:

1. **주요 변경사항** (사용자 권리에 영향을 미치는 경우)
   - 사전 공지: 변경 30일 전 이메일 또는 배너 안내
   - 사용자 동의: 필요한 경우 명시적 동의 요청
   - 예시:
     - 새로운 제3자와의 데이터 공유
     - 데이터 처리 목적의 대폭적 확대
     - 법적 근거의 변경

2. **부차적 변경사항** (사용자 권리에 직접 영향 없는 경우)
   - 웹사이트 공지: 정책 업데이트 공고
   - 이메일 뉴스레터: 주요 변경사항만 요약
   - 예시:
     - 연락처 정보 변경
     - 설명 텍스트 개선
     - 프로세스 명확화

3. **긴급 변경사항** (보안 또는 법률상 필요한 경우)
   - 즉시 공지 및 적용
   - 상세 설명과 함께 통지
   - 예시:
     - 데이터 유출 대응
     - 긴급 법률 요구사항

**변경 유효 시점**
- 공지된 변경: 공지 후 30일 (또는 명시된 기간)
- 긴급 변경: 공지 즉시
- 사용자가 변경 유효 날짜 이후에도 서비스를 계속 사용하면 변경된 정책에 동의한 것으로 간주됩니다

**이전 버전 정책**
귀하는 다음 방법으로 이전 버전의 정책을 확인할 수 있습니다:
- GitHub 저장소: https://github.com/your-repo/commits/privacy
- 당사에 이메일 요청: privacy@mockdatagenerator.com

**정책 버전 관리**
- 최신 버전: 2026-02-02
- 변경 로그: 각 버전의 변경 사항 추적

**피드백 및 제안**
귀하의 개인정보 보호 관련 의견과 제안을 환영합니다:
- 이메일: privacy@mockdatagenerator.com
- 제목: "정책 피드백" 또는 "개선 제안"

**변경 이력**
| 날짜 | 버전 | 주요 변경사항 |
|------|------|------------|
| 2026-02-02 | 1.0 | 최초 공개 버전 (GDPR 완전 준수) |`,
  },

  contact: {
    title: '연락처 정보',
    content: `**데이터 컨트롤러 (Data Controller)**

Mock Data Generator는 GDPR에서 정의한 데이터 컨트롤러로서 귀하의 개인정보 처리에 대한 책임을 집니다.

조직명: Mock Data Generator
웹사이트: https://mockdatagenerator.com
이메일: privacy@mockdatagenerator.com
주소: [회사 주소 입력]
대표자: [대표자명]

**개인정보 보호 담당 부서**

개인정보 보호와 관련된 모든 문의는 다음 부서로 연락주세요:

부서명: Privacy & Compliance Team
이메일: privacy@mockdatagenerator.com
응답 시간: 영업일 기준 2-3일
언어: 한국어, 영어

**요청 유형별 연락처**

1. **개인정보 접근/수정/삭제 요청**
   - 이메일: privacy@mockdatagenerator.com
   - 제목: "개인정보 [접근/수정/삭제] 요청"
   - 포함 내용:
     - 요청자 이름
     - 요청 유형
     - 세부 사항
     - 필요한 경우 신원 증명 정보

2. **데이터 유출 보고**
   - 이메일: security@mockdatagenerator.com (긴급)
   - 제목: "데이터 유출 보고"
   - 즉시 연락 권장 (지연 시간 최소화)

3. **개인정보 보호 정책 관련 문의**
   - 이메일: privacy@mockdatagenerator.com
   - FAQ 페이지: https://mockdatagenerator.com/privacy-faq

4. **불만 제기**
   - 1차: 당사에 직접 연락 (privacy@mockdatagenerator.com)
   - 2차: 해당 국가의 데이터 보호 당국

**응답 약속**

당사는 다음과 같은 약속을 이행합니다:

- 이메일 수신 확인: 24시간 이내
- 초기 검토: 3일 이내
- 최종 응답: 30일 이내 (GDPR 기준)
- 복잡한 요청: 최대 60일 (GDPR Article 12(3))

**법적 분쟁 또는 법 집행 기관 요청**

법원 명령이나 법 집행 기관의 요청에 대해:

연락처:
- 법무담당: legal@mockdatagenerator.com
- 긴급: [긴급 연락처]

당사는 법적 요청에 대해:
- 합법성 검증
- 가능한 한 사용자 통지
- 최소 필수 정보만 공개

**데이터 보호 당국**

귀하는 다음 데이터 보호 당국에 불만을 제기할 수 있습니다:

**한국**
- 조직: 개인정보 보호위원회 (Personal Information Protection Commission)
- 웹사이트: https://www.pipc.go.kr
- 전화: 1833-6237
- 주소: 서울시 강남구 테헤란로 402, 5층

**EU 회원국 (예시)**

**벨기에**
- Autorité de Protection des Données (APD)
- https://www.autoriteprotectiondonnees.be
- +32 2 274 48 00

**독일**
- Bundesbeauftragte für Datenschutz (BfDI)
- https://www.bfdi.bund.de
- +49 228 997799-0

**프랑스**
- Commission Nationale de l'Informatique et des Libertés (CNIL)
- https://www.cnil.fr
- +33 1 53 73 22 22

**기타 EU 회원국**
각 국가의 데이터 보호 당국:
https://edpb.ec.europa.eu/about-edpb/members_en

**응급 연락처**

데이터 유출이나 긴급 개인정보 보호 사건의 경우:
- 이메일: security@mockdatagenerator.com
- 이메일 응답 시간: 2시간 이내 (업무시간)
- 24시간 긴급 핫라인: [전화번호] (제공 시)

**온라인 분쟁 해결**

EU 소비자인 경우 온라인 분쟁 해결 플랫폼을 사용할 수 있습니다:
- https://ec.europa.eu/consumers/odr
- ODR 플랫폼을 통해 당사와의 분쟁을 온라인으로 해결 가능

**대표 지정 (GDPR Article 27)**

EU에 거주하지 않는 컨트롤러의 경우, GDPR Article 27에 따라 EU 내 대표자를 지정할 수 있습니다:

EU 대표: [대표명]
이메일: [대표 이메일]
주소: [EU 주소]`,
  },
};

/**
 * Privacy Policy Table of Contents
 * Used for generating navigation links and outline
 */
export const PRIVACY_POLICY_TOC = [
  { id: 'introduction', label: '개요' },
  { id: 'data-collected', label: '수집하는 개인정보' },
  { id: 'legal-basis', label: '개인정보 처리의 법적 근거' },
  { id: 'processing-purposes', label: '개인정보 처리 목적' },
  { id: 'cookies', label: '쿠키 및 추적 기술' },
  { id: 'data-retention', label: '개인정보 보관 기간' },
  { id: 'third-party-sharing', label: '제3자 데이터 공유' },
  { id: 'international-transfers', label: '국제 데이터 전송' },
  { id: 'user-rights', label: '정보주체의 권리' },
  { id: 'children-privacy', label: '아동의 개인정보 보호' },
  { id: 'policy-changes', label: '정책 변경 및 업데이트' },
  { id: 'contact', label: '연락처 정보' },
];

/**
 * GDPR Article References
 * Mapping of GDPR articles mentioned in the policy
 */
export const GDPR_REFERENCES = {
  'Article 6': 'Lawfulness of processing',
  'Article 8': "Child's data protection",
  'Article 12': "Transparency in communication with data subjects",
  'Article 13': 'Information to be provided where personal data are collected',
  'Article 14': 'Information to be provided where personal data have not been obtained',
  'Article 15': 'Right of access by the data subject',
  'Article 16': 'Right to rectification',
  'Article 17': 'Right to erasure',
  'Article 18': 'Right to restrict processing',
  'Article 20': 'Right to data portability',
  'Article 21': 'Right to object',
  'Article 22': 'Automated individual decision-making',
  'Article 27': 'Representative of a controller',
  'Article 28': 'Data Processing Agreement',
  'Article 32': 'Security of processing',
  'Article 33': 'Notification of a personal data breach',
  'Article 34': 'Communication of a personal data breach',
};

/**
 * Cookie Categories for Consent Management
 * Used with cookie consent banner
 */
export const COOKIE_CATEGORIES = {
  necessary: {
    name: '필수 쿠키',
    description: '서비스 제공에 필수적인 쿠키',
    defaultEnabled: true,
    required: true,
  },
  preferences: {
    name: '선호도 쿠키',
    description: '사용자 설정 저장 (테마, 언어 등)',
    defaultEnabled: true,
    required: false,
  },
  analytics: {
    name: '분석 쿠키',
    description: '서비스 개선을 위한 사용 통계',
    defaultEnabled: false,
    required: false,
  },
  marketing: {
    name: '마케팅 쿠키',
    description: '광고 및 마케팅 목적의 추적',
    defaultEnabled: false,
    required: false,
  },
};
