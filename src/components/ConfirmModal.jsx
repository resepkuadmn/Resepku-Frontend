import React from 'react';
import { createPortal } from 'react-dom';

export default function ConfirmModal({ open, title, message, confirmLabel = 'OK', cancelLabel = 'Batal', onConfirm, onCancel }) {
  if (!open) return null;

  const modal = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        <div className="p-6">
          {title && <h3 className="text-lg font-bold mb-2">{title}</h3>}
          <p className="text-sm text-gray-600 mb-6">{message}</p>
          <div className="flex justify-end gap-3">
            <button onClick={onCancel} className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200">{cancelLabel}</button>
            <button onClick={onConfirm} className="px-4 py-2 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700">{confirmLabel}</button>
          </div>
        </div>
      </div>
    </div>
  );

  // Render in document.body to avoid positioning issues when parent nodes
  // use CSS transforms (which can change how `position: fixed` behaves).
  if (typeof document !== 'undefined') {
    return createPortal(modal, document.body);
  }

  return modal;
}
