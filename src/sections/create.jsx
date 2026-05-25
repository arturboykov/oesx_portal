import React from 'react';
import {
  CubeLogo, IconSend, IconShield, IconRefresh, IconCheck, IconGitBranch, IconEdit,
  IconEye, IconTrendingUp, IconTriangle, IconPickaxe, IconBrain, IconAlertCircle, IconZap,
  IconClock, IconPlus, IconBarChart,
} from '../icons.jsx';
import { KindChip, PreviewChartLine, PreviewChartBars, Legend } from '../parts.jsx';
import { OESDATA } from '../data.jsx';
import { DashVolumePerShift, DashCycleRating, DashBudget, DashLossesMonitor, GenericSolutionPreview } from './solution-view.jsx';
import { makeShortId } from '../utils.jsx';

/* Создать решение — single-window flow.
   Слева/в центре — превью результата, справа — чат с ботом.
   Никаких степов и параметрических блоков: всё уточняется текстом.
   Bot пишет текстом всё, включая «Workspace распознал», источники, память
   и опции расписания. Пользователь отвечает в текстовом инпуте. */

const KIND_LABEL = {
  dash: 'Дашборд',
  alert: 'Алерт',
  command: 'Команда',
};

function SectionCreate({ setRoute, tweak, kind, setKind, prefill, clearPrefill, startNewChat, openChatHistory, primaryAgentName }) {
  const botName = primaryAgentName || 'OpenClaw';
  const isEdit = !!prefill;
  const editVersion = prefill?.fromVersion;
  const nextVersion = isEdit ? editVersion + 1 : 1;
  // Уникальный id решения: существующий — при редактировании, новый — при создании.
  const solId = React.useMemo(
    () => (isEdit ? (OESDATA.solutions.find((s) => s.id === prefill.solutionId)?.shortId || '—') : makeShortId()),
    [isEdit, prefill?.solutionId]
  );

  const [name, setName] = React.useState(isEdit ? prefill.name : defaultNameFor(kind));
  React.useEffect(() => {
    setName(isEdit ? prefill.name : defaultNameFor(kind));
    /* eslint-disable-next-line */
  }, [kind, prefill?.solutionId]);

  // Scripted dialogue
  const script = React.useMemo(
    () => (isEdit ? buildEditScript(prefill) : buildScript(kind)),
    [kind, isEdit, prefill?.solutionId]
  );
  const [revealed, setRevealed] = React.useState(2);
  const [draft, setDraft] = React.useState('');
  // In edit mode the preview is "ready" immediately — we already have a v.N preview
  const [previewState, setPreviewState] = React.useState(isEdit ? 'ready' : 'idle');
  const scrollRef = React.useRef(null);

  // Reset internal state when prefill / kind changes
  React.useEffect(() => {
    setRevealed(2);
    setPreviewState(isEdit ? 'ready' : 'idle');
    /* eslint-disable-next-line */
  }, [kind, prefill?.solutionId]);

  // Reveal script entries every ~1.3s
  React.useEffect(() => {
    if (revealed >= script.length) return;
    const t = setTimeout(() => setRevealed(r => r + 1), 1300);
    return () => clearTimeout(t);
  }, [revealed, script.length]);

  // In create mode, watch for "generating" cue to flip preview state
  React.useEffect(() => {
    if (isEdit) return;
    const seen = script.slice(0, revealed);
    if (seen.some(m => m.cue === 'generating') && previewState === 'idle') {
      setPreviewState('generating');
      setTimeout(() => setPreviewState('ready'), 2800);
    }
  }, [revealed, script, previewState, isEdit]);

  // autoscroll chat
  React.useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [revealed, previewState]);

  const sendDraft = () => {
    if (!draft.trim()) return;
    setDraft('');
    setRevealed(r => Math.min(script.length, r + 1));
  };

  const reset = () => {
    setKind(kind);
    setName(isEdit ? prefill.name : defaultNameFor(kind));
    setRevealed(2);
    setPreviewState(isEdit ? 'ready' : 'idle');
  };

  const onPublish = () => {
    window.notify && window.notify({
      title: isEdit ? `Опубликовано · v${nextVersion}` : 'Решение опубликовано',
      body: name,
      kind: 'success',
    });
    clearPrefill && clearPrefill();
    setRoute('solutions');
  };

  const onNewChat = () => { clearPrefill && clearPrefill(); startNewChat && startNewChat(); };
  const onOpenHistory = () => openChatHistory && openChatHistory();

  return (
    <div className="create-shell fade-up">
      <CreateHeader
        name={name} setName={setName} kind={kind} solId={solId}
        previewState={previewState}
        onPublish={onPublish} onReset={reset}
        isEdit={isEdit} editVersion={editVersion} nextVersion={nextVersion}
        onNewChat={onNewChat} onOpenHistory={onOpenHistory} />

      <div className="create-shell-body">
        <div className="create-center">
          <PreviewPane state={previewState} kind={kind} name={name} prefill={prefill} botName={botName} />
        </div>
        <div className="create-chat">
          <div ref={scrollRef} className="scroll-y" style={{ flex: 1, padding: '18px 18px 8px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {script.slice(0, revealed).map((m, i) => <ChatBubble key={i} m={m} botName={botName} />)}
            {revealed < script.length && <TypingBubble />}
          </div>
          <CreateChatComposer
            draft={draft} setDraft={setDraft} onSend={sendDraft}
            disabled={previewState === 'generating'}
            placeholder={previewState === 'generating' ? `${botName} собирает превью…` : (isEdit ? `Опишите, что изменить — ${botName} внесёт правки` : 'Ответьте текстом — например, «период 30 смен, порог 90%»')} />
        </div>
      </div>
    </div>
  );
}

/* Composer used inside the edit/create chat panel — same auto-grow textarea as the Chat section. */
function CreateChatComposer({ draft, setDraft, onSend, disabled, placeholder }) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const ta = ref.current; if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 310) + 'px';
  }, [draft]);
  return (
    <div style={{ padding: 14, borderTop: '0.5px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, padding: 10, borderRadius: 8, background: 'var(--surface-2)', border: '0.5px solid var(--border)' }}>
        <textarea
          ref={ref}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend(); } }}
          disabled={disabled}
          placeholder={placeholder}
          rows={1}
          style={{ flex: 1, background: 'transparent', border: 0, outline: 0, resize: 'none', fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--fg)', minHeight: 22, maxHeight: 310, lineHeight: 1.5, overflowY: 'auto' }} />
        <button className="icon-btn"
          style={{ width: 30, height: 30, background: 'var(--teal-400)', color: 'var(--fg-on-teal)', borderColor: 'var(--teal-400)', opacity: disabled || !draft.trim() ? 0.5 : 1 }}
          disabled={disabled || !draft.trim()} onClick={onSend} title="Отправить">
          <IconSend size={13} />
        </button>
      </div>
    </div>
  );
}

