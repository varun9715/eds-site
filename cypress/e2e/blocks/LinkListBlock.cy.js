import linkListProps from '../../fixtures/props/linkListProps.js';
import LinkList from '../../support/pages/blocks/LinkListBlocks.js';
import AEMTestManager from '../../support/AEM/AEMTestManager.js';
import { Tags } from '../../support/tagList.js';

// Block properties - keep this in sync with the block json and use the same keys name as variables

const [linkListOne, linkListTwo, linkListThree] = linkListProps.linkListProp;
const itemBlockProperties = linkListProps.fixedLinkProp;
const itemBlockPropertiesLessThan5 = linkListProps.fixedLinkPropLessThan5;
let aemManager;

describe('Link List Automation Testing', () => {
  beforeEach(() => {
    cy.viewport(1024, 768);
    AEMTestManager.setup().then((instance) => {
      aemManager = instance;
    });
  });

  afterEach(() => {
    aemManager.teardown();
  });

  it(
    'Creates Link List Page and Verify Front end Elements - Link - Hyperlink',
    { tags: [Tags.DEV, Tags.DESKTOP] },
    () => {
      LinkList.createLinkListPageAndVerify(linkListOne, itemBlockProperties, aemManager);
    },
  );
  it(
    'Creates Link List Page and Verify Front end Elements - Link - Hyperlink - Less than 5',
    { tags: [Tags.DEV, Tags.DESKTOP] },
    () => {
      LinkList.createLinkListLessThan5PageAndVerify(
        linkListOne,
        itemBlockPropertiesLessThan5,
        aemManager,
      );
    },
  );
  it(
    'Creates Link List Page and Verify Front end Elements - Link - Simple Link',
    { tags: [Tags.DEV, Tags.DESKTOP] },
    () => {
      LinkList.createLinkListPageAndVerify(linkListTwo, itemBlockProperties, aemManager);
    },
  );
  it(
    'Creates Link List Page and Verify Front end Elements - Link - Child Link',
    { tags: [Tags.DEV, Tags.DESKTOP] },
    () => {
      LinkList.createChildLinkListPageAndVerify(linkListThree, aemManager);
    },
  );
});
