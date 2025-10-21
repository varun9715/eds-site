import { getTextContent } from '../../scripts/utils/dom.js';
import { attachTestId } from '../../scripts/utils/common-utils.js';
import {
  EVENT_NAME,
  triggerLinkClickEventFromElement,
} from '../../scripts/martech/datalayer.js';

// DataLayer function to generate the data layer object
function generateDataLayer(link, linkText, campaignCode) {
  if (!link || !(link instanceof HTMLElement) || link.tagName !== 'A') {
    return;
  }

  // Set data attributes for tracking
  link.setAttribute('data-wae-event', EVENT_NAME.LINK_CLICK);
  link.setAttribute('data-wae-link', linkText);
  link.setAttribute('data-wae-module', 'CTA Link');
  if (campaignCode) {
    link.setAttribute('data-wae-internal-campaign-id', campaignCode);
  }

  // Add click event listener
  link.addEventListener('click', () => triggerLinkClickEventFromElement(link));
}

function attachTestIdToElements(block) {
  const elementsToAttach = [
    { selector: '.primary', elementName: 'primary' },
    { selector: '.secondary', elementName: 'secondary' },
  ];

  elementsToAttach.forEach(({ selector, elementName }) => {
    attachTestId({ block, selector, elementName });
  });
}

// Function to create the CTALink element
function createCTALink({
  text,
  href,
  ariaLabel,
  campaignCode,
  queryParamKey,
  queryParamValue,
  type,
  styles,
}) {
  // Return if the label or URL is not present
  if (!href || !text) return '';

  let url = href;

  // Add query param if present
  if (queryParamKey && queryParamValue) {
    const separator = url.includes('?') ? '&' : '?';
    url = `${url}${separator}${queryParamKey}=${queryParamValue}`;
  }

  // Create the anchor element
  const anchor = document.createElement('a');
  anchor.classList.add('button', type);

  // Apply all styles as additional classes
  const styleValues =
    styles?.split(',').filter((style) => style && style !== 'first-cta-primary') || [];
  anchor.classList.add(...styleValues);

  // Set the href and text content
  anchor.setAttribute('href', url);
  anchor.innerText = text;

  // Set the aria-label if present
  if (ariaLabel) {
    anchor.setAttribute('aria-label', ariaLabel);
  }

  // DataLayer setup
  generateDataLayer(anchor, text, campaignCode);
  return anchor;
}

export default function decorate(block) {
  const [
    styles,
    link1Cta,
    link1AriaLabel,
    link1QueryParamKey,
    link1QueryParamValue,
    link1CampaignCode,
    link2Cta,
    link2AriaLabel,
    link2QueryParamKey,
    link2QueryParamValue,
    link2CampaignCode,
  ] = block.children;

  const getHref = (field) => {
    const href = field.querySelector('a')?.getAttribute('href') || getTextContent(field);
    return href;
  };

  const cachedValues = {
    styles: getTextContent(styles),
    link1: {
      text: getTextContent(link1Cta),
      href: getHref(link1Cta),
      ariaLabel: getTextContent(link1AriaLabel),
      queryParamKey: getTextContent(link1QueryParamKey),
      queryParamValue: getTextContent(link1QueryParamValue),
      campaignCode: getTextContent(link1CampaignCode),
    },
    link2: {
      text: getTextContent(link2Cta),
      href: getHref(link2Cta),
      ariaLabel: getTextContent(link2AriaLabel),
      queryParamKey: getTextContent(link2QueryParamKey),
      queryParamValue: getTextContent(link2QueryParamValue),
      campaignCode: getTextContent(link2CampaignCode),
    },
  };

  // Clear the block first
  block.innerHTML = '';

  // Build primary link if it exists
  if (cachedValues.link1.text && cachedValues.link1.href) {
    let primaryType = 'secondary';
    if (cachedValues.styles?.includes('first-cta-primary')) {
      primaryType = 'primary';
    }

    const primaryLink = createCTALink({
      text: cachedValues.link1.text,
      href: cachedValues.link1.href,
      ariaLabel: cachedValues.link1.ariaLabel,
      campaignCode: cachedValues.link1.campaignCode,
      queryParamKey: cachedValues.link1.queryParamKey,
      queryParamValue: cachedValues.link1.queryParamValue,
      type: primaryType,
      styles: cachedValues.styles,
    });

    if (primaryLink) {
      block.appendChild(primaryLink);
    }
  }

  // Build secondary link if it exists
  if (cachedValues.link2.text && cachedValues.link2.href) {
    const secondaryLink = createCTALink({
      text: cachedValues.link2.text,
      href: cachedValues.link2.href,
      ariaLabel: cachedValues.link2.ariaLabel,
      campaignCode: cachedValues.link2.campaignCode,
      queryParamKey: cachedValues.link2.queryParamKey,
      queryParamValue: cachedValues.link2.queryParamValue,
      type: 'secondary',
      styles: cachedValues.styles,
    });
    if (secondaryLink) {
      block.appendChild(secondaryLink);
    }
  }

  // testing requirement - set attribute 'data-testid' for elements
  attachTestIdToElements(block);
}
