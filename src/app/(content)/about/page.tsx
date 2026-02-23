import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "About",
  description:
    "About AI Utils: free, open-source, privacy-first developer tools for mock data generation, i18n management, and more.",
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16 sm:py-20">
      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Home
      </Link>

      <article>
        <header className="mb-10">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            About AI Utils
          </h1>
          <p className="mt-3 text-base text-muted-foreground">
            Free, open-source developer tools built for the modern web.
          </p>
        </header>

        <div className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3 prose-p:leading-relaxed prose-p:text-muted-foreground prose-li:text-muted-foreground prose-a:text-foreground prose-a:underline prose-a:underline-offset-4 prose-strong:text-foreground">
          <h2>Why AI Utils Exists</h2>

          <p>
            AI Utils started as a personal project born out of frustration. As
            a developer, I found myself repeatedly reaching for the same
            utilities during day-to-day work: generating mock data for API
            testing, syncing translation files across projects, validating JSON
            structures. Every time, the options were either bloated SaaS tools
            that required sign-ups and subscriptions, or bare-bones
            command-line scripts that needed constant maintenance.
          </p>

          <p>
            I wanted something different: a collection of focused, well-crafted
            tools that load instantly in any browser, require no accounts, and
            respect user privacy. Tools that a developer can bookmark and reach
            for without a second thought. That vision became AI Utils.
          </p>

          <h2>Our Mission</h2>

          <p>
            AI Utils is built on four principles that guide every decision we
            make:
          </p>

          <ul>
            <li>
              <strong>Free forever.</strong> No subscriptions, no usage limits,
              no &quot;free tier&quot; with paywalled features. Every tool is
              fully functional for every user. We believe developer utilities
              should be public infrastructure, not profit centers.
            </li>
            <li>
              <strong>No sign-up required.</strong> Open a URL, start working.
              No email verification, no OAuth flows, no cookie consent walls
              for analytics we are not running. The tool is the product, not
              your personal data.
            </li>
            <li>
              <strong>Privacy first.</strong> Your data stays in your browser.
              JSON samples you paste for mock generation are parsed and
              processed locally. Translation files are handled on the client
              side. The only exception is optional AI-powered features, which
              send minimal data (field names, not values) to language models,
              and this is always clearly indicated and opt-in.
            </li>
            <li>
              <strong>Browser-native.</strong> No desktop apps to install, no
              CLI tools to configure, no Docker containers to spin up. Every
              tool runs in your browser using web standards. Works offline once
              loaded. Works on any device with a modern browser.
            </li>
          </ul>

          <h2>Available Tools</h2>

          <h3>Mock Data Generator</h3>

          <p>
            The Mock Data Generator transforms JSON samples or schemas into
            realistic test datasets. It combines automatic schema inference,
            semantic field detection (with 148 built-in pattern rules), and the
            Faker.js library to produce data that looks like production
            records. Optional AI-powered analysis identifies ambiguous fields
            and detects relationships between them.
          </p>

          <p>
            Export generated data as JSON, CSV, SQL INSERT statements, or typed
            TypeScript code. Supports seeded generation for reproducible tests
            and over 60 locales for internationalized data.
          </p>

          <h3>i18n Sync Tool</h3>

          <p>
            The i18n Sync Tool helps manage internationalization files across
            multiple languages. Upload your source language JSON file, select
            target languages, and use AI-powered translation to generate
            initial translations. The visual diff comparison shows exactly what
            changed, making it easy to review translations from external
            translators or after AI processing.
          </p>

          <p>
            Supports both flat and nested JSON formats used by popular
            frameworks like i18next, react-intl, vue-i18n, and ngx-translate.
            Batch export produces ready-to-use translation files for every
            target language.
          </p>

          <h2>Technology</h2>

          <p>
            AI Utils is built with modern web technologies chosen for
            performance, reliability, and developer experience:
          </p>

          <ul>
            <li>
              <strong>Next.js</strong> for the application framework, providing
              server-side rendering, static generation, and optimized client
              delivery
            </li>
            <li>
              <strong>Cloudflare Workers</strong> for edge deployment, ensuring
              fast response times worldwide with no cold starts
            </li>
            <li>
              <strong>Faker.js</strong> for mock data generation with support
              for 60+ locales and hundreds of realistic data generators
            </li>
            <li>
              <strong>Tailwind CSS</strong> for a consistent, responsive design
              system across all tools
            </li>
            <li>
              <strong>TypeScript</strong> throughout the entire codebase for
              type safety and better developer tooling
            </li>
            <li>
              <strong>Zustand</strong> for lightweight, performant client-side
              state management
            </li>
          </ul>

          <h2>Open Source</h2>

          <p>
            AI Utils is open source under the MIT license. The complete source
            code is available on{" "}
            <a
              href="https://github.com/skyeome/mock-generator"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
            . Contributions are welcome: whether it is bug reports, feature
            requests, documentation improvements, or code contributions.
          </p>

          <p>
            We believe that developer tools benefit from open development. When
            users can inspect the source code, they can verify privacy claims,
            understand how their data is processed, and contribute
            improvements that benefit the entire community.
          </p>

          <h2>Contact</h2>

          <p>
            The best way to reach us is through{" "}
            <a
              href="https://github.com/skyeome/mock-generator/issues"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub Issues
            </a>
            . Whether you have found a bug, want to request a feature, or just
            have a question about how something works, opening an issue is the
            fastest path to a response.
          </p>

          <p>
            For security-related concerns, please use GitHub&apos;s private
            vulnerability reporting feature rather than opening a public issue.
          </p>
        </div>
      </article>
    </main>
  );
}
