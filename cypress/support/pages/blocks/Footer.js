// Import Props
import footerProps from '../../../fixtures/props/footerProps.js';
// Element selectors for the Footer section
const footerBlock = '[data-testid="footer-block"]';
const footerLogoBlock = '[data-testid="logo-block"] > a';
const backToTopLink = '[data-testid="section"]>[class="back-to-top-link body-02"]';
const connectWithUsHeading = '[data-testid="menu-heading"]';
const footerCopyright = '[class="section footer-copyright"][data-testid="section"]';
const footerAcknowledgement =
  '[class="footer-acknowledgement-container"]>[data-testid="section"]>[class="default-content-wrapper caption"]>[data-testid="text-block"]';
const socialMediaIcons =
  '[id="menu-list-connect-with-us-with-fb"][data-testid="menu-list"]>li>a';
const aboutUsLinksLocator =
  '[data-testid="menu-list"][id="menu-list-about-us-with-about-qantas"]';
const menuHorizontalLinks = '[data-testid="menu-list"]>li>a';
// Mobile/Tablet View
const accordionToggle =
  '[data-testid="menu-accordion-toggle"]>[class="menu-accordion-label"]';

export default class Footer {
  static verifyFooterIsDisplayed() {
    cy.get(footerBlock).should('exist').and('be.visible');
    return this;
  }

  static verifyFooterLogoIsDisplayed() {
    cy.get(footerBlock)
      .find(footerLogoBlock)
      .and('be.visible')
      .and('have.attr', 'href')
      .and('include', 'qantas.com');
    return this;
  }

  static verifyBackToTopLink() {
    cy.get(footerBlock)
      .find(backToTopLink)
      .should('be.visible')
      .and('have.attr', 'href')
      .and('include', '#main-content');
    return this;
  }

  static verifyConnectWithUsDisplayed() {
    cy.get(footerBlock)
      .find(connectWithUsHeading)
      .contains('Connect with us')
      .scrollIntoView()
      .should('exist')
      .and('be.visible');
    return this;
  }

  static verifyFooterCopyright() {
    cy.get(footerCopyright).should('contain.text', footerProps.copyrightText);
    return this;
  }

  static verifyFooterAcknowledgement() {
    cy.get(footerAcknowledgement).should('exist').and('be.visible');
    return this;
  }

  static validateLinksOnFooter(linksArray, selector) {
    linksArray.forEach(({ linkName }) => {
      cy.get(selector).contains('a', linkName).should('have.attr', 'href');
    });
  }

  static validateSocailMediaLinks() {
    cy.get(socialMediaIcons).each(($el) => {
      cy.wrap($el).should('have.attr', 'href');
    });
    return this;
  }

  static validateAboutUSLink() {
    this.validateLinksOnFooter(footerProps.aboutUSLinks, aboutUsLinksLocator);
    return this;
  }

  static validateMenuHorizontalBlockLink() {
    this.validateLinksOnFooter(footerProps.menuHorizontalBlockLinks, menuHorizontalLinks);
    return this;
  }

  static verifyFooterInMobileView() {
    return cy.get(accordionToggle).contains(footerProps.aboutUsAccordionLabel).click();
  }

  static verifyFooterDetails() {
    this.verifyFooterIsDisplayed();
    this.verifyFooterLogoIsDisplayed();
    this.verifyBackToTopLink();
    this.verifyConnectWithUsDisplayed();
    this.verifyFooterCopyright();
    this.verifyFooterAcknowledgement();
    this.validateSocailMediaLinks();
    this.validateAboutUSLink();
    this.validateMenuHorizontalBlockLink();

    return this;
  }
}
