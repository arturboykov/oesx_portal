import React from 'react';
import {
  IconArrowLeft, IconClock, IconEye, IconShare, IconPlus, IconEdit, IconFork,
  IconGitBranch, IconPickaxe, IconTriangle, IconRefresh, IconX, IconDownload,
  IconTrendingUp, IconActivity, IconLock, IconChevronLeft, IconChevronRight,
  IconLayers, IconBookOpen, IconCpu, IconZap, IconPlay, IconPause, IconCheck, IconUsers,
} from '../icons.jsx';
import { KindChip } from '../parts.jsx';
import { OESDATA } from '../data.jsx';
import { currentMe } from '../user.jsx';
import { VersionHistoryModal } from './various.jsx';

/* Solution view — открыть конкретное решение как полноценный дашборд.
   Поддерживает 4 содержимых: Бюджет, Объём за смену, Циклы погрузки, Монитор потерь.
   Прочие решения показывают обобщённый плейсхолдер. */

function SectionSolutionView({ solution, setRoute, openEdit, editInChat, openSolution, tweak }) {
  if (!solution || !solution.id) return null;
  const sol = OESDATA.solutions.find((s) => s.id === solution.id);
  if (!sol) return null;
  const isHistoricVersion = solution.version && solution.version !== sol.version;
  const t = tweak || { userRole: 'user' };
  const me = currentMe(t.userRole);
  const isOwner = !sol.author || sol.author === me.name;
  const canEdit = me.systemRole === 'admin' || isOwner;

  const [enabled, setEnabled] = React.useState(sol.enabled !== false);
  const [shareOpen, setShareOpen] = React.useState(false);
  const [versionOpen, setVersionOpen] = React.useState(false);

  const toggleEnabled = () => {
    setEnabled((e) => {
      const next = !e;
      if (window.notify) window.notify({ title: next ? 'Решение включено' : 'Решение отключено', body: sol.name, kind: 'success' });
      return next;
    });
  };

  return (
    <div className="fade-up">
      <SolutionHeader
        sol={sol} version={solution.version} historic={isHistoricVersion}
        setRoute={setRoute} openEdit={openEdit} editInChat={editInChat}
        canEdit={canEdit} isOwner={isOwner}
        enabled={enabled} onToggle={toggleEnabled}
        onShare={() => setShareOpen(true)}
        onVersions={() => setVersionOpen(true)} />
      <div style={{ marginTop: 18 }}>
        {sol.id === 'sol-01' && <DashVolumePerShift />}
        {sol.id === 'sol-04' && <DashCycleRating />}
        {sol.id === 'sol-06' && <DashBudget />}
        {sol.id === 'sol-08' && <DashLossesMonitor />}
        {!['sol-01', 'sol-04', 'sol-06', 'sol-08'].includes(sol.id) && <GenericSolutionPreview sol={sol} />}
      </div>
      {shareOpen && <ShareModal sol={sol} onClose={() => setShareOpen(false)} />}
      {versionOpen && <VersionHistoryModal sol={sol} onClose={() => setVersionOpen(false)} onOpenVersion={(vv) => { setVersionOpen(false); openSolution && openSolution(sol.id, vv); }} />}
    </div>);

}

function SolutionHeader({ sol, version, historic, setRoute, openEdit, editInChat, canEdit, isOwner, enabled, onToggle, onShare, onVersions }) {
  const v = version || sol.version;
  const handleFork = () => {
    if (editInChat) {
      editInChat(sol.id, v, 'fork');
    } else if (window.notify) {
      window.notify({
        title: 'Открыт новый чат',
        body: `«${sol.name}» — опишите, что хотим изменить.`,
        kind: 'success'
      });
    }
  };
  // «Редактировать» открывает полноценную страницу редактирования
  // (превью в центре + чат с ботом справа на ≥1200px, снизу на <1200px).
  // «Форкнуть в чат» по-прежнему уходит в чат-сессию с превью-плиткой.
  const handleEdit = () => {
    if (openEdit) openEdit(sol.id, v);
  };
  return (
    <div className="sv-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <button className="btn btn-neutral btn-sm" onClick={() => setRoute('solutions')}>
          <IconArrowLeft size={11} /> Решения
        </button>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-muted)', letterSpacing: '0.06em' }}>
          / {sol.name}
        </span>
        <span style={{ flex: 1 }} />
        {historic &&
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, padding: '4px 9px', borderRadius: 4, background: 'rgba(196,124,50,0.12)', color: 'var(--warn-orange)', border: '0.5px solid rgba(196,124,50,0.30)', letterSpacing: '0.08em' }}>
            <IconClock size={9} style={{ verticalAlign: 'middle', marginRight: 4 }} /> ИСТОРИЧЕСКАЯ ВЕРСИЯ
          </span>
        }
        {!canEdit &&
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, padding: '4px 9px', borderRadius: 4, background: 'var(--surface-2)', color: 'var(--fg-muted)', border: '0.5px solid var(--border)', letterSpacing: '0.08em', display: 'inline-flex', alignItems: 'center', gap: 4 }} title={`Автор: ${sol.author}`}>
            <IconEye size={9} /> ТОЛЬКО ЧТЕНИЕ
          </span>
        }
        {canEdit && !historic &&
        <button className="btn btn-neutral btn-sm" onClick={onToggle} title={enabled ? 'Отключить решение' : 'Включить решение'}>
          {enabled ? <><IconPause size={11} /> Отключить</> : <><IconPlay size={11} /> Включить</>}
        </button>
        }
        <button className="btn btn-neutral btn-sm" onClick={onShare}><IconShare size={11} /> Поделиться</button>
        {canEdit ?
        historic ?
        <button className="btn btn-primary btn-sm" onClick={() => openEdit && openEdit(sol.id, v)}>
              <IconPlus size={11} /> Новая версия на основе v{v}
            </button> :

        <button className="btn btn-ghost btn-sm" onClick={handleEdit} title="Открыть в чате и описать правки">
              <IconEdit size={11} /> Редактировать
            </button> :


        <button className="btn btn-ghost btn-sm" onClick={handleFork} title="Открыть в чате и описать правки">
            <IconFork size={11} /> Форкнуть в чат
          </button>
        }
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div>
          <div className="page-title">{sol.name}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6, flexWrap: 'wrap' }}>
            <KindChip kind={sol.kind} />
            <button
              onClick={onVersions}
              title="История версий"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                fontFamily: 'var(--font-mono)', fontSize: 11,
                padding: '3px 8px', borderRadius: 4,
                background: 'var(--teal-dim)',
                border: '0.5px solid var(--border-strong)',
                color: 'var(--teal-400)', cursor: 'pointer',
              }}>
              <IconGitBranch size={10} /> v{v}
            </button>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-muted)' }}>
              · id {sol.shortId}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-muted)' }}>
              · Обновлено {sol.lastRun}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-muted)' }}>
              · {sol.runs.toLocaleString('ru')} запусков
            </span>
            {sol.author &&
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-muted)', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                · автор <span style={{ color: isOwner ? 'var(--teal-400)' : 'var(--fg)' }}>{sol.author}{isOwner ? ' (вы)' : ''}</span>
              </span>
            }
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-mono)', fontSize: 11, color: enabled ? 'var(--pos)' : 'var(--fg-muted)' }}>
              · <span style={{ width: 6, height: 6, borderRadius: 999, background: enabled ? 'var(--pos)' : 'var(--fg-dim)' }} /> {enabled ? 'активно' : 'выключено'}
            </span>
          </div>
        </div>
      </div>
    </div>);

}

/* — Поделиться: мультивыбор пользователей системы для выдачи доступа на просмотр — */
function ShareModal({ sol, onClose }) {
  const candidates = OESDATA.users.filter((u) => u.name !== sol.author && u.role !== 'pending');
  const [selected, setSelected] = React.useState([]);
  const toggle = (id) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const submit = () => {
    onClose();
    if (window.notify) window.notify({
      title: 'Доступ предоставлен',
      body: `«${sol.name}» · ${selected.length} ${plural(selected.length, 'пользователь', 'пользователя', 'пользователей')}`,
      kind: 'success',
    });
  };
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ width: 540 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <IconShare size={15} style={{ color: 'var(--teal-400)' }} /> Поделиться решением
          </div>
          <button className="icon-btn" style={{ width: 28, height: 28 }} onClick={onClose}><IconX size={13} /></button>
        </div>
        <div className="modal-body">
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--fg-muted)', lineHeight: 1.55 }}>
            Выберите сотрудников, которым нужно открыть доступ на просмотр «{sol.name}». Они увидят решение во вкладке «Предоставлен доступ».
          </div>
          <div style={{ background: 'var(--surface-2)', border: '0.5px solid var(--border)', borderRadius: 'var(--r-md)', overflow: 'hidden', maxHeight: 320, overflowY: 'auto' }}>
            {candidates.map((u, i) => {
              const on = selected.includes(u.id);
              return (
                <button key={u.id} onClick={() => toggle(u.id)} style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 14px', textAlign: 'left', cursor: 'pointer',
                  background: on ? 'var(--teal-dim)' : 'transparent',
                  borderBottom: i < candidates.length - 1 ? '0.5px solid var(--border)' : 'none',
                }}>
                  <span style={{
                    width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                    border: '0.5px solid ' + (on ? 'var(--teal-400)' : 'var(--border-strong)'),
                    background: on ? 'var(--teal-400)' : 'transparent',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fg-on-teal)',
                  }}>{on && <IconCheck size={10} />}</span>
                  <span style={{
                    width: 26, height: 26, borderRadius: 999, flexShrink: 0,
                    background: 'linear-gradient(135deg, var(--teal-600), var(--teal-400))', color: 'var(--fg-on-teal)',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 600,
                  }}>{u.initials}</span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--fg)' }}>{u.name}</span>
                    <span style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-muted)' }}>{u.position}</span>
                  </span>
                </button>);
            })}
          </div>
        </div>
        <div className="modal-foot">
          <span style={{ flex: 1, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-muted)' }}>
            <IconUsers size={9} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Выбрано: {selected.length}
          </span>
          <button className="btn btn-neutral" onClick={onClose}>Отмена</button>
          <button className="btn btn-primary" disabled={selected.length === 0} onClick={submit}>
            <IconCheck size={11} /> Предоставить доступ
          </button>
        </div>
      </div>
    </div>);

}

