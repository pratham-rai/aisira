const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatShortDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

export function formatDateRange(startDate, endDate) {
  if (!startDate) return '';
  const s = new Date(startDate);
  if (!endDate || startDate === endDate) {
    return `${s.getDate()} ${months[s.getMonth()]} ${s.getFullYear()}`;
  }
  const e = new Date(endDate);
  if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()) {
    return `${s.getDate()} - ${e.getDate()} ${months[s.getMonth()]} ${s.getFullYear()}`;
  }
  return `${s.getDate()} ${months[s.getMonth()]} - ${e.getDate()} ${months[e.getMonth()]} ${e.getFullYear()}`;
}

export function formatTime(timeStr) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
}

export function isUpcoming(dateStr, timeStr = '00:00') {
  const d = new Date(`${dateStr}T${timeStr}:00+05:30`);
  const now = new Date();
  // 6 hour buffer after the start time
  const cutoffTime = new Date(d.getTime() + 6 * 60 * 60 * 1000);
  return now < cutoffTime;
}

export function isToday(dateStr) {
  const d = new Date(dateStr);
  const today = new Date();
  return d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();
}

export function isThisWeek(dateStr) {
  const d = new Date(dateStr);
  const today = new Date();
  const weekEnd = new Date(today);
  weekEnd.setDate(today.getDate() + 7);
  return d >= today && d <= weekEnd;
}

export function isThisMonth(dateStr) {
  const d = new Date(dateStr);
  const today = new Date();
  return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear() && d >= today;
}
