/* eslint-disable indent */
import {
  createElementWithClasses,
  getTextContent,
  promoteFirstChildIfExists,
} from '../../scripts/utils/dom.js';
import { attachTestId } from '../../scripts/utils/common-utils.js';

const YOUTUBE_BASE_URL = 'https://www.youtube.com/embed';
const VIMEO_BASE_URL = 'https://player.vimeo.com/video';
const YOUKU_BASE_URL = 'https://player.youku.com/embed';

function embedVideo(URL, vid, platform) {
  let src = `${URL}/${vid}`;

  const captionParamsMap = {
    youtube: '?cc_load_policy=1',
    vimeo: '?texttrack=en-x-autogen',
    // Add more as needed
  };

  src += captionParamsMap[platform?.toLowerCase()] || '';

  const iframe = document.createElement('iframe');
  iframe.src = src;
  iframe.title = `Content from ${platform}`;
  iframe.loading = 'lazy';
  iframe.allowFullscreen = true;
  iframe.style.cssText =
    'width: 100%; height: 100%; position: absolute; top: 0; left: 0; bottom: 0; right: 0; border: none; border-radius: inherit;';
  iframe.setAttribute(
    'allow',
    'fullscreen; encrypted-media; accelerometer; gyroscope; picture-in-picture',
  );

  return iframe;
}

const loadVideoEmbed = (block, channelName, vid, caption) => {
  // Defensive: do not load if no video ID
  if (!vid) return;
  // Skip if already loaded
  if (block.dataset.embedLoaded === 'true') {
    return;
  }
  // Create caption element if caption exists
  const video = createElementWithClasses('div', 'video-frame');
  const videoCaption = createElementWithClasses('div', 'caption');

  switch (channelName) {
    case 'youtube':
      video.appendChild(embedVideo(YOUTUBE_BASE_URL, vid, channelName));
      break;

    case 'vimeo':
      video.appendChild(embedVideo(VIMEO_BASE_URL, vid, channelName));
      break;

    case 'youku':
      video.appendChild(embedVideo(YOUKU_BASE_URL, vid, channelName));
      break;

    default:
      break;
  }

  // Replace original content with final structure
  videoCaption.append(caption);
  block.append(video);
  if (caption) block.append(videoCaption);
};

function attachTestIdToElements(block) {
  const elementsToAttach = [
    { selector: '.video-frame', elementName: 'iframe' },
    { selector: '.caption', elementName: 'caption' },
  ];

  elementsToAttach.forEach(({ selector, elementName }) => {
    attachTestId({ block, selector, elementName });
  });
}

export default async function decorate(block) {
  const [channelName, vid, captionElement] = [...block.children];

  // Promote child nodes and extract meaningful elements
  const title = promoteFirstChildIfExists(channelName);
  const selectedChannel = getTextContent(title);
  const Id = promoteFirstChildIfExists(vid);
  const videoId = getTextContent(Id);
  const caption = promoteFirstChildIfExists(captionElement)?.querySelector('p');

  block.textContent = '';
  block.dataset.embedLoaded = false;

  // Only load if both channel and videoId are present and non-empty
  if (selectedChannel && videoId) {
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        observer.disconnect();
        loadVideoEmbed(block, selectedChannel, videoId, caption);

        // testing requirement - set attribute 'data-testid' for elements
        attachTestIdToElements(block);
      }
    });
    observer.observe(block);
  }
}
