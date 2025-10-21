import TextJson from '../../../../models/_text';
import BlockBuilder from '../../utils/BlockBuilder.js';

// Element selectors for Text Block
const textBlockContentWrapper =
  '[data-testid="section"]>[class="default-content-wrapper"]';
// const titleBlock = '[data-testid="title-block"]';
// const textBlock = '[data-testid="text-block"]';
const paragraphDiv = 'p[data-testid="text-block"]';
const textHeadingOne = 'h1[data-testid="title-block"]';
const textHeadingThree = 'h3[data-testid="title-block"]';
const textHeadingSix = 'h6[data-testid="title-block"]';
const unorderedlistBullet = 'ul[data-testid="text-block"]';
const orderedListBullet = 'ol[data-testid="text-block"]';
const italicizedText = '[data-testid="text-block"] > em';
const underlinedText = '[data-testid="text-block"] > u';
const superText = '[data-testid="text-block"] > sup';
const subText = '[data-testid="text-block"] > sub';
const hyperlink = 'a';

const blockDefinition = TextJson.definitions[0];

// Get element selectors
export default class TextBlock {
  static createBlock(blockProps, aemManager) {
    BlockBuilder.create({
      blockDefinition,
      blockProps,
      aemManager,
      // resourceType: 'block', // No need to pass resourceType if it is 'block' as it is default
    });
  }

  static get root() {
    return cy.get(textBlockContentWrapper).first(); // Get Text Block Content Wrapper
  }

  static verifyTextBlockIsVisible() {
    this.root.should('be.visible');
    return this;
  }

  // Element actions and assertions.

  static verifyVisibilityFormatAndContent(element, expectedText) {
    cy.get(element)
      .should('be.visible')
      .invoke('text')
      .then((innerText) => {
        expect(innerText).to.contain(expectedText);
      });
  }

  static verifyTextHeaderIsVisible(headerOneText, headerThreeText, headerSixText) {
    this.verifyVisibilityFormatAndContent(textHeadingOne, headerOneText);
    this.verifyVisibilityFormatAndContent(textHeadingThree, headerThreeText);
    this.verifyVisibilityFormatAndContent(textHeadingSix, headerSixText);

    return this;
  }

  static verifyTextParagraphContent() {
    // get and assert Paragraph Text
    cy.get(paragraphDiv).should('be.visible');
    return this;
  }

  static verifyBullet() {
    // get and assert bullet lists
    cy.get(unorderedlistBullet).should('be.visible');
    cy.get(orderedListBullet).should('be.visible');
    return this;
  }

  static verifyTextFormatting(subScriptText, superScriptText, italicText, underlineText) {
    // get and assert text formatting
    this.verifyVisibilityFormatAndContent(subText, subScriptText);
    this.verifyVisibilityFormatAndContent(superText, superScriptText);
    this.verifyVisibilityFormatAndContent(italicizedText, italicText);
    this.verifyVisibilityFormatAndContent(underlinedText, underlineText);

    return this;
  }

  static verifyHyperLink(hyperLinkText, linkURL) {
    // get and assert hyperlink button
    cy.get(textBlockContentWrapper)
      .find(hyperlink)
      .contains(hyperLinkText)
      .should('be.visible')
      .and('have.attr', 'href', linkURL);
    return this;
  }
}
