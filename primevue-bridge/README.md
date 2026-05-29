# OES X · мост дизайн-системы → PrimeVue 4

Этот пакет связывает дизайн-систему OES X (прототип на React) с библиотекой
**PrimeVue 4** в вашем Vue-проекте. Цель — чтобы компоненты PrimeVue
(`Button`, `InputText`, `Dialog`, `DataTable`, `Tag`, `Tabs`…) **из коробки**
выглядели как OES X, без ручного перекрашивания каждого через `!important`.

## Что в пакете

| Файл | Назначение |
| --- | --- |
| `tokens.css` | **Источник истины** дизайн-системы: цвета, радиусы, типографика, spacing, тени, motion. CSS-переменные. Тёмная + светлая тема. (Копия из прототипа — `src/tokens.css`.) |
| `oesx-preset.ts` | Пресет PrimeVue 4 на базе Aura. Направляет токены PrimeVue (`--p-*`) на переменные OES X. **Основной механизм темизации.** |
| `prime-bridge.css` | Тонкий CSS-слой: моноширинная типографика контролов, ровный фокус, bespoke-классы (kind-чипы). Дополняет пресет. |

> ⚠️ `tokens.css` нужно скопировать из прототипа рядом с этими файлами (или
> взять из репозитория прототипа `src/tokens.css`). Пресет ссылается на его
> переменные через `var(--…)`.

## Философия (прочитайте, это сэкономит вам недели)

**Прототип на React — это интерактивная спецификация, а не код для копирования.**
Вы пишете Vue с нуля. Единственное, что переезжает буквально, — это `tokens.css`
и эта связка. Дизайн «зашит» в переменные: меняете токен — меняется вся
библиотека PrimeVue разом.

**Тему переключает OES X, а не PrimeVue.** В `tokens.css` смена темы идёт через
`<html data-theme="dark">` / `data-theme="light"`. Токены PrimeVue ссылаются на
те же `var(--…)`, поэтому PrimeVue **автоматически следует** за темой OES X.
Именно поэтому в пресете значения для `light` и `dark` одинаковые — это
сделано намеренно.

---

## Установка

```bash
npm install primevue @primeuix/themes
# @primeuix/themes — актуальный пакет тем PrimeVue 4 (бывший @primevue/themes,
# который теперь deprecated). definePreset/Aura импортируются из него.
```

### `main.ts`

```ts
import { createApp } from 'vue';
import PrimeVue from 'primevue/config';
import { OESXPreset } from './presets/oesx-preset';
import App from './App.vue';

// Порядок импорта CSS критичен — см. ниже.
import './assets/tokens.css';        // 1. токены OES X (источник истины)
import './assets/prime-bridge.css';  // 2. мост (после темы PrimeVue, см. cssLayer)

const app = createApp(App);

app.use(PrimeVue, {
  theme: {
    preset: OESXPreset,
    options: {
      // Тему ведёт OES X через [data-theme]; выравниваем dark-селектор PrimeVue.
      darkModeSelector: '[data-theme="dark"]',
      // Слой стилей: см. раздел «Если бридж не перебивает PrimeVue».
      cssLayer: false,
    },
  },
});

app.mount('#app');
```

Разложите файлы так:
```
src/
  assets/
    tokens.css
    prime-bridge.css
  presets/
    oesx-preset.ts
```

### Переключение темы

```ts
// dark по умолчанию (как в прототипе):
document.documentElement.setAttribute('data-theme', 'dark');
// светлая:
document.documentElement.setAttribute('data-theme', 'light');
```
Больше ничего переключать не нужно — и `tokens.css`, и PrimeVue отреагируют.

---

## Карта соответствия: OES X → PrimeVue

Что из прототипа чем закрывается. **~60-70% атомов — готовые компоненты PrimeVue.**

| OES X (класс / компонент) | PrimeVue 4 | Заметки |
| --- | --- | --- |
| `.btn-primary` | `<Button>` | severity по умолчанию = primary (зелёная) |
| `.btn-neutral` | `<Button severity="secondary">` | |
| `.btn-danger` | `<Button severity="danger">` | |
| `.btn-warn` | `<Button severity="warn">` | |
| `.btn-ghost` | `<Button text>` или `outlined` | подкрутить под teal-dim при необходимости |
| `.btn-sm` | `<Button size="small">` | |
| `.input` | `<InputText>` | |
| `.textarea` | `<Textarea>` | |
| `.input.mono` | `<InputText class="mono">` | mono — утилита из tokens/app |
| `.modal` | `<Dialog modal>` | шапка/тело/футер → header/content/footer слоты |
| `.popover` | `<Popover>` (ex-OverlayPanel) | |
| меню по `⋯` | `<Menu>` / `<TieredMenu>` | пункты «Поделиться», «Отключить» и т.д. |
| `.card` | `<Card>` или `<Panel>` | |
| `.tabs` / `.tab` | `<Tabs>` + `<TabList>` + `<Tab>` | подчёркивание активной — в bridge.css |
| `.utable` (Решения / Пользователи / Домены) | `<DataTable>` + `<Column>` | ✨ главный выигрыш — не писать таблицы руками |
| `.bar` (прогресс) | `<ProgressBar>` | классы `is-warn/is-danger/is-pos` из bridge.css |
| `.label` / `.field-label` | `<label>` + класс | моно-капс уже в tokens |
| тосты `window.notify(...)` | `<Toast>` + `useToast()` | kind → severity (success/info/warn/error) |
| confirm-модалки | `<ConfirmDialog>` + `useConfirm()` | для «Удалить решение» и т.п. |
| `.state-pill.enabled/configured` | `<Tag severity="success">` | или bespoke-чип |
| скелетоны (shimmer) | `<Skeleton>` | у PrimeVue проще, можно нарастить shimmer |

