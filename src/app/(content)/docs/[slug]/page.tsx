import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getDocPage, getAllDocPages } from "@/lib/docs/pages";
import { DisplayAd } from "@/components/ads/display-ad";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllDocPages().map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getDocPage(slug);
  if (!page) return {};

  return {
    title: page.title,
    description: page.description,
  };
}

export default async function DocPage({ params }: PageProps) {
  const { slug } = await params;
  const page = getDocPage(slug);

  if (!page) {
    notFound();
  }

  const allPages = getAllDocPages();
  const otherPages = allPages.filter((p) => p.slug !== page.slug);

  return (
    <main className="mx-auto max-w-4xl px-6 py-16 sm:py-20">
        {/* Back link */}
        <Link
          href="/docs"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All docs
        </Link>

        <article>
          {/* Doc header */}
          <header className="mb-10">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {page.title}
            </h1>
            <p className="mt-3 text-base text-muted-foreground">
              {page.description}
            </p>
          </header>

          {/* Doc content */}
          <div
            className="prose prose-neutral dark:prose-invert max-w-none
              prose-headings:font-semibold prose-headings:tracking-tight
              prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
              prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
              prose-h4:text-base prose-h4:mt-6 prose-h4:mb-2
              prose-p:leading-relaxed prose-p:text-muted-foreground
              prose-li:text-muted-foreground
              prose-a:text-foreground prose-a:underline prose-a:underline-offset-4
              prose-code:text-sm prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none
              prose-pre:bg-muted prose-pre:border prose-pre:rounded-lg
              prose-strong:text-foreground"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        </article>

        {/* Bottom display ad before other docs */}
        <DisplayAd slot="1122334455" format="horizontal" />

        {/* Other docs */}
        {otherPages.length > 0 && (
          <section className="mt-16 pt-10 border-t">
            <h2 className="text-lg font-semibold tracking-tight text-foreground mb-6">
              Other Documentation
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {otherPages.map((other) => (
                <Link
                  key={other.slug}
                  href={`/docs/${other.slug}`}
                  className="group block rounded-lg border p-5 transition-colors hover:bg-muted/50"
                >
                  <h3 className="text-sm font-medium text-foreground group-hover:text-foreground/90">
                    {other.title}
                  </h3>
                  <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2">
                    {other.description}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
    </main>
  );
}
