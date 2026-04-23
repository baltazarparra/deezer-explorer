/**
 * Format a duration in seconds as mm:ss.
 * @param {number|null|undefined} seconds
 * @returns {string}
 */
export function formatDuration(seconds) {
  if (seconds == null || Number.isNaN(seconds)) {
    return '—';
  }

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
