import React from 'react';
import {
  CubeLogo, IconClock, IconPlus, IconCheck, IconEdit, IconArrowRight, IconExpand,
  IconTrendingUp, IconTriangle, IconAlertCircle, IconZap, IconGitBranch, IconX,
  IconPaperclip, IconSend, IconChevronDown, IconMessageSquare, IconSearch, IconBarChart,
} from '../icons.jsx';
import { KindChip, Chip, PreviewChartLine, PreviewChartBars } from '../parts.jsx';
import { OESDATA } from '../data.jsx';
import { currentMe } from '../user.jsx';

/* Чат — единая стартовая вкладка.
   Состояния:
   - empty: центрированное приветствие + поле ввода + «Создать решение»
   - chat: переписка с ботом
   - flow: запущен флоу создания решения (уточняющие вопросы → превью)
   Кнопки сверху: «История · N» (выезжающая панель), «+ Новый чат». */

function SectionChat({ setRoute, openCreate, openCreatePage, openSolution, tweak, trigger, clearTrigger, impersonating }) {
  const me = currentMe(tweak.userRole, impersonating);

  /* — История диалогов (мок) — */
  const initialHistory = React.useMemo(() => makeChatHistory(impersonating, me), [impersonating?.id]);
  const [history, setHistory] = React.useState(initialHistory);
  const [activeChatId, setActiveChatId] = React.useState(null); // null = новый чат
  const [historyOpen, setHistoryOpen] = React.useState(false);
  const [messages, setMessages] = React.useState([]); // []  = empty/welcome
  const [draft, setDraft] = React.useState('');
  const [flow, setFlow] = React.useState(null); // { kind, step, params, previewState, expanded }
  const [chatName, setChatName] = React.useState('Новый чат');
  const [titleEditTick, setTitleEditTick] = React.useState(0); // bump → header opens the rename editor
  const scrollRef = React.useRef(null);
  const composerRef = React.useRef(null);

  // Reset to a fresh chat when entering for a new conversation
  const newChat = React.useCallback((opts = {}) => {
    setActiveChatId(null);
    setMessages([]);
    setDraft('');
    setFlow(null);
    setHistoryOpen(false);
    setChatName('Новый чат');
    if (opts.kind) startCreateFlow(opts.kind);
    // eslint-disable-next-line
  }, []);

  // Handle external triggers (sidebar «Создать решение», «Новый чат» / «История»
  // from edit page, and «Редактировать» / «Форкнуть в чат» from solution view)
  React.useEffect(() => {
    if (!trigger) return;
    if (trigger.mode === 'create') {
      newChat({ kind: trigger.kind || 'dash' });
    } else if (trigger.mode === 'new') {
      newChat();
    } else if (trigger.mode === 'history') {
      setHistoryOpen(true);
    } else if (trigger.mode === 'editSol') {
      startEditFromSolution(trigger.solutionId, trigger.fromVersion, trigger.intent);
    }
    clearTrigger && clearTrigger();
    // eslint-disable-next-line
  }, [trigger]);

  // Autoscroll — only when there are real messages, never for the empty welcome screen
  React.useEffect(() => {
    if (messages.length === 0) return;
    if (scrollRef.current) {
      requestAnimationFrame(() => {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      });
    }
  }, [messages, flow?.step, flow?.previewState]);

  function pushMessage(m) {
    setMessages((prev) => [...prev, m]);
  }
  function pushBot(text, extras = {}) {
    pushMessage({ role: 'bot', text, ...extras });
  }
  function pushUser(text) {
    pushMessage({ role: 'user', text });
  }

  /* — «Редактировать» / «Форкнуть в чат» — открывается новый чат с превью и
     вопросом «что хотим изменить?» */
  function startEditFromSolution(solutionId, fromVersion, intent) {
    const sol = OESDATA.solutions.find((s) => s.id === solutionId);
    if (!sol) return;
    const v = fromVersion || sol.version;
    const isFork = intent === 'fork';
    setActiveChatId(null);
    setHistoryOpen(false);
    setDraft('');
    setChatName(sol.name);
    setFlow({
      kind: sol.kind,
      step: 0,
      params: { sourceSolutionId: sol.id, sourceVersion: v, mode: isFork ? 'fork' : 'edit' },
      previewState: 'ready',
      expanded: false,
    });
    setMessages([
      { role: 'system', text: `${isFork ? 'Форк' : 'Редактирование'} · «${sol.name}» · v${v} · ${new Date().toLocaleString('ru', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}` },
      { role: 'bot', skill: `${isFork ? 'FORK' : 'EDIT'}-${sol.kind.toUpperCase()}`,
        text: isFork
          ? `Сделал копию «${sol.name}» (v${v}) у вас в OpenClaw. Что хотим изменить?`
          : `Открыл «${sol.name}» (v${v}) для правок. Что хотим изменить?`,
        preview: true,
      },
    ]);
  }

  /* — Запуск флоу создания решения — */
  function startCreateFlow(kind) {
    const k = KIND_INFO[kind];
    setChatName(defaultSolutionName(kind));
    setTitleEditTick((t) => t + 1); // открыть редактор имени в шапке
    setFlow({ kind, step: 0, params: {}, previewState: 'asking', expanded: false });
    setMessages([
      { role: 'system', text: `Создание решения «${k.label}» · ${new Date().toLocaleString('ru', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}` },
      { role: 'user', text: `Хочу создать ${k.userLabel}` },
      { role: 'bot', skill: `BUILD-${kind.toUpperCase()}`, text: k.welcome, suggestions: k.steps[0].suggestions, flowQuestion: 0 },
    ]);
  }

  function advanceFlowStep(answer) {
    if (!flow) return;
    const k = KIND_INFO[flow.kind];
    const currentStep = k.steps[flow.step];
    const nextIdx = flow.step + 1;
    const params = { ...flow.params, [currentStep.key]: answer };
    pushUser(answer);

    if (nextIdx < k.steps.length) {
      const nextStep = k.steps[nextIdx];
      setFlow({ ...flow, step: nextIdx, params });
      setTimeout(() => {
        pushBot(nextStep.question, { skill: `BUILD-${flow.kind.toUpperCase()}`, suggestions: nextStep.suggestions, flowQuestion: nextIdx });
      }, 400);
    } else {
      // All questions answered → start building preview
      setFlow({ ...flow, step: nextIdx, params, previewState: 'generating' });
      setTimeout(() => {
        pushBot('Понял. Собираю превью…', { skill: `BUILD-${flow.kind.toUpperCase()}`, generating: true });
      }, 350);
      setTimeout(() => {
        setFlow((prev) => prev ? { ...prev, previewState: 'ready' } : null);
        pushBot('Готово. Превью ниже — можно развернуть на весь экран. Опубликовать сейчас или ещё доработать?', {
          skill: `BUILD-${flow.kind.toUpperCase()}`,
          preview: true,
          decision: true,
        });
      }, 2800);
    }
  }

  function sendDraft() {
    const text = draft.trim();
    if (!text) return;
    setDraft('');
    if (flow && flow.previewState === 'asking') {
      advanceFlowStep(text);
      return;
    }
    if (flow && flow.previewState === 'ready') {
      // Доработка после превью
      pushUser(text);
      setTimeout(() => {
        pushBot('Понял правки. Перестраиваю превью…', { skill: 'REFINE', generating: true });
      }, 350);
      setFlow((prev) => prev ? { ...prev, previewState: 'generating' } : null);
      setTimeout(() => {
        setFlow((prev) => prev ? { ...prev, previewState: 'ready' } : null);
        pushBot('Готово · обновлённая версия. Опубликовать или продолжить?', {
          skill: 'REFINE', preview: true, decision: true,
        });
      }, 2400);
      return;
    }
    // Обычный чат — бот отвечает в духе ассистента
    pushUser(text);
    setTimeout(() => {
      pushBot(genericReply(text), { skill: 'OPENCLAW' });
    }, 500);
  }

  function publishPreview() {
    if (!flow) return;
    window.notify && window.notify({
      title: 'Решение опубликовано',
      body: chatName,
      kind: 'success',
    });
    pushMessage({ role: 'system', text: `«${chatName}» сохранено в раздел «Решения» · v1` });
    setFlow(null);
    // Сохраняем чат в историю
    setHistory((prev) => [{
      id: 'chat-' + Date.now(),
      title: chatName,
      preview: 'Опубликовано · готово к запуску',
      ts: 'только что',
      day: 'Сегодня',
      messages: [...messages],
      kind: flow.kind,
    }, ...prev]);
  }

  function continueRefining() {
    if (!flow) return;
    pushBot('Опишите, что изменить — OpenClaw внесёт правки.', { skill: 'REFINE' });
    if (composerRef.current) composerRef.current.focus();
  }

  function openInEditor() {
    openCreatePage && openCreatePage(flow.kind);
  }

  function loadHistoryChat(chat) {
    setActiveChatId(chat.id);
    setMessages(chat.messages || []);
    setFlow(null);
    setChatName(chat.title);
    setHistoryOpen(false);
  }

  const isEmpty = messages.length === 0 && !flow;

  const composer = (
    <ChatComposer
      ref={composerRef}
      draft={draft}
      setDraft={setDraft}
      onSend={sendDraft}
      onCreate={(k) => openCreate && openCreate(k)}
      flow={flow}
      hero={isEmpty}
      showCreate={isEmpty}
    />
  );

  return (
    <div className="chat-shell">
      <div className="chat-center">
        <ChatHeader
          name={chatName}
          onRename={setChatName}
          autoEditKey={titleEditTick}
          historyOpen={historyOpen}
          setHistoryOpen={setHistoryOpen}
          historyCount={history.length}
          onNewChat={() => newChat()} />

        {isEmpty ? (
          <div className="chat-hero">
            <div className="chat-hero-title">Чем я могу помочь?</div>
            <div className="chat-hero-box">{composer}</div>
          </div>
        ) : (
          <>
            <div className="chat-scroll scroll-y" ref={scrollRef}>
              <ChatMessages
                messages={messages}
                onSuggest={(s, qIdx) => {
                  if (!flow) return;
                  if (flow.previewState !== 'asking') return;
                  if (qIdx !== flow.step) return;
                  advanceFlowStep(s);
                }}
                flow={flow}
                name={chatName}
                onExpand={() => setFlow((prev) => prev ? { ...prev, expanded: true } : null)}
                onPublish={publishPreview}
                onRefine={continueRefining}
                onEditor={openInEditor} />
            </div>
            {composer}
          </>
        )}
      </div>

      {/* History drawer */}
      {historyOpen &&
        <ChatHistoryDrawer
          history={history}
          activeId={activeChatId}
          onPick={loadHistoryChat}
          onClose={() => setHistoryOpen(false)}
          onNewChat={() => newChat()} />
      }

      {/* Expanded preview overlay */}
      {flow && flow.expanded &&
        <PreviewOverlay
          flow={flow}
          name={chatName}
          onClose={() => setFlow((prev) => prev ? { ...prev, expanded: false } : null)}
          onPublish={publishPreview} />
      }
    </div>
  );
}

