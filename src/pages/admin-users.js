import { getAllUsers, toggleAdminRole, getCurrentUser } from '../auth.js';
import { toastSuccess, toastError } from '../toast.js';
import { ROLES } from '../utils/constants.js';
import { exportToExcel } from '../utils/export.js';

export function renderAdminUsers(container) {
  let users = [];
  let loading = true;

  async function loadUsers() {
    loading = true;
    renderUI();
    try {
      users = await getAllUsers();
    } catch (err) {
      console.error('Failed to load users:', err);
      users = [];
    }
    loading = false;
    renderUI();
  }

  function renderUI() {
    const currentUser = getCurrentUser();

    container.innerHTML = `
      <div class="page-wrapper animate-fade-in-up">
        <div class="page-header" style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:16px;">
          <div>
            <h1>👥 User Management</h1>
            <p>Manage admin roles — Master Admin only</p>
          </div>
          <button class="btn btn-secondary" id="export-users-btn" style="display:flex; align-items:center; gap:8px;">
            📥 Export Users to Excel
          </button>
        </div>

        <div class="stat-grid" style="max-width:400px">
          <div class="stat-card"><div class="stat-value">${users.length}</div><div class="stat-label">Total Users</div></div>
          <div class="stat-card"><div class="stat-value">${users.filter(u => u.role === ROLES.ADMIN || u.role === ROLES.MASTER_ADMIN).length}</div><div class="stat-label">Admins</div></div>
        </div>

        ${loading ? `
          <div style="display:flex;flex-direction:column;gap:12px">
            ${[1,2,3].map(() => `<div class="skeleton" style="height:70px;border-radius:var(--radius-md)"></div>`).join('')}
          </div>
        ` : `
          <div style="display:flex;flex-direction:column;gap:12px">
            ${users.map((user, i) => `
              <div class="user-row animate-fade-in-up" style="animation-delay:${i * 60}ms">
                <div class="user-info">
                  <div class="user-avatar">${(user.displayName || user.email || '?').charAt(0).toUpperCase()}</div>
                  <div>
                    <div style="font-weight:600">${user.displayName || 'Unknown'}</div>
                    <div style="font-size:0.85rem;color:var(--text-secondary)">${user.email}</div>
                  </div>
                </div>
                <div style="display:flex;align-items:center;gap:12px">
                  <span class="badge ${user.role === ROLES.MASTER_ADMIN ? 'badge-approved' : user.role === ROLES.ADMIN ? 'badge-thenku' : 'badge-pending'}">${user.role}</span>
                  ${user.role !== ROLES.MASTER_ADMIN && user.uid !== currentUser.uid ? `
                    <button class="btn btn-sm ${user.role === ROLES.ADMIN ? 'btn-danger' : 'btn-secondary'} toggle-admin-btn" data-uid="${user.uid}">
                      ${user.role === ROLES.ADMIN ? 'Remove Admin' : 'Make Admin'}
                    </button>
                  ` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    `;

    // Export users
    const exportUsersBtn = document.getElementById('export-users-btn');
    if (exportUsersBtn) {
      exportUsersBtn.addEventListener('click', async () => {
        try {
          exportUsersBtn.disabled = true;
          exportUsersBtn.innerHTML = '<span class="spinner" style="width:14px;height:14px;margin-right:6px"></span> Exporting...';
          const data = users.map(u => ({
            UID: u.uid,
            DisplayName: u.displayName || 'Unknown',
            Email: u.email,
            Role: u.role,
            CreatedAt: u.createdAt ? new Date(u.createdAt).toLocaleString() : ''
          }));
          await exportToExcel(data, 'Aisira_Users', 'Users List');
          toastSuccess('Users list exported!');
        } catch (e) {
          toastError('Export failed: ' + e.message);
        } finally {
          exportUsersBtn.disabled = false;
          exportUsersBtn.innerHTML = '📥 Export Users to Excel';
        }
      });
    }

    container.querySelectorAll('.toggle-admin-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        try {
          await toggleAdminRole(btn.dataset.uid);
          toastSuccess('User role updated!');
          loadUsers();
        } catch (e) {
          toastError('Failed: ' + e.message);
        }
      });
    });
  }

  loadUsers();
}
