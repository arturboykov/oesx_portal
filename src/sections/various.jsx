import React from 'react';
import {
  IconDownload, IconSearch, IconShare, IconFork, IconGitBranch, IconMoreH, IconEye,
  IconEdit, IconTrash, IconX, IconAlertCircle, IconShield, IconStar, IconSliders,
  IconBookOpen, IconClock, IconUsers, IconLock, IconLink, IconSettings, IconMail,
  IconPaperclip, IconSend, IconChevronRight, IconUser, IconDatabase, IconBell,
  IconWrench, IconChevronDown, IconPlay, IconPause, IconCheck, IconPlus, IconBrain,
  IconCpu, IconMailOpen, ChannelGlyph, CubeLogo,
} from '../icons.jsx';
import { Chip, KindChip, Kpi, SourceKind } from '../parts.jsx';
import { OESDATA } from '../data.jsx';
import { currentMe } from '../user.jsx';
import { CreateButton } from '../shell.jsx';
import { ShareModal } from './solution-view.jsx';
import { downloadCSV, makeShortId } from '../utils.jsx';

import { Modal } from '../portal.jsx';
/* My Solutions — каталог артефактов с фильтрами и действиями */

const KIND_LABEL_RU = { dash: 'Дашборд', alert: 'Алерт', command: 'Команда' };

function SectionSolutions({ setRoute, openCreate, openSolution, openEdit, editInChat, tweak }) {
  const t = tweak || { userRole: 'user' };
  const me = currentMe(t.userRole);
  const isAdmin = me.systemRole === 'admin';

  // Local copy so enable/disable and delete/undo reflect immediately.
  const [sols, setSols] = React.useState(OESDATA.solutions);
  const [filter, setFilter] = React.useState('all');
  const [scope, setScope] = React.useState('all'); // 'all' | 'mine' | 'granted'
  const [search, setSearch] = React.useState('');
  const [historyFor, setHistoryFor] = React.useState(null);
  const [deletingId, setDeletingId] = React.useState(null);
  const [sharingId, setSharingId] = React.useState(null);

  // scope: «Мои решения» + «Предоставлен доступ» = «Все»
  const inScope = (s) =>
    scope === 'all' ? true : scope === 'mine' ? s.author === me.name : s.author !== me.name;
  const list = sols.filter((s) =>
    inScope(s) &&
    (filter === 'all' || s.kind === filter) &&
    (search === '' || s.name.toLowerCase().includes(search.toLowerCase())));

  const scoped = sols.filter(inScope);
  const counts = {
    all: scoped.length,
    dash: scoped.filter((s) => s.kind === 'dash').length,
    alert: scoped.filter((s) => s.kind === 'alert').length,
    command: scoped.filter((s) => s.kind === 'command').length,
  };
  const mineCount = sols.filter((s) => s.author === me.name).length;
  const grantedCount = sols.filter((s) => s.author !== me.name).length;

  const toggleEnabled = (sol) => {
    setSols((prev) => prev.map((s) => (s.id === sol.id ? { ...s, enabled: !s.enabled } : s)));
    if (window.notify) window.notify({
      title: sol.enabled ? 'Решение отключено' : 'Решение включено',
      body: sol.name, kind: 'success',
    });
  };

  // Delete with a 5-second «Отменить» window in the toast.
  const confirmDelete = () => {
    const idx = sols.findIndex((s) => s.id === deletingId);
    const removed = sols[idx];
    setDeletingId(null);
    if (!removed) return;
    setSols((prev) => prev.filter((s) => s.id !== removed.id));
    if (window.notify) window.notify({
      title: 'Решение удалено',
      body: removed.name,
      kind: 'success',
      action: {
        label: 'Отменить',
        onClick: () => setSols((prev) => {
          if (prev.some((s) => s.id === removed.id)) return prev;
          const n = [...prev];
          n.splice(Math.min(idx, n.length), 0, removed);
          return n;
        }),
      },
    });
  };

  const exportCSV = () => {
    downloadCSV(
      `oes-x-решения-${new Date().toISOString().slice(0, 10)}.csv`,
      ['Решение', 'Тип', 'Автор', 'Версия', 'Создание версии', 'Данные обновлены', 'Запусков', 'Источники', 'Статус', 'Активно'],
      list.map((s) => [
        s.name,
        KIND_LABEL_RU[s.kind] || s.kind,
        s.author || '',
        'v' + s.version,
        OESDATA.versionMap[s.id]?.[0]?.date || s.updated || '',
        s.kind === 'dash' ? s.lastRun : '',
        s.runs,
        s.sources.join('; '),
        s.published ? 'опубликовано' : 'черновик',
        s.enabled ? 'да' : 'нет',
      ]),
    );
    if (window.notify) window.notify({ title: 'Таблица решений выгружена', body: `${list.length} строк · CSV`, kind: 'success' });
  };

  return (
    <div className="fade-up">
      <div className="page-head">
        <div>
          <div className="page-title">Решения</div>
          <div className="page-sub">Каталог артефактов · Workspace {OESDATA.me.workspaceId}</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-neutral" onClick={exportCSV}><IconDownload size={12} /> Экспорт</button>
          <CreateButton openCreate={openCreate} variant="primary" />
        </div>
      </div>

      {/* Scope toggle: Все | Мои решения | Предоставлен доступ */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div style={{
          display: 'inline-flex', padding: 3, background: 'var(--surface-2)',
          border: '0.5px solid var(--border)', borderRadius: 6
        }}>
          {[
          { id: 'all', label: 'Все', count: sols.length },
          { id: 'mine', label: 'Мои решения', count: mineCount },
          { id: 'granted', label: 'Предоставлен доступ', count: grantedCount }].
          map((o) =>
          <button
            key={o.id}
            onClick={() => setScope(o.id)}
            style={{
              padding: '6px 14px', borderRadius: 4,
              background: scope === o.id ? 'var(--surface)' : 'transparent',
              border: '0.5px solid ' + (scope === o.id ? 'var(--border-strong)' : 'transparent'),
              fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.04em',
              color: scope === o.id ? 'var(--teal-400)' : 'var(--fg-muted)',
              cursor: 'pointer', transition: 'all .15s var(--ease-apple)',
              display: 'inline-flex', alignItems: 'center', gap: 6
            }}>

              {o.label}
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, opacity: 0.7 }}>· {o.count}</span>
            </button>
          )}
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-muted)', letterSpacing: '0.06em' }}>
          {scope === 'mine' ?
          `${me.name} · можно редактировать` :
          scope === 'granted' ?
          'Чужие решения · просмотр и форк' :
          `Все решения подразделения · ${isAdmin ? 'у вас полный доступ' : 'чужие — только просмотр или форк'}`}
        </span>
      </div>

      <div className="tabs">
        {[
        { id: 'all', label: `Все · ${counts.all}` },
        { id: 'dash', label: `Дашборды · ${counts.dash}` },
        { id: 'alert', label: `Алерты · ${counts.alert}` },
        { id: 'command', label: `Команды · ${counts.command}` }].
        map((tb) =>
        <div key={tb.id} className={`tab ${filter === tb.id ? 'active' : ''}`} onClick={() => setFilter(tb.id)}>{tb.label}</div>
        )}
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', background: 'var(--surface-2)', border: '0.5px solid var(--border)', borderRadius: 4, minWidth: 220 }}>
            <IconSearch size={12} style={{ color: 'var(--fg-muted)' }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск…"
            style={{ background: 'transparent', border: 0, outline: 0, fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--fg)', flex: 1 }} />
          </div>
        </div>
      </div>

      <div style={{ background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: SOL_COLS,
          padding: '10px 16px', background: 'var(--surface-2)',
          fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.10em',
          textTransform: 'uppercase', color: 'var(--fg-muted)',
          borderBottom: '0.5px solid var(--border-strong)'
        }}>
          <span></span>{/* Актив. — узкая колонка с точкой, без заголовка */}
          <span>Решение</span>
          <span>Тип</span>
          <span>Автор</span>
          <span>Версия</span>
          <span>Запусков</span>
          <span>Источники</span>
          <span>Статус</span>
          <span></span>
        </div>
        {list.map((s, i) => {
          const isOwner = s.author === me.name;
          const canEdit = isAdmin || isOwner;
          return (
            <SolutionRow
              key={s.id} sol={s} alt={i % 2 === 0}
              isOwner={isOwner} canEdit={canEdit}
              onView={() => openSolution(s.id)}
              onEdit={() => openEdit && openEdit(s.id)}
              onToggle={() => toggleEnabled(s)}
              onFork={() => {
                if (editInChat) {
                  editInChat(s.id, s.version, 'fork');
                } else if (window.notify) {
                  window.notify({
                    title: 'Открыт новый чат',
                    body: `«${s.name}» — опишите, что хотим изменить.`,
                    kind: 'success'
                  });
                }
              }}
              onHistory={() => setHistoryFor(s)}
              onShare={() => setSharingId(s.id)}
              onDelete={() => setDeletingId(s.id)} />);


        })}
        {list.length === 0 &&
        <div style={{ padding: 32, textAlign: 'center', color: 'var(--fg-muted)', fontFamily: 'var(--font-sans)', fontSize: 13 }}>
            {scope === 'mine' ? 'Вы пока не создали ни одного решения'
              : scope === 'granted' ? 'Вам не предоставлен доступ к чужим решениям'
              : 'Ничего не найдено'}
          </div>
        }
      </div>
      {historyFor && <VersionHistoryModal sol={historyFor} onClose={() => setHistoryFor(null)} onOpenVersion={(v) => {setHistoryFor(null);openSolution(historyFor.id, v);}} />}
      {deletingId && <DeleteSolutionModal id={deletingId} onClose={() => setDeletingId(null)} onConfirm={confirmDelete} />}
      {sharingId && <ShareModal sol={sols.find((s) => s.id === sharingId)} onClose={() => setSharingId(null)} />}
    </div>);

}

/* Shared column template — keeps header and rows in sync.
   Актив. · Решение · Тип · Автор · Версия · Запусков · Источники · Статус · меню
   Колонка «Версия» содержит номер версии + дату её создания (= последней редакции),
   поэтому отдельной колонки «Обновлено» больше нет. */
const SOL_COLS = '28px 1.5fr 116px 128px 120px 74px 110px 116px 30px';

