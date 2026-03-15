export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6">
      <h1 className="text-4xl font-bold">SmartScout 1880</h1>

      <p className="text-gray-500">
        FRC 2026 Scouting & Strategy Platform
      </p>

      <div className="flex gap-4 mt-6">
        <a
          href="/scouting"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg">
            Scouting
        </a>

        <a
          href="/strategy"
          className="px-6 py-3 bg-purple-600 text-white rounded-lg">
            Strategy
        </a>

        <a
          href="/dashboard"
          className="px-6 py-3 bg-green-600 text-white rounded-lg">
            Live Dashboard
        </a>
      </div>
    </main>
  );
}