/* — Header with editable title — */
function CreateHeader({ name, setName, kind, solId, previewState, onPublish, onReset, isEdit, editVersion, nextVersion, onNewChat, onOpenHistory }) {
  const verLabel = isEdit ? `v${editVersion} → v${nextVersion}` : 'v1';
  const publishLabel = isEdit ? `Опубликовать v${nextVersion}` : 'Опубликовать';
  const statusLabel = isEdit
    ? (previewState === 'generating' ? 'ПЕРЕСБОРКА…' : 'ИЗМЕНЕНИЕ ВЕРСИИ')
    : (previewState === 'ready' ? 'ПРЕВЬЮ ГОТОВО' : previewState === 'generating' ? 'СБОРКА…' : 'УТОЧНЕНИЕ');
  const statusColor = previewState === 'ready' ? 'var(--teal-400)' : (previewState === 'generating' ? 'var(--warn-orange)' : 'var(--fg-muted)');
  return (
    <div className="create-shell-head">
      <div className="create-shell-head-row">
        <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 20 }}>
          <EditableTitle value={name} onChange={setName} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-muted)', letterSpacing: '0.04em', flexShrink: 0, marginLeft: 4 }}>id {solId}</span>
        </div>
        <button className="btn btn-neutral btn-sm" onClick={onOpenHistory} title="История чатов">
          <IconClock size={11} /> История
        </button>
        <button className="btn btn-neutral btn-sm" onClick={onNewChat} title="Новый чат">
          <IconPlus size={11} /> Новый чат
        </button>
        <button className="btn btn-neutral btn-sm" onClick={onReset} title="Сбросить и начать заново"><IconRefresh size={11} /></button>
        <button className="btn btn-primary btn-sm" disabled={previewState !== 'ready'} onClick={onPublish}><IconCheck size={11} /> {publishLabel}</button>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <KindChip kind={kind} />
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          fontFamily: 'var(--font-mono)', fontSize: 11,
          padding: '3px 8px', borderRadius: 4,
          background: 'var(--teal-dim)',
          border: '0.5px solid var(--border-strong)',
          color: 'var(--teal-400)',
        }}>
          <IconGitBranch size={10} /> {verLabel}
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: statusColor, letterSpacing: '0.10em', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 6, height: 6, borderRadius: 999, background: statusColor }} />
          {statusLabel}
        </span>
      </div>
    </div>
  );
}

