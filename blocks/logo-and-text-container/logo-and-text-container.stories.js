import '../../styles/styles.css';
import './logo-and-text-container.css';
import decorate from './logo-and-text-container.js';

export default {
  title: 'Blocks/Logo and Text',
  argTypes: {
    layout: {
      control: { type: 'select' },
      options: [
        'layout-1-col',
        'layout-2-col',
        'layout-3-col',
        'layout-4-col',
        'layout-4-col-center',
      ],
      defaultValue: 'layout-1-col',
    },
    icon: { control: 'text', defaultValue: 'https://placehold.co/120x60/png' },
    caption: { control: 'text', defaultValue: '' },
    hideAltText: { control: 'boolean', defaultValue: false },
    altText: {
      control: 'text',
      defaultValue: 'Logo Name',
      if: { arg: 'hideAltText', eq: false },
    },
    title: { control: 'text', defaultValue: 'Logo Title' },
    description: { control: 'text', defaultValue: 'Logo description goes here.' },
    cta1Link: { control: 'text', defaultValue: '#' },
    cta1Text: { control: 'text', defaultValue: 'Learn More' },
    cta2Link: { control: 'text', defaultValue: '' },
    cta2Text: { control: 'text', defaultValue: '' },
    numOfItems: { control: 'number', defaultValue: 1 },
  },
};

const Template = (args) => {
  // Ensure only one <main> exists
  const main = document.createElement('main');
  main.classList.add('main');

  const section = document.createElement('div');
  section.classList.add('section');

  const block = document.createElement('div');
  block.classList.add('logo-and-text-container', args.layout);

  const alt = args.hideAltText ? '' : args.altText || 'Logo';
  const item = document.createElement('div');
  item.innerHTML = `
      <div><img src="${args.icon}"/></div>
      <div>${alt}</div>
      <div>${args.hideAltText ? 'true' : ''}</div>
      <div>
        <h2>${args.title || ''}</h2>
        <div>${args.description || ''}</div>
        ${args.cta1Link ? `<p><a href="${args.cta1Link}">${args.cta1Text || ''}</a></p>` : ''}
        ${args.cta2Link ? `<p><a href="${args.cta2Link}">${args.cta2Text || ''}</a></p>` : ''}
      </div>
    `;

  // Only create simple item divs, not blocks or wrappers
  for (let i = 0; i < args.numOfItems; i += 1) {
    block.appendChild(item.cloneNode(true));
  }

  section.append(block);
  main.append(section);

  decorate(block);

  return main;
};

const itemTemplate = {
  icon: 'https://placehold.co/120x60/png',
  altText: 'Logo Name',
  title: 'Logo Title',
  caption: 'Logo Caption Text',
  description: `
    <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s <a href="https://www.google.com">book</a></p>
    <ul>
      <li>
        <p>It is a long established fact that a reader will be distracted</p>
      </li>
      <li>
        <p>Many desktop publishing packages and web page</p>
      </li>
    </ul>`,
  cta1Link: '#',
  cta1Text: 'Learn More',
  cta2Link: 'https://www.google.com',
  cta2Text: 'Learn More 2',
};

export const Single = Template.bind({});
Single.args = {
  layout: 'layout-1-col',
  numOfItems: 1,
  hideAltText: false,
  ...itemTemplate,
};

export const Double = Template.bind({});
Double.args = {
  layout: 'layout-2-col',
  numOfItems: 2,
  hideAltText: false,
  ...itemTemplate,
};

export const Triple = Template.bind({});
Triple.args = {
  layout: 'layout-3-col',
  numOfItems: 3,
  hideAltText: false,
  ...itemTemplate,
};

export const Quadruple = Template.bind({});
Quadruple.args = {
  layout: 'layout-4-col',
  numOfItems: 4,
  hideAltText: false,
  ...itemTemplate,
};

export const QuadrupleCenter = Template.bind({});
QuadrupleCenter.args = {
  layout: 'layout-4-col-center',
  numOfItems: 4,
  hideAltText: false,
  ...itemTemplate,
  description: 'Enter Logo Text',
  cta2Link: '',
  cta2Text: '',
};
