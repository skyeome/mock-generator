import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getBlogPost, getAllBlogPosts } from "@/lib/blog/posts";
import { InArticleAd } from "@/components/ads/in-article-ad";
import { DisplayAd } from "@/components/ads/display-ad";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllBlogPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    notFound();
  }

  const allPosts = getAllBlogPosts();
  const relatedPosts = allPosts
    .filter(
      (p) =>
        p.slug !== post.slug && p.tags.some((tag) => post.tags.includes(tag))
    )
    .slice(0, 2);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: {
      "@type": "Organization",
      name: "AI Utils",
      url: "https://ai-utils.work",
    },
    publisher: {
      "@type": "Organization",
      name: "AI Utils",
      url: "https://ai-utils.work",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://ai-utils.work/blog/${post.slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="mx-auto max-w-4xl px-6 py-16 sm:py-20">
        {/* Back link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All posts
        </Link>

        <article>
          {/* Post header */}
          <header className="mb-10">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {post.title}
            </h1>
            <p className="mt-3 text-base text-muted-foreground">
              {post.description}
            </p>
            <div className="mt-4 flex items-center gap-3 text-sm text-muted-foreground">
              <time dateTime={post.date}>
                {new Date(post.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
              <span className="h-1 w-1 rounded-full bg-muted-foreground" />
              <span>{post.readingTime}</span>
            </div>
          </header>

          {/* Post content */}
          <div
            className="prose prose-neutral dark:prose-invert max-w-none
              prose-headings:font-semibold prose-headings:tracking-tight
              prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
              prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
              prose-p:leading-relaxed prose-p:text-muted-foreground
              prose-li:text-muted-foreground
              prose-a:text-foreground prose-a:underline prose-a:underline-offset-4
              prose-code:text-sm prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none
              prose-pre:bg-muted prose-pre:border prose-pre:rounded-lg
              prose-strong:text-foreground"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* In-article ad after content */}
          <InArticleAd slot="1234567890" />
        </article>

        {/* Bottom display ad before related posts */}
        <DisplayAd slot="0987654321" format="horizontal" />

        {/* Related posts */}
        {relatedPosts.length > 0 && (
          <section className="mt-16 pt-10 border-t">
            <h2 className="text-lg font-semibold tracking-tight text-foreground mb-6">
              Related Articles
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {relatedPosts.map((related) => (
                <Link
                  key={related.slug}
                  href={`/blog/${related.slug}`}
                  className="group block rounded-lg border p-5 transition-colors hover:bg-muted/50"
                >
                  <h3 className="text-sm font-medium text-foreground group-hover:text-foreground/90">
                    {related.title}
                  </h3>
                  <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2">
                    {related.description}
                  </p>
                  <time
                    dateTime={related.date}
                    className="mt-3 block text-xs text-muted-foreground"
                  >
                    {new Date(related.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </time>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
