import { LANDING_PAGES } from '../src/lib/seo/pages';
import type { LandingPage } from '../src/lib/seo/types';

const MIN_WORDS_PER_PAGE = 500;

function countWords(page: LandingPage): number {
  const allText = [
    page.content.intro,
    ...page.content.features,
    ...page.content.howTo,
    ...page.content.faq.flatMap((f) => [f.q, f.a]),
  ].join(' ');

  return allText.split(/\s+/).filter(Boolean).length;
}

function validateContent() {
  const failures: string[] = [];

  for (const page of LANDING_PAGES) {
    const wordCount = countWords(page);
    if (wordCount < MIN_WORDS_PER_PAGE) {
      failures.push(
        `${page.path}: ${wordCount} words (minimum: ${MIN_WORDS_PER_PAGE})`
      );
    }
  }

  if (failures.length > 0) {
    console.error('❌ Content validation failed:');
    failures.forEach((f) => console.error(`  - ${f}`));
    process.exit(1);
  }

  console.log(
    `✅ All ${LANDING_PAGES.length} pages meet minimum word count (${MIN_WORDS_PER_PAGE}+ words)`
  );
}

validateContent();
