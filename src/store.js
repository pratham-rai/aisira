// Simple reactive state store
const state = {};
const listeners = {};

export function getState(key) {
  return state[key];
}

export function setState(key, value) {
  state[key] = value;
  if (listeners[key]) {
    listeners[key].forEach(fn => fn(value));
  }
}

export function subscribe(key, fn) {
  if (!listeners[key]) listeners[key] = [];
  listeners[key].push(fn);
  // Return unsubscribe function
  return () => {
    listeners[key] = listeners[key].filter(f => f !== fn);
  };
}
