export default class AboutUsLandingPage {
  static defaultSection() {
    return cy.get('.section');
  }

  static aboutUsTitle() {
    return cy.title();
  }

  static visitPage() {
    cy.visit('en-au/about-us');
  }

  static verifyTitleText(expectedText) {
    this.aboutUsTitle().should('eq', expectedText);
  }
}
