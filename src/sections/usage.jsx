import React from 'react';
import { IconDownload, IconMail, IconTrendingUp, IconBox, IconX, IconCheck, IconShield } from '../icons.jsx';
import { ForecastChart, Legend } from '../parts.jsx';
import { OESDATA } from '../data.jsx';
import { useLimitState } from '../shell.jsx';
import { downloadCSV } from '../utils.jsx';

/* Потребление — токены, лимит, прогноз-чарт, разбивка по типам и решениям. */

function SectionUsage({ setRoute, tweak }) {
  const b = OESDATA.billing;
  const limit = useLimitState(tweak.limitState);
  const used = limit.used;
  const pct = limit.pct;
  const remaining = Math.max(0, b.limitTokens - used);
  const [limitModal, setLimitModal] = React.useState(false);

  // forecast: with daysPassed=17 (default in data), avg = used/daysPassed → projection by end
  const avgPerDay = used / b.daysPassed;
  const forecast = Math.round(avgPerDay * b.daysInPeriod);
  const forecastPct = Math.round((forecast / b.limitTokens) * 100);
  const daysToLimit = avgPerDay > 0 ? Math.max(0, Math.ceil((b.limitTokens - used) / avgPerDay)) : 999;
  const todayDay = b.daysPassed;

  // scale daily for the forecast chart so that sum(daily*1000) == used
  const scaledDaily = (() => {
    const s = b.daily.reduce((a, v) => a + v, 0) * 1000;
    const k = used / s;
    return b.daily.map(d => d * k);
  })();

  // Отчёт CSV — посуточная (посессионная) выгрузка потребления
  const exportReport = () => {
    downloadCSV(
      `oes-x-потребление-${b.period.toLowerCase().replace(' ', '-')}.csv`,
      ['Дата', 'Токены за день', 'Накопительно'],
      (() => {
        let acc = 0;
        return scaledDaily.map((d, i) => {
          acc += Math.round(d * 1000);
          return [`${String(i + 1).padStart(2, '0')}.05.2026`, Math.round(d * 1000), acc];
        });
      })(),
    );
    if (window.notify) window.notify({ title: 'Отчёт по потреблению выгружен', body: `${scaledDaily.length} дней · CSV`, kind: 'success' });
  };

  return (
    <div className="main-narrow fade-up">
      <div className="page-head">
        <div>
          <div className="page-title">Потребление и лимиты</div>
          <div className="page-sub">Период: {b.period} · до конца — {b.daysInPeriod - todayDay} дней · роль «{OESDATA.me.role}»</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-neutral" onClick={exportReport}><IconDownload size={11} /> Отчёт CSV</button>
          <button className="btn btn-warn" onClick={() => setLimitModal(true)}><IconMail size={11} /> Запросить повышение лимита</button>
        </div>
      </div>

      {limitModal && <RequestLimitModal limitTokens={b.limitTokens} used={used} pct={pct} onClose={() => setLimitModal(false)} />}

      {/* Алерты лимитов остаются только на «Главной» — здесь нужны только данные и прогноз */}

      {/* Top KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0, border: '0.5px solid var(--border)', borderRadius: 'var(--r-lg)', overflow: 'hidden', marginBottom: 24, background: 'var(--surface)' }}>
        <UsageKpi label="Израсходовано" value={fmtTok(used)} sub={`${pct}% от лимита`} subTone={pct >= 100 ? 'neg' : (pct >= 80 ? 'warn' : 'neutral')} tone="neutral" />
        <UsageKpi label="Осталось" value={fmtTok(remaining)} sub={`на ${b.daysInPeriod - todayDay} дней до конца периода`} tone={pct >= 100 ? 'neg' : 'pos'} />
        <UsageKpi label="Прогноз к концу периода" value={fmtTok(forecast)} sub={`≈ ${forecastPct}% от лимита`} subTone={forecastPct >= 100 ? 'neg' : (forecastPct >= 90 ? 'warn' : 'pos')} tone="warn" />
        <UsageKpi label="Дней до исчерпания" value={daysToLimit > 999 ? '∞' : daysToLimit} unit="дн" tone={daysToLimit < 10 ? 'neg' : 'neutral'} sub={daysToLimit < (b.daysInPeriod - todayDay) ? 'Закончатся раньше периода' : 'Хватит до конца периода'} subTone={daysToLimit < (b.daysInPeriod - todayDay) ? 'neg' : 'pos'} />
      </div>

      {/* Progress bar — month limit */}
      <div className="card" style={{ marginBottom: 24, padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 500, color: 'var(--fg)' }}>Лимит на май 2026</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-muted)' }}>
            <span style={{ color: pct >= 80 ? 'var(--warn-orange)' : 'var(--fg)' }}>{fmtTok(used)}</span> / {fmtTok(b.limitTokens)} · {pct}%
          </span>
        </div>
        <div className={`bar ${pct >= 100 ? 'danger' : (pct >= 80 ? 'warn' : '')}`} style={{ height: 10 }}>
          <span style={{ width: Math.min(100, pct) + '%' }} />
        </div>
        {/* threshold markers */}
        <div style={{ position: 'relative', marginTop: 6, height: 14, fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--fg-muted)' }}>
          <span style={{ position: 'absolute', left: '0%' }}>0</span>
          <span style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>50%</span>
          <span style={{ position: 'absolute', left: '80%', transform: 'translateX(-50%)', color: 'var(--warn-orange)' }}>80% · предупр.</span>
          <span style={{ position: 'absolute', right: '0%', color: 'var(--neg)' }}>100% · стоп</span>
        </div>
      </div>

      {/* Forecast chart */}
      <div className="card" style={{ marginBottom: 24, padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <IconTrendingUp size={13} style={{ color: 'var(--teal-400)' }} />
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 500, color: 'var(--fg)' }}>Прогноз потребления токенов до конца периода</span>
          <span style={{ flex: 1 }} />
          <Legend items={[
            { c: 'var(--teal-400)', l: 'факт' },
            { c: 'var(--fg-muted)', l: 'прогноз' },
            { c: 'var(--warn-orange)', l: 'лимит' },
          ]} />
        </div>
        <ForecastChart daily={scaledDaily} limitTokens={b.limitTokens} daysInPeriod={b.daysInPeriod} daysPassed={b.daysPassed} height={260} />
        <div style={{ marginTop: 12, fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--fg-muted)', lineHeight: 1.55 }}>
          {forecastPct >= 100
            ? <>При текущем темпе лимит закончится через <span style={{ color: 'var(--warn-orange)' }}>{daysToLimit} дней</span>. Снизьте частоту обновления тяжёлых решений или запросите повышение лимита.</>
            : <>При текущем темпе ({fmtTok(Math.round(avgPerDay))}/день в среднем) лимит хватит до конца периода. Прогноз — {forecastPct}% от лимита.</>
          }
        </div>
      </div>

      {/* Breakdown — pie + list */}
      <div className="card" style={{ padding: 20, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <IconBox size={13} style={{ color: 'var(--teal-400)' }} />
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 500, color: 'var(--fg)' }}>Разбивка по типам</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <Donut items={b.breakdown} size={160} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 11 }}>
            {b.breakdown.map((br, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: DONUT_COLORS[i] }} />
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--fg)', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{br.label}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-muted)' }}>{Math.round(br.share * 100)}%</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg)', minWidth: 70, textAlign: 'right' }}>{fmtTok(br.tokens)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function fmtTok(t) {
  if (t >= 1_000_000) return (t / 1_000_000).toFixed(2) + 'M';
  if (t >= 1_000) return (t / 1_000).toFixed(0) + 'K';
  return t.toString();
}