function SolutionRow({ sol, alt, isOwner, canEdit, onView, onEdit, onToggle, onFork, onHistory, onDelete, onShare }) {
  const [hover, setHover] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const menuRef = React.useRef(null);
  const versions = OESDATA.versionMap[sol.id] || [];
  React.useEffect(() => {
    if (!menuOpen) return;
    const close = (e) => {if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);};
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [menuOpen]);
  // Compact initials for the author avatar
  const authorInitials = sol.authorInitials || (sol.author ? sol.author.split(' ').slice(0, 1).map((w) => w[0]).join('') + (sol.author.split(' ')[1] ? sol.author.split(' ')[1][0] : '') : '—');
  return (
    <div
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      onClick={onView}
      style={{
        display: 'grid', gridTemplateColumns: SOL_COLS,
        padding: '12px 16px', alignItems: 'center',
        background: hover ? 'var(--surface-3)' : alt ? 'rgba(255,255,255,0.012)' : 'transparent',
        borderBottom: '0.5px solid var(--border)',
        cursor: 'pointer', transition: 'background .15s'
      }}>
      {/* Актив.: точка слева — зелёная (активно) / слабо-серая (выключено) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} title={sol.enabled ? 'Активно' : 'Выключено'}>
        <span style={{
          width: 8, height: 8, borderRadius: 999, display: 'inline-block',
          background: sol.enabled ? 'var(--pos)' : 'var(--fg-dim)',
          boxShadow: sol.enabled ? '0 0 6px rgba(29,184,154,0.55)' : 'none',
          opacity: sol.enabled ? 1 : 0.45,
        }} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 500, color: 'var(--fg)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
          {sol.name}
          {sol.shared && <IconShare size={11} style={{ color: 'var(--pos)' }} />}
          {sol.forkOf && <IconFork size={11} style={{ color: 'var(--info)' }} />}
        </div>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: 'var(--fg-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sol.desc}</div>
      </div>
      <div><KindChip kind={sol.kind} /></div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
        <span style={{
          width: 22, height: 22, borderRadius: 999, flexShrink: 0,
          background: isOwner ? 'linear-gradient(135deg, var(--teal-600), var(--teal-400))' : 'var(--surface-2)',
          color: isOwner ? 'var(--fg-on-teal)' : 'var(--fg-muted)',
          border: '0.5px solid ' + (isOwner ? 'var(--teal-400)' : 'var(--border)'),
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 600, letterSpacing: '0.04em'
        }}>{authorInitials}</span>
        <span style={{
          fontFamily: 'var(--font-sans)', fontSize: 11, minWidth: 0,
          color: isOwner ? 'var(--teal-400)' : 'var(--fg)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
        }} title={sol.author + (isOwner ? ' (вы)' : '')}>
          {sol.author || '—'}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 3 }}>
        <button
          onClick={(e) => {e.stopPropagation();onHistory && onHistory();}}
          title={`История версий (${versions.length})`}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 8px', borderRadius: 4, background: 'var(--teal-dim)', border: '0.5px solid var(--border-strong)', color: 'var(--teal-400)', fontFamily: 'var(--font-mono)', fontSize: 11, cursor: 'pointer' }}>
          <IconGitBranch size={10} /> v{sol.version}
        </button>
        {versions[0]?.date &&
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-muted)', whiteSpace: 'nowrap' }}>
            {versions[0].date}
          </span>
        }
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg)' }}>{sol.runs.toLocaleString('ru')}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {sol.sources.slice(0, 2).map((src) =>
        <span key={src} style={{
          fontFamily: 'var(--font-mono)', fontSize: 9, padding: '2px 6px',
          background: 'var(--surface-2)', border: '0.5px solid var(--border)',
          borderRadius: 3, color: 'var(--fg-muted)', whiteSpace: 'nowrap'
        }}>{src.split('.').pop()}</span>
        )}
        {sol.sources.length > 2 && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--fg-muted)' }}>+{sol.sources.length - 2}</span>}
      </div>
      {/* Статус: черновик / опубликовано */}
      <div>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          fontFamily: 'var(--font-mono)', fontSize: 10,
          color: sol.published ? 'var(--pos)' : 'var(--fg-muted)'
        }}>
          {sol.published ? <IconCheck size={11} /> : <IconEdit size={11} />}
          {sol.published ? 'опубликовано' : 'черновик'}
        </span>
      </div>
      <div ref={menuRef} style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
        <button className="icon-btn" style={{ width: 26, height: 26, opacity: hover || menuOpen ? 1 : 0.5 }} aria-label="Действия" title="Действия" onClick={() => setMenuOpen(!menuOpen)}>
          <IconMoreH size={13} />
        </button>
        {menuOpen &&
        <div className="popover" style={{ top: 'calc(100% + 4px)', right: 0, width: 220 }}>
            <button className="popover-item" onClick={() => {setMenuOpen(false);onView && onView();}}>
              <IconEye size={13} /> Просмотр
            </button>
            {canEdit ?
          <button className="popover-item" onClick={() => {setMenuOpen(false);onEdit && onEdit();}}>
                <IconEdit size={13} /> Редактировать
              </button> :

          <button className="popover-item" onClick={() => {setMenuOpen(false);onFork && onFork();}}>
                <IconFork size={13} /> Форкнуть в чат
              </button>
          }
            {sol.published &&
          <button className="popover-item" onClick={() => {setMenuOpen(false);onShare && onShare();}}>
                <IconShare size={13} /> Поделиться
              </button>
          }
            {canEdit &&
          <button className="popover-item" onClick={() => {setMenuOpen(false);onToggle && onToggle();}}>
                {sol.enabled
                  ? <><IconPause size={13} /> Отключить</>
                  : <><IconPlay size={13} /> Включить</>}
              </button>
          }
            {canEdit && <div className="popover-divider" />}
            {canEdit &&
          <button className="popover-item" style={{ color: 'var(--neg)' }} onClick={() => {setMenuOpen(false);onDelete && onDelete();}}>
                <IconTrash size={13} /> Удалить
              </button>
          }
          </div>
        }
      </div>
    </div>);

}

/* History modal for a single solution */
function VersionHistoryModal({ sol, onClose, onOpenVersion }) {
  const versions = OESDATA.versionMap[sol.id] || [];
  const [selected, setSelected] = React.useState(versions[0]?.v);
  return (
    <Modal onClose={onClose}>
      <div className="modal" style={{ width: 640 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <IconGitBranch size={15} style={{ color: 'var(--teal-400)' }} /> История версий
          </div>
          <button className="icon-btn" style={{ width: 28, height: 28 }} onClick={onClose}><IconX size={13} /></button>
        </div>
        <div className="modal-body">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <KindChip kind={sol.kind} />
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 500, color: 'var(--fg)' }}>{sol.name}</span>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{versions.length} версий · последняя — v{versions[0]?.v}</div>
          <div style={{ position: 'relative', paddingLeft: 18 }}>
            <div style={{ position: 'absolute', left: 6, top: 6, bottom: 6, width: 1, background: 'var(--border-strong)' }} />
            {versions.map((v, i) => {
              const active = selected === v.v;
              const isLatest = i === 0;
              return (
                <button key={v.v} onClick={() => setSelected(v.v)} style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '12px 14px', borderRadius: 6, marginBottom: 8,
                  background: active ? 'var(--teal-dim)' : 'var(--surface-2)',
                  border: '0.5px solid ' + (active ? 'var(--teal-400)' : 'var(--border)'),
                  position: 'relative', cursor: 'pointer'
                }}>
                  <span style={{ position: 'absolute', left: -18, top: 18, width: 13, height: 13, borderRadius: 999, background: active ? 'var(--teal-400)' : 'var(--surface)', border: '1.5px solid ' + (active ? 'var(--teal-400)' : 'var(--border-strong)') }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, color: active ? 'var(--teal-400)' : 'var(--fg)' }}>v{v.v}</span>
                    {isLatest && <Chip kind="pos">ТЕКУЩАЯ</Chip>}
                    <span style={{ flex: 1 }} />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-muted)' }}>{v.date}</span>
                  </div>
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--fg)', lineHeight: 1.5, marginBottom: 4 }}>{v.note}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-muted)' }}>{v.author}</div>
                </button>);

            })}
          </div>
        </div>
        <div className="modal-foot">
          <span style={{ flex: 1, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-muted)' }}>
            Новую версию можно создать из открытой версии
          </span>
          <button className="btn btn-neutral" onClick={onClose}>Закрыть</button>
          <button className="btn btn-primary" onClick={() => onOpenVersion(selected)}><IconEye size={11} /> Открыть v{selected}</button>
        </div>
      </div>
    </Modal>);

}