/* ─────────────────────────────────────────── */

/* Inline-editable chat title — click to rename, hover shows the affordance.
   Reuses the .editable-title styles; font size stays at the 14px header size. */
function EditableChatTitle({ value, onChange, autoEditKey }) {
  const [editing, setEditing] = React.useState(false);
  const inputRef = React.useRef(null);
  React.useEffect(() => { if (autoEditKey) setEditing(true); }, [autoEditKey]);
  React.useEffect(() => {
    if (editing && inputRef.current) { inputRef.current.focus(); inputRef.current.select(); }
  }, [editing]);
  const commit = () => setEditing(false);
  return (
    <div
      className={`editable-title ${editing ? 'editing' : ''}`}
      style={{ minWidth: 0, maxWidth: '100%' }}
      onClick={() => !editing && setEditing(true)}
      title="Переименовать чат">
      {editing ? (
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === 'Escape') commit(); }}
          style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 500, color: 'var(--fg)' }} />
      ) : (
        <>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 500, color: 'var(--fg)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</span>
          <IconEdit size={11} className="edit-hint" />
        </>
      )}
    </div>
  );
}

function ChatHeader({ name, onRename, autoEditKey, historyOpen, setHistoryOpen, historyCount, onNewChat }) {
  return (
    <div className="chat-header">
      <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center' }}>
        <EditableChatTitle value={name} onChange={onRename} autoEditKey={autoEditKey} />
      </div>
      <button
        className={`btn btn-neutral btn-sm ${historyOpen ? 'active' : ''}`}
        onClick={() => setHistoryOpen(!historyOpen)}
        title="История чатов">
        <IconClock size={11} /> История <span style={{ color: 'var(--fg-muted)', marginLeft: 2 }}>· {historyCount}</span>
      </button>
      <button className="btn btn-neutral btn-sm" onClick={onNewChat} title="Новый чат">
        <IconPlus size={11} /> Новый чат
      </button>
    </div>
  );
}

