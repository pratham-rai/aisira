import { getDeletedEvents } from '../data.js';
import { formatShortDate, formatDateRange } from '../utils/date.js';
import { exportToExcel } from '../utils/export.js';
import { toastSuccess, toastError } from '../toast.js';

export function renderDeletedEvents(container) {
  let events = [];
  let loading = true;

  async function loadEvents() {
    loading = true;
    renderUI();
    try {
      events = await getDeletedEvents();
    } catch (err) {
      console.error('Failed to load deleted events:', err);
      events = [];
    }
    loading = false;
    renderUI();
  }

  function renderUI() {
    container.innerHTML = `
      <div class="page-wrapper animate-fade-in-up">
        <div class="page-header" style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:16px;">
          <div>
            <h1>🗑️ Deleted Events Archive</h1>
            <p>A record of events deleted by Master Admin</p>
          </div>
          <button class="btn btn-secondary" id="export-deleted-btn" style="display:flex; align-items:center; gap:8px;">
            📥 Export Archive to Excel
          </button>
          <div style="margin-top:12px; padding:8px 12px; background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.2); border-radius:var(--radius-sm); display:inline-block;">
            <p style="color:var(--red-light); font-size:0.85rem; margin:0; font-weight:500;">
              ⚠️ Notice: Events in this archive are permanently deleted 7 days after the deletion date.
            </p>
          </div>
        </div>


        <div class="stat-grid" style="max-width:300px">
          <div class="stat-card">
            <div class="stat-value" style="color:var(--red-light)">${events.length}</div>
            <div class="stat-label">Total Deleted</div>
          </div>
        </div>

        ${loading ? `
          <div style="display:flex;flex-direction:column;gap:12px;margin-top:24px;">
            ${[1, 2, 3].map(() => `<div class="skeleton" style="height:80px;border-radius:var(--radius-md)"></div>`).join('')}
          </div>
        ` : events.length === 0 ? `
          <div class="empty-state" style="margin-top:24px;">
            <div class="empty-icon">🗑️</div>
            <h3>No deleted events found</h3>
            <p style="color:var(--text-muted)">Deleted events will appear here.</p>
          </div>
        ` : `
          <div style="display:flex;flex-direction:column;gap:20px;margin-top:24px;">
            ${events.map((event, i) => {
              const subDate = event.submittedAt ? new Date(event.submittedAt).toLocaleDateString() : 'Unknown';
              const delDate = event.updatedAt ? new Date(event.updatedAt).toLocaleDateString() : 'Unknown';
              
              return `
              <div class="admin-event-row animate-fade-in-up" style="animation-delay:${i * 60}ms; flex-direction:column; align-items:stretch; gap:16px; padding:20px; border-left:4px solid var(--red-light);">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:16px;">
                  <div class="event-info" style="flex:1">
                    <h3 style="font-size:1.25rem; margin-bottom:4px; color:var(--text-main); opacity:0.8;">${event.prasanga}</h3>
                    <p style="font-size:1rem; color:var(--text-secondary); margin-bottom:8px;">
                      ${event.troupe || 'No troupe'} · ${event.endDate && event.endDate !== event.date ? formatDateRange(event.date, event.endDate) : formatShortDate(event.date)} · ${event.time} · ${event.location}
                    </p>
                    <div style="display:flex; gap:6px; flex-wrap:wrap; margin-bottom:12px;">
                      <span class="badge badge-rejected" style="background:rgba(239, 68, 68, 0.1); color:var(--red-light); border:1px solid rgba(239, 68, 68, 0.2)">DELETED</span>
                      <span class="badge" style="background:var(--bg-card); border:1px solid var(--border-light); color:var(--text-muted);">${event.category || 'Yakshagana'}</span>
                    </div>
                  </div>
                  <div style="text-align:right; min-width:120px;">
                    <span style="font-size:0.75rem; color:var(--text-muted); display:block; margin-bottom:4px;">Deleted on</span>
                    <span style="font-weight:600; font-size:0.9rem; color:var(--red-light);">${delDate}</span>
                  </div>
                </div>

                <div style="display:grid; grid-template-columns: 1fr; gap:16px; border-top:1px solid var(--border-light); padding-top:16px; opacity:0.7;">
                  <div style="display:flex; flex-wrap:wrap; gap:24px;">
                    <div>
                      <strong style="font-size:0.75rem; color:var(--text-muted); display:block; margin-bottom:4px; text-transform:uppercase; letter-spacing:0.05em;">Submitted By</strong>
                      <span style="font-size:0.9rem;">${event.submittedByName || 'Unknown'}</span>
                      <span style="font-size:0.75rem; color:var(--text-muted); display:block;">on ${subDate}</span>
                    </div>
                    ${event.actionedByName ? `
                      <div>
                        <strong style="font-size:0.75rem; color:var(--text-muted); display:block; margin-bottom:4px; text-transform:uppercase; letter-spacing:0.05em;">Actioned By</strong>
                        <span style="font-size:0.9rem; font-weight:500;">${event.actionedByName}</span>
                      </div>
                    ` : ''}
                  </div>

                  ${event.deletionReason ? `
                    <div style="font-size:0.85rem; line-height:1.5; color:var(--red-light); font-style:italic; margin-top:8px; background:rgba(239, 68, 68, 0.05); padding:10px; border-radius:var(--radius-sm);">
                      <strong>Reason for deletion:</strong> "${event.deletionReason}"
                    </div>
                  ` : ''}

                  ${event.description ? `
                    <div style="font-size:0.85rem; line-height:1.5; color:var(--text-secondary); margin-top:8px">
                      ${event.description}
                    </div>
                  ` : ''}

                </div>
              </div>`;
            }).join('')}
          </div>
        `}
      </div>
    `;

    // Export deleted events
    const exportDeletedBtn = document.getElementById('export-deleted-btn');
    if (exportDeletedBtn) {
      exportDeletedBtn.addEventListener('click', async () => {
        try {
          exportDeletedBtn.disabled = true;
          exportDeletedBtn.innerHTML = '<span class="spinner" style="width:14px;height:14px;margin-right:6px"></span> Exporting...';
          const exportData = events.map(e => ({
            ID: e.id,
            Title: e.prasanga,
            Troupe: e.troupe,
            Category: e.category,
            StartDate: e.date,
            EndDate: e.endDate,
            Time: e.time,
            Location: e.location,
            MapsLink: e.googleMapsLink,
            Latitude: e.latitude,
            Longitude: e.longitude,
            OrganizerPhone: e.organizerPhone,
            OrganizerEmail: e.organizerEmail,
            Views: e.views,
            DeletionReason: e.deletionReason,
            SubmittedBy: e.submittedByName,
            DeletedBy: e.actionedByName
          }));
          await exportToExcel(exportData, 'Aisira_Deleted_Events_Archive');
          toastSuccess('Deleted events archive exported!');
        } catch (e) {
          toastError('Export failed: ' + e.message);
        } finally {
          exportDeletedBtn.disabled = false;
          exportDeletedBtn.innerHTML = '📥 Export Archive to Excel';
        }
      });
    }
  }

  loadEvents();
}
