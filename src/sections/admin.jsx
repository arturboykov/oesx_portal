import React from 'react';
import {
  IconRefresh, IconPlus, IconX, IconShield, CubeLogo, IconChevronDown, IconDatabase,
  IconCpu, IconLink, IconWrench, IconBrain, IconUsers, IconSearch, IconLogOut,
  IconEdit, IconTrash, IconUser, IconClock, IconLock, IconCheck, IconAlertCircle,
} from '../icons.jsx';
import { OESDATA } from '../data.jsx';

/* Администрирование — два таба: Домены и Пользователи. */

function SectionAdmin({ tab, setTab, enterAs }) {
  return (
    <div className="fade-up">
      <div className="page-head">
        <div>
          <div className="page-title">Администрирование</div>
          <div className="page-sub">Платформа OES X · домены, пользователи и доступы</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-neutral"><IconRefresh size={11} /> Обновить</button>
        </div>
      </div>

      <div className="tabs">
        <div className={`tab ${tab === 'domains' ? 'active' : ''}`} onClick={() => setTab('domains')}>
          Домены · {OESDATA.domains.length}
        </div>
        <div className={`tab ${tab === 'users' ? 'active' : ''}`} onClick={() => setTab('users')}>
          Пользователи · {OESDATA.users.length}
        </div>
      </div>

      {tab === 'domains' && <AdminDomains />}
      {tab === 'users' && <AdminUsers enterAs={enterAs} />}
    </div>
  );
}

/* ─── Домены ─── */
function AdminDomains() {
  const [openId, setOpenId] = React.useState('excavators');
  const [addDomainOpen, setAddDomainOpen] = React.useState(false);
  const [resModal, setResModal] = React.useState(null); // { domain, type }
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--fg-muted)' }}>
          Управление доменами и подключённые интеграции
        </div>
        <span style={{ flex: 1 }} />
        <button className="btn btn-primary" onClick={() => setAddDomainOpen(true)}><IconPlus size={11} /> Создать домен</button>
      </div>
      {OESDATA.domains.map(d => (
        <DomainCard key={d.id} d={d} open={openId === d.id} onToggle={() => setOpenId(openId === d.id ? null : d.id)}
          onAddResource={(type) => setResModal({ domain: d, type })} />
      ))}
      {addDomainOpen && <AddDomainModal onClose={() => setAddDomainOpen(false)} onCreate={() => {
        if (window.notify) window.notify({ title: 'Домен создан', body: 'Конфигурация загружена в платформу.', kind: 'success' });
        setAddDomainOpen(false);
      }} />}
      {resModal && <AddResourceModal domain={resModal.domain} type={resModal.type} onClose={() => setResModal(null)} />}
    </div>
  );
}

function AddDomainModal({ onClose, onCreate }) {
  const [name, setName] = React.useState('');
  const [desc, setDesc] = React.useState('');
  const [port, setPort] = React.useState('18789');
  const [llm, setLlm] = React.useState('CLAUDE-OPUS-4-6');
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <div className="modal-title">Создание домена</div>
          <button className="icon-btn" style={{ width: 28, height: 28 }} onClick={onClose}><IconX size={13} /></button>
        </div>
        <div className="modal-body">
          <div className="field-stack">
            <div className="field-label">Имя домена *</div>
            <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="например, logistics" />
          </div>
          <div className="field-stack">
            <div className="field-label">Описание</div>
            <input className="input" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Логистика — внутренние перевозки" />
          </div>
          <div className="field-grid-2">
            <div className="field-stack">
              <div className="field-label">Gateway · порт</div>
              <input className="input mono" value={port} onChange={e => setPort(e.target.value)} />
            </div>
            <div className="field-stack">
              <div className="field-label">Primary LLM</div>
              <input className="input mono" value={llm} onChange={e => setLlm(e.target.value)} />
            </div>
          </div>
          <div style={{ padding: 12, background: 'rgba(106,158,184,0.06)', border: '0.5px solid rgba(106,158,184,0.30)', borderRadius: 'var(--r-md)', fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--fg-muted)', lineHeight: 1.5 }}>
            <IconShield size={11} style={{ verticalAlign: 'middle', color: 'var(--info)' }} /> После создания домен появится в списке. Каналы, MCP-серверы и пользователей можно добавлять отдельно.
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn btn-neutral" onClick={onClose}>Отмена</button>
          <button className="btn btn-primary" disabled={!name.trim()} onClick={onCreate}><IconPlus size={11} /> Создать</button>
        </div>
      </div>
    </div>
  );
}