function plural(n, one, few, many) {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few;
  return many;
}

function GenericSolutionPreview({ sol }) {
  return (
    <div className="card" style={{ padding: 28, textAlign: 'center' }}>
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--fg-muted)', lineHeight: 1.6 }}>
        Дашборд для решения «{sol.name}» откроется здесь.<br />
        Подробное превью пока недоступно — нажмите «Редактировать», чтобы открыть в Workspace.
      </div>
    </div>);

}

/* ═══════════════════════════════════════════════════════════════════════════
   1. Бюджет — добыча и вскрыша 2026
═══════════════════════════════════════════════════════════════════════════ */
function DashBudget() {
  const kpis = [
  { label: 'Добыча — отклонение за год', value: '+41.6K', unit: 'т', tone: 'pos', sub: '102.1% от плана' },
  { label: 'Добыча — отклонение за месяц', value: '−20.1K', unit: 'т', tone: 'neg', sub: '86.1% от плана' },
  { label: 'Вскрыша — отклонение за год', value: '−4.8K', unit: 'тыс.м³', tone: 'neg', sub: '81.9% от плана' },
  { label: 'Вскрыша — отклонение за месяц', value: '−633', unit: 'тыс.м³', tone: 'neg', sub: '62.7% от плана' }];


  // Cumulative series — Добыча (план/факт растут, факт чуть выше плана)
  const minePlan = buildCumulative(63, 0.02, 22000, 1.0);
  const mineFact = buildCumulative(63, 0.02, 22000, 1.018);
  // Cumulative series — Вскрыша (факт отстаёт от плана)
  const stripPlan = buildCumulative(63, 0.025, 0, 1.0, 4.7); // up to ~27K
  const stripFact = buildCumulative(63, 0.025, 0, 0.83, 4.7); // up to ~21K

  // Daily deviation bars (positive/negative)
  const mineDelta = (() => {
    const a = [];
    for (let i = 0; i < 63; i++) {
      const x = i;
      const dip = x < 16 ? -10 - Math.sin(x * 0.6) * 10 : 0;
      const rise = x > 32 && x < 50 ? 25 + Math.sin((x - 32) * 0.4) * 40 : 0;
      const drift = Math.sin(i * 0.5) * 8 + Math.cos(i * 0.3) * 4;
      a.push(Math.round((dip + rise + drift) * 1000 - 8000));
    }
    return a;
  })();
  const stripDelta = (() => {
    const a = [];
    for (let i = 0; i < 63; i++) {
      a.push(Math.round(-i * 60 - 80 - Math.abs(Math.sin(i * 0.4)) * 200));
    }
    return a;
  })();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0, border: '0.5px solid var(--border)', borderRadius: 'var(--r-lg)', overflow: 'hidden', background: 'var(--surface)' }}>
        {kpis.map((k, i) => <Kpi2Tile key={i} {...k} last={i === kpis.length - 1} />)}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <DashCard title="Добыча — накопительно за год (тонны)" icon={<IconPickaxe size={13} style={{ color: 'var(--pos)' }} />}>
          <LineChart2 plan={minePlan} fact={mineFact} factColor="var(--pos)" yUnit="млн т" yScale={1_000_000} labels={budgetLabels()} />
        </DashCard>
        <DashCard title="Вскрыша — накопительно за год (тыс. м³)" icon={<IconTriangle size={13} style={{ color: 'var(--neg)' }} />}>
          <LineChart2 plan={stripPlan} fact={stripFact} factColor="var(--neg)" yUnit="тыс.м³" yScale={1} labels={budgetLabels()} />
        </DashCard>
        <DashCard title="Добыча — отклонение от бюджета (тонны)" icon={<IconPickaxe size={13} style={{ color: 'var(--pos)' }} />}>
          <DeltaBars data={mineDelta} yUnit="т" labels={budgetLabels()} />
        </DashCard>
        <DashCard title="Вскрыша — отклонение от бюджета (тыс. м³)" icon={<IconTriangle size={13} style={{ color: 'var(--neg)' }} />}>
          <DeltaBars data={stripDelta} yUnit="тыс.м³" labels={budgetLabels()} negativeOnly />
        </DashCard>
      </div>
    </div>);

}

function budgetLabels() {
  const out = [];
  const start = new Date('2026-01-01');
  for (let i = 0; i < 63; i++) {
    const d = new Date(start.getTime() + i * 86400000);
    out.push(`${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`);
  }
  return out;
}
function pad2(n) {return String(n).padStart(2, '0');}
function buildCumulative(n, growth, base, factor, mult = 1) {
  const out = [];
  let v = base;
  for (let i = 0; i < n; i++) {
    v += (1000 + Math.sin(i * 0.5) * 200) * mult * factor;
    out.push(Math.round(v * (1 + growth * (i / n))));
  }
  return out;
}

function Kpi2Tile({ label, value, unit, tone, sub, last }) {
  const TONE = { pos: 'var(--pos)', neg: 'var(--neg)', warn: 'var(--warn-orange)', neutral: 'var(--fg)' };
  const c = TONE[tone] || TONE.neutral;
  return (
    <div style={{ padding: '20px 22px', borderRight: last ? 'none' : '0.5px solid var(--border)' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 10 }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 28, color: c, letterSpacing: '-0.03em', lineHeight: 1, fontWeight: 500 }}>
        {value}{unit && <span style={{ fontSize: 14, opacity: 0.7, marginLeft: 4 }}>{unit}</span>}
      </div>
      {sub && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: c, marginTop: 8 }}>{sub}</div>}
    </div>);

}

function DashCard({ title, icon, action, children }) {
  return (
    <div style={{ background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: 'var(--r-lg)', padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        {icon}
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 500, color: 'var(--fg)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>{title}</span>
        <span style={{ flex: 1 }} />
        {action}
      </div>
      {children}
    </div>);

}

/* — Generic line chart with plan dashed + fact filled area — */
function LineChart2({ plan, fact, factColor, yUnit, yScale, labels }) {
  const W = 720,H = 240;
  const pad = { l: 46, r: 16, t: 14, b: 24 };
  const innerW = W - pad.l - pad.r,innerH = H - pad.t - pad.b;
  const max = Math.max(Math.max(...plan), Math.max(...fact)) * 1.05;
  const xs = (i) => pad.l + i / (fact.length - 1) * innerW;
  const ys = (v) => pad.t + innerH - v / max * innerH;
  const pathPlan = plan.map((v, i) => `${i ? 'L' : 'M'}${xs(i).toFixed(1)},${ys(v).toFixed(1)}`).join('');
  const pathFact = fact.map((v, i) => `${i ? 'L' : 'M'}${xs(i).toFixed(1)},${ys(v).toFixed(1)}`).join('');
  const areaFact = `${pathFact} L${xs(fact.length - 1).toFixed(1)},${pad.t + innerH} L${xs(0).toFixed(1)},${pad.t + innerH} Z`;
  const ticks = 6;
  const tickVals = Array.from({ length: ticks + 1 }, (_, i) => max * i / ticks);
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" style={{ display: 'block' }}>
      {tickVals.map((tv, i) =>
      <g key={i}>
          <line x1={pad.l} x2={W - pad.r} y1={ys(tv)} y2={ys(tv)} stroke="var(--border)" strokeWidth="0.5" />
          <text x={pad.l - 6} y={ys(tv) + 3} fontFamily="var(--font-mono)" fontSize="9" fill="var(--fg-muted)" textAnchor="end">
            {yScale === 1_000_000 ? (tv / 1_000_000).toFixed(1) : tv >= 1000 ? (tv / 1000).toFixed(0) + 'K' : tv.toFixed(0)}
          </text>
        </g>
      )}
      <text x={pad.l - 30} y={pad.t + 8} fontFamily="var(--font-mono)" fontSize="9" fill="var(--fg-muted)">{yUnit}</text>
      {labels.map((l, i) => i % 8 === 0 &&
      <text key={'x' + i} x={xs(i)} y={H - 6} fontFamily="var(--font-mono)" fontSize="9" fill="var(--fg-muted)" textAnchor="middle">{l}</text>
      )}
      <path d={areaFact} fill={factColor} opacity="0.10" />
      <path d={pathPlan} stroke="var(--warn-orange)" strokeWidth="1.5" strokeDasharray="6 4" fill="none" />
      <path d={pathFact} stroke={factColor} strokeWidth="2" fill="none" filter={`drop-shadow(0 0 6px ${factColor})`} />
      <line x1={pad.l} x2={pad.l} y1={pad.t} y2={pad.t + innerH} stroke="var(--border-strong)" strokeWidth="0.5" />
      {/* Legend */}
      <g transform={`translate(${W / 2 - 110}, 12)`}>
        <line x1="0" y1="6" x2="14" y2="6" stroke="var(--info)" strokeWidth="2" />
        <text x="20" y="9" fontFamily="var(--font-mono)" fontSize="9" fill="var(--fg-muted)">План</text>
        <line x1="60" y1="6" x2="74" y2="6" stroke={factColor} strokeWidth="2" />
        <text x="80" y="9" fontFamily="var(--font-mono)" fontSize="9" fill="var(--fg-muted)">Факт</text>
        <line x1="120" y1="6" x2="134" y2="6" stroke="var(--warn-orange)" strokeWidth="1.5" strokeDasharray="3 2" />
        <text x="140" y="9" fontFamily="var(--font-mono)" fontSize="9" fill="var(--fg-muted)">Бюджет</text>
      </g>
    </svg>);

}

/* — Delta (deviation) bars — */
function DeltaBars({ data, yUnit, labels, negativeOnly }) {
  const W = 720,H = 240;
  const pad = { l: 46, r: 16, t: 14, b: 24 };
  const innerW = W - pad.l - pad.r,innerH = H - pad.t - pad.b;
  const maxAbs = Math.max(...data.map(Math.abs)) * 1.1;
  const xs = (i) => pad.l + i / data.length * innerW;
  const bw = innerW / data.length - 1;
  const yZero = negativeOnly ? pad.t + 10 : pad.t + innerH / 2;
  const ys = (v) => negativeOnly ?
  yZero + Math.abs(v) / maxAbs * (innerH - 20) :
  yZero - v / maxAbs * (innerH / 2);
  // y-ticks
  const ticks = negativeOnly ?
  [0, -maxAbs / 4, -maxAbs / 2, -maxAbs * 3 / 4, -maxAbs] :
  [-maxAbs, -maxAbs / 2, 0, maxAbs / 2, maxAbs];
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" style={{ display: 'block' }}>
      {ticks.map((tv, i) =>
      <g key={i}>
          <line x1={pad.l} x2={W - pad.r} y1={negativeOnly ? yZero + Math.abs(tv) / maxAbs * (innerH - 20) : yZero - tv / maxAbs * (innerH / 2)} y2={negativeOnly ? yZero + Math.abs(tv) / maxAbs * (innerH - 20) : yZero - tv / maxAbs * (innerH / 2)} stroke="var(--border)" strokeWidth="0.5" />
          <text x={pad.l - 6} y={(negativeOnly ? yZero + Math.abs(tv) / maxAbs * (innerH - 20) : yZero - tv / maxAbs * (innerH / 2)) + 3} fontFamily="var(--font-mono)" fontSize="9" fill="var(--fg-muted)" textAnchor="end">
            {Math.abs(tv) >= 1000 ? (tv / 1000).toFixed(0) + 'K' : Math.round(tv)}
          </text>
        </g>
      )}
      <text x={pad.l - 30} y={pad.t + 8} fontFamily="var(--font-mono)" fontSize="9" fill="var(--fg-muted)">{yUnit}</text>
      <line x1={pad.l} x2={W - pad.r} y1={yZero} y2={yZero} stroke="var(--border-strong)" strokeWidth="0.8" />
      {data.map((d, i) => {
        const positive = d >= 0;
        const h = Math.abs(d) / maxAbs * (negativeOnly ? innerH - 20 : innerH / 2);
        const y = positive ? yZero - h : yZero;
        const c = positive ? 'var(--pos)' : 'var(--neg)';
        return <rect key={i} x={xs(i)} y={y} width={bw} height={h} fill={c} opacity="0.85" rx="1" />;
      })}
      {labels.map((l, i) => i % 8 === 0 &&
      <text key={'x' + i} x={xs(i)} y={H - 6} fontFamily="var(--font-mono)" fontSize="9" fill="var(--fg-muted)" textAnchor="middle">{l}</text>
      )}
      <line x1={pad.l} x2={pad.l} y1={pad.t} y2={pad.t + innerH} stroke="var(--border-strong)" strokeWidth="0.5" />
    </svg>);

}

