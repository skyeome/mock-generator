"use client";

import Script from "next/script";

// Loads the AdSense display ad script for content pages only.
// Include this component in layouts that have real publisher content
// (blog, docs, about, landing pages) — NOT on pure tool pages (/mock, /intl).
export function AdSenseScript() {
  return (
    <Script
      id="adsense-display"
      async
      src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8121775555791709"
      crossOrigin="anonymous"
      strategy="afterInteractive"
      {...(process.env.NODE_ENV === "development"
        ? { "data-adbreak-test": "on" }
        : {})}
    />
  );
}
