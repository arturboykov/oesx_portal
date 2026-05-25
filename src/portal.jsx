/* Modal portal — рендерит модалку напрямую в document.body,
   чтобы position:fixed резолвился относительно viewport, а не
   ближайшего предка с transform/filter/will-change. */

import React from 'react';
import { createPortal } from 'react-dom';

export function Modal({ onClose, children }) {
  return createPortal(
    <div className="modal-backdrop" onClick={onClose}>{children}</div>,
    document.body
  );
}