function ChatMessages({ messages, onSuggest, flow, name, onExpand, onPublish, onRefine, onEditor }) {
  return (
    <div className="chat-messages">
      {messages.map((m, i) => {
        if (m.role === 'system') return <div key={i} className="bubble bubble-system">{m.text}</div>;
        if (m.role === 'user') return <div key={i} className="bubble bubble-user">{m.text}</div>;
        return (
          <div key={i} className="bubble bubble-bot">
            <div className="who">
              <CubeLogo size={11} color="var(--teal-400)" /> OpenClaw
              {m.skill && <span style={{ color: 'var(--fg-muted)', marginLeft: 6, fontWeight: 400 }}>· {m.skill}</span>}
            </div>
            {m.generating ?
            <GeneratingInline /> :
            <div>{m.text}</div>}
            {m.suggestions && m.flowQuestion === flow?.step && flow?.previewState === 'asking' &&
            <div className="bubble-suggest-row">
                {m.suggestions.map((s, si) =>
              <button key={si} className="suggest-chip" onClick={() => onSuggest(s, m.flowQuestion)}>
                    {s}
                  </button>
              )}
              </div>
            }
            {m.preview && flow &&
            <InlinePreview flow={flow} name={name} onExpand={onExpand} />
            }
            {m.decision && flow && flow.previewState === 'ready' &&
            <div className="bubble-decision">
                <button className="btn btn-primary btn-sm" onClick={onPublish}><IconCheck size={11} /> Опубликовать</button>
                <button className="btn btn-warn btn-sm" onClick={onRefine}><IconEdit size={11} /> Продолжить править</button>
                <span style={{ flex: 1 }} />
                <button className="btn btn-neutral btn-sm" onClick={onEditor}>
                  Открыть в редакторе <IconArrowRight size={11} />
                </button>
              </div>
            }
          </div>);

      })}
    </div>);

}

