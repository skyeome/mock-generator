const LOCALE_CODE_MAP: Record<string, string> = {
  en: 'en',
  english: 'en',
  'en-us': 'en',
  'en-gb': 'en',
  ko: 'ko',
  korean: 'ko',
  kr: 'ko',
  'ko-kr': 'ko',
  ja: 'ja',
  japanese: 'ja',
  jp: 'ja',
  'ja-jp': 'ja',
  zh: 'zh',
  chinese: 'zh',
  cn: 'zh',
  'zh-cn': 'zh',
  'zh-tw': 'zh',
  es: 'es',
  spanish: 'es',
  sp: 'es',
  fr: 'fr',
  french: 'fr',
  de: 'de',
  german: 'de',
  it: 'it',
  italian: 'it',
  pt: 'pt',
  portuguese: 'pt',
  'pt-br': 'pt',
  br: 'pt',
  ru: 'ru',
  russian: 'ru',
  ar: 'ar',
  arabic: 'ar',
  hi: 'hi',
  hindi: 'hi',
  nl: 'nl',
  dutch: 'nl',
  pl: 'pl',
  polish: 'pl',
  tr: 'tr',
  turkish: 'tr',
  vi: 'vi',
  vietnamese: 'vi',
  th: 'th',
  thai: 'th',
  id: 'id',
  indonesian: 'id',
  uk: 'uk',
  ukrainian: 'uk',
  cs: 'cs',
  czech: 'cs',
  sv: 'sv',
  swedish: 'sv',
};

export function detectLocaleFromFileName(fileName: string): string | null {
  if (!fileName.toLowerCase().endsWith('.json')) {
    return null;
  }

  const baseName = fileName.replace(/\.json$/i, '').toLowerCase();
  const fullMatch = LOCALE_CODE_MAP[baseName];
  if (fullMatch) {
    return fullMatch;
  }

  const tokens = baseName.split(/[._-]/).filter(Boolean);
  for (let i = 0; i < tokens.length; i++) {
    const single = LOCALE_CODE_MAP[tokens[i]];
    if (single) {
      return single;
    }

    const next = tokens[i + 1];
    if (!next) {
      continue;
    }

    const joined = `${tokens[i]}-${next}`;
    const regional = LOCALE_CODE_MAP[joined];
    if (regional) {
      return regional;
    }
  }

  return null;
}
