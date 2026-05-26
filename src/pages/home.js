import { getApprovedEvents } from '../data.js';
import { getCurrentUser, isLoggedIn } from '../auth.js';
import { navigate } from '../router.js';
import { formatShortDate, formatDateRange, formatTime, isUpcoming, isToday, isThisWeek, isThisMonth } from '../utils/date.js';
import { EVENT_CATEGORIES } from '../utils/constants.js';
import { calculateDistance, getCurrentLocation } from '../utils/geo.js';
import { CATEGORY_INFO } from '../utils/category-data.js';
import { updateSEO } from '../utils/seo.js';

export function renderHome(container) {
  let searchQuery = '';
  let filterCategory = '';
  let filterDate = '';
  let sortBy = 'earliest';
  let allEvents = [];
  let userLocation = null;
  let loadingLocation = false;
  let locationError = '';
  let nearbyRadius = 50; // Default 50km

  async function loadEvents() {
    updateSEO('Home', 'Discover cultural events of Tulunadu near you. Browse Yakshagana, Nema, Kambala, and Temple fairs.');
    // Show loading skeleton
    container.innerHTML = `
      <div class="page-wrapper animate-fade-in-up">
        <div class="page-header" style="text-align:center;margin-bottom:40px">
          <img src="/logo.png" alt="Aisira Logo" style="display:block;margin:0 auto 8px auto;width:80px;height:80px;object-fit:contain" />
          <h1 style="font-size:2.5rem;margin:0">Aisira</h1>
          <p style="font-size:1.1rem;max-width:500px;margin:0 auto;margin-top:8px">Discover cultural performances of Tulunadu near you</p>
        </div>
        <div class="event-grid">
          ${[1,2,3].map(() => `
            <div class="card" style="padding:0;overflow:hidden">
              <div class="skeleton" style="height:180px;border-radius:0"></div>
              <div style="padding:16px;display:flex;flex-direction:column;gap:10px">
                <div class="skeleton" style="height:16px;width:60px"></div>
                <div class="skeleton" style="height:20px;width:80%"></div>
                <div class="skeleton" style="height:14px;width:70%"></div>
                <div class="skeleton" style="height:14px;width:50%"></div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    try {
      allEvents = await getApprovedEvents();
    } catch (err) {
      console.error('Failed to load events:', err);
      allEvents = [];
    }
    render();
  }
  function getFilteredEvents() {
    // Filter by upcoming (considering end date if exists)
    let events = allEvents.filter(e => {
      const dateToCompare = e.endDate || e.date;
      return isUpcoming(dateToCompare, e.time);
    });
    
    // Default sorting
    events.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}:00+05:30`);
      const dateB = new Date(`${b.date}T${b.time}:00+05:30`);
      return dateA - dateB;
    });

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      events = events.filter(e =>
        e.prasanga.toLowerCase().includes(q) ||
        (e.troupe && e.troupe.toLowerCase().includes(q)) ||
        e.location.toLowerCase().includes(q) ||
        (e.category && e.category.toLowerCase().includes(q))
      );
    }
    if (filterCategory) events = events.filter(e => e.category === filterCategory);
    if (filterDate === 'today') events = events.filter(e => isToday(e.date));
    else if (filterDate === 'week') events = events.filter(e => isThisWeek(e.date));
    else if (filterDate === 'month') events = events.filter(e => isThisMonth(e.date));

    // Custom sorting & Nearby filtering
    if (sortBy === 'latest') {
      events.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (sortBy === 'title') {
      events.sort((a, b) => a.prasanga.localeCompare(b.prasanga));
    } else if (sortBy === 'nearby' && userLocation) {
      // Create shallow copies to avoid mutating allEvents
      events = events.map(e => {
        const dist = (e.latitude && e.longitude) 
          ? calculateDistance(userLocation.lat, userLocation.lng, e.latitude, e.longitude)
          : Infinity;
        return { ...e, distance: dist };
      });
      // Filter within nearbyRadius and sort by distance
      events = events.filter(e => e.distance <= nearbyRadius);
      events.sort((a, b) => a.distance - b.distance);
    }

    return events;
  }

  function render() {
    const events = getFilteredEvents();
    const user = getCurrentUser();

    container.innerHTML = `
      <div class="page-wrapper animate-fade-in-up">
        <div class="page-header" style="text-align:center;margin-bottom:40px">
          <img src="/logo.png" alt="Aisira Logo" style="display:block;margin:0 auto 8px auto;width:80px;height:80px;object-fit:contain" />
          <h1 style="font-size:2.5rem;margin:0">Aisira</h1>
          <p style="font-size:1.1rem;max-width:500px;margin:0 auto;margin-top:8px">Discover cultural performances of Tulunadu near you</p>
        </div>

        <div style="text-align:center; margin-bottom:32px">
          <div class="stat-card" style="display:inline-block; min-width:150px">
            <div class="stat-value">${events.length}</div>
            <div class="stat-label">Upcoming Events</div>
          </div>
        </div>

        <div style="margin-bottom:40px">
          <h2 style="font-size:1.2rem; margin-bottom:16px; text-align:center; color:var(--text-muted)">Explore by Category</h2>
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(140px, 1fr)); gap:16px">
            ${EVENT_CATEGORIES.map(cat => {
              const info = CATEGORY_INFO[cat] || { emoji: '✨', color: '#455A64' };
              const catEvents = allEvents.filter(e => e.category === cat && isUpcoming(e.endDate || e.date, e.time)).length;
              return `
                <a href="#/category/${encodeURIComponent(cat)}" class="card-strong category-box" style="padding:16px; text-align:center; text-decoration:none; transition:transform 0.2s; border:1px solid ${info.color}33">
                  <div style="font-size:2rem; margin-bottom:8px">${info.emoji}</div>
                  <div style="font-weight:600; font-size:0.9rem; color:var(--text-primary)">${cat}</div>
                  <div style="font-size:0.75rem; color:var(--text-muted); margin-top:4px">${catEvents} Events</div>
                </a>
              `;
            }).join('')}
          </div>
        </div>


        <div class="filter-bar">

          <div class="search-wrapper">
            <span class="search-icon">🔍</span>
            <input type="text" class="input-field" id="search-input" placeholder="Search event, troupe, or location..."
              value="${searchQuery}" style="padding-left:42px" />
          </div>
          <div class="filter-group">
            <select class="input-field" id="filter-category" style="width:auto;min-width:140px">
              <option value="">All Categories</option>
              ${EVENT_CATEGORIES.map(c => `<option value="${c}" ${filterCategory === c ? 'selected' : ''}>${c}</option>`).join('')}
            </select>
            </select>
            <select class="input-field" id="filter-date" style="width:auto;min-width:130px">
              <option value="" ${!filterDate ? 'selected' : ''}>All Dates</option>
              <option value="today" ${filterDate === 'today' ? 'selected' : ''}>Today</option>
              <option value="week" ${filterDate === 'week' ? 'selected' : ''}>This Week</option>
              <option value="month" ${filterDate === 'month' ? 'selected' : ''}>This Month</option>
            </select>
            <select class="input-field" id="sort-by" style="width:auto;min-width:130px">
              <option value="earliest" ${sortBy === 'earliest' ? 'selected' : ''}>Earliest First</option>
              <option value="latest" ${sortBy === 'latest' ? 'selected' : ''}>Latest First</option>
              <option value="title" ${sortBy === 'title' ? 'selected' : ''}>Title (A-Z)</option>
              <option value="nearby" ${sortBy === 'nearby' ? 'selected' : ''}>📍 Nearby</option>
            </select>
          </div>
        </div>

        ${sortBy === 'nearby' && userLocation ? `
          <div class="card-strong animate-fade-in-up" style="margin-bottom:24px; padding:16px; background:rgba(232, 117, 26, 0.05); border:1px solid var(--accent-subtle)">
            <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px">
              <div style="display:flex; align-items:center; gap:8px">
                <span style="font-size:1.2rem">📏</span>
                <span style="font-weight:600">Search Radius: <span style="color:var(--accent-light)">${nearbyRadius} km</span></span>
              </div>
              <input type="range" id="nearby-radius-slider" min="5" max="100" step="5" value="${nearbyRadius}" style="flex:1; max-width:300px; cursor:pointer" />
            </div>
          </div>
        ` : ''}

        ${loadingLocation ? `
          <div style="text-align:center;margin:20px 0;color:var(--accent-light)">
            <div class="spinner" style="margin:0 auto 10px"></div>
            <p>Accessing your location...</p>
          </div>
        ` : ''}

        ${locationError ? `
          <div class="card-strong animate-fade-in-up" style="margin:20px 0; padding:16px; border-left:4px solid var(--red-light); background:rgba(239, 68, 68, 0.05)">
            <div style="display:flex; align-items:center; gap:12px">
              <span style="font-size:1.2rem">📍</span>
              <div style="flex:1">
                <p style="margin:0; color:var(--red-light); font-weight:500">${locationError}</p>
                <p style="margin:4px 0 0 0; font-size:0.85rem; color:var(--text-secondary)">Using default sorting instead.</p>
              </div>
              <button class="btn btn-sm btn-ghost" onclick="location.reload()" style="padding:4px 8px">Retry</button>
            </div>
          </div>
        ` : ''}

        ${events.length === 0 ? `
          <div class="empty-state">
            <div class="empty-icon">${sortBy === 'nearby' ? '📍' : '🎪'}</div>
            <h3>${sortBy === 'nearby' ? `No events within ${nearbyRadius}km` : 'No events found'}</h3>
            <p>${sortBy === 'nearby' 
              ? 'Try expanding your search radius using the slider above or check other sorting options.' 
              : 'Try adjusting your search or filters to see more events.'}</p>
            <div style="margin-top:24px; display:flex; gap:12px; justify-content:center">
              ${(searchQuery || filterCategory || filterDate || sortBy !== 'earliest') ? `
                <button class="btn btn-secondary btn-sm" id="clear-filters-btn">✕ Clear All Filters</button>
              ` : ''}
              ${sortBy === 'nearby' ? '<button class="btn btn-primary btn-sm" id="expand-radius-btn">📏 Expand to 100km</button>' : ''}
            </div>
          </div>
        ` : `
          <div class="event-grid">
            ${events.map((event, i) => {
              const cardHtml = `
              <div class="event-card animate-fade-in-up" style="animation-delay:${i * 80}ms" data-event-id="${event.id}">
                ${event.posterUrls && event.posterUrls.length > 0
                  ? `<img class="poster" src="${event.posterUrls[0]}" alt="${event.prasanga}" />`
                  : `<div class="poster-placeholder" style="display:flex;align-items:center;justify-content:center"><img src="/logo.png" alt="Placeholder" style="width:64px;height:64px;object-fit:contain;opacity:0.3" /></div>`}
                <div class="card-body">
                  <div style="margin-bottom:8px">
                    <a href="#/category/${encodeURIComponent(event.category || 'Yakshagana')}" class="badge badge-category" style="background:var(--accent);color:#fff;text-decoration:none" onclick="event.stopPropagation()">${event.category || 'Yakshagana'}</a>
                    ${isToday(event.date) ? '<span class="badge badge-approved" style="margin-left:4px">TODAY</span>' : ''}
                  </div>
                  <h3 class="card-title">${event.prasanga}</h3>
                  <div class="card-meta">
                    ${event.troupe ? `<div class="card-meta-item">🎪 ${event.troupe}</div>` : ''}
                    <div class="card-meta-item">📅 ${formatDateRange(event.date, event.endDate)} · ${formatTime(event.time)}</div>
                    <div class="card-meta-item">📍 ${event.location}</div>
                    <div class="card-meta-item">👁️ ${event.views || 0} views</div>
                    ${event.distance && event.distance !== Infinity ? `<div class="card-meta-item" style="color:var(--accent-light);font-weight:600">📍 ${event.distance.toFixed(1)} km away</div>` : ''}
                  </div>
                </div>
              </div>`;

              return cardHtml;
            }).join('')}
          </div>
        `}

        <!-- Compact WhatsApp Footer CTA -->
        <div class="card-strong animate-fade-in-up" style="margin-top:48px; padding:20px; background:linear-gradient(135deg, rgba(37,211,102,0.08), rgba(18,140,126,0.05)); border:1px solid rgba(37,211,102,0.15); border-radius:var(--radius-md)">
          <div style="display:flex; align-items:center; justify-content:center; gap:24px; flex-wrap:wrap">
            <div style="display:flex; align-items:center; gap:12px">
              <span style="font-size:1.5rem">📱</span>
              <div style="text-align:left">
                <h3 style="margin:0; font-size:1.1rem; color:#25D366">Aisira on WhatsApp</h3>
                <p style="margin:2px 0 0 0; font-size:0.85rem; color:var(--text-secondary)">Instant alerts for new events and updates.</p>
              </div>
            </div>
            <a href="https://whatsapp.com/channel/0029VbCwNltHltYAjy7rd30W" target="_blank" rel="noopener" class="btn" style="background:#25D366; color:white; border:none; padding:8px 20px; font-weight:600; font-size:0.9rem">
              Join Channel
            </a>

          </div>
        </div>

      </div>


      ${isLoggedIn() ? `<a href="#/add" class="fab" title="Add Event">+</a>` : ''}
    `;

    // Listeners
    document.getElementById('search-input')?.addEventListener('input', (e) => { searchQuery = e.target.value; render(); });
    document.getElementById('filter-category')?.addEventListener('change', (e) => { filterCategory = e.target.value; render(); });
    document.getElementById('filter-date')?.addEventListener('change', (e) => { filterDate = e.target.value; render(); });
    document.getElementById('sort-by')?.addEventListener('change', async (e) => {
      sortBy = e.target.value;
      if (sortBy === 'nearby' && !userLocation) {
        loadingLocation = true;
        locationError = '';
        render();
        try {
          userLocation = await getCurrentLocation();
        } catch (err) {
          locationError = err.message;
          sortBy = 'earliest';
        }
        loadingLocation = false;
      } else {
        locationError = ''; // Reset error if they switch away from nearby
      }
      render();
    });

    document.getElementById('nearby-radius-slider')?.addEventListener('input', (e) => {
      nearbyRadius = parseInt(e.target.value);
      render();
    });

    document.getElementById('clear-filters-btn')?.addEventListener('click', () => {
      searchQuery = '';
      filterCategory = '';
      filterDate = '';
      sortBy = 'earliest';
      nearbyRadius = 50;
      render();
    });

    document.getElementById('expand-radius-btn')?.addEventListener('click', () => {
      nearbyRadius = 100;
      render();
    });
    container.querySelectorAll('.event-card').forEach(card => {
      card.addEventListener('click', () => navigate(`/event/${card.dataset.eventId}`));
    });
  }

  loadEvents();
}
