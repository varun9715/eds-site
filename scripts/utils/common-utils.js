/* eslint-disable no-param-reassign */
/* eslint-disable no-restricted-globals */
/**
 * @param {string} template - Placeholders in the format `{key}`.
 * @param {Object} values - A key-value pairs to replace in the template.
 * @returns {string} - The string with replaced by actual values.
 */
function stringFormat(template, values) {
  return template.replace(/\{(.*?)}/g, (_, key) => values[key] || '');
}

const sortObjectByAttr = (parentObj, attr, order = 'asc', sensitivity = 'base') => {
  // Validate that parentObj is a non-null object
  if (parentObj === null || typeof parentObj !== 'object') {
    console.error('Provided input is not a valid object.');
    return {};
  }

  // Normalise to only 'asc' or 'desc'
  order = order.toLowerCase() === 'desc' ? 'desc' : 'asc';

  return Object.fromEntries(
    Object.entries(parentObj).sort(([, a], [, b]) => {
      const aVal = a?.[attr] ?? '';
      const bVal = b?.[attr] ?? '';
      // Numbers Comparison
      const aNum = Number(aVal);
      const bNum = Number(bVal);
      const bothAreNumbers = !isNaN(aNum) && !isNaN(bNum);
      if (bothAreNumbers) {
        return order === 'asc' ? aNum - bNum : bNum - aNum;
      }

      // String Comparison
      const cmp = String(aVal).localeCompare(String(bVal), undefined, { sensitivity });
      return order === 'asc' ? cmp : -cmp;
    }),
  );
};

// On checkbox select clear alt field value
const setImgAltIfRequired = (image, altTxt) => {
  if (image && altTxt === 'true') {
    const img = image.querySelector('img');
    if (img) {
      img.setAttribute('alt', '');
    }
  }
};

// Setting alt attribute for image
const setAltFromAnchor = (urlObj, anchor) => {
  if (!urlObj || !(urlObj instanceof URL)) return;

  urlObj.alt = anchor?.title || anchor?.alt || '';
  if (urlObj.alt === urlObj.href) {
    urlObj.alt = '';
  }
};

const getUrlAndSetAltFromElement = (el, fallbackText = '') => {
  const imgEle = el?.querySelector?.('a') ?? el?.querySelector?.('img');
  const link = imgEle?.getAttribute?.('href') ?? imgEle?.getAttribute('src');
  const damUrl = link ? new URL(link) : fallbackText;
  setAltFromAnchor(damUrl, imgEle);
  return damUrl;
};

const setTextContent = (element, ...vars) => {
  if (!element) return;

  const values = vars
    .map((v) => (typeof v !== 'undefined' ? v : ''))
    .join(' ')
    .trim();

  if (values) element.textContent = values;
};

const applyClassToDirectChildren = (parentContainer, styleClass = '') => {
  const directChildren = parentContainer?.children;
  if (directChildren) {
    Array.from(directChildren).forEach((childElement) => {
      childElement.classList.add(styleClass);
    });
  }
};

const isCurrentUrl = (url) => {
  const linkUrl = new URL(url.href, window.location.origin);
  const currentUrl = new URL(window.location.href);

  return linkUrl.pathname === currentUrl.pathname;
};

const formatStringAsId = (input, replaceChar = '-') =>
  input
    .replace(/[^a-zA-Z0-9]+/g, replaceChar) // Replace non-alphanumerics
    .replace(new RegExp(`^${replaceChar}+|${replaceChar}+$`, 'g'), '') // Trim edges
    .replace(new RegExp(`${replaceChar}{2,}`, 'g'), replaceChar) // Collapse repeats
    .toLowerCase();

const isAuthorMode = () => window.hlx?.runmode === 'author';

const isAuthorEditMode = () => isAuthorMode() && window.parent !== window;

const isAuthorPreviewMode = () => isAuthorMode() && window.parent === window;

const getContentService = () => (isAuthorMode() ? '' : '/content-services');

const addClassToSelectors = (container, selectors, className) => {
  const elements = selectors.flatMap((selector) => [
    ...container.querySelectorAll(selector),
  ]);

  elements.forEach((element) => {
    element.classList.add(className);
  });
};

/**
 * Gets the block type of a given HTML element.
 *
 * @param {HTMLElement} ele The element to evaluate.
 * @returns {string|null} One of:
 *   - 'title-block' for <h1>–<h6>
 *   - 'text-block' for <ul>, <ol>, or <p> without immediate <img> child
 *   - 'image-block' for <p> with immediate <img> child
 *   - null if none match
 */
