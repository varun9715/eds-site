/* eslint-disable no-unused-vars */
import AEMTestManager from '../../support/AEM/AEMTestManager.js';
import iconAndTextProps from '../../fixtures/props/iconAndTextProps.js';
import IconTextBlock from '../../support/pages/blocks/IconAndTextBlock.js';
import { Tags } from '../../support/tagList.js';

let aemManager;

const [twoColumn, fourColumn] = iconAndTextProps.colType;
const itemBlockProperties = iconAndTextProps.blockProp;

describe('Icon and Text Container Block', () => {
  beforeEach(() => {
    AEMTestManager.setup().then((instance) => {
      aemManager = instance;
    });
  });

  afterEach(() => {
    aemManager.teardown(); // Unpublish and Delete Page
  });

  it(
    'Create 2 Column Icon and Text and Verify Content',
    { tags: [Tags.DEV, Tags.DESKTOP] },
    () => {
      IconTextBlock.createAndVerifyIconText(twoColumn, itemBlockProperties, aemManager);
    },
  );

  it(
    'Create 4 Column Icon and Text and Verify Content',
    { tags: [Tags.DEV, Tags.DESKTOP] },
    () => {
      IconTextBlock.createAndVerifyIconText(fourColumn, itemBlockProperties, aemManager);
    },
  );
});