/* — Inline-editable title with hover state — */
function EditableTitle({ value, onChange }) {
  const [editing, setEditing] = React.useState(false);
  const inputRef = React.useRef(null);
  React.useEffect(() => { if (editing && inputRef.current) { inputRef.current.focus(); inputRef.current.select(); } }, [editing]);
  const commit = () => setEditing(false);
  return (
    <div className={`editable-title ${editing ? 'editing' : ''}`} onClick={() => !editing && setEditing(true)} style={{ minWidth: 0 }}>
      {editing ? (
        <input
          ref={inputRef}
          value={value}
          onChange={e => onChange(e.target.value)}
          onBlur={commit}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === 'Escape') commit(); }}
          style={{ fontFamily: 'var(--font-sans)', fontSize: 18, fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--fg)' }}
        />
      ) : (
        <>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 18, fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--fg)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</span>
          <IconEdit size={12} className="edit-hint" />
        </>
      )}
    </div>
  );
}

/* — Preview pane (states: idle/generating/ready) —
   In edit mode (prefill present), the "ready" preview shows the live dashboard for
   the existing solution rather than the generic kind-based preview. */
function PreviewPane({ state, kind, name, prefill, botName }) {
  if (state === 'idle') {
    const Icon = kind === 'dash' ? IconBarChart : kind === 'alert' ? IconAlertCircle : IconZap;
    const sub = kind === 'dash'
      ? 'Графики и таблицы соберутся в этой области по мере уточнения задачи в чате справа.'
      : kind === 'alert'
        ? 'Шаблон уведомления и параметры срабатывания появятся здесь.'
        : 'Описание команды, расписание и каналы появятся здесь.';
    return (
      <div style={{
        minHeight: 480,
        border: '0.5px dashed var(--border-strong)', borderRadius: 'var(--r-lg)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: 14, color: 'var(--fg-muted)', textAlign: 'center', padding: '48px 32px 32px',
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: 'var(--r-xl)',
          background: 'var(--surface)', border: '0.5px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--teal-400)',
        }}>
          <Icon size={26} />
        </div>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 500, color: 'var(--fg)' }}>
          Превью появится здесь
        </div>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, maxWidth: 460, lineHeight: 1.6 }}>
          {sub}
        </div>
        {/* Skeleton-наброски того, как разлинуется область, когда чат соберёт превью */}
        <div style={{ width: '100%', maxWidth: 720, marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            <div className="skeleton" style={{ height: 56 }} />
            <div className="skeleton" style={{ height: 56 }} />
            <div className="skeleton" style={{ height: 56 }} />
            <div className="skeleton" style={{ height: 56 }} />
          </div>
          <div className="skeleton" style={{ height: 140 }} />
          <div className="skeleton" style={{ height: 80 }} />
        </div>
      </div>
    );
  }
  if (state === 'generating') {
    return <GeneratingPlaceholder botName={botName} />;
  }
  // ready — in edit mode render the actual dashboard for the source solution
  // (same as solution-view: known IDs → Dash component, otherwise a generic placeholder).
  if (prefill && prefill.solutionId) {
    const id = prefill.solutionId;
    if (id === 'sol-01') return <DashVolumePerShift />;
    if (id === 'sol-04') return <DashCycleRating />;
    if (id === 'sol-06') return <DashBudget />;
    if (id === 'sol-08') return <DashLossesMonitor />;
    const sol = OESDATA.solutions.find((s) => s.id === id);
    if (sol) return <GenericSolutionPreview sol={sol} />;
  }
  if (kind === 'dash') return <DashPreview name={name} />;
  if (kind === 'alert') return <AlertPreview name={name} />;
  if (kind === 'command') return <CommandPreview name={name} />;
  return null;
}

