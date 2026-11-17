const STORAGE_PREFIX = 'smartbrew.';

/**
 * Loads JSON data from local storage.
 * @param {string} key - Storage key suffix.
 * @param {*} fallback - Value returned when no valid stored value exists.
 * @returns {*} Stored value or fallback.
 */
export function loadStored(key, fallback) {
  const raw = window.localStorage.getItem(`${STORAGE_PREFIX}${key}`);
  if (!raw) return fallback;

  try {
    return JSON.parse(raw);
  } catch (error) {
    console.warn(`Ignoring invalid SmartBrew storage value for "${key}".`, error);
    return fallback;
  }
}

/**
 * Persists JSON data for the current browser profile.
 * @param {string} key - Storage key suffix.
 * @param {*} value - Serializable value to persist.
 * @returns {void} Stores the value.
 */
export function saveStored(key, value) {
  window.localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value));
}