function DomainCard({ d, open, onToggle, onAddResource }) {
  return (
    <div className={`dom-card ${open ? 'open' : ''}`}>
      <div className="dom-card-head" onClick={onToggle}>
        <div className="dom-glyph">
          <CubeLogo size={20} color="var(--teal-400)" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 16, fontWeight: 500, color: 'var(--fg)', letterSpacing: '-0.01em' }}>{d.name}</span>
            <span className="dom-status-active"><span className="dot dot-pos" /> {d.status}</span>
          </div>
          {!open && d.desc && <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--fg-muted)', marginTop: 3 }}>{d.desc}</div>}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <span className="dom-chip purple">{d.counts.llm} LLM</span>
          <span className="dom-chip blue">{d.counts.channels} КАНАЛ</span>
          <span className="dom-chip amber">{d.counts.api} API</span>
        </div>
        <IconChevronDown size={14} style={{ color: 'var(--fg-muted)', transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform .15s', marginLeft: 8 }} />
      </div>
      {open && <DomainBody d={d} onAddResource={onAddResource} />}
    </div>
  );
}

/* Unified domain settings layout — used both inside DomainCard and inside expandable user rows */
function DomainBody({ d, compact, onAddResource }) {
  return (
    <div className="dom-body" style={compact ? { padding: '14px 4px 4px', gap: '20px 28px' } : null}>
      {onAddResource && !compact &&
        <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', paddingBottom: 12, borderBottom: '0.5px solid var(--border)' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--fg-muted)' }}>Настроить домен</span>
          <span style={{ flex: 1 }} />
          <button className="btn btn-ghost btn-sm" onClick={() => onAddResource('mcp')}><IconPlus size={10} /> MCP</button>
          <button className="btn btn-ghost btn-sm" onClick={() => onAddResource('api')}><IconPlus size={10} /> API</button>
          <button className="btn btn-ghost btn-sm" onClick={() => onAddResource('files')}><IconPlus size={10} /> Файлы</button>
          <button className="btn btn-ghost btn-sm" onClick={() => onAddResource('context')}><IconPlus size={10} /> Контекст</button>
        </div>
      }
      {/* db */}
      <div className="dom-section">
        <div className="dom-section-h"><IconDatabase size={11} /> Зарегистрировано в БД</div>
        <DomRow k="ID" v={d.db.id} />
        {d.db.telegramBot && <DomRow k="Telegram Bot" v={d.db.telegramBot} />}
        {d.db.container && <DomRow k="Контейнер" v={d.db.container} />}
        <DomRow k="Workspace" v={d.db.workspace} />
        <DomRow k="Порт" v={String(d.db.port)} />
        <DomRow k="Создан" v={d.db.created} />
      </div>

      {/* llm */}
      <div className="dom-section">
        <div className="dom-section-h"><IconCpu size={11} /> LLM модели</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="k" style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--fg-muted)' }}>Primary:</span>
          <span className="dom-chip purple">{d.llm.primary}</span>
        </div>
        <div className="dom-chip-row">
          {d.llm.models.map(m => <span key={m} className="dom-chip purple">{m}</span>)}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="k" style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--fg-muted)' }}>Провайдеры:</span>
          <div className="dom-chip-row">
            {d.llm.providers.map(p => {
              const tint = p === 'ANTHROPIC' ? 'red' : p === 'OPENAI' ? 'teal' : 'amber';
              return <span key={p} className={`dom-chip ${tint}`}>{p}</span>;
            })}
          </div>
        </div>
      </div>

      {/* channels */}
      <div className="dom-section">
        <div className="dom-section-h"><IconLink size={11} /> Каналы</div>
        {d.channels.map(c => (
          <div key={c.id} className="dom-row-state">
            <span className="dot dot-pos" />
            <span className="state-label">{c.label}</span>
            <span className={`state-pill ${c.state}`}>{c.state}</span>
          </div>
        ))}
        {d.botRef && (
          <div style={{ marginTop: 8, padding: '8px 10px', background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
            <IconLink size={11} style={{ color: 'var(--fg-muted)' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-muted)' }}>{d.botRef}</span>
          </div>
        )}
      </div>

      {/* apis */}
      <div className="dom-section">
        <div className="dom-section-h"><IconWrench size={11} /> Подключённые API · MCP</div>
        {d.apis.map(a => (
          <div key={a.id} className="dom-row-state">
            <span className="state-label">{a.label}</span>
            <span className={`state-pill ${a.state}`}><span className="dot dot-pos" style={{ marginRight: 5 }} /> {a.state}</span>
          </div>
        ))}
      </div>

      {/* memory or sessions */}
      {d.memory ? (
        <div className="dom-section">
          <div className="dom-section-h"><IconBrain size={11} /> Память</div>
          <DomRow k="Embedding" v={<span className="dom-chip teal">{d.memory.embedding}</span>} />
          <DomRow k="Провайдер" v={<span className="dom-chip amber">{d.memory.provider}</span>} />
          <div className="dom-chip-row">
            {d.memory.flags.map(f => <span key={f} className="dom-chip teal">{f}</span>)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="k" style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--fg-muted)' }}>Пути:</span>
            <div className="dom-chip-row">
              {d.memory.paths.map(p => <span key={p} className="dom-chip">{p}</span>)}
            </div>
          </div>
        </div>
      ) : null}

      <div className="dom-section">
        <div className="dom-section-h"><IconUsers size={11} /> Сессии</div>
        <DomRow k="Изоляция" v={<span className="dom-chip blue">{d.sessions.isolation}</span>} />
        {d.sessions.reset && <DomRow k="Сброс" v={<span className="dom-chip amber">{d.sessions.reset}</span>} />}
        {d.sessions.cleanup && <DomRow k="Очистка" v={<span className="dom-chip">{d.sessions.cleanup}</span>} />}
      </div>

      {d.gateway && (
        <div className="dom-section">
          <div className="dom-section-h"><IconShield size={11} /> Gateway</div>
          <DomRow k="Порт" v={String(d.gateway.port)} />
          <DomRow k="Режим" v={<span className="dom-chip">{d.gateway.mode}</span>} />
        </div>
      )}
    </div>
  );
}

function DomRow({ k, v }) {
  return (
    <div className="dom-row">
      <span className="k">{k}:</span>
      {typeof v === 'string' || typeof v === 'number'
        ? <span className="v">{v}</span>
        : v}
    </div>
  );
}

/* — Настройка домена: добавление MCP / API / файлов / контекста — */
const RES_INFO = {
  mcp:     { title: 'Добавить MCP-сервер', label2: 'Адрес сервера',       ph2: 'stdio:// или https://…',          toast: 'MCP-сервер подключён' },
  api:     { title: 'Добавить API',        label2: 'Базовый URL',         ph2: 'https://api.example.com/v1',      toast: 'API подключён' },
  files:   { title: 'Добавить файлы',      label2: 'Путь / хранилище',    ph2: 'BANK/ или путь к каталогу',       toast: 'Файлы добавлены в домен' },
  context: { title: 'Добавить контекст',   label2: 'Описание контекста',  ph2: 'Что должно быть в контексте домена', textarea: true, toast: 'Контекст добавлен в домен' },
};

function AddResourceModal({ domain, type, onClose }) {
  const info = RES_INFO[type] || RES_INFO.mcp;
  const [name, setName] = React.useState('');
  const [val, setVal] = React.useState('');
  const valid = name.trim().length > 0 && val.trim().length > 0;
  const submit = () => {
    onClose();
    if (window.notify) window.notify({ title: info.toast, body: `${domain.name} · ${name.trim()}`, kind: 'success' });
  };
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="modal-title">{info.title} · {domain.name}</div>
          <button className="icon-btn" style={{ width: 28, height: 28 }} onClick={onClose}><IconX size={13} /></button>
        </div>
        <div className="modal-body">
          <div className="field-stack">
            <div className="field-label">Название *</div>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Короткое имя ресурса" />
          </div>
          <div className="field-stack">
            <div className="field-label">{info.label2} *</div>
            {info.textarea
              ? <textarea className="textarea" value={val} onChange={(e) => setVal(e.target.value)} rows={4} placeholder={info.ph2} />
              : <input className="input mono" value={val} onChange={(e) => setVal(e.target.value)} placeholder={info.ph2} />}
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn btn-neutral" onClick={onClose}>Отмена</button>
          <button className="btn btn-primary" disabled={!valid} onClick={submit}><IconPlus size={11} /> Добавить</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Пользователи ─── */
function AdminUsers({ enterAs }) {
  const [users, setUsers] = React.useState(OESDATA.users);
  const [search, setSearch] = React.useState('');
  const [expanded, setExpanded] = React.useState(null);
  const [addOpen, setAddOpen] = React.useState(false);
  const [editing, setEditing] = React.useState(null);
  const [deleting, setDeleting] = React.useState(null);

  const list = users.filter(u =>
    !search || u.name.toLowerCase().includes(search.toLowerCase())
            || u.position.toLowerCase().includes(search.toLowerCase())
            || u.email.toLowerCase().includes(search.toLowerCase())
  );

  const onCreate = (u) => {
    setUsers([{ ...u, id: 'u-' + Math.random().toString(16).slice(2, 6) }, ...users]);
    setAddOpen(false);
  };
  const onUpdate = (u) => {
    setUsers(users.map(x => x.id === u.id ? u : x));
    setEditing(null);
  };
  const onDelete = (u) => {
    setUsers(users.filter(x => x.id !== u.id));
    setDeleting(null);
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px', background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: 'var(--r-md)', minWidth: 320 }}>
          <IconSearch size={13} style={{ color: 'var(--fg-muted)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
                 placeholder="Поиск по имени, должности или email"
                 style={{ background: 'transparent', border: 0, outline: 0, fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--fg)', flex: 1 }} />
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-muted)' }}>{list.length} из {users.length}</span>
        <span style={{ flex: 1 }} />
        <button className="btn btn-primary" onClick={() => setAddOpen(true)}><IconPlus size={11} /> Добавить пользователя</button>
      </div>

      <div className="utable">
        <div className="utable-head">
          <span>Пользователь</span>
          <span>Должность</span>
          <span>Роль</span>
          <span>Домены</span>
          <span>Статус</span>
          <span style={{ textAlign: 'right' }}>Действия</span>
        </div>
        {list.map((u, i) => {
          const isOpen = expanded === u.id;
          return (
            <React.Fragment key={u.id}>
              <div className={`utable-row ${isOpen ? 'open' : ''}`} onClick={() => setExpanded(isOpen ? null : u.id)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                  <span style={{
                    width: 28, height: 28, borderRadius: 999,
                    background: 'linear-gradient(135deg, var(--teal-600), var(--teal-400))',
                    color: 'var(--fg-on-teal)',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600, flexShrink: 0,
                  }}>{u.initials}</span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--fg)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</div>
                  </div>
                </div>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--fg)' }}>{u.position}</div>
                <div><UserRolePill role={u.role} /></div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {u.domains.length === 0
                    ? <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-muted)' }}>—</span>
                    : u.domains.map(did => <span key={did} className="dom-chip teal">{did}</span>)}
                </div>
                <div>
                  {u.active
                    ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--pos)' }}><span className="dot dot-pos" /> активен</span>
                    : <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-muted)' }}><span className="dot" style={{ background: 'var(--fg-muted)' }} /> off</span>}
                </div>
                <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                  <button className="icon-btn" style={{ width: 28, height: 28, color: 'var(--warn-orange)' }} title="Войти под этим пользователем" onClick={(e) => { e.stopPropagation(); enterAs && enterAs(u); }} disabled={!u.active}>
                    <IconLogOut size={12} />
                  </button>
                  <button className="icon-btn" style={{ width: 28, height: 28 }} title="Редактировать" onClick={(e) => { e.stopPropagation(); setEditing(u); }}><IconEdit size={12} /></button>
                  <button className="icon-btn" style={{ width: 28, height: 28 }} title="Удалить" onClick={(e) => { e.stopPropagation(); setDeleting(u); }}><IconTrash size={12} /></button>
                </div>
              </div>
              {isOpen && (
                <div className="utable-expand">
                  <UserDomainSettings user={u} />
                </div>
              )}
            </React.Fragment>
          );
        })}
        {list.length === 0 && (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--fg-muted)', fontFamily: 'var(--font-sans)', fontSize: 13 }}>
            Ничего не найдено
          </div>
        )}
      </div>

      {addOpen && <UserModal mode="create" onClose={() => setAddOpen(false)} onSave={onCreate} />}
      {editing && <UserModal mode="edit" user={editing} onClose={() => setEditing(null)} onSave={onUpdate} />}
      {deleting && <DeleteUserModal user={deleting} onClose={() => setDeleting(null)} onConfirm={() => onDelete(deleting)} />}
    </div>
  );
}

