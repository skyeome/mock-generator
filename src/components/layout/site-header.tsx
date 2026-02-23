"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Command, ChevronDown } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const toolLinks = [
  { href: "/intl", label: "i18n Tools" },
  { href: "/mock", label: "Mock Generator" },
];

const navLinks = [
  { href: "/blog", label: "Blog" },
  { href: "/docs", label: "Docs" },
  { href: "/about", label: "About" },
];

export function SiteHeader() {
  const pathname = usePathname();

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex h-14 items-center justify-between">
          {/* Wordmark */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-foreground">
              <Command className="h-3.5 w-3.5 text-background" />
            </div>
            <span className="text-sm font-semibold tracking-tight text-foreground">
              AI Utils
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {/* Tools dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-1 text-[13px] text-muted-foreground hover:text-foreground transition-colors">
                Tools
                <ChevronDown className="h-3 w-3" />
              </button>
              <div className="absolute top-full left-0 mt-2 w-44 rounded-md border bg-background shadow-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                {toolLinks.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className="block px-3 py-2 text-[13px] text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors first:rounded-t-md last:rounded-b-md"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={
                  isActive(href)
                    ? "text-[13px] font-medium text-foreground"
                    : "text-[13px] text-muted-foreground hover:text-foreground transition-colors"
                }
              >
                {label}
              </Link>
            ))}
            <div className="h-4 w-px bg-border" />
            <ThemeToggle />
            <Link
              href="/intl"
              className="inline-flex items-center justify-center h-8 px-3.5 text-[13px] font-medium rounded-md bg-foreground text-background hover:bg-foreground/90 transition-colors"
            >
              Start Building
            </Link>
          </nav>

          {/* Mobile nav */}
          <div className="flex md:hidden items-center gap-3">
            <ThemeToggle />
            <Link
              href="/intl"
              className="inline-flex items-center justify-center h-8 px-3.5 text-[13px] font-medium rounded-md bg-foreground text-background hover:bg-foreground/90 transition-colors"
            >
              Start Building
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
