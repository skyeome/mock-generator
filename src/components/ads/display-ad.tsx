"use client";

import { useEffect, useRef } from "react";

interface DisplayAdProps {
  slot: string;
  format?: "auto" | "rectangle" | "horizontal";
  style?: React.CSSProperties;
}

// Reusable display ad component for content pages.
// Renders an <ins class="adsbygoogle"> element and pushes to adsbygoogle array.
// Handles gracefully when AdSense script has not loaded.
export function DisplayAd({
  slot,
  format = "auto",
  style,
}: DisplayAdProps) {
  const insRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    try {
      const adsbygoogle =
        (window as unknown as { adsbygoogle: unknown[] }).adsbygoogle;
      if (adsbygoogle) {
        adsbygoogle.push({});
      }
    } catch {
      // AdSense not loaded — silently ignore
    }
  }, []);

  return (
    <ins
      ref={insRef}
      className="adsbygoogle"
      style={{ display: "block", ...style }}
      data-ad-client="ca-pub-8121775555791709"
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive="true"
    />
  );
}
