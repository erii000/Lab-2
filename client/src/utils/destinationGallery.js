/** @param {string} [cover] @param {string[]} [gallery] */
export function normalizeDestinationMedia(cover, gallery = []) {
  const urls = [];
  const seen = new Set();
  const add = (url) => {
    const trimmed = String(url ?? "").trim();
    if (!trimmed || seen.has(trimmed)) return;
    seen.add(trimmed);
    urls.push(trimmed);
  };
  add(cover);
  for (const url of gallery ?? []) add(url);
  return urls;
}

/** @param {object} tripOrDest */
export function mediaUrlsFromTrip(tripOrDest) {
  return normalizeDestinationMedia(tripOrDest?.image, tripOrDest?.gallery);
}

/** Extra gallery images for destination page (after hero/cover). */
export function extraGalleryUrls(destination) {
  const all = mediaUrlsFromTrip(destination);
  if (all.length <= 1) return [];
  return all.slice(1);
}
