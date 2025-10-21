/* eslint-disable no-underscore-dangle */
function setCodeBasePath() {
  window.hlx = window.hlx || {};
  window.hlx.codeBasePath = '';
  window.hlx.isExternalSite = true;
}

async function loadCSS(href) {
  return new Promise((resolve, reject) => {
    if (!document.querySelector(`head > link[href="${href}"]`)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.onload = resolve;
      link.onerror = reject;
      document.head.append(link);
    } else {
      resolve();
    }
  });
}

async function loadBlock(block) {
  const status = block.dataset.blockStatus;
  if (status !== 'loading' && status !== 'loaded') {
    block.dataset.blockStatus = 'loading';
    const { blockName } = block.dataset;
    try {
      const cssLoaded = loadCSS(`${window.hlx.codeBasePath}/blocks/${blockName}/${blockName}.css`);
      const decorationComplete = new Promise((resolve) => {
        (async () => {
          try {
            const mod = await import(
              `${window.hlx.codeBasePath}/blocks/${blockName}/${blockName}.js`
            );
            if (mod.default) {
              await mod.default(block);
            }
          } catch (error) {
            // eslint-disable-next-line no-console
            console.log(`failed to load module for ${blockName}`, error);
          }
          resolve();
        })();
      });
      await Promise.all([cssLoaded, decorationComplete]);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(`failed to load block ${blockName}`, error);
    }
    block.dataset.blockStatus = 'loaded';
  }
  return block;
}

function onDocumentReady(callback) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      callback();
    });
  } else {
    callback();
  }
}

async function loadHeader() {
  const header = document.createElement('header');
  header.classList.add('header-wrapper', 'eds-block');

  const block = document.createElement('div');
  block.classList.add('header', 'block');
  block.dataset.blockName = 'header';

  header.append(block);
  await loadBlock(block);

  onDocumentReady(() => {
    const oldHeader = document.querySelector('header.eds-block');

    if (oldHeader && oldHeader.parentNode) {
      oldHeader.parentNode.replaceChild(header, oldHeader);
    } else {
      console.warn('No <header> element found or it has no parent');
    }
  });
}

async function loadFooter() {
  const footer = document.createElement('footer');
  footer.classList.add('footer-wrapper', 'eds-block');

  const block = document.createElement('div');
  block.classList.add('footer', 'block');
  block.dataset.blockName = 'footer';

  footer.append(block);
  await loadBlock(block);

  onDocumentReady(() => {
    const oldFooter = document.querySelector('footer.eds-block');

    if (oldFooter && oldFooter.parentNode) {
      oldFooter.parentNode.replaceChild(footer, oldFooter);
    } else {
      console.warn('No <footer> element found or it has no parent');
    }
  });
}

async function loadExternalContent() {
  setCodeBasePath();
  await loadHeader();
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  loadFooter();
}

loadExternalContent();
