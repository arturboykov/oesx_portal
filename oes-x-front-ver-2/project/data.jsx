/* Demo data — горно-транспортный комплекс ВГК.
   All in one object, exposed as window.OESDATA for sections to consume. */

const OESDATA = (() => {

  const me = {
    name: 'Дьяконов И. К.',
    initials: 'ДИ',
    role: 'Инженер ГТК',
    department: 'Горно-транспортный комплекс · Уч. 4',
    email: 'dyakonov.ik@vgk.ru',
    workspaceId: 'ws-vgk-2814',
    workspaceUptime: '47 дней 12 ч',
    workspaceCreatedAt: '02.04.2026',
  };

  /* — Мои решения — */
  const solutions = [
    {
      id: 'sol-01', name: 'Объём вскрыши — экскаваторы КТ', kind: 'dash',
      desc: 'Накопительный объём по парку КТ за смену с разбивкой по бригадам Б75306 и Б75131.',
      sources: ['oes_dispatch.cycles', 'oes_dispatch.equipment'],
      runs: 1284, lastRun: '18.05.2026, 16:54',
      created: '14.04.2026', updated: '16.05.2026',
      status: 'active', shared: false, published: false,
      forks: 0, rating: null,
      author: 'Степанов А. В.', authorInitials: 'СА',
    },
    {
      id: 'sol-02', name: 'Просадки КИО за ночную смену', kind: 'alert',
      desc: 'Алерт в Teams при падении КИО ниже 75% на любом экскаваторе категории КТ.',
      sources: ['oes_dispatch.shift_kpis'],
      runs: 312, lastRun: '18.05.2026, 02:08',
      created: '21.04.2026', updated: '03.05.2026',
      status: 'active', shared: true, published: true,
      forks: 8, rating: 4.6,
      author: 'Дьяконов И. К.', authorInitials: 'ДИ',
    },
    {
      id: 'sol-03', name: 'Утренний дайджест по парку', kind: 'automation',
      desc: 'Каждое утро в 06:30 присылает в почту сводку: активные ЭВ, простои > 30 мин, отклонение от плана.',
      sources: ['oes_dispatch.equipment', 'oes_dispatch.shift_kpis'],
      runs: 38, lastRun: '18.05.2026, 06:30',
      created: '30.04.2026', updated: '30.04.2026',
      status: 'active', shared: false, published: false,
      forks: 0, rating: null,
      author: 'Фаризунов Р. С.', authorInitials: 'ФР',
    },
    {
      id: 'sol-04', name: 'Цикл погрузки — почасовой рейтинг', kind: 'dash',
      desc: 'Рейтинг экскаваторов по среднему циклу за час; от худшего к лучшему.',
      sources: ['oes_dispatch.cycles'],
      runs: 619, lastRun: '18.05.2026, 02:18',
      created: '02.05.2026', updated: '12.05.2026',
      status: 'active', shared: true, published: false,
      forks: 0, rating: null,
      author: 'Степанов А. В.', authorInitials: 'СА',
    },
    {
      id: 'sol-05', name: 'Q&A агент по справочнику ТО', kind: 'agent',
      desc: 'Отвечает на вопросы по регламенту ТО — извлекает из 412 PDF/DOC корпоративной базы знаний.',
      sources: ['knowledge_base.maintenance', 'knowledge_base.regulations'],
      runs: 167, lastRun: '17.05.2026, 14:22',
      created: '05.05.2026', updated: '05.05.2026',
      status: 'active', shared: false, published: false,
      forks: 0, rating: null,
      author: 'Котов А. С.', authorInitials: 'КА',
    },
    {
      id: 'sol-06', name: 'Бюджет — добыча и вскрыша', kind: 'dash',
      desc: 'Накопительное отклонение от бюджета по году и месяцу; парная динамика добычи и вскрыши.',
      sources: ['oes_budget.daily', 'oes_dispatch.shift_kpis'],
      runs: 2103, lastRun: '18.05.2026, 18:10',
      created: 'форк из Marketplace, 28.04.2026', updated: '02.05.2026',
      status: 'active', shared: false, published: false,
      forks: 0, rating: 4.8, forkOf: 'Бюджет ГТК v2',
      author: 'Дьяконов И. К.', authorInitials: 'ДИ',
    },
    {
      id: 'sol-07', name: 'Балансировщик звеньев — превью', kind: 'dash',
      desc: 'Карточки участков с самосвалами на циклах; рекомендации по балансировке.',
      sources: ['oes_dispatch.balance'],
      runs: 0, lastRun: '—',
      created: '17.05.2026', updated: '17.05.2026',
      status: 'draft', shared: false, published: false,
      forks: 0, rating: null,
      author: 'Фаризунов Р. С.', authorInitials: 'ФР',
    },
    {
      id: 'sol-08', name: 'Монитор потерь', kind: 'dash',
      desc: 'Live-карта потерь от целевого по ЭВ за текущий час; обмен КС, отсутствие АТ, цикл, КИО, полнота, КТГ с тонн-эквивалентами.',
      sources: ['oes_dispatch.cycles', 'oes_dispatch.shift_kpis', 'oes_dispatch.events'],
      runs: 412, lastRun: '18.05.2026, 02:19',
      created: '08.05.2026', updated: '17.05.2026',
      status: 'active', shared: true, published: true,
      forks: 3, rating: 4.5,
      author: 'Дьяконов И. К.', authorInitials: 'ДИ',
    },
  ];

  /* — Активность Workspace — */
  const activity = [
    { t: '16:54', kind: 'run',     text: 'Дашборд «Объём вскрыши — экскаваторы КТ» обновлён', tone: 'pos' },
    { t: '16:42', kind: 'alert',   text: '«Просадки КИО» — алерт на R 9250 /5: КИО 81%', tone: 'warn' },
    { t: '15:20', kind: 'edit',    text: 'Доработано: «Цикл погрузки — почасовой рейтинг» (+ сортировка)', tone: 'neutral' },
    { t: '14:22', kind: 'agent',   text: 'Q&A: вопрос про регламент ТО ЭКГ — ответ за 4 с', tone: 'neutral' },
    { t: '11:30', kind: 'fork',    text: 'Форк из Marketplace: «План-факт по бригадам»', tone: 'info' },
    { t: '09:14', kind: 'channel', text: 'Teams: запрос «покажи простои за вчера > 30 мин»', tone: 'neutral' },
    { t: '06:30', kind: 'run',     text: '«Утренний дайджест по парку» — отправлено в почту', tone: 'pos' },
    { t: 'вчера', kind: 'memory',  text: 'Память: запомнен предпочитаемый формат — Mono + цвет КТ', tone: 'info' },
  ];

  /* — Маркетплейс — */
  const marketplace = [
    {
      id: 'mp-01', name: 'План-факт по бригадам',
      author: 'Степанов А. В.', authorDept: 'Производство',
      kind: 'dash', tags: ['ГТК', 'бюджет', 'смена'],
      desc: 'Сравнение план/факт по бригадам Б75306/Б75131 за смену и накопительно. Цветовые пороги ±5%.',
      rating: 4.7, ratingsCount: 41, forks: 127, runs: 2890,
      requiredSources: ['oes_dispatch.shift_kpis', 'oes_budget.daily'],
      published: '12.04.2026',
      official: true,
    },
    {
      id: 'mp-02', name: 'Сходы автосамосвалов — рейтинг',
      author: 'Фаризунов Р. С.', authorDept: 'Диспетчерская',
      kind: 'dash', tags: ['АТ', 'КИО', 'смена'],
      desc: 'Топ ЭВ по числу сходов АТ с цикла, разбивка по причинам и часам смены.',
      rating: 4.5, ratingsCount: 28, forks: 73, runs: 1420,
      requiredSources: ['oes_dispatch.cycles', 'oes_dispatch.events'],
      published: '02.05.2026',
      official: false,
    },
    {
      id: 'mp-03', name: 'Расход топлива — карьер 4',
      author: 'Старков М. Ю.', authorDept: 'Энергетика',
      kind: 'dash', tags: ['топливо', 'АТ', 'неделя'],
      desc: 'Удельный расход по моделям АТ и маршрутам; отклонение от норматива по неделям.',
      rating: 4.3, ratingsCount: 19, forks: 44, runs: 612,
      requiredSources: ['fuel_logs.daily', 'oes_dispatch.equipment'],
      published: '08.05.2026',
      official: false,
    },
    {
      id: 'mp-04', name: 'Алерт: КИО < 75% длительный',
      author: 'Дьяконов И. К.', authorDept: 'ГТК',
      kind: 'alert', tags: ['КИО', 'смена'],
      desc: 'Уведомление в Teams и Email при КИО < 75% в течение 2 часов подряд на любом ЭВ КТ.',
      rating: 4.6, ratingsCount: 22, forks: 89, runs: 312,
      requiredSources: ['oes_dispatch.shift_kpis'],
      published: '21.04.2026',
      official: false,
      isMine: true,
    },
    {
      id: 'mp-05', name: 'Автоматизация: утренний дайджест ГТК',
      author: 'Команда OES',
      kind: 'automation', tags: ['email', 'утро', 'парк'],
      desc: 'Каждое утро в 06:30 присылает шаблонную сводку: активные ЭВ, простои, отклонение от плана.',
      rating: 4.8, ratingsCount: 64, forks: 198, runs: 5640,
      requiredSources: ['oes_dispatch.equipment', 'oes_dispatch.shift_kpis'],
      published: '12.03.2026',
      official: true,
    },
    {
      id: 'mp-06', name: 'Q&A: регламенты ТО',
      author: 'Котов А. С.', authorDept: 'Сервисный блок',
      kind: 'agent', tags: ['ТО', 'PDF', 'агент'],
      desc: 'Агент отвечает на вопросы по регламенту ТО экскаваторов и АТ; цитирует источник.',
      rating: 4.4, ratingsCount: 16, forks: 51, runs: 870,
      requiredSources: ['knowledge_base.maintenance', 'knowledge_base.regulations'],
      published: '24.04.2026',
      official: false,
    },
    {
      id: 'mp-07', name: 'Найм — конверсия по этапам',
      author: 'Карху И. С.', authorDept: 'HR',
      kind: 'dash', tags: ['HR', 'найм', 'воронка'],
      desc: 'Воронка найма по подразделениям: отклик → собес → оффер → принят. Время на этап.',
      rating: 4.7, ratingsCount: 33, forks: 92, runs: 580,
      requiredSources: ['hr_ats.candidates', 'hr_ats.stages'],
      published: '18.04.2026',
      official: false,
    },
    {
      id: 'mp-08', name: 'Просрочки доставок — Teams',
      author: 'Гречко И. С.', authorDept: 'Логистика',
      kind: 'alert', tags: ['логистика', 'Teams', 'утро'],
      desc: 'Каждое утро в 9:00 присылает в Teams просроченные доставки за вчера, если их больше 5.',
      rating: 4.2, ratingsCount: 11, forks: 26, runs: 145,
      requiredSources: ['logistics.deliveries'],
      published: '04.05.2026',
      official: false,
    },
  ];

  /* — Подключённые источники (для пользователя — что ему доступно) — */
  const sources = [
    { id: 'oes_dispatch.cycles',     name: 'Циклы погрузки',         kind: 'db', granted: true,  rows: '12.4 млн', ro: true },
    { id: 'oes_dispatch.equipment',  name: 'Парк ЭВ и АТ',           kind: 'db', granted: true,  rows: '142',      ro: true },
    { id: 'oes_dispatch.shift_kpis', name: 'KPI смен (КТГ/КИО/КИО СТД)', kind: 'db', granted: true, rows: '38 тыс', ro: true },
    { id: 'oes_dispatch.events',     name: 'События дисп. — сходы/простои', kind: 'db', granted: true, rows: '870 тыс', ro: true },
    { id: 'oes_dispatch.balance',    name: 'Балансировка звеньев',   kind: 'mcp', granted: true, rows: '—',       ro: true },
    { id: 'oes_budget.daily',        name: 'Бюджет — суточный план', kind: 'db', granted: true,  rows: '6.1 тыс',  ro: true },
    { id: 'knowledge_base.maintenance', name: 'KB: регламенты ТО',   kind: 'docs', granted: true, rows: '412 док', ro: true },
    { id: 'knowledge_base.regulations', name: 'KB: НПД и стандарты', kind: 'docs', granted: true, rows: '189 док', ro: true },
    { id: 'fuel_logs.daily',         name: 'Расход топлива (суточный)', kind: 'api', granted: false, rows: '—', ro: true },
    { id: 'hr_ats.candidates',       name: 'HR ATS — кандидаты',     kind: 'db', granted: false, rows: '—',       ro: true },
  ];

  /* — Память Workspace — */
  const memory = [
    { id: 'm1', kind: 'preference', label: 'Формат вывода', value: 'Geist Mono + цветовые пороги КТ', updated: '18.05.2026', pinned: true },
    { id: 'm2', kind: 'preference', label: 'Период по умолчанию', value: 'ночная смена (20:00 — 8:00)', updated: '15.05.2026', pinned: true },
    { id: 'm3', kind: 'preference', label: 'Любимые экскаваторы для разбора', value: 'EX 3600 D /90, PC 4000 E /284, R 9400 E /7', updated: '12.05.2026', pinned: false },
    { id: 'm4', kind: 'fact',       label: 'Бригады',         value: 'Уч. 4 ведут Б75306 (КТ) и Б75131 (СТ)', updated: '10.05.2026', pinned: true },
    { id: 'm5', kind: 'fact',       label: 'Метрики',         value: 'КТ — крупная техника (≥22 м³), СТ — средняя (12–15 м³)', updated: '10.05.2026', pinned: false },
    { id: 'm6', kind: 'fact',       label: 'Пороги для алертов', value: 'КИО < 75% — критично; цикл > 3.5 мин — предупреждение', updated: '03.05.2026', pinned: false },
    { id: 'm7', kind: 'session',    label: 'Текущая сессия', value: 'Дашборд «Объём вскрыши — экскаваторы КТ» — в превью', updated: '18.05.2026, 16:54', pinned: false },
    { id: 'm8', kind: 'history',    label: 'Недавний фокус', value: 'Просадки КИО в ночную смену; цикл 18.05', updated: '18.05.2026', pinned: false },
  ];

  /* — Каналы — */
  const channels = [
    { kind: 'teams', name: 'Microsoft Teams', state: 'connected', desc: 'OES X · бот в чате с пользователем', meta: '@oes-x', linkedAs: 'i.dyakonov@vgk.ru' },
    { kind: 'email', name: 'Email',           state: 'connected', desc: 'Отправка запросов на адрес и ответ письмом', meta: 'workspace-2814@oes.vgk.ru', linkedAs: 'dyakonov.ik@vgk.ru' },
    { kind: 'tg',    name: 'Telegram',        state: 'pending',   desc: 'Бета — подключение по приглашению ИТ', meta: '@OESxBot', linkedAs: null },
    { kind: 'max',   name: 'Max',             state: 'available', desc: 'Российский мессенджер; кандидат на 1.1', meta: '@oes-x', linkedAs: null },
  ];

  /* — Биллинг — */
  const billing = {
    period: 'Май 2026',
    daysLeft: 14,
    daysInPeriod: 31,
    daysPassed: 17,
    limitTokens: 4_500_000,     // на месяц для роли «Инженер ГТК»
    usedTokens: 1_812_445,      // 75% от форкаста; реальное распределение в daily
    rolePreset: 'medium',
    // суточное потребление за период (тыс. токенов)
    daily: [
      62, 81, 94, 71, 58, 22, 18,         // 01–07
      105, 122, 134, 118, 96, 28, 21,     // 08–14
      141, 158, 174,                       // 15–17
    ],
    breakdown: [
      { kind: 'dash',       label: 'Дашборды (генерация и обновления)', share: 0.46, tokens: 833_725 },
      { kind: 'agent',      label: 'Q&A агенты', share: 0.21, tokens: 380_613 },
      { kind: 'alert',      label: 'Алерты и автоматизации', share: 0.14, tokens: 253_742 },
      { kind: 'workspace',  label: 'Контекст / память / чат', share: 0.13, tokens: 235_618 },
      { kind: 'misc',       label: 'Прочее', share: 0.06, tokens: 108_747 },
    ],
    topSolutions: [
      { name: 'Объём вскрыши — экскаваторы КТ', tokens: 412_300 },
      { name: 'Бюджет — добыча и вскрыша',     tokens: 318_904 },
      { name: 'Q&A агент по справочнику ТО',   tokens: 224_180 },
      { name: 'Цикл погрузки — почасовой рейтинг', tokens: 196_540 },
      { name: 'Просадки КИО за ночную смену', tokens: 142_007 },
    ],
  };

  /* — Демонстрационные данные для превью дашборда (накопительный объём вскрыши) — */
  // 30 точек: план и факт по сменам
  const previewSeries = (() => {
    const pl = [], fk = [], lbl = [];
    for (let i = 0; i < 30; i++) {
      const day = (i % 28) + 1;
      lbl.push((day < 10 ? '0' : '') + day + '.05');
      const plan = 240 + i * 8.5 + Math.sin(i / 3) * 6;
      // факт: первые 20 близко к плану, последние 10 — провал
      const noise = (Math.sin(i * 1.3) * 12 + Math.cos(i * 0.7) * 8);
      const drop = i > 19 ? (i - 19) * 6.5 : 0;
      const fact = plan + noise - drop;
      pl.push(Math.round(plan));
      fk.push(Math.round(fact));
    }
    return { labels: lbl, plan: pl, fact: fk };
  })();

  /* — Демонстрационная таблица для превью (топ ЭВ по объёму) — */
  const previewTable = [
    { ev: 'EX 3600 D /90',  vol: 14.6, kio: 78.2, cycle: 3.7, delta: -0.4 },
    { ev: 'EX 3600 E /27',  vol: 13.2, kio: 74.6, cycle: 3.9, delta: -0.7 },
    { ev: 'PC 4000 E /38',  vol: 18.9, kio: 74.0, cycle: 2.7, delta: +0.2 },
    { ev: 'PC 4000 E /284', vol: 19.1, kio: 77.2, cycle: 2.8, delta: +0.4 },
    { ev: 'R 9400 E /7',    vol: 17.1, kio: 74.4, cycle: 3.0, delta: -0.1 },
    { ev: 'WK 20 /101',     vol: 18.1, kio: 73.1, cycle: 2.8, delta: -0.3 },
    { ev: 'WK 20 /97',      vol: 19.7, kio: 71.1, cycle: 2.5, delta: -0.9 },
    { ev: 'WK 20 /98',      vol: 18.1, kio: 75.9, cycle: 2.9, delta: +0.1 },
  ];

  /* — Versions per solution (each solution has 1..N versions, sorted newest-first) — */
  const versionMap = {
    'sol-01': [
      { v: 3, date: '16.05.2026, 14:12', author: 'Степанов А. В.', note: 'Добавлен порог 90% и подсветка строк ниже КИО 75%' },
      { v: 2, date: '02.05.2026, 09:38', author: 'Степанов А. В.', note: 'Разбивка по бригадам Б75306 / Б75131' },
      { v: 1, date: '14.04.2026, 11:04', author: 'Степанов А. В.', note: 'Первая публикация' },
    ],
    'sol-02': [
      { v: 2, date: '03.05.2026, 18:22', author: 'Дьяконов И. К.', note: 'Только ЭВ категории КТ, порог 75%' },
      { v: 1, date: '21.04.2026, 10:11', author: 'Дьяконов И. К.', note: 'Первая публикация' },
    ],
    'sol-03': [
      { v: 1, date: '30.04.2026, 08:00', author: 'Фаризунов Р. С.', note: 'Первая публикация' },
    ],
    'sol-04': [
      { v: 4, date: '12.05.2026, 19:48', author: 'Степанов А. В.', note: 'Сортировка по среднему циклу + цветовая шкала' },
      { v: 3, date: '07.05.2026, 11:24', author: 'Степанов А. В.', note: 'Группировка по часам смены' },
      { v: 2, date: '04.05.2026, 14:55', author: 'Степанов А. В.', note: 'Колонка «Δ за час»' },
      { v: 1, date: '02.05.2026, 09:30', author: 'Степанов А. В.', note: 'Первая публикация' },
    ],
    'sol-05': [
      { v: 1, date: '05.05.2026, 16:18', author: 'Котов А. С.', note: 'Первая публикация' },
    ],
    'sol-06': [
      { v: 5, date: '02.05.2026, 13:30', author: 'Дьяконов И. К.', note: 'Уточнён бюджет КТ и форк-комменты' },
      { v: 4, date: '30.04.2026, 18:10', author: 'Дьяконов И. К.', note: 'Парная динамика добычи/вскрыши' },
      { v: 3, date: '29.04.2026, 12:00', author: 'Дьяконов И. К.', note: 'Цвета по порогу ±5%' },
      { v: 2, date: '28.04.2026, 17:40', author: 'Дьяконов И. К.', note: 'Накопительное отклонение' },
      { v: 1, date: '28.04.2026, 14:02', author: 'Дьяконов И. К.', note: 'Форк из Marketplace · «Бюджет ГТК v2»' },
    ],
    'sol-07': [
      { v: 1, date: '17.05.2026, 16:01', author: 'Фаризунов Р. С.', note: 'Первая публикация · превью' },
    ],
    'sol-08': [
      { v: 3, date: '17.05.2026, 11:42', author: 'Дьяконов И. К.', note: 'Подсветка карточек по % достижения макса смены' },
      { v: 2, date: '12.05.2026, 18:08', author: 'Дьяконов И. К.', note: 'Author-табы (Старков обмен, Степанов производство и т.д.)' },
      { v: 1, date: '08.05.2026, 09:20', author: 'Дьяконов И. К.', note: 'Первая публикация' },
    ],
  };
  // attach current version number to each solution
  solutions.forEach(s => { s.version = (versionMap[s.id] && versionMap[s.id][0].v) || 1; });

  /* — Admin: домены OES X — */
  const domains = [
    {
      id: 'excavators',
      name: 'Excavators',
      desc: 'Управление парком экскаваторов и АТ участка 4',
      status: 'active',
      counts: { llm: 3, channels: 8, api: 4 },
      db: {
        id: 'excavators',
        telegramBot: '@openclaw_test_oes_bot',
        container: 'openclaw-excavators',
        workspace: '/app/domains/excavators',
        port: 18789,
        created: '28.02.2026, 01:33:02',
      },
      llm: {
        primary: 'GROK-4.20-0309-NON-REASONING',
        models: ['CLAUDE-OPUS-4-6', 'GPT-5.4-2026-03-05', 'GROK-4.20-0309-NON-REASONING'],
        providers: ['ANTHROPIC', 'OPENAI', 'XAI'],
      },
      channels: [
        { id: 'telegram', label: 'Telegram', state: 'enabled' },
        { id: 'msteams', label: 'Msteams', state: 'enabled' },
        { id: 'memory-core', label: 'Memory-Core', state: 'enabled' },
        { id: 'memory-lancedb', label: 'Memory-Lancedb', state: 'enabled' },
        { id: 'lobster', label: 'Lobster', state: 'enabled' },
        { id: 'open-prose', label: 'Open-Prose', state: 'enabled' },
        { id: 'acpx', label: 'Acpx', state: 'enabled' },
        { id: 'diagnostics-otel', label: 'Diagnostics-Otel', state: 'enabled' },
      ],
      botRef: '@openclaw_test_oes_bot',
      apis: [
        { id: 'anthropic', label: 'Anthropic API', state: 'configured' },
        { id: 'openai', label: 'OpenAI API', state: 'configured' },
        { id: 'tg-bot', label: 'Telegram Bot', state: 'configured' },
        { id: 'shift-rating', label: 'Shift Rating Agent API', state: 'configured' },
      ],
      sessions: { isolation: 'per-channel-peer', reset: null, cleanup: null },
      memory: null,
      gateway: null,
    },
    {
      id: 'port',
      name: 'port',
      desc: 'Порт (УМПШ) Восточной Горнорудной Компании',
      status: 'active',
      counts: { llm: 2, channels: 2, api: 3 },
      db: {
        id: 'port',
        telegramBot: null,
        container: null,
        workspace: '/app/domains/port',
        port: 18789,
        created: '31.03.2026, 02:46:39',
      },
      llm: {
        primary: 'GROK-4.20-0309-NON-REASONING',
        models: ['CLAUDE-OPUS-4-6', 'CLAUDE-SONNET-4-5', 'GROK-4.20-0309-NON-REASONING'],
        providers: ['ANTHROPIC', 'XAI'],
      },
      channels: [
        { id: 'telegram', label: 'Telegram', state: 'enabled' },
        { id: 'msteams', label: 'Msteams', state: 'enabled' },
      ],
      botRef: null,
      apis: [
        { id: 'anthropic', label: 'Anthropic API', state: 'configured' },
        { id: 'openai', label: 'OpenAI API', state: 'configured' },
        { id: 'tg-bot', label: 'Telegram Bot', state: 'configured' },
      ],
      sessions: { isolation: 'per-channel-peer', reset: 'daily', cleanup: 'после 30D' },
      memory: {
        embedding: 'TEXT-EMBEDDING-3-SMALL',
        provider: 'OPENAI',
        flags: ['HYBRID', 'MMR', 'DECAY'],
        paths: ['BANK/', 'USERS/'],
      },
      gateway: { port: 18789, mode: 'LOCAL' },
    },
  ];

  /* — Admin: пользователи — */
  const users = [
    { id: 'u-001', name: 'Дьяконов И. К.', position: 'Инженер ГТК',     role: 'user',  domains: ['excavators'],           telegramId: '908812437', teamsId: '', teamsName: 'Ivan Dyakonov',   active: true,  email: 'dyakonov.ik@vgk.ru',  initials: 'ДИ' },
    { id: 'u-002', name: 'Степанов А. В.', position: 'Руководитель ГТК', role: 'admin', domains: ['excavators', 'port'],   telegramId: '422118034', teamsId: 'aad-9817', teamsName: 'Anton Stepanov', active: true,  email: 'stepanov.av@vgk.ru', initials: 'СА' },
    { id: 'u-003', name: 'Котов А. С.',    position: 'Сервисный блок',  role: 'user',  domains: ['excavators'],           telegramId: '199842331', teamsId: '', teamsName: 'Anton Kotov',    active: true,  email: 'kotov.as@vgk.ru',    initials: 'КА' },
    { id: 'u-004', name: 'Фаризунов Р. С.',position: 'Диспетчерская',   role: 'user',  domains: ['excavators', 'port'],   telegramId: '317650912', teamsId: 'aad-2298', teamsName: 'Roman F.',     active: true,  email: 'farizunov.rs@vgk.ru',initials: 'ФР' },
    { id: 'u-005', name: 'Гречко И. С.',   position: 'Логистика',       role: 'user',  domains: ['port'],                 telegramId: '512991034', teamsId: '', teamsName: 'Ivan Grechko',   active: true,  email: 'grechko.is@vgk.ru',  initials: 'ГИ' },
    { id: 'u-006', name: 'Старков М. Ю.',  position: 'Энергетика',      role: 'user',  domains: ['excavators'],           telegramId: '',          teamsId: 'aad-7714', teamsName: 'Mikhail S.',   active: false, email: 'starkov.my@vgk.ru',  initials: 'СМ' },
    { id: 'u-007', name: 'Карху И. С.',    position: 'HR',              role: 'admin', domains: ['excavators', 'port'],   telegramId: '604119887', teamsId: 'aad-1142', teamsName: 'Irina K.',     active: true,  email: 'karhu.is@vgk.ru',    initials: 'КИ' },
    { id: 'u-008', name: 'Иванов И. И.',   position: 'Стажёр',          role: 'pending', domains: [],                     telegramId: '',          teamsId: '', teamsName: '',               active: false, email: 'ivanov.ii@vgk.ru',   initials: 'ИИ' },
  ];

  return {
    me, solutions, versionMap, activity, marketplace, sources, memory, channels, billing,
    previewSeries, previewTable, domains, users,
  };
})();

Object.assign(window, { OESDATA });
