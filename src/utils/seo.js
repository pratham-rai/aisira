export function updateSEO(title, description) {
  // Update Title
  const siteName = 'Aisira';
  document.title = title ? `${title} — ${siteName}` : 'Aisira — Tulunadu Cultural Events Portal';

  // Update Meta Description
  let metaDescription = document.querySelector('meta[name="description"]');
  if (!metaDescription) {
    metaDescription = document.createElement('meta');
    metaDescription.name = 'description';
    document.head.appendChild(metaDescription);
  }
  
  const defaultDesc = 'Discover cultural events of Tulunadu near you. Browse Yakshagana, Nema, Kambala, and Temple fairs. Aisira is the digital heartbeat of Tulunadu culture.';
  metaDescription.setAttribute('content', description || defaultDesc);

  // Update Open Graph (Social Sharing)
  updateMetaTag('property', 'og:title', title ? `${title} — ${siteName}` : 'Aisira');
  updateMetaTag('property', 'og:description', description || defaultDesc);
  updateMetaTag('property', 'og:type', 'website');
  updateMetaTag('property', 'og:url', window.location.href);
}

function updateMetaTag(attr, value, content) {
  let tag = document.querySelector(`meta[${attr}="${value}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attr, value);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}
