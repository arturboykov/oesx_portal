import React from 'react';
/* OES Lucide icons + the cube logo. Stroke-width 1.5, currentColor. */

const I = ({ d, size = 16, className, style }) => (
  <svg
    width={size} height={size}
    viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={1.5}
    strokeLinecap="round" strokeLinejoin="round"
    className={className} style={style}
  >{d}</svg>
);

const IconSearch       = (p) => <I {...p} d={<><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></>} />;
const IconBell         = (p) => <I {...p} d={<><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></>} />;
const IconUser         = (p) => <I {...p} d={<><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/></>} />;
const IconTrendingUp   = (p) => <I {...p} d={<><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></>} />;
const IconBarChart     = (p) => <I {...p} d={<><path d="M3 3v18h18"/><path d="M7 14v4"/><path d="M12 9v9"/><path d="M17 5v13"/></>} />;
const IconActivity     = (p) => <I {...p} d={<path d="M3 12h4l3-9 4 18 3-9h4"/>} />;
const IconRefresh      = (p) => <I {...p} d={<><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></>} />;
const IconDownload     = (p) => <I {...p} d={<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><path d="M12 15V3"/></>} />;
const IconZap          = (p) => <I {...p} d={<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>} />;
const IconChevronLeft  = (p) => <I {...p} d={<polyline points="15 18 9 12 15 6"/>} />;
const IconChevronRight = (p) => <I {...p} d={<polyline points="9 18 15 12 9 6"/>} />;
const IconChevronDown  = (p) => <I {...p} d={<polyline points="6 9 12 15 18 9"/>} />;
const IconArrowLeft    = (p) => <I {...p} d={<><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></>} />;
const IconArrowRight   = (p) => <I {...p} d={<><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></>} />;
const IconArrowUpRight = (p) => <I {...p} d={<><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></>} />;
const IconGrid         = (p) => <I {...p} d={<><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></>} />;
const IconAlertCircle  = (p) => <I {...p} d={<><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>} />;
const IconClock        = (p) => <I {...p} d={<><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>} />;
const IconLock         = (p) => <I {...p} d={<><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>} />;
const IconMessageSquare= (p) => <I {...p} d={<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>} />;
const IconPickaxe      = (p) => <I {...p} d={<><path d="M14 11v9"/><path d="M3 21 14 10"/><path d="M22 2 12 12"/><path d="m20 4-8 8"/><path d="M14 10c2-2 6-2 8 0"/></>} />;
const IconTriangle     = (p) => <I {...p} d={<path d="M12 3 22 20H2z"/>} />;
const IconLayers       = (p) => <I {...p} d={<><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></>} />;
const IconHeadphones   = (p) => <I {...p} d={<><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z"/><path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></>} />;
const IconSettings     = (p) => <I {...p} d={<><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></>} />;
const IconHome         = (p) => <I {...p} d={<><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>} />;
const IconBox          = (p) => <I {...p} d={<><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></>} />;
const IconPlus         = (p) => <I {...p} d={<><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>} />;
const IconStore        = (p) => <I {...p} d={<><path d="m2 7 4-5h12l4 5"/><path d="M2 7v13a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7"/><path d="M2 7h20"/><path d="M9 11v4"/><path d="M15 11v4"/></>} />;
const IconCoins        = (p) => <I {...p} d={<><circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18"/><path d="M7 6h1v4"/><path d="m16.71 13.88.7.71-2.82 2.82"/></>} />;
const IconBrain        = (p) => <I {...p} d={<><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2"/><path d="M14.5 2a2.5 2.5 0 0 0-2.5 2.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2"/></>} />;
const IconLifeBuoy     = (p) => <I {...p} d={<><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="4.93" y1="4.93" x2="9.17" y2="9.17"/><line x1="14.83" y1="14.83" x2="19.07" y2="19.07"/><line x1="14.83" y1="9.17" x2="19.07" y2="4.93"/><line x1="4.93" y1="19.07" x2="9.17" y2="14.83"/></>} />;
const IconStar         = (p) => <I {...p} d={<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>} />;
const IconCheck        = (p) => <I {...p} d={<polyline points="20 6 9 17 4 12"/>} />;
const IconX            = (p) => <I {...p} d={<><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>} />;
const IconEdit         = (p) => <I {...p} d={<><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z"/></>} />;
const IconTrash        = (p) => <I {...p} d={<><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></>} />;
const IconFork         = (p) => <I {...p} d={<><circle cx="6" cy="3" r="2"/><circle cx="18" cy="3" r="2"/><circle cx="12" cy="21" r="2"/><path d="M6 5v6a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V5"/><path d="M12 14v5"/></>} />;
const IconShare        = (p) => <I {...p} d={<><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></>} />;
const IconSend         = (p) => <I {...p} d={<><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></>} />;
const IconPaperclip    = (p) => <I {...p} d={<path d="M21.44 11.05 12.25 20.24a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66L9.41 17.41a2 2 0 0 1-2.83-2.83l8.49-8.48"/>} />;
const IconDatabase     = (p) => <I {...p} d={<><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/><path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"/></>} />;
const IconBookOpen     = (p) => <I {...p} d={<><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></>} />;
const IconCalendar     = (p) => <I {...p} d={<><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>} />;
const IconFilter       = (p) => <I {...p} d={<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>} />;
const IconSparkles     = (p) => <I {...p} d={<><path d="m12 3-1.91 5.09L5 10l5.09 1.91L12 17l1.91-5.09L19 10l-5.09-1.91z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></>} />;
const IconCpu          = (p) => <I {...p} d={<><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="2" x2="9" y2="4"/><line x1="15" y1="2" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="22"/><line x1="15" y1="20" x2="15" y2="22"/><line x1="20" y1="9" x2="22" y2="9"/><line x1="20" y1="15" x2="22" y2="15"/><line x1="2" y1="9" x2="4" y2="9"/><line x1="2" y1="15" x2="4" y2="15"/></>} />;
const IconShield       = (p) => <I {...p} d={<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>} />;
const IconLink         = (p) => <I {...p} d={<><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></>} />;
const IconMail         = (p) => <I {...p} d={<><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22 6 12 13 2 6"/></>} />;
const IconMailOpen     = (p) => <I {...p} d={<><path d="M21.2 8.4c.5.38.8.97.8 1.6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 .8-1.6l8-6a2 2 0 0 1 2.4 0z"/><path d="m22 10-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 10"/></>} />;
const IconUsers        = (p) => <I {...p} d={<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>} />;
const IconGitBranch    = (p) => <I {...p} d={<><line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/></>} />;
const IconEye          = (p) => <I {...p} d={<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>} />;
const IconMoreH        = (p) => <I {...p} d={<><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></>} />;
const IconSliders      = (p) => <I {...p} d={<><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></>} />;
const IconSun          = (p) => <I {...p} d={<><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></>} />;
const IconMoon         = (p) => <I {...p} d={<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>} />;
const IconWrench       = (p) => <I {...p} d={<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>} />;
const IconPlay         = (p) => <I {...p} d={<polygon points="5 3 19 12 5 21 5 3"/>} />;
const IconPause        = (p) => <I {...p} d={<><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></>} />;
const IconCopy         = (p) => <I {...p} d={<><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></>} />;
const IconPanelLeft    = (p) => <I {...p} d={<><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/></>} />;
const IconPanelLeftClose = (p) => <I {...p} d={<><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/><polyline points="15 9 13 11 15 13"/></>} />;
const IconExpand       = (p) => <I {...p} d={<><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></>} />;
const IconLogOut       = (p) => <I {...p} d={<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>} />;
const IconUserCheck    = (p) => <I {...p} d={<><circle cx="9" cy="8" r="4"/><path d="M1 21a8 8 0 1 1 16 0"/><polyline points="16 11 18 13 23 8"/></>} />;

/* OES cube — official isometric mark */
const CubeLogo = ({ size = 22, color = '#0C8995' }) => (
  <svg width={size} height={size} viewBox="60 20 320 365" fill="none" style={{ flexShrink: 0 }}>
    <path fillRule="evenodd" clipRule="evenodd" d="M215.178 358.422L83.6339 282.056V129.48L215.178 205.689V358.422ZM190.818 220.029V316.16L108.151 268.094V171.964L190.818 220.029Z" fill={color}/>
    <path d="M356.152 282.009L224.765 358.376V330.39L332.578 267.937V233.627L224.765 296.239V205.8L356.31 129.592V157.261L248.811 219.714V254.34L356.31 191.887L356.152 282.009Z" fill={color}/>
    <path d="M326.609 106.824L219.896 168.862L190.979 152.201L297.692 90.2223L273.174 75.8344L166.461 137.971L137.544 121.212L244.257 59.2329L219.739 44.845L88.352 121.212L219.896 197.42L350.97 121.212L326.609 106.824Z" fill={color}/>
    <path d="M219.972 27.8027L70 116.422V290.253L219.972 378.873L369.944 290.253V116.422L219.972 27.8027Z" stroke={color} strokeWidth={6.8169}/>
  </svg>
);

/* Channel marks — Teams / Email / TG / Max — simple monogram tiles */
const ChannelGlyph = ({ kind, size = 14 }) => {
  const map = {
    teams: { label: 'T', color: '#5B5FC7' },
    email: { label: '@', color: '#6A9EB8' },
    tg:    { label: 'TG', color: '#2AABEE' },
    max:   { label: 'M', color: '#FF5C5C' },
  };
  const m = map[kind] || map.email;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: size + 4, height: size + 4, borderRadius: 4,
      background: m.color, color: '#fff',
      fontFamily: 'var(--font-mono)', fontSize: size - 4, fontWeight: 600,
      letterSpacing: 0, lineHeight: 1,
    }}>{m.label}</span>
  );
};

export {
  IconSearch, IconBell, IconUser, IconTrendingUp, IconBarChart, IconActivity,
  IconRefresh, IconDownload, IconZap, IconChevronLeft, IconChevronRight, IconChevronDown,
  IconArrowLeft, IconArrowRight, IconArrowUpRight, IconGrid, IconAlertCircle, IconClock,
  IconLock, IconMessageSquare, IconPickaxe, IconTriangle, IconLayers,
  IconHeadphones, IconSettings, IconHome, IconBox, IconPlus, IconStore,
  IconCoins, IconBrain, IconLifeBuoy, IconStar, IconCheck, IconX, IconEdit, IconTrash,
  IconFork, IconShare, IconSend, IconPaperclip, IconDatabase, IconBookOpen,
  IconCalendar, IconFilter, IconSparkles, IconCpu, IconShield, IconLink, IconMail, IconMailOpen,
  IconUsers, IconGitBranch, IconEye, IconMoreH, IconSliders, IconSun, IconMoon,
  IconWrench, IconPlay, IconPause, IconCopy,
  IconPanelLeft, IconPanelLeftClose, IconExpand, IconLogOut, IconUserCheck,
  CubeLogo, ChannelGlyph,
};