function GeneratingInline() {
  const stages = [
  { label: 'Извлекаю схемы источников', done: true },
  { label: 'Анонимизирую чувствительные поля', done: true },
  { label: 'Подбираю шаблон OpenClaw', done: true },
  { label: 'Генерирую превью', done: false, active: true },
  { label: 'Регистрирую артефакт', done: false }];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginTop: 4 }}>
      {stages.map((s, i) =>
      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {s.done && <span style={{ width: 16, height: 16, borderRadius: 999, background: 'var(--teal-dim)', border: '0.5px solid var(--border-strong)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--teal-400)' }}><IconCheck size={9} /></span>}
          {s.active && <span className="spin" style={{ width: 16, height: 16, borderRadius: 999, border: '1.5px solid var(--border)', borderTopColor: 'var(--teal-400)' }} />}
          {!s.done && !s.active && <span style={{ width: 16, height: 16, borderRadius: 999, border: '0.5px solid var(--border)' }} />}
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: s.done || s.active ? 'var(--fg)' : 'var(--fg-muted)' }}>{s.label}</span>
          {s.active && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-muted)', marginLeft: 'auto' }}>≈ 14 с</span>}
        </div>
      )}
    </div>);

}

function InlinePreview({ flow, name, onExpand }) {
  return (
    <div className="inline-preview">
      <div className="inline-preview-head">
        <KindChip kind={flow.kind} />
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 500, color: 'var(--fg)' }}>{name}</span>
        <span style={{ flex: 1 }} />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--teal-400)', letterSpacing: '0.08em' }}>ПРЕВЬЮ · v1</span>
        <button className="icon-btn" style={{ width: 26, height: 26 }} title="Развернуть на весь экран" onClick={onExpand}>
          <IconExpand size={12} />
        </button>
      </div>
      <div className="inline-preview-body">
        <PreviewByKind kind={flow.kind} />
      </div>
    </div>);

}

