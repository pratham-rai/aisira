/**
 * Calculates the distance between two points in kilometers using the Haversine formula.
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;
  
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

/**
 * Gets the current browser location.
 * @returns {Promise<{lat: number, lng: number}>}
 */
export function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        let msg = 'Could not get your location.';
        switch(error.code) {
          case error.PERMISSION_DENIED:
            msg = 'Location access denied. Please enable location permissions in your browser settings to see nearby events.';
            break;
          case error.POSITION_UNAVAILABLE:
            msg = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            msg = 'Location request timed out.';
            break;
        }
        reject(new Error(msg));
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  });
}
