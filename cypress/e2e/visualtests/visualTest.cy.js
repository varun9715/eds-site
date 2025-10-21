/* eslint-disable no-unused-vars */
import AEMTestManager from '../../support/AEM/AEMTestManager.js';
import TitleBlock from '../../support/pages/blocks/TitleBlock.js';
import TextBlock from '../../support/pages/blocks/TextBlock.js';
import LinkList from '../../support/pages/blocks/LinkListBlocks.js';
import Hero from '../../support/pages/blocks/HeroBlock.js';
import IconTextBlock from '../../support/pages/blocks/IconAndTextBlock.js';
import ImageTextBlock from '../../support/pages/blocks/ImageAndTextBlock.js';
import VideoPlayer from '../../support/pages/blocks/VideoPlayer.js';
import { Tags } from '../../support/tagList.js';

/* Prop Imports */
import titleProps from '../../fixtures/props/TitleProps.js';
import textProps from '../../fixtures/props/textProp.js';
import linkListProps from '../../fixtures/props/linkListProps.js';
import { heroAllData } from '../../fixtures/props/heroProps.js';
import iconAndTextProps from '../../fixtures/props/iconAndTextProps.js';
import imageandtextProps from '../../fixtures/props/imageandtextProps.js';
import { youtubeLarge } from '../../fixtures/props/videoPlayerProps.js';

/* Prop Definitions */
const titleBlockProps = titleProps[0];
const text = textProps.inputText;
const textblockProperties = {
  text,
};
const linkListProp = linkListProps.linkListProp[2];
const twocColumnIconandText = iconAndTextProps.colType[0];
const iconandTextitemBlockProperties = iconAndTextProps.blockProp;
const twoColumnImageandText = imageandtextProps.colType[0];
const imageandTextitemBlockProperties = imageandtextProps.blockProp;

let aemManager;

describe('Visual Test', () => {
  beforeEach(() => {
    AEMTestManager.setup().then((instance) => {
      aemManager = instance;
    });
  });

  afterEach(() => {
    aemManager.teardown(); // Unpublish and Delete Page
  });

  it('Create All Blocks and Publish page', { tags: [Tags.DEV, Tags.DESKTOP] }, () => {
    TitleBlock.createBlock(titleBlockProps, aemManager);
    TextBlock.createBlock(textblockProperties, aemManager);
    LinkList.createBlock(linkListProp, aemManager);
    Hero.createBlock(heroAllData, aemManager);
    VideoPlayer.createBlock(youtubeLarge, aemManager);
    IconTextBlock.createBlockandChild(
      twocColumnIconandText,
      iconandTextitemBlockProperties,
      aemManager,
    );
    ImageTextBlock.createBlockandChild(
      twoColumnImageandText,
      imageandTextitemBlockProperties,
      aemManager,
    );

    // publish and visit page
    aemManager.publishPage();
    aemManager.visitPage();
  });
});