/* ═══════════════════════════════════════════════════════════════════════════
   2. Объём за смену — экскаваторы КТ
═══════════════════════════════════════════════════════════════════════════ */
function DashVolumePerShift() {
  const kpis = [
  { label: 'Объём', value: '374.1', unit: 'тыс.м³', tone: 'neutral' },
  { label: 'Бюджет', value: '277', unit: 'тыс.м³', tone: 'warn-orange' },
  { label: 'Разница', value: '+97.1', unit: 'тыс.м³', tone: 'pos' },
  { label: 'КТ', value: '209.1', sub: 'бюджет 148', tone: 'pos' },
  { label: 'СТ', value: '109.0', sub: 'бюджет 73', tone: 'pos' },
  { label: 'Прочие', value: '56.0', sub: 'бюджет 56', tone: 'neutral' }];


  const kt = [
  { ev: 'EX 3600 D /90', kc: 'Б75306', cube: 96, cycle: 3.7, kioStd: 92.2, idle: '—', repair: '—', kio: 78.2, hours: 9.4, vol: 14.6, max: 19.7 },
  { ev: 'EX 3600 E /27', kc: 'Б75306', cube: 96, cycle: 3.9, kioStd: 88.6, idle: '—', repair: '—', kio: 74.6, hours: 8.9, vol: 13.2, max: 19.7 },
  { ev: 'EX 3600 E /48', kc: 'Б75306', cube: 96, cycle: 3.4, kioStd: 88.0, idle: '2.5', repair: '—', kio: 53.2, hours: 6.4, vol: 8.0, max: 19.7 },
  { ev: 'EX 3600 E /69', kc: 'Б75306', cube: 96, cycle: 3.2, kioStd: 89.3, idle: '—', repair: '—', kio: 75.3, hours: 9.0, vol: 16.3, max: 19.7 },
  { ev: 'EX 3600 E /72', kc: 'Б75306', cube: 96, cycle: 3.9, kioStd: 91.2, idle: '—', repair: '—', kio: 77.2, hours: 9.3, vol: 13.7, max: 19.7 },
  { ev: 'EX 3600 E /87', kc: 'Б75306', cube: 96, cycle: 3.0, kioStd: 92.1, idle: '—', repair: '12', kio: 0.0, hours: 0.0, vol: 0.0, max: 19.7, repairLock: true },
  { ev: 'PC 4000 /45', kc: 'Б75306', cube: 96, cycle: 3.1, kioStd: 88.0, idle: '—', repair: '12', kio: 0.0, hours: 0.0, vol: 0.0, max: 19.7, repairLock: true },
  { ev: 'PC 4000 D /42', kc: 'Б75306', cube: 96, cycle: 3.1, kioStd: 88.0, idle: '—', repair: '12', kio: 0.0, hours: 0.0, vol: 0.0, max: 19.7, repairLock: true },
  { ev: 'PC 4000 E /283', kc: 'Б75306', cube: 96, cycle: 3.5, kioStd: 87.9, idle: '—', repair: '—', kio: 73.9, hours: 8.9, vol: 14.6, max: 19.7 },
  { ev: 'PC 4000 E /284', kc: 'Б75306', cube: 96, cycle: 2.8, kioStd: 91.2, idle: '—', repair: '—', kio: 77.2, hours: 9.3, vol: 19.1, max: 19.7 },
  { ev: 'PC 4000 E /38', kc: 'Б75306', cube: 96, cycle: 2.7, kioStd: 88.0, idle: '—', repair: '—', kio: 74.0, hours: 8.9, vol: 18.9, max: 19.7 },
  { ev: 'R 9400 E /7', kc: 'Б75306', cube: 96, cycle: 3.0, kioStd: 88.4, idle: '—', repair: '—', kio: 74.4, hours: 8.9, vol: 17.1, max: 19.7 },
  { ev: 'WK 20 /101', kc: 'Б75306', cube: 96, cycle: 2.8, kioStd: 87.1, idle: '—', repair: '—', kio: 73.1, hours: 8.8, vol: 18.1, max: 19.7 },
  { ev: 'WK 20 /97', kc: 'Б75306', cube: 96, cycle: 2.5, kioStd: 85.1, idle: '—', repair: '—', kio: 71.1, hours: 8.5, vol: 19.7, max: 19.7 },
  { ev: 'WK 20 /98', kc: 'Б75306', cube: 96, cycle: 2.9, kioStd: 89.9, idle: '—', repair: '—', kio: 75.9, hours: 9.1, vol: 18.1, max: 19.7 },
  { ev: 'ЭКГ 20 /30', kc: 'Б75306', cube: 96, cycle: 2.9, kioStd: 88.7, idle: '—', repair: '—', kio: 74.7, hours: 9.0, vol: 17.8, max: 19.7 }];


  const st = [
  { ev: 'EX 1900 /2', kc: 'Б75306', cube: 96, cycle: 6.8, kioStd: 88.0, idle: '—', repair: '—', kio: 74.0, hours: 8.9, vol: 6.6, max: 10.9 },
  { ev: 'EX 1900 /3', kc: 'Б75306', cube: 96, cycle: 6.8, kioStd: 88.0, idle: '—', repair: '12', kio: 0.0, hours: 0.0, vol: 0.0, max: 10.9, repairLock: true },
  { ev: 'EX 2600 D /100', kc: 'Б75306', cube: 96, cycle: 5.3, kioStd: 88.0, idle: '—', repair: '—', kio: 74.0, hours: 8.9, vol: 8.1, max: 10.9 },
  { ev: 'EX 2600 E /51', kc: 'Б75306', cube: 96, cycle: 5.6, kioStd: 89.8, idle: '—', repair: '—', kio: 75.8, hours: 9.1, vol: 9.4, max: 10.9 },
  { ev: 'R 9250 /5', kc: 'Б75306', cube: 96, cycle: 5.4, kioStd: 87.7, idle: '—', repair: '—', kio: 73.7, hours: 8.8, vol: 9.4, max: 10.9 },
  { ev: 'PC 2000 /10', kc: 'Б75131', cube: 55, cycle: 5.1, kioStd: 87.2, idle: '—', repair: '—', kio: 73.2, hours: 8.8, vol: 5.7, max: 10.9 },
  { ev: 'PC 2000 /15', kc: 'Б75131', cube: 55, cycle: 3.3, kioStd: 84.0, idle: '—', repair: '—', kio: 70.0, hours: 8.4, vol: 8.4, max: 10.9 },
  { ev: 'PC 2000 /16', kc: 'Б75131', cube: 55, cycle: 3.0, kioStd: 88.7, idle: '—', repair: '—', kio: 74.7, hours: 9.0, vol: 9.9, max: 10.9 },
  { ev: 'PC 2000 /20', kc: 'Б75131', cube: 55, cycle: 3.6, kioStd: 87.9, idle: '—', repair: '—', kio: 73.9, hours: 8.9, vol: 8.1, max: 10.9 },
  { ev: 'PC 2000 /4', kc: '—', cube: 55, cycle: 3.3, kioStd: 88.0, idle: '—', repair: '12', kio: 0.0, hours: 0.0, vol: 0.0, max: 10.9, repairLock: true },
  { ev: 'PC 2000 /43', kc: 'Б75131', cube: 55, cycle: 3.3, kioStd: 88.8, idle: '—', repair: '—', kio: 74.8, hours: 9.0, vol: 9.0, max: 10.9 },
  { ev: 'PC 2000 /8', kc: '—', cube: 55, cycle: 3.3, kioStd: 88.0, idle: '—', repair: '12', kio: 0.0, hours: 0.0, vol: 0.0, max: 10.9, repairLock: true },
  { ev: 'PC 2000 /82', kc: 'Б75131', cube: 55, cycle: 3.9, kioStd: 89.5, idle: '—', repair: '—', kio: 75.5, hours: 9.1, vol: 7.7, max: 10.9 },
  { ev: 'PC 2000 /88', kc: 'Б75131', cube: 55, cycle: 2.8, kioStd: 91.0, idle: '—', repair: '—', kio: 77.0, hours: 9.2, vol: 10.9, max: 10.9 },
  { ev: 'PC 2000 /94', kc: 'Б75131', cube: 55, cycle: 3.7, kioStd: 88.5, idle: '—', repair: '—', kio: 74.5, hours: 8.9, vol: 8.0, max: 10.9 },
  { ev: 'PC 2000 /99', kc: 'Б75131', cube: 55, cycle: 3.6, kioStd: 86.3, idle: '—', repair: '—', kio: 72.3, hours: 8.7, vol: 7.9, max: 10.9 }];


  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ display: 'flex', gap: 6, padding: '4px 6px', background: 'var(--surface-2)', border: '0.5px solid var(--border)', borderRadius: 999 }}>
          <span style={{ width: 14, height: 14, borderRadius: 999, border: '1.5px solid var(--teal-400)' }} />
          <span style={{ width: 14, height: 14, borderRadius: 999, background: 'var(--surface)' }} />
          <span style={{ width: 14, height: 14, borderRadius: 999, background: 'var(--surface)' }} />
        </div>
        <button className="btn btn-ghost btn-sm"><IconRefresh size={11} /> Обновить</button>
        <button className="btn btn-danger btn-sm"><IconX size={11} /> Сброс простоев</button>
        <button className="btn btn-neutral btn-sm"><IconDownload size={11} /> Excel</button>
        <span style={{ flex: 1 }} />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-muted)' }}>Обновлено: 02:08</span>
      </div>

      {/* KPI tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10 }}>
        {kpis.map((k, i) =>
        <div key={i} style={{
          padding: '14px 16px', background: 'var(--surface)', border: '0.5px solid var(--border)',
          borderRadius: 'var(--r-lg)', textAlign: 'center'
        }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 26, color: { pos: 'var(--pos)', neg: 'var(--neg)', neutral: 'var(--fg)', 'warn-orange': 'var(--warn-orange)' }[k.tone] || 'var(--fg)', letterSpacing: '-0.03em', lineHeight: 1, marginBottom: 6 }}>
              {k.value}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--fg-muted)' }}>
              {k.label}{k.unit && ', ' + k.unit}
            </div>
            {k.sub && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--fg-muted)', marginTop: 4, letterSpacing: '0.06em' }}>{k.sub}</div>}
          </div>
        )}
      </div>

      <VolumeTable title="КТ (22 м³)" count={kt.length} sum="209.1 / 148 тыс.м³" tone="info" rows={kt} />
      <VolumeTable title="СТ (12–15 м³)" count={st.length} sum="109.0 / 73 тыс.м³" tone="pos" rows={st} />
    </div>);

}

function VolumeTable({ title, count, sum, tone, rows }) {
  const headBg = tone === 'info' ? 'rgba(54,100,165,0.16)' : 'rgba(29,184,154,0.10)';
  const headFg = tone === 'info' ? 'var(--info)' : 'var(--pos)';
  return (
    <div style={{ background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 16px', background: headBg, color: headFg,
        borderBottom: '0.5px solid var(--border)'
      }}>
        {tone === 'info' ? <IconTrendingUp size={13} /> : <IconActivity size={13} />}
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 500 }}>{title}</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, opacity: 0.7 }}>({count})</span>
        <span style={{ flex: 1 }} />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.04em' }}>Σ {sum}</span>
      </div>
      <div style={{
        display: 'grid', gridTemplateColumns: '1.2fr 0.7fr 0.5fr 0.5fr 0.7fr 0.6fr 0.6fr 0.7fr 0.5fr 1.4fr',
        padding: '8px 16px', background: 'var(--surface-2)',
        fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.10em',
        textTransform: 'uppercase', color: 'var(--fg-muted)',
        borderBottom: '0.5px solid var(--border)'
      }}>
        <span>ЭВ</span><span>КС</span><span style={{ textAlign: 'right' }}>Кубы</span><span style={{ textAlign: 'right' }}>Цикл</span><span style={{ textAlign: 'right' }}>КИО СТД</span><span style={{ textAlign: 'right' }}>Простои</span><span style={{ textAlign: 'right' }}>Ремонт</span><span style={{ textAlign: 'right' }}>КИО общ</span><span style={{ textAlign: 'right' }}>Часы</span><span>Объём, тыс.м³</span>
      </div>
      {rows.map((r, i) => {
        const dim = r.repairLock || r.kc === '—';
        const pct = r.vol / r.max * 100;
        const dataC = dim ? 'var(--fg-muted)' : 'var(--fg)';
        return (
          <div key={i} style={{
            display: 'grid', gridTemplateColumns: '1.2fr 0.7fr 0.5fr 0.5fr 0.7fr 0.6fr 0.6fr 0.7fr 0.5fr 1.4fr',
            padding: '7px 16px', alignItems: 'center',
            borderBottom: i < rows.length - 1 ? '0.5px solid var(--border)' : 'none',
            opacity: dim ? 0.55 : 1,
            fontStyle: dim ? 'italic' : 'normal'
          }}>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: dataC }}>{r.ev}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-muted)' }}>{r.kc}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: dataC, textAlign: 'right' }}>{r.cube}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: dataC, textAlign: 'right' }}>{r.cycle.toFixed(1)}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: dataC, textAlign: 'right' }}>{r.kioStd.toFixed(1)}%</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: r.idle !== '—' ? 'var(--warn-orange)' : 'var(--fg-muted)', textAlign: 'right' }}>{r.idle}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-muted)', textAlign: 'right' }}>
              {r.repairLock ? <><IconLock size={9} style={{ verticalAlign: 'middle', marginRight: 3 }} />{r.repair}</> : r.repair}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: dataC, textAlign: 'right' }}>{r.kio.toFixed(1)}%</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: dataC, textAlign: 'right' }}>{r.hours.toFixed(1)}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ flex: 1, height: 14, background: 'var(--surface-2)', borderRadius: 2, overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
                <span style={{ display: 'block', height: '100%', width: Math.max(2, pct) + '%', background: 'var(--pos)', opacity: dim ? 0.4 : 0.85, borderRadius: 2 }} />
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: dataC, minWidth: 32, textAlign: 'right' }}>{r.vol.toFixed(1)}</span>
            </span>
          </div>);

      })}
    </div>);

}

/* ═══════════════════════════════════════════════════════════════════════════
   3. Цикл погрузки — почасовой рейтинг
═══════════════════════════════════════════════════════════════════════════ */
function DashCycleRating() {
  // each section: { id, title, color, norm, rows: [{ev, hours[7], total, potential, angle, losses, fullness, trucks}] }
  const SECTIONS = [
  {
    id: 'large', title: 'I. Крупные (≥22 м³): EX 3600, PC 4000, WK 20, R 9400, ЭКГ 20', count: 11, color: 'rgba(54,100,165,0.18)', cText: 'var(--info)', norm: '3.3 мин',
    rows: [
    { ev: 'R 9400 E /7', h: [3.8, 4.2, 4.4, 3.9, 3.8, 4.8], tot: 4.1, pot: 4.7, ic: 'И', angle: '—', losses: 0.07, fullness: '209.8 т', trucks: 306 },
    { ev: 'EX 3600 E /69', h: [4.0, 3.9, 3.9, 4.8, 4.3, 4.2, 4.0], tot: 4.1, pot: 3.9, ic: 'И', angle: '105°', losses: 0.4, fullness: '231 т', trucks: 306 },
    { ev: 'EX 3600 E /87', h: [3.2, 3.3, 3.4, 3.5, 3.5, 3.7, 4.0], tot: 3.4, pot: 3.6, ic: 'И', angle: '54°', losses: 0.10, fullness: '210.7 т', trucks: 306 },
    { ev: 'ЭКГ 20 /30', h: [3.3, 3.4, 3.5, 3.3, 3.8, 3.3, 3.5], tot: 3.4, pot: 3.2, ic: 'И', angle: '39°', losses: 0.4, fullness: '205.6 т', trucks: 306 },
    { ev: 'EX 3600 E /48', h: [3.3, 3.4, 2.8, 3.1, 3.1, 3.1, 2.9], tot: 3.1, pot: 3.0, ic: 'И', angle: '—', losses: 0.3, fullness: '190.6 т', trucks: 306 },
    { ev: 'EX 3600 D /90', h: [2.8, 3.2, 3.0, 3.3, 3.3, 3.3, 3.3], tot: 3.1, pot: 3.1, ic: 'И', angle: '55°', losses: 0.2, fullness: '226 т', trucks: 306 },
    { ev: 'PC 4000 E /38', h: [3.1, 3.1, 3.1, 3.2, 3.2, 3.1, 3.6], tot: 3.1, pot: 3.0, ic: 'И', angle: '60°', losses: 0.3, fullness: '206.4 т', trucks: 306 },
    { ev: 'PC 4000 E /284', h: [2.9, 2.8, 2.9, 3.1, 4.5, 3.0, 2.9], tot: 3.0, pot: 2.8, ic: 'И', angle: '62°', losses: 0.5, fullness: '209.8 т', trucks: 306 },
    { ev: 'WK 20 /98', h: [3.0, 3.0, 3.2, 2.6, 2.7, 2.9, 3.2], tot: 2.9, pot: 2.9, ic: 'И', angle: '42°', losses: 0.3, fullness: '228.4 т', trucks: 306 },
    { ev: 'WK 20 /101', h: [null, null, 2.5, 2.6, 2.7, 2.6, 2.7], tot: 2.6, pot: 2.6, ic: 'И', angle: '—', losses: 0.08, fullness: '221 т', trucks: 306 },
    { ev: 'WK 20 /97', h: [2.5, 2.4, 2.5, 2.5, 2.3, 2.5, 2.3], tot: 2.5, pot: 2.5, ic: 'И', angle: '—', losses: 0.06, fullness: '224.6 т', trucks: 306 }]

  },
  {
    id: 'medium', title: 'II. Средние (12–15 м³): PC 2000, EX 2600, EX 1900, R 9250', count: 11, color: 'rgba(29,184,154,0.16)', cText: 'var(--pos)', norm: '3.5 мин',
    rows: [
    { ev: 'R 9250 /5', h: [5.5, 6.3, 6.5, 6.6, 5.4, 5.6, 5.8], tot: 6.0, pot: 5.5, ic: 'И', angle: '—', losses: 0.2, fullness: '224.6 т', trucks: 306 },
    { ev: 'PC 2000 /15', h: [5.5, 5.0, 5.3, 5.3, 5.2, 5.3, 5.3], tot: 5.3, pot: 5.2, ic: 'И', angle: '—', losses: 0.08, fullness: '231.2 т', trucks: 306 },
    { ev: 'PC 2000 /88', h: [4.7, 5.0, 4.9, 5.7, 5.0, null, null], tot: 5.1, pot: 4.9, ic: 'И', angle: '—', losses: 0.1, fullness: '123.8 т', trucks: 130 },
    { ev: 'PC 2000 /43', h: [null, null, null, null, null, 4.6, 4.5], tot: 4.5, pot: 4.5, ic: 'И', angle: '—', losses: 0.00, fullness: '—', trucks: 130 },
    { ev: 'PC 2000 /10', h: [3.3, 3.1, 4.1, 4.3, 4.5, 3.8, 4.8], tot: 3.8, pot: 4.0, ic: 'И', angle: '—', losses: 0.08, fullness: '686.1 т', trucks: 130 },
    { ev: 'PC 2000 /82', h: [3.7, 3.9, 3.6, 3.4, 3.1, 3.8, 2.9], tot: 3.6, pot: 3.6, ic: 'И', angle: '—', losses: 0.1, fullness: '122.8 т', trucks: 130 },
    { ev: 'PC 2000 /94', h: [2.9, 3.0, 3.6, 3.8, 3.5, 3.6, null], tot: 3.4, pot: 3.6, ic: 'И', angle: '—', losses: 0.09, fullness: '133.4 т', trucks: 130 },
    { ev: 'PC 2000 /20', h: [3.0, 2.7, 2.8, 3.1, 3.2, 3.0, 2.8], tot: 3.0, pot: 2.8, ic: 'И', angle: '—', losses: 0.2, fullness: '124.4 т', trucks: 130 },
    { ev: 'PC 2000 /4', h: [2.9, 2.6, 3.3, 3.1, 2.9, 2.9, 2.9], tot: 2.9, pot: 2.8, ic: 'с', angle: '—', losses: 0.2, fullness: '133.3 т', trucks: 130 },
    { ev: 'PC 2000 /99', h: [3.1, 3.4, 3.1, 2.6, 2.7, 2.5, 2.9], tot: 2.9, pot: 2.7, ic: 'И', angle: '—', losses: 0.2, fullness: '119.6 т', trucks: 130 },
    { ev: 'PC 2000 /16', h: [2.9, 2.6, 2.7, 2.9, 2.6, 3.3, 3.2], tot: 2.9, pot: 3.2, ic: 'И', angle: '—', losses: 0.07, fullness: '141.8 т', trucks: 130 }]

  },
  {
    id: 'small', title: 'III. Малые (≤7 м³): PC 1250, EX 1200, SY 1250/58, PC 800, PC 400', count: 10, color: 'rgba(200,160,64,0.14)', cText: 'var(--warn)', norm: '3.5 мин',
    rows: [
    { ev: 'EX 1200 /115', h: [null, 6.0, 5.6, 5.0, null, null, null], tot: 5.5, pot: 6.2, ic: 'с', angle: '—', losses: 0.00, fullness: '89.6 т', trucks: 'HD785' },
    { ev: 'PC 1250 /3', h: [null, 4.7, 5.9, 5.7, 5.1, 4.4, null], tot: 5.2, pot: 5.4, ic: 'с', angle: '—', losses: 0.04, fullness: '66.4 т', trucks: 'HD785' },
    { ev: 'PC 1250 /18', h: [4.5, 5.0, 4.7, 4.6, null, 4.9, 5.7], tot: 4.8, pot: 4.0, ic: 'с', angle: '—', losses: 0.3, fullness: '72.3 т', trucks: '130, HD785' },
    { ev: 'PC 1250 /5', h: [4.3, 5.3, 4.9, 4.7, 4.6, 4.4, 5.2], tot: 4.8, pot: 5.0, ic: 'с', angle: '—', losses: 0.03, fullness: '68.2 т', trucks: 'HD785' },
    { ev: 'SY 1250 /58', h: [null, 5.4, 4.3, 4.5, 5.1, 4.7, 3.6, 3.7], tot: 4.5, pot: 5.0, ic: 'с', angle: '—', losses: 0.07, fullness: '66.8 т', trucks: 'HD785' },
    { ev: 'PC 1250 /705', h: [4.0, 4.3, 4.3, 4.2, 3.7, 3.4, 3.4], tot: 4.0, pot: 5.0, ic: 'с', angle: '—', losses: 0.02, fullness: '92.4 т', trucks: '130, HD785' },
    { ev: 'SY 1250 /102', h: [3.2, 3.9, 3.4, 3.2, 4.0, 3.2, 2.6], tot: 3.5, pot: 3.7, ic: 'с', angle: '—', losses: 0.08, fullness: '67.8 т', trucks: '130, HD785' },
    { ev: 'EX 1200 /49', h: [3.2, 3.5, 3.1, 3.2, null, 2.6, 2.6], tot: 3.1, pot: 5.0, ic: 'с', angle: '—', losses: 0.0, fullness: '92.6 т', trucks: 'HD785' },
    { ev: 'LiuGong CLG936E/5656', h: [3.1, 2.8, 2.9, 2.7, 2.6, 3.6], tot: 2.9, pot: 3.7, ic: 'с', angle: '—', losses: 0.03, fullness: '—', trucks: 'HD785' },
    { ev: 'PC-800 /65', h: [2.5, 2.2, 3.4, 2.2, 3.1, 2.4], tot: 2.6, pot: 3.7, ic: 'с', angle: '—', losses: 0.01, fullness: '32.3 т', trucks: 'HD785' }]

  },
  {
    id: 'dvs', title: 'IV. ДВС: SY 1250 /91,92,93,94,95,98', count: 3, color: 'rgba(140,100,200,0.14)', cText: '#B98BE0', norm: '3.5 мин',
    rows: [
    { ev: 'SY 1250 /94', h: [5.7, null, null, 4.9, 5.0, 6.4], tot: 5.5, pot: 3.3, ic: 'с', angle: '—', losses: '—', fullness: '60.8 т', trucks: '—' },
    { ev: 'SY 1250 /91', h: [2.8, 2.8, 2.5, 5.3, null, null], tot: 3.4, pot: 3.3, ic: 'с', angle: '—', losses: '—', fullness: '93.7 т', trucks: '—' },
    { ev: 'SY 1250 /98', h: [2.2, 2.2, 2.1, 4.8, 3.2, 3.2], tot: 2.9, pot: 3.3, ic: 'с', angle: '—', losses: '—', fullness: '38.1 т', trucks: '—' }]

  }];


  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 4, background: 'var(--surface-2)', border: '0.5px solid var(--border)' }}>
          <button className="icon-btn" style={{ width: 22, height: 22, border: 'none', background: 'transparent' }}><IconChevronLeft size={11} /></button>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg)', padding: '0 4px' }}>18.05.2026 (2)</span>
          <button className="icon-btn" style={{ width: 22, height: 22, border: 'none', background: 'transparent' }}><IconChevronRight size={11} /></button>
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-muted)' }}>Ночная смена 20:00 → 2:18 (7ч)</span>
        <div style={{ display: 'flex', gap: 6, padding: '4px 6px', background: 'var(--surface-2)', border: '0.5px solid var(--border)', borderRadius: 999, marginLeft: 6 }}>
          <span style={{ width: 14, height: 14, borderRadius: 999, border: '1.5px solid var(--teal-400)' }} />
          <span style={{ width: 14, height: 14, borderRadius: 999, background: 'var(--surface)' }} />
          <span style={{ width: 14, height: 14, borderRadius: 999, background: 'var(--surface)' }} />
        </div>
        <button className="btn btn-ghost btn-sm"><IconRefresh size={11} /> Обновить</button>
        <button className="btn btn-neutral btn-sm"><IconLayers size={11} /> Срез</button>
        <button className="btn btn-neutral btn-sm"><IconActivity size={11} /> Перемещения ЭВ</button>
        <button className="btn btn-neutral btn-sm"><IconPickaxe size={11} /> Бульдозер ЭВ</button>
        <button className="btn btn-neutral btn-sm"><IconTrendingUp size={11} /> Динамика</button>
        <button className="btn btn-neutral btn-sm"><IconBookOpen size={11} /> Памятка</button>
        <button className="btn btn-neutral btn-sm"><IconCpu size={11} /> Логи директив</button>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-muted)' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><span style={{ width: 7, height: 7, borderRadius: 999, background: 'var(--neg)' }} /> &gt; +0.15 мин от потенциала</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><span style={{ width: 7, height: 7, borderRadius: 999, background: 'var(--pos)' }} /> Потенциал</span>
      </div>

      {/* Top summary */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 24, padding: '14px 18px', background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: 'var(--r-lg)' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 4 }}>Потенциал КТ+СТ</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 30, color: 'var(--fg)', letterSpacing: '-0.03em', lineHeight: 1 }}>3.3<span style={{ fontSize: 12, opacity: 0.6, marginLeft: 4 }}>мин</span></div>
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 4 }}>Факт КТ+СТ</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 30, color: 'var(--pos)', letterSpacing: '-0.03em', lineHeight: 1 }}>3.6<span style={{ fontSize: 12, opacity: 0.6, marginLeft: 4 }}>мин</span></div>
        </div>
        <span style={{ flex: 1 }} />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 4 }}>Средний цикл КТ + СТ</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 40, color: 'var(--pos)', letterSpacing: '-0.03em', lineHeight: 1 }}>3.6<span style={{ fontSize: 14, opacity: 0.6, marginLeft: 6 }}>мин</span></div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--warn-orange)', marginTop: 6 }}>+0.3 мин от целевого (потенциал 3.3 мин)</div>
        </div>
        <span style={{ flex: 1 }} />
      </div>

      {SECTIONS.map((sec) => <CycleSection key={sec.id} sec={sec} />)}
    </div>);

}

