# Той самий харнес у Cursor і Codex

Заняття 1 показане в Claude Code. Ті самі п'ять примітивів існують у Cursor (заняття 2) і в ChatGPT Codex (заняття 4) —
з іншими назвами файлів і режимів. Таблиця — стан на вересень 2026 (рядки про Cursor звірені з cursor.com/docs 10.09.2026); перед використанням
звірте з документацією свого інструмента, бо ці назви змінюються між версіями.

**Важливо про Cursor:** рівень довіри там задається двома незалежними осями. Режим чату (Agent · Plan · Ask)
вирішує, чи агент редагує файли; Run Mode (Auto-review · Allowlist · Run Everything) — чи він питає про
команди. Документація: [«Agents can modify workspace files without approval, except for configuration
files»](https://cursor.com/docs/agent/security) і [«Auto-review applies to shell, MCP, and Fetch tool
calls»](https://cursor.com/docs/agent/security/run-modes). Тому «Allowlist із порожнім списком» — це рівень 2,
а не 1.

| Поняття | Claude Code 2.1.x | Cursor 3.x | Codex CLI 0.15x |
|---|---|---|---|
| Рівень 1 «агент пропонує — ви вирішуєте» | `--permission-mode default` (у UI — Manual); у проєкті `permissions.defaultMode: "default"` | режим чату **Ask** (лише читає) або **Plan**. Run Mode тут ні до чого: він керує тільки командами | `approval_policy = "untrusted"` × `sandbox_mode = "read-only"` |
| Рівень 2 «правки сам, команди — з дозволу» | `permissions.defaultMode: "acceptEdits"` | режим **Agent** + Run Mode **Allowlist** із порожнім `terminalAllowlist` (`.cursor/permissions.json`) — це базова поведінка Cursor | `on-request` × `workspace-write` |
| Рівень «класифікатор вирішує» | `auto` — стартовий режим на Pro/Max/Team з 14.08.2026 | **Auto-review** — рекомендований дефолт із 3.6 | `approvals_reviewer = "auto_review"` |
| Повний обхід | `bypassPermissions` / `--dangerously-skip-permissions` | Run Everything | `--yolo` (`--full-auto` застарів) |
| Режим плану | Shift+Tab, `/plan …`, `--permission-mode plan` | Plan (Shift+Tab, `/plan`) | `/plan` |
| Статичний контекст | `CLAUDE.md` → `@AGENTS.md` (AGENTS.md нативно **не** читає) | `AGENTS.md` нативно + `.cursor/rules/*.mdc` (`description`/`globs`/`alwaysApply`) | `AGENTS.md` нативно (ланцюг від кореня git до cwd, ліміт 32 KiB) |
| Правила за шляхом | `.claude/rules/*.md` з frontmatter `paths:` | `.cursor/rules/*.mdc` з `globs:` | вкладені `AGENTS.md` |
| Навички | `.claude/skills/<name>/SKILL.md` (`.agents/skills` не читає) | `.agents/skills/` або `.cursor/skills/` (читає і `.claude/skills/`) | `.agents/skills/` (cwd → корінь репо), `~/.agents/skills/` |
| MCP | `.mcp.json`, підстановка `${VAR}` | `.cursor/mcp.json`, підстановка **`${env:VAR}`** | `[mcp_servers.<name>]` у `~/.codex/config.toml` (`codex mcp add`) |
| Hooks | `hooks` у `.claude/settings.json` (PreToolUse / PostToolUse / PostToolUseFailure …) | `.cursor/hooks.json` (`"version": 1`) — 21 подія, серед них `preToolUse`, `postToolUse`, `postToolUseFailure`, `afterFileEdit`, `stop`; exit code 2 блокує дію так само, як у Claude Code | `.codex/hooks.json` за `[features] hooks = true` (події сумісні з Claude Code) |
| Транскрипти | `~/.claude/projects/<проєкт>/<session>.jsonl`, `/export` | `transcript_path` у payload hook-а; локальний пошук у транскриптах (3.11) | `~/.codex/history.jsonl` (+ rollouts у `~/.codex/sessions/`) |
| Вартість / контекст | `/cost` (= `/usage`), `/context`, `/insights` | cursor.com/dashboard/usage | `/status` |

## Один журнал дій — три інструменти

Hook `.claude/hooks/log-action.mjs` читає JSON зі stdin і не залежить від Claude Code: йому потрібні лише поля
`hook_event_name`, `tool_name`, `tool_input.file_path | command`. Codex надсилає такий самий JSON.
Для Cursor формат інший, тому потрібен тонкий адаптер. Робочий конфіг (звірений із
[cursor.com/docs/hooks](https://cursor.com/docs/hooks) і перевірений на занятті 2):

```json
{
  "version": 1,
  "hooks": {
    "preToolUse": [{ "command": "node .cursor/hooks/agent-log.mjs preToolUse" }],
    "postToolUse": [{ "command": "node .cursor/hooks/agent-log.mjs postToolUse" }],
    "postToolUseFailure": [{ "command": "node .cursor/hooks/agent-log.mjs postToolUseFailure" }],
    "afterFileEdit": [{ "command": "node .cursor/hooks/agent-log.mjs afterFileEdit" }]
  }
}
```

`afterFileEdit` підключається окремо, бо це єдина документована подія, яка дає `file_path`. Адаптер
має **завжди виходити з кодом 0 і мовчати в stdout**: у Cursor код 2 на події `pre*`/`before*` означає
«заблокувати дію», тож логер, який впав, зупинив би агента. Готовий адаптер і його selftest —
у демо-репозиторії заняття 2.

Ескіз для Codex (`~/.codex/config.toml`: `[features] hooks = true`; проєктний файл читається лише у trusted-проєкті):

```json
{
  "hooks": {
    "PostToolUse": [{ "matcher": ".*", "hooks": [{ "type": "command", "command": "node .claude/hooks/log-action.mjs" }] }]
  }
}
```

## Context7 в інших інструментах

`.cursor/mcp.json`:

```json
{ "mcpServers": { "context7": { "url": "https://mcp.context7.com/mcp", "headers": { "Authorization": "Bearer YOUR_API_KEY" } } } }
```

`~/.codex/config.toml`:

```toml
[mcp_servers.context7]
url = "https://mcp.context7.com/mcp"
bearer_token_env_var = "CONTEXT7_API_KEY"
```

Джерела: code.claude.com/docs · cursor.com/docs · learn.chatgpt.com/docs (документація Codex переїхала з developers.openai.com) · agents.md · agentskills.io · modelcontextprotocol.io.