function getDefaultBlockType(ele) {
  if (!(ele instanceof HTMLElement)) return null;
  const tag = ele.tagName;
  if (/^H[1-6]$/.test(tag)) {
    return 'title-block';
  }
  if (tag === 'UL' || tag === 'OL') {
    return 'text-block';
  }
  if (tag === 'P') {
    const hasImg = Array.from(ele.children).some((child) => child.tagName === 'IMG');
    return hasImg ? 'image-block' : 'text-block';
  }
  return null;
}

/**
 * @param {Object} params
 * @param {HTMLElement} [params.block] - Optional block element with `data-testid`.
 * @param {HTMLElement} params.parentEl - Element to assign test ID to (or search within).
 * @param {string} [params.selector] - Optional selector to find a nested target.
 * @param {string} [params.elementName] - Optional suffix for the test ID.
 */
function attachTestId({ block, parentEl, selector, elementName }) {
  // Case 1: Assign based on block type (formerly attachBlockTestID)
  if (parentEl && !elementName) {
    const type = getDefaultBlockType(parentEl);
    if (type) {
      if (type === 'image-block') {
        const img = parentEl.querySelector(':scope > img');
        if (img) img.dataset.testid = type;
      } else {
        parentEl.dataset.testid = type;
      }
    }
    return;
  }

  // Case 2: Compose test ID using block’s data-testid and elementName (formerly attachTestId)
  if (block?.dataset?.testid && elementName) {
    const base = block.dataset.testid.split('-')[0];
    const fullTestId = `${base}-${elementName}`;
    let targets = [];
    // If a selector is provided, find elements within the parentEl or block
    // Otherwise, use parentEl directly
    if (selector) {
      targets = (parentEl || block)?.querySelectorAll(selector) || [];
    } else if (parentEl) {
      targets = [parentEl];
    }

    targets.forEach((el) => {
      if (el) el.dataset.testid = fullTestId;
    });
  }
}

/**
 * Extracts the file name (including extension) from a URL-ish string.
 *
 * @param {string} input - Absolute URL, relative path, or plain file name.
 * @returns {string} The file name, or an empty string if none is found.
 */
const getFilename = (input) => {
  const clean = input.split(/[?#]/)[0];
  try {
    const { pathname } = new URL(clean, 'http://dummy-base/');
    return pathname.replace(/\/$/, '').split('/').pop();
  } catch {
    return clean.split('/').pop();
  }
};

function getMainContentId() {
  const MAIN_CONTENT_ID = 'main-content';
  const FALLBACK_ID = 'main';

  if (document.getElementById(MAIN_CONTENT_ID)) {
    return MAIN_CONTENT_ID;
  }
  if (document.getElementById(FALLBACK_ID)) {
    return FALLBACK_ID;
  }

  return MAIN_CONTENT_ID;
}

/**
 * Checks if a paragraph element contains only a single anchor link
 * @param {Element} element - The element to check
 * @returns {boolean} - True if element is a paragraph with only an anchor link
 */
const isStandaloneLink = (element) =>
  element?.tagName === 'P' &&
  element.children.length === 1 &&
  element.firstElementChild.tagName === 'A' &&
  Array.from(element.childNodes).every(
    (node) =>
      node === element.firstElementChild ||
      (node.nodeType === Node.TEXT_NODE && !node.textContent.trim()),
  );

/**
 * Returns the appropriate title style class based on block layout, heading tag, and parent offset.
 * @param {HTMLElement} block - The block element to check for layout classes and offset parent.
 * @param {string} headingTag - The heading tag (e.g., 'h2', 'h3').
 * @param {Object} classes - Mapping of columns to title classes.
 * @returns {string} - The class name to apply, or empty string if none found.
 */
function getTitleStyleClass(block, headingTag, classes) {
  if (!headingTag) return '';

  const sectionType = block.closest('.offset-content-container') ? 'offset' : 'default';
  const matchedLayout = Object.keys(classes).find((layout) =>
    block.classList.contains(layout),
  );
  if (!matchedLayout) return '';

  return classes[matchedLayout]?.[sectionType]?.[headingTag.toLowerCase()] || '';
}

export {
  isCurrentUrl,
  formatStringAsId,
  stringFormat,
  sortObjectByAttr,
  setImgAltIfRequired,
  setAltFromAnchor,
  getUrlAndSetAltFromElement,
  setTextContent,
  applyClassToDirectChildren,
  isAuthorMode,
  isAuthorEditMode,
  isAuthorPreviewMode,
  getContentService,
  addClassToSelectors,
  attachTestId,
  getFilename,
  getMainContentId,
  isStandaloneLink,
  getTitleStyleClass,
};
