import { getContentTree, getEDSLink, getPathDetails } from './martech-utils.js';

/* -- TYPE DEFINITIONS ------------------------------------------ */

export const LINK_TYPE = {
  INTERNAL: 'INTERNAL',
  EXTERNAL: 'EXTERNAL',
};

export const MENU_TYPE = {
  MAIN: 'main',
  HEADER: 'header',
  FOOTER: 'footer',
  BREADCRUMBS: 'breadcrumbs',
  RELATED: 'related',
  CONTEXT: 'context',
};

/* -- EVENT DEFINITIONS ----------------------------------------- */

export const EVENT_NAME = {
  PAGE_VIEW: 'page_view',
  CONSENT_UPDATE: 'consent_update',

  /* -- Content Events */
  ACCORDION_CLICK: 'accordion_click',
  BANNER_CLICK: 'banner_click',
  BLOCK_CARD_CLICK: 'block_card_click',
  BLOCK_PRODUCT_CARD_CLICK: 'block_product_card_click',
  LINK_CLICK: 'link_click',
  TAB_CLICK: 'tab_click',

  /* --  Navigation Events */
  BACK_TO_TOP_CLICK: 'back_to_top_click',
  MENU_CLICK: 'menu_click',
  RETURN_HOME_CLICK: 'return_home_click',
};

/* -- DATALAYER MANAGER ----------------------------------------- */

export function initDataLayerManager(globalDataLayer) {
  let internalDataLayer = [];
  let currentState = {};

  const dataLayerListeners = [];
  const eventListeners = [];

  // Data layer functions

  function hasDataObjects(event) {
    const eventProperties = Object.keys(event);
    return (
      eventProperties.find((key) => key !== 'event' && key !== 'details') !== undefined
    );
  }

  function updateCurrentState(event) {
    const eventData = Object.fromEntries(
      Object.entries(event).filter(([key]) => key !== 'event' && key !== 'details'),
    );
    currentState = { ...currentState, ...eventData };
  }

  function triggerDataLayerUpdate() {
    dataLayerListeners.forEach((dataLayerListener) => {
      dataLayerListener.callback();
    });
  }

  function triggerDataLayerEvent(event) {
    eventListeners.forEach((eventListener) => {
      eventListener.callback(event);
    });
  }

  function processEvent(event) {
    if (hasDataObjects(event)) {
      updateCurrentState(event);
      triggerDataLayerUpdate();
    }
    triggerDataLayerEvent(event);
    return event;
  }

  function processQueue(eventQueue) {
    eventQueue.forEach((pastEvent) => {
      internalDataLayer.push(pastEvent);
    });
  }

  function applyFunctions() {
    internalDataLayer.push = (...items) => {
      items.forEach((item) => {
        processEvent(item);
      });

      return Array.prototype.push.apply(internalDataLayer, items);
    };

    internalDataLayer.getCurrentState = () => currentState;

    internalDataLayer.addEventListener = (eventType, name, callback) => {
      const listenerObject = {
        name,
        callback,
      };

      if (eventType === 'onDatalayerUpdate') {
        dataLayerListeners.push(listenerObject);
      }
      if (eventType === 'onDatalayerEvent') {
        eventListeners.push(listenerObject);
      }
    };

    internalDataLayer.removeEventListener = (eventType, name) => {
      if (eventType === 'onDatalayerUpdate') {
        const dlIndex = dataLayerListeners.findIndex(
          (listenerObject) => listenerObject.name === name,
        );
        if (dlIndex > -1) {
          dataLayerListeners.splice(dlIndex, 1);
        }
      }
      if (eventType === 'onDatalayerEvent') {
        const evtIndex = eventListeners.findIndex(
          (listenerObject) => listenerObject.name === name,
        );
        if (evtIndex > -1) {
          eventListeners.splice(evtIndex, 1);
        }
      }
    };
  }

  function initialize(dataLayer) {
    internalDataLayer = dataLayer;
    applyFunctions();

    const eventQueue = dataLayer.splice(0, dataLayer.length);
    processQueue(eventQueue);
  }

  initialize(globalDataLayer);
}

/**
 * Retrieved the lang parameter from the path details and
 * converts it into the page culture.
 *
 * @returns object Culture
 */