### Что остаётся bespoke (PrimeVue не даёт — пишете на Vue сами)

Это ~30%. Это нормально: PrimeVue даёт инфраструктуру, OES X — характер.
Все нужные токены уже в `tokens.css`, геометрию берите из прототипа
(`src/parts.jsx`, `src/app.css`).

| Компонент | Откуда брать стиль |
| --- | --- |
| **Kind-чип** (Дашборд / Алерт / Команда / Черновик) | классы `.oesx-kind--*` в `prime-bridge.css` — навесьте на `<Tag>` или `<span>` |
| **KPI-tile** (цифра + лейбл + дельта) | `.kpi-tile` / `.kpi-value` / `.kpi-sub` в `app.css`; компонент `Kpi` в `parts.jsx` |
| **ChatBubble** (user / bot / system) | `.bubble`, `.bubble-user`, `.bubble-bot` в `app.css` |
| **Графики** (Sparkline, MiniBars, PreviewChart, ForecastChart) | готовые SVG-компоненты в `parts.jsx` — переносятся в `.vue` почти 1:1 |
| **Sidebar с overlay <1200px** | своя адаптивная логика; брейкпойнт 1200px |
| **Превью-панель Create** (skeleton + стадии генерации) | `create.jsx` + `@keyframes oes-shimmer` |
| **notif-row** с конвертами (прочитать/непрочитать) | `.notify-row` + hover-иконки |
| **SourceKind** глиф (БД/MCP/API/ДОКИ) | `SourceKind` в `parts.jsx` |
| **dom-chip** (Подключённые API · MCP) | `.dom-chip` + цветовые варианты в `app.css` |

---

## Реалистичные оговорки

1. **«90% похоже» — легко, «100% пиксель-в-пиксель» — больно.** У PrimeVue свои
   дефолты по высоте/паддингам/анимациям. До ~90% совпадения — 3-5 дней
   точечной подгонки пресета. Последние 10% (0.5px бордеры, точечный glow,
   letter-spacing для mono) — отдельные правки, часть можно осознанно отпустить.

2. **Только PrimeVue v4.** Туториалы по v3 не подходят — там другой подход к
   темам. Документация по токенам: <https://primevue.org/theming/styled/>.

3. **Если бридж не перебивает стили PrimeVue.** PrimeVue инжектит тему в
   `<head>` в runtime, и `prime-bridge.css` может проигрывать по специфичности.
   Решения (любое одно):
   - включить `cssLayer: true` в опциях темы и обернуть бридж в слой
     `@layer primevue, oesx;` (oesx — выше);
   - или импортировать `prime-bridge.css` строго последним;
   - или поднять специфичность селекторов в бридже.

4. **Surface-ramp PrimeVue (0–950) маппится на 4 поверхности OES X
   приблизительно.** Если какой-то компонент берёт неожиданную ступень
   (например, `surface.400` для бордера) — поправьте маппинг в
   `oesxColors()` внутри пресета.

---

## Как расширять пресет

Подгонка конкретного компонента — в секции `components` пресета. Пример: хотите
изменить фон чекбокса —

```ts
components: {
  checkbox: {
    root: { background: 'var(--surface-2)', borderColor: 'var(--border)' },
    checked: { background: 'var(--teal-400)', borderColor: 'var(--teal-400)' },
  },
}
```

Имена токенов компонента смотрите в исходниках Aura
(`node_modules/@primevue/themes/aura/<component>/index.*`) или в дизайн-вьюере
на primevue.org. **Значение всегда — `var(--token)` из `tokens.css`**, чтобы не
расходиться с источником истины.

---

## С чего начать (рекомендуемый порядок)

1. Поднять скелет Vue 3 + Vite + PrimeVue 4, подключить `tokens.css` + пресет +
   бридж по инструкции выше. Проверить на `<Button>` / `<InputText>` / `<Dialog>`.
2. Собрать **одну референс-страницу** — «Аккаунт → Профиль» (там самый плотный
   набор: форма, карточки, табы, чипы, плитки агентов, карточка контейнера).
   Это докажет визуальную совместимость на самом нагруженном экране.
3. Дальше — экраны в порядке приоритета прототипа:
   `чат → решения (DataTable) → создание решения → аккаунт → администрирование`.
4. Storybook — когда наберётся 5-10 компонентов, не раньше.

Вопросы по конкретному компоненту или экрану — открывайте прототип
(`http://10.107.111.66:8080/oesx/`) и сверяйтесь с `tokens.css` + `app.css`.
