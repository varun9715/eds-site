import AEMTestManager from '../../support/AEM/AEMTestManager.js';
import TitleBlock from '../../support/pages/blocks/TitleBlock.js';
import titleProps from '../../fixtures/props/TitleProps.js';
import { Tags } from '../../support/tagList.js';

// Importing title properties from the fixture
const blockProperties = titleProps.map((title) => ({
  title: title.title,
  titleType: title.titleType,
}));

let aemManager;

describe('Title Block Test', () => {
  beforeEach(() => {
    AEMTestManager.setup().then((instance) => {
      aemManager = instance;
    });
  });

  afterEach(() => {
    aemManager.teardown();
  });

  it('Create and verify Title Block', { tags: [Tags.DEV, Tags.DESKTOP] }, () => {
    //  Create and configure three Title Block to verify the title type
    blockProperties.forEach((blockProperty) => {
      TitleBlock.createBlock(blockProperty, aemManager);
    });

    aemManager.publishPage();
    aemManager.visitPage();

    blockProperties.forEach((blockProperty) => {
      TitleBlock.verifyTitleBlock(blockProperty);
    });
  });
});
