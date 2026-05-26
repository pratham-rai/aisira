import { getApprovedEvents } from '../data.js';
import { formatShortDate, formatTime, isUpcoming, isToday, isThisWeek, isThisMonth } from '../utils/date.js';

export async function renderMapView(container) {
  let searchQuery = '';
  let filterCategory = '';
  let filterDate = '';
  let allEvents = [];
  let mapInstance = null;
  let markersLayer = null;
  let L = null;
  let standardIcon = null;

  async function loadEvents() {
    try {
      allEvents = await getApprovedEvents();
    } catch (err) {
      console.error('Failed to load events for map:', err);
      allEvents = [];
    }
    renderUI();
    initMap();
  }

  function getFilteredEvents() {
    // Filter by having location data and being upcoming
    let events = allEvents.filter(e => e.latitude && e.longitude && isUpcoming(e.endDate || e.date, e.time));

    // Search Query filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      events = events.filter(e =>
        e.prasanga.toLowerCase().includes(q) ||
        (e.troupe && e.troupe.toLowerCase().includes(q)) ||
        e.location.toLowerCase().includes(q) ||
        (e.category && e.category.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (filterCategory) {
      events = events.filter(e => e.category === filterCategory);
    }

    // Date filter
    if (filterDate === 'today') {
      events = events.filter(e => isToday(e.date));
    } else if (filterDate === 'week') {
      events = events.filter(e => isThisWeek(e.date));
    } else if (filterDate === 'month') {
      events = events.filter(e => isThisMonth(e.date));
    }

    return events;
  }

  function renderUI() {
    container.innerHTML = `
      <div class="page-wrapper animate-fade-in-up">
        <div class="page-header" style="margin-bottom:24px">
          <h1>🗺️ Event Map</h1>
          <p id="map-subtitle">Loading events...</p>
        </div>

        <div class="filter-bar" style="margin-bottom:20px; display:flex; gap:12px; flex-wrap:wrap">
          <div class="search-wrapper" style="flex:1; min-width:260px">
            <span class="search-icon">🔍</span>
            <input type="text" class="input-field" id="map-search" placeholder="Search event, troupe, or location..."
              value="${searchQuery}" style="padding-left:42px" />
          </div>
          <div class="filter-group" style="display:flex; gap:12px; flex-wrap:wrap">
            <select class="input-field" id="map-filter-category" style="width:auto; min-width:160px">
              <option value="">All Categories</option>
              <option value="Yakshagana" ${filterCategory === 'Yakshagana' ? 'selected' : ''}>Yakshagana</option>
              <option value="Nema/Kola" ${filterCategory === 'Nema/Kola' ? 'selected' : ''}>Nema/Kola</option>
              <option value="Kambala" ${filterCategory === 'Kambala' ? 'selected' : ''}>Kambala</option>
              <option value="Nataka" ${filterCategory === 'Nataka' ? 'selected' : ''}>Nataka</option>
              <option value="Dance" ${filterCategory === 'Dance' ? 'selected' : ''}>Dance</option>
              <option value="Temple Annual Fair" ${filterCategory === 'Temple Annual Fair' ? 'selected' : ''}>Temple Annual Fair</option>
              <option value="Other Events" ${filterCategory === 'Other Events' ? 'selected' : ''}>Other Events</option>
            </select>
            <select class="input-field" id="map-filter-date" style="width:auto; min-width:140px">
              <option value="" ${!filterDate ? 'selected' : ''}>All Dates</option>
              <option value="today" ${filterDate === 'today' ? 'selected' : ''}>Today</option>
              <option value="week" ${filterDate === 'week' ? 'selected' : ''}>This Week</option>
              <option value="month" ${filterDate === 'month' ? 'selected' : ''}>This Month</option>
            </select>
          </div>
        </div>

        <div id="main-map" class="map-container" style="height:calc(100vh - 280px); min-height:400px; border-radius:var(--radius-md); overflow:hidden">
          <div style="display:flex; align-items:center; justify-content:center; height:100%; color:var(--text-muted)">Loading map...</div>
        </div>
      </div>
    `;

    // Hook listeners
    const searchInp = document.getElementById('map-search');
    searchInp.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      updateMarkers();
    });

    const catSel = document.getElementById('map-filter-category');
    catSel.addEventListener('change', (e) => {
      filterCategory = e.target.value;
      updateMarkers();
    });

    const dateSel = document.getElementById('map-filter-date');
    dateSel.addEventListener('change', (e) => {
      filterDate = e.target.value;
      updateMarkers();
    });
  }

  async function initMap() {
    try {
      const leaflet = await import('leaflet');
      L = leaflet.default || leaflet;
      
      const mapEl = document.getElementById('main-map');
      if (!mapEl) return;
      mapEl.innerHTML = '';

      mapInstance = L.map(mapEl).setView([13.2, 74.9], 9);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapInstance);

      markersLayer = L.layerGroup().addTo(mapInstance);

      standardIcon = L.divIcon({
        html: '<div style="background:linear-gradient(135deg,#E8751A,#F4A623);width:32px;height:32px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(232,117,26,0.4)"><img src="/logo.png" style="width:16px;height:16px;transform:rotate(45deg);object-fit:contain" /></div>',
        iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32], className: '',
      });

      updateMarkers();
      
      setTimeout(() => mapInstance.invalidateSize(), 200);
    } catch (err) {
      console.warn('Map initialization failed:', err);
    }
  }

  function updateMarkers() {
    if (!mapInstance || !markersLayer || !L) return;

    // Clear old markers
    markersLayer.clearLayers();

    const filtered = getFilteredEvents();
    
    // Update subtitle
    const subtitle = document.getElementById('map-subtitle');
    if (subtitle) {
      subtitle.textContent = `${filtered.length} upcoming events match your filters`;
    }

    // Group filtered events by coordinate key
    const groups = {};
    filtered.forEach(event => {
      const key = `${parseFloat(event.latitude).toFixed(6)},${parseFloat(event.longitude).toFixed(6)}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(event);
    });

    Object.keys(groups).forEach(key => {
      const groupEvents = groups[key];
      const firstEvent = groupEvents[0];
      const lat = parseFloat(firstEvent.latitude);
      const lng = parseFloat(firstEvent.longitude);

      if (groupEvents.length === 1) {
        const event = firstEvent;
        L.marker([lat, lng], { icon: standardIcon })
          .addTo(markersLayer)
          .bindPopup(`
            <div style="min-width:180px;font-family:Outfit,sans-serif;color:#333">
              <strong style="font-size:1rem;color:#111">${event.prasanga}</strong>
              ${event.troupe ? `<br><span style="color:#666">🎪 ${event.troupe}</span>` : ''}
              <br><span style="color:#666">📅 ${formatShortDate(event.date)} · ${formatTime(event.time)}</span>
              <br><span style="color:#666">📍 ${event.location}</span>
              <br><span style="color:#666">👁️ ${event.views || 0} views</span>
              <br><a href="#/event/${event.id}" style="color:#E8751A;font-weight:600;display:inline-block;margin-top:4px">View Details →</a>
            </div>
          `);
      } else {
        const count = groupEvents.length;
        const multiIcon = L.divIcon({
          html: `
            <div style="position:relative;background:linear-gradient(135deg,#E8751A,#F4A623);width:32px;height:32px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;box-shadow:0 2px 10px rgba(232,117,26,0.6)">
              <img src="/logo.png" style="width:16px;height:16px;transform:rotate(45deg);object-fit:contain" />
              <div style="position:absolute;top:-8px;right:-8px;background:#EF4444;color:white;font-size:10px;font-weight:800;border-radius:10px;padding:1px 5px;border:1.5px solid white;transform:rotate(45deg);transform-origin:center;box-shadow:0 1px 4px rgba(0,0,0,0.3);line-height:1.2;min-width:16px;text-align:center">
                ${count}
              </div>
            </div>
          `,
          iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32], className: '',
        });

        const popupContent = `
          <div style="min-width:220px;max-height:280px;overflow-y:auto;font-family:Outfit,sans-serif;color:#333;padding-right:4px">
            <div style="font-weight:700;margin-bottom:10px;border-bottom:2px solid #E8751A;padding-bottom:6px;color:#E8751A;font-size:1rem;display:flex;align-items:center;gap:6px">
              <span>📍</span> <span>${count} Events here:</span>
            </div>
            ${groupEvents.map((event, i) => `
              <div style="margin-bottom:12px;border-bottom:${i < count - 1 ? '1px dashed #eee' : 'none'};padding-bottom:10px">
                <strong style="font-size:0.95rem;color:#111;display:block;line-height:1.3">${event.prasanga}</strong>
                ${event.troupe ? `<span style="color:#666;font-size:0.85rem;display:block;margin-top:2px">🎪 ${event.troupe}</span>` : ''}
                <span style="color:#666;font-size:0.85rem;display:block;margin-top:2px">📅 ${formatShortDate(event.date)} · ${formatTime(event.time)}</span>
                <a href="#/event/${event.id}" style="color:#E8751A;font-weight:600;display:inline-block;margin-top:4px;font-size:0.85rem;text-decoration:none">View Details →</a>
              </div>
            `).join('')}
          </div>
        `;

        L.marker([lat, lng], { icon: multiIcon })
          .addTo(markersLayer)
          .bindPopup(popupContent);
      }
    });

    if (filtered.length > 0) {
      const bounds = L.latLngBounds(filtered.map(e => [e.latitude, e.longitude]));
      mapInstance.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
    }
  }

  loadEvents();
}