function GeneratingPlaceholder({ botName }) {
  const agent = botName || 'OpenClaw';
  const stages = [
    'Извлекаю схемы источников',
    'Анонимизирую чувствительные поля',
    `Подбираю шаблон ${agent}`,
    'Генерирую визуализации',
  ];
  const [done, setDone] = React.useState(0);
  React.useEffect(() => {
    const id = setInterval(() => setDone(d => Math.min(d + 1, stages.length - 1)), 600);
    return () => clearInterval(id);
  }, []);
  return (
    <div style={{
      height: '100%', minHeight: 480,
      border: '0.5px solid var(--border)', borderRadius: 'var(--r-lg)',
      background: 'var(--surface)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32,
    }}>
      <div style={{ maxWidth: 420, width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
          <span className="spin" style={{ width: 22, height: 22, borderRadius: 999, border: '2px solid var(--border)', borderTopColor: 'var(--teal-400)' }} />
          <div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 500, color: 'var(--fg)' }}>Собираю превью</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-muted)', marginTop: 2, letterSpacing: '0.06em' }}>≈ 15–30 секунд</div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {stages.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {i < done && <span style={{ width: 16, height: 16, borderRadius: 999, background: 'var(--teal-dim)', border: '0.5px solid var(--border-strong)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--teal-400)' }}><IconCheck size={9} /></span>}
              {i === done && <span className="spin" style={{ width: 16, height: 16, borderRadius: 999, border: '1.5px solid var(--border)', borderTopColor: 'var(--teal-400)' }} />}
              {i > done && <span style={{ width: 16, height: 16, borderRadius: 999, border: '0.5px solid var(--border)' }} />}
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: i <= done ? 'var(--fg)' : 'var(--fg-muted)' }}>{s}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* Preview content by kind */
function DashPreview({ name }) {
  return (
    <div style={{ background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
      <div style={{ padding: '14px 22px', borderBottom: '0.5px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 500, color: 'var(--fg)' }}>{name}</span>
        <span style={{ flex: 1 }} />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-muted)' }}>превью · 18.05.2026, 16:54</span>
      </div>
      <div style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0, border: '0.5px solid var(--border)', borderRadius: 6, overflow: 'hidden' }}>
          <PreviewKpiTile label="Объём за смену" value="374.1" unit="тыс.м³" tone="neutral" />
          <PreviewKpiTile label="Бюджет смены" value="277" unit="тыс.м³" tone="warn-orange" />
          <PreviewKpiTile label="Разница" value="+97.1" tone="pos" sub="+35.1%" />
          <PreviewKpiTile label="КТ (бюджет 148)" value="209.1" tone="info" />
        </div>
        <div style={{ background: 'var(--bg-elev)', border: '0.5px solid var(--border)', borderRadius: 6, padding: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <IconTrendingUp size={12} style={{ color: 'var(--pos)' }} />
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 500, color: 'var(--fg)' }}>Накопительный объём — план / факт</span>
            <span style={{ flex: 1 }} />
            <Legend items={[{ c: 'var(--pos)', l: 'Факт' }, { c: 'var(--info)', l: 'План (пункт.)' }]} />
          </div>
          <PreviewChartLine series={OESDATA.previewSeries} height={180} />
        </div>
        <div style={{ background: 'var(--bg-elev)', border: '0.5px solid var(--border)', borderRadius: 6, padding: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <IconTriangle size={12} style={{ color: 'var(--neg)' }} />
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 500, color: 'var(--fg)' }}>Отклонение от плана за смену</span>
            <span style={{ flex: 1 }} />
            <Legend items={[{ c: 'var(--pos)', l: 'Перевыполнение' }, { c: 'var(--neg)', l: 'Просадка' }]} />
          </div>
          <PreviewChartBars series={OESDATA.previewSeries} height={100} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <IconPickaxe size={12} style={{ color: 'var(--fg-muted)' }} />
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 500, color: 'var(--fg)' }}>Топ ЭВ КТ — последняя смена</span>
            <span style={{ flex: 1 }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--neg)', letterSpacing: '0.06em' }}>● 2 ЭВ ниже 75%</span>
          </div>
          <div style={{ background: 'var(--bg-elev)', border: '0.5px solid var(--border)', borderRadius: 6, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1.2fr',
              padding: '7px 12px', background: 'var(--surface-2)',
              fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--fg-muted)' }}>
              <span>ЭВ</span><span style={{textAlign:'right'}}>Объём, тыс.м³</span><span style={{textAlign:'right'}}>КИО, %</span><span style={{textAlign:'right'}}>Цикл, мин</span><span style={{textAlign:'right'}}>Δ от плана</span>
            </div>
            {OESDATA.previewTable.map((r, i) => {
              const below = r.kio < 75;
              return (
                <div key={i} style={{
                  display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1.2fr',
                  padding: '6px 12px',
                  borderTop: '0.5px solid var(--border)',
                  background: below ? 'rgba(224,82,82,0.04)' : 'transparent',
                }}>
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--fg)' }}>{r.ev}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg)', textAlign: 'right' }}>{r.vol.toFixed(1)}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: r.kio < 75 ? 'var(--neg)' : 'var(--fg)', textAlign: 'right' }}>{r.kio.toFixed(1)}%</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg)', textAlign: 'right' }}>{r.cycle.toFixed(1)}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: r.delta >= 0 ? 'var(--pos)' : 'var(--neg)', textAlign: 'right' }}>
                    {r.delta >= 0 ? '+' : ''}{r.delta.toFixed(1)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function AgentPreview({ name }) {
  return (
    <div style={{ background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: 'var(--r-lg)', padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ width: 38, height: 38, borderRadius: 'var(--r-md)', background: 'var(--teal-dim)', border: '0.5px solid var(--border-strong)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--teal-400)' }}>
          <IconBrain size={18} />
        </span>
        <div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 500, color: 'var(--fg)' }}>{name}</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-muted)', letterSpacing: '0.06em', marginTop: 3 }}>Q&A · 412 PDF/DOC из базы знаний</div>
        </div>
      </div>
      <div style={{ background: 'var(--bg-elev)', border: '0.5px solid var(--border)', borderRadius: 6, padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-muted)', letterSpacing: '0.10em', textTransform: 'uppercase' }}>Пример диалога</div>
        <div style={{ alignSelf: 'flex-end', maxWidth: '78%', padding: '10px 14px', borderRadius: 12, background: 'var(--teal-dim)', border: '0.5px solid var(--border-strong)', fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--fg)' }}>
          Каков регламент ТО экскаваторов категории КТ при наработке 500 м/ч?
        </div>
        <div style={{ alignSelf: 'flex-start', maxWidth: '88%', padding: '12px 14px', borderRadius: 12, background: 'var(--surface)', border: '0.5px solid var(--border)', fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--fg)', lineHeight: 1.55 }}>
          Согласно РД-ВГК-04.12 (раздел 4.2), при наработке 500 м/ч проводится плановое ТО-2: замена масла в редукторе поворота, проверка тросов и натяжения гусениц, дефектоскопия зубьев ковша.
          <div style={{ marginTop: 8, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--teal-400)', letterSpacing: '0.06em' }}>📎 РД-ВГК-04.12, стр. 18–22</div>
        </div>
      </div>
    </div>
  );
}

function AlertPreview({ name }) {
  return (
    <div style={{ background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: 'var(--r-lg)', padding: 22, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ width: 38, height: 38, borderRadius: 'var(--r-md)', background: 'rgba(196,124,50,0.12)', border: '0.5px solid rgba(196,124,50,0.30)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--warn-orange)' }}>
          <IconAlertCircle size={18} />
        </span>
        <div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 500, color: 'var(--fg)' }}>{name}</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-muted)', letterSpacing: '0.06em', marginTop: 3 }}>срабатывает при КИО &lt; 75% на ЭВ КТ</div>
        </div>
      </div>
      <div style={{ background: 'var(--bg-elev)', border: '0.5px solid var(--border)', borderRadius: 6, padding: 18 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-muted)', letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 12 }}>Превью уведомления в Teams</div>
        <div style={{ borderLeft: '2px solid var(--warn-orange)', paddingLeft: 14 }}>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 500, color: 'var(--fg)', marginBottom: 6 }}>⚠ Просадка КИО · EX 3600 D /90</div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--fg-muted)', lineHeight: 1.6 }}>
            КИО упал до <span style={{ color: 'var(--neg)', fontFamily: 'var(--font-mono)' }}>71.4%</span> в ночную смену 18.05.<br/>
            Цикл: <span style={{ fontFamily: 'var(--font-mono)' }}>3.9 мин</span> (норма ≤3.5).<br/>
            Уч. 4 · Б75306 · смена 20:00–08:00.
          </div>
          <div style={{ marginTop: 8, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-muted)' }}>18.05.2026, 02:08 · OESxBot</div>
        </div>
      </div>
    </div>
  );
}

