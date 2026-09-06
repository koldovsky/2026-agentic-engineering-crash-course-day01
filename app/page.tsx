import Link from "next/link";

const steps = [
  ["01", "create-next-app", "чистий Next.js 16 — і AGENTS.md від самого фреймворку"],
  ["02", "hooks", "журнал кожної дії агента з першого коміту"],
  ["03", "AGENTS.md", "статичний контекст, написаний людиною"],
  ["04", "pnpm check", "типи · лінт · тести — валюта довіри"],
  ["05", "skills", "процедури, які агент бере на вимогу"],
  ["06", "MCP", "актуальна документація замість пам'яті моделі"],
  ["07", "/api/health", "перша задача рівня 1: план → рецензія → докази"],
] as const;

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-8 px-6 py-16 font-sans">
      <header className="space-y-2">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-500">fwdays · Crash Course · Agentic Engineering</p>
        <h1 className="text-4xl font-semibold tracking-tight">День 01 · Агент-асистент</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Репозиторій, зібраний наживо: агент пропонує, людина вирішує, кожна дія — у журналі.
        </p>
      </header>
      <ol className="grid gap-3">
        {steps.map(([n, name, what]) => (
          <li key={n} className="flex flex-wrap items-baseline gap-x-4 gap-y-1 rounded-xl border border-zinc-200 px-4 py-3 dark:border-zinc-800">
            <span className="font-mono text-sm text-emerald-500">{n}</span>
            <span className="font-medium">{name}</span>
            <span className="text-sm text-zinc-500">{what}</span>
          </li>
        ))}
      </ol>
      <footer className="flex flex-wrap gap-4 font-mono text-sm">
        <Link href="/api/health" className="underline underline-offset-4">
          GET /api/health
        </Link>
        <a href="https://github.com/koldovsky/2026-agentic-engineering-crash-course-day01" className="underline underline-offset-4">
          github
        </a>
        <a href="https://koldovsky.github.io/2026-agentic-engineering-crash-course/#/day01" className="underline underline-offset-4">
          слайди
        </a>
      </footer>
    </main>
  );
}
