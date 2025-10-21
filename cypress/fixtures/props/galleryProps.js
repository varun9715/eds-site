const assetProps = {
  assetsBasePath:
    'https://delivery-p146463-e1510253.adobeaemcloud.com/adobe/assets/urn:aaid:aem:',
  image1Sample: 'f6df020e-42f4-4614-92b4-0a97dc52847a',
  image2Sample: '174f6182-276e-4724-abf8-c704f9adfdc2',
  image3Sample: 'debafc6d-7d74-4783-8864-15c56c043534',
  image4Sample: 'c6aa5139-7187-43b0-9f14-488d49530d7d',
};

const galleryImageProp = [
  {
    image: `${assetProps.assetsBasePath}${assetProps.image1Sample}`,
    imageMimeType: 'image/jpeg',
    imageAlt: 'Alternative Text 1',
    aspectRatio: 'smart-crop-16-9',
    caption: 'Image Caption 1',
    link: '/content/qantas',
    linkTitle: 'Link Title 1',
  },
  {
    image: `${assetProps.assetsBasePath}${assetProps.image2Sample}`,
    imageMimeType: 'image/jpeg',
    imageAlt: 'Alternative Text 2',
    aspectRatio: 'smart-crop-3-2',
    caption: 'Image Caption 2',
    link: '/content/qantas',
    linkTitle: 'Link Title 2',
  },
  {
    image: `${assetProps.assetsBasePath}${assetProps.image3Sample}`,
    imageMimeType: 'image/jpeg',
    imageAlt: 'Alternative Text 3',
    aspectRatio: 'smart-crop-5-4',
    caption: 'Image Caption 3',
    link: '/content/qantas',
    linkTitle: 'Link Title 3',
  },
  {
    image: `${assetProps.assetsBasePath}${assetProps.image4Sample}`,
    imageMimeType: 'image/jpeg',
    imageAlt: 'Alternative Text 4',
    aspectRatio: 'smart-crop-1-1',
    caption: 'Image Caption 4',
    link: '/content/qantas',
    linkTitle: 'Link Title 4',
  },
  {
    image: `${assetProps.assetsBasePath}${assetProps.image1Sample}`,
    imageMimeType: 'image/jpeg',
    imageAlt: 'Alternative Text 5',
    aspectRatio: 'smart-crop-4-5',
    caption: 'Image Caption 5',
    link: '/content/qantas',
    linkTitle: 'Link Title 5',
  },
  {
    image: `${assetProps.assetsBasePath}${assetProps.image2Sample}`,
    imageMimeType: 'image/jpeg',
    imageAlt: 'Alternative Text 6',
    aspectRatio: 'original',
    caption: 'Image Caption 6',
    link: '/content/qantas',
    linkTitle: 'Link Title 6',
  },
];

export default {
  assetProps,
  galleryImageProp,
};
