/**
 * OG Image Generator for Mock Data Generator
 *
 * This script generates the static OG image (1200x630) for social sharing.
 *
 * Design specs:
 * - Background: zinc-900 (#18181b)
 * - Accent: emerald-400 (#34d399)
 * - Title: "Mock Data Generator"
 * - Tagline: "AI-Powered Test Data Generation"
 * - Format badges: JSON, CSV, SQL, TS
 *
 * Usage: npx tsx scripts/generate-og-image.ts
 *
 * Note: Requires 'canvas' package to be installed:
 *   pnpm add -D canvas
 *
 * For production, consider using Figma/Canva to create a polished version.
 */

// Placeholder implementation - creates a simple SVG that can be converted
const svg = `
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#18181b"/>
      <stop offset="100%" style="stop-color:#27272a"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bg)"/>

  <!-- Decorative elements -->
  <circle cx="100" cy="100" r="200" fill="#34d399" opacity="0.05"/>
  <circle cx="1100" cy="530" r="250" fill="#34d399" opacity="0.05"/>

  <!-- JSON bracket decoration -->
  <text x="80" y="280" font-family="monospace" font-size="120" fill="#34d399" opacity="0.3">{</text>
  <text x="1040" y="430" font-family="monospace" font-size="120" fill="#34d399" opacity="0.3">}</text>

  <!-- Main title -->
  <text x="600" y="260"
        font-family="system-ui, -apple-system, sans-serif"
        font-size="64"
        font-weight="bold"
        fill="#34d399"
        text-anchor="middle">
    Mock Data Generator
  </text>

  <!-- Tagline -->
  <text x="600" y="330"
        font-family="system-ui, -apple-system, sans-serif"
        font-size="32"
        fill="#d4d4d8"
        text-anchor="middle">
    AI-Powered Test Data Generation
  </text>

  <!-- Format badges -->
  <g transform="translate(600, 420)">
    <!-- JSON badge -->
    <rect x="-280" y="-25" width="100" height="50" rx="8" fill="#27272a" stroke="#3f3f46"/>
    <text x="-230" y="8" font-family="monospace" font-size="20" fill="#34d399" text-anchor="middle">JSON</text>

    <!-- CSV badge -->
    <rect x="-140" y="-25" width="100" height="50" rx="8" fill="#27272a" stroke="#3f3f46"/>
    <text x="-90" y="8" font-family="monospace" font-size="20" fill="#34d399" text-anchor="middle">CSV</text>

    <!-- SQL badge -->
    <rect x="0" y="-25" width="100" height="50" rx="8" fill="#27272a" stroke="#3f3f46"/>
    <text x="50" y="8" font-family="monospace" font-size="20" fill="#34d399" text-anchor="middle">SQL</text>

    <!-- TypeScript badge -->
    <rect x="140" y="-25" width="100" height="50" rx="8" fill="#27272a" stroke="#3f3f46"/>
    <text x="190" y="8" font-family="monospace" font-size="20" fill="#34d399" text-anchor="middle">TS</text>
  </g>

  <!-- Bottom tagline -->
  <text x="600" y="560"
        font-family="system-ui, -apple-system, sans-serif"
        font-size="18"
        fill="#71717a"
        text-anchor="middle">
    100% Free • Privacy-First • No Signup Required
  </text>
</svg>
`;

import { writeFileSync } from 'fs';
import { join } from 'path';

const outputPath = join(process.cwd(), 'public', 'og-image.svg');
writeFileSync(outputPath, svg.trim());
console.log('✅ OG image SVG created at public/og-image.svg');
console.log('');
console.log('To convert to PNG, you can use:');
console.log('  - Online: https://cloudconvert.com/svg-to-png');
console.log('  - CLI: npx svgexport public/og-image.svg public/og-image.png 1200:630');
console.log('  - Or install sharp: pnpm add -D sharp && modify this script');
