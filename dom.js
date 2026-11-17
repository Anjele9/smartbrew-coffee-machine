/**
 * Finds the first element matching a CSS selector.
 * @param {string} selector - CSS selector to search for.
 * @returns {Element|null} Matching element, or null.
 */
export const $ = (selector) => document.querySelector(selector);

/**
 * Finds all elements matching a CSS selector.
 * @param {string} selector - CSS selector to search for.
 * @returns {Element[]} Matching elements.
 */
export const $$ = (selector) => [...document.querySelectorAll(selector)];

/**
 * Formats a numeric amount as a two-decimal-place currency value.
 * @param {number} amount - Amount to format.
 * @returns {string} Formatted currency text.
 */
export const money = (amount) => `£${amount.toFixed(2)}`;

/**
 * Escapes text before inserting it into an HTML template.
 * @param {unknown} value - Value to render as text.
 * @returns {string} Safe HTML text.
 */
export function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
