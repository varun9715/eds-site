/* eslint-disable indent */
import {
  promoteFirstChildIfExists,
  createElementWithClasses,
  isRenderableElement,
  getTextContent,
} from '../../scripts/utils/dom.js';
import {
  setImgAltIfRequired,
  getUrlAndSetAltFromElement,
  attachTestId,
} from '../../scripts/utils/common-utils.js';
import {
  createPicTagWithOpenApi,
  createPicAndImgWithOpenApi,
} from '../../scripts/utils/dam-open-apis.js';

// Smart crop presets for responsive images

const SMART_CROPS = [
  { crop: 'generic-16x5', width: '2560', height: '800' },
  { crop: 'generic-16x5', width: '1919', height: '600' },
  { crop: 'generic-16x5', width: '1510', height: '472' },
  { crop: 'hero-3x2', width: '1023', height: '512' },
  { crop: 'hero-3x2', width: '575', height: '383' },
];

export default async function decorate(block) {
  const [
    heroImageEl,
    checkImgAltEl,
    imgCaptionEl,
    heroTitleEl,
    introTextEl,
    logoImageEl,
    checkLogoAltEl,
  ] = [...block.children];

  const blockAltText = block.textContent.trim();

  // Resolve DAM asset URLs
  const [heroDamUrl, logoDamUrl] = [
    getUrlAndSetAltFromElement(heroImageEl, blockAltText),
    getUrlAndSetAltFromElement(logoImageEl, blockAltText),
  ];

  // Step 1: Load both images in parallel if URLs are valid
  const [heroImage, logoImage] = await Promise.all([
    heroDamUrl
      ? createPicTagWithOpenApi({
          damUrl: heroDamUrl,
          smartCrops: SMART_CROPS,
          useMeta: false,
        })
      : null,
    logoDamUrl
      ? createPicAndImgWithOpenApi({
          damUrl: logoDamUrl,
          ignoreWidth: true,
          ignoreHeight: true,
        })
      : null,
  ]);
  // Step 2: Promote child nodes and extract meaningful elements
  const title = promoteFirstChildIfExists(heroTitleEl)?.querySelector('h1');
  const imgAlt = promoteFirstChildIfExists(checkImgAltEl)?.textContent?.trim() || '';
  const logoAlt = promoteFirstChildIfExists(checkLogoAltEl)?.textContent?.trim() || '';
  const caption = promoteFirstChildIfExists(imgCaptionEl);
  const withCaption = caption && caption.textContent.trim() !== '';
  const intro = promoteFirstChildIfExists(introTextEl);
  const withIntro = intro && intro.textContent.trim() !== '';

  // Step 3: Set alt text if required
  setImgAltIfRequired(heroImage, imgAlt, blockAltText);
  setImgAltIfRequired(logoImage, logoAlt);

  // Step 4: Create figcaption element if caption exists
  let figCaption = null;
  if (withCaption) {
    figCaption = createElementWithClasses('figcaption', 'caption', 'hero-caption');
    figCaption.innerHTML = caption.innerHTML;
  }
  intro?.classList.add('intro');

  // testing requirement - set attribute 'data-testid' for elements
  const elementsToAttach = [
    { parentEl: heroImage, elementName: 'image' },
    { parentEl: logoImage, elementName: 'logo' },
    { parentEl: figCaption, elementName: 'caption' },
    { parentEl: title, elementName: 'heading' },
    { parentEl: intro, elementName: 'intro' },
  ];
  elementsToAttach.forEach(({ parentEl, elementName }) => {
    attachTestId({ block, parentEl, elementName });
  });

  // Step 5: Create layout wrappers
  const imageAndContentWrapper = createElementWithClasses(
    'div',
    'hero-image-and-content',
  );
  const imageWrapper = createElementWithClasses('div', 'image');
  const logoWrapper = createElementWithClasses('div', 'logo');
  const contentWrapper = createElementWithClasses('div', 'hero-content-container');
  const maxContentWrapper = createElementWithClasses('div', 'hero-content');

  // Create new figure element to wrap the image and content
  const figureWrapper = document.createElement('figure');

  // Step 6: Append renderable image/logo
  if (isRenderableElement(heroImage)) imageWrapper.append(heroImage);
  if (isRenderableElement(logoImage)) {
    logoWrapper.append(logoImage);
  }

  // Step 7: Compose content
  const heroImageSection = [imageWrapper].filter(isRenderableElement);
  const heroTextSection = [figCaption, intro].filter(isRenderableElement);

  block.classList.toggle('no-hero-image', heroImageSection.length === 0);

  if (heroTextSection.length > 0) {
    maxContentWrapper.append(...heroTextSection);
    contentWrapper.append(maxContentWrapper);
  }

  if (isRenderableElement(logoWrapper)) {
    contentWrapper.append(logoWrapper);
  }

  // Step 8: Append image and content wrappers
  block.textContent = '';
  if (title) block.append(title);

  block.append(imageAndContentWrapper);

  if (heroImageSection.length > 0) {
    if (withCaption) {
      figureWrapper.append(heroImageSection[0]);
      figureWrapper.append(figCaption);
      imageAndContentWrapper.append(figureWrapper);
      block.classList.add('with-caption');
    } else {
      imageAndContentWrapper.append(heroImageSection[0]);
    }
  }

  if (heroTextSection.length > 0 && withIntro) {
    block.classList.add('with-intro');
  }

  if (contentWrapper && getTextContent(contentWrapper)) {
    imageAndContentWrapper.append(contentWrapper);
  } else {
    block.classList.add('no-content');
  }
}
