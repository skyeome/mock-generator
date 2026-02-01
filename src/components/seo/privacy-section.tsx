import { Shield, Server, Trash2 } from 'lucide-react';

export function PrivacySection() {
  const privacyPoints = [
    {
      icon: Shield,
      title: 'Client-Side Processing',
      description: 'All data processing happens in your browser using WebAssembly technology.',
    },
    {
      icon: Server,
      title: 'No Server Uploads',
      description: 'Your JSON data is never sent to any server. Zero network requests with your data.',
    },
    {
      icon: Trash2,
      title: 'No Data Storage',
      description: 'We don\'t store, log, or retain any of your data. Close the tab and it\'s gone.',
    },
  ];

  return (
    <section className="py-12 px-6 bg-zinc-800/30">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold mb-2 text-center">
          How We Protect Your Data
        </h2>
        <p className="text-zinc-400 text-center mb-8">
          Your privacy is our priority. Here&apos;s how we keep your data safe.
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          {privacyPoints.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="p-6 bg-zinc-800 rounded-lg border border-zinc-700"
            >
              <Icon className="w-8 h-8 text-emerald-400 mb-4" />
              <h3 className="font-semibold mb-2">{title}</h3>
              <p className="text-sm text-zinc-400">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
