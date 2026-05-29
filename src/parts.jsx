import React from 'react';
import { IconActivity, IconAlertCircle, IconEdit, IconBrain, IconFork, IconMessageSquare, IconBookOpen } from './icons.jsx';

/* Shared UI atoms — Chip, Kpi, MiniChart, MiniBars, SimpleSparkline,
   PreviewDashboard (used in Create flow). */

/* — Chip — */
const CHIP_BASE = {
  display: 'inline-flex', alignItems: 'center', gap: 5,
  fontFamily: 'var(--font-mono)', fontWeight: 500,
  fontSize: 10, lineHeight: 1.2,
  letterSpacing: '0.08em', textTransform: 'uppercase',
  padding: '4px 10px', borderRadius: 'var(--r-sm)',
  whiteSpace: 'nowrap',
};
const CHIP_KIND = {
  dash:    { background: 'var(--chip-dash-bg)',  color: 'var(--chip-dash-fg)',  border: '0.5px solid var(--chip-dash-b)' },
  alert:   { background: 'var(--chip-alert-bg)', color: 'var(--chip-alert-fg)', border: '0.5px solid var(--chip-alert-b)' },
  app:     { background: 'var(--chip-app-bg)',   color: 'var(--chip-app-fg)',   border: '0.5px solid var(--chip-app-b)' },
  command: { background: 'rgba(29,184,154,0.10)', color: 'var(--teal-400)',     border: '0.5px solid rgba(29,184,154,0.30)' },
  pos:     { background: 'rgba(29,184,154,0.10)',color: 'var(--pos)',           border: '0.5px solid rgba(29,184,154,0.30)' },
  neg:     { background: 'rgba(192,57,43,0.10)', color: 'var(--neg)',           border: '0.5px solid rgba(192,57,43,0.30)' },
  warn:    { background: 'rgba(200,160,64,0.12)',color: 'var(--warn)',          border: '0.5px solid rgba(200,160,64,0.30)' },
  neutral: { background: 'rgba(148,163,184,0.10)',color: 'var(--fg-muted)',     border: '0.5px solid var(--border)' },
  draft:   { background: 'rgba(74,104,120,0.12)', color: 'var(--fg-muted)',      border: '0.5px solid var(--border)' },
};
const CHIP_DOT = {
  pos: 'var(--pos)', neg: 'var(--neg)', warn: 'var(--warn)',
  neutral: 'var(--fg-muted)', dash: 'var(--chip-dash-fg)', alert: 'var(--chip-alert-fg)',
  app: 'var(--chip-app-fg)', command: 'var(--teal-400)', draft: 'var(--fg-muted)',
};
function Chip({ kind = 'neutral', dot = false, children, style }) {
  return (
    <span style={{ ...CHIP_BASE, ...CHIP_KIND[kind], ...style }}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: 999, background: CHIP_DOT[kind], display: 'inline-block' }} />}
      {children}
    </span>
  );
}

const KIND_CHIP_LABEL = {
  dash: 'ДАШБОРД', alert: 'АЛЕРТ', command: 'КОМАНДА', automation: 'АВТОМАТИЗАЦИЯ',
  app: 'ПРИЛОЖЕНИЕ', draft: 'ЧЕРНОВИК',
};
const KIND_CHIP_KIND = {
  dash: 'dash', alert: 'alert', command: 'command', automation: 'command',
  app: 'app', draft: 'draft',
};
function KindChip({ kind }) {
  return <Chip kind={KIND_CHIP_KIND[kind] || 'neutral'}>{KIND_CHIP_LABEL[kind] || kind}</Chip>;
}

/* — Kpi tile — */
function Kpi({ label, value, unit, sub, subTone, tone = 'neutral', icon }) {
  const TONE = { pos: 'var(--pos)', neg: 'var(--neg)', warn: 'var(--warn)', neutral: 'var(--fg)', teal: 'var(--teal-400)', info: 'var(--info)' };
  const col = TONE[tone] || TONE.neutral;
  const subCol = subTone ? TONE[subTone] : 'var(--fg-muted)';
  return (
    <div className="kpi-tile">
      <div className="kpi-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {icon}
        <span>{label}</span>
      </div>
      <div className="kpi-value" style={{ color: col }}>
        {value}{unit && <span className="unit" style={{ color: col }}>{unit}</span>}
      </div>
      {sub && <div className="kpi-sub" style={{ color: subCol }}>{sub}</div>}
    </div>
  );
}

