/* eslint-disable indent */
/* eslint-disable no-undef */
import {
  isAuthorMode,
  stringFormat,
  sortObjectByAttr,
  getUrlAndSetAltFromElement,
  setImgAltIfRequired,
} from './common-utils.js';

import { getTextContent } from './dom.js';

const SEONAME_TEMPLATE = '/as/{seoname}';
const SMARTCROP_TEMPLATE_PARAM = 'smartcrop={crop}';
const WIDTH_TEMPLATE_PARAM = 'width={width}';
const HEIGHT_TEMPLATE_PARAM = 'height={height}';
const MEDIA_FORMAT = '({widthType}-width: {width}px)';

/**
 * Fetch metadata for a DAM asset.
 */
const getAssetMetadata = async (damUrlStr, params) => {
  try {
    const headers = { cache: 'no-cache' };
    const metadataResp = await fetch(`${damUrlStr}/metadata?${params}`, headers);
    if (!metadataResp.ok) throw new Error(`HTTP error! Status: ${metadataResp.status}`);
    return await metadataResp.json();
  } catch (error) {
    console.error(`DAM Metadata API failed: ${error.message}`);
    return {};
  }
};

const buildDamUrl = (damUrl) => {
  if (!damUrl) throw new TypeError('buildDamUrl: “damUrl” is required');

  // Parse input URL
  const urlObj = new URL(damUrl, window.location.origin);
  let path = urlObj.pathname;
  let { origin } = urlObj;
  const { dam = {} } = window.eds_config ?? {};
  const {
    useAkamai = false,
    domain: akamaiDomain = '',
    url: akamaiPath = '/dynamic-assets/',
    adobePrefix = '/adobe/',
  } = dam;

  if (path.includes('/original/as/')) {
    path = path.replace('/original/as/', '/as/');
  } else if (!path.includes('/as/')) {
    path = `${path.replace(/\/$/, '')}/as/-image.avif`;
  }

  if (!isAuthorMode() && useAkamai) {
    path = path.replace(adobePrefix, dam.url ?? akamaiPath);
    origin = akamaiDomain ?? '';
  }

  const imgUrl = `${origin}${path}`;
  const urnUrl = imgUrl.replace(/(\/assets\/[^/]+).*/, '$1'); // Always end with urn ID

  // Get Asset Name
  const params = new URLSearchParams(urlObj.search);
  let filename = params?.get('assetname');
  if (!filename || !filename.includes('.')) {
    const lastSegment = path.split('/').pop();
    filename = lastSegment.includes('.') ? lastSegment : null;
  }

  return { urnUrl, imgUrl, filename };
};

/**
 * Create <source> element for <picture> based on crop data.
 */
const createSourceTag = ({
  damUrl,
  crop,
  width,
  height,
  seoname,
  urlFormat,
  params,
  type = 'image/webp',
}) => {
  const sourceEle = document.createElement('source');
  const cropUrl = stringFormat(urlFormat, {
    seoname,
    crop,
    width,
    height,
  });
  const paramStr = params?.toString() ? `&${params.toString()}` : '';
  sourceEle.setAttribute('srcset', `${damUrl}${cropUrl}${paramStr}`);
  sourceEle.setAttribute('data-sm-key', `${crop}-${width}-${height}`);
  sourceEle.setAttribute('type', type);
  sourceEle.setAttribute(
    'media',
    stringFormat(MEDIA_FORMAT, { widthType: 'min', width }),
  );

  return sourceEle;
};

/**
 * Create <img> element with metadata fallback.
 */
const createImgTag = ({ damUrl, alt = '', loading, width, height }) => {
  const imgEle = document.createElement('img');
  const attrs = {
    src: damUrl,
    alt,
    loading: loading || 'lazy',
  };
  // Removed width/height if values are 'auto'
  if (width && width !== 'auto') attrs.width = width;
  if (height && height !== 'auto') attrs.height = height;

  Object.entries(attrs).forEach(([key, val]) => imgEle.setAttribute(key, val));
  return imgEle;
};

const createNoscriptFallback = (src, alt = '') => {
  const noscript = document.createElement('noscript');
  noscript.innerHTML = `<img src="${src}" alt="${alt}" loading="lazy" />`;
  return noscript;
};

const fetchOrGetCachedMetadata = async (
  url,
  params,
  useMeta,
  globalKey = 'globalDmSmartCrops',
) => {
  if (useMeta || typeof window[globalKey] === 'undefined') {
    const metadata = await getAssetMetadata(url, params.toString());
    // if (!useMeta) -> to reduce multiple metadata API calls.
    window[globalKey] = metadata;
    return metadata;
  }
  return window[globalKey];
};

/**
 * Main: Create a <picture> tag using smart crops or metadata.
 */
