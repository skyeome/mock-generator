import Link from "next/link";
import { Command } from "lucide-react";

const footerLinks = [
  { href: "/blog", label: "Blog" },
  { href: "/docs", label: "Docs" },
  { href: "/about", label: "About" },
  { href: "/privacy", label: "Privacy" },
];

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded bg-foreground">
              <Command className="h-2.5 w-2.5 text-background" />
            </div>
            <span className="text-xs text-muted-foreground">
              &copy; 2024-2026 AI Utils
            </span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6">
            {footerLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {label}
              </Link>
            ))}
            <a
              href="https://github.com/skyeome/mock-generator"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
