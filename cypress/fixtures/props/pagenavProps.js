// get Values for In Page navigation with more than five Page Links
const anchorTexts = [
  'AnchorLinkOne',
  'AnchorLinkTwo',
  'AnchorLinkThree',
  'AnchorLinkFour',
  'AnchorLinkFive',
  'AnchorLinksix',
];

const anchorPropsValues = anchorTexts.map((text) => ({
  'anchor-link-text': text,
  'anchor-section-url': text,
}));

// get Values for In Page navigation
const pageLinkIsVisible = {
  'anchor-link-text': 'pageLinkVisible',
  'anchor-section-url': 'pageLinkVisible',
  'show-back-to-link': true,
};

const pageLinkNotVisible = {
  'anchor-link-text': 'HidePageLink',
  'anchor-section-url': 'HidePageLink',
  'show-back-to-link': true,
  'exclude-from-anchor-link': true,
};

// get Values for Title
const titleProps = anchorTexts.map((text) => ({
  title: text,
}));

export const anchorSectionProps = {
  pageLinkIsVisible,
  pageLinkNotVisible,
};

export const pageLinksmorethanFive = anchorPropsValues;
export const titleValue = titleProps;

export const anchorSectionPropsArray = Object.values(anchorSectionProps);
