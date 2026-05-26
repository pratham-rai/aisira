import { getEventsByStatus, approveEvent, rejectEvent, updateEvent, getEvents, revertToPending, resolveMapLink, getStats, deleteEvent } from '../data.js';
import { toastSuccess, toastError } from '../toast.js';
import { formatShortDate } from '../utils/date.js';
import { statusBadgeClass, EVENT_STATUS } from '../utils/constants.js';
import { isMasterAdmin } from '../auth.js';
import { exportToExcel } from '../utils/export.js';

export function renderAdminPanel(container) {
  let activeTab = EVENT_STATUS.PENDING;
  let editingEvent = null;
  let events = [];
  let allEvents = [];
  let stats = null;
  let loading = true;

  async function loadEvents() {
    loading = true;
    renderUI();
    try {
      allEvents = await getEvents();
      if (isMasterAdmin()) {
        stats = await getStats();
      }
      events = activeTab === 'all' ? allEvents : allEvents.filter(e => e.status === activeTab);
    } catch (err) {
      console.error('Failed to load events:', err);
      allEvents = [];
      events = [];
    }
    loading = false;
    renderUI();
  }

  function renderUI() {
    const pending = allEvents.filter(e => e.status === EVENT_STATUS.PENDING).length;
    const approved = allEvents.filter(e => e.status === EVENT_STATUS.APPROVED).length;
    const rejected = allEvents.filter(e => e.status === EVENT_STATUS.REJECTED).length;

    container.innerHTML = `
      <div class="page-wrapper animate-fade-in-up">
        <div class="page-header" style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:16px;">
          <div>
            <h1>⚙️ Admin Panel</h1>
            <p>Manage event submissions</p>
          </div>
          ${isMasterAdmin() ? `
            <button class="btn btn-secondary" id="export-events-btn" style="display:flex; align-items:center; gap:8px;">
              📥 Export Current Tab to Excel
            </button>
          ` : ''}
        </div>

        <div class="stat-grid" style="max-width:600px">
          <div class="stat-card"><div class="stat-value" style="color:#FBBF24">${pending}</div><div class="stat-label">Pending</div></div>
          <div class="stat-card"><div class="stat-value" style="color:var(--green-light)">${approved}</div><div class="stat-label">Approved</div></div>
          <div class="stat-card"><div class="stat-value" style="color:var(--red-light)">${rejected}</div><div class="stat-label">Rejected</div></div>
          <div class="stat-card"><div class="stat-value">${allEvents.length}</div><div class="stat-label">Total</div></div>
        </div>

        <div class="tabs">
          <button class="tab-btn ${activeTab === EVENT_STATUS.PENDING ? 'active' : ''}" data-tab="${EVENT_STATUS.PENDING}">Pending (${pending})</button>
          <button class="tab-btn ${activeTab === EVENT_STATUS.APPROVED ? 'active' : ''}" data-tab="${EVENT_STATUS.APPROVED}">Approved (${approved})</button>
          <button class="tab-btn ${activeTab === EVENT_STATUS.REJECTED ? 'active' : ''}" data-tab="${EVENT_STATUS.REJECTED}">Rejected (${rejected})</button>
          <button class="tab-btn ${activeTab === 'all' ? 'active' : ''}" data-tab="all">All (${allEvents.length})</button>
          ${isMasterAdmin() ? `<button class="tab-btn ${activeTab === 'leaderboard' ? 'active' : ''}" data-tab="leaderboard">🏆 Leaderboard</button>` : ''}
        </div>

        ${loading ? `
          <div style="display:flex;flex-direction:column;gap:12px">
            ${[1,2,3].map(() => `<div class="skeleton" style="height:80px;border-radius:var(--radius-md)"></div>`).join('')}
          </div>
        ` : activeTab === 'leaderboard' ? renderLeaderboard(stats) : events.length === 0 ? `
          <div class="empty-state"><div class="empty-icon">📋</div><h3>No ${activeTab} events</h3></div>
        ` : `
          <div style="display:flex;flex-direction:column;gap:12px">
            ${events.map((event, i) => {
              const subDate = event.submittedAt ? new Date(event.submittedAt).toLocaleDateString() : '';
              return `
              <div class="admin-event-row animate-fade-in-up" style="animation-delay:${i * 60}ms">
                <div class="event-info">
                  <h3>${event.prasanga}</h3>
                  <p>${event.troupe || 'No troupe'} · ${formatShortDate(event.date)} · ${event.location}</p>
                  <div style="margin-top:6px;display:flex;gap:6px;flex-wrap:wrap">
                    <span class="${statusBadgeClass(event.status)}">${event.status}</span>
                  </div>
                  <p style="font-size:0.75rem;color:var(--text-muted);margin-top:4px">by ${event.submittedByName || 'Unknown'} on ${subDate}</p>
                  ${event.rejectionReason ? `<p style="font-size:0.8rem;color:var(--red-light);margin-top:4px">Reason: ${event.rejectionReason}</p>` : ''}
                  ${isMasterAdmin() && event.actionedByName ? `
                    <p style="font-size:0.75rem;color:var(--green-light);margin-top:4px;font-weight:500;">
                      ${event.status === EVENT_STATUS.APPROVED ? 'Approved' : 'Rejected'} by: ${event.actionedByName}
                    </p>
                  ` : ''}
                </div>
                <div class="event-actions">
                  ${event.status === EVENT_STATUS.PENDING ? `
                    <button class="btn btn-sm btn-primary approve-btn" data-id="${event.id}">✅ Approve</button>
                    <button class="btn btn-sm btn-danger reject-btn" data-id="${event.id}">❌ Reject</button>
                  ` : ''}
                  ${event.status === EVENT_STATUS.APPROVED || event.status === EVENT_STATUS.REJECTED ? `
                    <button class="btn btn-sm btn-danger revert-btn" data-id="${event.id}">🔄 Revert to Pending</button>
                  ` : ''}
                  ${event.status !== 'deleted' ? `
                    <button class="btn btn-sm btn-secondary edit-btn" data-id="${event.id}">✏️ Edit</button>
                  ` : ''}
                  ${isMasterAdmin() && event.status !== 'deleted' ? `
                    <button class="btn btn-sm btn-danger delete-btn" data-id="${event.id}" style="background:var(--red-light);border:none">🗑️ Delete</button>
                  ` : ''}

                </div>
              </div>`;
            }).join('')}
          </div>
        `}
      </div>
      ${editingEvent ? renderEditModal(editingEvent) : ''}
    `;

    // Tab clicks
    container.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => { activeTab = btn.dataset.tab; loadEvents(); });
    });

    // Export events
    const exportEventsBtn = document.getElementById('export-events-btn');
    if (exportEventsBtn) {
      exportEventsBtn.addEventListener('click', async () => {
        try {
          exportEventsBtn.disabled = true;
          exportEventsBtn.innerHTML = '<span class="spinner" style="width:14px;height:14px;margin-right:6px"></span> Exporting...';
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
            Status: e.status,
            SubmittedBy: e.submittedByName,
            Views: e.views
          }));
          await exportToExcel(exportData, `Aisira_Events_${activeTab}`);
          toastSuccess('Events exported successfully!');
        } catch (e) {
          toastError('Export failed: ' + e.message);
        } finally {
          exportEventsBtn.disabled = false;
          exportEventsBtn.innerHTML = '📥 Export Current Tab to Excel';
        }
      });
    }

    // Export admin/submitter stats
    const exportAdminsBtn = document.getElementById('export-admins-btn');
    if (exportAdminsBtn) {
      exportAdminsBtn.addEventListener('click', async () => {
        try {
          exportAdminsBtn.disabled = true;
          exportAdminsBtn.innerHTML = 'Exporting...';
          const data = stats.actionStats.map(a => ({
            AdminName: a.name || 'Anonymous',
            ApprovedCount: a.approvedCount,
            RejectedCount: a.rejectedCount,
            TotalActions: a.approvedCount + a.rejectedCount
          }));
          await exportToExcel(data, 'Aisira_Admin_Stats', 'Admin Performance');
          toastSuccess('Admin stats exported!');
        } catch (e) {
          toastError('Export failed: ' + e.message);
        } finally {
          exportAdminsBtn.disabled = false;
          exportAdminsBtn.innerHTML = '📥 Export Admin Stats';
        }
      });
    }

    const exportSubmittersBtn = document.getElementById('export-submitters-btn');
    if (exportSubmittersBtn) {
      exportSubmittersBtn.addEventListener('click', async () => {
        try {
          exportSubmittersBtn.disabled = true;
          exportSubmittersBtn.innerHTML = 'Exporting...';
          const data = stats.submissionStats.map(s => ({
            ContributorName: s.name || 'Anonymous',
            SubmissionCount: s.submissionCount
          }));
          await exportToExcel(data, 'Aisira_Contributor_Stats', 'Submissions');
          toastSuccess('Contributor stats exported!');
        } catch (e) {
          toastError('Export failed: ' + e.message);
        } finally {
          exportSubmittersBtn.disabled = false;
          exportSubmittersBtn.innerHTML = '📥 Export Contributor Stats';
        }
      });
    }

    if (activeTab === 'leaderboard' && stats) {
      setTimeout(() => initCharts(stats), 50);
    }

    // Approve
    container.querySelectorAll('.approve-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        try { await approveEvent(btn.dataset.id); toastSuccess('Event approved!'); loadEvents(); }
        catch (e) { toastError('Failed: ' + e.message); }
      });
    });

    // Reject
    container.querySelectorAll('.reject-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const reason = prompt('Rejection reason (optional):') || '';
        try { await rejectEvent(btn.dataset.id, reason); toastSuccess('Event rejected'); loadEvents(); }
        catch (e) { toastError('Failed: ' + e.message); }
      });
    });

    // Edit
    container.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        editingEvent = { ...allEvents.find(e => e.id === btn.dataset.id) };
        if (!editingEvent.posterUrls) editingEvent.posterUrls = [];
        renderUI();
      });
    });

    // Revert
    container.querySelectorAll('.revert-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('Are you sure you want to move this event back to pending?')) return;
        try { await revertToPending(btn.dataset.id); toastSuccess('Event moved to pending'); loadEvents(); }
        catch (e) { toastError('Failed: ' + e.message); }
      });
    });

    // Delete
    container.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const reason = prompt('Please enter a reason for deleting this event:');
        if (reason === null) return;
        try {
          await deleteEvent(btn.dataset.id, reason);
          toastSuccess('Event deleted and archived');
          loadEvents();
        } catch (err) {
          toastError('Failed to delete event: ' + err.message);
        }
      });
    });

    // Modal
    if (editingEvent) {
      container.querySelectorAll('.remove-poster-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.dataset.idx, 10);
          editingEvent.posterUrls.splice(idx, 1);
          renderUI();
        });
      });
      document.getElementById('modal-close')?.addEventListener('click', () => { editingEvent = null; renderUI(); });
      document.getElementById('modal-overlay')?.addEventListener('click', (e) => { if (e.target.id === 'modal-overlay') { editingEvent = null; renderUI(); }});
      document.getElementById('edit-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const updated = {
          prasanga: document.getElementById('edit-prasanga').value,
          troupe: document.getElementById('edit-troupe').value,
          date: document.getElementById('edit-date').value,
          endDate: document.getElementById('edit-end-date').value || '',
          time: document.getElementById('edit-time').value,
          location: document.getElementById('edit-location').value,
          googleMapsLink: document.getElementById('edit-maps-link').value,
          latitude: parseFloat(document.getElementById('edit-lat').value) || null,
          longitude: parseFloat(document.getElementById('edit-lng').value) || null,
          description: document.getElementById('edit-description').value,
          posterUrls: editingEvent.posterUrls || []
        };
        const posterFiles = document.getElementById('edit-posters').files;
        const filesArray = posterFiles.length > 0 ? Array.from(posterFiles) : [];
        try { await updateEvent(editingEvent.id, updated, filesArray); toastSuccess('Event updated!'); editingEvent = null; loadEvents(); }
        catch (e) { toastError('Failed: ' + e.message); }
      });

      const editMapLinkInput = document.getElementById('edit-maps-link');
      if (editMapLinkInput) {
        editMapLinkInput.addEventListener('input', async (e) => {
          const url = e.target.value.trim();
          if (!url || !url.startsWith('http')) return;
          
          const latInput = document.getElementById('edit-lat');
          const lngInput = document.getElementById('edit-lng');
          
          if (latInput.value || lngInput.value) return;

          try {
            editMapLinkInput.style.opacity = '0.5';
            const coords = await resolveMapLink(url);
            if (coords.lat && coords.lng) {
              latInput.value = coords.lat;
              lngInput.value = coords.lng;
              toastSuccess('Coordinates auto-filled from Google Maps link!');
            }
          } catch (err) {
            console.warn('Could not auto-resolve coordinates:', err);
          } finally {
            editMapLinkInput.style.opacity = '1';
          }
        });
      }
    }
  }

  function renderEditModal(event) {
    return `
      <div class="modal-overlay" id="modal-overlay">
        <div class="modal-content">
          <div class="modal-header"><h2>✏️ Edit Event</h2><button class="modal-close" id="modal-close">✕</button></div>
          <form class="modal-body" id="edit-form" style="display:flex;flex-direction:column;gap:14px">
            <div><label class="input-label">Event Title <span class="required">*</span></label>
              <input class="input-field" id="edit-prasanga" value="${event.prasanga}" required /></div>
            <div><label class="input-label">Troupe</label>
              <input class="input-field" id="edit-troupe" value="${event.troupe || ''}" /></div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
              <div><label class="input-label">Start Date <span class="required">*</span></label><input type="date" class="input-field" id="edit-date" value="${event.date}" required /></div>
              <div><label class="input-label">End Date</label><input type="date" class="input-field" id="edit-end-date" value="${event.endDate || ''}" /></div>
            </div>
            <div><label class="input-label">Time <span class="required">*</span></label><input type="time" class="input-field" id="edit-time" value="${event.time}" required /></div>
            <div><label class="input-label">Location</label><input class="input-field" id="edit-location" value="${event.location}" required /></div>
            <div><label class="input-label">Google Maps Link</label><input type="url" class="input-field" id="edit-maps-link" value="${event.googleMapsLink || ''}" /></div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
              <div><label class="input-label">Latitude</label><input type="number" step="any" class="input-field" id="edit-lat" value="${event.latitude || ''}" /></div>
              <div><label class="input-label">Longitude</label><input type="number" step="any" class="input-field" id="edit-lng" value="${event.longitude || ''}" /></div>
            </div>
            <div><label class="input-label">Description</label><textarea class="input-field" id="edit-description" rows="3">${event.description || ''}</textarea></div>
            <div>
              <label class="input-label">Existing Posters</label>
              <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:8px">
                 ${event.posterUrls && event.posterUrls.length ? event.posterUrls.map((url, idx) => `
                    <div style="position:relative; width:60px; height:80px">
                      <img src="${url}" style="width:100%;height:100%;object-fit:cover;border-radius:4px;" />
                      <button type="button" class="btn btn-sm btn-danger remove-poster-btn" data-idx="${idx}" style="position:absolute;top:-5px;right:-5px;padding:2px 5px;font-size:10px;min-width:auto;height:auto;line-height:1">✕</button>
                    </div>
                 `).join('') : '<p style="color:var(--text-muted);font-size:0.8rem">No posters</p>'}
              </div>
            </div>
            <div>
              <label class="input-label">Upload Additional Posters</label>
              <input type="file" id="edit-posters" accept="image/*" multiple class="input-field" style="padding:8px" />
            </div>
            <div class="modal-footer" style="padding:0">
              <button type="button" class="btn btn-secondary" onclick="document.getElementById('modal-close').click()">Cancel</button>
              <button type="submit" class="btn btn-primary">💾 Save Changes</button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  function initCharts(stats) {
    if (typeof Chart === 'undefined') return;

    const actionCanvas = document.getElementById('actions-chart');
    const submissionCanvas = document.getElementById('submissions-chart');

    if (actionCanvas) {
      const totalApproved = stats.actionStats.reduce((sum, a) => sum + a.approvedCount, 0);
      const totalRejected = stats.actionStats.reduce((sum, a) => sum + a.rejectedCount, 0);

      new Chart(actionCanvas, {
        type: 'doughnut',
        data: {
          labels: ['Approved', 'Rejected'],
          datasets: [{
            data: [totalApproved, totalRejected],
            backgroundColor: ['#10B981', '#EF4444'],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { color: '#ccc', font: { family: 'Outfit' } }
            }
          }
        }
      });
    }

    if (submissionCanvas) {
      const labels = stats.submissionStats.map(s => s.name || 'Anonymous');
      const data = stats.submissionStats.map(s => s.submissionCount);

      new Chart(submissionCanvas, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Submissions',
            data: data,
            backgroundColor: '#E8751A',
            borderRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: '#ccc', font: { family: 'Outfit' } }
            },
            y: {
              grid: { color: 'rgba(255,255,255,0.05)' },
              ticks: { color: '#ccc', font: { family: 'Outfit' }, precision: 0 }
            }
          }
        }
      });
    }
  }

  loadEvents();
}

function renderLeaderboard(stats) {
  if (!stats) return '<p>Loading stats...</p>';
  
  const topAdmins = [...stats.actionStats].sort((a, b) => b.approvedCount - a.approvedCount);
  const topSubmitters = [...stats.submissionStats].sort((a, b) => b.submissionCount - a.submissionCount);

  return `
    <div class="animate-fade-in-up" style="display:flex;flex-direction:column;gap:32px;margin-top:20px">
      ${isMasterAdmin() ? `
        <div style="display:flex; gap:12px; flex-wrap:wrap; margin-bottom:8px">
          <button class="btn btn-secondary" id="export-admins-btn" style="font-size:0.85rem; padding:8px 16px;">📥 Export Admin Stats</button>
          <button class="btn btn-secondary" id="export-submitters-btn" style="font-size:0.85rem; padding:8px 16px;">📥 Export Contributor Stats</button>
        </div>
      ` : ''}
      
      <!-- Charts Section -->
      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:24px;">
        <div class="card" style="padding:20px; display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:280px">
          <h3 style="font-size:0.95rem; margin-bottom:16px; color:var(--text-secondary); text-align:center">📊 Admin Actions Ratio</h3>
          <div style="width:100%; max-width:200px; height:200px; position:relative">
            <canvas id="actions-chart"></canvas>
          </div>
        </div>
        <div class="card" style="padding:20px; min-height:280px">
          <h3 style="font-size:0.95rem; margin-bottom:16px; color:var(--text-secondary)">📈 Contributor Submissions</h3>
          <div style="width:100%; height:200px; position:relative">
            <canvas id="submissions-chart"></canvas>
          </div>
        </div>
      </div>

      <section>
        <h2 style="margin-bottom:16px;font-size:1.4rem">🛡️ Admin Performance (Approvals/Rejections)</h2>
        <div class="card" style="padding:0;overflow:hidden">
          <table style="width:100%;border-collapse:collapse">
            <thead style="background:var(--bg-card);border-bottom:1px solid var(--border-light)">
              <tr>
                <th style="padding:12px;text-align:left;font-size:0.85rem;color:var(--text-muted)">Admin Name</th>
                <th style="padding:12px;text-align:center;font-size:0.85rem;color:var(--text-muted)">Approved</th>
                <th style="padding:12px;text-align:center;font-size:0.85rem;color:var(--text-muted)">Rejected</th>
                <th style="padding:12px;text-align:center;font-size:0.85rem;color:var(--text-muted)">Total Actions</th>
              </tr>
            </thead>
            <tbody>
              ${topAdmins.map(a => `
                <tr style="border-bottom:1px solid var(--border-light)">
                  <td style="padding:12px;font-weight:500">${a.name || 'Anonymous'}</td>
                  <td style="padding:12px;text-align:center;color:var(--green-light)">${a.approvedCount}</td>
                  <td style="padding:12px;text-align:center;color:var(--red-light)">${a.rejectedCount}</td>
                  <td style="padding:12px;text-align:center;font-weight:600">${a.approvedCount + a.rejectedCount}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 style="margin-bottom:16px;font-size:1.4rem">✍️ Contributor Leaderboard (Submissions)</h2>
        <div class="card" style="padding:0;overflow:hidden">
          <table style="width:100%;border-collapse:collapse">
            <thead style="background:var(--bg-card);border-bottom:1px solid var(--border-light)">
              <tr>
                <th style="padding:12px;text-align:left;font-size:0.85rem;color:var(--text-muted)">User Name</th>
                <th style="padding:12px;text-align:center;font-size:0.85rem;color:var(--text-muted)">Submissions</th>
              </tr>
            </thead>
            <tbody>
              ${topSubmitters.map(s => `
                <tr style="border-bottom:1px solid var(--border-light)">
                  <td style="padding:12px;font-weight:500">${s.name || 'Anonymous'}</td>
                  <td style="padding:12px;text-align:center;font-weight:600;color:var(--primary)">${s.submissionCount}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  `;
}