function CycleSection({ sec }) {
  const hours = ['20-21', '21-22', '22-23', '23-0', '0-1', '1-2', '2-3'];
  return (
    <div style={{ background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 16px', background: sec.color, color: sec.cText,
        borderBottom: '0.5px solid var(--border)'
      }}>
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 500 }}>{sec.title}</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, opacity: 0.7 }}>({sec.count})</span>
        <span style={{ flex: 1 }} />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.04em' }}>Норма {sec.norm}</span>
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '36px 1.2fr repeat(7, 1fr) 0.8fr 0.8fr 0.6fr 0.8fr 0.9fr 1fr',
        padding: '8px 14px', background: 'var(--surface-2)',
        fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.08em',
        textTransform: 'uppercase', color: 'var(--fg-muted)',
        borderBottom: '0.5px solid var(--border)'
      }}>
        <span>#</span><span>Экскаватор</span>
        {hours.map((h) => <span key={h} style={{ textAlign: 'right' }}>{h}</span>)}
        <span style={{ textAlign: 'right' }}>Итого</span>
        <span style={{ textAlign: 'right' }}>Потенц.</span>
        <span style={{ textAlign: 'right' }}>Угол ⌀</span>
        <span style={{ textAlign: 'right' }}>Потери, тыс.м³</span>
        <span style={{ textAlign: 'right' }}>Полнота, т</span>
        <span>Самосвалы</span>
      </div>
      {sec.rows.map((r, i) => {
        // simple coloring: red if value > pot + 0.15
        const cell = (v) => {
          if (v == null) return <span style={{ color: 'var(--fg-muted)' }}>—</span>;
          const bad = v > (r.pot || 0) + 0.15;
          return <span style={{ color: bad ? 'var(--neg)' : 'var(--fg)' }}>{v.toFixed(1)}</span>;
        };
        return (
          <div key={i} style={{
            display: 'grid',
            gridTemplateColumns: '36px 1.2fr repeat(7, 1fr) 0.8fr 0.8fr 0.6fr 0.8fr 0.9fr 1fr',
            padding: '8px 14px', alignItems: 'center',
            borderBottom: i < sec.rows.length - 1 ? '0.5px solid var(--hairline)' : 'none',
            fontFamily: 'var(--font-mono)', fontSize: 11
          }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22, borderRadius: 4, background: r.tot > r.pot + 0.15 ? 'rgba(224,82,82,0.16)' : 'rgba(29,184,154,0.12)', color: r.tot > r.pot + 0.15 ? 'var(--neg)' : 'var(--pos)' }}>{i + 1}</span>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--fg)' }}>{r.ev}</span>
            {Array.from({ length: 7 }).map((_, hi) =>
            <span key={hi} style={{ textAlign: 'right' }}>{cell(r.h[hi])}</span>
            )}
            <span style={{ textAlign: 'right', color: r.tot > r.pot + 0.15 ? 'var(--neg)' : 'var(--fg)', fontWeight: 600 }}>{r.tot.toFixed(1)}</span>
            <span style={{ textAlign: 'right', color: 'var(--pos)' }}>{r.pot.toFixed(1)} <span style={{ color: 'var(--fg-muted)', fontSize: 9 }}>({r.ic})</span></span>
            <span style={{ textAlign: 'right', color: r.angle === '—' ? 'var(--fg-muted)' : 'var(--neg)' }}>{r.angle}</span>
            <span style={{ textAlign: 'right', color: typeof r.losses === 'number' && r.losses > 0.15 ? 'var(--warn-orange)' : 'var(--fg)' }}>{typeof r.losses === 'number' ? r.losses.toFixed(2) : r.losses}</span>
            <span style={{ textAlign: 'right', color: 'var(--neg)' }}>{r.fullness}</span>
            <span style={{ color: 'var(--fg-muted)' }}>{r.trucks}</span>
          </div>);

      })}
    </div>);

}

