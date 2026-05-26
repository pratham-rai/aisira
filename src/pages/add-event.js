import { addEvent, resolveMapLink } from '../data.js';
import { getCurrentUser } from '../auth.js';
import { navigate } from '../router.js';
import { toastSuccess, toastError } from '../toast.js';
import { validateEventForm, validateFiles } from '../utils/validators.js';
import { EVENT_CATEGORIES, MAX_FILES } from '../utils/constants.js';

export function renderAddEvent(container) {
  const user = getCurrentUser();
  let files = [];
  let errors = {};
  let submitting = false;
  let formData = {
    category: EVENT_CATEGORIES[0],
    prasanga: '',
    troupe: '',
    date: '',
    endDate: '',
    time: '',
    location: '',
    googleMapsLink: '',
    latitude: '',
    longitude: '',
    description: '',
    organizerPhone: '',
    organizerEmail: ''
  };

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
          <h1>➕ Submit an Event</h1>
          <p>Share a cultural event of Tulunadu with the community. It will be reviewed by an admin before publishing.</p>
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
              <input type="text" class="input-field" id="ef-prasanga" placeholder="e.g., Karna Parva or Tulu Nataka" required value="${formData.prasanga}" />
              ${errors.prasanga ? `<small style="color:var(--red-light)">${errors.prasanga}</small>` : ''}
            </div>
            <div>
              <label class="input-label">Organizer / Troupe / Mela <span style="color:var(--text-muted)">(optional)</span></label>
              <input type="text" class="input-field" id="ef-troupe" placeholder="e.g., Dharmasthala Mela or Local Committee" value="${formData.troupe}" />
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
              <div>
                <label class="input-label">Start Date <span class="required">*</span></label>
                <input type="date" class="input-field" id="ef-date" required value="${formData.date}" />
                ${errors.date ? `<small style="color:var(--red-light)">${errors.date}</small>` : ''}
              </div>
              <div>
                <label class="input-label">End Date <span style="color:var(--text-muted)">(if multi-day)</span></label>
                <input type="date" class="input-field" id="ef-end-date" value="${formData.endDate}" />
              </div>
            </div>
            <div>
              <label class="input-label">Time <span class="required">*</span></label>
              <input type="time" class="input-field" id="ef-time" required value="${formData.time}" />
              ${errors.time ? `<small style="color:var(--red-light)">${errors.time}</small>` : ''}
            </div>
            <div>
              <label class="input-label">Location <span class="required">*</span></label>
              <input type="text" class="input-field" id="ef-location" placeholder="e.g., Dharmasthala Temple, Dharmasthala" required value="${formData.location}" />
              ${errors.location ? `<small style="color:var(--red-light)">${errors.location}</small>` : ''}
            </div>
            <div>
              <label class="input-label">Google Maps Link <span style="color:var(--text-muted)">(optional)</span></label>
              <input type="url" class="input-field" id="ef-maps-link" placeholder="https://maps.google.com/..." value="${formData.googleMapsLink}" />
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
              <div>
                <label class="input-label">Latitude <span style="color:var(--text-muted)">(optional)</span></label>
                <input type="number" step="any" class="input-field" id="ef-lat" placeholder="e.g., 12.9563" value="${formData.latitude}" />
              </div>
              <div>
                <label class="input-label">Longitude <span style="color:var(--text-muted)">(optional)</span></label>
                <input type="number" step="any" class="input-field" id="ef-lng" placeholder="e.g., 75.3724" value="${formData.longitude}" />
              </div>
            </div>            <div>
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
                <label class="input-label">Organizer Phone <span style="color:var(--text-muted)">(optional)</span></label>
                <input type="tel" class="input-field" id="ef-organizerPhone" placeholder="e.g., +91 9876543210" value="${formData.organizerPhone}" />
              </div>
              <div>
                <label class="input-label">Organizer Email <span style="color:var(--text-muted)">(optional)</span></label>
                <input type="email" class="input-field" id="ef-organizerEmail" placeholder="e.g., organizer@example.com" value="${formData.organizerEmail}" />
              </div>
            </div>
            <div>
              <label class="input-label">Event Poster <span style="color:var(--text-muted)">(optional, up to ${MAX_FILES} files, max 5MB each)</span></label>
              <div class="file-upload" id="file-upload-area">
                <div class="upload-icon">📎</div>
                <div class="upload-text"><strong>Click to upload</strong> or drag & drop<br>JPG, PNG, WebP, or PDF</div>
                <input type="file" id="ef-files" multiple accept="image/*,.pdf" style="display:none" />
              </div>
              <div class="file-previews" id="file-previews">
                ${files.map((f, i) => `
                  <div class="file-preview">
                    ${f.type.startsWith('image/') ? `<img src="${URL.createObjectURL(f)}" alt="${f.name}" />` : `<div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;background:var(--bg-card);font-size:1.5rem">📄</div>`}
                    <button type="button" class="remove-file" data-idx="${i}">✕</button>
                  </div>
                `).join('')}
              </div>
            </div>
            <button type="submit" class="btn btn-primary btn-lg" ${submitting ? 'disabled' : ''}>
              ${submitting ? '<div class="spinner"></div> Uploading & Submitting...' : '🎪 Submit Event'}
            </button>
          </form>
        </div>
      </div>
    `;

    // File upload handlers
    const uploadArea = document.getElementById('file-upload-area');
    const fileInput = document.getElementById('ef-files');
    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', (e) => { e.preventDefault(); uploadArea.classList.add('drag-over'); });
    uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('drag-over'));
    uploadArea.addEventListener('drop', (e) => { e.preventDefault(); uploadArea.classList.remove('drag-over'); handleFiles(e.dataTransfer.files); });
    fileInput.addEventListener('change', (e) => handleFiles(e.target.files));

    container.querySelectorAll('.remove-file').forEach(btn => {
      btn.addEventListener('click', (e) => { e.stopPropagation(); files.splice(parseInt(btn.dataset.idx), 1); render(); });
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

    // Map link auto-resolver
    const mapLinkInput = document.getElementById('ef-maps-link');
    if (mapLinkInput) {
      mapLinkInput.addEventListener('input', async (e) => {
        const url = e.target.value.trim();
        if (!url || !url.startsWith('http')) return;
        
        const latInput = document.getElementById('ef-lat');
        const lngInput = document.getElementById('ef-lng');
        
        if (latInput.value || lngInput.value) return; // Don't override if user already typed it

        try {
          mapLinkInput.style.opacity = '0.5';
          const coords = await resolveMapLink(url);
          if (coords.lat && coords.lng) {
            latInput.value = coords.lat;
            lngInput.value = coords.lng;
            toastSuccess('Coordinates auto-filled from Google Maps link!');
          }
        } catch (err) {
          console.warn('Could not auto-resolve coordinates:', err);
        } finally {
          mapLinkInput.style.opacity = '1';
        }
      });
    }

    // Bind inputs to state
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

  function handleFiles(fileList) {
    const newFiles = Array.from(fileList);
    const fileErrors = validateFiles([...files, ...newFiles]);
    if (fileErrors.length > 0) { toastError(fileErrors[0]); return; }
    files = [...files, ...newFiles].slice(0, MAX_FILES);
    render();
  }

  async function handleSubmit() {
    const data = {
      category: document.getElementById('ef-category').value,
      prasanga: document.getElementById('ef-prasanga').value,
      troupe: document.getElementById('ef-troupe').value,
      date: document.getElementById('ef-date').value,
      endDate: document.getElementById('ef-end-date').value || '',
      time: document.getElementById('ef-time').value,
      location: document.getElementById('ef-location').value,
      googleMapsLink: document.getElementById('ef-maps-link').value,
      latitude: parseFloat(document.getElementById('ef-lat').value) || null,
      longitude: parseFloat(document.getElementById('ef-lng').value) || null,
      description: document.getElementById('ef-description').innerHTML.trim(),
      submittedBy: user.uid,
      submittedByName: user.displayName,
      organizerPhone: document.getElementById('ef-organizerPhone').value,
      organizerEmail: document.getElementById('ef-organizerEmail').value,
    };

    const validation = validateEventForm(data);
    if (!validation.valid) { errors = validation.errors; render(); toastError('Please fix the highlighted errors'); return; }

    submitting = true;
    render();

    try {
      await addEvent(data, files);
      toastSuccess('Event submitted for review! An admin will approve it shortly.');
      navigate('/');
    } catch (err) {
      submitting = false;
      render();
      toastError('Failed to submit: ' + err.message);
    }
  }

  render();
}
