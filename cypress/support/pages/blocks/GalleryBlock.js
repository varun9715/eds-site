import BlockBuilder from '../../utils/BlockBuilder.js';
import blockJson from '../../../../blocks/gallery/_gallery';

const blockDefinition = blockJson.definitions[0];
const blockChildDefinition = blockJson.definitions[1];
// Locators
const rootGalleryBlock = '[data-testid="gallery-block"]';
const gallerySlideLI = '[data-testid="gallery-slide"]';
const galleryPicture = '[data-testid="gallery-item"]';
const galleryImg = '[data-testid="gallery-picture-tag"]';
const pictureCaption = '[data-testid="gallery-figcaption"]';
const galleryButtonContainer = '[data-testid="gallery-slide-Nav-buttons"]';
const galleryButtonPrev = '[data-testid="gallery-slide-prev"]';
const galleryButtonNext = '[data-testid="gallery-slide-next"]';
const galleryCounter = '[data-testid="gallery-slide-counter"]';
// Command Functions and Assertions

export default class GalleryBlock {
  static createAndVerifyGallery(itemBlockProperties, aemManager, numberImage) {
    this.createBlock(aemManager);

    if (numberImage === 'single') {
      this.createChildBlock(itemBlockProperties, aemManager);
    } else {
      itemBlockProperties.forEach((itemProperty, index) => {
        cy.log(`Creating child block index: ${index}`);
        this.createChildBlock(itemProperty, aemManager);
      });
    }
  }

  static createBlock(aemManager) {
    BlockBuilder.create({
      blockDefinition,
      aemManager,
    });
    return this;
  }

  static createChildBlock(galleryImageBlockProp, aemManager) {
    BlockBuilder.create({
      blockDefinition: blockChildDefinition,
      blockProps: galleryImageBlockProp,
      aemManager,
      resourceType: 'child',
    });
    return this;
  }

  static dataBlockRoot() {
    cy.get(rootGalleryBlock).should('be.visible');
    return this;
  }

  static verifyContentWrapperSingle(itemProp) {
    cy.get(gallerySlideLI).each(($list) => {
      cy.get($list)
        .find(galleryImg)
        .should('be.visible')
        .find('img')
        .should('have.attr', 'class', itemProp.aspectRatio);
      cy.get($list)
        .find(galleryPicture)
        .find(pictureCaption)
        .should('be.visible')
        .and('contain', itemProp.caption);
      cy.get(galleryCounter).should('exist').and('contain', '1 of 1');
    });
    return this;
  }

  static verifyContentWrapperMultiple(itemProp) {
    cy.get(gallerySlideLI).each(($list, index) => {
      cy.get($list)
        .find(galleryImg)
        .should('be.visible')
        .find('img')
        .should('have.attr', 'class', itemProp[index].aspectRatio);
      cy.get($list)
        .find(pictureCaption)
        .should('be.visible')
        .and('contain', itemProp[index].caption);
      cy.get(galleryButtonContainer)
        .find(galleryCounter)
        .should('contain', `${index + 1} of`);
      cy.get(galleryButtonContainer)
        .find(galleryButtonNext)
        .click({ waitForAnimations: true });
    });
    return this;
  }

  static verifyNavButtonisDisplayed() {
    cy.get(galleryButtonContainer)
      .should('be.visible')
      .then(() => {
        cy.get(galleryButtonPrev).should('be.visible');
        cy.get(galleryButtonNext).should('be.visible');
      });
    return this;
  }
}
