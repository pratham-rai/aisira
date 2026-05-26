import { getMySubmissions } from '../data.js';
import { formatShortDate, formatDateRange } from '../utils/date.js';
import { statusBadgeClass } from '../utils/constants.js';

export function renderMySubmissions(container) {
  let submissions = [];
  let loading = true;

  async function loadSubmissions() {
    loading = true;
    renderUI();
    try {
      submissions = await getMySubmissions();
    } catch (err) {
      console.error('Failed to load submissions:', err);
      submissions = [];
    }
    loading = false;
    renderUI();
  }

  function renderUI() {
    container.innerHTML = `
      <div class="page-wrapper animate-fade-in-up">
        <div class="page-header">
          <h1>📤 My Submissions</h1>
          <p>Track the status of events you've contributed</p>
        </div>

        <div class="stat-grid" style="max-width:300px">
          <div class="stat-card">
            <div class="stat-value">${submissions.length}</div>
            <div class="stat-label">Total Submitted</div>
          </div>
        </div>

        ${loading ? `
          <div style="display:flex;flex-direction:column;gap:12px;margin-top:24px;">
            ${[1, 2, 3].map(() => `<div class="skeleton" style="height:100px;border-radius:var(--radius-md)"></div>`).join('')}
          </div>
        ` : submissions.length === 0 ? `
          <div class="empty-state" style="margin-top:24px;">
            <div class="empty-icon">📤</div>
            <h3>No submissions yet</h3>
            <p style="color:var(--text-muted)">Events you submit for approval will appear here.</p>
            <br>
            <a href="#/add" class="btn btn-primary">Add an Event</a>
          </div>
        ` : `
          <div style="display:flex;flex-direction:column;gap:16px;margin-top:24px;">
            ${submissions.map((event, i) => {
              const subDate = event.submittedAt ? new Date(event.submittedAt).toLocaleDateString() : 'Unknown';
              
              return `
              <div class="card animate-fade-in-up" style="animation-delay:${i * 50}ms; padding:20px; position:relative; overflow:hidden;">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:16px;">
                  <div style="flex:1">
                    <div style="display:flex; align-items:center; gap:10px; margin-bottom:8px;">
                      <span class="${statusBadgeClass(event.status)}" style="text-transform:uppercase; font-size:0.7rem; font-weight:700; letter-spacing:0.05em;">${event.status}</span>
                      <span style="font-size:0.75rem; color:var(--text-muted);">Submitted on ${subDate}</span>
                    </div>
                    <h3 style="margin:0 0 4px 0; font-size:1.15rem; color:var(--text-main);">${event.prasanga}</h3>
                    <p style="margin:0; font-size:0.9rem; color:var(--text-secondary);">
                      ${event.location} · ${event.endDate && event.endDate !== event.date ? formatDateRange(event.date, event.endDate) : formatShortDate(event.date)}
                    </p>
                  </div>
                  <div style="display:flex; flex-direction:column; gap:8px;">
                    <a href="#/event/${event.id}" class="btn btn-sm btn-ghost" style="padding:4px 8px;">View →</a>
                    ${(event.status !== 'approved' && event.status !== 'deleted') ? `
                      <a href="#/event/edit/${event.id}" class="btn btn-sm btn-secondary" style="padding:4px 8px; font-size:0.75rem;">✏️ Edit</a>
                    ` : ''}

                  </div>
                </div>

                ${event.status === 'approved' ? `
                  <div style="margin-top:12px; font-size:0.85rem; color:var(--text-muted); display:flex; align-items:center; gap:6px; background:rgba(255,255,255,0.05); padding:8px; border-radius:4px;">
                    <span style="font-size:1rem;">ℹ️</span> This event is approved. To make changes, please contact the admin at <a href="mailto:yakshanidhi.app@gmail.com" style="color:var(--accent-light); text-decoration:none;">yakshanidhi.app@gmail.com</a>

                  </div>
                ` : event.status === 'rejected' ? `
                  <div style="margin-top:12px; padding:12px; background:rgba(239, 68, 68, 0.05); border:1px solid rgba(239, 68, 68, 0.1); border-radius:var(--radius-sm);">
                    <p style="margin:0; font-size:0.85rem; color:var(--red-light);">
                      <strong>Rejection Reason:</strong> ${event.rejectionReason || 'No reason provided'}
                    </p>
                  </div>
                  <div style="margin-top:12px; font-size:0.85rem; color:var(--text-muted);">
                    <span style="font-size:1rem;">💡</span> Click <strong>Edit</strong> above to fix issues and resubmit.
                  </div>
                ` : `
                  <div style="margin-top:12px; font-size:0.85rem; color:var(--text-muted); display:flex; align-items:center; gap:6px;">
                    <span style="font-size:1rem;">⏳</span> An administrator will review your submission shortly.
                  </div>
                `}
              </div>`;

            }).join('')}
          </div>
        `}
      </div>
    `;
  }

  loadSubmissions();
}
