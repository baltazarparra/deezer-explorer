import { searchArtists } from './api.js';

const searchSection = document.getElementById('search-section');
const gridSection = document.getElementById('grid-section');
const statusRegion = document.getElementById('status-region');

let lastResults = [];
let requestId = 0;

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
 * Initialize the search view: render form and set up event listeners.
 */
export function initSearchView() {
  renderSearchForm();
}

/**
 * Render the search form into the search section.
 */
function renderSearchForm() {
  const form = document.createElement('form');
  form.className = 'search-form';
  form.setAttribute('role', 'search');
  form.setAttribute('aria-label', 'Search for an artist');

  const label = document.createElement('label');
  label.htmlFor = 'artist-search';
  label.className = 'visually-hidden';
  label.textContent = 'Artist name';

  const input = document.createElement('input');
  input.type = 'search';
  input.id = 'artist-search';
  input.name = 'q';
  input.placeholder = 'Search for an artist…';
  input.autocomplete = 'off';
  input.required = true;

  const button = document.createElement('button');
  button.type = 'submit';
  button.textContent = 'Search';

  form.appendChild(label);
  form.appendChild(input);
  form.appendChild(button);

  form.addEventListener('submit', handleSubmit);

  searchSection.appendChild(form);
}

/**
 * Handle form submission.
 * @param {Event} event
 */
async function handleSubmit(event) {
  event.preventDefault();

  const form = event.target;
  const input = form.querySelector('input[type="search"]');
  const button = form.querySelector('button[type="submit"]');
  const query = input.value.trim();

  if (!query) return;

  const currentRequestId = ++requestId;

  // Clear previous results and messages
  clearResults();
  announceStatus('Searching for artists…');

  // Loading state
  button.disabled = true;
  button.textContent = 'Searching…';
  const loadingEl = document.createElement('div');
  loadingEl.className = 'loading-wrapper';
  loadingEl.innerHTML = '<div class="loading-spinner" aria-hidden="true"></div><p class="loading-message">Searching…</p>';
  searchSection.appendChild(loadingEl);

  try {
    const data = await searchArtists(query);

    // Ignore stale responses from earlier requests
    if (currentRequestId !== requestId) return;

    lastResults = data.data || [];

    // Remove loading state
    loadingEl.remove();

    if (lastResults.length === 0) {
      announceStatus('No artists found.');
      renderEmptyState();
    } else {
      announceStatus(`Found ${lastResults.length} artists.`);
      renderResults(lastResults.slice(0, 10));
    }
  } catch (error) {
    // Ignore stale responses from earlier requests
    if (currentRequestId !== requestId) return;

    // Remove loading state
    loadingEl.remove();
    announceStatus('Search failed. Something went wrong.');
    renderErrorState();
    // eslint-disable-next-line no-console
    console.error('Search failed:', error);
  } finally {
    // Only re-enable button if this is the latest request
    if (currentRequestId === requestId) {
      button.disabled = false;
      button.textContent = 'Search';
    }
  }
}

/**
 * Clear previous results and status messages.
 */
function clearResults() {
  const existing = searchSection.querySelectorAll('.results-list, .error-message, .empty-message, .loading-wrapper');
  existing.forEach((el) => el.remove());
}

/**
 * Render the list of artist results.
 * @param {Array} artists
 */
function renderResults(artists) {
  const list = document.createElement('ul');
  list.className = 'results-list';

  artists.forEach((artist) => {
    const item = document.createElement('li');

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'artist-result';
    button.setAttribute('data-artist-id', artist.id);

    const img = document.createElement('img');
    img.src = artist.picture_small || '';
    img.alt = `${artist.name} thumbnail`;
    img.width = 64;
    img.height = 64;
    img.loading = 'lazy';
    img.onerror = function () {
      this.style.display = 'none';
    };

    const nameSpan = document.createElement('span');
    nameSpan.className = 'artist-name';
    nameSpan.textContent = artist.name;

    button.appendChild(img);
    button.appendChild(nameSpan);

    button.addEventListener('click', () => handleArtistSelect(artist));

    item.appendChild(button);
    list.appendChild(item);
  });

  searchSection.appendChild(list);
}

/**
 * Render empty state message.
 */
function renderEmptyState() {
  const el = document.createElement('p');
  el.className = 'empty-message';
  el.textContent = 'No artists found.';
  searchSection.appendChild(el);
}

/**
 * Render error state message.
 */
function renderErrorState() {
  const el = document.createElement('p');
  el.className = 'error-message';
  el.textContent = 'Something went wrong. Try again.';
  searchSection.appendChild(el);
}

/**
 * Handle artist selection: transition to grid view.
 * @param {Object} artist
 */
function handleArtistSelect(artist) {
  // Store selected artist for Phase 2
  window.__selectedArtist = artist;

  // View transition
  searchSection.classList.add('hidden');
  gridSection.classList.remove('hidden');

  // Notify grid view to render
  document.dispatchEvent(
    new CustomEvent('artist-selected', { detail: artist })
  );
}