/* — Mini sparkline (line). Pass data: array of numbers, w/h, color. */
function Sparkline({ data, width = 120, height = 32, color = 'var(--teal-400)', fill = true, stroke = 1.5 }) {
  if (!data || data.length === 0) return null;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const dx = width / (data.length - 1);
  const pts = data.map((v, i) => [i * dx, height - ((v - min) / range) * (height - 4) - 2]);
  const path = pts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(' ');
  const area = `${path} L${width},${height} L0,${height} Z`;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
      {fill && <path d={area} fill={color} opacity="0.12" />}
      <path d={path} stroke={color} strokeWidth={stroke} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* — Mini bars — */
function MiniBars({ data, width = 160, height = 36, color = 'var(--teal-400)' }) {
  const max = Math.max(...data);
  const bw = width / data.length;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
      {data.map((v, i) => {
        const h = (v / max) * (height - 2);
        return <rect key={i} x={i * bw + 0.5} y={height - h} width={bw - 1} height={h} fill={color} opacity="0.85" rx="1" />;
      })}
    </svg>
  );
}

/* — Activity icon (used in feed) — */
function ActivityIcon({ kind, tone }) {
  const colors = { pos: 'var(--pos)', neg: 'var(--neg)', warn: 'var(--warn)', info: 'var(--info)', neutral: 'var(--fg-muted)' };
  const c = colors[tone] || colors.neutral;
  const map = {
    run: <IconActivity size={13} />,
    alert: <IconAlertCircle size={13} />,
    edit: <IconEdit size={13} />,
    agent: <IconBrain size={13} />,
    fork: <IconFork size={13} />,
    channel: <IconMessageSquare size={13} />,
    memory: <IconBookOpen size={13} />,
  };
  return (
    <span style={{
      width: 26, height: 26, borderRadius: 6,
      background: 'var(--surface-2)',
      border: '0.5px solid var(--border)',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      color: c, flexShrink: 0,
    }}>{map[kind] || <IconActivity size={13} />}</span>
  );
}

/* — Source kind glyph — */
const SOURCE_KIND_LABEL = { db: 'БД', mcp: 'MCP', api: 'API', docs: 'ДОКИ' };
function SourceKind({ kind }) {
  return (
    <span style={{
      fontFamily: 'var(--font-mono)', fontSize: 9,
      letterSpacing: '0.10em', textTransform: 'uppercase',
      padding: '2px 6px', borderRadius: 3,
      background: 'var(--surface-2)', color: 'var(--fg-muted)',
      border: '0.5px solid var(--border)',
    }}>{SOURCE_KIND_LABEL[kind] || kind}</span>
  );
}

/* — Preview chart for Create flow:
   накопительный план vs факт + бары отклонений снизу, dual-row chart.
   Использует данные из OESDATA.previewSeries.                              */
