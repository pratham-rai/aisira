import { getApprovedEvents } from '../data.js';
import { CATEGORY_INFO } from '../utils/category-data.js';
import { formatDateRange, formatTime, isUpcoming, isToday } from '../utils/date.js';
import { navigate } from '../router.js';
import { updateSEO } from '../utils/seo.js';

export async function renderCategoryDetail(container, params) {
  const categoryName = decodeURIComponent(params.name);
  const info = CATEGORY_INFO[categoryName] || CATEGORY_INFO['Other Events'];
  
  updateSEO(info.title, info.description);

  // Loading state
  container.innerHTML = `
    <div class="page-wrapper" style="display:flex;align-items:center;justify-content:center;min-height:50vh">
      <div style="text-align:center"><img src="/logo.png" style="width:64px;height:64px;margin-bottom:12px;object-fit:contain;animation:pulse 2s infinite" /><p style="color:var(--text-secondary)">Loading category...</p></div>
    </div>
  `;

  let events = [];
  try {
    const all = await getApprovedEvents();
    events = all.filter(e => e.category === categoryName && isUpcoming(e.endDate || e.date, e.time));
  } catch (err) {
    console.error('Failed to load category events:', err);
  }

  container.innerHTML = `
    <div class="page-wrapper animate-fade-in-up">
      <button class="btn btn-ghost" id="back-btn" style="margin-bottom:20px">← Back</button>

      <div class="card-strong" style="padding:48px 32px; text-align:center; background:linear-gradient(135deg, ${info.color}22, ${info.color}11); border:1px solid ${info.color}33">
        <div style="font-size:4rem; margin-bottom:16px">${info.emoji}</div>
        <h1 style="font-size:2.5rem; margin:0; color:var(--text-primary)">${info.title}</h1>
        <p style="font-size:1.2rem; color:var(--text-secondary); max-width:600px; margin:16px auto 0">${info.description}</p>
      </div>

      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(300px, 1fr)); gap:32px; margin-top:32px">
        <div class="card" style="padding:24px">
          <h2 style="font-size:1.2rem; margin-bottom:12px; display:flex; align-items:center; gap:8px">📜 History & Significance</h2>
          <p style="color:var(--text-secondary); line-height:1.6">${info.history}</p>
        </div>

        <div class="card" style="padding:24px">
          <h2 style="font-size:1.2rem; margin-bottom:12px; display:flex; align-items:center; gap:8px">📊 Statistics</h2>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-top:16px">
            <div style="text-align:center; padding:12px; background:rgba(255,255,255,0.03); border-radius:var(--radius-md)">
              <div style="font-size:1.5rem; font-weight:700; color:${info.color}">${events.length}</div>
              <div style="font-size:0.8rem; color:var(--text-muted)">Upcoming Events</div>
            </div>
            <div style="text-align:center; padding:12px; background:rgba(255,255,255,0.03); border-radius:var(--radius-md)">
              <div style="font-size:1.5rem; font-weight:700; color:${info.color}">${new Set(events.map(e => e.location)).size}</div>
              <div style="font-size:0.8rem; color:var(--text-muted)">Locations</div>
            </div>
          </div>
        </div>
      </div>

      <div style="margin-top:48px">
        <h2 style="font-size:1.8rem; margin-bottom:24px">Upcoming ${info.title} Events</h2>
        ${events.length === 0 ? `
          <div class="empty-state">
            <div class="empty-icon">${info.emoji}</div>
            <h3>No upcoming events</h3>
            <p>Check back later for new ${info.title} events.</p>
          </div>
        ` : `
          <div class="event-grid">
            ${events.map((event, i) => `
              <div class="event-card animate-fade-in-up" style="animation-delay:${i * 80}ms" data-event-id="${event.id}">
                ${event.posterUrls && event.posterUrls.length > 0
                  ? `<img class="poster" src="${event.posterUrls[0]}" alt="${event.prasanga}" />`
                  : `<div class="poster-placeholder" style="display:flex;align-items:center;justify-content:center"><img src="/logo.png" alt="Placeholder" style="width:64px;height:64px;object-fit:contain;opacity:0.3" /></div>`}
                <div class="card-body">
                  <div style="margin-bottom:8px">
                    <span class="badge" style="background:${info.color}; color:#fff; border:none">${event.category || 'Yakshagana'}</span>
                    ${isToday(event.date) ? '<span class="badge badge-approved" style="margin-left:4px">TODAY</span>' : ''}
                  </div>
                  <h3 class="card-title">${event.prasanga}</h3>
                  <div class="card-meta">
                    ${event.troupe ? `<div class="card-meta-item">🎪 ${event.troupe}</div>` : ''}
                    <div class="card-meta-item">📅 ${formatDateRange(event.date, event.endDate)} · ${formatTime(event.time)}</div>
                    <div class="card-meta-item">📍 ${event.location}</div>
                    <div class="card-meta-item">👁️ ${event.views || 0} views</div>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    </div>
  `;

  document.getElementById('back-btn').addEventListener('click', () => window.history.back());
  container.querySelectorAll('.event-card').forEach(card => {
    card.addEventListener('click', () => navigate(`/event/${card.dataset.eventId}`));
  });
}
