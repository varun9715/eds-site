import BlockBuilder from '../../utils/BlockBuilder.js';
import blockJson from '../../../../blocks/in-page-alert/_in-page-alert';

const blockDefinition = blockJson.definitions[0];
const textContent = '[data-testid="inpagealert-text-content"]';
const caption = '[data-testid="inpagealert-caption"]';
const alertConfig = {
  alert: {
    selector: '[data-testid="inpagealert-type-alert"]',
    backgroundImage: 'icon_notification_warning.svg',
    backgroundColour: 'rgb(255, 243, 216)',
  },
  information: {
    selector: '[data-testid="inpagealert-type-information"]',
    backgroundImage: 'icon_notification_info.svg',
    backgroundColour: 'rgb(222, 250, 249)',
  },
};

export default class InPageAlertBlock {
  static createBlock(blockProps, aemManager) {
    BlockBuilder.create({
      blockDefinition,
      blockProps,
      aemManager,
    });
  }

  static verifyAlertIsVisible(alertType) {
    const config = alertConfig[alertType];
    cy.get(config.selector)
      .should('be.visible')
      .should('have.css', 'background-color', config.backgroundColour);
    return this;
  }

  static verifyAlertBlockContents(alertType, captionText, hyperLinkText, linkURL) {
    const config = alertConfig[alertType];
    cy.get(config.selector)
      .should('be.visible')
      .within(() => {
        cy.get(textContent)
          .should('exist')
          .within(() => {
            cy.get(caption).should('have.text', captionText);
            cy.get('a')
              .should('have.attr', 'href', linkURL)
              .and('have.text', hyperLinkText);
          });
      });

    cy.get(config.selector).then(($el) => {
      const win = $el[0].ownerDocument.defaultView;
      const before = win.getComputedStyle($el[0], '::before');
      const bgImage = before.getPropertyValue('background-image');
      expect(bgImage).to.contain(config.backgroundImage);
    });
  }
}
