import PageUtilities from '../../utils/PageUtilities.js';
import Inpagenav from '../../../../blocks/in-page-nav/_in-page-nav';
import SectionJson from '../../../../models/_section';
import BlockBuilder from '../../utils/BlockBuilder.js';
import titleJson from '../../../../models/_title';

// Element selectors for In Page Navigation
const pageNavWrapper = 'main>div[data-testid="section"]>div[class="in-page-nav-wrapper"]';
const pageTitle = 'h2[id="page-nav-heading"]';
const pageLink = 'ul[class="nav-list"]';
const showMoreLink = 'button[class="show-more-button"]';
const showLessLink = 'button[aria-label="Show Less button"]';
const pageLinkList = 'li>a[class="nav-link body-01"]';

// Text for In Page Navigation
const textPage = 'On this page';
const textShowMore = 'Show more';
const textshowLess = 'Show Less';

const blockDefinition = SectionJson.definitions[0];
const pageNavDefinition = Inpagenav.definitions[0];
const titleDefinition = titleJson.definitions[0];

export default class InPageNavBlock {
  // Static method to create Anchor Section blocks with the provided properties
  static createSection(anchorSectionPropsArray, aemManager) {
    BlockBuilder.create({
      blockDefinition,
      blockProps: anchorSectionPropsArray,
      aemManager,
      resourceType: 'section',
    });
  }

  // Static method to create In Page Navigation blocks
  static createBlock(aemManager) {
    BlockBuilder.create({
      blockDefinition: pageNavDefinition,
      aemManager,
    });
  }

  // Static method to create Title block with the provided properties
  static createTitleBlock(titleProps, aemManager) {
    BlockBuilder.create({
      blockDefinition: titleDefinition,
      blockProps: titleProps,
      aemManager,
      parentResourceType: 'inside-section',
    });
  }

  // verify InPage Navigation block and Title
  static verifyInPageNavBlockandHeading() {
    cy.get(pageNavWrapper)
      .should('exist')
      .find(pageTitle)
      .should('be.visible')
      .should('have.text', textPage);
    return this;
  }

  // verify alignment of Page links with less than and more than 5 links
  static verifyInPageNavColumns() {
    cy.get(pageNavWrapper)
      .find(pageLinkList)
      .then(($links) => {
        const linkLength = $links.length;
        if (linkLength > 5) {
          cy.get(pageNavWrapper).find(pageLink).should('have.css', 'column-count', '2');
        } else {
          cy.get(pageNavWrapper).find(pageLink).should('have.css', 'column-count', '1');
        }
      });
    return this;
  }

  // verify the showMore link is visible for mobile view when Page links are more than 5
  static verifyInPageNavShowMoreLink() {
    cy.get(pageNavWrapper)
      .find(pageLinkList)
      .then(($links) => {
        const linkLength = $links.length;
        if (linkLength > 5) {
          cy.get(pageNavWrapper)
            .find(showMoreLink)
            .should('be.visible')
            .should('have.text', textShowMore)
            .click();
        } else {
          cy.get(showMoreLink).should('not.be.visible');
        }
      });
    return this;
  }

  // verify the showLess link is visible for mobile view
  static verifyInPageNavShowLessLink() {
    cy.get(pageNavWrapper)
      .find(showLessLink)
      .should('be.visible')
      .should('have.text', textshowLess);
    return this;
  }

  // set viewport
  static setViewport(widthValue, heightValue) {
    cy.viewport(widthValue, heightValue);
    return this;
  }

  // verify In Page Navigation isn't visible when excludeFromAnchorLink is off
  static verifyInPageLinkNotVisible(anchorLinkText) {
    PageUtilities.getInPageLink(anchorLinkText).should('not.exist');
    PageUtilities.getSectionByAnchorLinkText(anchorLinkText).should(
      'have.attr',
      'data-exclude-from-anchor-link',
      'true',
    );
    return this;
  }

  // verify In Page Navigation is visible when excludeFromAnchorLink is on
  static verifyPageLinksClickableandVisible(anchorLinkText) {
    PageUtilities.getInPageLink(anchorLinkText).should('be.visible').click();
    cy.url().should('include', anchorLinkText);
    return this;
  }
}
