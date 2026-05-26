import './styles/index.css';
import './styles/components.css';
import { initAuth, getCurrentUser, isLoggedIn, isAdmin, isMasterAdmin, logout } from './auth.js';
import { registerRoute, startRouter, navigate, getCurrentPath } from './router.js';
import { subscribe } from './store.js';
import { renderLogin } from './pages/login.js';
import { renderHome } from './pages/home.js';
import { renderEventDetail } from './pages/event-detail.js';
import { renderAddEvent } from './pages/add-event.js';
import { renderMapView } from './pages/map-view.js';
import { renderAdminPanel } from './pages/admin-panel.js';
import { renderAdminUsers } from './pages/admin-users.js';
import { renderProfile } from './pages/profile.js';
import { renderAbout } from './pages/about.js';
import { renderContact } from './pages/contact.js';
import { renderPastEvents } from './pages/past-events.js';
import { renderMySubmissions } from './pages/my-submissions.js';
import { renderEditEvent } from './pages/edit-event.js';
import { renderDeletedEvents } from './pages/deleted-events.js';
import { renderCategoryDetail } from './pages/category-detail.js';


import { renderMerchandise } from './pages/merchandise.js';


// Build app shell
const app = document.getElementById('app');
app.innerHTML = `
  <div class="animated-bg">
    <div class="orb orb-1"></div>
    <div class="orb orb-2"></div>
    <div class="orb orb-3"></div>
    <div class="grid-overlay"></div>
  </div>
  <nav class="navbar" id="main-navbar"></nav>
  <div class="nav-overlay" id="nav-overlay"></div>
  <main class="page-content" id="page-content">
    <div class="page-wrapper" style="display:flex;align-items:center;justify-content:center;min-height:60vh">
      <div style="text-align:center">
        <img src="/logo.png" alt="Aisira Logo" style="width:80px;height:80px;margin-bottom:16px;object-fit:contain;animation:pulse 2s infinite" />
        <p style="color:var(--text-secondary)">Loading Aisira...</p>
      </div>
    </div>
  </main>
`;

// Navbar rendering
function renderNavbar() {
  const navbar = document.getElementById('main-navbar');
  const user = getCurrentUser();
  const path = getCurrentPath();
  const isActive = (p) => path === p ? 'active' : '';

  let links = `
    <a href="#/" class="${isActive('/')}" id="nav-home">🏠 Home</a>
    <a href="#/map" class="${isActive('/map')}" id="nav-map">🗺️ Map</a>
    <a href="#/about" class="${isActive('/about')}" id="nav-about">ℹ️ About</a>
    <a href="#/merchandise" class="${isActive('/merchandise')}" id="nav-merch">🛍️ Shop</a>
    <a href="#/contact" class="${isActive('/contact')}" id="nav-contact">📬 Contact</a>


  `;

  if (user) {
    links += `<a href="#/add" class="${isActive('/add')}" id="nav-add">➕ Add Event</a>`;
    if (isAdmin()) links += `<a href="#/admin" class="${isActive('/admin')}" id="nav-admin">⚙️ Admin</a>`;
    if (isMasterAdmin()) links += `<a href="#/admin/users" class="${isActive('/admin/users')}" id="nav-users">👥 Users</a>`;
    links += `
      <a href="#/profile" class="${isActive('/profile')} nav-user-info" style="font-size:0.85rem" id="nav-profile">
        👤 ${user.displayName} <span class="badge badge-thenku" style="font-size:0.65rem;margin-left:4px">${user.role}</span>
      </a>
      <button onclick="document.dispatchEvent(new Event('yn-logout'))" class="btn-ghost" style="color:var(--red-light)" id="nav-logout">🚪 Logout</button>
    `;
  } else {
    links += `<a href="#/login" class="${isActive('/login')}" id="nav-login">🔑 Login</a>`;
  }

  navbar.innerHTML = `
    <div class="navbar-inner">
      <a href="#/" class="navbar-logo" id="nav-logo"><img src="/logo.png" alt="Aisira Logo" style="height:28px;width:auto;margin-right:8px;object-fit:contain" /><span>Aisira</span></a>
      <div class="nav-toggle" id="nav-toggle"><span></span><span></span><span></span></div>
      <div class="navbar-links" id="navbar-links">${links}</div>
    </div>
  `;

  const toggle = document.getElementById('nav-toggle');
  const linksEl = document.getElementById('navbar-links');
  const overlay = document.getElementById('nav-overlay');
  const closeMenu = () => { toggle.classList.remove('open'); linksEl.classList.remove('open'); overlay.classList.remove('open'); };
  toggle.addEventListener('click', () => { toggle.classList.toggle('open'); linksEl.classList.toggle('open'); overlay.classList.toggle('open'); });
  overlay.addEventListener('click', closeMenu);
  linksEl.querySelectorAll('a, button').forEach(el => el.addEventListener('click', closeMenu));
  const handleScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 10);
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

document.addEventListener('yn-logout', () => { logout(); navigate('/'); });
subscribe('user', () => renderNavbar());
window.addEventListener('hashchange', () => renderNavbar());

function pageRender(renderFn) {
  return (params) => { const content = document.getElementById('page-content'); content.innerHTML = ''; return renderFn(content, params); };
}

registerRoute('/', pageRender(renderHome));
registerRoute('/login', pageRender(renderLogin));
registerRoute('/event/:id', pageRender(renderEventDetail));
registerRoute('/event/edit/:id', pageRender((c, p) => { if (!isLoggedIn()) { navigate('/login'); return; } return renderEditEvent(c, p); }));
registerRoute('/add', pageRender((c, p) => { if (!isLoggedIn()) { navigate('/login'); return; } return renderAddEvent(c, p); }));

registerRoute('/map', pageRender(renderMapView));
registerRoute('/admin', pageRender((c, p) => { if (!isAdmin()) { navigate('/'); return; } return renderAdminPanel(c, p); }));
registerRoute('/admin/users', pageRender((c, p) => { if (!isMasterAdmin()) { navigate('/'); return; } return renderAdminUsers(c, p); }));
registerRoute('/admin/past-events', pageRender((c, p) => { if (!isMasterAdmin()) { navigate('/'); return; } return renderPastEvents(c, p); }));
registerRoute('/admin/deleted-events', pageRender((c, p) => { if (!isMasterAdmin()) { navigate('/'); return; } return renderDeletedEvents(c, p); }));
registerRoute('/profile', pageRender((c, p) => { if (!isLoggedIn()) { navigate('/login'); return; } return renderProfile(c, p); }));
registerRoute('/profile/submissions', pageRender((c, p) => { if (!isLoggedIn()) { navigate('/login'); return; } return renderMySubmissions(c, p); }));
registerRoute('/about', pageRender(renderAbout));

registerRoute('/merchandise', pageRender(renderMerchandise));
registerRoute('/contact', pageRender(renderContact));
registerRoute('/category/:name', pageRender(renderCategoryDetail));

// Boot
async function boot() {
  await initAuth();
  renderNavbar();
  startRouter();

  // Register PWA Service Worker
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((reg) => console.log('🚀 PWA: Service Worker registered successfully with scope:', reg.scope))
        .catch((err) => console.error('❌ PWA: Service Worker registration failed:', err));
    });
  }
}
boot();
