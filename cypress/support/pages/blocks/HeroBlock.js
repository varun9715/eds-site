import BlockBuilder from '../../utils/BlockBuilder.js';
import blockJson from '../../../../blocks/hero/_hero';

const blockDefinition = blockJson.definitions[0];

// Element selectors for the Hero block
const heroBlock = '[data-testid="hero-block"]';
const heroImage = '[data-testid="hero-image"]>img';
const heroHeading = '[data-testid="hero-heading"]';
const heroLogo = '[data-testid="hero-logo"]>img';
const heroImageCaption = '[data-testid="hero-caption"]';
const heroIntroText = '[data-testid="hero-intro"]';

class Hero {
  static createBlock(heroBlockProps, aemManager) {
    BlockBuilder.create({
      blockDefinition,
      blockProps: heroBlockProps,
      aemManager,
      // resourceType: 'block', // No need to pass resourceType if it is 'block' as it is default
    });
  }

  static get root() {
    return cy.get(heroBlock);
  }

  static get image() {
    return cy.get(heroImage);
  }

  static verifyHeroBlockIsVisible(heroHeadingText) {
    cy.get(heroBlock)
      .find('[data-testid="hero-heading"]')
      .contains(heroHeadingText)
      .and('be.visible')
      .parent()
      .as('thisHeroBlock');
    return this;
  }

  static verifyHeroImage(expectedImageSrc) {
    cy.get('@thisHeroBlock')
      .find(heroImage)
      .should('be.visible')
      .should('have.attr', 'src')
      .and('include', expectedImageSrc);
    return this;
  }

  static verifyHeroImageCaptionText(expectedCaptionText) {
    cy.get('@thisHeroBlock')
      .find(heroImageCaption)
      .should('contain.text', expectedCaptionText);
    return this;
  }

  static verifyHeroImageAndCaptionIsNotPresent() {
    cy.get('@thisHeroBlock').find(heroImage).should('not.exist');
    cy.get('@thisHeroBlock').find(heroImageCaption).should('not.exist');
    return this;
  }

  static verifyHeroHeadingText(expectedHeadingText) {
    cy.get('@thisHeroBlock')
      .find(heroHeading)
      .should('contain.text', expectedHeadingText)
      .and(($element) => {
        expect($element.prop('tagName')).to.eq('H1');
      });
    return this;
  }

  static verifyHeroIntroText(expectedIntroText) {
    cy.get('@thisHeroBlock')
      .find(heroIntroText)
      .should('contain.text', expectedIntroText)
      .and('be.visible');
    return this;
  }

  static verifyHeroLogo(expectedLogoSrc) {
    cy.get('@thisHeroBlock')
      .find(heroLogo)
      .should('be.visible')
      .should('have.attr', 'src')
      .and('include', expectedLogoSrc);
    return this;
  }

  static verifyHeroLogoIsNotPresent() {
    cy.get('@thisHeroBlock').find(heroLogo).should('not.exist');
    return this;
  }
}

export default Hero;
