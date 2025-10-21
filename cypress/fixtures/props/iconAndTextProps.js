const colType = [
  {
    classes: 'layout-2-col',
    alignment: 'left-aligned',
  },
  {
    classes: 'layout-4-col',
    alignment: 'top-aligned',
  },
];

const blockProp = [
  {
    iconPicker: ':runway_logo_airline_airnorth:',
    item_heading: 'Heading 1 - Icon',
    item_description: 'Heading Description',
    item_cta1: '/content/eds-site',
    item_cta1Text: 'cta text 1',
  },
  {
    iconPicker: ':runway_logo_airline_iberia:',
    item_heading: 'Heading 2 - Icon',
    item_description: 'Heading Description',
    item_cta1: '/content/eds-site',
    item_cta1Text: 'cta text 2',
  },
  {
    iconPicker: ':runway_logo_airline_jetstar:',
    item_heading: 'Heading 3 - Icon',
    item_description: 'Heading Description',
    item_cta1: '/content/eds-site',
    item_cta1Text: 'cta text 3',
  },
  {
    iconPicker: ':runway_logo_airline_vietnam_airlines:',
    item_heading: 'Heading 4 - Icon',
    item_description: 'Heading Description',
    item_cta1: '/content/eds-site',
    item_cta1Text: 'cta text 4',
  },
  // You can add up to 4
];

const iconAndTextSectionProp = {
  name: 'Icon and Text',
  'anchor-link-text': 'Icon and Text',
  'anchor-section-url': 'iconAndText',
  'show-back-to-link': true,
};

export default {
  blockProp,
  colType,
  iconAndTextSectionProp,
};
