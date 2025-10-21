/* eslint-disable import/prefer-default-export */

const anchorSectionAllValues = {
  'anchor-link-text': 'AnchorSectionAllValues',
  'anchor-section-url': 'main-content',
  'show-back-to-link': true,
};

const anchorSectionExcludeAnchorLink = {
  'anchor-link-text': 'anchorSectionExcludeAnchorLink',
  'anchor-section-url': 'main-content',
  'show-back-to-link': true,
  'exclude-from-anchor-link': true,
};

const anchorSectionHideBackToTop = {
  'anchor-link-text': 'anchorSectionHideBackToTop',
  'anchor-section-url': 'main-content',
};

const titleProps = [
  { title: 'AnchorOne' },
  { title: 'AnchorTwo' },
  { title: 'AnchorThree' },
];

export const anchorSectionProps = {
  anchorSectionAllValues,
  anchorSectionExcludeAnchorLink,
  anchorSectionHideBackToTop,
};

export const anchorSectionPropsArray = Object.values(anchorSectionProps);
export const titleValue = Object.values(titleProps);
