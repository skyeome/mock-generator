export function TrustBadges() {
  const badges = [
    { icon: '🆓', text: '100% Free' },
    { icon: '🔒', text: 'Your data never leaves your browser' },
    { icon: '⚡', text: 'No signup required' },
    { icon: '🤖', text: 'AI-Powered semantic detection' },
  ];

  return (
    <div className="flex flex-wrap justify-center gap-4 mt-8">
      {badges.map(({ icon, text }) => (
        <div
          key={text}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-800 rounded-full text-sm"
        >
          <span>{icon}</span>
          <span className="text-zinc-300">{text}</span>
        </div>
      ))}
    </div>
  );
}
