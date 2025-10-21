import AEMTestManager from '../../support/AEM/AEMTestManager.js';
import TextBlock from '../../support/pages/blocks/TextBlock.js';
import textProps from '../../fixtures/props/textProp.js';
import { Tags } from '../../support/tagList.js';

// Importing text properties from the fixture
// and destructuring the values
const {
  headerOneText,
  headerThreeText,
  headerSixText,
  italicText,
  underlineText,
  superScriptText,
  subsScriptText,
  hyperLinkText,
  urlLink,
} = textProps.textPropValues;

const text = textProps.inputText;
const blockProperties = {
  text,
};

let aemManager;

describe('Text Block Test', () => {
  beforeEach(() => {
    AEMTestManager.setup().then((instance) => {
      aemManager = instance;
    });
  });

  afterEach(() => {
    aemManager.teardown();
  });

  it(
    'Create Text Block and Verify Page contents',
    { tags: [Tags.DEV, Tags.DESKTOP] },
    () => {
      // Create the Text block with the mapped properties
      TextBlock.createBlock(blockProperties, aemManager);

      // Publish the page and visit it
      aemManager.publishPage();
      aemManager.visitPage();

      // Verify the Text Block is visible and contains the expected content
      TextBlock.verifyTextBlockIsVisible()
        .verifyTextHeaderIsVisible(headerOneText, headerThreeText, headerSixText)
        .verifyTextParagraphContent()
        .verifyBullet()
        .verifyTextFormatting(subsScriptText, superScriptText, italicText, underlineText)
        .verifyHyperLink(hyperLinkText, urlLink);
    },
  );
});
