# OES X · Личный кабинет — Vue 3 + PrimeVue 4

Vue-версия портала OES X. **Фаза 1 миграции** с React-прототипа: фундамент
(токены → мост → пресет PrimeVue), Shell с роутером и одна полностью собранная
референс-страница — **Аккаунт → Профиль**. Остальные разделы — заглушки,
наполняются в следующих фазах по тому же образцу.

## Стек

- **Vue 3** (`<script setup>` + Composition API) + **TypeScript**
- **Vite 5** (порт 5174 — чтобы не конфликтовать с React-прототипом на 5173)
- **PrimeVue 4** + `@primeuix/themes` (пресет Aura, перенаправленный на токены OES X)
- **Vue Router 4**
- **Storybook 8** (`@storybook/vue3-vite`)

## Запуск (портативный Node)

Системного Node нет — используется портативный в `../.toolchain/`. Обёртки:

```powershell
.\dev.cmd       # dev-сервер → http://localhost:5174/
.\build.cmd     # прод-сборка → dist/
```

Либо через npm-скрипты (если Node в PATH):

```bash
npm run dev          # http://localhost:5174/
npm run build        # dist/
npm run typecheck    # vue-tsc --noEmit
npm run storybook    # http://localhost:6006/
npm run build-storybook
```

## Структура

```
src/
  assets/
    tokens.css          ← дизайн-токены OES X (источник истины)
    app.css             ← layout/shell-классы (порт нужного из React app.css)
    prime-bridge.css    ← мост: моно-типографика контролов, kind-чипы
  presets/
    oesx-preset.ts      ← пресет PrimeVue 4 (Aura → токены OES X)
  data.ts               ← OESDATA + TS-типы (порт data.jsx)
  user.ts utils.ts      ← currentMe/время, downloadCSV/makeShortId
  store.ts              ← reactive-стор (тема, роль, уведомления, агенты, лимит)
  routes-def.ts         ← ROUTE_DEFS / SIDEBAR_GROUPS / KIND_OPTIONS
  router.ts             ← Vue Router
  icons/                ← Icon.vue (карта путей) + CubeLogo + ChannelGlyph
  components/
    AppShell.vue TopNav.vue Sidebar.vue   ← shell
    Field.vue Chip.vue KindChip.vue Kpi.vue ← bespoke-атомы
  pages/
    AccountPage.vue     ← референс-страница (вкладка «Профиль» собрана)
    PlaceholderPage.vue ← заглушки для остальных разделов
  stories/              ← Storybook: токены + Chip/KindChip/Kpi/Button
```

## Темизация

Тему ведёт OES X через `<html data-theme="dark|light">` (см. `store.ts` →
`toggleTheme`). Токены PrimeVue ссылаются на те же CSS-переменные, поэтому вся
библиотека следует за темой автоматически. Подробнее — в
`../primevue-bridge/README.md`.

## Что дальше (Фаза 2)

Переносить остальные экраны в порядке: чат → решения (PrimeVue `DataTable`) →
создание решения → администрирование. Каждый — по образцу `AccountPage.vue`:
PrimeVue-компоненты для инфраструктуры + bespoke-атомы на токенах.
