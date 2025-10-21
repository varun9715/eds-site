import {
  attachTestId,
  isStandaloneLink,
  getTitleStyleClass,
} from '../../scripts/utils/common-utils.js';
import { createElementWithClasses, getTextContent } from '../../scripts/utils/dom.js';

const layoutClasses = [
  'layout-1-col',
  'layout-2-col',
  'layout-3-col',
  'layout-4-col',
  'layout-4-col-center',
];

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
  'layout-4-col-center': {
    default: { h2: 'title-01', h3: 'title-01' },
  },
};

function attachTestIdToElements(block) {
  const elementsToAttach = [
    { selector: '.logo-and-text-item', elementName: 'item' },
    { selector: '.logo-and-text-title', elementName: 'heading' },
    { selector: '.logo-and-text-image', elementName: 'image' },
    { selector: '.logo-and-text-body', elementName: 'body-text' },
    { selector: '.logo-and-text-link', elementName: 'link' },
  ];

  elementsToAttach.forEach(({ selector, elementName }) => {
    attachTestId({ block, selector, elementName });
  });
}

/*
 * Decorate Logo Item
 */
async function decorateLogoTextItem(parentBlock, block) {
  const [icon, altText, hideAltText, container] = block.children;
  if (!icon || !container) return block;

  // Icon container
  const iconContainer = createElementWithClasses('div', 'logo-and-text-image');
  const imgEl = icon.querySelector('img');
  // Only append image if it exists
  if (imgEl) {
    if (getTextContent(hideAltText) !== 'true') {
      imgEl.alt = getTextContent(altText);
    } else {
      imgEl.alt = '';
    }
    iconContainer.appendChild(imgEl);
  }

  // Create final wrappers
  const contentWrapper = createElementWithClasses('div', 'logo-and-text-content');
  const descWrapperClasses = ['logo-and-text-body'];
  if (parentBlock && parentBlock.classList.contains(layoutClasses[4])) {
    descWrapperClasses.push('title-04', 'logo-and-text-logotext');
  } else {
    descWrapperClasses.push('body-01');
  }
  const descWrapper = createElementWithClasses('div', ...descWrapperClasses);
  const linkWrapper = createElementWithClasses('div', 'logo-and-text-links', 'body-01');

  let titleAssigned = false;
  const isHeading = (el) => ['H2', 'H3', 'H4'].includes(el.tagName);

  // Loop through immediate children in order
  const children = Array.from(container.childNodes).filter((n) => n.nodeType === 1);

  children.forEach((el) => {
    if (isHeading(el) && !titleAssigned) {
      // push first heading
      el.classList.add('logo-and-text-title');
      const titleClass = getTitleStyleClass(parentBlock, el.tagName, titleClasses);
      if (titleClass) {
        el.classList.add(titleClass);
      }
      contentWrapper.appendChild(el);
      titleAssigned = true;
      return;
    }
    if (isStandaloneLink(el)) {
      // push links
      const anchor = el.querySelector('a');
      if (anchor) {
        anchor.classList.add('logo-and-text-link', 'standalone');
        linkWrapper.appendChild(anchor);
      }
      return;
    }
    // push other content
    descWrapper.appendChild(el);
  });

  // Add groups to final container
  if (descWrapper.childNodes.length) contentWrapper.appendChild(descWrapper);
  if (linkWrapper.childNodes.length) contentWrapper.appendChild(linkWrapper);

  // Clear container and insert new structured content
  block.innerHTML = '';
  block.classList.add('logo-and-text-item');
  block.appendChild(iconContainer);
  block.appendChild(contentWrapper);
  return block;
}

export default async function decorate(block) {
  const logoItems = [];

  // Get styles from single row items
  [...block.children].forEach((containerItem) => {
    // If not a single row item, it's a Logo Block
    logoItems.push(containerItem);
  });

  // Decorate Logo Blocks
  const logoslistItems = await Promise.all(
    logoItems.map(async (logoItem) => {
      const logoDOM = await decorateLogoTextItem(block, logoItem);
      return logoDOM;
    }),
  );

  // Clear and append
  block.innerHTML = '';
  block.classList.add('logo-and-text');
  logoslistItems.forEach((items) => block.append(items));

  // testing requirement - set attribute 'data-testid' for elements
  attachTestIdToElements(block);
}
