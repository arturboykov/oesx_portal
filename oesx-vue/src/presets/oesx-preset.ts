/**
 * OES X · PrimeVue 4 preset
 * ─────────────────────────────────────────────────────────────────────────
 * Расширяет базовый пресет Aura и направляет токены PrimeVue на CSS-переменные
 * дизайн-системы OES X (`tokens.css`). Единственный источник истины по цвету,
 * радиусам, типографике — `tokens.css`. Этот файл — только МОСТ.
 *
 * Почему значения — это `var(--token)`, а не хардкод hex:
 *   tokens.css сам переключает тему через <html data-theme="dark|light">.
 *   Если токены PrimeVue ссылаются на те же var(), вся библиотека PrimeVue
 *   автоматически следует за темой OES X — без дублирования палитры здесь.
 *   Поэтому в colorScheme.light и .dark значения НАМЕРЕННО одинаковые:
 *   фактический свитч темы делает [data-theme] в tokens.css, а не PrimeVue.
 *
 * Подключение — см. README.md в этой папке.
 */
import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

export const OESXPreset = definePreset(Aura, {
  // ── Primitive: бренд-палитра OES X (teal-scale) ────────────────────────
  primitive: {
    borderRadius: {
      none: '0',
      xs: 'var(--r-xs)',   // 2px
      sm: 'var(--r-sm)',   // 4px
      md: 'var(--r-md)',   // 6px
      lg: 'var(--r-lg)',   // 8px
      xl: 'var(--r-xl)',   // 10px
    },
  },

  // ── Semantic: связь палитры и поверхностей с токенами OES X ─────────────
  semantic: {
    // PRIMARY → teal-scale. 500 — основной акцент (= --teal-400 в OES X).
    primary: {
      50:  'var(--teal-100)',
      100: 'var(--teal-100)',
      200: 'var(--teal-200)',
      300: 'var(--teal-300)',
      400: 'var(--teal-400)',
      500: 'var(--teal-400)', // основной акцентный
      600: 'var(--teal-500)',
      700: 'var(--teal-600)',
      800: 'var(--teal-700)',
      900: 'var(--teal-900)',
      950: 'var(--teal-900)',
    },

    transitionDuration: 'var(--dur-base)',     // 200ms
    focusRing: {
      width: '2px',
      style: 'solid',
      color: 'var(--teal-400)',
      offset: '1px',
      shadow: 'none',
    },
    disabledOpacity: '1', // OES X гасит disabled цветом, не прозрачностью

    // Геометрия полей ввода (.input / .textarea)
    formField: {
      paddingX: '12px',
      paddingY: '10px',
      borderRadius: 'var(--r-sm)',             // 4px
      focusRing: { width: '0', style: 'none', color: 'transparent', offset: '0', shadow: 'none' },
      transitionDuration: 'var(--dur-fast)',   // 120ms
    },

    // Контентные контейнеры (.card)
    content: {
      borderRadius: 'var(--r-lg)',             // 8px
    },

    // Оверлеи (Dialog/.modal, Popover/.popover)
    overlay: {
      modal: {
        borderRadius: 'var(--r-lg)',
        shadow: '0 24px 64px rgba(0,0,0,0.5)',
      },
      popover: {
        borderRadius: 'var(--r-lg)',
        padding: '6px',
        shadow: '0 12px 32px rgba(0,0,0,0.42), 0 2px 6px rgba(0,0,0,0.25)',
      },
    },

    // colorScheme: значения одинаковы для light/dark — тему переключает
    // [data-theme] в tokens.css (см. шапку файла).
    colorScheme: {
      light: oesxColors('light'),
      dark:  oesxColors('dark'),
    },
  },

  // ── Component-level: точечная подгонка под классы OES X ─────────────────
  components: {
    button: {
      root: {
        borderRadius: 'var(--r-md)',           // 6px (.btn)
        paddingX: '13px',
        paddingY: '7px',
        gap: '6px',
        sm: { paddingX: '10px', paddingY: '5px', fontSize: '10px' },
        label: { fontWeight: '500' },
        // OES X кнопки моноширинные, мелкие, со spacing — задаётся в bridge.css,
        // т.к. font-family на уровне токена PrimeVue не выражается надёжно.
      },
      colorScheme: {
        light: buttonColors(),
        dark:  buttonColors(),
      },
    },

    inputtext: {
      root: {
        background: 'var(--surface-2)',
        borderColor: 'var(--border)',
        color: 'var(--fg)',
        focusBorderColor: 'var(--teal-400)',
        placeholderColor: 'var(--fg-muted)',
        borderRadius: 'var(--r-sm)',
        paddingX: '12px',
        paddingY: '10px',
      },
    },

    textarea: {
      root: {
        background: 'var(--surface-2)',
        borderColor: 'var(--border)',
        color: 'var(--fg)',
        focusBorderColor: 'var(--teal-400)',
        borderRadius: 'var(--r-sm)',
        paddingX: '12px',
        paddingY: '10px',
      },
    },

    dialog: {
      // Только цвета/радиус — паддинги, размер заголовка и футера берём из
      // базового Aura (иначе ломаются отступы и заголовок мельчает).
      root: {
        background: 'var(--surface)',
        borderColor: 'var(--border-strong)',
        borderRadius: 'var(--r-lg)',
        color: 'var(--fg)',
      },
    },

    datatable: {
      headerCell: {
        background: 'var(--surface-2)',
        borderColor: 'var(--border-strong)',
        color: 'var(--fg-muted)',
        // 9px / uppercase / spacing 0.12em — добивается в bridge.css
      },
      bodyCell: {
        borderColor: 'var(--border)',
      },
      row: {
        background: 'var(--surface)',
        hoverBackground: 'var(--surface-2)',
        color: 'var(--fg)',
      },
    },

    tag: {
      root: {
        borderRadius: 'var(--r-sm)',
        fontSize: '10px',
        fontWeight: '500',
        padding: '4px 10px',
      },
    },

    tabs: {
      tablist: { borderColor: 'var(--border)' },
      tab: {
        color: 'var(--fg-muted)',
        hoverColor: 'var(--fg)',
        activeColor: 'var(--teal-400)',
        borderColor: 'transparent',
        activeBorderColor: 'var(--teal-400)',
      },
      activeBar: { background: 'var(--teal-400)', height: '1.5px' },
    },

    tooltip: {
      root: {
        background: 'var(--surface-3)',
        color: 'var(--fg)',
        borderRadius: 'var(--r-sm)',
      },
    },

    progressbar: {
      root: { background: 'var(--surface-2)', borderRadius: '2px', height: '6px' },
      value: { background: 'var(--teal-400)' },
    },

    // ToggleSwitch — только ЦВЕТОВЫЕ токены (геометрию не трогаем, иначе ломается
    // позиционирование кружка). Цель — контраст OFF/disabled в тёмной теме.
    // Значения через var(--token) сами переключаются по [data-theme].
    toggleswitch: {
      root: {
        background: 'var(--surface-3)',            // OFF-трек
        hoverBackground: 'var(--surface-2)',
        borderColor: 'var(--border-strong)',       // штатный бордер → видно на карте
        hoverBorderColor: 'var(--fg-dim)',
        checkedBackground: 'var(--teal-400)',      // ON
        checkedHoverBackground: 'var(--teal-300)',
        checkedBorderColor: 'var(--teal-400)',
        checkedHoverBorderColor: 'var(--teal-300)',
        disabledBackground: 'var(--surface-2)',
      },
      handle: {
        background: 'var(--fg-muted)',             // контрастный кружок OFF
        hoverBackground: 'var(--fg)',
        checkedBackground: 'var(--fg-on-teal)',
        checkedHoverBackground: 'var(--fg-on-teal)',
        disabledBackground: 'var(--fg-dim)',
      },
    },
  },
});

