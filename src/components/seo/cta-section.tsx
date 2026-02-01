import Link from 'next/link';

export function CTASection() {
  return (
    <section className="py-16 px-6 text-center bg-gradient-to-b from-zinc-900 to-zinc-800">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold mb-4">
          Ready to Generate Mock Data?
        </h2>
        <p className="text-zinc-400 mb-8">
          Paste your JSON schema and get realistic test data in seconds.
          No signup required, 100% free.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg transition-colors"
        >
          Start Generating Now
          <span aria-hidden="true">→</span>
        </Link>
        <p className="mt-4 text-sm text-zinc-500">
          Works with JSON, exports to CSV, SQL, and TypeScript
        </p>
      </div>
    </section>
  );
}
