import { getAlbum } from './api.js';
import { formatDuration } from './utils.js';

const gridSection = document.getElementById('grid-section');
const detailSection = document.getElementById('detail-section');
const statusRegion = document.getElementById('status-region');

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
 * Initialize the detail view: listen for album selection events.
 */
export function initDetailView() {
  document.addEventListener('album-selected', (event) => {
    const album = event.detail;
    if (!album) return;
    renderDetail(album);
  });
}

/**
 * Render the album detail view.
 * @param {Object} album
 */
async function renderDetail(album) {
  lastSelectedAlbumId = album.id;

  // Clear previous content
  clearDetail();

  // Loading state
  announceStatus('Loading album details…');
  const loadingEl = document.createElement('div');
  loadingEl.className = 'loading-wrapper';
  loadingEl.innerHTML = '<div class="loading-spinner" aria-hidden="true"></div><p class="loading-message">Loading album details…</p>';
  detailSection.appendChild(loadingEl);

  try {
    const data = await getAlbum(album.id);

    loadingEl.remove();
    renderDetailContent(data);
  } catch (error) {
    loadingEl.remove();
    announceStatus('Failed to load album details. Something went wrong.');
    renderErrorState();
    // eslint-disable-next-line no-console
    console.error('Album detail failed:', error);
  }
}

/**
 * Clear all content from the detail section.
 */
function clearDetail() {
  detailSection.innerHTML = '';
}

/**
 * Render the detail view content.
 * @param {Object} album
 */
function renderDetailContent(album) {
  const artistName = album.artist?.name || 'Unknown artist';
  const tracks = album.tracks?.data || [];

  // Back button
  const backButton = document.createElement('button');
  backButton.type = 'button';
  backButton.className = 'back-button';
  backButton.textContent = '← Back to albums';
  backButton.addEventListener('click', handleBack);
  detailSection.appendChild(backButton);

  // Album cover
  const coverWrapper = document.createElement('div');
  coverWrapper.className = 'detail-cover-wrapper';

  const img = document.createElement('img');
  img.src = album.cover_big || '';
  img.alt = `${album.title || 'Album'} cover`;
  img.className = 'detail-cover';
  img.width = 500;
  img.height = 500;
  img.onerror = function () {
    this.classList.add('detail-cover-placeholder');
  };

  coverWrapper.appendChild(img);
  detailSection.appendChild(coverWrapper);

  // Album title
  const heading = document.createElement('h2');
  heading.className = 'detail-heading';
  heading.textContent = album.title || 'Untitled Album';
  detailSection.appendChild(heading);

  // Release date
  const releaseDate = document.createElement('p');
  releaseDate.className = 'detail-release-date';
  releaseDate.textContent = formatReleaseDate(album.release_date);
  detailSection.appendChild(releaseDate);

  // Tracklist
  if (tracks.length > 0) {
    const tracklist = document.createElement('ol');
    tracklist.className = 'tracklist';

    tracks.forEach((track, index) => {
      const item = document.createElement('li');
      item.className = 'track-item';

      const numberSpan = document.createElement('span');
      numberSpan.className = 'track-number';
      numberSpan.textContent = index + 1;

      const titleSpan = document.createElement('span');
      titleSpan.className = 'track-title';
      titleSpan.textContent = track.title || '—';

      const durationSpan = document.createElement('span');
      durationSpan.className = 'track-duration';
      durationSpan.textContent = formatDuration(track.duration);

      item.appendChild(numberSpan);
      item.appendChild(titleSpan);
      item.appendChild(durationSpan);

      tracklist.appendChild(item);
    });

    detailSection.appendChild(tracklist);
  }

  // Announce success to screen readers
  const trackCount = tracks.length;
  announceStatus(`${album.title || 'Album'} by ${artistName}, ${trackCount} tracks.`);
}

/**
 * Format a release date string into a human-readable format.
 * @param {string} releaseDate
 * @returns {string}
 */
function formatReleaseDate(releaseDate) {
  if (!releaseDate) return 'Release date unknown';

  try {
    const date = new Date(releaseDate);
    if (Number.isNaN(date.getTime())) throw new Error('Invalid date');
    return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(date);
  } catch {
    return releaseDate;
  }
}

/**
 * Render error state message.
 */
function renderErrorState() {
  const el = document.createElement('p');
  el.className = 'error-message';
  el.textContent = 'Something went wrong. Try again.';
  detailSection.appendChild(el);
}

/**
 * Handle Back button: return to grid view and restore focus.
 */
function handleBack() {
  // Hide detail, show grid
  detailSection.classList.add('hidden');
  gridSection.classList.remove('hidden');

  // Clear detail content
  clearDetail();

  // Restore focus
  const previousCard = gridSection.querySelector(
    `[data-album-id="${lastSelectedAlbumId}"]`
  );

  if (previousCard) {
    previousCard.focus();
  } else {
    const gridBackButton = gridSection.querySelector('.back-button');
    if (gridBackButton) {
      gridBackButton.focus();
    } else {
      const gridHeading = gridSection.querySelector('.grid-heading');
      if (gridHeading) gridHeading.focus();
    }
  }
}
