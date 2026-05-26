# OES X · Личный кабинет — инструкции для Claude Code

Этот файл — контракт для LLM-агентов, которые будут писать или модифицировать
код в этом проекте. Читать **перед каждой сессией**, прежде чем трогать UI.

## Продукт

OES X · Личный кабинет — веб-приложение для рабочих ГТК / ВГК (горно-транспортный
комплекс, вскрышно-погрузочный комплекс) с AI-агентом, который собирает
дашборды/алерты/команды по запросу. UI **строго на русском**, термины
доменно-специфичные (КИО, смена, экскаватор, БелАЗ, КамАЗ, ПК 4000).

## Стэк

- **Vite + React 18.3.1**, ESM-модули.
- **CSS-переменные** для токенов (`src/tokens.css`), классы + inline `style={{}}` —
  оба паттерна допустимы, не пытайтесь конвертировать одно в другое.
- **Portable Node** в `../.toolchain/node-v20.18.1-win-x64`. Системного `npm` нет.
  Сборка через `build.cmd` (он подбирает PATH), dev через `dev.cmd`,
  деплой — `deploy.ps1`.
- **Vite base**: `/oesx/` (см. `vite.config.js`). Для деплоя.

## Дизайн-система

**Единственный источник истины** для всех цветов, размеров, отступов, теней:
- [`src/tokens.css`](src/tokens.css) — CSS-переменные (dark + light theme).
- [`specs/foundations/`](specs/foundations/) — словесная документация:
  [color](specs/foundations/color.md), [typography](specs/foundations/typography.md),
  [spacing](specs/foundations/spacing.md), [radii](specs/foundations/radii.md),
  [shadows](specs/foundations/shadows.md), [motion](specs/foundations/motion.md).

### Жёсткие правила

1. **НЕ ИСПОЛЬЗУЙТЕ hex/rgba литералы** (`#1DB89A`, `rgba(29,184,154,…)`)
   в новых CSS-классах и в `style={{...}}` блоках. Только `var(--token)`.
   Исключение — сам `tokens.css` (это и есть единственное место hex).
   Полупрозрачные оверлеи модалок/тостов с `rgba(0,0,0,…)` — допустимы по месту.
2. **Перед тем как добавить новый цвет/размер** — проверьте, нет ли уже
   подходящего токена в `tokens.css`. 80% случаев — есть.
3. **Если нужного токена нет** — сначала добавьте в `tokens.css` + строчку
   в соответствующий foundations-спек, потом используйте. Не наоборот.
4. **WCAG AA минимум**: текст `--fg` / `--fg-muted` ≥ 4.5:1 на любой
   поверхности. `--fg-dim` — НЕ для текста, только для UI-точек/линий (3:1).
5. **При добавлении нового компонента** (атома или молекулы) — задокументируйте
   его в `specs/components/<name>.md` по шаблону (purpose / anatomy / tokens
   used / variants / states / example). Без спека компонент не считается
   частью системы.

## Архитектурные паттерны (не изобретайте заново)

### Модалки — через портал

Любая модалка / попопер с `position: fixed; inset: 0` оборачивается в
`<Modal onClose={…}>` из [`src/portal.jsx`](src/portal.jsx). Иначе
ломаются containing-blocks: `.fade-up` потомки с `transform` создают новый
containing block, и `inset: 0` модалки начинает резолвиться от родителя, а
не от viewport.

**Связанный фикс**: в `@keyframes oes-fade-up` финальный кадр —
`transform: none`, НЕ `translateY(0)`. Это сознательно, не меняйте.

### Глобальное состояние в `App.jsx`

Шерится через props (не Context, не Redux):
- `notifications` + `markNotificationRead/Unread/AllRead`,
- `agents` + `setPrimaryAgent` + `primaryAgentName`,
- `route`, `settingsTab`, `adminTab`, `chatTrigger`,
- `impersonating` (admin → user).

Имя отвечающего в чате агента **всегда** = `primaryAgentName`. Это
синхронизировано с Профилем агента в Аккаунте.

### Тосты

```js
window.notify({ title: '…', body: '…', kind: 'success' | 'info' | 'error' | 'warn' });
```

