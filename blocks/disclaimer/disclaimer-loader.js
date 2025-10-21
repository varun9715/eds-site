/* eslint-disable import/no-cycle */
/* eslint-disable no-underscore-dangle */

import { fetchFromGraphQLPersistedQuery } from '../../scripts/utils/graphql-apis.js';
import { getPathDetails, fetchLanguagePlaceholders } from '../../scripts/scripts.js';
import { isAuthorEditMode, attachTestId } from '../../scripts/utils/common-utils.js';
import { createElementWithClasses } from '../../scripts/utils/dom.js';
import { loadCSS } from '../../scripts/aem.js';

/* ---------- constants ---------- */
const DESC_KEY = 'disclaimer_description';
const DESC_ID = 'disclaimer_id';
const DESC_ID_PREFIX = 'd-';
const PATH = '_path';
const DISCLAIMER_TYPES = ['generic', 'manual', 'global'];
const isNaturallyFocusable = ['A', 'BUTTON', 'INPUT', 'TEXTAREA', 'SELECT'];

function attachTestIdToElements(block) {
  const mainEle = document.querySelector('main');
  const elementsToAttach = [
    { parentEl: mainEle, selector: '.footnote', elementName: 'footnote' },
    { selector: '.disclaimer-title', elementName: 'heading' },
    { selector: '.disclaimer-items', elementName: 'items' },
    { selector: '.disclaimer-list', elementName: 'list' },
    { selector: '.disclaimer-item', elementName: 'list-item' },
    { selector: '.disclaimer-item-content', elementName: 'item-content' },
    { selector: '.disclaimer-link-btc', elementName: 'back-to-content' },
  ];

  elementsToAttach.forEach(({ parentEl, selector, elementName }) => {
    attachTestId({ block, parentEl, selector, elementName });
  });
}

/**
 * Collect all #hash links in `root` that point to IDs yet/not-yet in the DOM.
 * Returns a deduplicated Array<string>.
 */
