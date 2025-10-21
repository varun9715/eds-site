import AEMTestManager from '../../support/AEM/AEMTestManager.js';
import imageBlockProp from '../../fixtures/props/imageProps.js';
import ImageBlock from '../../support/pages/blocks/imageBlock.js';
import { Tags } from '../../support/tagList.js';

const itemBlockProperties = imageBlockProp.imageBlockProp;
let aemManager;

describe('Gallery Container and Image Block', () => {
  beforeEach(() =>
    AEMTestManager.setup().then((instance) => {
      aemManager = instance;
    }),
  );

  afterEach(() => {
    aemManager.teardown(); // Unpublish and delete page
  });

  it(
    'Create Gallery Block with 1 Image for each Aspect Ratio',
    { tags: [Tags.DEV, Tags.DESKTOP] },
    () => {
      itemBlockProperties.forEach((iamgeBlockProp) => {
        ImageBlock.createBlock(iamgeBlockProp, aemManager);
      });
      // Publish Page
      aemManager.publishPage();
      aemManager.visitPage();
      // Verify published page
      ImageBlock.verifyImageBlock(itemBlockProperties);
    },
  );
});