function CommandPreview({ name }) {
  return (
    <div style={{ background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: 'var(--r-lg)', padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ width: 38, height: 38, borderRadius: 'var(--r-md)', background: 'rgba(200,160,64,0.12)', border: '0.5px solid rgba(200,160,64,0.30)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--warn)' }}>
          <IconZap size={18} />
        </span>
        <div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 500, color: 'var(--fg)' }}>{name}</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-muted)', letterSpacing: '0.06em', marginTop: 3 }}>Ежедневно · 06:30 · по будням</div>
        </div>
      </div>
      <div style={{ background: 'var(--bg-elev)', border: '0.5px solid var(--border)', borderRadius: 6, padding: 18 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-muted)', letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 10 }}>Превью письма</div>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--fg)', fontWeight: 500, marginBottom: 12 }}>📨 Утренний дайджест по парку — 18.05.2026</div>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--fg-muted)', lineHeight: 1.7 }}>
          • Активные ЭВ: <span style={{ color: 'var(--fg)', fontFamily: 'var(--font-mono)' }}>42 / 48</span><br/>
          • Простои &gt; 30 мин: <span style={{ color: 'var(--warn-orange)', fontFamily: 'var(--font-mono)' }}>3</span> (R 9250 /5, EX 3600 E /27, WK 20 /98)<br/>
          • Отклонение от плана за вчера: <span style={{ color: 'var(--pos)', fontFamily: 'var(--font-mono)' }}>+12.4%</span><br/>
          • Запланированное ТО на сегодня: <span style={{ color: 'var(--fg)', fontFamily: 'var(--font-mono)' }}>2 ЭВ</span> (PC 4000 E /38, R 9400 E /7)
        </div>
      </div>
    </div>
  );
}

