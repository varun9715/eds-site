import { promoteFirstChildIfExists } from '../../scripts/utils/dom.js';
import { attachTestId } from '../../scripts/utils/common-utils.js';

function attachTestIdToElements(block) {
  const elementsToAttach = [
    { selector: '.in-page-alert--information', elementName: 'type-information' },
    { selector: '.in-page-alert--alert', elementName: 'type-alert' },
    { selector: '.in-page-alert-text-content', elementName: 'text-content' },
    { selector: '.caption', elementName: 'caption' },
  ];

  elementsToAttach.forEach(({ selector, elementName }) => {
    attachTestId({ block, selector, elementName });
  });
}

export default function decorate(block) {
  const [alertStatusType, alertText, alertCaption] = block.children;
  const alertType = alertStatusType?.textContent?.trim() || '';
  const captionText = alertCaption?.textContent?.trim() || '';

  // Setting static classnames to avoid a CodeQL warning
  function getAlertClass(alert) {
    if (alert === 'information') return 'in-page-alert--information';
    return 'in-page-alert--alert';
  }

  block.innerHTML = `
    <div class="${getAlertClass(alertType)}" role="status">
      <div class="in-page-alert-text-content">
        <div class="in-page-alert--content body-02">${alertText ? promoteFirstChildIfExists(alertText).innerHTML : ''}</div>
        ${captionText ? `<div class="caption">${captionText}</div>` : ''}
      </div>
    </div>
  `;

  // testing requirement - set attribute 'data-testid' for elements
  attachTestIdToElements(block);
}