/* ═══════════════════════════════════════════════════════════════════════════
   4. Монитор потерь
═══════════════════════════════════════════════════════════════════════════ */
function DashLossesMonitor() {
  const [authorTab, setAuthorTab] = React.useState('all');
  const authorTabs = [
  { id: 'all', label: 'Все', count: null },
  { id: 'starkov', label: 'Старков обмен', count: 16 },
  { id: 'stepanov', label: 'Степанов производство', count: 16 },
  { id: 'farizunov', label: 'Фаризунов КИО', count: 10 },
  { id: 'dyakonov', label: 'Дьяконов КТГ', count: 1 },
  { id: 'rok', label: 'РОК отс. АТ', count: 7 }];

  const ktCards = [
  { ev: 'R 9400 E /7', max: 18.9, pct: 49, badge: 'red',
    metrics: [
    { label: 'Цикл (3.0м)', value: '—', delta: null, tone: 'neutral' },
    { label: 'Обмен КС (0.8м)', value: '—', delta: null, tone: 'neutral' },
    { label: 'Отс. АТ (0%)', value: '0', tone: 'pos' },
    { label: 'КТГ (100%)', value: '100%', tone: 'pos' },
    { label: 'КИО (95%)', value: '8% 18м', delta: '-8.7', tone: 'neg' },
    { label: '· 1 простой (18 мин)', tone: 'info' },
    { label: 'Полнота (100%)', value: '—', tone: 'neutral' }]

  },
  { ev: 'EX 3600 E /87', max: 16.4, pct: 66, badge: 'red',
    metrics: [
    { label: 'Цикл (3.1м)', value: '4.0м', delta: '+0.9', tone: 'neg' },
    { label: 'Обмен КС (0.8м)', value: '1.4м', delta: '-1.1', tone: 'neg' },
    { label: 'Отс. АТ (0%)', value: '0', tone: 'pos' },
    { label: 'КТГ (100%)', value: '100%', tone: 'pos' },
    { label: 'КИО (95%)', value: '74% 5м', delta: '-2.1', tone: 'neg' },
    { label: '· 2 простоя (5 мин)', tone: 'info' },
    { label: 'Полнота (100%)', value: '—', tone: 'neutral' }]

  },
  { ev: 'EX 3600 E /69', max: 16.0, pct: 61, badge: 'red',
    metrics: [
    { label: 'Цикл (3.2м)', value: '4.0м', delta: '+0.8', tone: 'neg' },
    { label: 'Обмен КС (0.8м)', value: '1.5м', delta: '-1.4', tone: 'neg' },
    { label: 'Отс. АТ (0%)', value: '0', tone: 'pos' },
    { label: 'КТГ (100%)', value: '100%', tone: 'pos' },
    { label: 'КИО (95%)', value: '92% 2м', delta: '-0.3', tone: 'neg' },
    { label: '· 1 простой (2 мин)', tone: 'info' },
    { label: 'Полнота (100%)', value: '—', tone: 'neutral' }]

  },
  { ev: 'PC 4000 E /38', max: 18.3, pct: 70, badge: 'amber',
    metrics: [
    { label: 'Цикл (2.8м)', value: '3.6м', delta: '+0.8', tone: 'neg' },
    { label: 'Обмен КС (0.8м)', value: '—', tone: 'neutral' },
    { label: 'Отс. АТ (0%)', value: '0', tone: 'pos' },
    { label: 'КТГ (100%)', value: '100%', tone: 'pos' },
    { label: 'КИО (95%)', value: '86% 3м', delta: '-0.9', tone: 'neg' },
    { label: '· 1 простой (3 мин)', tone: 'info' },
    { label: 'Полнота (100%)', value: '81.8%', tone: 'neg' }]

  },
  { ev: 'ЭКГ 20 /30', max: 17.3, pct: 65, badge: 'red',
    metrics: [
    { label: 'Цикл (2.7м)', value: '3.5м', delta: '+0.8', tone: 'neg' },
    { label: 'Обмен КС (0.8м)', value: '1.0м', delta: '-0.4', tone: 'neg' },
    { label: 'Отс. АТ (0%)', value: '0м', tone: 'pos' },
    { label: 'КТГ (100%)', value: '100%', tone: 'pos' },
    { label: 'КИО (95%)', value: '100%', tone: 'pos' },
    { label: 'Полнота (100%)', value: '—', tone: 'neutral' }]

  },
  { ev: 'WK 20 /98', max: 18.0, pct: 78, badge: 'amber',
    metrics: [
    { label: 'Цикл (2.8м)', value: '3.2м', delta: '+0.4', tone: 'neg' },
    { label: 'Обмен КС (0.8м)', value: '1.2м', delta: '-0.9', tone: 'neg' },
    { label: 'Отс. АТ (0%)', value: '0', tone: 'pos' },
    { label: 'КТГ (100%)', value: '100%', tone: 'pos' },
    { label: 'КИО (95%)', value: '97%', tone: 'pos' },
    { label: '· 1 простой (1 мин)', tone: 'info' },
    { label: 'Полнота (100%)', value: '—', tone: 'neutral' }]

  },
  { ev: 'WK 20 /97', max: 18.8, pct: 82, badge: 'amber',
    metrics: [
    { label: 'Цикл (2.7м)', value: '2.8м', delta: '+0.1', tone: 'neg' },
    { label: 'Обмен КС (0.8м)', value: '1.3м', delta: '-1.1', tone: 'neg' },
    { label: 'Отс. АТ (0%)', value: '0', tone: 'pos' },
    { label: 'КТГ (100%)', value: '100%', tone: 'pos' },
    { label: 'КИО (95%)', value: '100%', tone: 'pos' },
    { label: 'Полнота (100%)', value: '—', tone: 'neutral' }]

  },
  { ev: 'WK 20 /101', max: 19.7, pct: 48, badge: 'red',
    metrics: [
    { label: 'Цикл (2.8м)', value: '2.8м', delta: '+0.0', tone: 'neutral' },
    { label: 'Обмен КС (0.8м)', value: '1.4м', delta: '-1.1', tone: 'neg' },
    { label: 'Отс. АТ (0%)', value: '0', tone: 'pos' },
    { label: 'КТГ (100%)', value: '100%', tone: 'pos' },
    { label: 'КИО (95%)', value: '100%', tone: 'pos' },
    { label: 'Полнота (100%)', value: '93.2%', tone: 'neg' }]

  },
  { ev: 'EX 3600 E /48', max: 15.4, pct: 77, badge: 'amber',
    metrics: [
    { label: 'Цикл (3.3м)', value: '2.9м', delta: '-0.4', tone: 'pos' },
    { label: 'Обмен КС (0.8м)', value: '1.3м', delta: '-0.9', tone: 'neg' },
    { label: 'Отс. АТ (0%)', value: '0', tone: 'pos' },
    { label: 'КТГ (100%)', value: '100%', tone: 'pos' },
    { label: 'КИО (95%)', value: '100%', tone: 'pos' },
    { label: 'Полнота (100%)', value: '93.2%', tone: 'neg' }]

  },
  { ev: 'PC 4000 E /284', max: 18.4, pct: 73, badge: 'amber',
    metrics: [
    { label: 'Цикл (2.8м)', value: '2.9м', delta: '+0.1', tone: 'neg' },
    { label: 'Обмен КС (0.8м)', value: '1.0м', delta: '-0.3', tone: 'neg' },
    { label: 'Отс. АТ (0%)', value: '0', tone: 'pos' },
    { label: 'КТГ (100%)', value: '100%', tone: 'pos' },
    { label: 'КИО (95%)', value: '91% 2м', delta: '-0.4', tone: 'neg' },
    { label: '· 1 простой (2 мин)', tone: 'info' },
    { label: 'Полнота (100%)', value: '—', tone: 'neutral' }]

  },
  { ev: 'EX 3600 D /90', max: 13.4, pct: 93, badge: 'pos',
    metrics: [
    { label: 'Цикл (4.0м)', value: '3.3м', delta: '-0.7', tone: 'pos' },
    { label: 'Обмен КС (0.8м)', value: '1.1м', delta: '-0.6', tone: 'neg' },
    { label: 'Отс. АТ (0%)', value: '0', tone: 'pos' },
    { label: 'КТГ (100%)', value: '100%', tone: 'pos' },
    { label: 'КИО (95%)', value: '100%', tone: 'pos' },
    { label: 'Полнота (100%)', value: '—', tone: 'neutral' }]

  },
  { ev: 'EX 3600 E /72', max: null, pct: null, empty: true },
  { ev: 'EX 3600 E /27', max: null, pct: null, empty: true },
  { ev: 'PC 4000 E /283', max: null, pct: null, empty: true }];


  const stCards = [
  { ev: 'EX 2600 E /51', max: 0.0, pct: 0, badge: 'red',
    metrics: [
    { label: 'Цикл (3.0м)', value: '—', tone: 'neutral' },
    { label: 'Обмен КС (0.8м)', value: '—', tone: 'neutral' },
    { label: 'Отс. АТ (0%)', value: '0', tone: 'pos' },
    { label: 'КТГ (100%)', value: '8% 18м', delta: '-4.6', tone: 'neg' },
    { label: '· 1 простой (18 мин)', tone: 'info' },
    { label: 'КИО (95%)', value: '100%', tone: 'pos' },
    { label: 'Полнота (100%)', value: '—', tone: 'neutral' }]

  },
  { ev: 'PC 2000 /88', max: 10.5, pct: 36, badge: 'red',
    metrics: [
    { label: 'Цикл (3.0м)', value: '—', tone: 'neutral' },
    { label: 'Обмен КС (0.8м)', value: '—', tone: 'neutral' },
    { label: 'Отс. АТ (0%)', value: '0', tone: 'pos' },
    { label: 'КТГ (100%)', value: '100%', tone: 'pos' },
    { label: 'КИО (95%)', value: '8% 18м', delta: '-4.3', tone: 'neg' },
    { label: '· 1 простой (18 мин)', tone: 'info' },
    { label: 'Полнота (100%)', value: '—', tone: 'neutral' }]

  },
  { ev: 'PC 2000 /10', max: 14.5, pct: 23, badge: 'red',
    metrics: [
    { label: 'Цикл (1.9м)', value: '4.7м', delta: '+2.8', tone: 'neg' },
    { label: 'Обмен КС (0.8м)', value: '—', tone: 'neutral' },
    { label: 'Отс. АТ (0%)', value: '0', tone: 'pos' },
    { label: 'КТГ (100%)', value: '100%', tone: 'pos' },
    { label: 'КИО (95%)', value: '80% 4м', delta: '-0.7', tone: 'neg' },
    { label: '· 3 простоя (4 мин)', tone: 'info' },
    { label: 'Полнота (100%)', value: '—', tone: 'neutral' }]

  },
  { ev: 'PC 2000 /43', max: 0.0, pct: 0, badge: 'red',
    metrics: [
    { label: 'Цикл (3.1м)', value: '4.5м', delta: '+1.4', tone: 'neg' },
    { label: 'Обмен КС (0.8м)', value: '1.5м', delta: '-0.7', tone: 'neg' },
    { label: 'Отс. АТ (0%)', value: '3м', tone: 'neg' },
    { label: 'КТГ (100%)', value: '100%', tone: 'pos' },
    { label: 'КИО (95%)', value: '100%', tone: 'pos' },
    { label: 'Полнота (100%)', value: '—', tone: 'neutral' }]

  },
  { ev: 'R 9250 /5', max: 12.7, pct: 64, badge: 'red',
    metrics: [
    { label: 'Цикл (4.6м)', value: '5.8м', delta: '+1.2', tone: 'neg' },
    { label: 'Обмен КС (0.8м)', value: '—', tone: 'neutral' },
    { label: 'Отс. АТ (0%)', value: '0', tone: 'pos' },
    { label: 'КТГ (100%)', value: '100%', tone: 'pos' },
    { label: 'КИО (95%)', value: '81% 4м', delta: '-0.7', tone: 'neg' },
    { label: '· 1 простой (4 мин)', tone: 'info' },
    { label: 'Полнота (100%)', value: '88.2%', tone: 'neg' }]

  },
  { ev: 'PC 2000 /99', max: 11.6, pct: 58, badge: 'red',
    metrics: [
    { label: 'Цикл (2.7м)', value: '2.9м', delta: '+0.2', tone: 'neg' },
    { label: 'Обмен КС (0.8м)', value: '1.8м', delta: '-1.0', tone: 'neg' },
    { label: 'Отс. АТ (0%)', value: '2м', tone: 'neg' },
    { label: 'КТГ (100%)', value: '100%', tone: 'pos' },
    { label: 'КИО (95%)', value: '96%', tone: 'pos' },
    { label: '· 1 простой (1 мин)', tone: 'info' },
    { label: 'Полнота (100%)', value: '95.4%', tone: 'neg' }]

  },
  { ev: 'PC 2000 /16', max: 12.0, pct: 65, badge: 'red',
    metrics: [
    { label: 'Цикл (2.7м)', value: '3.2м', delta: '+0.5', tone: 'neg' },
    { label: 'Обмен КС (0.8м)', value: '1.2м', delta: '-0.4', tone: 'neg' },
    { label: 'Отс. АТ (0%)', value: '0', tone: 'pos' },
    { label: 'КТГ (100%)', value: '100%', tone: 'pos' },
    { label: 'КИО (95%)', value: '100%', tone: 'pos' },
    { label: 'Полнота (100%)', value: '111.5%', tone: 'pos' }]

  },
  { ev: 'PC 2000 /15', max: 12.9, pct: 55, badge: 'red',
    metrics: [
    { label: 'Цикл (4.6м)', value: '5.0м', delta: '+0.4', tone: 'neg' },
    { label: 'Обмен КС (0.8м)', value: '—', tone: 'neutral' },
    { label: 'Отс. АТ (0%)', value: '0', tone: 'pos' },
    { label: 'КТГ (100%)', value: '100%', tone: 'pos' },
    { label: 'КИО (95%)', value: '85% 3м', delta: '-0.5', tone: 'neg' },
    { label: '· 1 простой (3 мин)', tone: 'info' },
    { label: 'Полнота (100%)', value: '—', tone: 'neutral' }]

  },
  { ev: 'PC 2000 /82', max: 10.9, pct: 48, badge: 'red',
    metrics: [
    { label: 'Цикл (2.7м)', value: '3.3м', delta: '+0.6', tone: 'neg' },
    { label: 'Обмен КС (0.8м)', value: '—', tone: 'neutral' },
    { label: 'Отс. АТ (0%)', value: '1м', tone: 'neg' },
    { label: 'КТГ (100%)', value: '100%', tone: 'pos' },
    { label: 'КИО (95%)', value: '96%', tone: 'pos' },
    { label: '· 2 простоя (1 мин)', tone: 'info' },
    { label: 'Полнота (100%)', value: '—', tone: 'neutral' }]

  },
  { ev: 'PC 2000 /4', max: 10.1, pct: 65, badge: 'red',
    metrics: [
    { label: 'Цикл (3.0м)', value: '2.9м', delta: '-0.1', tone: 'pos' },
    { label: 'Обмен КС (0.8м)', value: '1.1м', delta: '-0.3', tone: 'neg' },
    { label: 'Отс. АТ (0%)', value: '4м', tone: 'neg' },
    { label: 'КТГ (100%)', value: '100%', tone: 'pos' },
    { label: 'КИО (95%)', value: '95% 1м', delta: '-0.3', tone: 'neg' },
    { label: '· 2 простоя (2 мин)', tone: 'info' },
    { label: 'Полнота (100%)', value: '—', tone: 'neutral' }]

  },
  { ev: 'PC 2000 /94', max: 10.5, pct: 62, badge: 'red',
    metrics: [
    { label: 'Цикл (3.5м)', value: '3.4м', delta: '-0.1', tone: 'pos' },
    { label: 'Обмен КС (0.8м)', value: '—', tone: 'neutral' },
    { label: 'Отс. АТ (0%)', value: '9м', tone: 'neg' },
    { label: 'КТГ (100%)', value: '100%', tone: 'pos' },
    { label: 'КИО (95%)', value: '99%', tone: 'pos' },
    { label: '· 1 простой (0 мин)', tone: 'info' },
    { label: 'Полнота (100%)', value: '—', tone: 'neutral' }]

  },
  { ev: 'PC 2000 /20', max: 10.3, pct: 60, badge: 'red',
    metrics: [
    { label: 'Цикл (3.2м)', value: '3.1м', delta: '-0.1', tone: 'pos' },
    { label: 'Обмен КС (0.8м)', value: '—', tone: 'neutral' },
    { label: 'Отс. АТ (0%)', value: '4м', tone: 'neg' },
    { label: 'КТГ (100%)', value: '100%', tone: 'pos' },
    { label: 'КИО (95%)', value: '100%', tone: 'pos' },
    { label: 'Полнота (100%)', value: '—', tone: 'neutral' }]

  },
  { ev: 'EX 1900 /2', max: null, pct: null, empty: true },
  { ev: 'EX 1900 /3', max: null, pct: null, empty: true },
  { ev: 'PC 2000 /8', max: null, pct: null, empty: true },
  { ev: 'EX 2600 D /100', max: null, pct: null, empty: true }];


  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Toolbar 1 — title chip and live label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'var(--surface-2)', border: '0.5px solid var(--border)', borderRadius: 'var(--r-md)' }}>
        <IconZap size={15} style={{ color: 'var(--warn)' }} />
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 500, color: 'var(--fg)' }}>Потери от цели</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-muted)' }}>Ночь · 2026-05-19 02:19</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-mono)', fontSize: 10, padding: '3px 8px', borderRadius: 4, background: 'rgba(29,184,154,0.12)', border: '0.5px solid rgba(29,184,154,0.30)', color: 'var(--pos)', letterSpacing: '0.10em' }}>
          <span className="dot dot-pos" /> LIVE
        </span>
        <span style={{ flex: 1 }} />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, padding: '4px 9px', borderRadius: 4, background: 'rgba(196,124,50,0.12)', border: '0.5px solid rgba(196,124,50,0.30)', color: 'var(--warn-orange)' }}>
          Автор: не задан
        </span>
      </div>

      {/* Filter chips row */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {[
        '⏱ Показатели за текущий час (от НН:00 до сейчас)',
        '◎ Цикл по потенциалу', 'Обмен 0.8м', 'Отс.АТ 0%', 'КТГ 100%', 'КИО 95%', 'Полнота 100%', '⛏ КТ: +0.1мин=-0.2тм³ | СТ ×0.5'].
        map((t, i) =>
        <span key={i} style={{
          fontFamily: 'var(--font-mono)', fontSize: 10,
          padding: '5px 10px', borderRadius: 999,
          background: 'var(--surface)', border: '0.5px solid var(--border)',
          color: 'var(--fg-muted)'
        }}>{t}</span>
        )}
      </div>

      {/* Progress to reset */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 14px', background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: 'var(--r-md)' }}>
        <IconClock size={12} style={{ color: 'var(--fg-muted)' }} />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-muted)' }}>Отметки по метрикам сбрасываются через</span>
        <span style={{ flex: 1, height: 5, background: 'var(--surface-2)', borderRadius: 2, overflow: 'hidden' }}>
          <span style={{ display: 'block', height: '100%', width: '32%', background: 'var(--info)' }} />
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg)' }}>09:53</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--teal-400)' }}>Логи →</span>
      </div>

      {/* Author tabs */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {authorTabs.map((t) =>
        <button key={t.id} onClick={() => setAuthorTab(t.id)} style={{
          padding: '6px 12px', borderRadius: 4,
          background: authorTab === t.id ? 'var(--teal-dim)' : 'var(--surface-2)',
          border: '0.5px solid ' + (authorTab === t.id ? 'var(--teal-400)' : 'var(--border)'),
          color: authorTab === t.id ? 'var(--teal-400)' : 'var(--fg-muted)',
          fontFamily: 'var(--font-mono)', fontSize: 11, cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', gap: 6
        }}>
            {t.label}
            {t.count && <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 18, height: 18, padding: '0 5px', borderRadius: 999, background: 'var(--neg)', color: '#fff', fontSize: 9 }}>{t.count}</span>}
          </button>
        )}
      </div>

      {/* KPI strip */}
      <div style={{ display: 'flex', gap: 10 }}>
        <LossKpi label="Активных" value="23" />
        <LossKpi label="Макс/смена" value="307" unit="тм³" />
        <LossKpi label="Факт" value="101.2" unit="тм³" tone="pos" />
        <LossKpi label="Потери" value="−48.6" unit="тм³" tone="neg" highlight />
      </div>

      {/* Sections */}
      <div>
        <div className="section-head"><span className="sh-title">Крупная техника (КТ)</span><div className="sh-line" /></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
          {ktCards.map((c, i) => <LossCard key={i} card={c} />)}
        </div>
      </div>
      <div>
        <div className="section-head"><span className="sh-title">Средняя техника (СТ)</span><div className="sh-line" /></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
          {stCards.map((c, i) => <LossCard key={i} card={c} />)}
        </div>
      </div>
    </div>);

}