/** Семантические цвета OES X для colorScheme.
 *  ВАЖНО про surface-ramp: PrimeVue выбирает фоны hover/focus из этого ramp.
 *  В DARK-режиме Aura берёт ВЫСОКИЕ ступени под фоны — поэтому их надо направить
 *  на ТЁМНЫЕ поверхности (а не на светлые --fg), иначе hover будет белым.
 *  В LIGHT-режиме обычный порядок: низкие — светлые, высокие — тёмные (для текста). */
function oesxColors(scheme: 'light' | 'dark') {
  const surface =
    scheme === 'dark'
      ? {
          0: 'var(--fg)', 50: 'var(--fg)', 100: 'var(--fg-muted)', 200: 'var(--fg-dim)', 300: 'var(--fg-dim)',
          400: 'var(--surface-3)', 500: 'var(--surface-3)', 600: 'var(--surface-2)', 700: 'var(--surface)',
          800: 'var(--surface)', 900: 'var(--bg-elev)', 950: 'var(--bg)',
        }
      : {
          0: 'var(--surface)', 50: 'var(--surface)', 100: 'var(--surface-2)', 200: 'var(--surface-3)', 300: 'var(--surface-3)',
          400: 'var(--fg-dim)', 500: 'var(--fg-dim)', 600: 'var(--fg-muted)', 700: 'var(--fg-muted)',
          800: 'var(--fg)', 900: 'var(--fg)', 950: 'var(--fg)',
        };
  return {
    surface,
    primary: {
      color: 'var(--teal-400)',
      contrastColor: 'var(--fg-on-teal)',
      hoverColor: 'var(--teal-300)',
      activeColor: 'var(--teal-500)',
    },
    highlight: {
      background: 'var(--teal-dim)',
      focusBackground: 'var(--teal-glow)',
      color: 'var(--teal-400)',
      focusColor: 'var(--teal-400)',
    },
    mask: {
      background: 'rgba(0,0,0,0.62)',
      color: 'var(--fg)',
    },
    text: {
      color: 'var(--fg)',
      hoverColor: 'var(--fg)',
      mutedColor: 'var(--fg-muted)',
      hoverMutedColor: 'var(--fg)',
    },
    content: {
      background: 'var(--surface)',
      hoverBackground: 'var(--surface-3)',
      borderColor: 'var(--border)',
      color: 'var(--fg)',
      hoverColor: 'var(--fg)',
    },
    formField: {
      background: 'var(--surface-2)',
      disabledBackground: 'var(--surface-3)',
      filledBackground: 'var(--surface-2)',
      borderColor: 'var(--border)',
      hoverBorderColor: 'var(--border-strong)',
      focusBorderColor: 'var(--teal-400)',
      color: 'var(--fg)',
      disabledColor: 'var(--fg-dim)',
      placeholderColor: 'var(--fg-muted)',
      floatLabelColor: 'var(--fg-muted)',
    },
  };
}