/* Delete solution confirmation modal */
function DeleteSolutionModal({ id, onClose, onConfirm }) {
  const sol = OESDATA.solutions.find((s) => s.id === id);
  if (!sol) return null;
  return (
    <Modal onClose={onClose}>
      <div className="modal" style={{ width: 460 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <IconTrash size={15} style={{ color: 'var(--neg)' }} />
            Удалить решение
          </div>
          <button className="icon-btn" style={{ width: 28, height: 28 }} onClick={onClose}><IconX size={13} /></button>
        </div>
        <div className="modal-body">
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--fg)', lineHeight: 1.55 }}>
            Удалить решение <span style={{ color: 'var(--neg)', fontWeight: 500 }}>{sol.name}</span>?<br />
            Все версии и история будут удалены.
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
    </Modal>);

}

/* — Memory — */
function SectionMemory() {
  const [list, setList] = React.useState(OESDATA.memory);
  const togglePin = (id) => setList(list.map((m) => m.id === id ? { ...m, pinned: !m.pinned } : m));
  const removeItem = (id) => setList(list.filter((m) => m.id !== id));
  const groups = {
    pinned: list.filter((m) => m.pinned),
    preference: list.filter((m) => !m.pinned && m.kind === 'preference'),
    fact: list.filter((m) => !m.pinned && m.kind === 'fact'),
    session: list.filter((m) => !m.pinned && (m.kind === 'session' || m.kind === 'history'))
  };
  return (
    <div className="main-narrow fade-up">
      <div className="page-head">
        <div>
          <div className="page-title">Память Workspace</div>
          <div className="page-sub">Контекст, предпочтения и история · приватно · не передаётся другим пользователям</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-neutral"><IconDownload size={12} /> Экспорт</button>
          <button className="btn btn-danger"><IconTrash size={12} /> Очистить всё</button>
        </div>
      </div>

      <div style={{ background: 'rgba(106,158,184,0.06)', border: '0.5px solid rgba(106,158,184,0.20)', borderRadius: 'var(--r-lg)', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
        <IconShield size={16} style={{ color: 'var(--info)' }} />
        <div style={{ flex: 1, fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--fg-muted)', lineHeight: 1.55 }}>
          Память изолирована на уровне Workspace. Решения из Marketplace, форкнутые другими сотрудниками, не получают доступа к этому контексту — работают только с памятью получателя.
        </div>
      </div>

      <MemoryGroup title="Закреплено" icon={<IconStar size={11} />} items={groups.pinned} onTogglePin={togglePin} onRemove={removeItem} />
      <MemoryGroup title="Предпочтения" icon={<IconSliders size={11} />} items={groups.preference} onTogglePin={togglePin} onRemove={removeItem} />
      <MemoryGroup title="Факты и определения" icon={<IconBookOpen size={11} />} items={groups.fact} onTogglePin={togglePin} onRemove={removeItem} />
      <MemoryGroup title="Контекст сессии и история" icon={<IconClock size={11} />} items={groups.session} onTogglePin={togglePin} onRemove={removeItem} />
    </div>);

}

function MemoryGroup({ title, icon, items, onTogglePin, onRemove }) {
  if (items.length === 0) return null;
  return (
    <>
      <div className="section-head">
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 500, color: 'var(--fg)' }}>{icon} {title}</span>
        <span className="sh-count">{items.length}</span>
        <div className="sh-line" />
      </div>
      <div style={{ background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
        {items.map((m, i) =>
        <div key={m.id} style={{
          display: 'grid', gridTemplateColumns: '180px 1fr 110px 80px',
          padding: '12px 16px', alignItems: 'center', gap: 12,
          borderBottom: i < items.length - 1 ? '0.5px solid var(--border)' : 'none'
        }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{m.label}</span>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--fg)', lineHeight: 1.5 }}>{m.value}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-muted)' }}>{m.updated}</span>
            <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
              <button className="icon-btn" style={{ width: 26, height: 26, color: m.pinned ? 'var(--warn)' : 'var(--fg-muted)' }} onClick={() => onTogglePin(m.id)} title="Закрепить"><IconStar size={11} /></button>
              <button className="icon-btn" style={{ width: 26, height: 26 }} title="Редактировать"><IconEdit size={11} /></button>
              <button className="icon-btn" style={{ width: 26, height: 26 }} onClick={() => onRemove(m.id)} title="Удалить"><IconTrash size={11} /></button>
            </div>
          </div>
        )}
      </div>
    </>);

}

/* — Sources — */
function SectionSources() {
  return (
    <div className="main-narrow fade-up">
      <div className="page-head">
        <div>
          <div className="page-title">Источники данных</div>
          <div className="page-sub">Read-only по умолчанию · подключаются ИТ-администратором</div>
        </div>
        <button className="btn btn-neutral"><IconUsers size={12} /> Запросить доступ</button>
      </div>

      <div style={{ background: 'rgba(14,122,104,0.06)', border: '0.5px solid var(--border-strong)', borderRadius: 'var(--r-lg)', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
        <IconShield size={16} style={{ color: 'var(--teal-400)' }} />
        <div style={{ flex: 1, fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--fg-muted)', lineHeight: 1.55 }}>
          Permission intersection: решения, форкнутые из Marketplace, работают в пересечении прав агента и ваших прав. Если источника нет в списке — попросите ИТ выдать доступ.
        </div>
      </div>

      <div style={{ background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '60px 1.6fr 1fr 100px 100px 100px',
          padding: '10px 16px', background: 'var(--surface-2)',
          fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.10em',
          textTransform: 'uppercase', color: 'var(--fg-muted)',
          borderBottom: '0.5px solid var(--border-strong)'
        }}>
          <span>Тип</span><span>Источник</span><span>ID</span><span style={{ textAlign: 'right' }}>Объём</span><span>Режим</span><span>Доступ</span>
        </div>
        {OESDATA.sources.map((s, i) =>
        <div key={s.id} style={{
          display: 'grid', gridTemplateColumns: '60px 1.6fr 1fr 100px 100px 100px',
          padding: '11px 16px', alignItems: 'center',
          background: i % 2 === 0 ? 'rgba(255,255,255,0.012)' : 'transparent',
          borderBottom: i < OESDATA.sources.length - 1 ? '0.5px solid var(--border)' : 'none',
          opacity: s.granted ? 1 : 0.55
        }}>
            <SourceKind kind={s.kind} />
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--fg)' }}>{s.name}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-muted)' }}>{s.id}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg)', textAlign: 'right' }}>{s.rows}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: s.ro ? 'var(--info)' : 'var(--warn)', display: 'inline-flex', gap: 4, alignItems: 'center' }}><IconLock size={10} /> read-only</span>
            <span>
              {s.granted ?
            <Chip kind="pos" dot>ВЫДАН</Chip> :
            <Chip kind="warn">НЕТ ДОСТУПА</Chip>}
            </span>
          </div>
        )}
      </div>
    </div>);

}

/* — Channels — */
function SectionChannels() {
  return (
    <div className="main-narrow fade-up">
      <div className="page-head">
        <div>
          <div className="page-title">Каналы взаимодействия</div>
          <div className="page-sub">Единый Workspace для всех каналов · память и история общие</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
        {OESDATA.channels.map((c) =>
        <div key={c.kind} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <ChannelGlyph kind={c.kind} size={20} />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 500, color: 'var(--fg)' }}>{c.name}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-muted)', marginTop: 2 }}>{c.meta}</div>
              </div>
              {c.state === 'connected' && <Chip kind="pos" dot>ПОДКЛЮЧЁН</Chip>}
              {c.state === 'pending' && <Chip kind="warn">ОЖИДАЕТ ИТ</Chip>}
              {c.state === 'available' && <Chip kind="neutral">ДОСТУПЕН</Chip>}
            </div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--fg-muted)', lineHeight: 1.5 }}>{c.desc}</div>
            {c.linkedAs &&
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: 'var(--surface-2)', borderRadius: 4, border: '0.5px solid var(--border)' }}>
                <IconLink size={11} style={{ color: 'var(--fg-muted)' }} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-muted)' }}>привязан как</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg)' }}>{c.linkedAs}</span>
              </div>
          }
            <div style={{ display: 'flex', gap: 8 }}>
              {c.state === 'connected' && <><button className="btn btn-neutral btn-sm"><IconSettings size={11} /> Настроить</button><button className="btn btn-neutral btn-sm">Отключить</button></>}
              {c.state === 'pending' && <button className="btn btn-warn btn-sm">Связаться с ИТ</button>}
              {c.state === 'available' && <button className="btn btn-ghost btn-sm">Подключить</button>}
            </div>
          </div>
        )}
      </div>
    </div>);

}

/* — Support — */
function SectionSupport({ tweak }) {
  const me = currentMe(tweak?.userRole || 'user');
  const [tab, setTab] = React.useState('faq');
  const [composeOpen, setComposeOpen] = React.useState(false);
  const [tickets, setTickets] = React.useState(() => initialTickets());
  const [openTicket, setOpenTicket] = React.useState(null);

  const onSubmit = (data) => {
    const num = String(2000 + tickets.length + 1);
    const id = 'OES-' + num;
    const created = '18.05.2026, 16:54';
    setTickets([
    { id, subject: data.subject, body: data.body, attachment: data.attachment, status: 'open', created, updated: created, author: me.name, replies: [] },
    ...tickets]
    );
    setComposeOpen(false);
    setTab('tickets');
    if (window.notify) window.notify({ title: `Обращение ${id} отправлено`, body: data.subject, kind: 'success' });
  };

  const faqs = [
  { q: 'Что такое Personal Workspace?', a: 'Ваше всегда-работающее AI-пространство с памятью, подключёнными источниками, собранными решениями и историей. Полностью изолировано от других сотрудников.' },
  { q: 'Что произойдёт при достижении лимита токенов?', a: 'При 80% — предупреждение в ЛК. При 100% — мягкая остановка: Workspace переходит в режим только-чтения. Уведомление автоматически отправляется руководителю.' },
  { q: 'Может ли коллега увидеть мои данные?', a: 'Нет. Память Workspace приватна. Даже при форке вашего решения из Marketplace коллега получает копию артефакта, но не доступ к вашей памяти, истории или подключённым источникам.' },
  { q: 'Как опубликовать решение в Marketplace?', a: 'Откройте раздел «Мои решения» → решение → «Опубликовать». Заполните метаданные, теги, категорию. ИТ может включить предмодерацию.' },
  { q: 'Что делать, если не хватает доступа к источнику?', a: 'Откройте раздел «Источники», нажмите «Запросить доступ». Заявка уходит ИТ-администратору; обычно решается в течение 1 рабочего дня.' }];


  return (
    <div className="main-narrow fade-up">
      <div className="page-head">
        <div>
          <div className="page-title">Поддержка</div>
          <div className="page-sub">SLA на ответ — 2 часа в рабочее время · 8 часов вне рабочего</div>
        </div>
        <button className="btn btn-primary" onClick={() => setComposeOpen(true)}><IconMail size={12} /> Написать в поддержку</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
        <Kpi label="Среднее время ответа" value="38" unit="мин" sub="за последние 30 дней" />
        <Kpi label="% без эскалации" value="84%" sub="цель ≥ 80%" subTone="pos" tone="pos" />
        <Kpi label="Открытых обращений" value={tickets.filter((t) => t.status === 'open' || t.status === 'in-progress').length} sub={`всего: ${tickets.length}`} />
      </div>

      <div className="tabs">
        <div className={`tab ${tab === 'faq' ? 'active' : ''}`} onClick={() => setTab('faq')}>База знаний · {faqs.length}</div>
        <div className={`tab ${tab === 'tickets' ? 'active' : ''}`} onClick={() => setTab('tickets')}>Мои обращения · {tickets.length}</div>
      </div>

      {tab === 'faq' &&
      <div style={{ background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: 'var(--r-lg)' }}>
          {faqs.map((f, i) => <FaqRow key={i} q={f.q} a={f.a} last={i === faqs.length - 1} />)}
        </div>
      }

      {tab === 'tickets' && (
      tickets.length === 0 ?
      <div style={{ padding: '64px 16px', textAlign: 'center', background: 'var(--surface)', border: '0.5px dashed var(--border-strong)', borderRadius: 'var(--r-lg)' }}>
              <IconMail size={28} style={{ color: 'var(--fg-muted)', marginBottom: 12 }} />
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 500, color: 'var(--fg)', marginBottom: 6 }}>Обращений пока нет</div>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--fg-muted)' }}>Нажмите «Написать в поддержку», чтобы создать первое обращение</div>
            </div> :
      <TicketsList tickets={tickets} onOpen={(t) => setOpenTicket(t)} />)
      }

      {composeOpen && <SupportComposeModal me={me} onClose={() => setComposeOpen(false)} onSubmit={onSubmit} />}
      {openTicket && <TicketDetailModal ticket={openTicket} onClose={() => setOpenTicket(null)} />}
    </div>);

}

