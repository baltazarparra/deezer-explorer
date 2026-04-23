/**
 * Deezer API wrapper with CORS proxy.
 *
 * Primary proxy: corsproxy.io (browser-only, blocks server-side requests)
 * Fallback: api.allorigins.win
 *
 * If both fail, pause development and report to the user.
 */

const PROXY_BASE = 'https://corsproxy.io/?';
const DEEZER_BASE = 'https://api.deezer.com';

/**
 * Search for artists by name.
 * @param {string} query
 * @returns {Promise<Object>} Deezer search response
 */
export async function searchArtists(query) {
  const encodedQuery = encodeURIComponent(query);
  const url = `${PROXY_BASE}${DEEZER_BASE}/search/artist?q=${encodedQuery}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}

/**
 * List albums for a given artist.
 * @param {number|string} artistId
 * @returns {Promise<Object>} Deezer artist albums response
 */
export async function getArtistAlbums(artistId) {
  const url = `${PROXY_BASE}${DEEZER_BASE}/artist/${artistId}/albums`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}

/**
 * Get full album details including tracklist.
 * @param {number|string} albumId
 * @returns {Promise<Object>} Deezer album detail response
 */
export async function getAlbum(albumId) {
  const url = `${PROXY_BASE}${DEEZER_BASE}/album/${albumId}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}
