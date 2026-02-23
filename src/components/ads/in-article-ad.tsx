"use client";

import { useEffect, useRef } from "react";

interface InArticleAdProps {
  slot: string;
}

// In-article ad component optimized for placement inside article/blog content.
// Uses format="fluid" layout="in-article" per AdSense in-article ad requirements.
// Includes vertical margin spacing (my-8) for comfortable reading flow.
export function InArticleAd({ slot }: InArticleAdProps) {
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
    <div className="my-8">
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={{ display: "block", textAlign: "center" }}
        data-ad-layout="in-article"
        data-ad-format="fluid"
        data-ad-client="ca-pub-8121775555791709"
        data-ad-slot={slot}
      />
    </div>
  );
}
