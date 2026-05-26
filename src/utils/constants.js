export const EVENT_CATEGORIES = ['Yakshagana', 'Nema/Kola', 'Kambala', 'Nataka', 'Dance', 'Temple Annual Fair', 'Other Events'];

// Event status
export const EVENT_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

// User roles
export const ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  MASTER_ADMIN: 'masterAdmin',
};

// Max file upload
export const MAX_FILES = 5;
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

// Status badge class
export function statusBadgeClass(status) {
  return `badge badge-${status}`;
}
