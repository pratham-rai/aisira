import { MAX_FILE_SIZE, ALLOWED_FILE_TYPES, MAX_FILES } from './constants.js';

export function validateEventForm(data) {
  const errors = {};

  if (!data.category) errors.category = 'Category is required';
  if (!data.prasanga || !data.prasanga.trim()) errors.prasanga = 'Event name is required';
  if (!data.date) errors.date = 'Start date is required';
  if (!data.time) errors.time = 'Time is required';
  if (!data.location || !data.location.trim()) errors.location = 'Location is required';

  if (data.googleMapsLink && !isValidUrl(data.googleMapsLink)) {
    errors.googleMapsLink = 'Please enter a valid URL';
  }
  if (data.latitude && (data.latitude < -90 || data.latitude > 90)) {
    errors.latitude = 'Latitude must be between -90 and 90';
  }
  if (data.longitude && (data.longitude < -180 || data.longitude > 180)) {
    errors.longitude = 'Longitude must be between -180 and 180';
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateFiles(files) {
  const errors = [];
  if (files.length > MAX_FILES) {
    errors.push(`Maximum ${MAX_FILES} files allowed`);
    return errors;
  }
  for (const file of files) {
    if (file.size > MAX_FILE_SIZE) {
      errors.push(`${file.name} exceeds 5MB limit`);
    }
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      errors.push(`${file.name} is not a supported format (JPG, PNG, WebP, PDF)`);
    }
  }
  return errors;
}

export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidUrl(str) {
  try { new URL(str); return true; } catch { return false; }
}
