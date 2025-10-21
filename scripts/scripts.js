/* eslint-disable no-underscore-dangle */
/* eslint-disable import/no-cycle */
import {
  loadHeader,
  loadFooter,
  decorateIcons,
  decorateSections,
  decorateBlock,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForFirstImage,
  loadSection,
  loadSections,
  loadCSS,
  loadBlock,
  getMetadata,
  buildBlock,
  fetchPlaceholders,
} from './aem.js';
import { initialiseMartech, loadMartechEager, loadMartechDelayed, loadMartechLazy } from './martech/martech.js';
import { isAuthorMode } from './utils/common-utils.js';
import buildAutoBlocksLazy from './auto-block-lazy.js';

// -----------------------------
// Custom code start

export const ENVIRONMENT = {
  DEV: 'dev',
  PROD: 'prod',
  STAGE: 'stage',
  TEST: 'test',
  UAT: 'uat',
};

const CONTENT_ROOT_PATH = '/content/eds-site';

export async function decorateAnchorSections(main) {
  if (
    document.querySelector('[data-anchor-section-url]') &&
    document.querySelector('[data-anchor-link-text]')
  ) {
    /* eslint-disable import/no-cycle */
    const { default: buildAnchorSection } = await import('./sections/build-anchor-section.js');
    buildAnchorSection(main);
  }
}

async function loadBreadcrumbs(main) {
  const hideBreadcrumbs = getMetadata('hidebreadcrumb');
  const showBreadcrumbs = !(hideBreadcrumbs === 'true');
  const breadcrumbExists = document.querySelector('.breadcrumbs');

  if (!showBreadcrumbs || breadcrumbExists) {
    return null;
  }

  const breadcrumbsBlock = buildBlock('breadcrumbs', '');

  const section = document.createElement('div');
  section.classList.add('section');
  section.append(breadcrumbsBlock);
  main.parentNode.insertBefore(section, main);

  decorateBlock(breadcrumbsBlock);
  return loadBlock(breadcrumbsBlock);
}

/**
 * Helper function that check if It is EDS path.
 */
export function isEDSLink(linkURL) {
  return linkURL.includes(CONTENT_ROOT_PATH);
}

/**
 * Helper function that converts an AEM path into an EDS path.
 */
export function getEDSLink(aemPath) {
  let aemRoot = CONTENT_ROOT_PATH;

  if (window.hlx && window.hlx.aemRoot) {
    aemRoot = window.hlx.aemRoot;
  }

  return aemPath.replace(aemRoot, '').replace('.html', '');
}
/**
 * Helper function that adapts the path to work on EDS and AEM rendering
 */
export function getLink(edsPath) {
  return window.hlx.aemRoot && !edsPath.startsWith(window.hlx.aemRoot) && edsPath.indexOf('.html') === -1
    ? `${window.hlx.aemRoot}${edsPath}.html`
    : edsPath;
}

/**
 * Process current pathname and return details for use in language switching
 * Considers pathnames like /en-au/page and /content/eds-site/en-au/page.html
 * for both EDS and AEM
 */
export function getPathDetails() {
  const { pathname } = window.location;
  const extParts = pathname.split('.');
  const ext = extParts.length > 1 ? extParts[extParts.length - 1] : '';
  const isContentPath = pathname.startsWith('/content');
  const parts = pathname.split('/').filter(Boolean); // remove empty entries

  // Utility to safely extract language/region parts
  const safeLangGet = (index) => {
    const val = parts[index];
    return val ? val.split('.')[0].toLowerCase() : '';
  };

  let langRegion = 'en-au';

  if (window.hlx && window.hlx.isExternalSite === true) {
    // Handle third-party site with /lang/region
    // Use langregion from hlx if present and non-empty
    const hlxLangRegion = window.hlx.langregion?.toLowerCase();

    if (hlxLangRegion) {
      langRegion = hlxLangRegion;
    } else if (parts.length >= 2) {
      const ISO_2_LETTER = /^[a-z]{2}$/;
      const region = isContentPath ? safeLangGet(2) : safeLangGet(0);
      let language = isContentPath ? safeLangGet(3) : safeLangGet(1);

      // Normalize language if it contains underscore (e.g.: zh_CN -> zh)
      [language] = language.split('_');

      // Validate both language and region before assignment
      if (ISO_2_LETTER.test(language) && ISO_2_LETTER.test(region)) {
        langRegion = `${language}-${region}`;
      }
    }
  } else {
    // AEM/EDS paths
    langRegion = isContentPath ? safeLangGet(2) : safeLangGet(0);
  }

  // Split langRegion into lang and region
  const [lang, region] = langRegion.split('-');

  // substring before langRegion
  const prefix = pathname.substring(0, pathname.indexOf(`/${langRegion}`)) || '';
  const suffix = pathname.substring(pathname.indexOf(`/${langRegion}`) + langRegion.length + 1) || '';

  return {
    ext,
    prefix,
    suffix,
    langRegion,
    lang,
    region,
    isContentPath,
  };
}

