import decorate from './app-download.js';
import './app-download.css';

export default {
  title: 'Blocks/App Download',
  argTypes: {
    link1Image: {
      control: 'text',
      description: 'Image 1',
      defaultValue:
        'https://delivery-p146463-e1510253.adobeaemcloud.com/adobe/assets/urn:aaid:aem:5997dab0-9cc4-4d0c-ac50-8e81c510abb0/renditions/original/as/app-download-apple.svg?assetname=app-download-apple.svg',
    },
    link1AltText: {
      control: 'text',
      description: 'Alt text for image 1',
      defaultValue: 'App Store',
    },
    link1Url: {
      control: 'text',
      description: 'Link 1',
      defaultValue: 'https://www.google.com',
    },
    link2Image: {
      control: 'text',
      description: 'Image 2',
      defaultValue:
        'https://delivery-p146463-e1510253.adobeaemcloud.com/adobe/assets/urn:aaid:aem:97299253-17ec-408c-86bc-d5b1e5c5a2ba/renditions/original/as/app-download-google.svg?assetname=app-download-google.svg',
    },
    link2AltText: {
      control: 'text',
      description: 'Alt text for image 2',
      defaultValue: 'Google Play',
    },
    link2Url: {
      control: 'text',
      description: 'Link 2',
      defaultValue: 'https://www.apple.com',
    },
  },
};

const Template = (args) => {
  const block = document.createElement('div');
  block.classList.add('app-download');
  block.classList.add('block');

  block.innerHTML = `
    <div>
      <div>
        <p>
          <img src="${args.link1Image}" alt="${args.link1AltText}">
        </p>
        <p><a href="${args.link1Url}">${args.link1Url}</a></p>
      </div>
    </div>
    <div>
      <div>
        <p>
          <img src="${args.link2Image}" alt="${args.link2AltText}">
        </p>
        <p><a href="${args.link2Url}">${args.link2Url}</a></p>
      </div>
    </div>
  `;

  decorate(block);
  return block;
};

export const Default = Template.bind({});
Default.args = {
  link1Image:
    'https://delivery-p146463-e1510253.adobeaemcloud.com/adobe/assets/urn:aaid:aem:5997dab0-9cc4-4d0c-ac50-8e81c510abb0/renditions/original/as/app-download-apple.svg?assetname=app-download-apple.svg',
  link1AltText: 'App Store',
  link1Url: 'https://www.apple.com',
  link2Image:
    'https://delivery-p146463-e1510253.adobeaemcloud.com/adobe/assets/urn:aaid:aem:97299253-17ec-408c-86bc-d5b1e5c5a2ba/renditions/original/as/app-download-google.svg?assetname=app-download-google.svg',
  link2AltText: 'Google Play',
  link2Url: 'https://www.google.com',
};