function PreviewKpiTile({ label, value, unit, tone, sub }) {
  const TONE = { pos: 'var(--pos)', neg: 'var(--neg)', warn: 'var(--warn)', 'warn-orange': 'var(--warn-orange)', info: 'var(--info)', neutral: 'var(--fg)' };
  const c = TONE[tone] || TONE.neutral;
  return (
    <div style={{ padding: '14px 16px', borderRight: '0.5px solid var(--border)' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 8 }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 24, color: c, letterSpacing: '-0.03em', lineHeight: 1 }}>
        {value}{unit && <span style={{ fontSize: 13, opacity: 0.7, marginLeft: 4 }}>{unit}</span>}
      </div>
      {sub && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: c, marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

/* — Chat bubble — */
function ChatBubble({ m, botName }) {
  if (m.role === 'user') {
    return <div className="bubble bubble-user" style={{ maxWidth: '90%' }}>{m.text}</div>;
  }
  return (
    <div className="bubble bubble-bot" style={{ maxWidth: '95%' }}>
      <div className="who">
        <CubeLogo size={11} color="var(--teal-400)" /> {botName || 'OpenClaw'}
      </div>
      <div style={{ whiteSpace: 'pre-wrap' }}>{m.text}</div>
    </div>
  );
}

function TypingBubble() {
  return (
    <div className="bubble bubble-bot" style={{ alignSelf: 'flex-start', padding: '10px 14px' }}>
      <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}>
        {[0,1,2].map(i => (
          <span key={i} className="pulse" style={{
            width: 6, height: 6, borderRadius: 999, background: 'var(--fg-muted)',
            animationDelay: `${i * 0.2}s`,
          }} />
        ))}
      </span>
    </div>
  );
}

function defaultNameFor(kind) {
  return {
    dash: 'Объём вскрыши — экскаваторы КТ',
    alert: 'Алерт — просадка КИО ниже 75%',
    command: 'Утренний дайджест по парку',
  }[kind] || 'Новое решение';
}

/* — Scripted dialogues per kind — Workspace «писатель», не toggle —
   first 2 entries are visible immediately; rest reveal over time. */
function buildEditScript(prefill) {
  const { name, fromVersion } = prefill || {};
  return [
    { role: 'bot', text: `Открыта версия v${fromVersion} решения «${name}» — превью слева. Что нужно изменить?` },
    { role: 'bot', text: 'Опишите правки текстом: например, «добавь разбивку по сменам», «измени порог КИО на 70%», «переименуй в …», «убери таблицу СТ». Когда соберём изменения — опубликую новой версией.' },
    { role: 'user', text: '— ждём ваших инструкций —' },
    { role: 'bot', text: 'Принято. Пересоберу превью с учётом правок и покажу результат здесь же. После публикации появится отдельная версия в истории.' },
  ];
}

function buildScript(kind) {
  if (kind === 'command') {
    return [
      { role: 'bot', text: 'Здравствуйте. Какую команду собираем? Опишите, что она должна делать и как запускаться — по расписанию или по запросу.' },
      { role: 'user', text: 'Утренний дайджест по парку: каждое утро присылать сводку в почту.' },
      { role: 'bot', text: 'Распознал контекст: ежедневная сводка по парку (активные ЭВ, простои > 30 мин, отклонение от плана, ТО на сегодня). Источники — oes_dispatch.equipment + oes_dispatch.shift_kpis. Канал — Email на ваш SSO-адрес.' },
      { role: 'bot', text: 'Команду также можно будет вызвать вручную из чата. Применил память: формат — Geist Mono + цветовые пороги.' },
      { role: 'bot', text: 'Уточните текстом: время запуска по расписанию — 06:30 или другое? Только будни или включая выходные?' },
      { role: 'user', text: '06:30, только будни.' },
      { role: 'bot', cue: 'generating', text: 'Принято. Регистрирую команду, собираю шаблон письма и тестовый прогон на ваш адрес.' },
      { role: 'bot', text: 'Готово. Превью — в центре. Опубликую как v1: расписание пн–пт 06:30 МСК + вызов из чата.' },
    ];
  }
  if (kind === 'alert') {
    return [
      { role: 'bot', text: 'Какой алерт настраиваем? Опишите условие срабатывания, канал отправки и кого уведомлять.' },
      { role: 'user', text: 'Алерт при падении КИО ниже 75% на любом ЭВ категории КТ. В Teams.' },
      { role: 'bot', text: 'Распознал контекст: пороговый алерт по oes_dispatch.shift_kpis · КИО < 75% · фильтр по категории КТ (≥22 м³). Канал — Microsoft Teams · ваш привязанный аккаунт.' },
      { role: 'bot', text: 'Применил память: порог < 75% уже фигурировал в ваших предпочтениях для КТ. Учёл, что нужен дебаунс — иначе при дёрганых значениях прилетит шквал уведомлений.' },
      { role: 'bot', text: 'Уточните текстом: длительность для срабатывания — 2 часа подряд (как в вашем прошлом алерте) или иначе? И нужно ли дублировать в почту, если в Teams нет ответа в течение 30 минут?' },
      { role: 'user', text: '2 часа. Дублирование в почту — да.' },
      { role: 'bot', cue: 'generating', text: 'Принято. Собираю шаблон уведомления, проверяю на исторических данных, чтобы не было ложных срабатываний.' },
      { role: 'bot', text: 'Готово. Превью уведомления — в центре. Опубликую как v1, расписание — постоянное наблюдение, дебаунс 2 ч, эскалация в почту через 30 мин.' },
    ];
  }
  // dashboard (default)
  return [
    { role: 'bot', text: 'Здравствуйте. Какой дашборд собираем? Опишите задачу свободным текстом — что хотите видеть и за какой период.' },
    { role: 'user', text: 'Покажи мониторинг вскрыши экскаваторами КТ за последние 30 смен. Хочу видеть отклонение от плана и проседающие ЭВ.' },
    { role: 'bot', text: 'Понял. Распознал контекст: time-series по объёму вскрыши, группировка по парку КТ (≥22 м³), сравнение план / факт, выделение проседающих ЭВ. Источники подобрал — oes_dispatch.cycles и oes_dispatch.shift_kpis.' },
    { role: 'bot', text: 'Применил вашу память: формат — Geist Mono + цветовые пороги; пороги для КТ — КИО < 75% критично, цикл > 3.5 мин предупреждение; категорию КТ беру автоматически как ≥22 м³.' },
    { role: 'bot', text: 'Уточните пару моментов текстом, пожалуйста.\n\n1. Период — 7, 30 или 90 смен? Или квартал?\n2. Какие смены учитывать — все, только ночные или только дневные?\n3. Порог выделения проседающих ЭВ — 85%, 90% или 95% от плана?' },
    { role: 'user', text: '30 смен, все смены, порог 90%.' },
    { role: 'bot', text: 'Принято: 30 смен × все × 90%. Последний вопрос — как часто обновлять дашборд: каждую смену, каждый час или только вручную?' },
    { role: 'user', text: 'Каждую смену.' },
    { role: 'bot', cue: 'generating', text: 'Понял. Собираю превью — извлекаю циклы за период, считаю накопительные суммы и отклонения, проверяю покрытие по бригадам Б75306 / Б75131.' },
    { role: 'bot', text: 'Готово. Превью открыто в центре. Когда нажмёте «Опубликовать», дашборд появится в «Мои решения» как v1 и будет обновляться каждую смену.' },
  ];
}

export { SectionCreate };