function UsageKpi({ label, value, unit, sub, subTone, tone }) {
  const TONE = { pos: 'var(--pos)', neg: 'var(--neg)', warn: 'var(--warn-orange)', neutral: 'var(--fg)' };
  const c = TONE[tone] || TONE.neutral;
  const subC = TONE[subTone] || 'var(--fg-muted)';
  return (
    <div style={{ padding: '22px 24px', borderRight: '0.5px solid var(--border)' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 10 }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 28, fontWeight: 500, letterSpacing: '-0.03em', color: c, lineHeight: 1 }}>
        {value}{unit && <span style={{ fontSize: 14, opacity: 0.65, marginLeft: 4 }}>{unit}</span>}
      </div>
      {sub && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: subC, marginTop: 8 }}>{sub}</div>}
    </div>
  );
}

const DONUT_COLORS = ['#1DB89A', '#6A9EB8', '#C47C32', '#C8A040', '#4A6878'];

function Donut({ items, size = 130 }) {
  const r = size / 2 - 12;
  const cx = size / 2, cy = size / 2;
  let angle = -Math.PI / 2;
  const arcs = items.map((it, i) => {
    const a0 = angle;
    const a1 = a0 + it.share * Math.PI * 2;
    angle = a1;
    const large = it.share > 0.5 ? 1 : 0;
    const x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0);
    const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
    return { d: `M${cx},${cy} L${x0},${y0} A${r},${r} 0 ${large},1 ${x1},${y1} Z`, c: DONUT_COLORS[i] };
  });
  const total = items.reduce((a, v) => a + v.tokens, 0);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
      {arcs.map((a, i) => <path key={i} d={a.d} fill={a.c} opacity="0.85" />)}
      <circle cx={cx} cy={cy} r={r * 0.62} fill="var(--surface)" />
      <text x={cx} y={cy - 2} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="14" fill="var(--fg)" fontWeight="500" letterSpacing="-0.03em">{(total / 1_000_000).toFixed(2)}M</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="8" fill="var(--fg-muted)" letterSpacing="0.10em">ТОКЕНОВ</text>
    </svg>
  );
}

