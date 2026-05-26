// Toast notification system
let toastId = 0;

function createToast(message, type = 'info', duration = 3500) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const id = ++toastId;
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.id = `toast-${id}`;

  const icons = { success: '✓', error: '✗', info: 'ℹ' };
  el.innerHTML = `<span style="font-size:1.1rem;font-weight:700">${icons[type] || 'ℹ'}</span><span>${message}</span>`;

  container.appendChild(el);

  setTimeout(() => {
    el.classList.add('removing');
    setTimeout(() => el.remove(), 300);
  }, duration);
}

export function toast(message, type = 'info') {
  createToast(message, type);
}

export function toastSuccess(message) { createToast(message, 'success'); }
export function toastError(message) { createToast(message, 'error'); }
export function toastInfo(message) { createToast(message, 'info'); }