function getCulture() {
  const cultureCode = getPathDetails().lang;
  const parts = cultureCode ? cultureCode.split('-') : [];
  const language = parts.length > 0 ? parts[0] : null;
  const country = parts.length > 1 ? parts[1] : null;

  const culture = {
    code: cultureCode,
    country,
    language,
  };

  return culture;
}

/**
 * Retrieves the page breadcrumb information and converts it into
 * the page categories.
 *
 * @returns object Categories
 */
async function getCategories() {
  const pageTree = await getContentTree(getEDSLink(document.location.pathname));
  const categories = {};

  pageTree.forEach(({ title }, index) => {
    if (!categories.primaryCategory) {
      categories.primaryCategory = title;
    } else {
      categories[`subCategory${index}`] = title;
    }
  });
  return categories;
}

/* -- DATALAYER FUNCTIONS ----------------------------------------- */

const defaultInstanceName = 'digitalDataLayer';
let unifiedDataLayerInstanceName;

/**
 * Creates the global unifiedDataLayer object and stores the
 * datalayer instance name for future reference.
 */
export async function initialiseUnifiedDataLayer(dataLayerInstanceName) {
  unifiedDataLayerInstanceName = dataLayerInstanceName;
  window[unifiedDataLayerInstanceName] = window[unifiedDataLayerInstanceName] || [];
  return Promise.resolve(window[unifiedDataLayerInstanceName]);
}

/**
 * Get the existing data layer
 *
 * @param {string} dataLayerInstanceName
 * @returns
 */
export async function getDataLayer(dataLayerInstanceName) {
  const expectedDataLayerName =
    dataLayerInstanceName !== '' && dataLayerInstanceName !== undefined
      ? dataLayerInstanceName
      : defaultInstanceName;

  if (unifiedDataLayerInstanceName === '' || unifiedDataLayerInstanceName === undefined) {
    unifiedDataLayerInstanceName = expectedDataLayerName;
  }

  if (
    unifiedDataLayerInstanceName === defaultInstanceName &&
    unifiedDataLayerInstanceName !== expectedDataLayerName
  ) {
    unifiedDataLayerInstanceName = expectedDataLayerName;
    window[unifiedDataLayerInstanceName] = window[defaultInstanceName] || [];
  }

  return initialiseUnifiedDataLayer(unifiedDataLayerInstanceName);
}

/**
 * Pushes an event to the digitalDatalayer.
 *
 * @param {*} event EventObject
 * @returns EventObject
 */
export function dataLayerPush(event) {
  getDataLayer().then((dataLayer) => {
    dataLayer.push(event);
  });
  return event;
}

/**
 * Creates and pushes the "page_view" event.
 */
export function triggerPageViewEvent() {
  getCategories().then((pageCategories) => {
    const pageViewObject = {
      event: EVENT_NAME.PAGE_VIEW,
      page: {
        id: document.location.pathname,
        name: document.title,
        url: document.URL,
        referringUrl: document.referrer,
        version: null,
        publishDate: document.head.querySelector('meta[name="published-time"]')
          ? document.head.querySelector('meta[name="published-time"]').content
          : '',
        author: null,
        template: null,
        division: 'Qantas Airways',
        site: 'airline',
        category: pageCategories,
        culture: getCulture(),
      },
    };

    dataLayerPush(pageViewObject);
  });
}

/**
 * Creates and pushes the "consent_update" event.
 *
 * @param {*} consentUpdate Details of update from consent management platform.
 * @returns object DataLayerEvent
 */
export function triggerConsentUpdateEvent(consentUpdate) {
  const consentUpdateObject = {
    event: EVENT_NAME.CONSENT_UPDATE,
    consent: {
      necessary: consentUpdate.necessary,
      performance: consentUpdate.performance,
      functional: consentUpdate.functional,
      targeting: consentUpdate.targeting,
      socialmedia: consentUpdate.socialmedia,
    },
  };

  dataLayerPush(consentUpdateObject);
  return consentUpdateObject;
}

/**
 * Creates and pushes the "accordion_click" event.
 *
 * @param {*} accordionTitle The title of the accordion item clicked
 * @returns object DataLayerEvent
 */
export function triggerAccordionClickEvent(accordionTitle) {
  const accordionClickObject = {
    event: EVENT_NAME.ACCORDION_CLICK,
    details: {
      accordion_title: accordionTitle,
    },
  };
  dataLayerPush(accordionClickObject);
  return accordionClickObject;
}

