import { fetchLanguagePlaceholders } from '../../scripts/scripts.js';

const decorate = async (block) => {
  // Fail check
  if (!block) return;

  const anchor = block?.querySelector('a');
  if (!anchor) return;

  // Fetching placeholders.json data
  const placeholder = await fetchLanguagePlaceholders();

  if (!placeholder || Object.keys(placeholder).length === 0) return;

  const {
    regionSelectorCountryCode,
    regionSelectorLanguageCode,
    regionSelectorFlag,
    screenReaderText,
    regionSelectorFull,
  } = placeholder;

  // Critical info missing check
  if (!(regionSelectorCountryCode && regionSelectorLanguageCode && regionSelectorFlag)) {
    return;
  }

  // Build final markup in one write → minimal reflow
  block.innerHTML = `
    <a href="${anchor.href}" class="region-selector-anchor body-02" aria-labelledby="regionSelector">
      <span id="regionSelector" class="visually-hidden">${screenReaderText} ${regionSelectorFull}</span>
      <span class="flag" aria-hidden="true">
        <img src="${window.hlx.codeBasePath}/icons/${regionSelectorFlag}.svg" alt="">
      </span>
      <span class="region-label" aria-hidden="true">${regionSelectorCountryCode}  |  ${regionSelectorLanguageCode}</span>
    </a>
  `;
};

export default decorate;
