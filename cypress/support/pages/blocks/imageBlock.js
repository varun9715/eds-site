import BlockBuilder from '../../utils/BlockBuilder.js';
import imageJson from '../../../../blocks/image/_image';

const imageBlockDefinition = imageJson.definitions[0];

// Locator Image Block Only
const imageBlockRoot = '[data-testid="image-block"]';
const imageItem = '[data-testid="image-item"]';
const imagePicture = '[data-testid="image-picture-tag"]';
const imageCaption = '[data-testid="image-figcaption"]';

// Command Functions and Assertions

export default class ImageBlock {
  static createBlock(imageBlockProp, aemManager) {
    BlockBuilder.create({
      blockDefinition: imageBlockDefinition,
      blockProps: imageBlockProp,
      aemManager,
    });
  }

  static verifyImageBlock(itemProp) {
    cy.get(imageBlockRoot).each(($list, index) => {
      cy.get($list).should('be.visible');
      cy.get($list)
        .find(imageItem)
        .find(imagePicture)
        .should('be.visible')
        .find('img')
        .should('have.attr', 'class', itemProp[index].aspectRatio);
      cy.get($list)
        .find(imageItem)
        .find(imageCaption)
        .should('contain', itemProp[index].caption)
        .find('a')
        .should('have.attr', 'href', itemProp[index].link);
    });
  }
}
