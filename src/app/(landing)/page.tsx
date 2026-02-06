import Link from "next/link";
import {
  Sparkles,
  Database,
  Languages,
  CheckCircle,
  Shield,
  Zap,
  Eye,
  Globe,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { SmoothScrollLink } from "@/components/ui/smooth-scroll-link";

export default function LandingPage() {

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              <span className="text-xl font-bold bg-linear-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                AI Utils
              </span>
            </div>

            <nav className="hidden md:flex items-center gap-6">
              <SmoothScrollLink
                href="#tools"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Tools
              </SmoothScrollLink>
              <SmoothScrollLink
                href="#about"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                About
              </SmoothScrollLink>
              <ThemeToggle />
            </nav>

            <div className="flex md:hidden items-center gap-2">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        {/* Abstract geometric decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-linear-to-br from-purple-500/20 to-blue-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-linear-to-tr from-blue-500/20 to-purple-500/20 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
              AI-Powered Developer Tools
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-8">
              Free, fast, and privacy-first utilities powered by AI
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <SmoothScrollLink
                href="#tools"
                className="inline-flex items-center justify-center px-8 py-3 rounded-lg bg-linear-to-r from-purple-600 to-blue-600 text-white font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Explore Tools
              </SmoothScrollLink>

              <Link
                href="/intl"
                className="inline-flex items-center justify-center px-8 py-3 rounded-lg border-2 border-blue-600 text-blue-600 dark:text-blue-400 font-medium hover:bg-blue-600 hover:text-white dark:hover:text-white transition-all duration-200 group"
              >
                i18n Tools
                <span className="ml-2 transform group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Tools Grid Section */}
      <section id="tools" className="py-16 sm:py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold sm:text-4xl mb-4">
              Powerful Tools for Developers
            </h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to speed up your development workflow
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* i18n Tools - AVAILABLE (MAIN) */}
            <Link
              href="/intl"
              className="group relative p-6 rounded-xl border bg-card hover:bg-accent hover:border-blue-600 transition-all duration-200 hover:shadow-lg transform hover:-translate-y-1"
            >
              <div className="mb-4 inline-flex p-3 rounded-lg bg-blue-600/10 text-blue-600 dark:text-blue-400">
                <Languages className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">i18n Tools</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Translate JSON files, compare translations, and sync
                localization across your project
              </p>
              <div className="inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400">
                Try it now
                <span className="ml-1 transform group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </div>
            </Link>

            {/* Mock Data Generator - AVAILABLE */}
            <Link
              href="/mock"
              className="group relative p-6 rounded-xl border bg-card hover:bg-accent hover:border-purple-600 transition-all duration-200 hover:shadow-lg transform hover:-translate-y-1"
            >
              <div className="mb-4 inline-flex p-3 rounded-lg bg-purple-600/10 text-purple-600 dark:text-purple-400">
                <Database className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Mock Data Generator
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                Generate realistic test data from JSON schemas with AI-powered
                semantic detection
              </p>
              <div className="inline-flex items-center text-sm font-medium text-purple-600 dark:text-purple-400">
                Try it now
                <span className="ml-1 transform group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </div>
            </Link>

            {/* JSON Validator - COMING SOON */}
            <div className="relative p-6 rounded-xl border bg-card opacity-60">
              <div className="absolute top-4 right-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                  Coming Soon
                </span>
              </div>
              <div className="mb-4 inline-flex p-3 rounded-lg bg-green-600/10 text-green-600 dark:text-green-400">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">JSON Validator</h3>
              <p className="text-muted-foreground text-sm">
                Validate and transform JSON with intelligent suggestions
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="about" className="py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="inline-flex p-3 rounded-lg bg-green-600/10 text-green-600 dark:text-green-400 mb-3">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="font-semibold mb-1">100% Free</h3>
              <p className="text-sm text-muted-foreground">No hidden costs</p>
            </div>

            <div className="text-center">
              <div className="inline-flex p-3 rounded-lg bg-blue-600/10 text-blue-600 dark:text-blue-400 mb-3">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="font-semibold mb-1">Privacy First</h3>
              <p className="text-sm text-muted-foreground">
                Your data stays safe
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex p-3 rounded-lg bg-purple-600/10 text-purple-600 dark:text-purple-400 mb-3">
                <Eye className="w-6 h-6" />
              </div>
              <h3 className="font-semibold mb-1">No Sign-up</h3>
              <p className="text-sm text-muted-foreground">Use instantly</p>
            </div>

            <div className="text-center">
              <div className="inline-flex p-3 rounded-lg bg-orange-600/10 text-orange-600 dark:text-orange-400 mb-3">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="font-semibold mb-1">Browser-Based</h3>
              <p className="text-sm text-muted-foreground">Works offline</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © 2024-2026 AI Utils. All rights reserved.
            </p>

            <div className="flex items-center gap-6">
              <Link
                href="/privacy"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Privacy Policy
              </Link>
              <a
                href="https://github.com/skyeome/mock-generator"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
