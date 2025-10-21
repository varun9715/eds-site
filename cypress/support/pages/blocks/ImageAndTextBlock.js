import BlockBuilder from '../../utils/BlockBuilder.js';
import blockJson from '../../../../blocks/image-and-text-container/_image-and-text-container';
import sectionJson from '../../../../models/_section';
import imageAndTextSectionProp from '../../../fixtures/props/imageandtextProps.js';

const blockDefinition = blockJson.definitions[0];
const blockChildDefinition = blockJson.definitions[1];
const sectionDefinition = sectionJson.definitions[0];
const dataBlock = '[data-testid="imageandtextcontainer-block"]';
const rootContainer = '[class="image-and-text"]';
const imageRibbon = '[data-testid="imageandtextcontainer-badge"]';
const imgDisplay = '[data-testid="imageandtextcontainer-image"]';
const imageCaption = '[data-testid="imageandtextcontainer-caption"]';
const imageCategory = '[data-testid="imageandtextcontainer-category"]';
const imageIntro = '[data-testid="imageandtextcontainer-intro"]';
const imageBody = '[data-testid="imageandtextcontainer-body"]';
const imageLinkContainer = '[data-testid="imageandtextcontainer-links-container"]';

// Command Functions and Assertions

export default class ImageTextBlock {
  static createBlockandChild(containerBlockProperty, itemBlockProperties, aemManager) {
    BlockBuilder.create({
      blockDefinition: sectionDefinition,
      blockProps: imageAndTextSectionProp,
      aemManager,
      resourceType: 'section',
    });
    BlockBuilder.create({
      blockDefinition,
      blockProps: containerBlockProperty,
      aemManager,
      parentResourceType: 'inside-section',
    });

    [itemBlockProperties[0], itemBlockProperties[1]].forEach((itemProperty, index) => {
      cy.log(`Creating child block index: ${index}`);
      BlockBuilder.create({
        blockDefinition: blockChildDefinition,
        blockProps: itemProperty,
        aemManager,
        resourceType: 'child',
        parentResourceType: 'inside-section',
      });
    });
  }

  static createAndVerifyImageText(
    containerBlockProperty,
    itemBlockProperties,
    aemManager,
  ) {
    this.createBlock(containerBlockProperty, aemManager);

    itemBlockProperties.forEach((itemProperty, index) => {
      cy.log(`Creating child block index: ${index}`);
      this.createChildBlock(itemProperty, aemManager);
    });

    aemManager.publishPage();
    aemManager.visitPage();

    this.dataBlockRoot(
      containerBlockProperty.columns,
      containerBlockProperty.imageAlignment,
    ).verifyContentWrapper(itemBlockProperties);
  }

  static createBlock(IconandTextBlockProps, aemManager) {
    BlockBuilder.create({
      blockDefinition,
      blockProps: IconandTextBlockProps,
      aemManager,
    });
    return this;
  }

  static createChildBlock(IconandTextBlockProps, aemManager) {
    BlockBuilder.create({
      blockDefinition: blockChildDefinition,
      blockProps: IconandTextBlockProps,
      aemManager,
      resourceType: 'child',
    });
    return this;
  }

  static dataBlockRoot(numCol, imageAlignment) {
    cy.get(dataBlock)
      .should('be.visible')
      .invoke('attr', 'class')
      .then(($el) => {
        expect($el).to.contain(numCol);
        expect($el).to.include(imageAlignment);
      });
    return this;
  }

  static verifyContentWrapper(itemProp) {
    cy.get(rootContainer).each(($el, index) => {
      cy.get($el)
        .find(imageRibbon)
        .should('be.visible')
        .and('contain', itemProp[index].ribbonText);
      cy.get($el)
        .find(imageCaption)
        .should('be.visible')
        .and('contain', itemProp[index].imageCaption);
      cy.get($el).find(imgDisplay).should('be.visible');
      cy.get($el)
        .find(imageIntro)
        .should('be.visible')
        .and('contain', itemProp[index].introText);
      cy.get($el)
        .find(imageBody)
        .should('be.visible')
        .and('contain', itemProp[index].description);
      cy.get($el)
        .find(imageCategory)
        .should('be.visible')
        .and('contain', itemProp[index].category);
      cy.get($el).find(imageLinkContainer).should('be.visible');
    });
  }
}