export async function fetchLanguagePlaceholders(langRegion) {
  let langCode = langRegion || getPathDetails()?.langRegion || 'en-au';
  if (isAuthorMode() && langCode === 'language-masters') {
    langCode = 'en-au';
  }
  try {
    // Try fetching placeholders with the specified language
    return await fetchPlaceholders(`${window.hlx.codeBasePath}/${langCode}`);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Error fetching placeholders for lang: ${langCode}. Will try to get en placeholders`, error);
    // Retry without specifying a language (using the default language)
    try {
      return await fetchPlaceholders(`${window.hlx.codeBasePath}/en-au`);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error fetching placeholders:', err);
    }
  }
  return {}; // default to empty object
}

// Custom code end
// ------------------------------

/**
 * Moves all the attributes from a given elmenet to another given element.
 * @param {Element} from the element to copy attributes from
 * @param {Element} to the element to copy attributes to
 */
export function moveAttributes(from, to, attributes) {
  if (!attributes) {
    // eslint-disable-next-line no-param-reassign
    attributes = [...from.attributes].map(({ nodeName }) => nodeName);
  }
  attributes.forEach((attr) => {
    const value = from.getAttribute(attr);
    if (value) {
      to.setAttribute(attr, value);
      from.removeAttribute(attr);
    }
  });
}

/**
 * Move instrumentation attributes from a given element to another given element.
 * @param {Element} from the element to copy attributes from
 * @param {Element} to the element to copy attributes to
 */
export function moveInstrumentation(from, to) {
  moveAttributes(
    from,
    to,
    [...from.attributes]
      .map(({ nodeName }) => nodeName)
      .filter((attr) => attr.startsWith('data-aue-') || attr.startsWith('data-richtext-')),
  );
}

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}
/**
 * Apply fixes specific to iOS VoiceOver Screen Reader.
 * It will only be executed if the user is on an iOS device.
 */
async function loadIOSVoiceOverFixes() {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  if (isIOS) {
    const { default: applyFixes } = await import('./ios-voiceover-fixes.js');
    applyFixes();
  }
}

/**
 * Builds all synthetic blocks in a container element.
 */
function buildAutoBlocks() {
  try {
    // TODO: add auto block, if needed
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  // hopefully forward compatible button decoration
  decorateIcons(main);
  buildAutoBlocks();
  decorateSections(main);
  decorateBlocks(main);
  decorateAnchorSections(main);
}

function setNaverTags(langRegion) {
  if (langRegion === 'en-kr' || langRegion === 'ko-kr') {
    const head = document.querySelector('head');

    const metaLanguage = document.createElement('meta');
    const metaNaver = document.createElement('meta');

    metaLanguage.setAttribute('http-equiv', 'content-language');
    metaLanguage.setAttribute('content', langRegion);
    head.appendChild(metaLanguage);

    metaNaver.setAttribute('name', 'naver-site-verification');
    metaNaver.setAttribute('content', '');
    head.appendChild(metaNaver);
  }
}

function convertHyphenLocaleToUnderscore(langRegion) {
  if (!langRegion) return '';
  const parts = langRegion.split('-');
  if (parts.length !== 2) return langRegion;
  return `${parts[0]}_${parts[1].toUpperCase()}`;
}

function setOgLocale(langRegion) {
  const meta = document.createElement('meta');
  const head = document.querySelector('head');

  meta.setAttribute('property', 'og:locale');
  meta.setAttribute('content', convertHyphenLocaleToUnderscore(langRegion));
  head.appendChild(meta);
}

function setHeaderCustomFields() {
  const { langRegion, lang, region } = getPathDetails();
  setOgLocale(langRegion);
  setNaverTags(langRegion);
  if (lang && region) {
    document.documentElement.lang = `${lang}-${region.toUpperCase()}`;
  } else {
    document.documentElement.lang = 'en-AU';
  }
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  // MarTech config
  const martechLoadedPromise = initialiseMartech();

  decorateTemplateAndTheme();
  setHeaderCustomFields();
  const main = doc.querySelector('main');

  loadHeader(doc.querySelector('header'));

  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
    await Promise.all([martechLoadedPromise.then(loadMartechEager),
      loadSection(main.querySelector('.section'), waitForFirstImage)]);
  }

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  const main = doc.querySelector('main');
  const { hash } = window.location;

  loadBreadcrumbs(main);
  await loadSections(main);
  await loadFooter(doc.querySelector('footer'));
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();
  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();
  buildAutoBlocksLazy(main);
  await loadMartechLazy();
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => {
    loadIOSVoiceOverFixes();
    loadMartechDelayed();
  }, 3000);
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed(document);
}

export const getEnvFromUrl = (
  url = (typeof window !== 'undefined' ? window.location.href : '')) => {
  try {
    const { hostname } = new URL(url.toLowerCase());
    const labels = hostname.split('.');

    if (labels.includes('dev')) return ENVIRONMENT.DEV;
    if (labels.includes('test')) return ENVIRONMENT.TEST;
    if (labels.includes('uat')) return ENVIRONMENT.UAT;
    if (labels.includes('stage')) return ENVIRONMENT.STAGE;

    return ENVIRONMENT.PROD; // default fallback
  } catch (_) {
    return ENVIRONMENT.PROD; // malformed/empty URL → treat as prod
  }
};

export const getEnv = () => (getMetadata('env') || getEnvFromUrl() || ENVIRONMENT.PROD);

/* load configs */
const buildConfig = async () => {
  if (!window.eds_config) {
    const env = getEnv().toLowerCase();
    const { config } = (await import(`./config/${env}.js`));
    window.eds_config = config;
  }
};

await buildConfig();

// Load the page if it is not being called from a external site
if (!window.hlx?.isExternalSite) {
  loadPage();
}
