/* Чат — единая стартовая вкладка.
   Заменяет старые «Главная» и «Workspace».
   Состояния:
   - empty: приветствие, чипсеты-подсказки, инпут с «Создать решение ▾»
   - chat: переписка с ботом
   - flow: запущен демо-флоу создания решения (уточняющие вопросы → превью)
   Правая панель — «Контекст сессии».
   Кнопки сверху: «История · N» (выезжающая панель), «Новый чат». */

function SectionChat({ setRoute, openCreate, openCreatePage, openSolution, tweak, trigger, clearTrigger, impersonating }) {
  const me = currentMe(tweak.userRole, impersonating);

  /* — История диалогов (мок) — */
  const initialHistory = React.useMemo(() => makeChatHistory(impersonating, me), [impersonating?.id]);
  const [history, setHistory] = React.useState(initialHistory);
  const [activeChatId, setActiveChatId] = React.useState(null); // null = новый чат
  const [historyOpen, setHistoryOpen] = React.useState(false);
  const [messages, setMessages] = React.useState([]); // []  = empty/welcome
  const [draft, setDraft] = React.useState('');
  const [flow, setFlow] = React.useState(null); // { kind, step, name, params, previewState, expanded }
  const scrollRef = React.useRef(null);
  const composerRef = React.useRef(null);

  // Reset to a fresh chat when entering for a new conversation
  const newChat = React.useCallback((opts = {}) => {
    setActiveChatId(null);
    setMessages([]);
    setDraft('');
    setFlow(null);
    setHistoryOpen(false);
    if (opts.kind) startCreateFlow(opts.kind);
    // eslint-disable-next-line
  }, []);

  // Handle external triggers (sidebar «Создать решение», «Новый чат» from menus,
  // and «Редактировать» / «Форкнуть в чат» from solution view)
  React.useEffect(() => {
    if (!trigger) return;
    if (trigger.mode === 'create') {
      newChat({ kind: trigger.kind || 'dash' });
    } else if (trigger.mode === 'new') {
      newChat();
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
    const k = KIND_INFO[sol.kind];
    const isFork = intent === 'fork';
    const f = {
      kind: sol.kind,
      step: 0,
      name: sol.name,
      params: { sourceSolutionId: sol.id, sourceVersion: v, mode: isFork ? 'fork' : 'edit' },
      previewState: 'ready',
      expanded: false
    };
    setActiveChatId(null);
    setHistoryOpen(false);
    setDraft('');
    setFlow(f);
    setMessages([
      { role: 'system', text: `${isFork ? 'Форк' : 'Редактирование'} · «${sol.name}» · v${v} · ${new Date().toLocaleString('ru', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}` },
      { role: 'bot', skill: `${isFork ? 'FORK' : 'EDIT'}-${sol.kind.toUpperCase()}`,
        text: isFork
          ? `Сделал копию «${sol.name}» (v${v}) у вас в Workspace. Что хотим изменить?`
          : `Открыл «${sol.name}» (v${v}) для правок. Что хотим изменить?`,
        preview: true
      }
    ]);
  }

  /* — Запуск демо-флоу создания решения — */
  function startCreateFlow(kind) {
    const name = defaultSolutionName(kind);
    const f = { kind, step: 0, name, params: {}, previewState: 'asking', expanded: false };
    setFlow(f);
    const k = KIND_INFO[kind];
    setMessages([
    { role: 'system', text: `Демо-флоу · создание решения «${k.label}» · ${new Date().toLocaleString('ru', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}` },
    { role: 'user', text: `Хочу создать ${k.userLabel}` },
    { role: 'bot', skill: `BUILD-${kind.toUpperCase()}`, text: k.welcome, suggestions: k.steps[0].suggestions, flowQuestion: 0 }]
    );
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
          decision: true
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
      // Doработка после превью
      pushUser(text);
      setTimeout(() => {
        pushBot('Понял правки. Перестраиваю превью…', { skill: 'REFINE', generating: true });
      }, 350);
      setFlow((prev) => prev ? { ...prev, previewState: 'generating' } : null);
      setTimeout(() => {
        setFlow((prev) => prev ? { ...prev, previewState: 'ready' } : null);
        pushBot('Готово · обновлённая версия. Опубликовать или продолжить?', {
          skill: 'REFINE', preview: true, decision: true
        });
      }, 2400);
      return;
    }
    // Обычный чат — бот отвечает в духе ассистента
    pushUser(text);
    setTimeout(() => {
      pushBot(genericReply(text), { skill: 'WORKSPACE' });
    }, 500);
  }

  function publishPreview() {
    if (!flow) return;
    window.notify && window.notify({
      title: 'Решение опубликовано',
      body: flow.name,
      kind: 'success'
    });
    pushMessage({ role: 'system', text: `«${flow.name}» сохранено в раздел «Решения» · v1` });
    setFlow(null);
    // Сохраняем чат в историю
    setHistory((prev) => [{
      id: 'chat-' + Date.now(),
      title: flow.name,
      preview: 'Опубликовано · готово к запуску',
      ts: 'только что',
      day: 'Сегодня',
      messages: [...messages],
      kind: flow.kind
    }, ...prev]);
  }

  function continueRefining() {
    if (!flow) return;
    pushBot('Опишите, что изменить — Workspace внесёт правки.', { skill: 'REFINE' });
    if (composerRef.current) composerRef.current.focus();
  }

  function openInEditor() {
    openCreatePage && openCreatePage(flow.kind);
  }

  function loadHistoryChat(chat) {
    setActiveChatId(chat.id);
    setMessages(chat.messages || []);
    setFlow(null);
    setHistoryOpen(false);
  }

  const isEmpty = messages.length === 0 && !flow;

  return (
    <div className="chat-shell">
      {/* Center column */}
      <div className="chat-center">
        <ChatHeader
          activeChat={activeChatId ? history.find((c) => c.id === activeChatId) : null}
          historyOpen={historyOpen}
          setHistoryOpen={setHistoryOpen}
          historyCount={history.length}
          onNewChat={() => newChat()} />
        

        <div className="chat-scroll scroll-y" ref={scrollRef}>
          {isEmpty ?
          <ChatEmpty me={me} onCreate={(k) => newChat({ kind: k })} /> :
          <ChatMessages
            messages={messages}
            onSuggest={(s, qIdx) => {
              // Only respond to suggestion clicks tied to the latest question
              if (!flow) return;
              if (flow.previewState !== 'asking') return;
              if (qIdx !== flow.step) return;
              advanceFlowStep(s);
            }}
            flow={flow}
            onExpand={() => setFlow((prev) => prev ? { ...prev, expanded: true } : null)}
            onPublish={publishPreview}
            onRefine={continueRefining}
            onEditor={openInEditor} />

          }
        </div>

        <ChatComposer
          ref={composerRef}
          draft={draft}
          setDraft={setDraft}
          onSend={sendDraft}
          onCreate={(k) => newChat({ kind: k })}
          flow={flow} />
        
      </div>

      {/* Right column — only «Контекст сессии» */}
      <ChatRightPanel me={me} flow={flow} isEmpty={isEmpty} />

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
        onClose={() => setFlow((prev) => prev ? { ...prev, expanded: false } : null)}
        onPublish={publishPreview} />

      }
    </div>);

}

