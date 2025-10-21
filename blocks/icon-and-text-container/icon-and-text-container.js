/* eslint-disable no-unused-vars */
import { createElementWithClasses, getTextContent } from '../../scripts/utils/dom.js';
import {
  attachTestId,
  isStandaloneLink,
  getTitleStyleClass,
} from '../../scripts/utils/common-utils.js';

// Title classes for different layouts based on tags with or without offset section
const titleClasses = {
  'layout-1-col': {
    offset: { h2: 'display-03' },
  },
  'layout-2-col': {
    default: { h2: 'display-03' },
    offset: { h2: 'display-03' },
  },
  'layout-3-col': {
    default: { h2: 'display-03' },
  },
  'layout-4-col': {
    default: { h2: 'title-01', h3: 'title-01' },
  },
};

const LINK_CLICK_EVENT_NAME = 'block_card_click';

// DataLayer function to generate the data layer object
function generateDataLayer(link, linkText, blockTitle) {
  if (!link || !(link instanceof HTMLElement) || link.tagName !== 'A') {
    return;
  }

  // Get link URL
  const urlLink = link.getAttribute('href');

  // Create data layer object for tracking
  const dataLayerObject = {
    event: LINK_CLICK_EVENT_NAME,
    details: {
      block_type: 'icon-text',
      card_title: blockTitle,
      url: urlLink,
      cta_text: linkText,
    },
  };

  // Set data attributes for  tracking
  link.setAttribute('data-wae-event', LINK_CLICK_EVENT_NAME);
  link.setAttribute('data-wae-block-type', dataLayerObject.details.block_type);
  link.setAttribute('data-wae-card-title', dataLayerObject.details.card_title);

  // Add click event listener
  link.addEventListener('click', () => window.digitalDataLayer.push(dataLayerObject));
}

/**
 * Decorates a single icon-and-text item block.
 */
function decorateItem(parentBlock, block, classes = []) {
  const [icon, altText, hideAltText, container] = block.children;
  if (!icon || !container) return block;

  // Icon container
  const iconContainer = createElementWithClasses('div', 'icontext-icon-container');
  const imgEl = icon.querySelector('img');
  // Only append image if it exists
  if (imgEl) {
    if (getTextContent(hideAltText) !== 'true') {
      imgEl.alt = getTextContent(altText);
    } else {
      imgEl.removeAttribute('alt');
    }
    iconContainer.appendChild(imgEl);
  }

  // Title element
  const title = container.querySelector('h2, h3, h4');
  if (title) {
    const titleClass = getTitleStyleClass(parentBlock, title.tagName, titleClasses);
    if (titleClass) title.classList.add(titleClass);
  }

  // Content container (holds title, description, bullets, links)
  const contentContainer = createElementWithClasses('div', 'icontext-content-container');
  if (title) contentContainer.appendChild(title);

  const linksContainer = createElementWithClasses('div', 'icontext-links-container');

  [...container.children]
    .filter((el) => el !== title)
    .forEach((el) => {
      if (isStandaloneLink(el)) {
        const anchor = el.firstElementChild;
        anchor.classList.add('standalone', 'body-01');
        generateDataLayer(anchor, anchor.textContent.trim(), title?.textContent?.trim());
        linksContainer.appendChild(anchor);
      } else {
        el.classList.add('icontext-description', 'body-01');
        contentContainer.appendChild(el);
      }
    });

  if (linksContainer.children.length) {
    contentContainer.appendChild(linksContainer);
  }

  // Final assembly
  block.innerHTML = '';
  block.classList.add('icon-and-text', ...classes.filter(Boolean));
  if (iconContainer.hasChildNodes()) block.append(iconContainer);
  if (contentContainer.hasChildNodes()) block.append(contentContainer);

  return block;
}

function attachTestIdToElements(block) {
  const elementsToAttach = [
    { selector: '.icontext-item', elementName: 'item' },
    { selector: 'h2, h3, h4', elementName: 'heading' },
    { selector: '.icontext-icon-container', elementName: 'image-container' },
    { selector: '.icontext-icon-container img', elementName: 'image' },
    { selector: '.icontext-description', elementName: 'body-text' },
    { selector: '.icontext-links-container', elementName: 'links-container' },
    { selector: '.icontext-links-container a', elementName: 'link' },
  ];

  elementsToAttach.forEach(({ selector, elementName }) => {
    attachTestId({ block, selector, elementName });
  });
}

/**
 * Decorates the overall container and applies layout/alignment classes.
 */
export default function decorateContainer(block) {
  const blockStyles = [];
  const iconTextItems = [];

  [...block.children].forEach((child) => {
    const text = getTextContent(child).trim();
    if (child.children.length === 1 && text) {
      blockStyles.push(text.toLowerCase());
    } else {
      iconTextItems.push(child);
    }
  });

  block.innerHTML = '';
  block.classList.add('icon-and-text-container', ...blockStyles.filter(Boolean));

  iconTextItems.forEach((item) => {
    const wrapper = createElementWithClasses('div', 'icontext-item');
    wrapper.append(decorateItem(block, item, blockStyles));
    block.append(wrapper);
  });

  // testing requirement - set attribute 'data-testid' for elements
  attachTestIdToElements(block);
}
