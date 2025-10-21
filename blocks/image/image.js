import {
  promoteFirstChildIfExists,
  createElementWithClasses,
} from '../../scripts/utils/dom.js';
import {
  getUrlAndSetAltFromElement,
  setImgAltIfRequired,
  attachTestId,
} from '../../scripts/utils/common-utils.js';
import {
  createPicTagWithOpenApi,
  createPicAndImgWithOpenApi,
  fetchOrGetCachedMetadata,
  buildDamUrl,
} from '../../scripts/utils/dam-open-apis.js';

// Smart crops for gallery image
const IMAGE_SMART_CROPS = [
  { crop: 'generic-16x9', width: '1280', height: '720' },
  { crop: 'generic-16x9', width: '1087', height: '611' },
  { crop: 'generic-16x9', width: '1023', height: '575' },
  { crop: 'generic-16x9', width: '575', height: '323' },
  { crop: 'generic-3x2', width: '624', height: '416' },
  { crop: 'generic-3x2', width: '527', height: '351' },
  { crop: 'generic-3x2', width: '1023', height: '682' },
  { crop: 'generic-3x2', width: '575', height: '383' },
  { crop: 'generic-5x4', width: '624', height: '499' },
  { crop: 'generic-5x4', width: '527', height: '422' },
  { crop: 'generic-5x4', width: '1023', height: '814' },
  { crop: 'generic-5x4', width: '575', height: '460' },
  { crop: 'generic-1x1', width: '405', height: '405' },
  { crop: 'generic-1x1', width: '341', height: '341' },
  { crop: 'generic-1x1', width: '1023', height: '1023' },
  { crop: 'generic-1x1', width: '575', height: '575' },
  { crop: 'generic-4x5', width: '624', height: '780' },
  { crop: 'generic-4x5', width: '527', height: '659' },
  { crop: 'generic-4x5', width: '1023', height: '128' },
  { crop: 'generic-4x5', width: '575', height: '718' },
];

// Mapping smart crop dropdown values with smart crops for gallery image
function getSmartCropByDropdownValue(dropdownValue) {
  const cropPart = dropdownValue.replace('smart-crop-', '');
  const [w, h] = cropPart.split('-');
  const normalized = `generic-${w}x${h}`;
  return IMAGE_SMART_CROPS.filter((obj) => obj.crop === normalized);
}

function attachTestIdToElements(block) {
  const elementsToAttach = [
    { selector: '.image-item', elementName: 'item' },
    { selector: '.image-item figure', elementName: 'figure' },
    { selector: '.image-item picture', elementName: 'picture-tag' },
    { selector: '.image-item figcaption', elementName: 'figcaption' },
  ];

  elementsToAttach.forEach(({ selector, elementName }) => {
    attachTestId({ block, selector, elementName });
  });
}

export async function buildImage(block) {
  const newImage = createElementWithClasses('div', 'image-item');

  const [imageEl, isAlternativeTextEl, aspectRatioEl, captionEl, linkEl] = [
    ...block.children,
  ];

  const aspectRatio = aspectRatioEl?.textContent?.trim();
  const imgAlt =
    promoteFirstChildIfExists(isAlternativeTextEl)?.textContent?.trim() || '';
  const isOriginal = aspectRatio === 'original';
  const blockAltText = block.textContent.trim();
  // Creating smart crop object for DAM open API
  const specificSmartCrops = aspectRatio ? getSmartCropByDropdownValue(aspectRatio) : [];
  const smartCrops =
    specificSmartCrops.length > 0 ? specificSmartCrops : IMAGE_SMART_CROPS;

  // Resolve DAM asset URLs
  const damUrl = getUrlAndSetAltFromElement(imageEl, blockAltText);

  // Add validation for damUrl
  if (!damUrl?.href) {
    return newImage; // Return empty element
  }

  const params = new URLSearchParams(window.location.search);

  try {
    const { urnUrl } = buildDamUrl(damUrl?.href || damUrl?.src);
    const metadata = await fetchOrGetCachedMetadata(urnUrl, params.toString(), true);

    // Load both images in parallel if URLs are valid
    const damOptions = {
      damUrl,
      ignoreWidth: true,
      ignoreHeight: true,
    };

    const pictureImageEl = isOriginal
      ? await createPicAndImgWithOpenApi(damOptions)
      : await createPicTagWithOpenApi({ metadata, damUrl, smartCrops });

    // Add null check for pictureImageEl
    if (!pictureImageEl) {
      console.error('Failed to create picture element');
      return newImage; // Return empty element
    }

    // Set alt text if required
    setImgAltIfRequired(pictureImageEl, imgAlt, blockAltText);

    const img = pictureImageEl.querySelector('img');

    // Add null check for img element
    if (!img) {
      console.error('No img element found in picture element');
      return newImage; // Return empty element
    }

    if (aspectRatio) {
      img.classList.add(aspectRatio);
    }

    // Create a build figcaption function
    const buildFigCaption = (caption, link) => {
      const figCaption = createElementWithClasses('figcaption', 'caption');
      // Add caption to figcaption if it exists
      if (caption?.textContent.trim()) {
        figCaption.append(promoteFirstChildIfExists(caption));
      }
      // Add link to figcaption if it exists
      if (linkEl?.querySelector('a')) {
        const linkItem = promoteFirstChildIfExists(link)?.querySelector('a');
        figCaption.append(linkItem);
      }
      return figCaption;
    };

    // if captionEl or linkEl have values then call buildFigCaption and use it
    if (captionEl?.textContent.trim() || linkEl?.querySelector('a')) {
      const figCaption = buildFigCaption(captionEl, linkEl);
      // If there's caption content, wrap in figure; otherwise just use picture
      if (figCaption.childNodes.length) {
        const figure = document.createElement('figure');
        figure.prepend(pictureImageEl);
        figure.append(figCaption);
        newImage.append(figure);
      } else {
        newImage.append(pictureImageEl);
      }
    } else {
      newImage.append(pictureImageEl);
    }
  } catch (error) {
    console.error('Error creating image:', error);
  }
  return newImage;
}

export default async function decorate(block) {
  const newImage = await buildImage(block);
  block.innerHTML = '';
  block.append(newImage);
  attachTestIdToElements(block);
}
