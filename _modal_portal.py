"""Bulk-replace `<div className="modal-backdrop" onClick={onClose}>...</div>` with
   `<Modal onClose={onClose}>...</Modal>` in source files that contain modals.
   Also injects `import { Modal } from '<rel>/portal.jsx'` once per file.

   Uses balanced <div>/</div> counting (safe because modal content has no <div in strings)."""

import re, os, sys

FILES = {
    'src/sections/various.jsx': '../portal.jsx',
    'src/sections/admin.jsx': '../portal.jsx',
    'src/sections/solution-view.jsx': '../portal.jsx',
    'src/sections/usage.jsx': '../portal.jsx',
}

OPENER = re.compile(r'<div className="modal-backdrop" onClick=\{onClose\}>')

OPEN_TAG = re.compile(r'<div\b[^>]*?>')
CLOSE_TAG = re.compile(r'</div>')

def find_matching_close(text, start):
    """Given text and start index after opening <div...>, find matching </div>."""
    depth = 1
    i = start
    while depth > 0 and i < len(text):
        m_open = OPEN_TAG.search(text, i)
        m_close = CLOSE_TAG.search(text, i)
        if not m_close:
            raise RuntimeError('unmatched modal-backdrop')
        if m_open and m_open.start() < m_close.start():
            tag = m_open.group(0)
            if tag.endswith('/>'):
                i = m_open.end()  # self-closing: don't change depth
            else:
                depth += 1
                i = m_open.end()
        else:
            depth -= 1
            if depth == 0:
                return m_close.start()
            i = m_close.end()
    raise RuntimeError('unmatched modal-backdrop')

def transform(text):
    out = []
    cursor = 0
    n = 0
    while True:
        m = OPENER.search(text, cursor)
        if not m:
            out.append(text[cursor:])
            return ''.join(out), n
        out.append(text[cursor:m.start()])
        close_at = find_matching_close(text, m.end())
        inner = text[m.end():close_at]
        out.append('<Modal onClose={onClose}>')
        out.append(inner)
        out.append('</Modal>')
        cursor = close_at + len('</div>')
        n += 1

def ensure_import(text, rel):
    line = f"import {{ Modal }} from '{rel}';"
    if line in text:
        return text
    # Insert after the last existing import (cheap approach: after first run of import lines).
    m = list(re.finditer(r"^import .*?;\s*\n", text, re.M))
    if not m:
        return line + '\n' + text
    last = m[-1]
    return text[:last.end()] + line + '\n' + text[last.end():]

os.chdir(r'C:\Users\boikovaa\Desktop\projects\oesx_agents_portal\meta-pp')
total = 0
for fn, rel in FILES.items():
    src = open(fn, encoding='utf-8').read()
    new, count = transform(src)
    if count == 0:
        print(f'{fn}: no modals'); continue
    new = ensure_import(new, rel)
    open(fn, 'w', encoding='utf-8').write(new)
    print(f'{fn}: replaced {count} modal(s)')
    total += count
print(f'Total replaced: {total}')
