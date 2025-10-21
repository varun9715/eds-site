import BlockBuilder from '../../utils/BlockBuilder.js';
import blockJson from '../../../../blocks/link-list/_link-list';

const blockDefinition = blockJson.definitions[0];
const blockChildDefinition = blockJson.definitions[1];
const linkListContainer = '[data-testid="linklist-block"]';
const listLi = 'li';
const listUl = 'ul';

export default class LinkList {
  static createLinkListPageAndVerify(
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
    this.verifyLinkBlockExist().verifyLinkListContent();
  }

  static createLinkListLessThan5PageAndVerify(
    containerBlockProperty,
    itemBlockPropertiesLessThan5,
    aemManager,
  ) {
    this.createBlock(containerBlockProperty, aemManager);

    itemBlockPropertiesLessThan5.forEach((itemProperty, index) => {
      cy.log(`Creating child block index: ${index}`);
      this.createChildBlock(itemProperty, aemManager);
    });
    aemManager.publishPage();
    aemManager.visitPage();
    this.verifyLinkBlockExist().verifyLinkListContent();
  }

  static createChildLinkListPageAndVerify(containerBlockProperty, aemManager) {
    this.createBlock(containerBlockProperty, aemManager);
    aemManager.publishPage();
    aemManager.visitPage();
    this.verifyLinkBlockExist().verifyLinkListContent();
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

  static verifyLinkBlockExist() {
    cy.get(linkListContainer).should('be.visible');
    return this;
  }

  static verifyNumberOfColumns() {
    cy.get(linkListContainer)
      .find(listUl)
      .invoke('css', 'column-count')
      .then(($links) => {
        expect($links).to.be.oneOf(['1', '2', '3']);
      });
    return this;
  }

  static verifyLinkListContent() {
    this.verifyNumberOfColumns();
    cy.get(linkListContainer)
      .find(listLi)
      .find('a')
      .each(($list) => {
        expect($list).to.have.nested.attr('href');
        cy.get($list).should('be.visible');
      });
  }
}