const createPicTagWithOpenApi = async ({
  damUrl,
  ignoreWidth = false,
  ignoreHeight = false,
  useMeta = true,
  smartCrops = [],
  useSmartCrops = true,
  metadata,
}) => {
  if (!damUrl?.href && !damUrl?.src) {
    console.error('Invalid URL provided for DAM asset.');
    return null;
  }

  const pictureEle = document.createElement('picture');
  const params = new URLSearchParams(window.location.search);

  const { urnUrl, imgUrl, filename } = buildDamUrl(damUrl?.src || damUrl?.href);
  // Metadata fallback or fetch
  const { repositoryMetadata = {}, assetMetadata = {} } =
    metadata ?? (await fetchOrGetCachedMetadata(urnUrl, params.toString(), useMeta));
  const dcFormat = repositoryMetadata['dc:format'] || 'image/webp';
  const seoname =
    filename || assetMetadata['repo:name'] || `-${dcFormat.replace('/', '.')}`;
  const actualAlt =
    damUrl.alt || repositoryMetadata['dc:title'] || assetMetadata['repo:name'] || '';
  const actualSmartCrops = smartCrops.length ? smartCrops : repositoryMetadata.smartcrops;

  let urlFormat = SEONAME_TEMPLATE;
  const paramList = [];
  if (useSmartCrops) {
    paramList.push(SMARTCROP_TEMPLATE_PARAM);
  }
  if (Array.isArray(actualSmartCrops)) {
    paramList.push(WIDTH_TEMPLATE_PARAM, HEIGHT_TEMPLATE_PARAM);
  }
  paramList.forEach((param, idx) => {
    if (idx === 0) urlFormat += '?';
    urlFormat += `${param}`;
    if (idx < paramList.length - 1) urlFormat += '&';
  });
  if (actualSmartCrops) {
    const cropList = Array.isArray(actualSmartCrops)
      ? actualSmartCrops
      : Object.entries(sortObjectByAttr(actualSmartCrops, 'width', 'desc')).map(
          ([crop, attr]) => ({ crop, ...attr }),
        );

    cropList.forEach(({ crop, width, height }) => {
      // AVIF (optional best format) and WebP as fallback
      ['image/avif', 'image/webp'].forEach((type) => {
        const sourceTag = createSourceTag({
          damUrl: urnUrl,
          crop,
          width,
          height,
          seoname: `${seoname}.${type.split('/')[1]}`,
          urlFormat,
          params,
          type,
        });
        pictureEle.appendChild(sourceTag);
      });
    });
  }

  const img = createImgTag({
    damUrl: imgUrl,
    alt: actualAlt,
    loading: damUrl.loading,
    width: ignoreWidth ? '' : assetMetadata['tiff:ImageWidth'],
    height: ignoreHeight ? '' : assetMetadata['tiff:ImageLength'],
  });

  pictureEle.appendChild(img);
  pictureEle.appendChild(createNoscriptFallback(imgUrl, actualAlt));

  return pictureEle;
};

/**
 * Simpler variant: Render image without smart crop renditions.
 */
const createPicAndImgWithOpenApi = async ({
  damUrl,
  ignoreWidth = false,
  ignoreHeight = false,
  metadata,
}) => {
  if (!damUrl?.href && !damUrl?.src) return null;
  const pictureEle = document.createElement('picture');
  const params = new URLSearchParams(window.location.search);

  const { urnUrl, imgUrl, filename } = buildDamUrl(damUrl?.src || damUrl?.href);

  // Metadata fallback or fetch
  const { repositoryMetadata = {}, assetMetadata = {} } =
    metadata ?? (await fetchOrGetCachedMetadata(urnUrl, params.toString(), false));
  const actualAlt =
    damUrl.alt ||
    repositoryMetadata['dc:title'] ||
    assetMetadata['repo:name'] ||
    filename ||
    '';
  const img = createImgTag({
    damUrl: imgUrl,
    alt: actualAlt,
    loading: damUrl.loading,
    width: ignoreWidth ? '' : assetMetadata['tiff:ImageWidth'],
    height: ignoreHeight ? '' : assetMetadata['tiff:ImageLength'],
  });

  pictureEle.appendChild(img);
  pictureEle.appendChild(createNoscriptFallback(imgUrl, actualAlt));

  return pictureEle;
};

const dynamicMediaToPictureTag = async (node, hideAltText, smartCrops) => {
  if (!getTextContent(node) && !node.querySelector('img[src*="/adobe/assets/urn"]')) {
    return document.createElement('picture');
  }
  const damUrl = getUrlAndSetAltFromElement(node, getTextContent(node));
  const pictureEl = await createPicTagWithOpenApi({
    damUrl,
    smartCrops,
    useMeta: false,
  });

  setImgAltIfRequired(pictureEl, getTextContent(hideAltText));
  return pictureEl;
};

export {
  dynamicMediaToPictureTag,
  createPicTagWithOpenApi,
  getAssetMetadata,
  fetchOrGetCachedMetadata,
  createPicAndImgWithOpenApi,
  createSourceTag,
  createImgTag,
  buildDamUrl,
};
