/* Small shared utilities. */

// Build a CSV string and trigger a browser download.
// Uses ";" as separator and a UTF-8 BOM so Excel (ru locale) opens Cyrillic correctly.
export function downloadCSV(filename, headers, rows) {
  const esc = (v) => {
    const s = String(v ?? '');
    return /[",\n;]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  const lines = [headers.map(esc).join(';'), ...rows.map((r) => r.map(esc).join(';'))];
  const blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Generate a unique 8-hex id (used for new solutions — see solution.shortId).
export function makeShortId() {
  return Math.random().toString(16).slice(2, 10).padEnd(8, '0');
}
