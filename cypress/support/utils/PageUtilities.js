/* eslint-disable class-methods-use-this */

// This utility class provides methods to interact with page objects in Cypress tests.
// we can add methods to interact with page elements, such as sections, links, etc.

class PageUtilities {
  // get the section by its anchor link text
  getSectionByAnchorLinkText(linkText) {
    return cy.get(`div.section[data-anchor-link-text="${linkText}"]`);
  }

  // get the In Page Navigation lins by its link text
  getInPageLink(linkText) {
    return cy.get(`ul[class="nav-list"]>li>a:contains("${linkText}")`);
  }
}

export default new PageUtilities();
