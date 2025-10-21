const linkListProp = [
  {
    heading: 'Link List Heading 1 - Fixed List - Hyper Link',
    headingType: 'h2',
    buildListUsingType: 'fixedList',
    classes: 'hyper-links',
  },
  {
    heading: 'Link List Heading 2 - Fixed List - Simple Link',
    headingType: 'h2',
    buildListUsingType: 'fixedList',
    classes: 'simple-links',
  },
  {
    heading: 'Link List Heading 3 - Child Pages',
    headingType: 'h2',
    buildListUsingType: 'childPages',
    childPagesParentPage: '/en-au/about-us',
  },
];

const fixedLinkProp = [
  {
    link: 'https://www.google.com',
    linkText: 'Google',
  },
  { link: 'https://www.qantas.com', linkText: 'Qantas Site' },
  { link: '/content/qcom', linkText: 'Internal Site 1' },
  { link: '/content/qcom', linkText: 'Internal Site 2' },
  { link: '/content/qcom', linkText: 'Internal Site 3' },
  { link: '/content/qcom', linkText: 'Internal Site 4' },
  // You can add up to 4
];

const fixedLinkPropLessThan5 = [
  {
    link: 'https://www.google.com',
    linkText: 'Google',
  },
  { link: 'https://www.qantas.com', linkText: 'Qantas Site' },
  { link: '/content/qcom', linkText: 'Internal Site 1' },
  { link: '/content/qcom', linkText: 'Internal Site 2' },
  { link: '/content/qcom', linkText: 'Internal Site 3' },
  // You can add up to 4
];

export default {
  linkListProp,
  fixedLinkProp,
  fixedLinkPropLessThan5,
};
