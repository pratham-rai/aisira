import { getEventById, updateEvent, resolveMapLink } from '../data.js';
import { getCurrentUser } from '../auth.js';
import { navigate } from '../router.js';
import { toastSuccess, toastError } from '../toast.js';
import { validateEventForm, validateFiles } from '../utils/validators.js';
import { EVENT_CATEGORIES, MAX_FILES } from '../utils/constants.js';

export async function renderEditEvent(container, params) {
  const user = getCurrentUser();
  let event = null;
  let files = []; // New files to upload
  let errors = {};
  let submitting = false;
  let formData = null;

  // Loading state
  container.innerHTML = `
    <div class="page-wrapper" style="display:flex;align-items:center;justify-content:center;min-height:50vh">
      <div style="text-align:center"><img src="/logo.png" style="width:64px;height:64px;margin-bottom:12px;object-fit:contain;animation:pulse 2s infinite" /><p style="color:var(--text-secondary)">Loading event data...</p></div>
    </div>
  `;

  try {
    event = await getEventById(params.id);
    if (!event) throw new Error('Event not found');
    
    // Security check (frontend)
    const isOwner = event.submittedBy === user.uid;
    const isAdmin = user.role === 'admin' || user.role === 'masterAdmin';
    if (!isOwner && !isAdmin) {
      toastError('You do not have permission to edit this event');
      navigate('/profile/submissions');
      return;
    }

    if (event.status === 'approved' && !isAdmin) {
      toastError('Approved events can only be edited by admins');
      navigate('/profile/submissions');
      return;
    }

    formData = {
      category: event.category || EVENT_CATEGORIES[0],
      prasanga: event.prasanga || '',
      troupe: event.troupe || '',
      date: event.date || '',
      endDate: event.endDate || '',
      time: event.time || '',
      location: event.location || '',
      googleMapsLink: event.googleMapsLink || '',
      latitude: event.latitude || '',
      longitude: event.longitude || '',
      description: event.description || '',
      organizerPhone: event.organizerPhone || '',
      organizerEmail: event.organizerEmail || '',
      posterUrls: event.posterUrls || []
    };
  } catch (err) {
    toastError(err.message);
    navigate('/profile/submissions');
    return;
  }

  function syncInputsToFormData() {
    const prasangaEl = document.getElementById('ef-prasanga');
    if (!prasangaEl) return;

    const troupeEl = document.getElementById('ef-troupe');
    const categoryEl = document.getElementById('ef-category');
    const dateEl = document.getElementById('ef-date');
    const endDateEl = document.getElementById('ef-end-date');
    const timeEl = document.getElementById('ef-time');
    const locationEl = document.getElementById('ef-location');
    const mapsLinkEl = document.getElementById('ef-maps-link');
    const latEl = document.getElementById('ef-lat');
    const lngEl = document.getElementById('ef-lng');
    const descEl = document.getElementById('ef-description');
    const phoneEl = document.getElementById('ef-organizerPhone');
    const emailEl = document.getElementById('ef-organizerEmail');

    if (prasangaEl) formData.prasanga = prasangaEl.value;
    if (troupeEl) formData.troupe = troupeEl.value;
    if (categoryEl) formData.category = categoryEl.value;
    if (dateEl) formData.date = dateEl.value;
    if (endDateEl) formData.endDate = endDateEl.value;
    if (timeEl) formData.time = timeEl.value;
    if (locationEl) formData.location = locationEl.value;
    if (mapsLinkEl) formData.googleMapsLink = mapsLinkEl.value;
    if (latEl) formData.latitude = latEl.value;
    if (lngEl) formData.longitude = lngEl.value;
    if (descEl) formData.description = descEl.innerHTML;
    if (phoneEl) formData.organizerPhone = phoneEl.value;
    if (emailEl) formData.organizerEmail = emailEl.value;
  }

  function render() {
    syncInputsToFormData();
    container.innerHTML = `
      <div class="page-wrapper animate-fade-in-up">
        <div class="page-header">
          <h1>✏️ Edit Event</h1>
          <p>Update your event details. If this event was previously rejected, it will be moved back to pending for re-review.</p>
        </div>

        <div class="card-strong" style="padding:32px;max-width:700px">
          <form id="event-form" class="login-form">
            <div>
              <label class="input-label">Category <span class="required">*</span></label>
              <select class="input-field" id="ef-category" required>
                ${EVENT_CATEGORIES.map(c => `<option value="${c}" ${formData.category === c ? 'selected' : ''}>${c}</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="input-label">Event Title <span class="required">*</span></label>
              <input type="text" class="input-field" id="ef-prasanga" placeholder="e.g., Karna Parva" required value="${formData.prasanga}" />
              ${errors.prasanga ? `<small style="color:var(--red-light)">${errors.prasanga}</small>` : ''}
            </div>
            <div>
              <label class="input-label">Organizer / Troupe / Mela</label>
              <input type="text" class="input-field" id="ef-troupe" value="${formData.troupe}" />
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
              <div>
                <label class="input-label">Start Date <span class="required">*</span></label>
                <input type="date" class="input-field" id="ef-date" required value="${formData.date}" />
              </div>
              <div>
                <label class="input-label">End Date</label>
                <input type="date" class="input-field" id="ef-end-date" value="${formData.endDate}" />
              </div>
            </div>
            <div>
              <label class="input-label">Time <span class="required">*</span></label>
              <input type="time" class="input-field" id="ef-time" required value="${formData.time}" />
            </div>
            <div>
              <label class="input-label">Location <span class="required">*</span></label>
              <input type="text" class="input-field" id="ef-location" required value="${formData.location}" />
            </div>
            <div>
              <label class="input-label">Google Maps Link</label>
              <input type="url" class="input-field" id="ef-maps-link" value="${formData.googleMapsLink}" />
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
              <div>
                <label class="input-label">Latitude</label>
                <input type="number" step="any" class="input-field" id="ef-lat" value="${formData.latitude}" />
              </div>
              <div>
                <label class="input-label">Longitude</label>
                <input type="number" step="any" class="input-field" id="ef-lng" value="${formData.longitude}" />
              </div>
            </div>
            <div>
              <label class="input-label">Description <span style="color:var(--text-muted)">(optional)</span></label>
              <div class="rich-editor-container">
                <div class="rich-editor-toolbar">
                  <button type="button" class="tb-btn" data-cmd="bold" title="Bold"><b>B</b></button>
                  <button type="button" class="tb-btn" data-cmd="italic" title="Italic"><i>I</i></button>
                  <button type="button" class="tb-btn" data-cmd="underline" title="Underline"><u>U</u></button>
                  <button type="button" class="tb-btn" data-cmd="insertUnorderedList" title="Bullet List">• List</button>
                </div>
                <div contenteditable="true" id="ef-description" class="rich-editor-content" placeholder="Describe the event...">${formData.description || ''}</div>
              </div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
              <div>
                <label class="input-label">Organizer Phone</label>
                <input type="tel" class="input-field" id="ef-organizerPhone" placeholder="e.g., +91 9876543210" value="${formData.organizerPhone}" />
              </div>
              <div>
                <label class="input-label">Organizer Email</label>
                <input type="email" class="input-field" id="ef-organizerEmail" placeholder="e.g., organizer@example.com" value="${formData.organizerEmail}" />
              </div>
            </div>

            <div>
              <label class="input-label">Existing Posters</label>
              <div class="file-previews">
                ${formData.posterUrls.map((url, idx) => `
                  <div class="file-preview">
                    <img src="${url}" />
                    <button type="button" class="remove-existing-file" data-idx="${idx}">✕</button>
                  </div>
                `).join('')}
                ${formData.posterUrls.length === 0 ? '<p style="color:var(--text-muted);font-size:0.85rem">No posters yet</p>' : ''}
              </div>
            </div>

            <div>
              <label class="input-label">Add New Posters</label>
              <div class="file-upload" id="file-upload-area">
                <div class="upload-icon">📎</div>
                <div class="upload-text"><strong>Click to upload</strong> more posters</div>
                <input type="file" id="ef-files" multiple accept="image/*" style="display:none" />
              </div>
              <div class="file-previews">
                ${files.map((f, i) => `
                  <div class="file-preview">
                    <img src="${URL.createObjectURL(f)}" />
                    <button type="button" class="remove-new-file" data-idx="${i}">✕</button>
                  </div>
                `).join('')}
              </div>
            </div>

            <div style="display:flex; gap:12px; margin-top:32px">
              <button type="button" class="btn btn-secondary btn-lg" id="cancel-btn" style="flex:1">Cancel</button>
              <button type="submit" class="btn btn-primary btn-lg" id="submit-btn" style="flex:2" ${submitting ? 'disabled' : ''}>
                ${submitting ? '<div class="spinner"></div> Updating...' : (event.status === 'rejected' ? '💾 Save & Resubmit' : '💾 Save Changes')}
              </button>

            </div>
          </form>
        </div>
      </div>
    `;

    // Handlers
    document.getElementById('cancel-btn').addEventListener('click', () => window.history.back());
    
    const uploadArea = document.getElementById('file-upload-area');
    const fileInput = document.getElementById('ef-files');
    uploadArea.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
      const newFiles = Array.from(e.target.files);
      const totalCount = formData.posterUrls.length + files.length + newFiles.length;
      if (totalCount > MAX_FILES) { toastError(`Maximum ${MAX_FILES} posters allowed`); return; }
      files = [...files, ...newFiles];
      render();
    });

    container.querySelectorAll('.remove-existing-file').forEach(btn => {
      btn.addEventListener('click', () => {
        formData.posterUrls.splice(parseInt(btn.dataset.idx), 1);
        render();
      });
    });

    container.querySelectorAll('.remove-new-file').forEach(btn => {
      btn.addEventListener('click', () => {
        files.splice(parseInt(btn.dataset.idx), 1);
        render();
      });
    });

    document.getElementById('event-form').addEventListener('submit', (e) => { e.preventDefault(); handleSubmit(); });

    // Rich Editor Toolbar Commands
    container.querySelectorAll('.tb-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const cmd = btn.dataset.cmd;
        document.execCommand(cmd, false, null);
        document.getElementById('ef-description').focus();
      });
    });

    // Sync form data
    container.querySelectorAll('.input-field').forEach(input => {
      input.addEventListener('input', (e) => {
        const id = e.target.id.replace('ef-', '');
        let key = id;
        if (id === 'end-date') key = 'endDate';
        if (id === 'maps-link') key = 'googleMapsLink';
        if (id === 'lat') key = 'latitude';
        if (id === 'lng') key = 'longitude';
        if (id === 'organizerPhone') key = 'organizerPhone';
        if (id === 'organizerEmail') key = 'organizerEmail';
        formData[key] = e.target.value;
      });
    });
  }

  async function handleSubmit() {
    const data = {
      ...formData,
      latitude: parseFloat(formData.latitude) || null,
      longitude: parseFloat(formData.longitude) || null,
      description: document.getElementById('ef-description').innerHTML.trim(),
    };

    const validation = validateEventForm(data);
    if (!validation.valid) { toastError('Please fix errors'); return; }

    submitting = true;
    render();

    try {
      await updateEvent(event.id, data, files);
      toastSuccess('Event updated successfully!');
      navigate('/profile/submissions');
    } catch (err) {
      submitting = false;
      render();
      toastError('Failed to update: ' + err.message);
    }
  }

  render();
}