function initialTickets() {
  return [
  {
    id: 'OES-2138', subject: 'Доступ к fuel_logs.daily', status: 'in-progress',
    body: 'Нужен read-only доступ к таблице расхода топлива для дашборда «Удельный расход».',
    attachment: null,
    created: '15.05.2026, 11:24', updated: '17.05.2026, 09:08',
    author: 'Дьяконов И. К.',
    replies: [
    { who: 'Поддержка OES', text: 'Принято в работу — переадресовали ИТ-администратору ВГК. Ожидаемое время выполнения — 1 рабочий день.', t: '15.05.2026, 12:02' },
    { who: 'Поддержка OES', text: 'ИТ согласовали выдачу. Ждём confirmation от владельца таблицы.', t: '17.05.2026, 09:08' }]

  },
  {
    id: 'OES-2104', subject: 'Алерт в Teams не приходит на смену 02.05', status: 'closed',
    body: 'Алерт «Просадки КИО за ночную смену» не сработал ночью 02.05.2026 — хотя по логам КИО был ниже 75% более 2 часов.',
    attachment: { name: 'alert-config.json', size: 4128 },
    created: '03.05.2026, 08:14', updated: '04.05.2026, 17:30',
    author: 'Дьяконов И. К.',
    replies: [
    { who: 'Поддержка OES', text: 'Воспроизвели проблему — был сбой Teams-бота на shard ru-1. Перезапустили, добавили health-чек.', t: '04.05.2026, 14:15' },
    { who: 'Поддержка OES', text: 'Проверили на исторических данных 02.05 — алерт срабатывает корректно. Закрываем обращение.', t: '04.05.2026, 17:30' }]

  }];

}

/* — Compose modal — */
function SupportComposeModal({ me, onClose, onSubmit }) {
  const [subject, setSubject] = React.useState('');
  const [body, setBody] = React.useState('');
  const [attachment, setAttachment] = React.useState(null);
  const fileRef = React.useRef(null);

  const onPickFile = (e) => {
    const f = e.target.files && e.target.files[0];
    if (f) setAttachment({ name: f.name, size: f.size });
  };

  const canSubmit = subject.trim().length > 0 && body.trim().length > 0;

  return (
    <Modal onClose={onClose}>
      <div className="modal" style={{ width: 640 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <IconMail size={15} style={{ color: 'var(--teal-400)' }} />
            Новое обращение в поддержку
          </div>
          <button className="icon-btn" style={{ width: 28, height: 28 }} onClick={onClose}><IconX size={13} /></button>
        </div>
        <div className="modal-body">
          {/* Prefilled user info */}
          <div style={{ background: 'var(--surface-2)', border: '0.5px solid var(--border)', borderRadius: 'var(--r-md)', padding: 14, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px 18px' }}>
            <PrefilledField label="ФИО" value={me.name} />
            <PrefilledField label="Email" value={me.email} />
            <PrefilledField label="Должность" value={me.role} />
            <PrefilledField label="Workspace ID" value={me.workspaceId} mono />
          </div>

          <div className="field-stack">
            <div className="field-label">Заголовок *</div>
            <input
              className="input"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Кратко опишите проблему — 1 строка"
              maxLength={120} />
            
          </div>

          <div className="field-stack">
            <div className="field-label">Описание *</div>
            <textarea
              className="textarea"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Опишите проблему подробно — шаги воспроизведения, ожидаемое и фактическое поведение, время возникновения"
              rows={6} />
            
          </div>

          <div className="field-stack">
            <div className="field-label">Вложение</div>
            <input ref={fileRef} type="file" style={{ display: 'none' }} onChange={onPickFile} />
            {attachment ?
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'var(--surface-2)', border: '0.5px solid var(--border)', borderRadius: 'var(--r-md)' }}>
                <IconPaperclip size={13} style={{ color: 'var(--teal-400)' }} />
                <span style={{ flex: 1, fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--fg)' }}>{attachment.name}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-muted)' }}>{formatBytes(attachment.size)}</span>
                <button className="icon-btn" style={{ width: 24, height: 24 }} onClick={() => setAttachment(null)}><IconX size={11} /></button>
              </div> :

            <button className="btn btn-neutral" style={{ alignSelf: 'flex-start' }} onClick={() => fileRef.current?.click()}>
                <IconPaperclip size={11} /> Прикрепить файл
              </button>
            }
          </div>
        </div>
        <div className="modal-foot">
          <span style={{ flex: 1, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-muted)' }}>
            <IconShield size={9} style={{ verticalAlign: 'middle', marginRight: 4 }} />
            SLA — 2 часа в рабочее время
          </span>
          <button className="btn btn-neutral" onClick={onClose}>Отмена</button>
          <button className="btn btn-primary" disabled={!canSubmit} onClick={() => onSubmit({ subject, body, attachment })}>
            <IconSend size={11} /> Отправить
          </button>
        </div>
      </div>
    </Modal>);

}

function PrefilledField({ label, value, mono }) {
  return (
    <div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 3 }}>{label}</div>
      <div style={{ fontFamily: mono ? 'var(--font-mono)' : 'var(--font-sans)', fontSize: 12, color: 'var(--fg)' }}>{value}</div>
    </div>);

}

function formatBytes(n) {
  if (n < 1024) return n + ' Б';
  if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' КБ';
  return (n / 1024 / 1024).toFixed(1) + ' МБ';
}

/* — Tickets list — */
function TicketsList({ tickets, onOpen }) {
  return (
    <div style={{ background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
      <div style={{
        display: 'grid', gridTemplateColumns: '110px 1.8fr 130px 110px 130px',
        padding: '10px 16px', background: 'var(--surface-2)',
        fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.10em',
        textTransform: 'uppercase', color: 'var(--fg-muted)',
        borderBottom: '0.5px solid var(--border-strong)'
      }}>
        <span>№</span><span>Тема</span><span>Статус</span><span>Создано</span><span style={{ textAlign: 'right' }}>Обновлено</span>
      </div>
      {tickets.map((t, i) =>
      <div key={t.id} onClick={() => onOpen(t)} style={{
        display: 'grid', gridTemplateColumns: '110px 1.8fr 130px 110px 130px',
        padding: '12px 16px', alignItems: 'center',
        borderBottom: i < tickets.length - 1 ? '0.5px solid var(--border)' : 'none',
        cursor: 'pointer', transition: 'background .15s'
      }}
      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-2)'}
      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-muted)' }}>{t.id}</span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 500, color: 'var(--fg)', display: 'flex', alignItems: 'center', gap: 6 }}>
              {t.subject}
              {t.attachment && <IconPaperclip size={11} style={{ color: 'var(--fg-muted)' }} />}
            </div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: 'var(--fg-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 3 }}>{t.body}</div>
          </div>
          <div><TicketStatusPill status={t.status} /></div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-muted)' }}>{t.created}</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-muted)', textAlign: 'right' }}>{t.updated}</div>
        </div>
      )}
    </div>);

}

function TicketStatusPill({ status }) {
  const map = {
    open: { label: 'открыто', color: 'var(--teal-400)', bg: 'rgba(29,184,154,0.10)', b: 'rgba(29,184,154,0.30)' },
    'in-progress': { label: 'в работе', color: 'var(--warn-orange)', bg: 'rgba(196,124,50,0.10)', b: 'rgba(196,124,50,0.30)' },
    waiting: { label: 'ожидает вас', color: 'var(--info)', bg: 'rgba(106,158,184,0.10)', b: 'rgba(106,158,184,0.30)' },
    closed: { label: 'закрыто', color: 'var(--fg-muted)', bg: 'var(--surface-2)', b: 'var(--border)' }
  };
  const m = map[status] || map.open;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontFamily: 'var(--font-mono)', fontSize: 10,
      letterSpacing: '0.08em', textTransform: 'uppercase',
      padding: '4px 9px', borderRadius: 'var(--r-xs)',
      color: m.color, background: m.bg, border: '0.5px solid ' + m.b
    }}>
      <span style={{ width: 5, height: 5, borderRadius: 999, background: m.color }} /> {m.label}
    </span>);

}

/* — Ticket detail modal (status timeline + reply history) — */
function TicketDetailModal({ ticket, onClose }) {
  const events = [
  { t: ticket.created, who: ticket.author, text: ticket.body },
  ...ticket.replies.map((r) => ({ t: r.t, who: r.who, text: r.text }))];

  return (
    <Modal onClose={onClose}>
      <div className="modal" style={{ width: 720 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, padding: '3px 8px', borderRadius: 4, background: 'var(--surface-2)', border: '0.5px solid var(--border)', color: 'var(--fg-muted)', letterSpacing: '0.06em', flexShrink: 0 }}>{ticket.id}</span>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ticket.subject}</span>
            <TicketStatusPill status={ticket.status} />
          </div>
          <button className="icon-btn" style={{ width: 28, height: 28 }} onClick={onClose}><IconX size={13} /></button>
        </div>
        <div className="modal-body">
          {ticket.attachment &&
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'var(--surface-2)', border: '0.5px solid var(--border)', borderRadius: 'var(--r-md)' }}>
              <IconPaperclip size={13} style={{ color: 'var(--teal-400)' }} />
              <span style={{ flex: 1, fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--fg)' }}>{ticket.attachment.name}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-muted)' }}>{formatBytes(ticket.attachment.size)}</span>
            </div>
          }

          <div style={{ position: 'relative', paddingLeft: 22 }}>
            <div style={{ position: 'absolute', left: 7, top: 6, bottom: 6, width: 1, background: 'var(--border-strong)' }} />
            {events.map((e, i) => {
              const isUser = e.who === ticket.author;
              return (
                <div key={i} style={{ marginBottom: 14, position: 'relative' }}>
                  <span style={{ position: 'absolute', left: -22, top: 4, width: 13, height: 13, borderRadius: 999, background: isUser ? 'var(--surface)' : 'var(--teal-dim)', border: '1.5px solid ' + (isUser ? 'var(--border-strong)' : 'var(--teal-400)') }} />
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-muted)', letterSpacing: '0.06em', marginBottom: 4 }}>
                    {e.who} · <span style={{ color: 'var(--fg-muted)' }}>{e.t}</span>
                  </div>
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--fg)', lineHeight: 1.55 }}>{e.text}</div>
                </div>);

            })}
          </div>
        </div>
        <div className="modal-foot">
          <span style={{ flex: 1, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-muted)' }}>
            Создано {ticket.created} · Обновлено {ticket.updated}
          </span>
          {ticket.status !== 'closed' && <button className="btn btn-neutral">Ответить</button>}
          <button className="btn btn-neutral" onClick={onClose}>Закрыть</button>
        </div>
      </div>
    </Modal>);

}

