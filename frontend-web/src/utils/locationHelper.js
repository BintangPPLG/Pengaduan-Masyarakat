/**
 * Parse location data (latitude, longitude, address) from the report body.
 * Database does not support these columns, so they are stored at the end of the body.
 *
 * Format stored:
 * ---
 * 📍 Koordinat: -6.2000, 106.8166
 * 🗺️ Alamat: Jalan Jenderal Sudirman No. 1, Jakarta
 */
export function parseLocationFromBody(body) {
  if (!body) return null;

  const coordRegex = /📍\s*Koordinat:\s*([-\d.]+)\s*,\s*([-\d.]+)/i;
  const addrRegex = /🗺️\s*Alamat:\s*(.+)/i;

  const coordMatch = body.match(coordRegex);
  const addrMatch = body.match(addrRegex);

  if (coordMatch) {
    const lat = parseFloat(coordMatch[1]);
    const lng = parseFloat(coordMatch[2]);
    const address = addrMatch ? addrMatch[1].trim() : 'Lokasi terpilih';
    
    // Clean body text by stripping out the metadata section
    // Split at either \n--- or \n\n---
    const dividerIndex = body.lastIndexOf('---');
    let cleanBody = body;
    if (dividerIndex !== -1) {
      cleanBody = body.substring(0, dividerIndex).trim();
    }

    return {
      latitude: lat,
      longitude: lng,
      address,
      cleanBody
    };
  }

  return null;
}

/**
 * Format coordinates and address to append to the report body.
 */
export function formatLocationForBody(body, lat, lng, address) {
  if (!lat || !lng) return body;
  const locationMeta = `\n\n---\n📍 Koordinat: ${lat}, ${lng}\n🗺️ Alamat: ${address || 'Lokasi tidak diketahui'}`;
  return `${body.trim()}${locationMeta}`;
}
