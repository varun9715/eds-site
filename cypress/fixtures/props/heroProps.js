// create a props file for the Hero component.
const assetsBasePath =
  'https://delivery-p146463-e1510253.adobeaemcloud.com/adobe/assets/urn:aaid:aem:';
export const heroImageAssetId = 'eeb94b6f-b25c-4b01-bafb-40b536568d12';
export const logoImageAssetId = 'ba32a07f-b554-4456-969d-0d5663af0374';

export const heroAllData = {
  imagePicker: `${assetsBasePath}${heroImageAssetId}`,
  imagePickerAlt: 'Hero Image Alt Text',
  imageCaption: 'Hero caption All Data',
  introText: 'Hero Intro All Data',
  heading: 'Hero With All Data',
  logoPicker: `${assetsBasePath}${logoImageAssetId}`,
  logoPickerAlt: 'Hero Logo Alt Text',
};

export const heroWithoutImage = {
  introText: 'Hero Intro No Image',
  heading: 'Hero No Image',
  logoPicker: `${assetsBasePath}${logoImageAssetId}`,
  logoPickerAlt: 'Hero Logo Alt Text',
};

export const heroWithoutLogo = {
  imagePicker: `${assetsBasePath}${heroImageAssetId}`,
  imagePickerAlt: 'Hero Image alt Text',
  imageCaption: 'Hero caption No Logo',
  introText: 'Hero Intro No Logo',
  heading: 'Hero Without Logo',
};
