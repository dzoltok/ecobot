/**
 * Format a string into sentence case (first character uppercase, all others lowercase)
 *
 * @param {string} str
 * @returns {string}
 */
function sentenceCase(str) {
  return str.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, c => c.toUpperCase());
}

export default sentenceCase;
