import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getAllBlogPosts } from "@/lib/blog/posts";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Technical articles on mock data generation, testing best practices, JSON Schema, Faker.js, and developer tooling.",
};

export default function BlogIndexPage() {
  const posts = getAllBlogPosts();

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
          Blog
        </h1>
        <p className="mt-2 text-base text-muted-foreground">
          Technical articles on testing, mock data, and developer tooling.
        </p>
      </div>

      {/* Post list */}
      <div className="space-y-1">
        {posts.map((post) => (
          <article key={post.slug}>
            <Link
              href={`/blog/${post.slug}`}
              className="group block rounded-lg border border-transparent p-6 -mx-6 transition-colors hover:border-border hover:bg-muted/50"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1">
                  <h2 className="text-lg font-medium text-foreground group-hover:text-foreground/90">
                    {post.title}
                  </h2>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground line-clamp-2">
                    {post.description}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground sm:flex-col sm:items-end sm:gap-1">
                  <time dateTime={post.date}>
                    {new Date(post.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </time>
                  <span>{post.readingTime}</span>
                </div>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </main>
  );
}
