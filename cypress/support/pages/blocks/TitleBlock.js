import blockJson from '../../../../models/_title';
import BlockBuilder from '../../utils/BlockBuilder.js';

const blockDefinition = blockJson.definitions[0];

// Element selectors for the Hero block
const contentWrapper = '[data-testid="section"]>[class="default-content-wrapper"]';
const titleElement = '[data-testid="title-block"]';

export default class TitleBlock {
  // Create a Title block with the provided properties
  static createBlock(blockProps, aemManager) {
    BlockBuilder.create({
      blockDefinition,
      blockProps,
      aemManager,
      // resourceType: 'block', // No need to pass resourceType if it is 'block' as it is default
    });
  }

  // Verify the title block - TitleType(h2,h3,h4) and title text
  static verifyTitleBlock(titleItem) {
    cy.get(contentWrapper)
      .find(`${titleElement}${titleItem.titleType}`)
      .should('be.visible')
      .should('have.text', titleItem.title);
  }
}
