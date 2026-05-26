# Motion

Анимации — сдержанные, короткие, с одной общей easing-кривой. Никаких
bounce/spring/elastic.

## Tokens

| Token            | Value                              | Когда                       |
| ---------------- | ---------------------------------- | --------------------------- |
| `--dur-fast`     | `120ms`                            | hover/focus state           |
| `--dur-base`     | `200ms`                            | переключения, появление     |
| `--dur-slow`     | `300ms`                            | смена темы, крупные fade-in |
| `--ease-apple`   | `cubic-bezier(0.16, 1, 0.3, 1)`    | основной ease-out           |

## Named animations (определены в [app.css](../../src/app.css))

| Keyframes          | Длительность   | Назначение                                  |
| ------------------ | -------------- | ------------------------------------------- |
| `oes-fade-up`      | `.35s` (или `.18s` для модалок) | появление: opacity 0→1, translateY 8px→0 |
| `oes-pulse`        | `1.6s` infinite | мигание точки/маркера                       |
| `oes-spin`         | `1.2s` linear infinite | спиннер                              |
| `oes-shimmer`      | `1.6s` linear infinite | skeleton-плейсхолдер                |
| `oes-toast-in`     | `.22s`         | появление тоста снизу                       |
| `oes-toast-progress` | `5s` linear  | прогресс автоскрытия тоста                  |
| `oes-drawer-in`    | `.22s`         | выезжающий слева drawer                     |

## Utility classes

| Class       | Эффект                                |
| ----------- | ------------------------------------- |
| `.fade-up`  | `oes-fade-up .35s var(--ease-apple) both` |
| `.pulse`    | `oes-pulse 1.6s ease-in-out infinite` |
| `.spin`     | `oes-spin 1.2s linear infinite`       |
| `.skeleton` | shimmer + правильный градиентный background |

## Transitions на интерактивных элементах

Общие правила:
- Кнопки, чипы: `transition: all .15s var(--ease-apple)` или `.18s`.
- Поля ввода: `transition: border-color .15s, background .15s`.
- Тема: `transition: background var(--dur-slow), color var(--dur-slow)` —
  применяется на `html, body`, остальное наследуется.

## Rules

- **`transform: none` вместо `translateY(0)`** в `to`-кадре `oes-fade-up`.
  Это важный нюанс: `translateY(0)` всё ещё устанавливает containing block
  для `position: fixed` потомков, что ломает `inset: 0` у модалок. С `none`
  — не ломает. См. также правило про портал в `CLAUDE.md`.
- **`prefers-reduced-motion`** пока не обработан — это TODO для accessibility-фазы.
- **Никаких `transition: all`** на больших контейнерах (`main`, `body`) — это
  приводит к плавающим лагам при ресайзе/переключении темы.
- **Шиммер только на skeleton-плейсхолдерах** генерируемого контента. Не
  применяйте к статическим элементам — это маркер «здесь скоро появится
  настоящий контент».
