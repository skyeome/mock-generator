import type { IntlLandingPage } from './types';

const intlLandingPages: IntlLandingPage[] = [
  {
    slug: 'translate-json',
    path: '/intl/translate-json',
    category: 'intl',
    title: 'Translate JSON Files with AI | Free JSON Translation Tool',
    description:
      'AI-powered JSON file translation tool. Automatically translate i18n JSON files while preserving structure. Support for 100+ languages with context-aware translations.',
    h1: 'Translate JSON Files with AI',
    keywords: [
      'translate json file',
      'json translation tool',
      'ai json translator',
      'localize json files',
      'json i18n translation',
      'multilingual json',
    ],
    content: {
      intro:
        'Translate your JSON files effortlessly with our AI-powered translation tool. Maintain perfect JSON structure while converting content to over 100 languages. Ideal for developers managing multi-language applications, i18n resources, and localized configurations.',
      features: [
        'AI-powered context translation - Understands domain-specific terminology for accurate translations beyond word-for-word conversion',
        'Structure preservation - Automatically preserves JSON structure, keys, and formatting while translating only the values',
        '100+ language support - Translate to and from major world languages including English, Spanish, French, German, Chinese, Japanese, Korean',
        'Batch processing - Process multiple JSON files or large translation resources in a single operation',
        'Developer-friendly output - Download translated JSON files ready for immediate use with proper encoding and formatting',
        'Variable preservation - Smart detection and preservation of placeholders like {{name}}, {0}, and $var',
      ],
      howTo: [
        'Upload your source JSON file (e.g., en.json) and target JSON file to the i18n Sync Tool',
        'Select your source and target languages from the dropdown menus',
        'Select the keys you want to translate - use "Select All Missing" for quick bulk selection',
        'Click "Translate Selected" and let AI generate accurate translations instantly',
        'Review the translations in the Monaco diff editor and export your updated JSON file',
      ],
      faq: [
        {
          q: 'Which JSON structures are supported for translation?',
          a: 'Our tool supports all valid JSON structures including nested objects, arrays, and mixed content. Keys remain unchanged while values are translated.',
        },
        {
          q: 'How accurate are AI translations compared to human translation?',
          a: 'AI translations achieve 85-95% accuracy for common content. For production applications, we recommend reviewing critical translations, but our AI handles technical terminology and context well.',
        },
        {
          q: 'Are my translation files sent to external servers?',
          a: 'Translation processing uses Cloudflare Workers AI for secure, fast translations. Your data is processed in isolated environments and never stored permanently.',
        },
      ],
    },
    relatedPages: [
      '/tools/json-to-csv',
      '/tools/json-schema-generator',
      '/use-cases/frontend-development',
      '/use-cases/api-testing',
      '/intl/i18n-diff',
      '/intl/translation-sync',
      '/intl/json-localization',
    ],
    structuredData: {
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Web Browser',
      offers: { price: '0', priceCurrency: 'USD' },
    },
  },
  {
    slug: 'i18n-diff',
    path: '/intl/i18n-diff',
    category: 'intl',
    title: 'i18n JSON Diff & Comparison Tool | Compare Translation Files',
    description:
      'Compare i18n JSON files to find missing translations, detect inconsistencies, and track changes. Essential tool for managing multi-language applications.',
    h1: 'i18n JSON Diff & Comparison Tool',
    keywords: [
      'i18n diff tool',
      'compare translation files',
      'json diff checker',
      'translation comparison',
      'i18n key diff',
      'missing translations',
    ],
    content: {
      intro:
        'Identify missing translations, track changes, and maintain consistency across your internationalization files. Our i18n diff tool compares JSON translation files to quickly spot discrepancies, untranslated keys, and structural differences between language versions.',
      features: [
        'Missing key detection - Instantly identify translation keys present in one language but missing in others',
        'Visual diff interface - Side-by-side Monaco editor with color-coded highlights for added, removed, and modified translations',
        'Nested structure support - Compare deeply nested JSON structures and namespaced translation keys with full path visibility',
        'Type mismatch detection - Catch structural issues where source and target have incompatible value types',
        'Orphaned key detection - Find keys in target that do not exist in source, indicating potential cleanup needed',
        'Bulk comparison - Compare base language against target to get a complete overview of translation status',
      ],
      howTo: [
        'Upload your base language JSON file (typically en.json) as the source file',
        'Upload the translation file you want to compare as the target file',
        'View the automatic analysis showing missing, orphaned, and type mismatch issues',
        'Click on any key in the tree view to see the detailed diff in the Monaco editor',
        'Export the comparison report or use the tool to fix issues directly',
      ],
      faq: [
        {
          q: 'How does it handle nested translation keys?',
          a: 'The tool recursively compares nested objects and displays the full path for each key (e.g., "user.profile.title"), making it easy to locate issues in complex translation structures.',
        },
        {
          q: 'Does it work with i18next, react-intl, and other frameworks?',
          a: 'Absolutely. Our tool is framework-agnostic and works with any JSON-based i18n solution including i18next, react-intl, vue-i18n, Angular i18n, and custom implementations.',
        },
        {
          q: 'Can I see the actual differences inline?',
          a: 'Yes, the Monaco diff editor shows side-by-side comparison with syntax highlighting, making it easy to review exactly what changed between files.',
        },
      ],
    },
    relatedPages: [
      '/tools/json-to-csv',
      '/tools/json-schema-generator',
      '/use-cases/frontend-development',
      '/use-cases/api-testing',
      '/intl/translate-json',
      '/intl/translation-sync',
      '/intl/json-localization',
    ],
    structuredData: {
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Web Browser',
      offers: { price: '0', priceCurrency: 'USD' },
    },
  },
  {
    slug: 'translation-sync',
    path: '/intl/translation-sync',
    category: 'intl',
    title: 'Translation File Synchronization | Sync i18n JSON Files',
    description:
      'Keep translation files synchronized across all languages. Automatically propagate new keys, maintain structure consistency, and streamline i18n workflows.',
    h1: 'Translation File Synchronization',
    keywords: [
      'sync translation files',
      'i18n synchronization',
      'translation key sync',
      'i18n file sync',
      'translation management',
      'localization sync',
    ],
    content: {
      intro:
        'Maintain perfect synchronization across all your translation files. When you add new keys to your base language, automatically propagate them to all target languages with AI-generated translations, ensuring your i18n resources stay consistent and complete throughout development.',
      features: [
        'Automatic key propagation - New translation keys are identified and ready for translation in seconds',
        'AI-powered translation - Generate context-aware translations using advanced AI models',
        'Bidirectional sync - Compare source and target files with clear visibility of what needs translation',
        'Context hints - Provide additional context to guide AI for more accurate domain-specific translations',
        'Tone selection - Choose between formal and casual translation styles to match your brand voice',
        'Safe exports - Download updated translation files without affecting your original source files',
      ],
      howTo: [
        'Upload your source language file (e.g., en.json) and target language file (e.g., ko.json)',
        'Review the automatic analysis showing which keys are missing translations',
        'Select keys to translate - individually or use "Select All Missing" for bulk selection',
        'Optionally add context hints or select tone (formal/casual) for better AI translations',
        'Click "Translate Selected" and review the AI-generated translations in the diff editor',
        'Export your synchronized translation file ready for use in your application',
      ],
      faq: [
        {
          q: 'What happens to existing translations during sync?',
          a: 'Existing translations are never overwritten unless you explicitly choose to regenerate them. Sync only adds missing keys with new translations. Your completed work remains intact.',
        },
        {
          q: 'Can I review translations before applying them?',
          a: 'Yes. All translations are shown in a Monaco diff editor where you can review, edit, or reject changes before exporting. You have full control over the final output.',
        },
        {
          q: 'How are variables like {{name}} handled?',
          a: 'Our tool automatically detects and preserves placeholder variables in translations. The AI is trained to keep {{name}}, {0}, $var and similar patterns exactly as they appear in the source.',
        },
      ],
    },
    relatedPages: [
      '/tools/json-to-csv',
      '/tools/json-schema-generator',
      '/use-cases/frontend-development',
      '/use-cases/api-testing',
      '/intl/translate-json',
      '/intl/i18n-diff',
      '/intl/json-localization',
    ],
    structuredData: {
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Web Browser',
      offers: { price: '0', priceCurrency: 'USD' },
    },
  },
  {
    slug: 'json-localization',
    path: '/intl/json-localization',
    category: 'intl',
    title: 'JSON Localization Tool | Localize JSON Files for Global Apps',
    description:
      'Complete JSON localization solution for multi-language apps. Compare translations, manage missing keys, and export localized JSON files ready for production.',
    h1: 'JSON Localization Made Easy',
    keywords: [
      'json localization tool',
      'localize json',
      'json l10n',
      'i18n json tool',
      'json translation',
      'multi-language json',
    ],
    content: {
      intro:
        'Transform your JSON data and configuration files into localized resources for global audiences. Our comprehensive localization tool helps you compare translation files, identify missing keys, generate AI translations, and produce production-ready localized JSON files with proper formatting.',
      features: [
        'Side-by-side comparison - Monaco diff editor shows source and target files with syntax highlighting',
        'Key tree navigation - Hierarchical view of all translation keys with status indicators for easy navigation',
        'AI translation - Generate high-quality translations using advanced language models with context awareness',
        'Validation panel - Real-time validation for variable consistency, length anomalies, and missing keys',
        'Multiple export options - Download as JSON or copy to clipboard with proper formatting preserved',
        'Framework agnostic - Works with any JSON-based i18n solution: i18next, react-intl, vue-i18n, and more',
      ],
      howTo: [
        'Upload your source JSON file (base language like en.json) to the left panel',
        'Upload your target JSON file (language to localize like es.json, fr.json, ko.json) to the right panel',
        'Review the key tree to see which keys are missing, orphaned, or have type mismatches',
        'Select keys that need translation and click "Translate Selected" for AI-powered localization',
        'Review and edit translations in the Monaco editor, then export your localized JSON file',
      ],
      faq: [
        {
          q: 'What types of JSON files can be localized?',
          a: 'Any JSON file can be localized including i18n resource files, configuration files, and application state. The tool adapts to your JSON structure regardless of nesting depth.',
        },
        {
          q: 'How do I handle pluralization and gender-specific translations?',
          a: 'The tool preserves your existing pluralization patterns (like i18next plural keys). For gender-specific content, structure your JSON accordingly and the AI will translate each variation.',
        },
        {
          q: 'Can I use this tool for large translation files?',
          a: 'Yes. The tool efficiently handles large JSON files with thousands of keys. The tree view helps navigate complex structures and batch selection makes translating many keys at once easy.',
        },
      ],
    },
    relatedPages: [
      '/tools/json-to-csv',
      '/tools/json-schema-generator',
      '/use-cases/frontend-development',
      '/use-cases/api-testing',
      '/intl/translate-json',
      '/intl/i18n-diff',
      '/intl/translation-sync',
    ],
    structuredData: {
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Web Browser',
      offers: { price: '0', priceCurrency: 'USD' },
    },
  },
];

export function getAllIntlLandingPages(): IntlLandingPage[] {
  return intlLandingPages;
}

export function getIntlLandingPage(slug: string): IntlLandingPage | undefined {
  return intlLandingPages.find((page) => page.slug === slug);
}
