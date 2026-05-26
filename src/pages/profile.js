import { getCurrentUser, logout } from '../auth.js';
import { api } from '../api.js';
import { navigate } from '../router.js';
import { toastSuccess, toastError } from '../toast.js';
import { ROLES } from '../utils/constants.js';
import { getApprovedEvents } from '../data.js';
import { formatDate, formatTime } from '../utils/date.js';

export function renderProfile(container) {
  const user = getCurrentUser();
  let loading = false;
  let success = false;
  let remindersData = [];
  let loadingReminders = true;

  async function loadReminders() {
    if (!user.reminders || user.reminders.length === 0) {
      loadingReminders = false;
      render();
      return;
    }
    try {
      const allEvents = await getApprovedEvents();
      remindersData = allEvents.filter(e => user.reminders.includes(e.id));
    } catch (err) {
      console.error('Failed to load reminders:', err);
    }
    loadingReminders = false;
    render();
  }

  loadReminders();

  function render() {
    const roleBadge = user.role === ROLES.MASTER_ADMIN
      ? 'badge-approved' : user.role === ROLES.ADMIN
      ? 'badge-thenku' : 'badge-pending';

    container.innerHTML = `
      <div class="page-wrapper animate-fade-in-up">
        <div class="page-header">
          <h1>👤 My Profile</h1>
          <p>Manage your account settings</p>
        </div>

        <!-- Profile Card -->
        <div class="card-strong" style="padding:32px;max-width:600px;margin-bottom:24px">
          <div style="display:flex;align-items:center;gap:20px;margin-bottom:24px">
            <div style="width:72px;height:72px;border-radius:50%;background:linear-gradient(135deg,var(--accent),var(--accent-hover));display:flex;align-items:center;justify-content:center;font-size:2rem;font-weight:700;color:#fff;flex-shrink:0">
              ${(user.displayName || '?').charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 style="margin:0;font-size:1.4rem">${user.displayName}</h2>
              <p style="color:var(--text-secondary);margin:4px 0">${user.email}</p>
              <span class="badge ${roleBadge}" style="font-size:0.75rem">${user.role}</span>
            </div>
          </div>
        </div>
        
        <!-- User Tools -->
        <div class="card-strong" style="padding:32px;max-width:600px;margin-bottom:24px">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px">
            <span style="font-size:1.5rem">📤</span>
            <h3 style="margin:0">My Contributions</h3>
          </div>
          <div style="display:flex;gap:12px;flex-wrap:wrap">
            <a href="#/profile/submissions" class="btn btn-primary">📤 View My Submissions</a>
            <a href="#/add" class="btn btn-secondary">➕ Add New Event</a>
          </div>
        </div>

        ${user.role === ROLES.MASTER_ADMIN ? `

        <!-- Master Admin Tools -->
        <div class="card-strong" style="padding:32px;max-width:600px;margin-bottom:24px">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px">
            <span style="font-size:1.5rem">👑</span>
            <h3 style="margin:0">Master Admin Tools</h3>
          </div>
          <div style="display:flex;gap:12px;flex-wrap:wrap">
            <a href="#/admin/past-events" class="btn btn-secondary">🗄️ Past Events Archive</a>
            <a href="#/admin/deleted-events" class="btn btn-secondary">🗑️ Deleted Events</a>
            <a href="#/admin/users" class="btn btn-secondary">👥 Manage Users</a>
          </div>

        </div>
        ` : ''}


        <!-- My Reminders -->
        <div class="card-strong" style="padding:32px;max-width:600px;margin-bottom:24px">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px">
            <span style="font-size:1.5rem">🔔</span>
            <h3 style="margin:0">My Reminders</h3>
          </div>
          
          ${loadingReminders ? `
            <div class="skeleton" style="height:60px;border-radius:var(--radius-md)"></div>
          ` : remindersData.length === 0 ? `
            <p style="color:var(--text-muted);font-size:0.9rem">You haven't set any reminders yet. Click the 🔔 icon on any event to save it here.</p>
          ` : `
            <div style="display:flex;flex-direction:column;gap:12px">
              ${remindersData.map(event => `
                <a href="#/event/${event.id}" class="card" style="padding:16px;display:flex;justify-content:space-between;align-items:center;text-decoration:none">
                  <div>
                    <div style="font-weight:600;color:var(--text-primary)">${event.prasanga}</div>
                    <div style="font-size:0.8rem;color:var(--text-muted)">${formatDate(event.date)} · ${formatTime(event.time)}</div>
                  </div>
                  <span style="color:var(--accent-light)">→</span>
                </a>
              `).join('')}
            </div>
          `}
        </div>

        <!-- Change Password -->
        <div class="card-strong" style="padding:32px;max-width:600px">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px">
            <span style="font-size:1.5rem">🔐</span>
            <h3 style="margin:0">Change Password</h3>
          </div>

          ${success ? `
            <div style="padding:16px;background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.3);border-radius:var(--radius-md);color:var(--green-light);text-align:center;margin-bottom:16px">
              ✅ Password changed successfully!
            </div>
          ` : ''}

          <form id="change-pw-form" class="login-form" style="gap:14px">
            <div>
              <label class="input-label">Current Password <span class="required">*</span></label>
              <input type="password" class="input-field" id="pw-current" placeholder="Enter current password" required minlength="6" />
            </div>
            <div>
              <label class="input-label">New Password <span class="required">*</span></label>
              <input type="password" class="input-field" id="pw-new" placeholder="Enter new password (min 6 chars)" required minlength="6" />
            </div>
            <div>
              <label class="input-label">Confirm New Password <span class="required">*</span></label>
              <input type="password" class="input-field" id="pw-confirm" placeholder="Confirm new password" required minlength="6" />
            </div>
            <div id="pw-error"></div>
            <button type="submit" class="btn btn-primary btn-lg" ${loading ? 'disabled' : ''}>
              ${loading ? '<div class="spinner"></div> Changing...' : '🔑 Change Password'}
            </button>
          </form>
        </div>
      </div>
    `;

    document.getElementById('change-pw-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const current = document.getElementById('pw-current').value;
      const newPw = document.getElementById('pw-new').value;
      const confirm = document.getElementById('pw-confirm').value;

      if (newPw !== confirm) {
        document.getElementById('pw-error').innerHTML = `<div class="login-error">New passwords do not match</div>`;
        return;
      }
      if (newPw === current) {
        document.getElementById('pw-error').innerHTML = `<div class="login-error">New password must be different from current</div>`;
        return;
      }

      loading = true;
      render();

      try {
        await api.changePassword(current, newPw);
        loading = false;
        success = true;
        render();
        toastSuccess('Password changed successfully!');
      } catch (err) {
        loading = false;
        success = false;
        render();
        document.getElementById('pw-error').innerHTML = `<div class="login-error">${err.message}</div>`;
      }
    });
  }

  render();
}
