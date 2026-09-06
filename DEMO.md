# DEMO.md — сценарій живого показу (заняття 1, ~60 хв)

Мета показу: із порожньої теки — до репозиторію, де агент корисний з першої години, кожна його дія видима, а межа
«агент запропонував / агент зробив» проходить там, де вирішили ви. Інструмент — Claude Code у режимі **Manual** (рівень 1).
Гачок на весь показ: **«рахуйте, скільки разів я натисну yes»** — наприкінці `pnpm agent:log` покаже точну цифру.

## Перед заняттям (чекліст)

- [ ] `claude update` → `claude --version` показує 2.1.26x (на машині ведучого було 2.1.220). Увійти в акаунт (`claude` → `/login`, якщо просить).
- [ ] На платному плані Claude Code 2.1.233+ (Windows) стартує в **auto** — це частина сценарію кроку 1, не «баг». Перевірити `/model` (типова модель залежить від плану: Opus 5 на Max, Sonnet 5 на Pro).
- [ ] Весь показ — у **Git Bash / Windows Terminal з bash**, не в PowerShell (команди нижче — bash). `chcp 65001`, шрифт 18+.
- [ ] `export CONTEXT7_API_KEY=ctx7sk-…` у тому терміналі, з якого запускатиметься `claude` (ключ: context7.com/dashboard).
- [ ] Node 24, pnpm 11, Git. Порожня тека, напр. `D:\demo\day01`. Жодного іншого `next dev` не запущено.
- [ ] Резервний клон цього репозиторію поруч: `git clone https://github.com/koldovsky/2026-agentic-engineering-crash-course-day01 day01-backup`
      (fallback на будь-якому кроці: `git checkout step-0N-…` і продовжуємо звідти).
- [ ] Прогнати весь сценарій раз від початку до кінця напередодні; перший запуск Vitest із jsdom на Windows — ~20 с.

Таймінг: 1 → 8 хв · 2 → 8 · 3 → 8 · 4 → 7 · 5 → 8 · 6 → 7 · 7 → 14. Плюс 2–3 хв на «що лежить у репо» наприкінці.

---

## Крок 1 · Порожня тека → Next.js 16 (тег `step-01-scaffold`)

```bash
pnpm create next-app@latest day01 --yes --use-pnpm
cd day01
cat AGENTS.md CLAUDE.md
find node_modules/next/dist/docs -type f | wc -l      # ~450 файлів документації саме цієї версії
```

Показати: `AGENTS.md` з блоком **«This is NOT the Next.js you know»** і `CLAUDE.md` = `@AGENTS.md` — фреймворк сам приніс перший
статичний контекст і посилання на документацію. `pnpm` попереджає, що ESLint 9 «deprecated»: залишаємось на 9, бо `eslint-config-next`
ще не працює з 10 (звичайна ситуація 2026 року — стек рухається швидше за екосистему).

`git log --oneline` — create-next-app уже зробив `git init` і перший коміт; якщо коміту немає: `git add -A && git commit -m "01 scaffold"`.

Далі:

```bash
claude
```

Дивимось на рядок стану: `⏵⏵ auto mode on`. **Сказати:** з 14 серпня 2026 на Pro/Max/Team типовий рецензент дій — класифікатор, а не ви
(люди схвалюють 97% запитів; у дослідженні на 1 053 тестерах небезпечні команди помітили 13,6% людей проти 89% класифікатора).
Рівень 1 сьогодні — це свідоме рішення: Shift+Tab → `⏸ manual mode on` (з auto перше натискання веде в Manual). Далі ми це зафіксуємо у файлі.

Перше запитання агенту (нічого не змінює):

> Прочитай AGENTS.md і CLAUDE.md. Що ти знаєш про цей проєкт і чого не знаєш? Нічого не редагуй.

Що показати: агент читає файли → відповідь. Це «агент запропонував»: файли не змінені.

## Крок 2 · Спостережуваність до першої задачі (тег `step-02-observability`)

Файли беремо з резервного клону (цей шар не генерують агентом — він контролює агента):

```bash
cp -r ../day01-backup/.claude ./            # settings.json + hooks/ + rules/ (rules — для кроку 3)
cp -r ../day01-backup/scripts ./
cp -r ../day01-backup/.agent-log ./
node scripts/hooks-selftest.mjs
```

