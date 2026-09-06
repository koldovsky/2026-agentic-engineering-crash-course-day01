# Crash Course: Agentic Engineering — День 01 · Агент-асистент

Демо-репозиторій першого заняття курсу **fwdays · Crash Course: Agentic Engineering** (вересень 2026).
Це кінцевий стан того, що на занятті збирається наживо в Claude Code: **із порожньої теки — до правильно
налаштованого репозиторію**, у якому агент корисний з першої години, а кожна його дія видима.

Слайди заняття: <https://koldovsky.github.io/2026-agentic-engineering-crash-course/#/day01>

## Що тут є

| Крок | Тег | Що з'явилося | Навіщо |
|------|-----|--------------|--------|
| 01 | `step-01-scaffold` | `create-next-app@16.3.4` — Next.js 16, TypeScript, Tailwind, ESLint (pnpm) | чистий старт; фреймворк сам генерує `AGENTS.md` і `CLAUDE.md` |
| 02 | `step-02-observability` | `.claude/settings.json`, `.claude/hooks/*.mjs`, `.agent-log/` | журнал кожної дії агента з першого коміту (запропонував / зробив); заборона `.env*`; режим «агент пропонує — ви вирішуєте» |
| 03 | `step-03-static-context` | `AGENTS.md` (правила під керованим блоком Next.js), `CLAUDE.md`, `.claude/rules/` | статичний контекст, написаний людиною |
| 04 | `step-04-verification` | Vitest, `pnpm typecheck`, `pnpm check`, перший тест, CI | валюта довіри: типи · лінт · тести |
| 05 | `step-05-skills` | `.agents/skills/` + `.claude/skills/` (`vercel-react-best-practices`, власний `agent-log-report`) | процедури на вимогу, а не в кожному запиті |
| 06 | `step-06-mcp` | `.mcp.json` (Context7, Next.js DevTools MCP), `.env.example` | актуальна документація замість пам'яті моделі |
| 07 | `step-07-first-task` | `GET /api/health` з тестами, домашня сторінка | перша задача рівня 1: план → рецензія → докази |

Кожен крок — окремий коміт і тег: `git checkout step-04-verification` показує репозиторій у стані після кроку 4.
Сценарій показу для ведучого — [DEMO.md](./DEMO.md). Журнал автономності — [docs/autonomy-log.md](./docs/autonomy-log.md).
Те саме в Cursor і Codex — [docs/cross-tool.md](./docs/cross-tool.md).

## Запуск

```bash
pnpm install
pnpm dev             # http://localhost:3000
pnpm check           # typecheck + lint + tests — те, що агент має пройти перед «готово»
pnpm hooks:selftest  # перевірка hooks без агента
pnpm agent:log       # зведення журналу дій: proposed / executed / blocked / failed по інструментах
pnpm agent:report    # те саме як Markdown (скрипт власного skill-а)
```

Для MCP-конектора Context7 потрібен ключ: скопіюйте `.env.example` у `.env` і впишіть `CONTEXT7_API_KEY`
(hook не дасть агенту ні прочитати, ні змінити `.env`). Безкоштовний план — 1 000 викликів на місяць; без ключа
доступ обмежений спільним анонімним лімітом.

## Робота з агентом у цьому репозиторії

- Claude Code стартує тут у режимі **Manual** (`permissions.defaultMode: "default"`), навіть якщо на вашому плані типовий режим — `auto`.
  Це і є рівень 1: агент пропонує, ви вирішуєте. Перемикання — Shift+Tab; план — `/plan …`.
- Перший запуск у свіжому клоні: діалог довіри до теки → підтвердження серверів із `.mcp.json`.
- `AGENTS.md` читають Cursor, Codex, Copilot; Claude Code читає `CLAUDE.md`, який імпортує його рядком `@AGENTS.md`.
- Навички: канонічна копія в `.agents/skills/` (Cursor, Codex, Copilot…), для Claude Code — `.claude/skills/` (`pnpm skills:sync`).
- Усе, що агент **запропонував** і **зробив**, — у `.agent-log/actions.jsonl` (PreToolUse / PostToolUse, спарені за `id`);
  усе, що він **сказав**, — у транскрипті `~/.claude/projects/<проєкт>/`.

## Стек

Next.js 16.3 · React 19.2 · TypeScript 5.9 · Tailwind 4 · ESLint 9 (ESLint 10 поки несумісний з `eslint-config-next`) · Vitest 5 · pnpm 11 · Node 24.
Claude Code 2.1.26x, стандарти [agents.md](https://agents.md), [agentskills.io](https://agentskills.io), [MCP 2026-07-28](https://modelcontextprotocol.io).