/* ─────────────────────────────────────────── */

function ChatHeader({ activeChat, historyOpen, setHistoryOpen, historyCount, onNewChat }) {
  return (
    <div className="chat-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 500, color: 'var(--fg)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {activeChat ? activeChat.title : 'Новый чат'}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--fg-muted)', letterSpacing: '0.10em', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {activeChat ? activeChat.preview : 'диалог с Workspace · BUILD-ANY'}
          </div>
        </div>
      </div>
      <button
        className={`btn btn-neutral btn-sm ${historyOpen ? 'active' : ''}`}
        onClick={() => setHistoryOpen(!historyOpen)}
        title="История чатов">
        
        <IconClock size={11} /> История <span style={{ color: 'var(--fg-muted)', marginLeft: 2 }}>· {historyCount}</span>
      </button>
      <button className="btn btn-neutral btn-sm" onClick={onNewChat} title="Новый чат">
        <IconPlus size={11} /> Новый
      </button>
    </div>);

}

function ChatEmpty({ me, onCreate }) {
  return (
    <div className="chat-empty">
      <div className="chat-empty-title" data-comment-anchor="58f274c6b4-div-294-7">Чем могу помочь?</div>
      <div className="chat-empty-sub">
        Спросите про парк, КИО, циклы или объёмы — Workspace ответит на естественном языке.
      </div>
      <div className="chat-empty-cards">
        {Object.entries(KIND_INFO).map(([k, info]) => {
          const Ic = info.icon;
          return (
            <button key={k} className="chat-empty-card" onClick={() => onCreate(k)}>
              <span className="cec-icon" style={{ color: info.color }}><Ic size={14} /></span>
              <span style={{ minWidth: 0 }}>
                <span className="cec-label">{info.label}</span>
                <span className="cec-sub">{info.tag}</span>
              </span>
            </button>);

        })}
      </div>
    </div>);

}