### Mock-данные

Единый источник — `OESDATA` в [`src/data.jsx`](src/data.jsx). Все mock-юзеры,
решения, домены, источники, каналы, биллинг живут там. Не создавайте дубли
в компонентах.

### Тема

`<html data-theme="dark" | "light">`. Светлая — override-блок в `tokens.css`.
Переключение — через `setTheme()` в `App.jsx`. Никаких отдельных «light-only»
компонентов.

### Адаптивность

Брейкпойнт **1200px**:
- ≥1200: сайдбар в потоке, страница Create в две колонки (превью + чат).
- &lt;1200: сайдбар плавает поверх (`position: fixed` overlay), Create
  становится одной колонкой (превью сверху, чат снизу, ≤40vh).

## Файловая структура

```
src/
  tokens.css           ← дизайн-токены (источник истины)
  app.css              ← классы и layout (импортирует tokens.css)
  main.jsx             ← точка входа Vite
  App.jsx              ← root, route, глобальное состояние
  data.jsx             ← OESDATA — все mock-данные
  icons.jsx            ← все SVG-иконки (Icon* + CubeLogo + ChannelGlyph)
  parts.jsx            ← переиспользуемые Chip, KindChip, Kpi, SourceKind
  portal.jsx           ← Modal (createPortal wrapper)
  shell.jsx            ← TopNav, Sidebar, ROUTE_DEFS, CreateButton
  tweaks-panel.jsx     ← демо-панель (роль/лимит/состояние) для скриншотов
  user.jsx             ← currentMe(), currentTimestamp()
  utils.jsx            ← downloadCSV, makeShortId
  sections/
    home.jsx           ← Чат (SectionChat)
    create.jsx         ← Страница создания/редактирования решения
    solution-view.jsx  ← Просмотр опубликованного решения
    various.jsx        ← Решения, Поддержка, Аккаунт (Settings*)
    usage.jsx          ← Использование (биллинг + лимиты)
    admin.jsx          ← Администрирование (Домены + Пользователи)

specs/
  foundations/         ← цвет/типография/spacing/радиусы/тени/motion
  components/          ← (по мере роста — спеки атомов и молекул)
  patterns/            ← (по мере роста — спеки крупных макетов)

build.cmd / dev.cmd / deploy.ps1   ← обёртки для PATH+npm+scp
```

## Соглашения по коду

- **Тексты UI только на русском**. Английские термины (Workspace, MCP, API,
  Telegram) допустимы как имена собственные. Технические идентификаторы и
  моноширинные метки — латиница допустима.
- **Inline styles** — нормальная практика в проекте. Не пытайтесь
  перерефакторить всё в classNames; это намеренное архитектурное решение.
- **Комментарии в коде** — только если объясняют **почему** (неочевидную
  причину, hidden constraint, баг-воркараунд). Не комментируйте **что**.
- **Тосты, а не alert/confirm**. `window.notify(...)` для успехов и инфы;
  модалка `<…ConfirmModal>` для подтверждений с действиями.
- **Иконки** только из `icons.jsx`. Не импортируйте `react-icons` или
  `lucide-react` — стиль ломается. Если иконки нет — добавьте в `icons.jsx`
  одну SVG-функцию через шаблон `const IconFoo = (p) => <I {...p} d={…} />`.

## Известные TODO / расширения

- Component-level спеки (`specs/components/`) — пишутся **по мере** касания
  компонентов в задачах, не заранее.
- `scripts/token-audit.js` — пока не написан. Когда появится, будет CI-проверкой.
- Миграция React → Vue — запланирована. Все foundations-спеки и `tokens.css`
  переедут в Vue без изменений. JSX-компоненты будут переписаны как `.vue`.
- `prefers-reduced-motion` — не обработан.

## Что НЕ делать

- Не предлагать рефакторинг inline-стилей в classNames без явного запроса.
- Не предлагать смену стэка (Next.js, Tailwind, Material UI, etc.).
- Не добавлять зависимости без явной необходимости — bundle уже 420кБ.
- Не трогать `vite.config.js` `base: '/oesx/'` — он привязан к деплою.
- Не коммитить за пользователя без явного "сделай git commit".
