/**
 * Promotes the first child of a given DOM node if it exists.
 * Replaces the node with its firstElementChild in the DOM tree.
 * Returns the promoted element, original node, or null.
 */
const promoteFirstChildIfExists = (element) => {
  if (!(element?.parentNode && element.firstElementChild)) return element ?? null;

  const { parentNode, firstElementChild } = element;
  parentNode.replaceChild(firstElementChild, element);
  return firstElementChild;
};

/**
 * Creates a DOM element with the specified tag and CSS classes.
 * @param {string} tag - The HTML tag to create.
 * @param  {...string} classNames - List of class names to apply.
 * @returns {HTMLElement}
 */
const createElementWithClasses = (tag, ...classNames) => {
  const element = document.createElement(tag);
  if (classNames.length) {
    element.classList.add(...classNames);
  }
  return element;
};

/**
 * Checks if an element has renderable content:
 * - Non-empty trimmed text content
 * - OR an <img> tag with a valid `src` attribute
 *
 * @param {HTMLElement} element
 * @returns {boolean}
 */
const isRenderableElement = (element) => {
  if (!element) return false;

  const hasText = element.textContent?.trim().length > 0;
  const hasImageWithSrc = element.querySelector?.('img')?.getAttribute('src');

  return hasText || !!hasImageWithSrc;
};

const getTextContent = (node) => node?.textContent?.trim?.() || '';

/**
 * Responsiveness should be handled in CSS
 * Use this function only for things that cannot be done in CSS such as eventListeners
 * and avoid window size listener at all times.
 */
const isMobileOrTabletScreen = () => !window.matchMedia('(min-width: 64rem)').matches;

const getMaskedIconElement = () => {
  const icon = document.createElement('span');
  icon.classList.add('mask-icon');
  icon.setAttribute('aria-hidden', 'true');
  return icon;
};

export {
  getTextContent,
  promoteFirstChildIfExists,
  createElementWithClasses,
  isRenderableElement,
  isMobileOrTabletScreen,
  getMaskedIconElement,
};
