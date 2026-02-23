import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getAllDocPages } from "@/lib/docs/pages";

export const metadata: Metadata = {
  title: "Documentation",
  description:
    "Comprehensive documentation for AI Utils developer tools: Mock Data Generator and i18n Sync Tool.",
};

export default function DocsIndexPage() {
  const pages = getAllDocPages();

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

      {/* Page heading */}
      <div className="mb-12">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Documentation
        </h1>
        <p className="mt-2 text-base text-muted-foreground">
          Guides and reference for every AI Utils tool.
        </p>
      </div>

      {/* Doc cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {pages.map((page) => (
          <Link
            key={page.slug}
            href={`/docs/${page.slug}`}
            className="group flex flex-col justify-between rounded-lg border p-6 transition-colors hover:bg-muted/50"
          >
            <div>
              <h2 className="text-base font-medium text-foreground">
                {page.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {page.description}
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-sm font-medium text-foreground opacity-0 transition-opacity group-hover:opacity-100">
              Read docs
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