function UserRolePill({ role }) {
  const map = {
    admin:   { label: 'Admin',   color: 'var(--teal-400)', bg: 'rgba(29,184,154,0.10)', b: 'rgba(29,184,154,0.30)', icon: <IconShield size={10} /> },
    user:    { label: 'User',    color: 'var(--info)',     bg: 'rgba(106,158,184,0.10)', b: 'rgba(106,158,184,0.30)', icon: <IconUser size={10} /> },
    pending: { label: 'Pending', color: 'var(--warn-orange)', bg: 'rgba(196,124,50,0.10)', b: 'rgba(196,124,50,0.30)', icon: <IconClock size={10} /> },
    'sub-admin': { label: 'Sub-admin', color: 'var(--info)', bg: 'rgba(106,158,184,0.10)', b: 'rgba(106,158,184,0.30)', icon: <IconShield size={10} /> },
    'no-auth': { label: 'No Auth', color: 'var(--fg-muted)', bg: 'var(--surface-2)', b: 'var(--border)', icon: <IconLock size={10} /> },
  };
  const m = map[role] || map.user;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.10em', textTransform: 'uppercase',
      padding: '4px 9px', borderRadius: 'var(--r-xs)',
      color: m.color, background: m.bg, border: '0.5px solid ' + m.b,
    }}>{m.icon} {m.label}</span>
  );
}

