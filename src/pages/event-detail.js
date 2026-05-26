import { getEventById, deleteEvent, incrementEventViews, toggleWhatsAppReminder } from '../data.js';
import { formatDate, formatDateRange, formatTime } from '../utils/date.js';
import { isLoggedIn, getCurrentUser, toggleReminder, isMasterAdmin } from '../auth.js';
import { toastSuccess, toastError } from '../toast.js';
import { navigate } from '../router.js';
import { render404 } from './404.js';
import { updateSEO } from '../utils/seo.js';


export async function renderEventDetail(container, params) {
  // Loading state
  container.innerHTML = `
    <div class="page-wrapper" style="display:flex;align-items:center;justify-content:center;min-height:50vh">
      <div style="text-align:center"><img src="/logo.png" style="width:64px;height:64px;margin-bottom:12px;object-fit:contain;animation:pulse 2s infinite" /><p style="color:var(--text-secondary)">Loading event...</p></div>
    </div>
  `;

  const event = await getEventById(params.id);
  
  if (event) {
    incrementEventViews(params.id).catch(console.error);
    const seoTitle = `${event.prasanga} at ${event.location}`;
    const seoDesc = `${event.category || 'Event'} - ${event.prasanga}${event.troupe ? ` by ${event.troupe}` : ''} on ${formatDate(event.date)} at ${event.location}. ${event.description || ''}`;
    updateSEO(seoTitle, seoDesc);
  }

  if (!event) {
    render404(container, true);
    return;
  }

  const hasCoords = event.latitude && event.longitude;
  const mapLink = event.googleMapsLink || (hasCoords ? `https://www.google.com/maps?q=${event.latitude},${event.longitude}` : '');
  const submittedDate = event.submittedAt ? new Date(event.submittedAt).toLocaleDateString() : '';

  container.innerHTML = `
    <div class="page-wrapper animate-fade-in-up">
      <button class="btn btn-ghost" id="back-btn" style="margin-bottom:20px">← Back to Events</button>

        <div style="background:linear-gradient(135deg, var(--bg-elevated), var(--bg-card));padding:48px 32px;text-align:center;position:relative">
          ${event.posterUrls && event.posterUrls.length > 0
            ? event.posterUrls.length === 1 
              ? `<img src="${event.posterUrls[0]}" class="clickable-poster" data-idx="0" alt="${event.prasanga}" style="max-height:300px;border-radius:var(--radius-md);margin:0 auto 16px;cursor:zoom-in;display:block" />`
              : `
                <div class="carousel-container" style="position:relative; max-width:320px; margin:0 auto 16px;">
                  <div class="carousel-track" id="carousel-track" style="display:flex; overflow:hidden; border-radius:var(--radius-md); scroll-behavior:smooth">
                    ${event.posterUrls.map((url, idx) => `
                      <img src="${url}" class="clickable-poster" data-idx="${idx}" alt="Poster ${idx+1}" style="width:100%; flex-shrink:0; max-height:300px; object-fit:contain; cursor:zoom-in" />
                    `).join('')}
                  </div>
                  <button type="button" class="carousel-btn prev-btn" id="carousel-prev" style="position:absolute; top:50%; left:-24px; transform:translateY(-50%); background:rgba(15,15,25,0.7); border:1px solid var(--border-light); color:white; border-radius:50%; width:36px; height:36px; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:1.4rem; z-index:5; font-family:Outfit,sans-serif">‹</button>
                  <button type="button" class="carousel-btn next-btn" id="carousel-next" style="position:absolute; top:50%; right:-24px; transform:translateY(-50%); background:rgba(15,15,25,0.7); border:1px solid var(--border-light); color:white; border-radius:50%; width:36px; height:36px; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:1.4rem; z-index:5; font-family:Outfit,sans-serif">›</button>
                  <div style="text-align:center; margin-top:8px; font-size:0.75rem; color:var(--text-muted)"><span id="carousel-indicator">1</span> of ${event.posterUrls.length} posters</div>
                </div>
              `
            : `<img src="/logo.png" alt="Placeholder" style="display:block;margin:0 auto 16px auto;width:120px;height:120px;object-fit:contain;opacity:0.3" />`}
          <h1 style="font-size:2rem;font-weight:800;margin-top:16px;background:linear-gradient(135deg,var(--text-primary),var(--accent-light));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">${event.prasanga}</h1>
          <div style="margin-bottom:8px">
            <a href="#/category/${encodeURIComponent(event.category || 'Yakshagana')}" class="badge" style="background:var(--accent);color:#fff;text-decoration:none;border:none">${event.category || 'Yakshagana'}</a>
          </div>
          ${event.troupe ? `<p style="color:var(--text-secondary);font-size:1.1rem;margin-top:8px">🎪 ${event.troupe}</p>` : ''}
          <div style="margin-top:16px; font-size:0.85rem; color:var(--text-muted); display:flex; align-items:center; justify-content:center; gap:6px">
            <span>👁️</span> <span>${event.views || 0} views</span>
          </div>
        </div>

        <div style="padding:32px;display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:20px">
          <div class="card" style="padding:20px">
            <div style="color:var(--text-muted);font-size:0.8rem;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px">📅 Date & Time</div>
            <div style="font-size:1.1rem;font-weight:600">
              ${event.endDate && event.endDate !== event.date 
                ? formatDateRange(event.date, event.endDate) 
                : formatDate(event.date)}
            </div>
            <div style="color:var(--accent-light);font-size:1rem;margin-top:4px">${formatTime(event.time)}</div>
          </div>
          <div class="card" style="padding:20px">
            <div style="color:var(--text-muted);font-size:0.8rem;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px">📍 Location</div>
            <div style="font-size:1.1rem;font-weight:600">${event.location}</div>
            ${mapLink ? `<a href="${mapLink}" target="_blank" rel="noopener" class="btn btn-sm btn-secondary" style="margin-top:12px">🗺️ Open in Maps</a>` : ''}
          </div>
        </div>

        <div style="padding:0 32px 24px; display:flex; gap:12px; flex-wrap:wrap">
          <a href="${generateCalendarUrl(event)}" target="_blank" rel="noopener" class="btn btn-secondary">
            📅 Calendar
          </a>
          ${isLoggedIn() ? `
            <button id="remind-btn" class="btn ${isReminded(event.id) ? 'btn-danger' : 'btn-primary'}">
              ${isReminded(event.id) ? '🔕 Remove' : '🔔 Remind'}
            </button>
            <button id="whatsapp-remind-btn" class="btn" style="background:#25D366; color:white; border:none; display:flex; align-items:center; gap:6px">
              💬 WhatsApp Alert
            </button>
          ` : `
            <a href="#/login" class="btn btn-ghost" style="font-size:0.9rem">Login to set reminders</a>
          `}
          
          <div style="flex:1"></div>

          <button id="share-btn" class="btn btn-primary" style="display:flex; align-items:center; gap:6px">
            🔗 Share
          </button>
          <button id="copy-details-btn" class="btn btn-secondary" style="display:flex; align-items:center; gap:6px">
            📋 Copy Info
          </button>
        </div>


        ${event.description ? `
          <div style="padding:0 32px 32px">
            <div class="card" style="padding:20px">
              <div style="color:var(--text-muted);font-size:0.8rem;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px">📝 Description</div>
              <p style="color:var(--text-secondary);line-height:1.7;white-space:pre-wrap">${event.description}</p>
            </div>
          </div>
        ` : ''}

        ${(event.organizerPhone || event.organizerEmail) ? `
          <div style="padding:0 32px 32px">
            <div class="card" style="padding:20px">
              <div style="color:var(--text-muted);font-size:0.8rem;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px">📞 Organizer Contact</div>
              <div style="display:flex; gap:20px; flex-wrap:wrap; margin-top:8px">
                ${event.organizerPhone ? `
                  <a href="tel:${event.organizerPhone}" style="text-decoration:none; color:var(--text-primary); display:flex; align-items:center; gap:8px; background:rgba(255,255,255,0.05); padding:8px 16px; border-radius:var(--radius-md); border:1px solid var(--border-light)">
                    <span style="font-size:1.1rem">📱</span> ${event.organizerPhone}
                  </a>
                ` : ''}
                ${event.organizerEmail ? `
                  <a href="mailto:${event.organizerEmail}" style="text-decoration:none; color:var(--text-primary); display:flex; align-items:center; gap:8px; background:rgba(255,255,255,0.05); padding:8px 16px; border-radius:var(--radius-md); border:1px solid var(--border-light)">
                    <span style="font-size:1.1rem">📧</span> ${event.organizerEmail}
                  </a>
                ` : ''}
              </div>
            </div>
          </div>
        ` : ''}

        ${hasCoords ? `<div style="padding:0 32px 32px"><div id="detail-map" class="map-container" style="height:300px"></div></div>` : ''}
        
        <div style="padding:0 32px 32px">
          <p style="color:var(--text-muted);font-size:0.8rem">Submitted by ${event.submittedByName || 'Unknown'} on ${submittedDate}</p>
        </div>

        </div>
      </div>
    </div>
  `;

  document.getElementById('back-btn').addEventListener('click', () => window.history.back());
  
  const remindBtn = document.getElementById('remind-btn');
  if (remindBtn) {
    remindBtn.addEventListener('click', async () => {
      try {
        await toggleReminder(event.id);
        renderEventDetail(container, params); // Re-render to update button state
        toastSuccess(isReminded(event.id) ? 'Reminder set!' : 'Reminder removed');
      } catch (err) {
        toastError('Failed to update reminder: ' + err.message);
      }
    });
  }

  const waRemindBtn = document.getElementById('whatsapp-remind-btn');
  if (waRemindBtn) {
    waRemindBtn.addEventListener('click', async () => {
      const phone = prompt('Enter your WhatsApp phone number (e.g. +91 9876543210):') || '';
      if (!phone) return;
      try {
        const res = await toggleWhatsAppReminder(event.id, phone);
        toastSuccess(res.message || 'WhatsApp reminder scheduled!');
      } catch (err) {
        toastError('Failed to schedule reminder: ' + err.message);
      }
    });
  }

  const shareBtn = document.getElementById('share-btn');
  if (shareBtn) {
    shareBtn.addEventListener('click', async () => {
      const text = generateShareText(event);
      if (navigator.share) {
        try {
          await navigator.share({
            title: `Aisira: ${event.prasanga}`,
            text: text,
            url: `${window.location.origin}/#/event/${event.id}`
          });
        } catch (err) {
          console.log('Share action cancelled or failed:', err);
        }
      } else {
        try {
          await navigator.clipboard.writeText(text);
          toastSuccess('Event details copied to clipboard!');
        } catch (err) {
          toastError('Failed to copy event details');
        }
      }
    });
  }

  const copyDetailsBtn = document.getElementById('copy-details-btn');
  if (copyDetailsBtn) {
    copyDetailsBtn.addEventListener('click', async () => {
      const text = generateShareText(event);
      try {
        await navigator.clipboard.writeText(text);
        toastSuccess('Event details copied to clipboard!');
      } catch (err) {
        toastError('Failed to copy event details');
      }
    });
  }

  // Carousel Navigation
  const track = document.getElementById('carousel-track');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');
  const indicator = document.getElementById('carousel-indicator');
  
  if (track && prevBtn && nextBtn) {
    let currentIdx = 0;
    const updateCarousel = (idx) => {
      currentIdx = idx;
      const width = track.clientWidth;
      track.scrollTo({ left: currentIdx * width, behavior: 'smooth' });
      if (indicator) indicator.textContent = currentIdx + 1;
    };
    prevBtn.addEventListener('click', () => {
      const idx = (currentIdx - 1 + event.posterUrls.length) % event.posterUrls.length;
      updateCarousel(idx);
    });
    nextBtn.addEventListener('click', () => {
      const idx = (currentIdx + 1) % event.posterUrls.length;
      updateCarousel(idx);
    });
  }

  // Lightbox Implementation
  let zoomLevel = 1;
  container.querySelectorAll('.clickable-poster').forEach(img => {
    img.addEventListener('click', () => {
      const initialIdx = parseInt(img.dataset.idx, 10);
      let activeIdx = initialIdx;
      zoomLevel = 1;

      const lightboxOverlay = document.createElement('div');
      lightboxOverlay.id = 'lightbox-overlay';
      lightboxOverlay.style = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(10,10,15,0.95);backdrop-filter:blur(15px);z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center';
      
      lightboxOverlay.innerHTML = `
        <div style="position:absolute;top:20px;right:20px;display:flex;gap:12px;z-index:100">
          <button id="lb-zoom-in" style="background:rgba(255,255,255,0.08);border:1px solid var(--border-light);color:white;border-radius:var(--radius-sm);padding:8px 16px;cursor:pointer">➕ Zoom In</button>
          <button id="lb-zoom-out" style="background:rgba(255,255,255,0.08);border:1px solid var(--border-light);color:white;border-radius:var(--radius-sm);padding:8px 16px;cursor:pointer">➖ Zoom Out</button>
          <button id="lb-close" style="background:#EF4444;border:none;color:white;border-radius:50%;width:36px;height:36px;font-size:1.1rem;cursor:pointer;display:flex;align-items:center;justify-content:center">✕</button>
        </div>
        <div id="lb-image-container" style="max-width:90%;max-height:80%;overflow:auto;display:flex;align-items:center;justify-content:center;transition:transform 0.2s">
          <img id="lb-img" src="${event.posterUrls[activeIdx]}" style="max-width:100%;max-height:100%;object-fit:contain;border-radius:var(--radius-sm);transform:scale(1);transform-origin:center;transition:transform 0.2s" />
        </div>
        ${event.posterUrls.length > 1 ? `
          <div style="margin-top:24px;display:flex;gap:20px;align-items:center;color:white;z-index:100">
            <button id="lb-prev" style="background:rgba(255,255,255,0.08);border:1px solid var(--border-light);color:white;border-radius:50%;width:40px;height:40px;cursor:pointer;font-size:1.3rem">‹</button>
            <span style="font-size:0.9rem"><span id="lb-indicator">${activeIdx+1}</span> of ${event.posterUrls.length}</span>
            <button id="lb-next" style="background:rgba(255,255,255,0.08);border:1px solid var(--border-light);color:white;border-radius:50%;width:40px;height:40px;cursor:pointer;font-size:1.3rem">›</button>
          </div>
        ` : ''}
      `;

      document.body.appendChild(lightboxOverlay);

      const lbImg = document.getElementById('lb-img');
      const closeLb = () => lightboxOverlay.remove();
      document.getElementById('lb-close').addEventListener('click', closeLb);
      lightboxOverlay.addEventListener('click', (e) => {
        if (e.target.id === 'lightbox-overlay' || e.target.id === 'lb-image-container') closeLb();
      });

      const zoom = (factor) => {
        zoomLevel = Math.max(0.5, Math.min(3, zoomLevel + factor));
        lbImg.style.transform = `scale(${zoomLevel})`;
      };
      document.getElementById('lb-zoom-in').addEventListener('click', () => zoom(0.25));
      document.getElementById('lb-zoom-out').addEventListener('click', () => zoom(-0.25));

      if (event.posterUrls.length > 1) {
        const lbIndicator = document.getElementById('lb-indicator');
        const updateLbImage = (idx) => {
          activeIdx = idx;
          lbImg.src = event.posterUrls[activeIdx];
          zoomLevel = 1;
          lbImg.style.transform = 'scale(1)';
          if (lbIndicator) lbIndicator.textContent = activeIdx + 1;
        };
        document.getElementById('lb-prev').addEventListener('click', () => {
          updateLbImage((activeIdx - 1 + event.posterUrls.length) % event.posterUrls.length);
        });
        document.getElementById('lb-next').addEventListener('click', () => {
          updateLbImage((activeIdx + 1) % event.posterUrls.length);
        });
      }
    });
  });

  if (hasCoords) {
    setTimeout(() => {
      import('leaflet').then(leaflet => {
        const L = leaflet.default || leaflet;
        const mapEl = document.getElementById('detail-map');
        if (!mapEl) return;
        const map = L.map(mapEl).setView([event.latitude, event.longitude], 14);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map);
        const customIcon = L.divIcon({
          html: '<div style="background:linear-gradient(135deg,#E8751A,#F4A623);width:32px;height:32px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(232,117,26,0.4)"><img src="/logo.png" style="width:16px;height:16px;transform:rotate(45deg);object-fit:contain" /></div>',
          iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32], className: '',
        });
        L.marker([event.latitude, event.longitude], { icon: customIcon }).addTo(map).bindPopup(`<strong>${event.prasanga}</strong><br>${event.location}`).openPopup();
        setTimeout(() => map.invalidateSize(), 200);
      }).catch(() => {});
    }, 100);
  }
}

