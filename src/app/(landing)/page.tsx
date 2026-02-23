import Link from "next/link";
import {
  Database,
  Languages,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { SmoothScrollLink } from "@/components/ui/smooth-scroll-link";
import { HeroBackground } from "@/components/ui/hero-background";

export default function LandingPage() {
  return (
    <>
      {/* ---------------------------------------------------------------- */}
      {/*  HERO                                                            */}
      {/* ---------------------------------------------------------------- */}
      <section className="relative overflow-hidden">
        <HeroBackground />

        <div className="relative z-10 mx-auto max-w-6xl px-6 pt-24 pb-20 sm:pt-36 sm:pb-28">
          <div className="max-w-2xl">
            {/* Tag */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border px-3 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span className="text-xs font-medium text-muted-foreground">
                Free and open source
              </span>
            </div>

            {/* Heading */}
            <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Developer tools
              <br />
              that just work.
            </h1>

            {/* Subheading */}
            <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg max-w-lg">
              Mock data generation, i18n management, and schema validation.
              Privacy-first, browser-native, zero config.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex items-center gap-4">
              <Link
                href="/intl"
                className="inline-flex items-center justify-center h-10 px-5 text-sm font-medium rounded-md bg-foreground text-background hover:bg-foreground/90 transition-colors"
              >
                Start Building
              </Link>
              <SmoothScrollLink
                href="#tools"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                View all tools
                <ArrowRight className="h-3.5 w-3.5" />
              </SmoothScrollLink>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/*  TOOLS GRID                                                      */}
      {/* ---------------------------------------------------------------- */}
      <section id="tools" className="border-t">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
          {/* Section heading */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Tools
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Everything you need to move faster.
            </p>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 gap-px bg-border md:grid-cols-3 rounded-lg border overflow-hidden">
            {/* i18n Tools */}
            <Link
              href="/intl"
              className="group relative flex flex-col justify-between bg-background p-6 sm:p-8 transition-colors hover:bg-muted/50"
            >
              <div>
                <div className="mb-5 flex h-9 w-9 items-center justify-center rounded-md bg-muted">
                  <Languages className="h-4 w-4 text-foreground" />
                </div>
                <h3 className="text-base font-medium text-foreground">
                  i18n Tools
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Translate JSON files, compare translations, and sync
                  localization across your project.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-1 text-sm font-medium text-foreground opacity-0 transition-opacity group-hover:opacity-100">
                Open
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </Link>

            {/* Mock Data Generator */}
            <Link
              href="/mock"
              className="group relative flex flex-col justify-between bg-background p-6 sm:p-8 transition-colors hover:bg-muted/50"
            >
              <div>
                <div className="mb-5 flex h-9 w-9 items-center justify-center rounded-md bg-muted">
                  <Database className="h-4 w-4 text-foreground" />
                </div>
                <h3 className="text-base font-medium text-foreground">
                  Mock Data Generator
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Generate realistic test data from JSON schemas with semantic
                  field detection powered by AI.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-1 text-sm font-medium text-foreground opacity-0 transition-opacity group-hover:opacity-100">
                Open
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </Link>

            {/* JSON Validator */}
            <div className="relative flex flex-col justify-between bg-background p-6 sm:p-8">
              <div>
                <div className="mb-5 flex h-9 w-9 items-center justify-center rounded-md bg-muted">
                  <CheckCircle className="h-4 w-4 text-foreground" />
                </div>
                <h3 className="text-base font-medium text-foreground">
                  JSON Validator
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Validate and transform JSON with intelligent error detection
                  and suggestions.
                </p>
              </div>
              <div className="mt-6">
                <span className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  Coming Q2
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/*  VALUE PROPOSITIONS                                              */}
      {/* ---------------------------------------------------------------- */}
      <section id="about" className="border-t">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-sm font-semibold text-foreground">100% Free</p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                No subscriptions, no usage limits, no hidden costs. Every tool
                is free forever.
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Privacy First
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                Your data never leaves your browser. No tracking, no analytics,
                no server-side storage.
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                No Sign-up
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                Open a URL and start working. No accounts, no email
                verification, no friction.
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Browser-Native
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                Built on web standards. Works offline, runs everywhere, installs
                nothing.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