function LossKpi({ label, value, unit, tone, highlight }) {
  const TONE = { pos: 'var(--pos)', neg: 'var(--neg)', neutral: 'var(--fg)' };
  const c = TONE[tone] || TONE.neutral;
  return (
    <div style={{
      flex: 1, padding: '12px 16px',
      background: highlight ? 'rgba(224,82,82,0.06)' : 'var(--surface)',
      border: '0.5px solid ' + (highlight ? 'rgba(224,82,82,0.30)' : 'var(--border)'),
      borderRadius: 'var(--r-md)'
    }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 8 }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, color: c, letterSpacing: '-0.03em', lineHeight: 1 }}>
        {value}{unit && <span style={{ fontSize: 11, opacity: 0.65, marginLeft: 4 }}>{unit}</span>}
      </div>
    </div>);

}

function LossCard({ card }) {
  if (card.empty) {
    return (
      <div style={{ background: 'var(--surface)', border: '0.5px dashed var(--border)', borderRadius: 'var(--r-md)', padding: '14px 16px', opacity: 0.5 }}>
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--fg-muted)' }}>{card.ev}</span>
      </div>);

  }
  const barColor = card.badge === 'pos' ? 'var(--pos)' : card.badge === 'amber' ? 'var(--warn-orange)' : 'var(--neg)';
  const pctC = card.badge === 'pos' ? 'var(--pos)' : card.badge === 'amber' ? 'var(--warn-orange)' : 'var(--neg)';
  return (
    <div style={{ background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: 'var(--r-md)', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 500, color: 'var(--fg)' }}>{card.ev}</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-muted)' }}>макс {card.max}тм³</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ flex: 1, height: 5, background: 'var(--surface-2)', borderRadius: 2, overflow: 'hidden' }}>
          <span style={{ display: 'block', height: '100%', width: Math.max(2, card.pct) + '%', background: barColor }} />
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: pctC, minWidth: 32, textAlign: 'right' }}>{card.pct}%</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {card.metrics.map((m, i) => <LossMetric key={i} m={m} />)}
      </div>
    </div>);

}