Пройтись по `.claude/settings.json`: `defaultMode: "default"` (рівень 1 у файлі, а не в пам'яті), `deny` на `.env*` і `rm -rf`,
`ask` на `git push` і `pnpm add`; hooks у exec-формі (`node` + скрипт — так працює і на Windows, і на macOS):
**PreToolUse** пише рядок «запропонував» і блокує `.env*`, **PostToolUse / PostToolUseFailure** пишуть рядок «зробив».

Перезапустити `claude` (щоб наочно), `/hooks` — список. Попросити щось дрібне:

> Додай у README.md один рядок «Demo repo · fwdays Crash Course · Day 01». Тільки цей рядок.

Показати діалог дозволу (Manual), погодитись, потім `cat .agent-log/actions.jsonl`: **пара рядків** `PreToolUse` → `PostToolUse` з одним `id`.
Тепер спровокувати заборону:

> Прочитай файл .env.local і скажи, які змінні там є

Hook відповідає агенту (exit 2, текст зі stderr іде в контекст) — агент повідомляє, що доступ заборонено, і пропонує `.env.example`.
У логу — рядок `PreToolUse` **без пари**: запропонував, але не зробив. `pnpm agent:log` показує його в колонці `blocked`.
**Сказати:** правило в AGENTS.md — порада, hook — примус; PreToolUse-hook спрацьовує до перевірки дозволів у будь-якому режимі, навіть у bypass.

Коміт: `git add -A && git commit -m "02 observability"`.

## Крок 3 · AGENTS.md пишете ви (тег `step-03-static-context`)

Відкрити `AGENTS.md`, вставити блок «Project rules» з резервного клону **під** керованим блоком Next.js (не чіпаючи його).
Пройтись: команди → definition of done → правила Next 16, яких модель не пам'ятає → домовленості, яких не видно з коду → межі.
Чого тут немає: опису архітектури, переліку тек, того, що і так робить лінтер.

`CLAUDE.md`: додати три рядки з резервного клону (план для `app/api/**`, не чіпати `.agent-log/`, де живуть skills).
`.claude/rules/app-router.md` уже скопійовано — правило з `paths:` вантажиться лише коли агент працює під `app/`.

У Claude Code: `/context` — секція Memory files показує `CLAUDE.md → @AGENTS.md` і правила. **Сказати:** дослідження ETH (Gloaguen et al.,
2026): контекст-файли в середньому не підвищують успішність, але додають понад 20% вартості; те, що йде в AGENTS.md, має проходити тест
«якщо прибрати цей рядок — агент помилиться?».

Коміт: `git add -A && git commit -m "03 static context"`.

## Крок 4 · Валюта довіри (тег `step-04-verification`)

Уперше даємо агенту роботу — через план:

> /plan Додай Vitest за офіційним рецептом Next.js (vitest, @vitejs/plugin-react, jsdom, @testing-library/react, @testing-library/dom; @types/node ^24),
> файл vitest.config.mts без vite-tsconfig-paths (resolve.tsconfigPaths: true), скрипти typecheck = "next typegen && tsc --noEmit",
> test = "vitest run", check = "pnpm typecheck && pnpm lint && pnpm test", і один тест lib/health.test.ts для функції buildHealth
> у lib/health.ts (status ok, uptime у секундах, помилка на порожню назву сервісу). Готово, коли pnpm check зелений. Не чіпай next.config.ts.

Рецензія плану (30 секунд): чи зрозумів задачу, які файли чіпає, чим доведе. Затвердити. Агент проситиме `pnpm add` (правило `ask`) — погодитись.
Очікуваний результат: `pnpm check` зелений, 3 тести. Якщо агент пише тест **після** коду — зауважити: наступного разу спочатку тест.

`git add -A && git commit -m "04 verification"`. Fallback: `cp` `vitest.config.mts`, `lib/` і скрипти з резервного клону.

## Крок 5 · Skills (тег `step-05-skills`)

```bash
npx skills add https://github.com/vercel-labs/agent-skills --skill vercel-react-best-practices -a claude-code -a cursor -a codex --copy -y
```

Показати таблицю аудитів (Gen · Socket · Snyk) і куди лягло: `.claude/skills/` (Claude Code) і `.agents/skills/` (усі інші).
**Сказати:** `next-best-practices` більше не існує — знання про Next.js тепер у бандлених доках; skill — для процедур, не для знань.
Trail of Bits у червні обійшли всі три сканери за годину: читайте SKILL.md і скрипти перед встановленням.

Власний skill: `cp -r ../day01-backup/.agents/skills/agent-log-report .agents/skills/` → `pnpm skills:sync`.
У Claude Code: `/skills` → `/agent-log-report` — агент запускає скрипт і повертає таблицю proposed / executed / blocked за цю сесію.

`git add -A && git commit -m "05 skills"`.

## Крок 6 · MCP для актуальної документації (тег `step-06-mcp`)

```bash
claude mcp add --transport http --scope project context7 https://mcp.context7.com/mcp --header 'Authorization: Bearer ${CONTEXT7_API_KEY}'
claude mcp add --transport stdio --scope project next-devtools -- npx -y next-devtools-mcp@latest
cat .mcp.json          # має бути буквально ${CONTEXT7_API_KEY}, а не ключ — тому одинарні лапки
claude mcp list
```

**Увага:** у подвійних лапках bash підставить справжній ключ ще до того, як Claude Code запише `.mcp.json`, і ключ поїде в git.
Перевірте `cat .mcp.json` перед комітом.

Перезапустити `claude` → підтвердити проєктні сервери → `/mcp` → `/context all` (скільки контексту коштують інструменти; tool search
вантажить лише назви). Запит, який показує різницю між пам'яттю моделі й доками:

> Через context7 перевір актуальний API Vitest 5 для vi.mock (що змінилось у v5) і дай посилання на джерело. Нічого не редагуй.

Три перевірки, що MCP справді спрацював (їх можна повторити вдома): сервер видно в `/mcp`; запитано те, чого модель не знає з пам'яті;
виклик `mcp__context7__query-docs` видно в `.agent-log/actions.jsonl`.

**Сказати:** для Next.js документація вже лежить у `node_modules/next/dist/docs/` — MCP потрібен для решти світу (Context7) і для
runtime-стану дев-сервера (next-devtools: `get_errors`, `get_routes`; потребує запущеного `pnpm dev`). Опис інструмента з MCP-сервера —
недовірений вхід. Якщо є команда — беріть команду: CLI не займає контекст.

`git add -A && git commit -m "06 mcp"`.

## Крок 7 · Перша задача рівня 1 (тег `step-07-first-task`)

```text
/plan Додай GET /api/health: тонкий route handler app/api/health/route.ts, який повертає Response.json(buildHealth(...))
з версією з package.json; тест app/api/health/route.test.ts (environment node) пишеш ПЕРШИМ і показуєш, що він червоний,
потім реалізуєш. Домашню сторінку заміни на коротку українську (заголовок «День 01 · Агент-асистент», список 7 кроків,
посилання на /api/health) з тестом app/page.test.tsx. Готово, коли pnpm check і pnpm build зелені. Не додавай залежностей.
```

Рецензія плану → затвердити → дивитись на дифи (Manual просить дозвіл на кожен запис) → `pnpm check` (5 тестів) → `pnpm build`.
Потім три команди, які закривають цикл:

```bash
pnpm agent:log        # що агент справді зробив — і скільки разів ви натиснули yes
git diff --stat HEAD  # що змінилось
```

і в Claude Code `/cost` — скільки це коштувало. **Сказати:** «агент сказав» — транскрипт; «агент зробив» — журнал і diff. Без журналу це одне речення.

Спровокована впевнена помилка (5 хв, якщо є час):

> Додай сторінку app/hello/[name]/page.tsx, яка вітає користувача за іменем із params.

Два прийнятні результати — і обидва перемога: (а) агент пише синхронний `params.name` → `pnpm typecheck` ловить помилку, агент читає
`node_modules/next/dist/docs/` і виправляє на `await params`; (б) агент одразу пише `await` і посилається на `.claude/rules/app-router.md`
або AGENTS.md — харнес спрацював до помилки. Це і є trust-then-verify gap: не тон відповіді, а перевірка вирішує.

`git add -A && git commit -m "07 first task"`.

## Фінал (2 хв)

`ls -a`: харнес — це кілька звичайних файлів під контролем версій. Мнемоніка: агент **знає** (`AGENTS.md`, `CLAUDE.md`, `.claude/rules/`),
**вміє** (`.agents/skills/`, `.claude/skills/`), **має доступ** (`.mcp.json`), **не може** (`.claude/settings.json` + hooks), і все це видно
(`.agent-log/`, тести). Відкрити `docs/autonomy-log.md` — так виглядатиме журнал автономності в capstone.

## Якщо щось пішло не так

| Симптом | Дія |
|---|---|
| Claude Code стартує в auto / не показує auto | Shift+Tab до `⏸ manual mode on`; після кроку 2 режим фіксує `settings.json`. Старіша версія — сказати прямо: типовий режим залежить від плану й версії |
| Hook не спрацював (рядка в логу немає) | `node scripts/hooks-selftest.mjs`; перевірити, що `claude` запущено з кореня проєкту і тека довірена (діалог trust у свіжому клоні) |
| Skill не викликається | `/skills` — чи видно; `pnpm skills:sync`; у промпті назвати skill явно `/agent-log-report` |
| Context7 429 / rate limit | ключ у `CONTEXT7_API_KEY` не підхопився — `echo ${CONTEXT7_API_KEY:0:6}` у тому ж терміналі; fallback: показати на слайді |
| next-devtools мовчить | потребує запущеного `pnpm dev` |
| `pnpm` пише «deprecated eslint@9» | очікувано: `eslint-config-next` 16.3 ще не працює з ESLint 10 |
| Модель відповіла правильно без MCP | це теж результат: докази важливіші за припущення; спитати щось, чого точно нема в пам'яті (реліз цього тижня) |
| Немає інтернету | усе вже лежить у резервному клоні; `git checkout step-0N-…` і далі по сценарію |
