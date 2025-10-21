import {
  EVENT_NAME,
  triggerLinkClickEventFromElement,
} from '../../scripts/martech/datalayer.js';

function generateDataLayer(anchor, img) {
  anchor.dataset.waeEvent = EVENT_NAME.LINK_CLICK;
  anchor.dataset.waeLink = img.alt || '';
  anchor.dataset.waeModule = 'App Download';

  anchor.addEventListener('click', () => triggerLinkClickEventFromElement(anchor));
}

function generateTestIds(anchor, img) {
  anchor.dataset.testid = 'appdownload-link';
  img.dataset.testid = 'appdownload-image';
}

export default async function decorate(block) {
  // Apply testid to the block
  block.setAttribute('data-testid', 'app-download');

  const items = [];

  [...block.children].forEach((child) => {
    const img = child.querySelector('img');
    const anchor = child.querySelector('a');

    if (img && anchor) {
      anchor.replaceChildren(img);
      generateDataLayer(anchor, img);
      generateTestIds(anchor, img);
      items.push(anchor);
    }
  });

  block.replaceChildren(...items);
}
