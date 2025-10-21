import decorate from './region-selector.js';
import './region-selector.css';

export default {
  title: 'Components/Region Selector',
};

const Template = () => {
  const block = document.createElement('div');
  block.classList.add('region-selector');

  // Array of card data
  const anchorData = {
    regionSelectorCountryCode: 'AU',
    regionSelectorLanguageCode: 'EN',
    screenReaderText: 'Change country and language. Current selection:',
    regionSelectorFull: 'Australia, English',
    regionSelectorFlag: 'runway_country_flag_australia',
    imgSrc: '/icons/runway_country_flag_australia.svg',
  };

  block.innerHTML = `
    <a href="#" class="region-selector-anchor" aria-labelledby="regionSelector">
      <span id="regionSelector" class="visually-hidden">${anchorData.screenReaderText} ${anchorData.regionSelectorFull}</span>
      <span class="flag" aria-hidden="true">
        <img src="/icons/${anchorData.regionSelectorFlag}.svg" alt="">
      </span>
      <span class="region-label" aria-hidden="true">
        <span class="region">${anchorData.regionSelectorCountryCode}</span>
        <span class="pipe">|</span>
        <span class="lang">${anchorData.regionSelectorLanguageCode}</span>
      </span>
    </a>
  `;
  // Apply the decorate function
  decorate(block);

  // Return the decorated block
  return block;
};

export const Default = Template.bind({});
