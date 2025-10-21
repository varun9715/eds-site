import { getTextContent, createElementWithClasses } from '../../scripts/utils/dom.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

export default async function decorateItem(block, index) {
  const DISCLAIMER_TYPES = ['generic', 'manual', 'global'];
  const [disclaimerType, disclaimerId, disclaimerDescription] = block.children;
  const wrapperEle = createElementWithClasses('div', 'disclaimer-item-content');

  const typeText = getTextContent(disclaimerType)?.trim() || '';
  const idText = getTextContent(disclaimerId)?.trim() || '';

  const genericId = `d-generic-${index + 1}`;

  const finalId = typeText === DISCLAIMER_TYPES[0] ? genericId : idText;

  moveInstrumentation(block, wrapperEle);

  if (!wrapperEle.hasAttribute('data-disclaimer-type')) {
    wrapperEle.setAttribute('data-disclaimer-type', typeText);
  }

  if (finalId) {
    wrapperEle.setAttribute('id', finalId);
  }

  if (disclaimerDescription && disclaimerDescription.nodeType) {
    while (disclaimerDescription.firstChild) {
      wrapperEle.appendChild(disclaimerDescription.firstChild);
    }
  }

  return wrapperEle;
}