function PreviewChartLine({ series, height = 220 }) {
  const W = 720, H = height;
  const pad = { l: 36, r: 18, t: 14, b: 22 };
  const innerW = W - pad.l - pad.r, innerH = H - pad.t - pad.b;
  // cumulative
  const cumP = [], cumF = [];
  series.plan.reduce((a, v, i) => (cumP[i] = a + v, cumP[i]), 0);
  series.fact.reduce((a, v, i) => (cumF[i] = a + v, cumF[i]), 0);
  const max = Math.max(...cumP, ...cumF) * 1.05;
  const xs = (i) => pad.l + (i / (series.labels.length - 1)) * innerW;
  const ys = (v) => pad.t + innerH - (v / max) * innerH;
  const pathPlan = cumP.map((v, i) => `${i ? 'L' : 'M'}${xs(i).toFixed(1)},${ys(v).toFixed(1)}`).join('');
  const pathFact = cumF.map((v, i) => `${i ? 'L' : 'M'}${xs(i).toFixed(1)},${ys(v).toFixed(1)}`).join('');
  const areaFact = `${pathFact} L${xs(cumF.length-1).toFixed(1)},${pad.t+innerH} L${xs(0).toFixed(1)},${pad.t+innerH} Z`;
  // gridlines + y-ticks
  const ticks = 5;
  const tickVals = Array.from({ length: ticks + 1 }, (_, i) => (max * i) / ticks);
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" style={{ display: 'block' }}>
      {/* grid */}
      {tickVals.map((tv, i) => (
        <line key={'g'+i} x1={pad.l} x2={W - pad.r} y1={ys(tv)} y2={ys(tv)} stroke="var(--border)" strokeWidth="0.5" />
      ))}
      {tickVals.map((tv, i) => (
        <text key={'t'+i} x={pad.l - 6} y={ys(tv) + 3} fontFamily="var(--font-mono)" fontSize="9" fill="var(--fg-muted)" textAnchor="end">
          {tv >= 1000 ? (tv/1000).toFixed(1) + 'K' : tv.toFixed(0)}
        </text>
      ))}
      {/* x labels (every 5) */}
      {series.labels.map((l, i) => i % 5 === 0 && (
        <text key={'x'+i} x={xs(i)} y={H - 6} fontFamily="var(--font-mono)" fontSize="9" fill="var(--fg-muted)" textAnchor="middle">{l}</text>
      ))}
      {/* fact area + line */}
      <path d={areaFact} fill="var(--pos)" opacity="0.08" />
      <path d={pathPlan} stroke="var(--info)" strokeWidth="1.5" strokeDasharray="5 4" fill="none" />
      <path d={pathFact} stroke="var(--pos)" strokeWidth="2" fill="none" filter="drop-shadow(0 0 6px rgba(29,184,154,0.25))" />
      {/* axis */}
      <line x1={pad.l} x2={pad.l} y1={pad.t} y2={pad.t+innerH} stroke="var(--border-strong)" strokeWidth="0.5" />
    </svg>
  );
}

/* Variant: bars (deviation per shift) */
function PreviewChartBars({ series, height = 110 }) {
  const W = 720, H = height;
  const pad = { l: 36, r: 18, t: 8, b: 18 };
  const innerW = W - pad.l - pad.r, innerH = H - pad.t - pad.b;
  const deltas = series.fact.map((f, i) => f - series.plan[i]);
  const max = Math.max(...deltas.map(Math.abs)) * 1.1;
  const xs = (i) => pad.l + (i / deltas.length) * innerW;
  const bw = innerW / deltas.length - 1;
  const y0 = pad.t + innerH / 2;
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" style={{ display: 'block' }}>
      <line x1={pad.l} x2={W - pad.r} y1={y0} y2={y0} stroke="var(--border-strong)" strokeWidth="0.5" />
      {deltas.map((d, i) => {
        const h = (Math.abs(d) / max) * (innerH / 2);
        const positive = d >= 0;
        const y = positive ? y0 - h : y0;
        const c = positive ? 'var(--pos)' : 'var(--neg)';
        return <rect key={i} x={xs(i)} y={y} width={bw} height={h} fill={c} opacity="0.78" />;
      })}
      <text x={pad.l - 6} y={pad.t + 8} fontFamily="var(--font-mono)" fontSize="9" fill="var(--fg-muted)" textAnchor="end">+тыс.м³</text>
      <text x={pad.l - 6} y={H - 4} fontFamily="var(--font-mono)" fontSize="9" fill="var(--fg-muted)" textAnchor="end">−тыс.м³</text>
    </svg>
  );
}

/* — Limit forecast chart (Usage section):
   суточный расход в виде bars + накопительная линия + прогноз пунктиром до конца месяца. */