const collectHashIds = (root, includeExisting = false) => {
  const HREF_SELECTOR = `a[href^="#${DESC_ID_PREFIX}"], a[href^="/#${DESC_ID_PREFIX}"]`;
  const anchors = [...root.querySelectorAll(HREF_SELECTOR)];
  const seen = new Set();
  return anchors
    .map((a) => a.getAttribute('href')?.replace(/^\/?#/, ''))
    .filter(
      (id) =>
        id &&
        (includeExisting || !document.getElementById(id)) &&
        !seen.has(id) &&
        seen.add(id),
    );
};

/**
 * Helper to create a disclaimer item element.
 */
function createDisclaimerItem(id, html, type) {
  const disclaimerItem = createElementWithClasses('div', 'disclaimer-item-content');
  disclaimerItem.setAttribute('data-disclaimer-type', type);
  disclaimerItem.id = id;
  disclaimerItem.innerHTML = html;
  return disclaimerItem;
}

/**
 * Helper to append disclaimer items to a container.
 */
function appendDisclaimerItems(container, genericItems, orderedItems) {
  container.innerHTML = '';

  if (genericItems.length) {
    const genericEle = createElementWithClasses(
      'div',
      'disclaimer-items',
      'disclaimer-generic',
    );
    genericItems.forEach((el) => genericEle.appendChild(el));
    container.appendChild(genericEle);
  }

  if (orderedItems.length) {
    const ol = createElementWithClasses('ol', 'disclaimer-items', 'disclaimer-list');
    orderedItems.forEach((el) => {
      const li = createElementWithClasses('li', 'disclaimer-item');
      li.appendChild(el);
      ol.appendChild(li);
    });
    container.appendChild(ol);
  }
}

/**
 * Helper to create a disclaimer title with given items.
 */
function createDisclaimerTitle(placeholder) {
  const titleDiv = createElementWithClasses('div', 'disclaimer-title');
  const h2Tag = createElementWithClasses('h2', 'disclaimer-heading', 'body-01');
  h2Tag.textContent = placeholder.importantInformation || 'Important Information';
  titleDiv.appendChild(h2Tag);
  return titleDiv;
}

/**
 * Helper to create a disclaimer block with given items.
 */
function createDisclaimerBlock(placeholder, genericItems, orderedItems) {
  const block = createElementWithClasses('div', 'disclaimer', 'block');
  block.setAttribute('data-testid', 'disclaimer-block');
  block.setAttribute('data-block-name', 'disclaimer');
  block.setAttribute('data-block-status', 'loaded');

  const wrapper = createElementWithClasses('div', 'disclaimer-wrapper');
  wrapper.setAttribute('data-nosnippet', '');

  // Use the helper here
  const titleDiv = createDisclaimerTitle(placeholder);

  const disclaimerContainer = createElementWithClasses(
    'div',
    'disclaimer-container',
    'caption',
  );

  appendDisclaimerItems(disclaimerContainer, genericItems, orderedItems);

  wrapper.appendChild(titleDiv);
  wrapper.appendChild(disclaimerContainer);
  block.appendChild(wrapper);

  return block;
}

/**
 * Enhance footnotes and add back-to-content anchors.
 */
function enhanceDisclaimerFootnotes(placeholder) {
  const main = document.querySelector('main');
  const allAnchors = Array.from(main.querySelectorAll(`a[href^="#${DESC_ID_PREFIX}"]`));
  const hrefOrderMap = new Map();
  const itemTypeCache = new Map();
  let order = 1;
  let genericOrder = 1;

  /**
   * First pass: assign order to each unique href that points to a non-generic
   * disclaimer item, and cache type
   */
  allAnchors.forEach((a) => {
    const href = a.getAttribute('href');
    if (!href || href === '#') return;
    const id = href.slice(1);
    const item = document.getElementById(id);
    const type = item?.getAttribute('data-disclaimer-type');
    itemTypeCache.set(href, { item, type });
    if (
      item &&
      DISCLAIMER_TYPES.includes(type) &&
      type !== DISCLAIMER_TYPES[0] &&
      !hrefOrderMap.has(href)
    ) {
      hrefOrderMap.set(href, order);
      order += 1;
    }
  });

  // Second pass: update all anchors
  allAnchors.forEach((anchor) => {
    const href = anchor.getAttribute('href');
    if (!href || href === '#') return;
    const { item, type } = itemTypeCache.get(href) || {};
    if (!item || !DISCLAIMER_TYPES.includes(type)) return;

    const disclaimerBlock = item.closest('.disclaimer.block');
    const title =
      disclaimerBlock?.querySelector('.disclaimer-title')?.textContent?.trim() || '';
    const num = hrefOrderMap.get(href);

    if (type === DISCLAIMER_TYPES[0]) {
      anchor.id = `footnotes-ref-gen-${genericOrder}`;
      genericOrder += 1;
      anchor.classList.add('footnotes-ref');
      anchor.setAttribute('aria-label', title);
    } else if (num) {
      // Wrap in <sup> if not already
      if (!anchor.parentElement || anchor.parentElement.tagName.toLowerCase() !== 'sup') {
        const sup = createElementWithClasses('sup', 'footnote');
        anchor.replaceWith(sup);
        sup.appendChild(anchor);
      }
      anchor.textContent = `[${num}]`;
      anchor.id = `footnotes-ref-${num}`;
      anchor.classList.add('footnotes-ref');
      anchor.setAttribute('aria-label', `${title}, ${num}`);
    }
  });

  // Add back-to-content links
  const disclaimerItems = document.querySelectorAll(
    DISCLAIMER_TYPES.map(
      (type) => `.disclaimer-item-content[data-disclaimer-type="${type}"]`,
    ).join(','),
  );

  disclaimerItems.forEach((item) => {
    const parentId = item.id;
    const refAnchor = document.querySelector(`a[href="#${parentId}"]`);
    if (refAnchor) {
      const backToContenEle = createElementWithClasses('a', 'disclaimer-link-btc');
      backToContenEle.textContent = placeholder.backToContent || 'Back to content';
      backToContenEle.setAttribute('href', `#${refAnchor.id}`);
      item.appendChild(backToContenEle);
    }
  });
}

// Delay focus when clicked on link '.footnotes-ref' and '.disclaimer-link-btc'
function addDisclaimerFocusHandlers() {
  document.addEventListener('click', (e) => {
    const anchor = e.target.closest('.footnotes-ref, .disclaimer-link-btc');
    if (anchor && anchor.getAttribute('href')) {
      const href = anchor.getAttribute('href');
      if (href.startsWith('#') || href.startsWith('/#')) {
        // Support both "#id" and "/#id"
        const targetId = href.replace(/^\/?#/, '');
        const target = document.getElementById(targetId);
        if (target) {
          // If target is not normally focusable (e.g., <li>), add tabindex="-1"
          isNaturallyFocusable.includes(target.tagName);
          if (!isNaturallyFocusable && !target.hasAttribute('tabindex')) {
            target.setAttribute('tabindex', '-1');
          }

          setTimeout(() => {
            target.focus();
            target.classList.add('disclaimer-focus');
          }, 100);
        }
      }
    }
  });

  // Remove .disclaimer-focused from all elements on tab, space, enter, or mouse click
  function removeDisclaimerFocus() {
    document.querySelectorAll('.disclaimer-focus').forEach((el) => {
      el.classList.remove('disclaimer-focus');
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab' || e.key === ' ' || e.key === 'Enter') {
      removeDisclaimerFocus();
    }
  });

  document.addEventListener('mousedown', () => {
    removeDisclaimerFocus();
  });
}

/**
 * Helper to split disclaimer items into generic and ordered arrays.
 */
function splitDisclaimerItems(items) {
  const generic = [];
  const ordered = [];
  items.forEach((el) => {
    const type = el.getAttribute('data-disclaimer-type');
    if (type === DISCLAIMER_TYPES[0]) {
      generic.push(el);
    } else if (DISCLAIMER_TYPES.includes(type) && type !== DISCLAIMER_TYPES[0]) {
      ordered.push(el);
    }
  });
  return { generic, ordered };
}

const getFinalRegionLang = () => {
  let { region, lang } = getPathDetails();
  if (region === 'masters') region = 'au';
  if (lang === 'language') lang = 'en';
  return { region, lang };
};

const fetchGlobalDisclaimerItems = async (main) => {
  const disclaimerIds = collectHashIds(main);
  if (!disclaimerIds.length) return [];

  const { region, lang } = getFinalRegionLang();
  const variationList = region ? [region, 'master'] : ['master'];

  const pathFilters = [
    {
      value: `/content/dam/qcom/content-fragments/${lang}`,
      _operator: 'STARTS_WITH',
    },
  ];

  // Replace 'd-' prefix with '' in disclaimerIds
  const finalGlobalDisclaimerIds = disclaimerIds.map((id) =>
    id.replace(new RegExp(`^${DESC_ID_PREFIX}(?=\\w)`), ''),
  );
  const response = await fetchFromGraphQLPersistedQuery({
    operationName: 'getDisclaimers',
    stringFilters: {
      _variation: variationList,
      [DESC_ID]: finalGlobalDisclaimerIds,
      [PATH]: pathFilters,
    },
  });

  return response?.disclaimerList?.items || [];
};

/**
 * Build Disclaimers from CFMs using Disclaimer IDs from main tag
 */
const buildDisclaimers = async (main, items) => {
  const placeholder = await fetchLanguagePlaceholders();
  const { region } = getFinalRegionLang();

  const disclaimerMap = items.reduce((map, item) => {
    const id = item[DESC_ID];
    map[id] = { ...(map[id] || {}), [item._variation]: item };
    return map;
  }, {});

  const allDisclaimerIds = collectHashIds(main, true);
  let disclaimerBlock = document.querySelector('.disclaimer.block');
  let disclaimerContainer;

  // Prepare arrays for generic and ordered (manual/global) disclaimers
  const genericItems = [];
  const orderedItems = [];
  let hasContent = false;

  // Build new Global disclaimer items
  const descIdPrefixRegex = new RegExp(`^${DESC_ID_PREFIX}`);
  allDisclaimerIds.forEach((id) => {
    const cleanId = id.replace(descIdPrefixRegex, '');
    const mapEntry = disclaimerMap[cleanId];
    const item = mapEntry?.[region] || mapEntry?.master;
    if (item && !document.getElementById(id)) {
      const html = item[DESC_KEY]?.html;
      if (html) {
        hasContent = true;
        orderedItems.push(createDisclaimerItem(id, html, DISCLAIMER_TYPES[2]));
      }
    }
  });

  if (!isAuthorEditMode() && disclaimerBlock) {
    const disclaimerWrapper = disclaimerBlock.querySelector('.disclaimer-wrapper');
    disclaimerContainer = disclaimerBlock.querySelector('.disclaimer-container');
    // Ensure disclaimer-title exists, create if missing
    let titleDiv = disclaimerBlock.querySelector('.disclaimer-title');
    if (!titleDiv) {
      titleDiv = createDisclaimerTitle(placeholder);
      // Insert at the top of disclaimerBlock or inside .disclaimer-wrapper if present
      if (disclaimerWrapper) {
        disclaimerWrapper.insertBefore(titleDiv, disclaimerWrapper.firstChild);
      }
    }

    const existingItems = Array.from(
      disclaimerBlock.querySelectorAll('.disclaimer-item-content'),
    );
    const allItems = [];
    const addedIds = new Set();

    // Add non-generic items in allDisclaimerIds order
    allDisclaimerIds.forEach((id) => {
      const item =
        existingItems.find((el) => el.id === id) ||
        orderedItems.find((el) => el.id === id);
      // Only add if not generic type
      if (
        item &&
        !addedIds.has(id) &&
        item.getAttribute('data-disclaimer-type') !== DISCLAIMER_TYPES[0]
      ) {
        allItems.push(item);
        addedIds.add(id);
      }
    });

    // Add all existing items not already in allItems (including generics)
    existingItems.forEach((el) => {
      if (!addedIds.has(el.id)) {
        allItems.push(el);
        addedIds.add(el.id);
      }
    });

    // Split into generic and ordered
    const { generic: gen, ordered: ord } = splitDisclaimerItems(allItems);
    appendDisclaimerItems(disclaimerContainer, gen, ord);
    disclaimerBlock.classList.remove('disclaimer-hide');
    enhanceDisclaimerFootnotes(placeholder);
    addDisclaimerFocusHandlers();
  } else if (hasContent) {
    const section = createElementWithClasses('div', 'section');
    disclaimerBlock = createDisclaimerBlock(placeholder, genericItems, orderedItems);
    // create a section element
    section.appendChild(disclaimerBlock);
    // load disclaimer css only if no there is no disclaimer block on page
    loadCSS(`${window.hlx.codeBasePath}/blocks/disclaimer/disclaimer.css`);
    main.appendChild(section);
    if (!isAuthorEditMode()) {
      enhanceDisclaimerFootnotes(placeholder);
      addDisclaimerFocusHandlers();
    }
  }

  // testing requirement - set attribute 'data-testid' for elements
  attachTestIdToElements(disclaimerBlock);
};

/**
 * Load disclaimers in the main element.
 * @param {HTMLElement} main - The main element to load disclaimers into.
 */
const loadDisclaimers = async (main) => {
  try {
    if (!main) return;

    const items = await fetchGlobalDisclaimerItems(main);

    await buildDisclaimers(main, items);
  } catch (error) {
    console.error('Error while loading disclaimers:', error);
  }
};

export {
  collectHashIds,
  createDisclaimerItem,
  appendDisclaimerItems,
  createDisclaimerBlock,
  enhanceDisclaimerFootnotes,
  splitDisclaimerItems,
  getFinalRegionLang,
  fetchGlobalDisclaimerItems,
  buildDisclaimers,
  loadDisclaimers,
};