function ChatMessages({ messages, onSuggest, flow, onExpand, onPublish, onRefine, onEditor }) {
  return (
    <div className="chat-messages">
      {messages.map((m, i) => {
        if (m.role === 'system') return <div key={i} className="bubble bubble-system">{m.text}</div>;
        if (m.role === 'user') return <div key={i} className="bubble bubble-user">{m.text}</div>;
        return (
          <div key={i} className="bubble bubble-bot">
            <div className="who">
              <CubeLogo size={11} color="var(--teal-400)" /> Workspace
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
            <InlinePreview flow={flow} onExpand={onExpand} />
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
  { label: 'Подбираю шаблон Workspace', done: true },
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

function InlinePreview({ flow, onExpand }) {
  return (
    <div className="inline-preview">
      <div className="inline-preview-head">
        <KindChip kind={flow.kind} />
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 500, color: 'var(--fg)' }}>{flow.name}</span>
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
  if (kind === 'agent') {
    return (
      <div style={{ background: 'var(--bg-elev)', border: '0.5px solid var(--border)', borderRadius: 'var(--r-md)', padding: big ? 24 : 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="bubble bubble-user" style={{ alignSelf: 'flex-end', maxWidth: '70%' }}>Какой регламент ТО для PC 4000 каждые 250 моточасов?</div>
        <div className="bubble bubble-bot" style={{ maxWidth: '85%' }}>
          <div className="who"><CubeLogo size={11} color="var(--teal-400)" /> Agent · KB</div>
          <div>Согласно регламенту ТО-2 (250 м/ч): замена масла гидросистемы, проверка натяжения гусеничной цепи, ревизия зубьев ковша. Полный чеклист — 14 пунктов.</div>
          <div style={{ marginTop: 8, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-muted)', letterSpacing: '0.06em' }}>
            Источник · knowledge_base.maintenance / ТО-ПЭ-PC4000-v3.pdf, с. 42
          </div>
        </div>
      </div>);

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
  // automation
  return (
    <div style={{ background: 'var(--bg-elev)', border: '0.5px solid var(--border)', borderRadius: 'var(--r-md)', padding: big ? 24 : 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <IconZap size={14} style={{ color: 'var(--warn)' }} />
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 500, color: 'var(--fg)' }}>Расписание · cron</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--teal-400)', marginLeft: 'auto', padding: '3px 8px', background: 'var(--teal-dim)', borderRadius: 4, border: '0.5px solid var(--border-strong)' }}>30 6 * * *</span>
      </div>
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--fg-muted)', lineHeight: 1.6 }}>
        Каждое утро в <strong style={{ color: 'var(--fg)' }}>06:30</strong> система собирает сводку:<br />
        активные ЭВ, простои &gt; 30 мин, отклонение от плана за прошлую смену.
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Chip kind="neutral" dot>EMAIL</Chip>
        <Chip kind="agent" dot>TEAMS</Chip>
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

function PreviewOverlay({ flow, onClose, onPublish }) {
  React.useEffect(() => {
    const onKey = (e) => {if (e.key === 'Escape') onClose();};
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="preview-overlay">
      <div className="preview-overlay-head">
        <KindChip kind={flow.kind} />
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 16, fontWeight: 500, color: 'var(--fg)' }}>{flow.name}</span>
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
const ChatComposer = React.forwardRef(function ChatComposer({ draft, setDraft, onSend, onCreate, flow }, ref) {
  const inputRef = React.useRef(null);
  React.useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus()
  }));
  const disabled = flow && flow.previewState === 'generating';
  const placeholder = disabled ?
  'Workspace собирает превью…' :
  flow && flow.previewState === 'asking' ?
  'Ответьте текстом или выберите вариант выше' :
  'Опишите задачу — например «покажи просадки КИО за вчера»';

  return (
    <div className="chat-composer">
      <div className={`chat-composer-box ${disabled ? 'disabled' : ''}`}>
        <textarea
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {if (e.key === 'Enter' && !e.shiftKey) {e.preventDefault();onSend();}}}
          disabled={disabled}
          placeholder={placeholder}
          rows={1} />
        
        <button className="icon-btn" style={{ width: 30, height: 30 }} disabled={disabled} title="Прикрепить">
          <IconPaperclip size={13} />
        </button>
        <button className="btn btn-primary btn-sm" disabled={disabled || !draft.trim()} onClick={onSend}>
          <IconSend size={11} /> Отправить
        </button>
      </div>
      <div className="chat-composer-chips">
        <CreateSolutionDropdown onPick={onCreate} disabled={disabled} />
        <PromptChip text="Покажи просадки КИО за вчера" onPick={(t) => setDraft(t)} />
        <PromptChip text="Сводка по парку за сегодняшнюю смену" onPick={(t) => setDraft(t)} />
        <PromptChip text="Сравни цикл КТ и СТ за неделю" onPick={(t) => setDraft(t)} />
        <PromptChip text="Топ экскаваторов по объёму за месяц" onPick={(t) => setDraft(t)} />
      </div>
    </div>);

});

function PromptChip({ text, onPick }) {
  return (
    <button className="prompt-chip" onClick={() => onPick && onPick(text)}>{text}</button>);

}

function CreateSolutionDropdown({ onPick, disabled }) {
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
      <div className="popover" style={{ bottom: 'calc(100% + 6px)', left: 0, width: 260 }}>
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

/* ─── Right panel ─── */
function ChatRightPanel({ me, flow, isEmpty }) {
  return (
    <div className="chat-right scroll-y">
      <div className="right-panel-group">
        <div className="rpg-head">
          <IconMessageSquare size={11} />
          <span>Контекст сессии</span>
        </div>
        {isEmpty && !flow &&
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--fg-muted)', lineHeight: 1.55 }}>
            Активной задачи нет. Начните диалог или соберите готовое решение через кнопку <strong style={{ color: 'var(--fg)' }}>«Создать решение»</strong>.
          </div>
        }
        {flow &&
        <>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--fg-muted)', lineHeight: 1.55 }}>
              Активная задача:&nbsp;<span style={{ color: 'var(--fg)' }}>{KIND_INFO[flow.kind].label} «{flow.name}»</span>
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
              {Object.entries(flow.params).map(([k, v]) =>
            <Chip key={k} kind="neutral" style={{ textTransform: 'none', letterSpacing: '0.02em', fontSize: 10 }}>
                  {v.length > 22 ? v.slice(0, 22) + '…' : v}
                </Chip>
            )}
              {flow.previewState === 'asking' && <Chip kind="warn" dot>УТОЧНЕНИЕ</Chip>}
              {flow.previewState === 'generating' && <Chip kind="warn" dot>СБОРКА</Chip>}
              {flow.previewState === 'ready' && <Chip kind="pos" dot>ГОТОВО</Chip>}
            </div>
          </>
        }
        {!flow && !isEmpty &&
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--fg-muted)', lineHeight: 1.55 }}>
            Свободный диалог с Workspace. Чтобы собрать решение — выберите «Создать решение ▾» рядом с инпутом.
          </div>
        }
      </div>

      <div className="right-panel-group">
        <div className="rpg-head">
          <IconDatabase size={11} />
          <span>Подключённые источники</span>
          <span className="rpg-count">{OESDATA.sources.filter((s) => s.granted).length}</span>
        </div>
        {OESDATA.sources.filter((s) => s.granted).slice(0, 4).map((s) =>
        <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0' }}>
            <SourceKind kind={s.kind} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--fg)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--fg-muted)', letterSpacing: '0.06em' }}>{s.id} · {s.rows}</div>
            </div>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--pos)' }} />
          </div>
        )}
      </div>

      <div style={{ marginTop: 'auto', fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--fg-muted)', letterSpacing: '0.08em', textAlign: 'center', padding: '14px 4px 4px' }}>
        <IconShield size={9} style={{ verticalAlign: 'middle' }} /> Маскирование чувствительных данных · вкл
      </div>
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
      suggestions: ['Объём вскрыши — экскаваторы КТ', 'Свой вариант'] }]

  },
  agent: {
    label: 'Агент-ассистент', userLabel: 'агента-ассистента', icon: IconBrain, color: 'var(--teal-400)', tag: 'Q&A по базе знаний',
    welcome: 'Понял — соберу Q&A агента. На каком корпусе он будет отвечать?',
    steps: [
    { key: 'corpus', question: 'На каком корпусе документов агент будет отвечать?',
      suggestions: ['Регламенты ТО', 'НПД и стандарты', 'Документы по парку АТ'] },
    { key: 'audience', question: 'Кто основной пользователь?',
      suggestions: ['Сервисные инженеры', 'Диспетчерская', 'Руководители участков'] },
    { key: 'channel', question: 'В каком канале агент должен быть доступен?',
      suggestions: ['Только Workspace', 'Workspace + Teams', 'Workspace + Email'] }]

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
      suggestions: ['Teams', 'Email', 'Teams + Email'] }]

  },
  automation: {
    label: 'Автоматизация', userLabel: 'автоматизацию', icon: IconZap, color: 'var(--warn)', tag: 'Регулярная задача',
    welcome: 'Понял — соберу автоматизацию. Что система должна делать?',
    steps: [
    { key: 'action', question: 'Что система должна делать?',
      suggestions: ['Утренний дайджест по парку', 'Сводка по смене', 'Еженедельный отчёт о КПД'] },
    { key: 'schedule', question: 'По какому расписанию?',
      suggestions: ['Каждое утро 06:30', 'После каждой смены', 'Каждый понедельник 09:00'] },
    { key: 'channel', question: 'Куда отправлять результат?',
      suggestions: ['Email', 'Teams', 'Email + Teams'] }]

  }
};