/**
 * Creates and pushes the "banner_click" event.
 *
 * @param {*} bannerType The type of banner
 * @param {*} bannerName The title of the banner
 * @param {*} bannerPlacement The placement of the banner i.e. hero
 * @param {*} bannerCta The text of the link/button clicked, leave blank if body of banner.
 * @param {*} internalCampaignId The internal campaign linked to this banner - NOT REQUIRED
 * @returns object DataLayerEvent
 */
export function triggerBannerClickEvent(
  bannerType,
  bannerName,
  bannerPlacement,
  bannerCta,
  internalCampaignId = '',
) {
  const bannerClickObject = {
    event: EVENT_NAME.BANNER_CLICK,
    details: {
      banner_type: bannerType,
      banner_name: bannerName,
      banner_placement: bannerPlacement,
      banner_cta: bannerCta,
      internal_campaign_id: internalCampaignId,
    },
  };
  dataLayerPush(bannerClickObject);
  return bannerClickObject;
}

/**
 * Creates and pushes the "block_card_click" event.
 *
 * @param {*} blockName The name of block.
 * @param {*} cardTitle The title within the card.
 * @param {*} url The url to which the user navigates when clicking on the block.
 * @param {*} ctaText The text of the CTA clicked - NOT REQUIRED
 * @param {*} internalCampaignId The internal campaign id linked to this block - NOT REQUIRED
 * @param {*} blockPlacement The placement of the block - NOT REQUIRED
 * @returns object DataLayerEvent
 */
export function triggerBlockCardClick(
  blockName,
  cardTitle,
  url,
  ctaText = '',
  internalCampaignId = '',
  blockPlacement = '',
) {
  const blockCardClickObject = {
    event: EVENT_NAME.BLOCK_CARD_CLICK,
    details: {
      block_name: blockName,
      block_placement: blockPlacement,
      card_title: cardTitle,
      url,
      cta_text: ctaText,
      internal_campaign_id: internalCampaignId,
    },
  };
  dataLayerPush(blockCardClickObject);
  return blockCardClickObject;
}

/**
 * Creates and pushes the "block_product_card_click" event to the data layer.
 *
 * @param {*} blockName The name of block
 * @param {*} productName The name of the product within the block
 * @param {*} productVertical The vertical that owns the product
 * @param {*} url The URL to which the user navigates on click of the block.
 * @param {*} productPoints The amount of points reuired to purchase the product. - NOT REQUIRED
 * @param {*} productValue  The amount of AUD dollars required to purchase the
 *                          product. - NOT REQUIRED
 * @param {*} internalCampaignId The internal campaign id linked to this block - NOT REQUIRED
 * @param {*} blockPlacement The placement of the block - NOT REQUIRED
 * @returns
 */
export function triggerBlockProductCardClick(
  blockName,
  productName,
  productVertical,
  url,
  productPoints = '',
  productValue = '',
  internalCampaignId = '',
  blockPlacement = '',
) {
  const blockProductCardClickObject = {
    event: EVENT_NAME.BLOCK_PRODUCT_CARD_CLICK,
    details: {
      block_name: blockName,
      block_placement: blockPlacement,
      product_name: productName,
      product_vertical: productVertical,
      product_points: productPoints,
      product_value: productValue,
      url,
      internal_campaign_id: internalCampaignId,
    },
  };
  dataLayerPush(blockProductCardClickObject);
  return blockProductCardClickObject;
}

/**
 * Creates and pushes the "link_click" event to the data layer.
 *
 * @param {*} linkText The text within the link.
 * @param {*} linkUrl The URL to which the user navigates to when clicking on the link.
 * @param {*} linkType The type of link [EXTERNAL|INTERNAL]
 * @param {*} module The module in which the link exists - NOT REQUIRED
 * @param {*} internalCampaignId The internal campaign id linked to this block - NOT REQUIRED
 * @returns object DataLayerEvent
 */
export function triggerLinkClickEvent(
  linkText,
  linkUrl,
  linkType,
  module = '',
  internalCampaignId = '',
) {
  const linkClickObject = {
    event: EVENT_NAME.LINK_CLICK,
    details: {
      link_text: linkText,
      link_url: linkUrl,
      link_type: linkType.toUpperCase(),
      module,
      internal_campaign_id: internalCampaignId,
    },
  };
  dataLayerPush(linkClickObject);
  return linkClickObject;
}