function FaqRow({ q, a, last }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div style={{ borderBottom: last ? 'none' : '0.5px solid var(--border)' }}>
      <button onClick={() => setOpen(!open)} style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 12,
        padding: '14px 18px', textAlign: 'left',
        fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--fg)'
      }}>
        <IconChevronRight size={12} style={{ color: 'var(--fg-muted)', transform: open ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform .15s' }} />
        {q}
      </button>
      {open &&
      <div style={{ padding: '0 18px 16px 42px', fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--fg-muted)', lineHeight: 1.6 }}>{a}</div>
      }
    </div>);

}

/* — Settings (Аккаунт) — tabbed:
   Профиль / Каналы / Источники данных / Безопасность / Уведомления */
function SectionSettings({ tweak, setRoute, impersonating, tab: tabProp, setTab: setTabProp, notifications, markNotificationRead, markNotificationUnread, markAllNotificationsRead, agents, setPrimaryAgent }) {
  const me = currentMe(tweak?.userRole || 'user', impersonating);
  const [localTab, setLocalTab] = React.useState(tabProp || 'profile');
  const tab = tabProp != null ? tabProp : localTab;
  const setTab = setTabProp || setLocalTab;

  const userRecord = OESDATA.users.find((u) => u.name === me.name) || OESDATA.users[0];
  const userDomainIds = me.domains || userRecord.domains || ['excavators'];
  const userDomains = OESDATA.domains.filter((d) => userDomainIds.includes(d.id));
  const sourcesByDomain = groupSourcesByDomain(OESDATA.sources, userDomainIds);

  const tabs = [
  { id: 'profile', label: 'Профиль', icon: <IconUser size={13} /> },
  { id: 'agent', label: 'Настройки агента', icon: <IconCpu size={13} /> },
  { id: 'channels', label: 'Каналы', icon: <IconLink size={13} />, count: OESDATA.channels.filter((c) => c.state === 'connected').length },
  { id: 'sources', label: 'Источники данных', icon: <IconDatabase size={13} />, count: sourcesByDomain.reduce((s, d) => s + d.sources.filter((x) => x.granted).length, 0) },
  { id: 'security', label: 'Безопасность', icon: <IconShield size={13} /> },
  { id: 'notify', label: 'Уведомления', icon: <IconBell size={13} /> }];


  return (
    <div className="main-narrow fade-up">
      <div className="page-head">
        <div>
          <div className="page-title">Аккаунт</div>
          <div className="page-sub">Профиль · настройки агента · каналы · источники данных · безопасность</div>
        </div>
      </div>

      <div className="acc-tabs">
        {tabs.map((t) =>
        <button key={t.id} className={`acc-tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            {t.icon}
            <span>{t.label}</span>
            {t.count != null && <span className="acc-count">· {t.count}</span>}
          </button>
        )}
      </div>

      {tab === 'profile' && <SettingsProfile me={me} user={userRecord} agents={agents} setPrimaryAgent={setPrimaryAgent} />}
      {tab === 'agent' && <SettingsAgent user={userRecord} agents={agents} />}
      {tab === 'channels' && <SettingsChannels />}
      {tab === 'sources' && <SettingsSources domains={userDomains} sourcesByDomain={sourcesByDomain} />}
      {tab === 'security' && <SettingsSecurity />}
      {tab === 'notify' && <SettingsNotify notifications={notifications || []} markRead={markNotificationRead} markUnread={markNotificationUnread} markAllRead={markAllNotificationsRead} setRoute={setRoute} />}
    </div>);

}

function groupSourcesByDomain(allSources, userDomainIds) {
  // Static mapping: each source belongs to one domain (excavators is the default)
  const map = {
    'oes_dispatch.cycles': 'excavators',
    'oes_dispatch.equipment': 'excavators',
    'oes_dispatch.shift_kpis': 'excavators',
    'oes_dispatch.events': 'excavators',
    'oes_dispatch.balance': 'excavators',
    'oes_budget.daily': 'excavators',
    'knowledge_base.maintenance': 'excavators',
    'knowledge_base.regulations': 'excavators',
    'fuel_logs.daily': 'port',
    'hr_ats.candidates': 'port'
  };
  return OESDATA.domains.
  filter((d) => userDomainIds.includes(d.id)).
  map((d) => ({
    domain: d,
    sources: allSources.filter((s) => map[s.id] === d.id),
    // MCPs/APIs come from the domain admin config
    mcps: d.apis || []
  }));
}

/* — Profile pane — */
function SettingsProfile({ me, user, agents, setPrimaryAgent }) {
  const u = user || OESDATA.users[0];
  const agentList = agents && agents.length ? agents : OESDATA.assistant.agents;
  const [hoverAgent, setHoverAgent] = React.useState(null);
  const makePrimary = (name) => {
    if (setPrimaryAgent) setPrimaryAgent(name);
    if (window.notify) window.notify({ title: 'Основной агент изменён', body: name, kind: 'success' });
  };
  const dockerShort = (u.dockerId || '').slice(0, 24) + '…';
  const volume = `openclaw-${u.uuid}`;
  const refresh = () => {
    if (window.notify) window.notify({ title: 'Статус контейнера обновлён', body: 'Running', kind: 'success' });
  };
  return (
    <>
      <div className="section-head"><span className="sh-title">Профиль</span><div className="sh-line" /></div>
      <div className="card" style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 24, alignItems: 'center' }}>
        <div style={{
          width: 64, height: 64, borderRadius: 999,
          background: 'linear-gradient(135deg, var(--teal-600), var(--teal-400))',
          color: 'var(--fg-on-teal)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 600
        }}>{me.initials}</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          <Field label="ФИО" value={me.name} />
          <Field label="Email (SSO)" value={me.email} />
          <Field label="Должность" value={me.role} />
          <Field label="Роль" value={me.systemRole === 'admin' ? 'Администратор' : 'Пользователь'} />
          <Field label="Подразделение" value={me.department} />
          <Field label="Workspace ID" value={me.workspaceId} mono />
          <Field label="Workspace создан" value={me.workspaceCreatedAt} mono />
        </div>
      </div>

      {/* — Пользователь и контейнер (1 контейнер = 1 пользователь) — */}
      <div className="section-head">
        <span className="sh-title">Окружение</span>
        <div className="sh-line" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {/* ПОЛЬЗОВАТЕЛЬ */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '12px 18px', borderBottom: '0.5px solid var(--border)' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--fg-muted)' }}>Пользователь</span>
          </div>
          <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ flex: 1, fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--fg-muted)' }}>ID</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 240 }} title={u.uuid}>{u.uuid}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ flex: 1, fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--fg-muted)' }}>Email</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg)' }}>{u.email}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ flex: 1, fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--fg-muted)' }}>Создан</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg)' }}>{u.containerCreated}</span>
            </div>
          </div>
        </div>

        {/* КОНТЕЙНЕР */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '12px 18px', borderBottom: '0.5px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--fg-muted)' }}>Контейнер</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-mono)', fontSize: 10, padding: '2px 8px', borderRadius: 999, background: 'rgba(29,184,154,0.10)', border: '0.5px solid rgba(29,184,154,0.30)', color: 'var(--pos)' }}>
              <span className="dot dot-pos" /> Running
            </span>
            <span style={{ flex: 1 }} />
            <button onClick={refresh} style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--teal-400)', background: 'transparent', border: 0, cursor: 'pointer' }}>Обновить</button>
          </div>
          <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ flex: 1, fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--fg-muted)' }}>Docker ID</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg)' }} title={u.dockerId}>{dockerShort}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ flex: 1, fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--fg-muted)' }}>Volume</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 240 }} title={volume}>{volume}</span>
            </div>
          </div>
        </div>
      </div>

      {/* АГЕНТЫ — перечень подключённых агентов (read-only сводка; полная настройка во вкладке «Настройки агента») */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginTop: 14 }}>
        <div style={{ padding: '12px 18px', borderBottom: '0.5px solid var(--border)' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--fg-muted)' }}>Агенты · {agentList.length}</span>
        </div>
        <div>
          {agentList.map((ag, i) => (
            <div
              key={ag.name}
              onMouseEnter={() => setHoverAgent(ag.name)}
              onMouseLeave={() => setHoverAgent((cur) => (cur === ag.name ? null : cur))}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderBottom: i < agentList.length - 1 ? '0.5px solid var(--border)' : 'none', background: ag.primary ? 'rgba(29,184,154,0.04)' : 'transparent', transition: 'background 120ms ease' }}
            >
              <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 500, color: 'var(--fg)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    {ag.name}
                    {ag.primary && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '2px 7px', borderRadius: 999, background: 'rgba(29,184,154,0.12)', border: '0.5px solid rgba(29,184,154,0.32)', color: 'var(--pos)' }}>
                        <span className="dot dot-pos" /> Основной
                      </span>
                    )}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-muted)', marginTop: 2 }}>{ag.role}</div>
                </div>
              </div>
              {!ag.primary && hoverAgent === ag.name && (
                <button className="btn btn-ghost btn-sm" onClick={() => makePrimary(ag.name)}>
                  <IconCheck size={11} /> Сделать основным
                </button>
              )}
              <Chip kind={ag.primary ? 'neutral' : 'command'}>{ag.model}</Chip>
            </div>
          ))}
        </div>
      </div>
    </>);

}

/* — Channels pane (was SectionChannels) — */
function SettingsChannels() {
  const [channels, setChannels] = React.useState(OESDATA.channels);
  const [modal, setModal] = React.useState(null); // { mode: 'connect'|'configure'|'disconnect', channel }

  const finishConnect = (ch, handle) => {
    setChannels((prev) => prev.map((c) => c.kind === ch.kind ? { ...c, state: 'connected', linkedAs: handle } : c));
    setModal(null);
    if (window.notify) window.notify({ title: `${ch.name} подключён`, body: `Привязан как ${handle}`, kind: 'success' });
  };
  const finishConfigure = (ch) => {
    setModal(null);
    if (window.notify) window.notify({ title: `Настройки сохранены`, body: ch.name, kind: 'success' });
  };
  const finishDisconnect = (ch) => {
    setChannels((prev) => prev.map((c) => c.kind === ch.kind ? { ...c, state: 'available', linkedAs: null } : c));
    setModal(null);
    if (window.notify) window.notify({ title: `${ch.name} отключён`, body: 'Канал переведён в доступные.', kind: 'success' });
  };

  return (
    <>
      <div className="section-head">
        <span className="sh-title">Каналы взаимодействия</span>
        <div className="sh-line" />
      </div>
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--fg-muted)', marginBottom: 14, lineHeight: 1.5 }}>
        Единый Workspace для всех каналов — память, история и контекст общие.
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
        {channels.map((c) =>
        <div key={c.kind} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <ChannelGlyph kind={c.kind} size={20} />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 500, color: 'var(--fg)' }}>{c.name}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-muted)', marginTop: 2 }}>{c.meta}</div>
              </div>
              {c.state === 'connected' && <Chip kind="pos" dot>ПОДКЛЮЧЁН</Chip>}
              {c.state === 'pending' && <Chip kind="warn">ОЖИДАЕТ ИТ</Chip>}
              {c.state === 'available' && <Chip kind="neutral">ДОСТУПЕН</Chip>}
            </div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--fg-muted)', lineHeight: 1.5 }}>{c.desc}</div>
            {c.linkedAs &&
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: 'var(--surface-2)', borderRadius: 4, border: '0.5px solid var(--border)' }}>
                <IconLink size={11} style={{ color: 'var(--fg-muted)' }} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-muted)' }}>привязан как</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg)' }}>{c.linkedAs}</span>
              </div>
          }
            <div style={{ display: 'flex', gap: 8 }}>
              {c.state === 'connected' && <>
                <button className="btn btn-neutral btn-sm" onClick={() => setModal({ mode: 'configure', channel: c })}><IconSettings size={11} /> Настроить</button>
                <button className="btn btn-neutral btn-sm" onClick={() => setModal({ mode: 'disconnect', channel: c })}>Отключить</button>
              </>}
              {c.state === 'pending' && <button className="btn btn-warn btn-sm" onClick={() => { if (window.notify) window.notify({ title: 'Запрос в ИТ отправлен', body: c.name, kind: 'success' }); }}>Связаться с ИТ</button>}
              {c.state === 'available' && <button className="btn btn-ghost btn-sm" onClick={() => setModal({ mode: 'connect', channel: c })}>Подключить</button>}
            </div>
          </div>
        )}
      </div>

      {modal?.mode === 'connect' && <ChannelConnectModal channel={modal.channel} onClose={() => setModal(null)} onConnect={(h) => finishConnect(modal.channel, h)} />}
      {modal?.mode === 'configure' && <ChannelConfigureModal channel={modal.channel} onClose={() => setModal(null)} onSave={() => finishConfigure(modal.channel)} />}
      {modal?.mode === 'disconnect' && <ChannelDisconnectModal channel={modal.channel} onClose={() => setModal(null)} onConfirm={() => finishDisconnect(modal.channel)} />}
    </>);

}

/* — Подключение канала: ввод адреса/логина → toast «привязан» — */
function ChannelConnectModal({ channel, onClose, onConnect }) {
  const placeholder = channel.kind === 'email' ? 'user@vgk.ru' : channel.kind === 'telegram' ? '@username' : channel.kind === 'teams' ? 'user@vgk.ru' : 'идентификатор';
  const [handle, setHandle] = React.useState('');
  const valid = handle.trim().length > 0;
  return (
    <Modal onClose={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ChannelGlyph kind={channel.kind} size={16} /> Подключить {channel.name}
          </div>
          <button className="icon-btn" style={{ width: 28, height: 28 }} onClick={onClose}><IconX size={13} /></button>
        </div>
        <div className="modal-body">
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--fg-muted)', lineHeight: 1.55 }}>
            Введите ваш {channel.kind === 'telegram' ? 'username' : 'идентификатор'} в {channel.name}. После подтверждения мы отправим вам ссылку для привязки аккаунта.
          </div>
          <div className="field-stack">
            <div className="field-label">{channel.kind === 'telegram' ? 'Username' : channel.kind === 'email' ? 'Email' : 'Идентификатор'} *</div>
            <input className="input mono" placeholder={placeholder} value={handle} onChange={(e) => setHandle(e.target.value)} />
          </div>
          <div style={{ padding: 12, background: 'rgba(106,158,184,0.06)', border: '0.5px solid rgba(106,158,184,0.30)', borderRadius: 'var(--r-md)', fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--fg-muted)', lineHeight: 1.5 }}>
            <IconShield size={11} style={{ verticalAlign: 'middle', color: 'var(--info)' }} /> Память Workspace, история и контекст останутся общими для всех каналов.
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn btn-neutral" onClick={onClose}>Отмена</button>
          <button className="btn btn-primary" disabled={!valid} onClick={() => onConnect(handle.trim())}><IconLink size={11} /> Привязать</button>
        </div>
      </div>
    </Modal>
  );
}

/* — Настройки канала: тумблеры уведомлений → toast «сохранено» — */
function ChannelConfigureModal({ channel, onClose, onSave }) {
  return (
    <Modal onClose={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <IconSettings size={15} style={{ color: 'var(--teal-400)' }} /> Настройки · {channel.name}
          </div>
          <button className="icon-btn" style={{ width: 28, height: 28 }} onClick={onClose}><IconX size={13} /></button>
        </div>
        <div className="modal-body">
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <RowToggle title="Получать алерты" desc="Доставка срабатываний алертов в этот канал" value={true} />
            <RowToggle title="Утренний дайджест" desc="Сводка по парку и решениям в 06:30" value={false} />
            <RowToggle title="Уведомления о форках" desc="Когда коллеги форкают ваши решения" value={true} />
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn btn-neutral" onClick={onClose}>Отмена</button>
          <button className="btn btn-primary" onClick={onSave}><IconCheck size={11} /> Сохранить</button>
        </div>
      </div>
    </Modal>
  );
}

/* — Отключение канала: подтверждение + toast — */
function ChannelDisconnectModal({ channel, onClose, onConfirm }) {
  return (
    <Modal onClose={onClose}>
      <div className="modal" style={{ width: 460 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <IconX size={15} style={{ color: 'var(--neg)' }} /> Отключить {channel.name}?
          </div>
          <button className="icon-btn" style={{ width: 28, height: 28 }} onClick={onClose}><IconX size={13} /></button>
        </div>
        <div className="modal-body">
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--fg)', lineHeight: 1.55 }}>
            Канал «{channel.name}» больше не будет получать уведомления и срабатывания алертов. Привязка {channel.linkedAs ? <span style={{ fontFamily: 'var(--font-mono)' }}>«{channel.linkedAs}»</span> : 'аккаунта'} будет снята.
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn btn-neutral" onClick={onClose}>Отмена</button>
          <button className="btn btn-danger" onClick={onConfirm}>Отключить</button>
        </div>
      </div>
    </Modal>
  );
}

/* — Sources pane: 2-level grouping by Domain — */
function SettingsSources({ domains, sourcesByDomain }) {
  const [openIds, setOpenIds] = React.useState(() => domains.map((d) => d.id));
  const toggle = (id) => setOpenIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  return (
    <>
      <div className="section-head">
        <span className="sh-title">Источники данных</span>
        <span className="sh-count">{domains.length} {domains.length === 1 ? 'домен' : 'домена'}</span>
        <div className="sh-line" />
      </div>
      <div style={{ background: 'rgba(14,122,104,0.06)', border: '0.5px solid var(--border-strong)', borderRadius: 'var(--r-lg)', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
        <IconShield size={16} style={{ color: 'var(--teal-400)' }} />
        <div style={{ flex: 1, fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--fg-muted)', lineHeight: 1.55 }}>
          Источники сгруппированы по доменам, к которым у вас выдан доступ.
          Свои саб-агенты и MCP/API настраиваются во вкладке «Настройки агента».
        </div>
      </div>

      {sourcesByDomain.map(({ domain, sources, mcps }) => {
        const open = openIds.includes(domain.id);
        return (
          <div key={domain.id} className="sd-domain">
            <div className="sd-domain-head" onClick={() => toggle(domain.id)}>
              <div className="sd-glyph">
                <CubeLogo size={18} color="var(--teal-400)" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 500, color: 'var(--fg)', letterSpacing: '-0.01em' }}>{domain.name}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, padding: '3px 7px', background: 'rgba(29,184,154,0.10)', border: '0.5px solid rgba(29,184,154,0.30)', borderRadius: 3, color: 'var(--pos)', letterSpacing: '0.10em', textTransform: 'uppercase' }}>{domain.status}</span>
                </div>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--fg-muted)', marginTop: 3 }}>{domain.desc}</div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <Chip kind="neutral">{sources.filter((s) => s.granted).length} ИСТОЧНИКОВ</Chip>
                <Chip kind="neutral">{mcps.length} MCP</Chip>
              </div>
              <IconChevronDown size={14} style={{ color: 'var(--fg-muted)', transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform .15s' }} />
            </div>

            {open &&
            <div className="sd-sources">
                {/* Sources header */}
                <div style={{
                display: 'grid', gridTemplateColumns: '60px 1fr 110px 100px 100px 90px',
                padding: '8px 18px', gap: 12,
                fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.10em',
                textTransform: 'uppercase', color: 'var(--fg-muted)',
                borderBottom: '0.5px solid var(--border)',
                background: 'var(--surface-2)'
              }}>
                  <span>Тип</span><span>Источник</span><span>ID</span><span style={{ textAlign: 'right' }}>Объём</span><span>Режим</span><span>Доступ</span>
                </div>
                {sources.length === 0 &&
              <div style={{ padding: 18, textAlign: 'center', fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--fg-muted)' }}>
                    Нет подключённых источников в этом домене
                  </div>
              }
                {sources.map((s) =>
              <div key={s.id} className="sd-source-row" style={{ opacity: s.granted ? 1 : 0.55 }}>
                    <SourceKind kind={s.kind} />
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--fg)' }}>{s.name}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-muted)' }}>{s.id}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg)', textAlign: 'right' }}>{s.rows}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: s.ro ? 'var(--info)' : 'var(--warn)', display: 'inline-flex', gap: 4, alignItems: 'center' }}><IconLock size={10} /> read-only</span>
                    <span>
                      {s.granted ?
                  <Chip kind="pos" dot>ВЫДАН</Chip> :
                  <Chip kind="warn">НЕТ</Chip>}
                    </span>
                  </div>
              )}

                {/* MCP servers section */}
                {mcps.length > 0 &&
              <>
                    <div style={{
                  padding: '12px 18px 6px',
                  fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.12em',
                  textTransform: 'uppercase', color: 'var(--fg-muted)',
                  borderTop: '0.5px solid var(--border)'
                }}>
                      MCP · {mcps.length}
                    </div>
                    {mcps.map((m) =>
                <div key={m.id} className="sd-mcp-row">
                        <span style={{
                    width: 32, height: 32, borderRadius: 6,
                    background: 'var(--teal-dim)', border: '0.5px solid var(--border-strong)',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--teal-400)'
                  }}>
                          <IconWrench size={14} />
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 500, color: 'var(--fg)' }}>{m.label}</div>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-muted)', letterSpacing: '0.06em', marginTop: 3 }}>{m.id}</div>
                        </div>
                        <Chip kind="pos" dot>{m.state}</Chip>
                        <button className="btn btn-neutral btn-sm"><IconSettings size={11} /> Настройки</button>
                      </div>
                )}
                  </>
              }

                {/* Domain-level settings */}
                <div style={{
                padding: '14px 18px',
                borderTop: '0.5px solid var(--border)',
                background: 'var(--surface-2)',
                display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap'
              }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--fg-muted)' }}>Настройки домена</span>
                  <Chip kind="neutral">{domain.llm.primary}</Chip>
                  <Chip kind="command">{domain.sessions.isolation}</Chip>
                  {domain.memory && <Chip kind="pos" dot>MEMORY · {domain.memory.embedding}</Chip>}
                  <span style={{ flex: 1 }} />
                  <button className="btn btn-neutral btn-sm"><IconUsers size={11} /> Запросить доступ к источнику</button>
                </div>
              </div>
            }
          </div>);

      })}

      {sourcesByDomain.length === 0 &&
      <div style={{ padding: 32, textAlign: 'center', fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--fg-muted)', background: 'var(--surface)', border: '0.5px dashed var(--border-strong)', borderRadius: 'var(--r-lg)' }}>
          У вас нет подключённых доменов. Обратитесь к ИТ-администратору.
        </div>
      }
    </>);

}

/* — Security — */
/* — Создание саб-агента — */
function SubagentModal({ onClose, onCreate }) {
  const [name, setName] = React.useState('');
  const [task, setTask] = React.useState('');
  const [model, setModel] = React.useState('CLAUDE-OPUS-4-6');
  const valid = name.trim().length > 0;
  return (
    <Modal onClose={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <IconBrain size={15} style={{ color: 'var(--teal-400)' }} /> Новый саб-агент
          </div>
          <button className="icon-btn" style={{ width: 28, height: 28 }} onClick={onClose}><IconX size={13} /></button>
        </div>
        <div className="modal-body">
          <div className="field-stack">
            <div className="field-label">Имя саб-агента *</div>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="например, Аналитик циклов" />
          </div>
          <div className="field-stack">
            <div className="field-label">Задача</div>
            <textarea className="textarea" value={task} onChange={(e) => setTask(e.target.value)} placeholder="Что должен делать саб-агент" rows={3} />
          </div>
          <div className="field-stack">
            <div className="field-label">Базовая модель</div>
            <select className="input mono" value={model} onChange={(e) => setModel(e.target.value)}>
              <option>CLAUDE-OPUS-4-6</option>
              <option>GPT-5.4-2026-03-05</option>
              <option>GROK-4.20-0309</option>
            </select>
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn btn-neutral" onClick={onClose}>Отмена</button>
          <button className="btn btn-primary" disabled={!valid} onClick={() => onCreate({ name: name.trim(), task: task.trim() || 'Без описания', model })}>
            <IconCheck size={11} /> Создать
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* — Подключение своего MCP / API — */
function ConnectorModal({ onClose, onCreate }) {
  const [type, setType] = React.useState('mcp');
  const [name, setName] = React.useState('');
  const [endpoint, setEndpoint] = React.useState('');
  const valid = name.trim().length > 0 && endpoint.trim().length > 0;
  return (
    <Modal onClose={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <IconWrench size={15} style={{ color: 'var(--teal-400)' }} /> Подключить MCP / API
          </div>
          <button className="icon-btn" style={{ width: 28, height: 28 }} onClick={onClose}><IconX size={13} /></button>
        </div>
        <div className="modal-body">
          <div className="field-stack">
            <div className="field-label">Тип подключения</div>
            <div className="role-card-grid">
              <button className={`role-card ${type === 'mcp' ? 'active' : ''}`} onClick={() => setType('mcp')}>
                <span className="role-card-icon"><IconWrench size={13} /></span><span>MCP-сервер</span>
              </button>
              <button className={`role-card ${type === 'api' ? 'active' : ''}`} onClick={() => setType('api')}>
                <span className="role-card-icon"><IconLink size={13} /></span><span>HTTP API</span>
              </button>
            </div>
          </div>
          <div className="field-stack">
            <div className="field-label">Название *</div>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder={type === 'mcp' ? 'например, mcp-oes-dispatch' : 'например, fuel-logs-api'} />
          </div>
          <div className="field-stack">
            <div className="field-label">{type === 'mcp' ? 'Адрес MCP-сервера *' : 'Базовый URL API *'}</div>
            <input className="input mono" value={endpoint} onChange={(e) => setEndpoint(e.target.value)} placeholder={type === 'mcp' ? 'stdio:// или https://…' : 'https://api.example.com/v1'} />
          </div>
          <div style={{ padding: 12, background: 'rgba(106,158,184,0.06)', border: '0.5px solid rgba(106,158,184,0.30)', borderRadius: 'var(--r-md)', fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--fg-muted)', lineHeight: 1.5 }}>
            <IconShield size={11} style={{ verticalAlign: 'middle', color: 'var(--info)' }} /> Подключение работает в пересечении ваших прав — маскирование чувствительных данных остаётся включённым.
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn btn-neutral" onClick={onClose}>Отмена</button>
          <button className="btn btn-primary" disabled={!valid} onClick={() => onCreate({ type, name: name.trim(), endpoint: endpoint.trim() })}>
            <IconCheck size={11} /> Подключить
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* — Настройки агента: основной агент, саб-агенты, MCP-серверы.
   Используется в Аккаунте пользователя и в Админ → Пользователи (для редактирования админом).
   1 контейнер = 1 пользователь. */
const DEFAULT_AGENT_PROMPT = `You are a personal AI workspace assistant.

When the user asks for code, SQL, dashboards, charts, HTML, or any technical output — delegate to the developer sub-agent.

CALL sessions_recent WITH EXACTLY THESE 3 PARAMETERS AND NOTHING ELSE: user_id, limit=20, after=null.`;

const DEFAULT_SUBAGENT_PROMPT = `You are an expert software developer. You write clean, efficient, production-ready code.
## Dashboards & HTML output When asked for a dashboard, chart, report, visualization — produce a self-contained HTML file with inline styles.`;

function SettingsAgent({ user, admin, agents }) {
  const [model, setModel] = React.useState('default');
  const [prompt, setPrompt] = React.useState(DEFAULT_AGENT_PROMPT);
  const promptRef = React.useRef(null);
  React.useEffect(() => {
    const ta = promptRef.current; if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 600) + 'px';
  }, [prompt]);

  const primaryAgent = (agents || OESDATA.assistant.agents).find((a) => a.primary) || (agents || OESDATA.assistant.agents)[0];

  const [subagents, setSubagents] = React.useState([
    { id: 'sa-dev', name: 'Разработчик', subId: 'openai/claude-sonnet-4-5', instructions: DEFAULT_SUBAGENT_PROMPT },
  ]);
  const [editingSubId, setEditingSubId] = React.useState(null);
  const [editingSubText, setEditingSubText] = React.useState('');
  const startEditSub = (sa) => { setEditingSubId(sa.id); setEditingSubText(sa.instructions); };
  const saveEditSub = () => {
    setSubagents((p) => p.map((x) => (x.id === editingSubId ? { ...x, instructions: editingSubText } : x)));
    if (window.notify) window.notify({ title: 'Инструкции саб-агента обновлены', kind: 'success' });
    setEditingSubId(null);
    setEditingSubText('');
  };
  const cancelEditSub = () => { setEditingSubId(null); setEditingSubText(''); };
  const [addingSub, setAddingSub] = React.useState(false);
  const blankSub = { name: '', subId: '', model: 'По умолчанию', instructions: '' };
  const [subForm, setSubForm] = React.useState(blankSub);

  const [mcps, setMcps] = React.useState([
    { id: 'mcp-shift', name: 'Оценка смены', url: 'https://shift-rating-mcp-port.oeswork.io/mcp', transport: 'streamable-http' },
  ]);
  const [addingMcp, setAddingMcp] = React.useState(false);
  const blankMcp = { name: '', url: '' };
  const [mcpForm, setMcpForm] = React.useState(blankMcp);

  const addSub = () => {
    if (!subForm.name.trim() || !subForm.subId.trim()) return;
    setSubagents((p) => [...p, { id: 'sa-' + makeShortId(), name: subForm.name.trim(), subId: subForm.subId.trim(), instructions: subForm.instructions || 'Без инструкций' }]);
    setSubForm(blankSub); setAddingSub(false);
    if (window.notify) window.notify({ title: 'Саб-агент добавлен', body: subForm.name.trim(), kind: 'success' });
  };
  const addMcp = () => {
    if (!mcpForm.name.trim() || !mcpForm.url.trim()) return;
    setMcps((p) => [...p, { id: 'mcp-' + makeShortId(), name: mcpForm.name.trim(), url: mcpForm.url.trim(), transport: 'streamable-http' }]);
    setMcpForm(blankMcp); setAddingMcp(false);
    if (window.notify) window.notify({ title: 'MCP-сервер добавлен', body: mcpForm.name.trim(), kind: 'success' });
  };
  const save = () => {
    if (window.notify) window.notify({ title: 'Контейнер перезапущен', body: `Настройки агента сохранены${admin && user ? ` для ${user.name}` : ''}`, kind: 'success' });
  };

  const cardHead = (icon, label) => (
    <div style={{ padding: '10px 18px', borderBottom: '0.5px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
      {icon}
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--fg-muted)' }}>{label}</span>
    </div>
  );

  return (
    <>
      {/* ОСНОВНОЙ АГЕНТ */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 12 }}>
        {cardHead(<IconCpu size={13} style={{ color: 'var(--teal-400)' }} />, 'Основной агент')}
        <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Имя текущего основного агента — заметным блоком сверху карточки */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 'var(--r-md)', background: 'rgba(29,184,154,0.06)', border: '0.5px solid rgba(29,184,154,0.30)' }}>
            <CubeLogo size={16} color="var(--teal-400)" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--fg-muted)' }}>Имя</div>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 600, color: 'var(--fg)', marginTop: 2 }}>{primaryAgent.name}</div>
            </div>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '3px 8px', borderRadius: 999, background: 'rgba(29,184,154,0.12)', border: '0.5px solid rgba(29,184,154,0.32)', color: 'var(--pos)' }}>
              <span className="dot dot-pos" /> Основной
            </span>
          </div>
          <div className="field-stack">
            <div className="field-label">Модель</div>
            <select className="input" value={model} onChange={(e) => setModel(e.target.value)}>
              <option value="default">По умолчанию (из конфига)</option>
              <option value="claude-opus-4-6">CLAUDE-OPUS-4-6</option>
              <option value="claude-sonnet-4-5">CLAUDE-SONNET-4-5</option>
              <option value="claude-haiku-4-5">CLAUDE-HAIKU-4-5</option>
              <option value="gpt-5-4">GPT-5.4-2026-03-05</option>
              <option value="grok-4-20">GROK-4.20-0309</option>
            </select>
          </div>
          <div className="field-stack">
            <div className="field-label">Системные инструкции</div>
            <textarea ref={promptRef} className="autogrow" value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Переопределите системный промпт агента" />
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: 'var(--fg-muted)' }}>Переопределяет системный промпт агента</div>
          </div>
        </div>
      </div>

      {/* САБ-АГЕНТЫ */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 12 }}>
        {cardHead(<IconBrain size={13} style={{ color: 'var(--teal-400)' }} />, `Саб-агенты · ${subagents.length}`)}
        <div style={{ padding: 14 }}>
          {subagents.map((sa) => {
            const isEditing = editingSubId === sa.id;
            return (
              <div key={sa.id} style={{ padding: '12px 14px', border: isEditing ? '0.5px solid var(--teal-400)' : '0.5px solid var(--border)', borderRadius: 'var(--r-md)', background: 'var(--surface-2)', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10, marginBottom: 4 }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 500, color: 'var(--fg)' }}>{sa.name}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-muted)', marginTop: 2 }}>{sa.subId}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 12 }}>
                    {!isEditing && (
                      <button onClick={() => startEditSub(sa)} style={{ background: 'transparent', border: 0, color: 'var(--teal-400)', fontFamily: 'var(--font-sans)', fontSize: 12, cursor: 'pointer' }}>Редактировать</button>
                    )}
                    <button onClick={() => setSubagents((p) => p.filter((x) => x.id !== sa.id))} style={{ background: 'transparent', border: 0, color: 'var(--neg)', fontFamily: 'var(--font-sans)', fontSize: 12, cursor: 'pointer' }}>Удалить</button>
                  </div>
                </div>
                {isEditing ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                    <textarea className="textarea" rows={6} value={editingSubText} onChange={(e) => setEditingSubText(e.target.value)} placeholder="Системные инструкции саб-агента…" />
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-primary btn-sm" onClick={saveEditSub}>Сохранить</button>
                      <button className="btn btn-neutral btn-sm" onClick={cancelEditSub}>Отмена</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: 'var(--fg-muted)', lineHeight: 1.45, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {sa.instructions}
                  </div>
                )}
              </div>
            );
          })}
          {addingSub ? (
            <div style={{ padding: 14, border: '0.5px solid var(--teal-400)', borderRadius: 'var(--r-md)', background: 'var(--surface-2)', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input className="input" placeholder="Имя саб-агента" value={subForm.name} onChange={(e) => setSubForm({ ...subForm, name: e.target.value })} />
              <input className="input mono" placeholder="ID (латиница, без пробелов)" value={subForm.subId} onChange={(e) => setSubForm({ ...subForm, subId: e.target.value.replace(/\s+/g, '') })} />
              <select className="input" value={subForm.model} onChange={(e) => setSubForm({ ...subForm, model: e.target.value })}>
                <option>По умолчанию</option>
                <option>CLAUDE-OPUS-4-6</option>
                <option>CLAUDE-SONNET-4-5</option>
                <option>GPT-5.4-2026-03-05</option>
              </select>
              <textarea className="textarea" placeholder="Системные инструкции саб-агента…" rows={3} value={subForm.instructions} onChange={(e) => setSubForm({ ...subForm, instructions: e.target.value })} />
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <button className="btn btn-primary btn-sm" disabled={!subForm.name.trim() || !subForm.subId.trim()} onClick={addSub}>Добавить</button>
                <button className="btn btn-neutral btn-sm" onClick={() => { setAddingSub(false); setSubForm(blankSub); }}>Отмена</button>
              </div>
            </div>
          ) : (
            <button className="btn btn-ghost btn-sm" onClick={() => setAddingSub(true)}><IconPlus size={11} /> Добавить саб-агента</button>
          )}
        </div>
      </div>

      {/* MCP СЕРВЕРЫ */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 14 }}>
        {cardHead(<IconWrench size={13} style={{ color: 'var(--teal-400)' }} />, `MCP серверы · ${mcps.length}`)}
        <div style={{ padding: 14 }}>
          {mcps.map((m) => (
            <div key={m.id} style={{ padding: '12px 14px', border: '0.5px solid var(--border)', borderRadius: 'var(--r-md)', background: 'var(--surface-2)', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 500, color: 'var(--fg)' }}>{m.name}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-muted)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.url}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-muted)', marginTop: 2 }}>{m.transport}</div>
                </div>
                <button onClick={() => setMcps((p) => p.filter((x) => x.id !== m.id))} style={{ background: 'transparent', border: 0, color: 'var(--neg)', fontFamily: 'var(--font-sans)', fontSize: 12, cursor: 'pointer' }}>Удалить</button>
              </div>
            </div>
          ))}
          {addingMcp ? (
            <div style={{ padding: 14, border: '0.5px solid var(--teal-400)', borderRadius: 'var(--r-md)', background: 'var(--surface-2)', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input className="input" placeholder="Название" value={mcpForm.name} onChange={(e) => setMcpForm({ ...mcpForm, name: e.target.value })} />
              <input className="input mono" placeholder="URL https://…" value={mcpForm.url} onChange={(e) => setMcpForm({ ...mcpForm, url: e.target.value })} />
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <button className="btn btn-primary btn-sm" disabled={!mcpForm.name.trim() || !mcpForm.url.trim()} onClick={addMcp}>Добавить</button>
                <button className="btn btn-neutral btn-sm" onClick={() => { setAddingMcp(false); setMcpForm(blankMcp); }}>Отмена</button>
              </div>
            </div>
          ) : (
            <button className="btn btn-ghost btn-sm" onClick={() => setAddingMcp(true)}><IconPlus size={11} /> Добавить сервер</button>
          )}
        </div>
      </div>

      <button className="btn btn-primary" style={{ width: '100%', padding: '12px 18px', fontSize: 13, justifyContent: 'center' }} onClick={save}>
        Сохранить и перезапустить контейнер
      </button>
    </>
  );
}

