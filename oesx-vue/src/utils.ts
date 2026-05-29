/* Небольшие общие утилиты (порт src/utils.jsx). */

// Собирает CSV-строку и запускает скачивание в браузере.
// Разделитель ";" + UTF-8 BOM, чтобы Excel (ru) корректно открыл кириллицу.
export function downloadCSV(filename: string, headers: string[], rows: (string | number)[][]): void {
  const esc = (v: string | number): string => {
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

// Уникальный 8-символьный hex-id (для новых решений — solution.shortId).
export function makeShortId(): string {
  return Math.random().toString(16).slice(2, 10).padEnd(8, '0');
}
