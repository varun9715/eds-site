const assetProps = {
  assetsBasePath:
    'https://delivery-p146463-e1510253.adobeaemcloud.com/adobe/assets/urn:aaid:aem:',
  image1Sample: '3bcaac4b-3453-49e1-a9a5-209acb067a2e',
  image2Sample: '174f6182-276e-4724-abf8-c704f9adfdc2',
  image3Sample: 'debafc6d-7d74-4783-8864-15c56c043534',
  image4Sample: 'c6aa5139-7187-43b0-9f14-488d49530d7d',
};

const colType = [
  {
    columns: 'layout-2-col',
    imageAlignment: 'all-right-aligned',
    checkboxFirstArticleHighlighted: 'first-article-highlighted',
    checkboxDisableImageCurve: 'image-curve-disabled',
  },
  {
    columns: 'layout-3-col',
    imageAlignment: 'all-left-aligned',
  },
  {
    columns: 'layout-4-col',
    imageAlignment: 'alternate-left-aligned',
  },
];

const blockProp = [
  {
    imagePicker: `${assetProps.assetsBasePath}${assetProps.image1Sample}`,
    imageAltText: 'Puppy Image',
    imageCaption: 'Puppy Image caption',
    ribbonText: 'Ribbon 1',
    category: 'Category 1',
    heading: 'Title Heading 1',
    headingType: 'H1',
    introText: 'Intro text 1',
    headingText: 'Heading text 1',
    description: 'Description text 1',
    item_cta1: '/content/eds-site',
    item_cta1Text: 'CTA Text 1',
    item_cta2: '/content/eds-site',
    item_cta2Text: 'CTA Text 2',
    item_cta3: '/content/eds-site',
    item_cta3Text: 'CTA Text 3',
    campaignCode: 'Campaign Code',
  },
  {
    imagePicker: `${assetProps.assetsBasePath}${assetProps.image2Sample}`,
    imageAltText: 'Image 2',
    imageCaption: 'Image 2 caption',
    ribbonText: 'Ribbon 2',
    category: 'Category 2',
    heading: 'Title Heading 2',
    headingType: 'H2',
    introText: 'Intro text 2',
    headingText: 'Heading text 2',
    description: 'Description text 2',
    item_cta1: '/content/eds-site',
    item_cta1Text: 'CTA Text 1',
    item_cta2: '/content/eds-site',
    item_cta2Text: 'CTA Text 2',
    item_cta3: '/content/eds-site',
    item_cta3Text: 'CTA Text 3',
    campaignCode: 'Campaign Code',
  },
  {
    imagePicker: `${assetProps.assetsBasePath}${assetProps.image3Sample}`,
    imageAltText: 'Image 3',
    imageCaption: 'Image 3 caption',
    ribbonText: 'Ribbon 3',
    category: 'Category 3',
    heading: 'Title Heading 3',
    headingType: 'H3',
    introText: 'Intro text 3',
    headingText: 'Heading text 3',
    description: 'Description text 3',
    item_cta1: '/content/eds-site',
    item_cta1Text: 'CTA Text 1',
    item_cta2: '/content/eds-site',
    item_cta2Text: 'CTA Text 2',
    item_cta3: '/content/eds-site',
    item_cta3Text: 'CTA Text 3',
    campaignCode: 'Campaign Code',
  },
  {
    imagePicker: `${assetProps.assetsBasePath}${assetProps.image4Sample}`,
    imageAltText: 'Image 4',
    imageCaption: 'Image 4 caption',
    ribbonText: 'Ribbon 4',
    category: 'Category 4',
    heading: 'Title Heading 4',
    headingType: 'H4',
    introText: 'Intro text 4',
    headingText: 'Heading text 4',
    description: 'Description text 4',
    item_cta1: '/content/eds-site',
    item_cta1ext: 'CTA Text 1',
    item_cta2: '/content/eds-site',
    item_cta2Text: 'CTA Text 2',
    item_cta3: '/content/eds-site',
    item_cta3Text: 'CTA Text 3',
    campaignCode: 'Campaign Code',
  },
  // You can add up to 4
];

const imageAndTextSectionProp = {
  name: 'Image and Text',
  'anchor-link-text': 'Image and Text',
  'anchor-section-url': 'imageAndText',
  'show-back-to-link': true,
};

export default {
  assetProps,
  blockProp,
  colType,
  imageAndTextSectionProp,
};