/**
 * Creates and pushes the "link_click" event to the data layer
 * built from the link element ('A' tag).
 *
 * @param {*} linkElement The link element clicked.
 * @returns object DataLayerEvent
 */
export function triggerLinkClickEventFromElement(linkElement) {
  const getLinkType = (href) => {
    if (
      !(
        href.startsWith('http://') ||
        href.startsWith('https://') ||
        href.startsWith('//')
      )
    ) {
      return LINK_TYPE.INTERNAL;
    }
    try {
      const url = new URL(href);
      if (url.hostname.toLowerCase().includes('qantas')) {
        return LINK_TYPE.INTERNAL;
      }
    } catch (e) {
      return LINK_TYPE.EXTERNAL;
    }
    return LINK_TYPE.EXTERNAL;
  };
  const linkClickObject = {
    event: EVENT_NAME.LINK_CLICK,
    details: {
      link_text: (linkElement.textContent || linkElement.innerText).trim(),
      link_url: linkElement.href,
      link_type: getLinkType(linkElement.href),
      module: linkElement.getAttribute('data-wae-module'),
      internal_campaign_id: linkElement.getAttribute('data-wae-internal-campaign-id'),
    },
  };
  dataLayerPush(linkClickObject);
  return linkClickObject;
}

/**
 * Creates and pushes the "tab_click" event.
 *
 * @param {*} tabName The name of the tab clicked
 * @param {*} componentName The name of the component within which the tab resides.
 * @returns object DataLayerEvent
 */
export function triggerTabClickEvent(tabName, componentName) {
  const tabClickObject = {
    event: EVENT_NAME.TAB_CLICK,
    details: {
      tab_name: tabName,
      component_name: componentName,
    },
  };
  dataLayerPush(tabClickObject);
  return tabClickObject;
}

/**
 * Creates and pushes the "back_to_top_click" event to the data layer.
 *
 * @returns object DataLayerEvent
 */
export function triggerBackToTopClickEvent() {
  const backToTopClickObject = {
    event: EVENT_NAME.BACK_TO_TOP_CLICK,
    details: {},
  };

  dataLayerPush(backToTopClickObject);
  return backToTopClickObject;
}

/**
 * Creates and pushes the "menu_click" event to the data layer.
 *
 * @param {*} itemUrl The URL to which the user will navigate, by clicking on this item.
 * @param {*} itemText The text of the menu item
 * @param {*} itemMenuType The type of menu [main|header|footer|breadcrumbs|related|context]
 * @param {*} itemMenuLevel The level of the menu
 * @returns
 */
export function triggerMenuClickEvent(
  itemUrl,
  itemText,
  itemMenuType,
  itemMenuLevel = '1',
) {
  const menuClickObject = {
    event: EVENT_NAME.MENU_CLICK,
    details: {
      url: itemUrl,
      text: itemText,
      menu_type: itemMenuType,
      menu_level: itemMenuLevel,
    },
  };

  dataLayerPush(menuClickObject);
  return menuClickObject;
}

/**
 * Creates and pushes the "menu_click" event to the data layer
 * built from the menu element ('A' or 'BUTTON' element).
 *
 * @param {*} menuElement The menu element clicked.
 * @returns object DataLayerEvent
 */
export function triggerMenuClickEventFromElement(menuElement) {
  const menuClickObject = {
    event: EVENT_NAME.MENU_CLICK,
    details: {
      url: menuElement.href,
      text: (menuElement.textContent || menuElement.innerText).trim(),
      menu_type: menuElement.getAttribute('data-wae-menu-type'),
      menu_level: menuElement.getAttribute('data-wae-menu-level'),
    },
  };

  dataLayerPush(menuClickObject);
  return menuClickObject;
}

/**
 * Creates and pushes the "return_home_click" event to the data layer.
 *
 * @param {*} itemUrl The url to which the user will navigate clicking on this item.
 * @returns object DataLayerEvent
 */
export function triggerReturnHomeClickEvent(itemUrl) {
  const returnHomeClickObject = {
    event: EVENT_NAME.RETURN_HOME_CLICK,
    details: {
      url: itemUrl,
    },
  };
  dataLayerPush(returnHomeClickObject);
  return returnHomeClickObject;
}