function PreviewByKind({ kind, big }) {
  if (kind === 'dash') {
    return (
      <>
        <div style={{ background: 'var(--bg-elev)', border: '0.5px solid var(--border)', borderRadius: 'var(--r-md)', padding: big ? 18 : 12, marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <IconTrendingUp size={12} style={{ color: 'var(--pos)' }} />
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 500, color: 'var(--fg)' }}>Объём вскрыши — накопительно (тыс. м³)</span>
          </div>
          <PreviewChartLine series={OESDATA.previewSeries} height={big ? 260 : 180} />
        </div>
        <div style={{ background: 'var(--bg-elev)', border: '0.5px solid var(--border)', borderRadius: 'var(--r-md)', padding: big ? 18 : 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <IconTriangle size={12} style={{ color: 'var(--neg)' }} />
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 500, color: 'var(--fg)' }}>Отклонение от плана (тыс. м³)</span>
          </div>
          <PreviewChartBars series={OESDATA.previewSeries} height={big ? 140 : 90} />
        </div>
      </>);

  }
  if (kind === 'alert') {
    return (
      <div style={{ background: 'var(--bg-elev)', border: '0.5px solid var(--border)', borderRadius: 'var(--r-md)', padding: big ? 24 : 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(224,82,82,0.10)', border: '0.5px solid rgba(224,82,82,0.30)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--neg)' }}>
            <IconAlertCircle size={18} />
          </span>
          <div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 500, color: 'var(--fg)' }}>Просадка КИО — R 9250 /5</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--neg)', marginTop: 3 }}>КИО · 71.4% · ниже порога 75% более 2 ч</div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          <PrevField label="Канал" value="Teams + Email" />
          <PrevField label="Порог" value="< 75% · 2 ч" />
          <PrevField label="Окно" value="Только смена" />
          <PrevField label="ЭВ" value="Парк КТ" />
          <PrevField label="Получатели" value="Дьяконов, Степанов" />
          <PrevField label="Снузить" value="60 мин" />
        </div>
      </div>);

  }
  // command — вызываемая команда (расписание / по запросу)
  return (
    <div style={{ background: 'var(--bg-elev)', border: '0.5px solid var(--border)', borderRadius: 'var(--r-md)', padding: big ? 24 : 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <IconZap size={14} style={{ color: 'var(--teal-400)' }} />
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 500, color: 'var(--fg)' }}>Команда · расписание / по запросу</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--teal-400)', marginLeft: 'auto', padding: '3px 8px', background: 'var(--teal-dim)', borderRadius: 4, border: '0.5px solid var(--border-strong)' }}>30 6 * * *</span>
      </div>
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--fg-muted)', lineHeight: 1.6 }}>
        Команду можно вызвать из чата или по расписанию. Каждое утро в <strong style={{ color: 'var(--fg)' }}>06:30</strong> она собирает сводку:<br />
        активные ЭВ, простои &gt; 30 мин, отклонение от плана за прошлую смену.
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Chip kind="neutral" dot>EMAIL</Chip>
        <Chip kind="command" dot>TEAMS</Chip>
        <Chip kind="warn">06:30 МСК</Chip>
      </div>
    </div>);

}

function PrevField({ label, value }) {
  return (
    <div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 3 }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--fg)' }}>{value}</div>
    </div>);

}

function PreviewOverlay({ flow, name, onClose, onPublish }) {
  React.useEffect(() => {
    const onKey = (e) => {if (e.key === 'Escape') onClose();};
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="preview-overlay">
      <div className="preview-overlay-head">
        <KindChip kind={flow.kind} />
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 16, fontWeight: 500, color: 'var(--fg)' }}>{name}</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--teal-400)', padding: '3px 8px', background: 'var(--teal-dim)', borderRadius: 4, border: '0.5px solid var(--border-strong)', marginLeft: 8 }}>
          <IconGitBranch size={10} style={{ verticalAlign: 'middle' }} /> v1 · ПРЕВЬЮ
        </span>
        <span style={{ flex: 1 }} />
        <button className="btn btn-primary" onClick={onPublish}><IconCheck size={11} /> Опубликовать</button>
        <button className="btn btn-neutral" onClick={onClose}>
          <IconExpand size={11} style={{ transform: 'rotate(180deg)' }} /> Свернуть
        </button>
        <button className="icon-btn" style={{ width: 32, height: 32 }} onClick={onClose}><IconX size={13} /></button>
      </div>
      <div className="preview-overlay-body scroll-y">
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <PreviewByKind kind={flow.kind} big />
        </div>
      </div>
    </div>);

}