function ForecastChart({ daily, limitTokens, daysInPeriod, daysPassed, height = 240 }) {
  const W = 760, H = height;
  const pad = { l: 50, r: 16, t: 16, b: 24 };
  const innerW = W - pad.l - pad.r, innerH = H - pad.t - pad.b;
  // cumulative actual
  const actual = [];
  daily.reduce((a, v, i) => (actual[i] = a + v * 1000, actual[i]), 0);
  // daily average so far → forecast cumulative
  const avg = daily.reduce((a, v) => a + v, 0) * 1000 / daily.length;
  const forecast = [];
  for (let i = 0; i < daysInPeriod; i++) {
    if (i < daily.length) forecast[i] = actual[i];
    else forecast[i] = actual[daily.length - 1] + avg * (i - daily.length + 1);
  }
  const max = Math.max(limitTokens * 1.15, forecast[forecast.length - 1] * 1.1);
  const xs = (i) => pad.l + (i / (daysInPeriod - 1)) * innerW;
  const ys = (v) => pad.t + innerH - (v / max) * innerH;
  const actualPath = actual.map((v, i) => `${i ? 'L' : 'M'}${xs(i).toFixed(1)},${ys(v).toFixed(1)}`).join('');
  const forecastPath = forecast.slice(daily.length - 1).map((v, i) => `${i ? 'L' : 'M'}${xs(daily.length - 1 + i).toFixed(1)},${ys(v).toFixed(1)}`).join('');
  // Daily bars
  const bw = innerW / daysInPeriod;
  const dailyMax = Math.max(...daily) * 1000;
  // ticks
  const ticks = 4;
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" style={{ display: 'block' }}>
      {Array.from({ length: ticks + 1 }).map((_, i) => {
        const v = (max * i) / ticks;
        return (
          <g key={i}>
            <line x1={pad.l} x2={W - pad.r} y1={ys(v)} y2={ys(v)} stroke="var(--border)" strokeWidth="0.5" />
            <text x={pad.l - 6} y={ys(v) + 3} fontFamily="var(--font-mono)" fontSize="9" fill="var(--fg-muted)" textAnchor="end">
              {(v / 1_000_000).toFixed(1)}M
            </text>
          </g>
        );
      })}
      {/* limit line */}
      <line x1={pad.l} x2={W - pad.r} y1={ys(limitTokens)} y2={ys(limitTokens)} stroke="var(--warn-orange)" strokeWidth="1" strokeDasharray="3 3" />
      <text x={W - pad.r - 4} y={ys(limitTokens) - 4} fontFamily="var(--font-mono)" fontSize="9" fill="var(--warn-orange)" textAnchor="end" letterSpacing="0.06em">ЛИМИТ {(limitTokens/1_000_000).toFixed(1)}M</text>
      {/* daily bars (faint), scaled to a small ratio of the cumulative area */}
      {daily.map((d, i) => {
        const bh = (d * 1000 / dailyMax) * (innerH * 0.18);
        return <rect key={'b'+i} x={xs(i) - bw * 0.35} y={pad.t + innerH - bh} width={bw * 0.7} height={bh} fill="var(--teal-400)" opacity="0.35" />;
      })}
      {/* x ticks */}
      {Array.from({ length: 7 }).map((_, i) => {
        const day = Math.round((i / 6) * (daysInPeriod - 1));
        return (
          <text key={'x'+i} x={xs(day)} y={H - 6} fontFamily="var(--font-mono)" fontSize="9" fill="var(--fg-muted)" textAnchor="middle">
            {String(day + 1).padStart(2, '0')}.05
          </text>
        );
      })}
      {/* today marker */}
      <line x1={xs(daily.length - 1)} x2={xs(daily.length - 1)} y1={pad.t} y2={pad.t + innerH} stroke="var(--teal-400)" strokeWidth="0.5" strokeDasharray="2 3" opacity="0.55" />
      {/* actual & forecast */}
      <path d={actualPath} stroke="var(--teal-400)" strokeWidth="2" fill="none" filter="drop-shadow(0 0 6px rgba(29,184,154,0.25))" />
      <path d={forecastPath} stroke="var(--fg-muted)" strokeWidth="1.5" strokeDasharray="5 4" fill="none" />
      {/* axis */}
      <line x1={pad.l} x2={pad.l} y1={pad.t} y2={pad.t + innerH} stroke="var(--border-strong)" strokeWidth="0.5" />
    </svg>
  );
}

/* — Inline chart legend — */
function Legend({ items }) {
  return (
    <div style={{ display: 'flex', gap: 12 }}>
      {items.map((it, i) => (
        <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-muted)' }}>
          <span style={{ width: 10, height: 2, background: it.c, borderRadius: 1 }} />
          {it.l}
        </span>
      ))}
    </div>
  );
}

export { Chip, KindChip, Kpi, Sparkline, MiniBars, ActivityIcon, SourceKind, PreviewChartLine, PreviewChartBars, ForecastChart, Legend };