/* Expanded user → shows settings per each connected domain (unified template) */
function UserDomainSettings({ user }) {
  const userDomains = OESDATA.domains.filter(d => user.domains.includes(d.id));
  const [active, setActive] = React.useState(userDomains[0]?.id);
  if (userDomains.length === 0) {
    return (
      <div style={{ padding: 14, textAlign: 'center', fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--fg-muted)' }}>
        Пользователь не подключён ни к одному домену
      </div>
    );
  }
  return (
    <div style={{ background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: 'var(--r-md)', padding: 16 }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        {userDomains.map(d => (
          <button key={d.id} onClick={() => setActive(d.id)} style={{
            padding: '5px 12px', borderRadius: 4,
            background: active === d.id ? 'var(--teal-dim)' : 'var(--surface-2)',
            border: '0.5px solid ' + (active === d.id ? 'var(--teal-400)' : 'var(--border)'),
            color: active === d.id ? 'var(--teal-400)' : 'var(--fg-muted)',
            fontFamily: 'var(--font-mono)', fontSize: 11, cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: 6,
          }}>
            <CubeLogo size={11} color="currentColor" /> {d.name}
          </button>
        ))}
      </div>
      {userDomains.filter(d => d.id === active).map(d => (
        <DomainBody key={d.id} d={d} compact />
      ))}
    </div>
  );
}

/* ─── User create/edit modal ─── */
function UserModal({ mode, user, onClose, onSave }) {
  const initial = user || { name: '', position: '', role: 'user', domains: [], telegramId: '', teamsId: '', teamsName: '', active: true, email: '', initials: '' };
  const [f, setF] = React.useState(initial);
  const update = (k, v) => setF({ ...f, [k]: v });
  const isValid = f.name.trim().length > 0;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="modal-title">{mode === 'create' ? 'Новый пользователь' : 'Редактирование пользователя'}</div>
          <button className="icon-btn" style={{ width: 28, height: 28 }} onClick={onClose}><IconX size={13} /></button>
        </div>
        <div className="modal-body">
          <div className="field-stack">
            <div className="field-label">Имя пользователя *</div>
            <input className="input" value={f.name} onChange={e => update('name', e.target.value)} placeholder="Иванов Иван" />
          </div>

          <div className="field-stack">
            <div className="field-label">Роль *</div>
            <div className="role-card-grid">
              <RoleCard active={f.role === 'admin'}   onClick={() => update('role', 'admin')}   icon={<IconShield size={13} />} label="Admin" />
              <RoleCard active={f.role === 'sub-admin'} onClick={() => update('role', 'sub-admin')} icon={<IconShield size={13} />} label="Sub-admin" />
              <RoleCard active={f.role === 'user'}     onClick={() => update('role', 'user')}     icon={<IconUser size={13} />}   label="User" />
              <RoleCard active={f.role === 'pending'}  onClick={() => update('role', 'pending')}  icon={<IconClock size={13} />}  label="Pending" />
              <RoleCard active={f.role === 'no-auth'}  onClick={() => update('role', 'no-auth')}  icon={<IconLock size={13} />}   label="No Auth" />
            </div>
          </div>

          <div className="field-grid-2">
            <div className="field-stack">
              <div className="field-label">Telegram ID</div>
              <input className="input mono" value={f.telegramId} onChange={e => update('telegramId', e.target.value)} placeholder="908812437" />
            </div>
            <div className="field-stack">
              <div className="field-label">Teams ID</div>
              <input className="input mono" value={f.teamsId} onChange={e => update('teamsId', e.target.value)} placeholder="AAD Object ID" />
            </div>
          </div>

          <div className="field-stack">
            <div className="field-label">Teams Display Name</div>
            <input className="input" value={f.teamsName} onChange={e => update('teamsName', e.target.value)} placeholder="Имя в Teams" />
          </div>

          <div className="field-stack">
            <div className="field-label">Домен</div>
            <DomainSelect value={f.domains} onChange={(v) => update('domains', v)} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 4 }}>
            <ToggleSwitch value={f.active} onChange={v => update('active', v)} />
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: f.active ? 'var(--teal-400)' : 'var(--fg-muted)' }}>{f.active ? 'Активен' : 'Отключён'}</span>
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn btn-neutral" onClick={onClose}>Отмена</button>
          <button className="btn btn-primary" disabled={!isValid} onClick={() => onSave({ ...f, initials: makeInitials(f.name) })}>
            {mode === 'create' ? 'Создать' : 'Сохранить'}
          </button>
        </div>
      </div>
    </div>
  );
}