/* ─── Composer ─── */
const ChatComposer = React.forwardRef(function ChatComposer({ draft, setDraft, onSend, onCreate, flow, hero, showCreate }, ref) {
  const inputRef = React.useRef(null);
  const fileRef = React.useRef(null);
  const [attachment, setAttachment] = React.useState(null);
  React.useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
  }));

  // Auto-grow textarea up to ~15 rows. Cap enforced by CSS max-height: 310px on .chat-composer-box textarea.
  React.useEffect(() => {
    const ta = inputRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 310) + 'px';
  }, [draft]);

  const onPickFile = (e) => {
    const f = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!f) return;
    const MAX = 25 * 1024 * 1024;
    if (f.size > MAX) {
      window.notify && window.notify({
        title: 'Файл слишком большой',
        body: `${f.name} · ${(f.size / 1024 / 1024).toFixed(1)} МБ · максимум 25 МБ`,
        kind: 'error',
      });
      return;
    }
    setAttachment({ name: f.name, size: f.size });
  };

  const handleSend = () => {
    onSend();
    setAttachment(null);
  };

  const disabled = flow && flow.previewState === 'generating';
  const placeholder = disabled
    ? 'OpenClaw собирает превью…'
    : flow && flow.previewState === 'asking'
      ? 'Ответьте текстом или выберите вариант выше'
      : 'Опишите задачу — например «покажи просадки КИО за вчера»';

  return (
    <div className="chat-composer" style={hero ? { borderTop: 0, background: 'transparent', padding: 0 } : undefined}>
      {attachment && (
        <div style={{ maxWidth: 820, margin: '0 auto 6px', display: 'flex' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 999, background: 'var(--teal-dim)', border: '0.5px solid var(--border-strong)', fontFamily: 'var(--font-sans)', fontSize: 11, color: 'var(--teal-400)' }}>
            <IconPaperclip size={10} /> {attachment.name}
            <span style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-mono)', fontSize: 10 }}>· {(attachment.size / 1024 / 1024).toFixed(2)} МБ</span>
            <button className="icon-btn" style={{ width: 16, height: 16, border: 'none', background: 'transparent', color: 'var(--fg-muted)' }} onClick={() => setAttachment(null)} title="Убрать"><IconX size={9} /></button>
          </span>
        </div>
      )}
      <div className={`chat-composer-box ${disabled ? 'disabled' : ''}`}>
        <textarea
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          disabled={disabled}
          placeholder={placeholder}
          rows={1} />
        <input ref={fileRef} type="file" style={{ display: 'none' }} onChange={onPickFile} />
        <button className="icon-btn" style={{ width: 30, height: 30 }} disabled={disabled}
          title="Прикрепить файл (до 25 МБ)" onClick={() => fileRef.current?.click()}>
          <IconPaperclip size={13} />
        </button>
        <button
          className="icon-btn"
          style={{ width: 30, height: 30, background: 'var(--teal-400)', color: 'var(--fg-on-teal)', borderColor: 'var(--teal-400)', opacity: disabled || !draft.trim() ? 0.5 : 1 }}
          disabled={disabled || !draft.trim()}
          onClick={handleSend}
          title="Отправить">
          <IconSend size={13} />
        </button>
      </div>
      {showCreate && (
        <div className="chat-composer-chips" style={{ justifyContent: 'center' }}>
          <CreateSolutionDropdown onPick={onCreate} disabled={disabled} openUp={!hero} />
        </div>
      )}
    </div>);

});

function CreateSolutionDropdown({ onPick, disabled, openUp }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!open) return;
    const close = (e) => {if (ref.current && !ref.current.contains(e.target)) setOpen(false);};
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        className="create-chip"
        disabled={disabled}
        onClick={() => setOpen(!open)}>
        <IconPlus size={11} /> Создать решение
        <IconChevronDown size={10} style={{ marginLeft: 2, transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform .15s' }} />
      </button>
      {open &&
      <div className="popover" style={openUp
        ? { bottom: 'calc(100% + 6px)', left: '50%', transform: 'translateX(-50%)', width: 260 }
        : { top: 'calc(100% + 6px)', left: '50%', transform: 'translateX(-50%)', width: 260 }}>
          {Object.entries(KIND_INFO).map(([k, info]) => {
          const Ic = info.icon;
          return (
            <button key={k} className="popover-item popover-item-lg" onClick={() => {setOpen(false);onPick(k);}}>
                <span className="popover-icon" style={{ color: info.color }}><Ic size={14} /></span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--fg)', fontWeight: 500 }}>{info.label}</span>
                  <span style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: 11, color: 'var(--fg-muted)', marginTop: 2 }}>{info.tag}</span>
                </span>
              </button>);

        })}
        </div>
      }
    </div>);

}

