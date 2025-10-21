// Element selectors for Anchor Section
import PageUtilities from '../../utils/PageUtilities.js';
import blockJson from '../../../../models/_section';
import BlockBuilder from '../../utils/BlockBuilder.js';
import titleJson from '../../../../models/_title';

const backtoTop = "a[class='back-to-top-link body-02']";
const mainContent = '#main-content';
const blockDefinition = blockJson.definitions[0];
const titleDefinition = titleJson.definitions[0];

export default class AnchorSection {
  // Static method to create Anchor Section blocks with the provided properties
  static createSection(anchorSectionPropsArray, aemManager) {
    BlockBuilder.create({
      blockDefinition,
      blockProps: anchorSectionPropsArray,
      aemManager,
      resourceType: 'section',
    });
  }

  // Static method to create Title block with the provided properties
  static createBlock(titleProps, aemManager) {
    BlockBuilder.create({
      blockDefinition: titleDefinition,
      blockProps: titleProps,
      aemManager,
      parentResourceType: 'inside-section',
    });
  }

  // verify Back to Top link isn't exist when showBacktoLink is off
  static verifyBacktoTopLinkNotVisible(anchorLinkText) {
    PageUtilities.getSectionByAnchorLinkText(anchorLinkText)
      .find(backtoTop)
      .should('not.exist');
    return this;
  }

  // Verify Back to Top link is exist & navigate to main content
  static verifyBacktoTopLinkIsVisible(anchorLinkText) {
    PageUtilities.getSectionByAnchorLinkText(anchorLinkText)
      .should('have.attr', 'data-show-back-to-link', 'true')
      .find(backtoTop)
      .should('be.visible')
      .click();
    cy.url().should('include', mainContent);
    return this;
  }

  // Verify data-exclude-from-anchor-link is true
  static verifyDataExcludeFromAnchorLink(anchorLinkText) {
    PageUtilities.getSectionByAnchorLinkText(anchorLinkText)
      .should('have.attr', 'data-show-back-to-link', 'true')
      .and('have.attr', 'data-exclude-from-anchor-link', 'true')
      .find(backtoTop)
      .should('be.visible')
      .click();
    cy.url().should('include', mainContent);
    return this;
  }
}
