

export function getNavigationLinks(latitude: string | number, longitude: string | number) {
  const lat = Number(latitude);
  const lng = Number(longitude);

  return {
    googleMaps: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
    waze: `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`,
  };
}