/* ─── History drawer ─── */
function ChatHistoryDrawer({ history, activeId, onPick, onClose, onNewChat }) {
  const [search, setSearch] = React.useState('');
  const filtered = history.filter((c) => !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.preview && c.preview.toLowerCase().includes(search.toLowerCase()));
  const byDay = {};
  filtered.forEach((c) => {(byDay[c.day] = byDay[c.day] || []).push(c);});

  return (
    <>
      <div className="chat-history-backdrop" onClick={onClose} />
      <div className="chat-history-drawer">
        <div className="chd-head">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <IconClock size={14} style={{ color: 'var(--teal-400)' }} />
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 500, color: 'var(--fg)' }}>История чатов</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-muted)', letterSpacing: '0.08em' }}>{history.length}</span>
          </div>
          <button className="icon-btn" style={{ width: 28, height: 28 }} onClick={onClose}><IconX size={13} /></button>
        </div>

        <div className="chd-search">
          <IconSearch size={12} style={{ color: 'var(--fg-muted)' }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Поиск по чатам…" />
        </div>

        <button className="chd-newchat" onClick={onNewChat}>
          <IconPlus size={13} /> Начать новый чат
        </button>

        <div className="chd-list scroll-y">
          {Object.entries(byDay).map(([day, items]) =>
          <div key={day} className="chd-day">
              <div className="chd-day-h">{day}</div>
              {items.map((c) =>
            <button
              key={c.id}
              className={`chd-item ${c.id === activeId ? 'active' : ''}`}
              onClick={() => onPick(c)}>

                  <span className="chd-kind">
                    {c.kind && React.createElement(KIND_INFO[c.kind].icon, { size: 11 })}
                    {!c.kind && <IconMessageSquare size={11} />}
                  </span>
                  <span className="chd-body">
                    <span className="chd-title">{c.title}</span>
                    <span className="chd-preview">{c.preview}</span>
                  </span>
                  <span className="chd-ts">{c.ts}</span>
                </button>
            )}
            </div>
          )}
          {filtered.length === 0 &&
          <div style={{ padding: 28, textAlign: 'center', fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--fg-muted)' }}>
              Ничего не найдено
            </div>
          }
        </div>
      </div>
    </>);

}

/* ─── Helpers / config ─── */

const KIND_INFO = {
  dash: {
    label: 'Дашборд', userLabel: 'дашборд', icon: IconBarChart, color: 'var(--info)', tag: 'Графики и таблицы',
    welcome: 'Понял — соберу дашборд. Какие данные нужно показать?',
    steps: [
    { key: 'subject', question: 'Какие данные нужно показать?',
      suggestions: ['Объём вскрыши экскаваторов КТ', 'Просадки КИО', 'Циклы погрузки', 'Бюджет — план/факт'] },
    { key: 'period', question: 'Какой период анализа?',
      suggestions: ['Текущая смена', 'Сутки', 'Неделя', 'Месяц', '30 смен'] },
    { key: 'threshold', question: 'Подсвечивать отклонение от плана? Если да — на каком пороге?',
      suggestions: ['Да, порог 90% от плана', 'Да, ±5%', 'Без подсветки'] },
    { key: 'name', question: 'Имя решения? (можно оставить предложенное)',
      suggestions: ['Объём вскрыши — экскаваторы КТ', 'Свой вариант'] }],

  },
  alert: {
    label: 'Алерт', userLabel: 'алерт', icon: IconAlertCircle, color: 'var(--warn-orange)', tag: 'Уведомление по порогу',
    welcome: 'Понял — соберу алерт. По какой метрике следить?',
    steps: [
    { key: 'metric', question: 'По какой метрике следить?',
      suggestions: ['КИО', 'Цикл погрузки', 'Простои АТ', 'Расход топлива'] },
    { key: 'threshold', question: 'На каком пороге срабатывать?',
      suggestions: ['КИО < 75% более 2 ч', 'Цикл > 3.5 мин', 'Простой > 30 мин'] },
    { key: 'channel', question: 'Куда отправлять уведомление?',
      suggestions: ['Teams', 'Email', 'Teams + Email'] }],

  },
  command: {
    label: 'Команда', userLabel: 'команду', icon: IconZap, color: 'var(--teal-400)', tag: 'Вызываемая команда',
    welcome: 'Понял — соберу команду. Что она должна делать?',
    steps: [
    { key: 'action', question: 'Что должна делать команда?',
      suggestions: ['Утренний дайджест по парку', 'Q&A по регламентам ТО', 'Сводка по смене'] },
    { key: 'trigger', question: 'Как команда запускается?',
      suggestions: ['По расписанию (cron)', 'По запросу из чата', 'По событию'] },
    { key: 'channel', question: 'Куда отправлять результат?',
      suggestions: ['Email', 'Teams', 'Email + Teams'] }],

  },
};

function defaultSolutionName(kind) {
  return {
    dash: 'Новый дашборд',
    alert: 'Новый алерт',
    command: 'Новая команда',
  }[kind] || 'Новое решение';
}

function genericReply(text) {
  // Very simple "smart" routing for the demo
  const l = text.toLowerCase();
  if (l.includes('кио')) return 'По вчерашней ночной смене КИО просел у трёх ЭВ: R 9250 /5 (81%), EX 3600 D /27 (74.6%), WK 20 /97 (71.1%). Хотите развернуть это в дашборд?';
  if (l.includes('парк') || l.includes('сводк')) return 'Парк сегодняшней смены — 142 ед: 38 ЭВ активны, 4 в ТО, 6 на ремонте. Простои > 30 мин: 7 случаев. Прислать полную сводку в почту?';
  if (l.includes('цикл')) return 'Средний цикл за неделю: КТ — 2.9 мин, СТ — 3.4 мин. КТ ускорились на −0.2 мин к прошлой неделе. Хотите собрать рейтинг по бригадам?';
  if (l.includes('топ')) return 'Топ за май: PC 4000 E /38 (1.84 млн т), WK 20 /97 (1.71 млн т), EX 3600 D /90 (1.62 млн т). Сохранить как дашборд?';
  return 'Понял. Уточните период и нужные данные — или соберу полноценное решение через «Создать решение ▾».';
}

