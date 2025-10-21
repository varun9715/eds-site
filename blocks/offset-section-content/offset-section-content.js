import { createElementWithClasses } from '../../scripts/utils/dom.js';
import {
  EVENT_NAME,
  triggerLinkClickEventFromElement,
} from '../../scripts/martech/datalayer.js';

export default function decorate(block) {
  const metadataTemplates = {};
  block.querySelectorAll(':scope > div').forEach((row) => {
    const [keyEl, valEl] = row.children;
    if (!keyEl || !valEl) return;

    const key = keyEl.textContent.trim().toLowerCase();
    metadataTemplates[key] = valEl;
  });

  // Create container for the offset content
  const offsetContentContainer = createElementWithClasses(
    'div',
    'offset-content-container',
  );

  // Build structured content parts
  const headingHTML = metadataTemplates.heading.innerHTML.trim() || '';
  const textHTML = metadataTemplates.text
    ? `<div class="offset-content-text">${metadataTemplates.text.innerHTML.trim()}</div>`
    : '';
  const ctaList = [];

  // Links
  const buildLinkElement = (linkEl) => {
    const anchorEl = linkEl?.querySelector('a');
    if (!anchorEl) return '';
    // Get link text and URL
    anchorEl.classList.add('standalone');

    anchorEl.setAttribute('data-wae-event', EVENT_NAME.LINK_CLICK);
    anchorEl.setAttribute('data-wae-block-type', 'offset_section_content');

    anchorEl.addEventListener('click', () => triggerLinkClickEventFromElement(anchorEl));
    anchorEl.classList.add('standalone');
    return anchorEl.outerHTML.trim();
  };

  if (metadataTemplates.cta1) ctaList.push(buildLinkElement(metadataTemplates.cta1));
  if (metadataTemplates.cta2) ctaList.push(buildLinkElement(metadataTemplates.cta2));
  const ctaHTML = ctaList.length
    ? `<div class="cta-links-container">${ctaList.join('')}</div>`
    : '';

  // Inject new HTML into the block
  block.innerHTML = `${headingHTML}${textHTML}${ctaHTML}`;

  // Move block and default content wrapper into a new container
  const section = block.closest('[data-type="offset-section"]');

  if (section) {
    // Get offset section content wrapper
    const offsetSectionContentWrapper = section.querySelector(
      '.offset-section-content-wrapper',
    );
    // Get the default content wrapper
    const sectionDefaultContentContainer = createElementWithClasses(
      'div',
      'section-default-content-container',
    );

    sectionDefaultContentContainer.append(...section.children);

    offsetContentContainer.append(
      offsetSectionContentWrapper,
      sectionDefaultContentContainer,
    );
    section.innerHTML = '';
    section.append(offsetContentContainer);

    // Move anchor section URL to the block
    const anchor = section.querySelector('.anchor-wrapper');
    if (anchor) {
      section.appendChild(anchor);
    }
  }
}