/** Цвета для Button по severity. */
function buttonColors() {
  return {
    root: {
      // primary — зелёная (.btn-primary)
      primary: {
        background: 'var(--teal-400)',
        hoverBackground: 'var(--teal-300)',
        activeBackground: 'var(--teal-500)',
        borderColor: 'var(--teal-400)',
        hoverBorderColor: 'var(--teal-300)',
        activeBorderColor: 'var(--teal-500)',
        color: 'var(--fg-on-teal)',
        hoverColor: 'var(--fg-on-teal)',
        activeColor: 'var(--fg-on-teal)',
      },
      // secondary — нейтральная (.btn-neutral)
      secondary: {
        background: 'rgba(255,255,255,0.05)',
        hoverBackground: 'rgba(255,255,255,0.08)',
        borderColor: 'var(--border)',
        hoverBorderColor: 'var(--border-strong)',
        color: 'var(--fg-muted)',
        hoverColor: 'var(--fg)',
      },
      // danger — удаление (.btn-danger)
      danger: {
        background: 'rgba(224,82,82,0.14)',
        hoverBackground: 'rgba(224,82,82,0.22)',
        borderColor: 'rgba(224,82,82,0.35)',
        color: 'var(--neg)',
        hoverColor: 'var(--neg)',
      },
      // warn — предупреждение (.btn-warn)
      warn: {
        background: 'rgba(196,124,50,0.18)',
        hoverBackground: 'rgba(196,124,50,0.26)',
        borderColor: 'rgba(196,124,50,0.50)',
        color: 'var(--warn-orange)',
        hoverColor: 'var(--warn-orange)',
      },
    },
  };
}

export default OESXPreset;
