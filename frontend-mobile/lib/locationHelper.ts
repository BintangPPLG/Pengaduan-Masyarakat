/**
 * Parse location data (latitude, longitude, address) from the report body on mobile.
 */
export function parseLocationFromBody(body: string | undefined | null) {
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
    const dividerIndex = body.lastIndexOf('---');
    let cleanBody = body;
    if (dividerIndex !== -1) {
      cleanBody = body.substring(0, dividerIndex).trim();
    }

    return {
      latitude: lat,
      longitude: lng,
      address,
      cleanBody,
    };
  }

  return null;
}
