import AEMTestManager from '../../support/AEM/AEMTestManager.js';
import {
  youtubeLarge,
  youkuMedium,
  vimeoLarge,
} from '../../fixtures/props/videoPlayerProps.js';
import VideoPlayer from '../../support/pages/blocks/VideoPlayer.js';
import { Tags } from '../../support/tagList.js';

let aemManager;

describe('VideoPlayer Block Test', () => {
  beforeEach(() =>
    AEMTestManager.setup().then((instance) => {
      aemManager = instance;
    }),
  );

  afterEach(() => {
    aemManager.teardown();
  });

  it(
    'Create and verify VideoPlayer Block with different properties',
    { tags: [Tags.DEV, Tags.DESKTOP] },
    () => {
      // Create the VideoPlayer block with the different properties
      VideoPlayer.createBlock(youtubeLarge, aemManager);
      VideoPlayer.createBlock(youkuMedium, aemManager);
      VideoPlayer.createBlock(vimeoLarge, aemManager);
      // publish and visit page
      aemManager.publishPage();
      aemManager.visitPage();
      // Perform assertions to verify the videoPlayer block

      // verify YouKu Video in VideoPlayer Block
      VideoPlayer.verifyYoukuVideo(youkuMedium.videoId).verifyVideoCaption(
        youkuMedium.videoCaption,
      );

      // verify Vimeo Video in VideoPlayer Block
      VideoPlayer.verifyVimeoVideo(vimeoLarge.videoId).verifyVideoCaption(
        vimeoLarge.videoCaption,
      );

      // verify Youtube Video in VideoPlayer Block
      VideoPlayer.verifyYoutubeVideo(youtubeLarge.videoId)
        .verifyVideoCaption(youtubeLarge.videoCaption)
        .verifyYouTubeTitle();
    },
  );
});
