import BlockBuilder from '../../utils/BlockBuilder.js';
import blockJson from '../../../../blocks/icon-and-text-container/_icon-and-text-container';
import sectionJson from '../../../../models/_section';
import iconAndTextSectionProp from '../../../fixtures/props/iconAndTextProps.js';

const blockDefinition = blockJson.definitions[0];
const blockChildDefinition = blockJson.definitions[1];
const sectionDefinition = sectionJson.definitions[0];
const dataBlock = '[data-testid="iconandtextcontainer-block"]';
const rootContainer = '[class="icontext-item"]';
const iconHeading = '[data-testid="iconandtextcontainer-heading"]';
const iconDisplay = '[data-testid="iconandtextcontainer-image"]';
const iconTextDescription = '[data-testid="iconandtextcontainer-body-text"]';
const iconTextLink = '[data-testid="iconandtextcontainer-links-container"]';

// Command Functions and Assertions

export default class IconTextBlock {
  static createBlockandChild(containerBlockProperty, itemBlockProperties, aemManager) {
    BlockBuilder.create({
      blockDefinition: sectionDefinition,
      blockProps: iconAndTextSectionProp,
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
        resourceType: 'child', // No need to pass resourceType if it is 'block' as it is default
        parentResourceType: 'inside-section',
      });
    });
  }

  static createAndVerifyIconText(
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
      containerBlockProperty.classes,
      containerBlockProperty.alignment,
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
      resourceType: 'child', // No need to pass resourceType if it is 'block' as it is default
    });
    return this;
  }

  static dataBlockRoot(numCol, iconAlignment) {
    cy.get(dataBlock)
      .should('be.visible')
      .invoke('attr', 'class')
      .then(($el) => {
        expect($el).to.contain(numCol);
        expect($el).to.include(iconAlignment);
      });
    return this;
  }

  static verifyContentWrapper(itemProp) {
    cy.get(rootContainer).each(($el, index) => {
      cy.get($el).find(iconDisplay).should('be.visible');
      cy.get($el)
        .find(iconHeading)
        .should('be.visible')
        .and('contain', itemProp[index].item_heading);
      cy.get($el)
        .find(iconTextDescription)
        .should('be.visible')
        .and('contain', itemProp[index].item_description);
      cy.get($el)
        .find(iconTextLink)
        .should('be.visible')
        .find('a')
        .should('have.attr', 'href', itemProp[index].item_cta1);
    });
  }
}
