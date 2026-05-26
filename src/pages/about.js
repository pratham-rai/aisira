export function renderAbout(container) {
  container.innerHTML = `
    <div class="page-wrapper animate-fade-in-up">
      <div class="page-header" style="margin-bottom:32px">
        <h1>🎭 About Aisira</h1>
        <p>The Digital Heartbeat of Tulunadu Cultural Events</p>
      </div>

      <!-- Hero Section -->
      <div class="card-strong" style="overflow:hidden;margin-bottom:24px">
        <div style="background:linear-gradient(135deg, rgba(232,117,26,0.15), rgba(244,166,35,0.08));padding:48px 32px;text-align:center;position:relative">
          <img src="/logo.png" alt="Aisira Logo" style="display:block;margin:0 auto 16px auto;width:96px;height:96px;object-fit:contain" />
          <h2 style="font-size:2rem;font-weight:800;background:linear-gradient(135deg,var(--accent),var(--accent-light));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin:0">
            Celebrating the Spirit of Tulunadu
          </h2>
          <p style="color:var(--text-secondary);font-size:1.1rem;margin-top:12px;max-width:700px;margin-left:auto;margin-right:auto;line-height:1.7">
            Aisira is a community-driven platform dedicated to digitizing and preserving the vibrant 
            traditions of <strong style="color:var(--accent-light)">Tulunadu</strong>. From the celestial 
            dance of Yakshagana to the divine rituals of Daiva Nema and the rustic power of Kambala.
          </p>
        </div>
      </div>

      <!-- What is Tulunadu Culture -->
      <div class="card-strong" style="padding:32px;margin-bottom:24px">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">
          <span style="font-size:1.8rem">🪷</span>
          <h3 style="margin:0;font-size:1.3rem">The Cultural Tapestry</h3>
        </div>
        <p style="color:var(--text-secondary);line-height:1.8;margin-bottom:16px">
          The Tulu-speaking region of coastal <strong style="color:var(--text-primary)">Karnataka</strong> is home to 
          a unique cultural heritage that blends deep spiritual traditions with community celebrations. 
          Aisira brings these diverse forms onto a single platform.
        </p>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:16px;margin-top:20px">
          <div class="card" style="padding:20px;text-align:center">
            <div style="font-size:2rem;margin-bottom:8px">🎭</div>
            <h4 style="color:var(--accent-light);margin:0 0 6px">Yakshagana</h4>
            <p style="color:var(--text-muted);font-size:0.85rem;margin:0">The majestic theatre art combining dance, music, and powerful dialogues with elaborate costumes.</p>
          </div>
          <div class="card" style="padding:20px;text-align:center">
            <div style="font-size:2rem;margin-bottom:8px">🔥</div>
            <h4 style="color:var(--accent-light);margin:0 0 6px">Nema / Kola</h4>
            <p style="color:var(--text-muted);font-size:0.85rem;margin:0">The divine spirit worship (Bhoota Aradhane) — a core spiritual practice of the Tulu community.</p>
          </div>
          <div class="card" style="padding:20px;text-align:center">
            <div style="font-size:2rem;margin-bottom:8px">🐂</div>
            <h4 style="color:var(--accent-light);margin:0 0 6px">Kambala</h4>
            <p style="color:var(--text-muted);font-size:0.85rem;margin:0">The traditional buffalo race that showcases the agrarian strength and spirit of the coastal fields.</p>
          </div>
          <div class="card" style="padding:20px;text-align:center">
            <div style="font-size:2rem;margin-bottom:8px">🏛️</div>
            <h4 style="color:var(--accent-light);margin:0 0 6px">Temple Fairs</h4>
            <p style="color:var(--text-muted);font-size:0.85rem;margin:0">Annual Utsavas and Jathres that bring entire communities together in celebration and faith.</p>
          </div>
        </div>
      </div>

      <!-- Our Mission -->
      <div class="card-strong" style="padding:32px;margin-bottom:24px">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">
          <span style="font-size:1.8rem">🎯</span>
          <h3 style="margin:0;font-size:1.3rem">Our Mission</h3>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px">
          <div style="display:flex;gap:14px;align-items:flex-start">
            <div style="width:44px;height:44px;border-radius:12px;background:rgba(232,117,26,0.15);display:flex;align-items:center;justify-content:center;font-size:1.3rem;flex-shrink:0">📍</div>
            <div>
              <h4 style="margin:0 0 4px;color:var(--text-primary)">Digital Discovery</h4>
              <p style="color:var(--text-muted);font-size:0.9rem;margin:0">Help enthusiasts find cultural events happening near them with dates, multi-day schedules, and venues.</p>
            </div>
          </div>
          <div style="display:flex;gap:14px;align-items:flex-start">
            <div style="width:44px;height:44px;border-radius:12px;background:rgba(16,185,129,0.15);display:flex;align-items:center;justify-content:center;font-size:1.3rem;flex-shrink:0">🤝</div>
            <div>
              <h4 style="margin:0 0 4px;color:var(--text-primary)">Community Led</h4>
              <p style="color:var(--text-muted);font-size:0.9rem;margin:0">A collaborative database where everyone can contribute, ensuring no local event goes unnoticed.</p>
            </div>
          </div>
          <div style="display:flex;gap:14px;align-items:flex-start">
            <div style="width:44px;height:44px;border-radius:12px;background:rgba(139,92,246,0.15);display:flex;align-items:center;justify-content:center;font-size:1.3rem;flex-shrink:0">📜</div>
            <div>
              <h4 style="margin:0 0 4px;color:var(--text-primary)">Preserve Traditions</h4>
              <p style="color:var(--text-muted);font-size:0.9rem;margin:0">Documenting and archiving performance details to keep the legacy alive for future generations.</p>
            </div>
          </div>
          <div style="display:flex;gap:14px;align-items:flex-start">
            <div style="width:44px;height:44px;border-radius:12px;background:rgba(244,166,35,0.15);display:flex;align-items:center;justify-content:center;font-size:1.3rem;flex-shrink:0">📱</div>
            <div>
              <h4 style="margin:0 0 4px;color:var(--text-primary)">Mobile Ready</h4>
              <p style="color:var(--text-muted);font-size:0.9rem;margin:0">Easy access on the go, with map integration for seamless navigation to event locations.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- How It Works -->
      <div class="card-strong" style="padding:32px;margin-bottom:24px">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">
          <span style="font-size:1.8rem">⚡</span>
          <h3 style="margin:0;font-size:1.3rem">How It Works</h3>
        </div>
        <div style="display:flex;flex-direction:column;gap:16px">
          ${[
            { step: '1', icon: '🔍', title: 'Explore Categories', desc: 'Filter by Yakshagana, Nema, Kambala, or Temple Fairs to find exactly what you are looking for.' },
            { step: '2', icon: '📝', title: 'Share Events', desc: 'Submit details of events in your area. Add multiple dates for festivals and fairs.' },
            { step: '3', icon: '✅', title: 'Verification', desc: 'Our community and admin team review each submission to maintain data quality.' },
            { step: '4', icon: '✨', title: 'Experience Culture', desc: 'Get directions, save the date, and witness the magic of Tulunadu in person.' },
          ].map((item, i) => `
            <div class="card animate-fade-in-up" style="padding:20px;display:flex;align-items:center;gap:16px;animation-delay:${i * 80}ms">
              <div style="width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,var(--accent),var(--accent-light));display:flex;align-items:center;justify-content:center;font-size:1.3rem;flex-shrink:0;font-weight:700;color:#fff">${item.step}</div>
              <div>
                <h4 style="margin:0 0 4px;display:flex;align-items:center;gap:8px"><span>${item.icon}</span> ${item.title}</h4>
                <p style="color:var(--text-muted);font-size:0.9rem;margin:0">${item.desc}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Tech Stack -->
      <div class="card-strong" style="padding:32px;margin-bottom:24px">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">
          <span style="font-size:1.8rem">🛠️</span>
          <h3 style="margin:0;font-size:1.3rem">Built With</h3>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:10px">
          ${['JavaScript', 'Vite', 'Node.js', 'Express', 'MongoDB Atlas', 'Cloudinary', 'Leaflet Maps', 'JWT Auth', 'Nodemailer'].map(tech => `
            <span class="badge badge-thenku" style="font-size:0.85rem;padding:8px 16px">${tech}</span>
          `).join('')}
        </div>
      </div>

      <!-- Footer CTA -->
      <div style="text-align:center;padding:32px 0">
        <p style="color:var(--text-secondary);font-size:1.1rem;margin-bottom:16px">
          🙏 <em>Namo Namaha</em> — Thank you for supporting Yakshagana!
        </p>
        <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
          <a href="#/" class="btn btn-primary">🏠 Explore Events</a>
          <a href="#/contact" class="btn btn-secondary">📬 Contact Us</a>
        </div>
      </div>
    </div>
  `;
}
