/** Tiny haptics helper. Silently no-ops where the Vibration API is unavailable. */
export function tapFeedback(ms = 8) {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(ms);
    }
  } catch {
    /* noop */
  }
}

/** Slightly stronger pulse for confirmations (save, stamp, unlock). */
export function confirmFeedback() {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([12, 40, 18]);
    }
  } catch {
    /* noop */
  }
}