function LossMetric({ m }) {
  const TONE = { pos: 'var(--pos)', neg: 'var(--neg)', neutral: 'var(--fg-muted)', info: 'var(--info)' };
  const isInfoRow = m.label.startsWith('·');
  if (isInfoRow) {
    return (
      <div style={{ paddingLeft: 12, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--info)' }}>{m.label}</div>);

  }
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto auto', gap: 6, alignItems: 'center', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--fg)', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        <span style={{ width: 6, height: 6, borderRadius: 999, background: TONE[m.tone] || 'var(--fg-muted)' }} />
        <span>{m.label}</span>
      </span>
      <span style={{ color: m.tone === 'neutral' ? 'var(--fg-muted)' : TONE[m.tone] || 'var(--fg)', textAlign: 'right', minWidth: 36 }}>{m.value ?? ''}</span>
      {m.delta && <span style={{ color: m.tone === 'neg' ? 'var(--neg)' : 'var(--pos)', minWidth: 30, textAlign: 'right' }}>{m.delta}</span>}
      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 18, height: 18, borderRadius: 4, background: 'var(--surface-2)', border: '0.5px solid var(--border)', color: 'var(--fg-muted)' }}><IconDownload size={9} /></span>
      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 18, height: 18, borderRadius: 4, background: 'var(--surface-2)', border: '0.5px solid var(--border)', color: 'var(--fg-muted)', fontSize: 8 }}>Т</span>
    </div>);

}

export { SectionSolutionView, DashBudget, DashVolumePerShift, DashCycleRating, DashLossesMonitor, GenericSolutionPreview };