function makeChatHistory(impersonating, me) {
  if (impersonating) {
    // Подменённый пользователь видит "свою" историю
    return [
    { id: 'imp-c1', title: 'Сводка парка', preview: 'Подключение к источнику · вчера', ts: 'вчера', day: 'Вчера', messages: makeHistoryMessages('Сводка парка'), kind: null },
    { id: 'imp-c2', title: 'Помощь по интерфейсу', preview: 'Запрос на доступ к KB', ts: '14.05', day: 'Май', messages: makeHistoryMessages('Помощь по интерфейсу'), kind: null }];

  }
  return [
  { id: 'c1', title: 'Объём вскрыши — экскаваторы КТ', preview: 'Дашборд опубликован · 30 смен, порог 90%', ts: '16:54', day: 'Сегодня', messages: makeHistoryMessages('Объём вскрыши — экскаваторы КТ'), kind: 'dash' },
  { id: 'c2', title: 'Просадки КИО — ночная смена', preview: 'Алерт в Teams · КИО < 75% более 2 ч', ts: '11:08', day: 'Сегодня', messages: makeHistoryMessages('Просадки КИО — ночная смена'), kind: 'alert' },
  { id: 'c3', title: 'Q&A: регламент ТО PC 4000', preview: '14 п. чеклиста для ТО-2', ts: '09:14', day: 'Сегодня', messages: makeHistoryMessages('Q&A: регламент ТО PC 4000'), kind: 'command' },
  { id: 'c4', title: 'Утренний дайджест по парку', preview: 'cron 30 6 * * * · email+Teams', ts: 'вчера', day: 'Вчера', messages: makeHistoryMessages('Утренний дайджест по парку'), kind: 'command' },
  { id: 'c5', title: 'Сравни цикл КТ и СТ за неделю', preview: 'Свободный диалог · 14 сообщений', ts: 'вчера', day: 'Вчера', messages: makeHistoryMessages('Сравни цикл КТ и СТ за неделю'), kind: null },
  { id: 'c6', title: 'Бюджет — добыча и вскрыша', preview: 'Форк из Marketplace + доработка', ts: '16.05', day: 'Эта неделя', messages: makeHistoryMessages('Бюджет — добыча и вскрыша'), kind: 'dash' },
  { id: 'c7', title: 'Топ экскаваторов по объёму', preview: 'Свободный диалог', ts: '15.05', day: 'Эта неделя', messages: makeHistoryMessages('Топ экскаваторов по объёму'), kind: null },
  { id: 'c8', title: 'Цикл погрузки — почасовой рейтинг', preview: 'Доработка дашборда', ts: '12.05', day: 'Эта неделя', messages: makeHistoryMessages('Цикл погрузки — почасовой рейтинг'), kind: 'dash' },
  { id: 'c9', title: 'Расход топлива по моделям АТ', preview: 'Запрос на доступ к fuel_logs', ts: '08.05', day: 'Май', messages: makeHistoryMessages('Расход топлива по моделям АТ'), kind: null },
  { id: 'c10', title: 'Q&A: регламенты ТО', preview: 'Подбор источника · KB · регламенты', ts: '05.05', day: 'Май', messages: makeHistoryMessages('Q&A: регламенты ТО'), kind: 'command' },
  { id: 'c11', title: 'План-факт по бригадам', preview: 'Форк из Marketplace', ts: '28.04', day: 'Апрель', messages: makeHistoryMessages('План-факт по бригадам'), kind: 'dash' }];

}

function makeHistoryMessages(title) {
  return [
  { role: 'system', text: `Чат восстановлен · «${title}»` },
  { role: 'user', text: title.toLowerCase().includes('q&a') ? 'Какой регламент ТО для PC 4000 каждые 250 моточасов?' : `Покажи: ${title.toLowerCase()}` },
  { role: 'bot', skill: 'OPENCLAW', text: 'Готово. Результат загружен в эту вкладку — посмотрите предыдущие сообщения и решение, сохранённое в разделе «Решения».' }];

}

export { SectionChat };
