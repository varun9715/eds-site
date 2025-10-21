/* eslint-disable no-underscore-dangle */
import { loadHeader, loadFooter, loadCSS } from './aem.js';

function setCodeBasePath() {
  window.hlx = window.hlx || {};
  window.hlx.codeBasePath = window.hlx.codeBasePath || new URL(import.meta.url).origin;
}

function setMetadataValue(metaName, value) {
  let meta = document.head.querySelector(`meta[name="${metaName}"]`);

  if (!meta) {
    meta = document.createElement('meta');
    meta.name = metaName;
    document.head.appendChild(meta);
  }

  meta.content = value;
}

async function loadExternalContent(doc) {
  const header = doc.querySelector('header.eds-block');
  const footer = doc.querySelector('footer.eds-block');

  if (!header && !footer) return;

  setCodeBasePath();

  const envValue = header.getAttribute('data-env');
  const langRegionValue = header.getAttribute('data-langregion');

  if (envValue) {
    setMetadataValue('env', envValue);
    window.hlx.env = envValue;
  }

  if (langRegionValue) {
    window.hlx.langregion = langRegionValue;
  }

  window.hlx.isExternalSite = true;

  if (header) {
    await loadHeader(header);
  }

  if (footer) {
    await loadFooter(footer);
  }

  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
}

loadExternalContent(document);
