export default class CardsBlock {
  static get root() {
    return cy.get('[data-block-name="cards"]');
  }

  static get image() {
    return this.root.find('img');
  }

  static get paragraph() {
    return this.root.find('p');
  }

  static verifyCardsBlockIsVisible() {
    this.root.should('be.visible');
  }

  static verifyCardsParagraphText(expectedText) {
    this.paragraph.should('be.visible').should('have.text', expectedText);
  }
}
