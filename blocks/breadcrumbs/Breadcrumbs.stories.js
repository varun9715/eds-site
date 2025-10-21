import { buildBreadcrumbs } from './breadcrumbs.js';
import './breadcrumbs.css';

export default {
  title: 'Blocks/Breadcrumbs',
};
const Template = (args) => {
  const container = document.createElement('div');
  container.className = 'breadcrumbs';

  buildBreadcrumbs(container, args.breadcrumbData);

  return container;
};

export const MockBreadcrumbs = Template.bind({});

MockBreadcrumbs.args = {
  breadcrumbData: [
    { path: '/en-au', title: 'Home' },
    { path: '/en-au/about-us', title: 'About Us' },
    { path: '/en-au/about-us/our-company', title: 'Our Company' },
  ],
};
