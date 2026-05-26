import { getApprovedEvents } from '../data.js';
import { isUpcoming } from '../utils/date.js';
import { navigate } from '../router.js';
import { updateSEO } from '../utils/seo.js';

export async function render404(container, isEvent = false) {
  updateSEO(isEvent ? 'Event Not Found' : 'Page Not Found', 'This page or event could not be found on Aisira.');
  const title = isEvent ? 'Event Not Found' : 'Page Not Found';
  const message = isEvent 
    ? 'This event might have been completed, removed, or the link is incorrect.' 
    : "The page you're looking for doesn't exist or has been moved.";

  container.innerHTML = `
    <div class="page-wrapper animate-fade-in-up">
      <div style="text-align:center; padding:60px 20px">
        <div style="font-size:5rem; margin-bottom:20px">🎭</div>
        <h1 style="font-size:2.5rem; margin-bottom:12px; background:linear-gradient(135deg, var(--text-primary), var(--accent-light)); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text">${title}</h1>
        <p style="color:var(--text-secondary); font-size:1.1rem; max-width:500px; margin:0 auto 32px">${message}</p>
        
        <div style="display:flex; gap:12px; justify-content:center; margin-bottom:48px">
          <a href="#/" class="btn btn-primary">🏠 Back to Home</a>
          <a href="#/map" class="btn btn-secondary">🗺️ Explore Map</a>
        </div>

        <div id="suggested-events-container">
           <div class="spinner" style="margin:0 auto"></div>
           <p style="color:var(--text-muted); margin-top:12px">Finding other events for you...</p>
        </div>
      </div>
    </div>
  `;

  // Load suggested events
  try {
    const all = await getApprovedEvents();
    const upcoming = all.filter(e => isUpcoming(e.endDate || e.date)).slice(0, 3);
    
    const suggestionContainer = document.getElementById('suggested-events-container');
    if (!suggestionContainer) return;

    if (upcoming.length === 0) {
      suggestionContainer.innerHTML = '';
      return;
    }

    suggestionContainer.innerHTML = `
      <h3 style="font-size:1.2rem; margin-bottom:24px; color:var(--text-primary)">Popular Upcoming Events</h3>
      <div class="event-grid">
        ${upcoming.map((event, i) => `
          <div class="event-card" data-event-id="${event.id}">
            ${event.posterUrls && event.posterUrls.length > 0
              ? `<img class="poster" src="${event.posterUrls[0]}" alt="${event.prasanga}" style="height:140px" />`
              : `<div class="poster-placeholder" style="height:140px; font-size:2rem">🎭</div>`}
            <div class="card-body" style="padding:12px">
              <h4 style="font-size:1rem; margin-bottom:4px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis">${event.prasanga}</h4>
              <p style="font-size:0.8rem; color:var(--text-muted)">📅 ${new Date(event.date).toLocaleDateString()}</p>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    suggestionContainer.querySelectorAll('.event-card').forEach(card => {
      card.addEventListener('click', () => navigate(`/event/${card.dataset.eventId}`));
    });

  } catch (err) {
    console.error('Failed to load suggestions:', err);
    document.getElementById('suggested-events-container').innerHTML = '';
  }
}