function RoleCard({ active, onClick, icon, label }) {
  return (
    <button className={`role-card ${active ? 'active' : ''}`} onClick={onClick}>
      <span className="role-card-icon">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function DomainSelect({ value, onChange }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!open) return;
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);
  const toggleDomain = (id) => {
    if (value.includes(id)) onChange(value.filter(v => v !== id));
    else onChange([...value, id]);
  };
  const labelText = value.length === 0 ? 'Все домены' : value.length === OESDATA.domains.length ? 'Все домены' : value.join(', ');
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(!open)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 12px', borderRadius: 'var(--r-sm)',
          background: 'var(--surface-2)', border: '0.5px solid ' + (open ? 'var(--teal-400)' : 'var(--border)'),
          fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--fg)', cursor: 'pointer',
        }}>
        <span style={{ flex: 1, textAlign: 'left' }}>{labelText}</span>
        <IconChevronDown size={12} style={{ color: 'var(--fg-muted)', transform: open ? 'rotate(180deg)' : 'rotate(0)' }} />
      </button>
      {open && (
        <div className="popover" style={{ top: 'calc(100% + 4px)', left: 0, right: 0, width: 'auto' }}>
          {OESDATA.domains.map(d => {
            const checked = value.includes(d.id);
            return (
              <button key={d.id} className="popover-item" onClick={() => toggleDomain(d.id)}>
                <span style={{ width: 14, height: 14, borderRadius: 3, border: '0.5px solid ' + (checked ? 'var(--teal-400)' : 'var(--border-strong)'), background: checked ? 'var(--teal-400)' : 'transparent', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fg-on-teal)' }}>
                  {checked && <IconCheck size={9} />}
                </span>
                <span>{d.name}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ToggleSwitch({ value, onChange }) {
  return (
    <button onClick={() => onChange(!value)} style={{
      width: 40, height: 22, borderRadius: 999,
      background: value ? 'var(--teal-400)' : 'var(--surface-3)',
      border: '0.5px solid ' + (value ? 'var(--teal-400)' : 'var(--border)'),
      position: 'relative', transition: 'all .18s var(--ease-apple)', cursor: 'pointer',
    }}>
      <span style={{
        position: 'absolute', top: 1.5, left: value ? 20 : 1.5,
        width: 17, height: 17, borderRadius: 999,
        background: 'var(--fg-on-teal)',
        transition: 'all .18s var(--ease-apple)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.30)',
      }} />
    </button>
  );
}

function DeleteUserModal({ user, onClose, onConfirm }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ width: 460 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <IconTrash size={15} style={{ color: 'var(--neg)' }} />
            Удалить пользователя
          </div>
          <button className="icon-btn" style={{ width: 28, height: 28 }} onClick={onClose}><IconX size={13} /></button>
        </div>
        <div className="modal-body">
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--fg)', lineHeight: 1.55 }}>
            Удалить пользователя <span style={{ color: 'var(--neg)', fontWeight: 500 }}>{user.name}</span>?<br/>
            Доступ ко всем доменам будет отозван немедленно. Решения, созданные этим пользователем, останутся в системе.
          </div>
          <div style={{ padding: 12, background: 'rgba(224,82,82,0.08)', border: '0.5px solid rgba(224,82,82,0.30)', borderRadius: 'var(--r-md)', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--neg)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <IconAlertCircle size={13} /> Действие необратимо.
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn btn-neutral" onClick={onClose}>Отмена</button>
          <button className="btn btn-danger" onClick={onConfirm}><IconTrash size={11} /> Удалить</button>
        </div>
      </div>
    </div>
  );
}

function makeInitials(name) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '??';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export { SectionAdmin };
