export function renderMerchandise(container) {
  container.innerHTML = `
    <div class="page-wrapper animate-fade-in-up" style="min-height: 80vh; display: flex; align-items: center; justify-content: center;">
      <div class="glass-card" style="max-width: 600px; width: 100%; padding: 48px; text-align: center; border-radius: var(--radius-xl); position: relative; overflow: hidden;">
        <!-- Background decorative elements -->
        <div style="position: absolute; top: -50px; right: -50px; width: 150px; height: 150px; background: var(--accent-light); opacity: 0.1; filter: blur(40px); border-radius: 50%;"></div>
        <div style="position: absolute; bottom: -50px; left: -50px; width: 150px; height: 150px; background: var(--red-light); opacity: 0.1; filter: blur(40px); border-radius: 50%;"></div>
        
        <div class="merch-icon-wrapper" style="margin-bottom: 24px;">
          <div style="font-size: 64px; animation: float 3s ease-in-out infinite;">🛍️</div>
        </div>
        
        <h1 style="font-size: 2.5rem; margin-bottom: 16px; background: linear-gradient(135deg, var(--accent-light), #F4A623); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
          Aisira Store
        </h1>
        
        <p style="font-size: 1.1rem; color: var(--text-secondary); line-height: 1.6; margin-bottom: 32px;">
          Bringing the vibrant artistry of Yakshagana into your daily life. Exclusive costumes, posters, and traditional crafts are on their way!
        </p>
        
        <div class="coming-soon-badge" style="display: inline-block; padding: 12px 32px; background: rgba(232, 117, 26, 0.1); border: 1px solid var(--accent-light); color: var(--accent-light); border-radius: var(--radius-full); font-weight: 600; letter-spacing: 2px; text-transform: uppercase; font-size: 0.9rem; animation: pulse 2s infinite;">
          Coming Soon!!
        </div>
        
        <div style="margin-top: 48px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; opacity: 0.5;">
          <div class="stat-card" style="padding: 16px;">
            <div style="font-size: 24px; margin-bottom: 8px;">🎭</div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">Costumes</div>
          </div>
          <div class="stat-card" style="padding: 16px;">
            <div style="font-size: 24px; margin-bottom: 8px;">🖼️</div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">Posters</div>
          </div>
          <div class="stat-card" style="padding: 16px;">
            <div style="font-size: 24px; margin-bottom: 8px;">👕</div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">Apparels</div>
          </div>
        </div>

        <div style="margin-top: 40px; background: var(--bg-card); padding: 24px; border-radius: var(--radius-lg); border: 1px solid var(--border);">
          <p style="font-size: 0.95rem; color: var(--text-primary); margin-bottom: 16px; font-weight: 500;">
            Get notified when the store goes live:
          </p>
          <form id="notify-form" style="display: flex; gap: 8px; max-width: 400px; margin: 0 auto;">
            <input type="email" id="notify-email" class="input-field" placeholder="your@email.com" required style="padding: 10px 16px; font-size: 0.9rem;" />
            <button type="submit" class="btn btn-primary" style="padding: 10px 24px; font-size: 0.9rem; white-space: nowrap;">
              Notify Me
            </button>
          </form>
        </div>

        <div style="margin-top: 24px;">
          <a href="#/" class="btn btn-secondary" style="padding: 10px 24px; font-size: 0.85rem;">Return Home</a>
        </div>
      </div>
    </div>

    <style>
      @keyframes float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
      }
      .merch-icon-wrapper {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 120px;
        height: 120px;
        background: var(--bg-card);
        border: 1px solid var(--border-light);
        border-radius: 50%;
        margin: 0 auto 24px;
        box-shadow: var(--shadow-lg);
      }
    </style>
  `;

  // Add event listener for notify form
  setTimeout(() => {
    const form = document.getElementById('notify-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('notify-email').value;
        console.log('Notification request for:', email);
        import('../toast.js').then(({ toastSuccess }) => {
          toastSuccess(`Thank you! We'll notify ${email} when the store opens.`);
        });
        form.reset();
      });
    }
  }, 0);
}
