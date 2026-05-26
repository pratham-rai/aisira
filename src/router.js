// Hash-based SPA router
import { render404 } from './pages/404.js';
const routes = {};
let currentCleanup = null;

export function registerRoute(path, handler) {
  routes[path] = handler;
}

export function navigate(path) {
  window.location.hash = path;
}

export function getCurrentPath() {
  return window.location.hash.slice(1) || '/';
}

export function getRouteParams(pattern, path) {
  const patternParts = pattern.split('/');
  const pathParts = path.split('/');
  const params = {};
  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(':')) {
      params[patternParts[i].slice(1)] = pathParts[i];
    }
  }
  return params;
}

function matchRoute(path) {
  // Exact match first
  if (routes[path]) return { handler: routes[path], params: {} };

  // Pattern match
  for (const pattern in routes) {
    const patternParts = pattern.split('/');
    const pathParts = path.split('/');
    if (patternParts.length !== pathParts.length) continue;
    let match = true;
    const params = {};
    for (let i = 0; i < patternParts.length; i++) {
      if (patternParts[i].startsWith(':')) {
        params[patternParts[i].slice(1)] = pathParts[i];
      } else if (patternParts[i] !== pathParts[i]) {
        match = false;
        break;
      }
    }
    if (match) return { handler: routes[pattern], params };
  }
  return null;
}

export function startRouter() {
  function onHashChange() {
    const path = getCurrentPath();
    const route = matchRoute(path);

    // Cleanup previous page
    if (currentCleanup && typeof currentCleanup === 'function') {
      currentCleanup();
      currentCleanup = null;
    }

    if (route) {
      const result = route.handler(route.params);
      // Only store as cleanup if it's a function (not a Promise)
      if (typeof result === 'function') {
        currentCleanup = result;
      } else {
        currentCleanup = null;
      }
    } else {
      // 404
      const app = document.getElementById('app');
      const content = app.querySelector('.page-content') || app;
      render404(content);
    }
  }

  window.addEventListener('hashchange', onHashChange);

  // Initial route
  if (!window.location.hash) {
    window.location.hash = '/';
  } else {
    onHashChange();
  }
}
