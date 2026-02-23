import { AdSenseScript } from "@/components/ads/adsense-script";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

// Route group layout for content pages (blog, docs, about).
// Injects the AdSense display ad script only for pages that have real
// publisher content, keeping pure tool pages (/mock, /intl) ad-script-free.
export default function ContentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <AdSenseScript />
      {children}
      <SiteFooter />
    </div>
  );
}
