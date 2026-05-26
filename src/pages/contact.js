import { toastSuccess, toastError } from '../toast.js';

export function renderContact(container) {
  let sending = false;
  let sent = false;

  function render() {
    container.innerHTML = `
      <div class="page-wrapper animate-fade-in-up">
        <div class="page-header">
          <h1>📬 Contact Us</h1>
          <p>Have a question, suggestion, or want to contribute? We'd love to hear from you!</p>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:24px;max-width:900px">
          <!-- Contact Form -->
          <div class="card-strong" style="padding:32px">
            ${sent ? `
              <div style="text-align:center;padding:32px 0">
                <div style="font-size:4rem;margin-bottom:16px">✅</div>
                <h3 style="color:var(--green-light);margin:0 0 8px">Message Sent!</h3>
                <p style="color:var(--text-secondary)">Thank you for reaching out. We'll get back to you soon.</p>
                <button class="btn btn-secondary" id="send-another" style="margin-top:16px">Send Another Message</button>
              </div>
            ` : `
              <h3 style="margin:0 0 20px;display:flex;align-items:center;gap:10px">
                <span style="font-size:1.5rem">✉️</span> Send a Message
              </h3>
              <form id="contact-form" class="login-form" style="gap:14px">
                <div>
                  <label class="input-label">Your Name <span class="required">*</span></label>
                  <input type="text" class="input-field" id="cf-name" placeholder="Enter your name" required />
                </div>
                <div>
                  <label class="input-label">Email <span class="required">*</span></label>
                  <input type="email" class="input-field" id="cf-email" placeholder="your@email.com" required />
                </div>
                <div>
                  <label class="input-label">Subject <span class="required">*</span></label>
                  <select class="input-field" id="cf-subject" required>
                    <option value="">Select a topic</option>
                    <option value="general">General Inquiry</option>
                    <option value="event">Event Information</option>
                    <option value="bug">Report a Bug</option>
                    <option value="feature">Feature Request</option>
                    <option value="collaboration">Collaboration</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label class="input-label">Message <span class="required">*</span></label>
                  <textarea class="input-field" id="cf-message" placeholder="Write your message here..." rows="5" required></textarea>
                </div>
                <button type="submit" class="btn btn-primary btn-lg" ${sending ? 'disabled' : ''}>
                  ${sending ? '<div class="spinner"></div> Sending...' : '📤 Send Message'}
                </button>
              </form>
            `}
          </div>

          <!-- Contact Info -->
          <div style="display:flex;flex-direction:column;gap:16px">
            <div class="card-strong" style="padding:24px">
              <h3 style="margin:0 0 16px;display:flex;align-items:center;gap:10px">
                <span style="font-size:1.5rem">📞</span> Get in Touch
              </h3>
              <div style="display:flex;flex-direction:column;gap:16px">
                <div style="display:flex;align-items:center;gap:14px">
                  <div style="width:44px;height:44px;border-radius:12px;background:rgba(232,117,26,0.15);display:flex;align-items:center;justify-content:center;font-size:1.2rem;flex-shrink:0">📧</div>
                  <div>
                    <div style="font-size:0.8rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px">Email</div>
                    <a href="mailto:yakshanidhi.app@gmail.com" style="color:var(--accent-light);text-decoration:none">yakshanidhi.app@gmail.com</a>

                  </div>
                </div>
                <div style="display:flex;align-items:center;gap:14px">
                  <div style="width:44px;height:44px;border-radius:12px;background:rgba(225,48,108,0.15);display:flex;align-items:center;justify-content:center;font-size:1.2rem;flex-shrink:0">📸</div>
                  <div>
                    <div style="font-size:0.8rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px">Instagram</div>
                    <a href="https://instagram.com/Aisira" target="_blank" rel="noopener" style="color:var(--accent-light);text-decoration:none">@Aisira</a>
                  </div>
                </div>
                <div style="display:flex;align-items:center;gap:14px">
                  <div style="width:44px;height:44px;border-radius:12px;background:rgba(16,185,129,0.15);display:flex;align-items:center;justify-content:center;font-size:1.2rem;flex-shrink:0">📍</div>
                  <div>
                    <div style="font-size:0.8rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px">Location</div>
                    <span style="color:var(--text-secondary)">Mangalore, Karnataka, India</span>
                  </div>
                </div>
                <div style="display:flex;align-items:center;gap:14px">
                  <div style="width:44px;height:44px;border-radius:12px;background:rgba(139,92,246,0.15);display:flex;align-items:center;justify-content:center;font-size:1.2rem;flex-shrink:0">🌐</div>
                  <div>
                    <div style="font-size:0.8rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px">Website</div>
                    <span style="color:var(--accent-light)">Aisira.com</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="card-strong" style="padding:24px">
              <h3 style="margin:0 0 16px;display:flex;align-items:center;gap:10px">
                <span style="font-size:1.5rem">💡</span> FAQ
              </h3>
              <div style="display:flex;flex-direction:column;gap:14px">
                <div>
                  <div style="font-weight:600;color:var(--text-primary);margin-bottom:4px">How do I submit an event?</div>
                  <p style="color:var(--text-muted);font-size:0.9rem;margin:0">Register an account, then click "Add Event" in the navigation. Your event will be reviewed by an admin before publishing.</p>
                </div>
                <div style="border-top:1px solid var(--border);padding-top:14px">
                  <div style="font-weight:600;color:var(--text-primary);margin-bottom:4px">How long does approval take?</div>
                  <p style="color:var(--text-muted);font-size:0.9rem;margin:0">Our admins review submissions as quickly as possible, typically within 24 hours.</p>
                </div>
                <div style="border-top:1px solid var(--border);padding-top:14px">
                  <div style="font-weight:600;color:var(--text-primary);margin-bottom:4px">Can I edit my submitted event?</div>
                  <p style="color:var(--text-muted);font-size:0.9rem;margin:0">Currently, only admins can edit events. If you need changes, please contact us with the event details.</p>
                </div>
                <div style="border-top:1px solid var(--border);padding-top:14px">
                  <div style="font-weight:600;color:var(--text-primary);margin-bottom:4px">Is Aisira free to use?</div>
                  <p style="color:var(--text-muted);font-size:0.9rem;margin:0">Yes! Aisira is completely free for both browsing and submitting events.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Contact form handler
    document.getElementById('contact-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('cf-name').value;
      const email = document.getElementById('cf-email').value;
      const subjectSelect = document.getElementById('cf-subject');
      const subjectValue = subjectSelect.options[subjectSelect.selectedIndex].text;
      const message = document.getElementById('cf-message').value;

      sending = true;
      render();

      try {
        const response = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            access_key: "98c79481-d827-4c90-aa9d-7c934bf534c8",
            name: name,
            email: email,
            subject: `New Aisira Inquiry: ${subjectValue}`,
            Topic: subjectValue,
            message: message,
            from_name: "Aisira Contact Form"
          }),
        });

        const result = await response.json();
        if (response.status === 200) {
          sent = true;
          toastSuccess('Message sent successfully!');
        } else {
          toastError(result.message || 'Failed to send message.');
        }
      } catch (error) {
        console.error(error);
        toastError('An error occurred while sending the message.');
      } finally {
        sending = false;
        render();
      }
    });

    document.getElementById('send-another')?.addEventListener('click', () => {
      sent = false;
      render();
    });
  }

  render();
}