function LimitLevelRow({ level, sub, used, limit, highlight }) {
  const pct = Math.round((used / limit) * 100);
  const tone = pct >= 80 ? 'warn' : '';
  return (
    <div style={{
      padding: 12, background: highlight ? 'rgba(29,184,154,0.05)' : 'transparent',
      border: highlight ? '0.5px solid var(--border-strong)' : '0.5px solid var(--hairline)',
      borderRadius: 4,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: highlight ? 'var(--teal-400)' : 'var(--fg)' }}>{level}</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-muted)' }}>· {sub}</span>
        <span style={{ flex: 1 }} />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg)' }}>
          {fmtTok(used)} / {fmtTok(limit)} · <span style={{ color: pct >= 80 ? 'var(--warn-orange)' : 'var(--fg-muted)' }}>{pct}%</span>
        </span>
      </div>
      <div className={`bar ${tone}`} style={{ height: 5 }}><span style={{ width: Math.min(100, pct) + '%' }} /></div>
    </div>
  );
}

/* — Запрос на повышение лимита у ИТ-службы — */
function RequestLimitModal({ limitTokens, used, pct, onClose }) {
  const presets = [6_000_000, 7_500_000, 9_000_000];
  const [target, setTarget] = React.useState(presets[0]);
  const [reason, setReason] = React.useState('');
  const fmt = (t) => (t / 1_000_000).toFixed(1) + 'M';
  const submit = () => {
    onClose();
    if (window.notify) window.notify({
      title: 'Заявка отправлена в ИТ-службу',
      body: `Повышение лимита до ${fmt(target)} токенов · ответ в течение 1 рабочего дня`,
      kind: 'success',
    });
  };
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <IconMail size={15} style={{ color: 'var(--warn-orange)' }} /> Запрос на повышение лимита
          </div>
          <button className="icon-btn" style={{ width: 28, height: 28 }} onClick={onClose}><IconX size={13} /></button>
        </div>
        <div className="modal-body">
          <div style={{ background: 'var(--surface-2)', border: '0.5px solid var(--border)', borderRadius: 'var(--r-md)', padding: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 18px' }}>
            <RLField label="Текущий лимит" value={fmt(limitTokens)} />
            <RLField label="Израсходовано" value={`${fmt(used)} · ${pct}%`} />
          </div>
          <div className="field-stack">
            <div className="field-label">Новый лимит</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {presets.map((p) => (
                <button key={p} onClick={() => setTarget(p)} style={{
                  flex: 1, padding: '10px 0', borderRadius: 6,
                  background: target === p ? 'var(--teal-dim)' : 'var(--surface-2)',
                  border: '0.5px solid ' + (target === p ? 'var(--teal-400)' : 'var(--border)'),
                  color: target === p ? 'var(--teal-400)' : 'var(--fg)',
                  fontFamily: 'var(--font-mono)', fontSize: 14, cursor: 'pointer',
                }}>{fmt(p)}</button>
              ))}
            </div>
          </div>
          <div className="field-stack">
            <div className="field-label">Обоснование *</div>
            <textarea className="textarea" value={reason} onChange={(e) => setReason(e.target.value)} rows={4}
              placeholder="Кратко опишите, почему нужен повышенный лимит" />
          </div>
          <div style={{ padding: 12, background: 'rgba(106,158,184,0.06)', border: '0.5px solid rgba(106,158,184,0.30)', borderRadius: 'var(--r-md)', fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--fg-muted)', lineHeight: 1.5 }}>
            <IconShield size={11} style={{ verticalAlign: 'middle', color: 'var(--info)' }} /> Заявка уходит ИТ-администратору ВГК. Обычно решается в течение 1 рабочего дня.
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn btn-neutral" onClick={onClose}>Отмена</button>
          <button className="btn btn-primary" disabled={!reason.trim()} onClick={submit}><IconCheck size={11} /> Отправить заявку</button>
        </div>
      </div>
    </div>
  );
}

function RLField({ label, value }) {
  return (
    <div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 3 }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--fg)' }}>{value}</div>
    </div>
  );
}

export { SectionUsage };