function isReminded(eventId) {
  const user = getCurrentUser();
  return user && user.reminders && user.reminders.includes(eventId);
}

function generateCalendarUrl(event) {
  const title = encodeURIComponent(`Aisira: ${event.prasanga}`);
  const details = encodeURIComponent(`${event.troupe || ''}\n\n${event.description || ''}\n\nView event: ${window.location.origin}/#/event/${event.id}`);
  const location = encodeURIComponent(event.location);
  
  // Create a proper JS Date object in IST timezone (+05:30)
  const eventDate = new Date(`${event.date}T${event.time}:00+05:30`);
  
  // Google Calendar expects UTC times (Format: YYYYMMDDTHHmmSSZ)
  const formatUTC = (date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };
  
  const start = formatUTC(eventDate);
  
  // End time: use endDate if exists, otherwise add 4 hours to start time
  let endDateTime;
  if (event.endDate && event.endDate !== event.date) {
    endDateTime = new Date(`${event.endDate}T${event.time}:00+05:30`);
    // Add 4 hours to end time on the end date as standard event duration
    endDateTime.setTime(endDateTime.getTime() + 4 * 60 * 60 * 1000);
  } else {
    endDateTime = new Date(eventDate.getTime() + 4 * 60 * 60 * 1000);
  }
  const end = formatUTC(endDateTime);

  return `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${start}/${end}`;
}

function generateShareText(event) {
  return `🎭 *${event.prasanga}*
${event.troupe ? `🎪 _${event.troupe}_` : ''}

📅 *Date:* ${formatDate(event.date)}
🕒 *Time:* ${formatTime(event.time)}
📍 *Location:* ${event.location}

🔗 *View Details:* ${window.location.origin}/#/event/${event.id}

_Shared via Aisira_`;
}