function defaultSolutionName(kind) {
  return {
    dash: 'Новый дашборд',
    agent: 'Новый Q&A агент',
    alert: 'Новый алерт',
    automation: 'Новая автоматизация'
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
    // Подмененный пользователь видит "свою" историю
    return [
    { id: 'imp-c1', title: 'Сводка парка', preview: 'Подключение к источнику · вчера', ts: 'вчера', day: 'Вчера', messages: makeHistoryMessages('Сводка парка'), kind: null },
    { id: 'imp-c2', title: 'Помощь по интерфейсу', preview: 'Запрос на доступ к KB', ts: '14.05', day: 'Май', messages: makeHistoryMessages('Помощь по интерфейсу'), kind: null }];

  }
  return [
  { id: 'c1', title: 'Объём вскрыши — экскаваторы КТ', preview: 'Дашборд опубликован · 30 смен, порог 90%', ts: '16:54', day: 'Сегодня', messages: makeHistoryMessages('Объём вскрыши — экскаваторы КТ'), kind: 'dash' },
  { id: 'c2', title: 'Просадки КИО — ночная смена', preview: 'Алерт в Teams · КИО < 75% более 2 ч', ts: '11:08', day: 'Сегодня', messages: makeHistoryMessages('Просадки КИО — ночная смена'), kind: 'alert' },
  { id: 'c3', title: 'Q&A: регламент ТО PC 4000', preview: '14 п. чеклиста для ТО-2', ts: '09:14', day: 'Сегодня', messages: makeHistoryMessages('Q&A: регламент ТО PC 4000'), kind: 'agent' },
  { id: 'c4', title: 'Утренний дайджест по парку', preview: 'cron 30 6 * * * · email+Teams', ts: 'вчера', day: 'Вчера', messages: makeHistoryMessages('Утренний дайджест по парку'), kind: 'automation' },
  { id: 'c5', title: 'Сравни цикл КТ и СТ за неделю', preview: 'Свободный диалог · 14 сообщений', ts: 'вчера', day: 'Вчера', messages: makeHistoryMessages('Сравни цикл КТ и СТ за неделю'), kind: null },
  { id: 'c6', title: 'Бюджет — добыча и вскрыша', preview: 'Форк из Marketplace + доработка', ts: '16.05', day: 'Эта неделя', messages: makeHistoryMessages('Бюджет — добыча и вскрыша'), kind: 'dash' },
  { id: 'c7', title: 'Топ экскаваторов по объёму', preview: 'Свободный диалог', ts: '15.05', day: 'Эта неделя', messages: makeHistoryMessages('Топ экскаваторов по объёму'), kind: null },
  { id: 'c8', title: 'Цикл погрузки — почасовой рейтинг', preview: 'Доработка дашборда', ts: '12.05', day: 'Эта неделя', messages: makeHistoryMessages('Цикл погрузки — почасовой рейтинг'), kind: 'dash' },
  { id: 'c9', title: 'Расход топлива по моделям АТ', preview: 'Запрос на доступ к fuel_logs', ts: '08.05', day: 'Май', messages: makeHistoryMessages('Расход топлива по моделям АТ'), kind: null },
  { id: 'c10', title: 'Q&A: регламенты ТО', preview: 'Подбор источника · KB · регламенты', ts: '05.05', day: 'Май', messages: makeHistoryMessages('Q&A: регламенты ТО'), kind: 'agent' },
  { id: 'c11', title: 'План-факт по бригадам', preview: 'Форк из Marketplace', ts: '28.04', day: 'Апрель', messages: makeHistoryMessages('План-факт по бригадам'), kind: 'dash' }];

}

function makeHistoryMessages(title) {
  return [
  { role: 'system', text: `Чат восстановлен · «${title}»` },
  { role: 'user', text: title.toLowerCase().includes('q&a') ? 'Какой регламент ТО для PC 4000 каждые 250 моточасов?' : `Покажи: ${title.toLowerCase()}` },
  { role: 'bot', skill: 'WORKSPACE', text: 'Готово. Результат загружен в эту вкладку — посмотрите предыдущие сообщения и решение, сохранённое в разделе «Решения».' }];

}

Object.assign(window, { SectionChat });