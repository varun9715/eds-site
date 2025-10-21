import BlockBuilder from '../../utils/BlockBuilder.js';
// eslint-disable-next-line import/extensions
import videoJson from '../../../../blocks/video-player/_video-player.json';

const blockDefinition = videoJson.definitions[0];

// Element selector for VideoPlayer  Block
const videoWrapper = '[data-testid="section"]>[class="video-player-wrapper"]';
const videoPlayerBlock = '[data-testid="videoplayer-block"]';
const videoPlayerLarge = '[class="video-player large block"]';
const videoPlayerMedium = '[class="video-player medium block"]';
const youtubeFrame = 'iframe[src*="https://www.youtube.com/"]';
const youKuFrame = 'iframe[src*="https://player.youku.com/"]';
const vimeoFrame = 'iframe[src*="https://player.vimeo.com/"]';
const videoCaption = '[data-testid="videoplayer-caption"]';

export default class VideoPlayer {
  static createBlock(videoValues, aemManager) {
    BlockBuilder.create({
      blockDefinition,
      blockProps: videoValues,
      aemManager,
    });
  }

  // Static method to verify videoPlayer Frame
  static verifyVideoPlayerContent(videoPlayerSize, videoPlayerFrame, videoID) {
    cy.get(videoWrapper)
      .find(`${videoPlayerSize}${videoPlayerBlock}`)
      .then(($ele) => {
        cy.wrap($ele)
          .find(videoPlayerFrame)
          .should('be.visible')
          .invoke('attr', 'src')
          .should('include', videoID);
      });
    return this;
  }

  // verify video caption in videoPlayer Caption
  static verifyVideoCaption(videoCaptionText) {
    cy.get(videoWrapper)
      .find(videoPlayerBlock)
      .then(($ele) => {
        cy.wrap($ele)
          .find(videoCaption)
          .contains(`${videoCaptionText}`)
          .should('be.visible');
      });
    return this;
  }

  // verify Youtube Video in videoPlayer Block
  static verifyYoutubeVideo(videoID) {
    this.verifyVideoPlayerContent(videoPlayerLarge, youtubeFrame, videoID);
    return this;
  }

  // verify Youku Video in videoPlayer Block
  static verifyYoukuVideo(videoID) {
    this.verifyVideoPlayerContent(videoPlayerMedium, youKuFrame, videoID);
    return this;
  }

  // verify Vimeo Video in videoPlayer Block
  static verifyVimeoVideo(videoID) {
    this.verifyVideoPlayerContent(videoPlayerLarge, vimeoFrame, videoID);
    return this;
  }

  // verify video title in videoPlayer Block
  static verifyYouTubeTitle() {
    cy.get(youtubeFrame).then(($iframe) => {
      const iframeSrc = $iframe.attr('src');
      const url = new URL(iframeSrc);
      const iframeUrl = url.origin;

      // eslint-disable-next-line no-shadow
      cy.origin(iframeUrl, { args: { iframeSrc } }, ({ iframeSrc }) => {
        cy.visit(iframeSrc);
        const videoTitle = '[class="ytp-title-text"]';
        cy.get(videoTitle).should('be.visible');
      });
    });
    return this;
  }
}
