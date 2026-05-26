// Data module — REST API
import { api } from './api.js';

export async function getApprovedEvents() {
  return api.getApprovedEvents();
}

export async function getPastEvents() {
  return api.getPastEvents();
}

export async function getDeletedEvents() {
  return api.getDeletedEvents();
}

export async function getMySubmissions() {
  return api.getMySubmissions();
}



export async function getEventById(id) {
  return api.getEventById(id);
}

export async function incrementEventViews(id) {
  return api.incrementViews(id);
}

export async function getEvents() {
  return api.getAllEvents();
}

export async function getEventsByStatus(status) {
  return api.getAllEvents(status);
}

export async function addEvent(eventData, files = []) {
  // Upload poster files first
  let posterUrls = [];
  if (files.length > 0) {
    posterUrls = await api.uploadPosters(files);
  }
  return api.createEvent({ ...eventData, posterUrls });
}

export async function updateEvent(id, data, files = []) {
  let updateData = { ...data };
  if (files && files.length > 0) {
    const posterUrls = await api.uploadPosters(files);
    updateData.posterUrls = updateData.posterUrls ? [...updateData.posterUrls, ...posterUrls] : posterUrls;
  }
  return api.updateEvent(id, updateData);
}

export async function approveEvent(id) {
  return api.approveEvent(id);
}

export async function rejectEvent(id, reason) {
  return api.rejectEvent(id, reason);
}

export async function deleteEvent(id, reason) {
  return api.deleteEvent(id, reason);
}



export async function revertToPending(id) {
  return api.revertToPending(id);
}

export async function resolveMapLink(url) {
  return api.resolveMapLink(url);
}

export async function getStats() {
  return api.getStats();
}

export async function toggleWhatsAppReminder(id, phone) {
  return api.toggleWhatsAppReminder(id, phone);
}

