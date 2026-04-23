import { getArtistAlbums } from './api.js';

const searchSection = document.getElementById('search-section');
const gridSection = document.getElementById('grid-section');
const detailSection = document.getElementById('detail-section');
const statusRegion = document.getElementById('status-region');

let lastSelectedArtistId = null;
let lastSelectedAlbumId = null;

/**
 * Write a message to the fixed aria-live status region.
 * @param {string} message
 */
function announceStatus(message) {
  if (statusRegion) {
    statusRegion.textContent = message;
  }
}

/**
 * Initialize the grid view: listen for artist selection events.
 */
export function initGridView() {
  document.addEventListener('artist-selected', (event) => {
    const artist = event.detail;
    if (!artist) return;
    renderGrid(artist);
  });
}

/**
 * Render the album grid for a given artist.
 * @param {Object} artist
 */
async function renderGrid(artist) {
  lastSelectedArtistId = artist.id;

  // Clear previous content
  clearGrid();

  // Loading state
  announceStatus(`Loading albums for ${artist.name}…`);
  const loadingEl = document.createElement('div');
  loadingEl.className = 'loading-wrapper';
  loadingEl.innerHTML = '<div class="loading-spinner" aria-hidden="true"></div><p class="loading-message">Loading albums…</p>';
  gridSection.appendChild(loadingEl);

  try {
    const data = await getArtistAlbums(artist.id);
    const albums = data.data || [];

    loadingEl.remove();

    if (albums.length === 0) {
      announceStatus(`No albums found for ${artist.name}.`);
      renderEmptyState(artist.name);
      return;
    }

    announceStatus(`${artist.name} has ${albums.length} albums.`);
    renderGridContent(artist.name, albums);
  } catch (error) {
    loadingEl.remove();
    announceStatus('Failed to load albums. Something went wrong.');
    renderErrorState();
    // eslint-disable-next-line no-console
    console.error('Album grid failed:', error);
  }
}

/**
 * Clear all content from the grid section.
 */
function clearGrid() {
  gridSection.innerHTML = '';
}

/**
 * Render the grid header, back button, and album cards.
 * @param {string} artistName
 * @param {Array} albums
 */
function renderGridContent(artistName, albums) {
  // Back button
  const backButton = document.createElement('button');
  backButton.type = 'button';
  backButton.className = 'back-button';
  backButton.textContent = '← Back to search results';
  backButton.addEventListener('click', handleBack);
  gridSection.appendChild(backButton);

  // Artist heading
  const heading = document.createElement('h2');
  heading.className = 'grid-heading';
  heading.textContent = artistName;
  gridSection.appendChild(heading);

  // Album grid
  const grid = document.createElement('div');
  grid.className = 'album-grid';

  albums.forEach((album) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'album-card';
    card.setAttribute('data-album-id', album.id);

    const img = document.createElement('img');
    img.src = album.cover_medium || '';
    img.alt = ''; // decorative, title is visible
    img.width = 250;
    img.height = 250;
    img.loading = 'lazy';
    img.onerror = function () {
      this.style.display = 'none';
    };

    const title = document.createElement('span');
    title.className = 'album-title';
    title.textContent = album.title;

    const year = document.createElement('span');
    year.className = 'album-year';
    year.textContent = extractYear(album.release_date);

    card.appendChild(img);
    card.appendChild(title);
    card.appendChild(year);

    card.addEventListener('click', () => handleAlbumSelect(album));

    grid.appendChild(card);
  });

  gridSection.appendChild(grid);
}

/**
 * Extract release year from a YYYY-MM-DD string.
 * @param {string} releaseDate
 * @returns {string}
 */
function extractYear(releaseDate) {
  if (!releaseDate) return '';
  return releaseDate.split('-')[0];
}

/**
 * Render empty state message.
 * @param {string} artistName
 */
function renderEmptyState(artistName) {
  const el = document.createElement('p');
  el.className = 'empty-message';
  el.textContent = `No albums found for ${artistName}.`;
  gridSection.appendChild(el);
}

/**
 * Render error state message.
 */
function renderErrorState() {
  const el = document.createElement('p');
  el.className = 'error-message';
  el.textContent = 'Something went wrong. Try again.';
  gridSection.appendChild(el);
}

/**
 * Handle album selection: transition to detail view.
 * @param {Object} album
 */
function handleAlbumSelect(album) {
  lastSelectedAlbumId = album.id;

  // View transition
  gridSection.classList.add('hidden');
  detailSection.classList.remove('hidden');

  // Notify detail view to render
  document.dispatchEvent(
    new CustomEvent('album-selected', { detail: album })
  );
}

/**
 * Handle Back button: return to search view and restore focus.
 */
function handleBack() {
  // Hide grid, show search
  gridSection.classList.add('hidden');
  searchSection.classList.remove('hidden');

  // Clear grid content
  clearGrid();

  // Restore focus
  const previousButton = searchSection.querySelector(
    `[data-artist-id="${lastSelectedArtistId}"]`
  );

  if (previousButton) {
    previousButton.focus();
  } else {
    const searchInput = searchSection.querySelector('input[type="search"]');
    if (searchInput) searchInput.focus();
  }
}
