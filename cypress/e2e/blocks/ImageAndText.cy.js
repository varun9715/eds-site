import AEMTestManager from '../../support/AEM/AEMTestManager.js';
import imageandtextProps from '../../fixtures/props/imageandtextProps.js';
import ImageTextBlock from '../../support/pages/blocks/ImageAndTextBlock.js';
import { Tags } from '../../support/tagList.js';

const [twoColumn, threeColumn, fourColumn] = imageandtextProps.colType;
const itemBlockProperties = imageandtextProps.blockProp;
let aemManager;

describe('Image and Text Container Block', () => {
  beforeEach(() =>
    AEMTestManager.setup().then((instance) => {
      aemManager = instance;
    }),
  );

  afterEach(() => {
    aemManager.teardown(); // Unpublish and delete page
  });

  it(
    'Create 2 Column Image & Text and Verify Content',
    { tags: [Tags.DEV, Tags.DESKTOP] },
    () => {
      ImageTextBlock.createAndVerifyImageText(twoColumn, itemBlockProperties, aemManager);
    },
  );

  it(
    'Create 3 Column Image & Text and Verify Content',
    { tags: [Tags.DEV, Tags.DESKTOP] },
    () => {
      ImageTextBlock.createAndVerifyImageText(
        threeColumn,
        itemBlockProperties,
        aemManager,
      );
    },
  );

  it(
    'Create 4 Column Image & Text and Verify Content',
    { tags: [Tags.DEV, Tags.DESKTOP] },
    () => {
      ImageTextBlock.createAndVerifyImageText(
        fourColumn,
        itemBlockProperties,
        aemManager,
      );
    },
  );
});