function SettingsSecurity() {
  return (
    <>
      <div className="section-head"><span className="sh-title">Безопасность</span><div className="sh-line" /></div>
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <RowToggle title="SSO через Keycloak" desc="Единая учётка с другими корпоративными системами ВГК · обязательно" value={true} disabled />
        <RowToggle title="Маскирование чувствительных данных" desc="Security Data Agent заменяет реальные значения на моки перед отправкой в LLM" value={true} />
        <RowToggle title="Хранить логи Workspace 90 дней" desc="По умолчанию: 90 · можно сократить до 30 в политике подразделения" value={true} />
      </div>
    </>);

}

/* — Notifications — */
function SettingsNotify({ notifications, markRead, markUnread, markAllRead, setRoute }) {
  const list = notifications || [];
  const unreadCount = list.filter((n) => !n.read).length;
  const TONE = { warn: 'var(--warn-orange)', alert: 'var(--neg)', fork: 'var(--info)', info: 'var(--info)', success: 'var(--pos)' };
  const ICON = { warn: IconBell, alert: IconAlertCircle, fork: IconFork, info: IconBell, success: IconCheck };
  return (
    <>
      <div className="section-head"><span className="sh-title">Настройки уведомлений</span><div className="sh-line" /></div>
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 22 }}>
        <RowToggle title="Лимит токенов" desc="Уведомлять при 80% и 100% лимита" value={true} />
        <RowToggle title="Форки моих решений" desc="Когда коллега форкнул решение" value={true} />
        <RowToggle title="Срабатывание алертов" desc="Дублировать в Teams + почту" value={false} />
        <RowToggle title="Дайджест по подразделению" desc="Раз в неделю — топ новых решений" value={false} />
      </div>

      <div className="section-head">
        <span className="sh-title">Все уведомления</span>
        <span className="sh-count">{list.length}</span>
        {unreadCount > 0 && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginLeft: 10, fontFamily: 'var(--font-mono)', fontSize: 10, padding: '3px 8px', borderRadius: 4, background: 'rgba(196,124,50,0.12)', border: '0.5px solid rgba(196,124,50,0.30)', color: 'var(--warn-orange)' }}>{unreadCount} непрочитанных</span>}
        <div className="sh-line" />
        {unreadCount > 0 && (
          <button onClick={() => markAllRead && markAllRead()}
            style={{ background: 'transparent', border: 0, color: 'var(--teal-400)', fontFamily: 'var(--font-sans)', fontSize: 12, cursor: 'pointer' }}>
            Отметить все как прочитанные
          </button>
        )}
      </div>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {list.length === 0 && (
          <div style={{ padding: 32, textAlign: 'center', fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--fg-muted)' }}>Уведомлений нет</div>
        )}
        {list.map((n, i) => {
          const tone = TONE[n.kind] || 'var(--fg-muted)';
          const Ic = ICON[n.kind] || IconBell;
          return (
            <div key={n.id} className="notif-row"
              style={{
                borderBottom: i < list.length - 1 ? '0.5px solid var(--border)' : 'none',
                background: n.read ? 'transparent' : 'rgba(196,124,50,0.04)',
              }}
              onClick={() => { setRoute && setRoute(n.route); }}>
              <span style={{ width: 30, height: 30, borderRadius: 'var(--r-md)', background: 'var(--surface-2)', border: '0.5px solid var(--border)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: tone, flexShrink: 0 }}>
                <Ic size={14} />
              </span>
              <span style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: n.read ? 400 : 500, color: 'var(--fg)' }}>
                  {!n.read && <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--warn-orange)' }} />}
                  {n.title}
                </span>
                <span style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--fg-muted)', lineHeight: 1.45, marginTop: 2 }}>{n.text}</span>
                <span style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-muted)', marginTop: 4, letterSpacing: '0.04em' }}>{n.t}</span>
              </span>
              {!n.read ? (
                <button
                  className="notif-envelope"
                  title="Пометить прочитанным"
                  onClick={(e) => { e.stopPropagation(); markRead && markRead(n.id); }}>
                  <IconMailOpen size={13} />
                </button>
              ) : (
                <button
                  className="notif-envelope"
                  title="Пометить непрочитанным"
                  onClick={(e) => { e.stopPropagation(); markUnread && markUnread(n.id); }}>
                  <IconMail size={13} />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </>);

}

function Field({ label, value, mono }) {
  return (
    <div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: mono ? 'var(--font-mono)' : 'var(--font-sans)', fontSize: 13, color: 'var(--fg)' }}>{value}</div>
    </div>);

}

function RowToggle({ title, desc, value, disabled }) {
  const [v, setV] = React.useState(value);
  React.useEffect(() => setV(value), [value]);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--fg)', marginBottom: 3 }}>{title}</div>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--fg-muted)', lineHeight: 1.5 }}>{desc}</div>
      </div>
      <button onClick={() => !disabled && setV(!v)} style={{
        width: 36, height: 20, borderRadius: 999,
        background: v ? 'var(--teal-400)' : 'var(--surface-3)',
        border: '0.5px solid ' + (v ? 'var(--teal-400)' : 'var(--border)'),
        position: 'relative', transition: 'all .18s var(--ease-apple)',
        opacity: disabled ? 0.55 : 1, cursor: disabled ? 'not-allowed' : 'pointer'
      }}>
        <span style={{
          position: 'absolute', top: 1.5, left: v ? 17.5 : 1.5,
          width: 15, height: 15, borderRadius: 999,
          background: v ? 'var(--fg-on-teal)' : 'var(--fg-muted)',
          transition: 'all .18s var(--ease-apple)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.25)'
        }} />
      </button>
    </div>);

}

export { SectionSolutions, SectionMemory, SectionSources, SectionChannels, SectionSupport, SectionSettings, VersionHistoryModal, SettingsAgent };