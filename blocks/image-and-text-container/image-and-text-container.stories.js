import '../../styles/styles.css';
import './image-and-text-container.css';
import decorate from './image-and-text-container.js';

export default {
  title: 'Blocks/Image and Text',
  argTypes: {
    columns: {
      control: { type: 'select' },
      options: ['layout-1-col', 'layout-2-col', 'layout-3-col', 'layout-4-col'],
      defaultValue: 'layout-1-col',
    },
    imageAlignment: {
      control: { type: 'select' },
      options: [
        'all-left-aligned',
        'all-right-aligned',
        'alternate-left-aligned',
        'alternate-right-aligned',
      ],
      defaultValue: 'all-left-aligned',
      if: { arg: 'columns', eq: 'layout-1-col' },
    },
    firstArticleHighlighted: {
      control: 'boolean',
      defaultValue: false,
      if: { arg: 'columns', eq: 'layout-1-col' },
    },
    disableImageCurve: { control: 'boolean', defaultValue: false },
    hideAltText: { control: 'boolean', defaultValue: false },
    caption: { control: 'text', defaultValue: '' },
    label: { control: 'text', defaultValue: '' },
    category: { control: 'text', defaultValue: '' },
    title: { control: 'text', defaultValue: '' },
    introText: { control: 'text', defaultValue: '' },
    bodyText: { control: 'text', defaultValue: '' },
    link1Href: { control: 'text', defaultValue: '' },
    link1Text: { control: 'text', defaultValue: '' },
    link2Href: { control: 'text', defaultValue: '' },
    link2Text: { control: 'text', defaultValue: '' },
    link3Href: { control: 'text', defaultValue: '' },
    link3Text: { control: 'text', defaultValue: '' },
    campaignCode: { control: 'text', defaultValue: '' },
    numOfItems: { control: 'number', defaultValue: 1 },
  },
};

const Template = (args) => {
  const main = document.createElement('main');
  document.body.append(main);

  const section = document.createElement('div');
  section.classList.add('section');

  const block = document.createElement('div');
  block.classList.add('image-and-text-container');

  block.innerHTML = `
    <div><div>${args.columns || ''}</div></div>
    <div><div>${args.imageAlignment || ''}</div></div>
    <div><div>${args.firstArticleHighlighted ? 'first-article-highlighted' : ''}</div></div>
    <div><div>${args.disableImageCurve ? 'image-curve-disabled' : ''}</div></div>
  `;

  const item = document.createElement('div');
  item.innerHTML = `
    <div>
      <a href="https://delivery-p146463-e1510253.adobeaemcloud.com/adobe/assets/urn:aaid:aem:2de1f18d-b3b5-492d-b8a4-99bcb01d778a" title="Alternative Text">
        https://delivery-p146463-e1510253.adobeaemcloud.com/adobe/assets/urn<span class="icon icon-aaid"></span>aem:2de1f18d-b3b5-492d-b8a4-99bcb01d778a
      </a>
    </div>
    <div>${args.hideAltText ? 'true' : ''}</div>
    <div>${args.caption || ''}</div>
    <div>${args.label || ''}</div>
    <div>${args.category || ''}</div>
    <div><h3>${args.title || ''}</h3></div>
    <div>${args.introText || ''}</div>
    <div>${args.bodyText || ''}</div>
    <div><a>${args.link1Href || ''}</a></div>
    <div>${args.link1Text || ''}</div>
    <div><a>${args.link2Href || ''}</a></div>
    <div>${args.link2Text || ''}</div>
    <div><a>${args.link3Href || ''}</a></div>
    <div>${args.link3Text || ''}</div>
    <div>${args.campaignCode || ''}</div>
  `;

  for (let i = 0; i < args.numOfItems; i += 1) {
    block.append(item.cloneNode(true));
  }

  section.append(block);
  main.append(section);

  decorate(block);
  return main;
};

const itemTemplate = {
  caption: 'Enter caption / credit / location here',
  label: 'Label',
  category: 'Category',
  title: 'Enter your title here',
  introText: 'Enter your intro text here',
  bodyText: 'Enter your body text here',
  link1Href: '#',
  link1Text: 'Link 1',
  link2Href: '#',
  link2Text: 'Link 2',
  link3Href: '#',
  link3Text: 'Link 3',
  campaignCode: 'campaign_code',
};

export const Single = Template.bind({});
Single.args = {
  columns: 'layout-1-col',
  numOfItems: 2,
  imageAlignment: 'alternate-left-aligned',
  firstArticleHighlighted: true,
  disableImageCurve: false,
  hideAltText: false,
  ...itemTemplate,
};

export const Double = Template.bind({});
Double.args = {
  columns: 'layout-2-col',
  numOfItems: 2,
  disableImageCurve: false,
  hideAltText: false,
  ...itemTemplate,
};

export const Triple = Template.bind({});
Triple.args = {
  columns: 'layout-3-col',
  numOfItems: 3,
  disableImageCurve: false,
  hideAltText: false,
  ...itemTemplate,
};

export const Quadruple = Template.bind({});
Quadruple.args = {
  columns: 'layout-4-col',
  numOfItems: 4,
  disableImageCurve: false,
  hideAltText: false,
  ...itemTemplate,
};

export const DoubleStacked = Template.bind({});
DoubleStacked.args = {
  columns: 'layout-2-col',
  numOfItems: 4,
  disableImageCurve: false,
  hideAltText: false,
  ...itemTemplate,
};

export const TripleStacked = Template.bind({});
TripleStacked.args = {
  columns: 'layout-3-col',
  numOfItems: 6,
  disableImageCurve: false,
  hideAltText: false,
  ...itemTemplate,
};
