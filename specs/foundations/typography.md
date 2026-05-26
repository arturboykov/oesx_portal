# Typography

Две гарнитуры: **Geist** (sans, основной текст) и **Geist Mono** (моноширинный,
для меток, идентификаторов, кода, KPI-чисел). Подгружаются с Google Fonts —
`@import` в [src/tokens.css](../../src/tokens.css).

## Tokens

| Token         | Value                                                            |
| ------------- | ---------------------------------------------------------------- |
| `--font-sans` | `'Geist', ui-sans-serif, system-ui, -apple-system, 'Segoe UI'…` |
| `--font-mono` | `'Geist Mono', ui-monospace, 'SF Mono', Menlo, Consolas…`        |

## Scale (явных переменных нет, используются числовые значения inline)

Это сознательно: размеров мало, они привязаны к ролям, плодить токены
`--text-100…--text-900` ради 7 значений — оверфит.

| Size | Weight | Family | Letter-spacing | Role                                        |
| ---- | ------ | ------ | -------------- | ------------------------------------------- |
| 24px | 500    | sans   | -0.02em        | `.page-title` — главный заголовок страницы  |
| 22px | 500    | sans   | -0.02em        | пустое состояние чата                       |
| 16px | 500    | sans   | -0.01em        | `.kpi-value` unit                           |
| 15px | 500    | sans   | -0.01em        | `.modal-title`, `.nav-wordmark`             |
| 14px | 500    | sans   | -0.01em        | заголовки карточек                          |
| 14px | 400    | sans   | 0              | основной текст контент-областей             |
| 13px | 400    | sans   | 0              | базовый размер UI-текста (button, inputs)   |
| 13px | 500    | sans   | -0.01em        | sub-title, тайтлы списков, агенты           |
| 12px | 400    | sans   | 0              | secondary текст, описания, caption          |
| 12px | 500    | mono   | 0.18em         | uppercase бренд-метки (`PERSONAL CABINET`)  |
| 11px | 500    | mono   | 0.03–0.06em    | кнопки `.btn`, табы                         |
| 11px | 400    | mono   | 0.04em         | meta под заголовками                        |
| 10px | 400    | mono   | 0.12em         | uppercase labels (`.label`, KPI-label)      |
| 10px | 500    | mono   | 0.10em         | state-pill, dom-chip                        |
| 9px  | 500    | mono   | 0.12–0.18em    | uppercase колонки таблиц, chip-tags         |

## Rules

- **Заголовки страниц** (`.page-title`) — sans 24/500, letter-spacing `-0.02em`.
- **Технические метки** (uppercase бейджи, колонки таблиц, ID-чипы) — всегда
  `var(--font-mono)`, letter-spacing ≥ `0.08em`, `text-transform: uppercase`.
- **Цифры в KPI и метриках** — `var(--font-mono)`, выровненные по табличным
  цифрам (`font-feature-settings: 'tnum'` — Geist Mono это даёт by default).
- **Никакого Comic Sans**. Если в спеке компонента не указан шрифт явно —
  по умолчанию `var(--font-sans)` 13px/400.

## Render quality

В `body` уже стоит:
- `-webkit-font-smoothing: antialiased`
- `text-rendering: optimizeLegibility`

Не отключайте на потомках без причины — Geist рассчитан на сглаженный рендер.

## Line-height

Стандартные значения, не токенизированы:
- 1.2 — для крупных заголовков (24px+).
- 1.45–1.55 — для основного текста и описаний.
- 1 (или `line-height: 1`) — для KPI-чисел и одиночных строк меток.

## Пример

```jsx
{/* Заголовок страницы */}
<div className="page-title">Решения</div>
<div className="page-sub">Каталог артефактов · фильтры · действия</div>

{/* Технический бейдж */}
<span style={{
  fontFamily: 'var(--font-mono)',
  fontSize: 10,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: 'var(--fg-muted)'
}}>
  PERSONAL CABINET
</span>
```
