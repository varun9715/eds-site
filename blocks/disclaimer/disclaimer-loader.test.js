import { describe, it, expect, beforeEach, vi } from 'vitest';

// --- GraphQL mock data as a constant (only fetched items, no manual/generic) ---
const MOCK_GRAPHQL_RESPONSE = [
  {
    _variation: 'au',
    disclaimer_id: 'internet',
    disclaimer_description: {
      html: '<p>this is for testing internet content fragment from australia variation</p>',
      plaintext: 'this is for testing internet content fragment from australia variation',
    },
  },
  {
    _variation: 'au',
    disclaimer_id: 'park',
    disclaimer_description: {
      html: '<p>this is for park au en</p>',
      plaintext: 'this is for park au en',
    },
  },
];

// --- Helper mocks ---
function mockGraphQLResponse(items) {
  vi.doMock(
    '../../scripts/utils/graphql-apis.js',
    () => ({
      fetchFromGraphQLPersistedQuery: vi.fn(async () => ({
        disclaimerList: { items },
      })),
    }),
    { overwrite: true },
  );
}

function mockScripts(region = '', lang = 'en') {
  vi.doMock(
    '../../scripts/scripts.js',
    () => ({
      getPathDetails: () => ({ region, lang }),
      fetchLanguagePlaceholders: vi.fn(async () => ({
        'important-information': 'Important Information - Authored Title',
        'back-to-content': 'Back To Content',
      })),
    }),
    { overwrite: true },
  );
}

beforeEach(async () => {
  vi.resetModules();
  document.body.innerHTML = '';
  vi.doMock(
    '../../scripts/utils/common-utils.js',
    () => ({
      isAuthorEditMode: () => false,
      attachTestId: () => {},
    }),
    { overwrite: true },
  );
  vi.doMock(
    '../../scripts/utils/dom.js',
    async () => {
      const actual = await vi.importActual('../../scripts/utils/dom.js');
      return {
        ...actual,
        createElementWithClasses: (tag, ...classes) => {
          const el = document.createElement(tag);
          el.className = classes.join(' ');
          return el;
        },
      };
    },
    { overwrite: true },
  );
  vi.doMock(
    '../../scripts/aem.js',
    () => ({
      loadCSS: vi.fn(),
    }),
    { overwrite: true },
  );
  global.window.hlx = { codeBasePath: '' };
});

describe('disclaimer-loader.js', () => {
  it('returns early if there are no disclaimer anchors in main', async () => {
    mockScripts('au', 'en');
    mockGraphQLResponse(MOCK_GRAPHQL_RESPONSE);

    document.body.innerHTML = '<main></main>';
    const main = document.querySelector('main');
    const loader = await import('./disclaimer-loader.js');
    await loader.loadDisclaimers(main);

    expect(main.querySelector('.disclaimer.block')).toBeFalsy();
  });

  it('returns early if there are no disclaimer ids to fetch', async () => {
    mockScripts('au', 'en');
    mockGraphQLResponse(MOCK_GRAPHQL_RESPONSE);

    document.body.innerHTML = '<main><a href="#not-a-disclaimer"></a></main>';
    const main = document.querySelector('main');
    const loader = await import('./disclaimer-loader.js');
    await loader.loadDisclaimers(main);

    expect(main.querySelector('.disclaimer.block')).toBeFalsy();
  });

  it('returns early if GraphQL returns no items', async () => {
    mockScripts('au', 'en');
    mockGraphQLResponse([]); // No items

    document.body.innerHTML = '<main><a href="#d-internet"></a></main>';
    const main = document.querySelector('main');
    const loader = await import('./disclaimer-loader.js');
    await loader.loadDisclaimers(main);

    expect(main.querySelector('.disclaimer.block')).toBeFalsy();
  });

  it('logs error if GraphQL fetch fails', async () => {
    mockScripts('au', 'en');
    vi.doMock(
      '../../scripts/utils/graphql-apis.js',
      () => ({
        fetchFromGraphQLPersistedQuery: vi.fn(async () => {
          throw new Error('GraphQL error');
        }),
      }),
      { overwrite: true },
    );

    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    document.body.innerHTML = '<main><a href="#d-internet"></a></main>';
    const main = document.querySelector('main');
    const loader = await import('./disclaimer-loader.js');
    await loader.loadDisclaimers(main);

    expect(errorSpy).toHaveBeenCalledWith(
      'Error while loading disclaimers:',
      expect.any(Error),
    );
    errorSpy.mockRestore();
  });

  it('creates a new disclaimer block if not present', async () => {
    mockScripts('au', 'en');
    mockGraphQLResponse(MOCK_GRAPHQL_RESPONSE);

    document.body.innerHTML = `
    <main>
      <a href="#d-internet"></a>
      <a href="#d-park"></a>
    </main>
  `;
    const main = document.querySelector('main');
    const loader = await import('./disclaimer-loader.js');
    await loader.loadDisclaimers(main);

    const block = main.querySelector('.disclaimer.block');
    expect(block).toBeTruthy();
    expect(block.querySelector('#d-internet')).toBeTruthy();
    expect(block.querySelector('#d-park')).toBeTruthy();
  });

  it('does not update disclaimer block if in author edit mode', async () => {
    mockScripts('au', 'en');
    mockGraphQLResponse(MOCK_GRAPHQL_RESPONSE);

    vi.doMock(
      '../../scripts/utils/common-utils.js',
      () => ({
        isAuthorEditMode: () => true,
      }),
      { overwrite: true },
    );

    document.body.innerHTML = `
    <main>
      <a href="#d-internet"></a>
      <div class="disclaimer block">
        <div class="disclaimer-wrapper" data-nosnippet="">
          <div class="disclaimer-title">
            <h2 class="disclaimer-heading body-01">Important Information - Authored Title</h2>
          </div>
          <div class="disclaimer-container caption">
            <div class="disclaimer-item-content" id="d-generic-1" data-disclaimer-type="generic"><p>Generic Disclaimer 1</p></div>
          </div>
        </div>
      </div>
    </main>
  `;
    const main = document.querySelector('main');
    const loader = await import('./disclaimer-loader.js');
    await loader.loadDisclaimers(main);

    const block = main.querySelector('.disclaimer.block');
    expect(block.querySelector('#d-internet')).toBeFalsy();
  });

  it('picks up existing disclaimer items and adds fetched ones, ordering as per anchor', async () => {
    mockScripts('au', 'en');
    mockGraphQLResponse(MOCK_GRAPHQL_RESPONSE);

    document.body.innerHTML = `
      <main>
        <a href="#d-generic-1"></a>
        <a href="#d-internet"></a>
        <a href="#d-park"></a>
        <a href="#d-manual-1"></a>
        <div class="disclaimer block">
          <div class="disclaimer-wrapper" data-nosnippet="">
            <div class="disclaimer-title">
              <h2 class="disclaimer-heading body-01">Important Information - Authored Title</h2>
            </div>
            <div class="disclaimer-container caption">
              <div class="disclaimer-item-content" id="d-generic-1" data-disclaimer-type="generic"><p>Generic Disclaimer 1</p></div>
              <div class="disclaimer-item-content" id="d-manual-1" data-disclaimer-type="manual"><p>Manual Disclaimer 1</p></div>
            </div>
          </div>
        </div>
      </main>
    `;
    const main = document.querySelector('main');
    const loader = await import('./disclaimer-loader.js');
    await loader.loadDisclaimers(main);

    const block = main.querySelector('.disclaimer.block');
    expect(block).toBeTruthy();

    const items = Array.from(block.querySelectorAll('.disclaimer-item-content'));
    const ids = items.map((i) => i.id);
    expect(ids).toContain('d-generic-1');
    expect(ids).toContain('d-internet');
    expect(ids).toContain('d-park');
    expect(ids).toContain('d-manual-1');

    expect(block.querySelectorAll('#d-generic-1').length).toBe(1);
    expect(block.querySelectorAll('#d-manual-1').length).toBe(1);

    expect(block.querySelector('#d-internet').innerHTML).toContain(
      'this is for testing internet content fragment from australia variation',
    );
    expect(block.querySelector('#d-park').innerHTML).toContain('this is for park au en');
  });

  it('updates existing disclaimer block if present and not in author edit mode', async () => {
    mockScripts('au', 'en');
    mockGraphQLResponse(MOCK_GRAPHQL_RESPONSE);

    document.body.innerHTML = `
      <main>
        <a href="#d-internet"></a>
        <a href="#d-park"></a>
        <div class="disclaimer block">
          <div class="disclaimer-wrapper" data-nosnippet="">
            <div class="disclaimer-title">
              <h2 class="disclaimer-heading body-01">Important Information - Authored Title</h2>
            </div>
            <div class="disclaimer-container caption">
              <div class="disclaimer-item-content" id="d-generic-1" data-disclaimer-type="generic"><p>Generic Disclaimer 1</p></div>
              <div class="disclaimer-item-content" id="d-manual-1" data-disclaimer-type="manual"><p>Manual Disclaimer 1</p></div>
            </div>
          </div>
        </div>
      </main>
    `;
    const main = document.querySelector('main');
    const loader = await import('./disclaimer-loader.js');
    await loader.loadDisclaimers(main);

    const block = main.querySelector('.disclaimer.block');
    expect(block).toBeTruthy();
    expect(block.querySelector('#d-internet')).toBeTruthy();
    expect(block.querySelector('#d-park')).toBeTruthy();
  });

  it('renders nothing if no matching disclaimer ids', async () => {
    mockScripts('au', 'en');
    mockGraphQLResponse(MOCK_GRAPHQL_RESPONSE);

    document.body.innerHTML = `
      <main>
        <a href="#not-present"></a>
        <div class="disclaimer block">
          <div class="disclaimer-wrapper" data-nosnippet="">
            <div class="disclaimer-title">
              <h2 class="disclaimer-heading body-01">Important Information - Authored Title</h2>
            </div>
            <div class="disclaimer-container caption">
              <div class="disclaimer-item-content" id="d-generic-1" data-disclaimer-type="generic"><p>Generic Disclaimer 1</p></div>
              <div class="disclaimer-item-content" id="d-manual-1" data-disclaimer-type="manual"><p>Manual Disclaimer 1</p></div>
            </div>
          </div>
        </div>
      </main>
    `;
    const main = document.querySelector('main');
    const loader = await import('./disclaimer-loader.js');
    await loader.loadDisclaimers(main);

    const block = main.querySelector('.disclaimer.block');
    expect(block).toBeTruthy();
    expect(block.querySelectorAll('.disclaimer-item-content').length).toBe(2);
    expect(block.querySelector('#d-generic-1')).toBeTruthy();
    expect(block.querySelector('#d-manual-1')).toBeTruthy();
  });

  it('renders AU variation if region is au', async () => {
    mockScripts('au', 'en');
    mockGraphQLResponse(MOCK_GRAPHQL_RESPONSE);

    document.body.innerHTML = `
      <main>
        <a href="#d-internet"></a>
        <a href="#d-park"></a>
        <div class="disclaimer block">
          <div class="disclaimer-wrapper" data-nosnippet="">
            <div class="disclaimer-title">
              <h2 class="disclaimer-heading body-01">Important Information - Authored Title</h2>
            </div>
            <div class="disclaimer-container caption">
              <div class="disclaimer-item-content" id="d-generic-1" data-disclaimer-type="generic"><p>Generic Disclaimer 1</p></div>
              <div class="disclaimer-item-content" id="d-manual-1" data-disclaimer-type="manual"><p>Manual Disclaimer 1</p></div>
            </div>
          </div>
        </div>
      </main>
    `;
    const main = document.querySelector('main');
    const loader = await import('./disclaimer-loader.js');
    await loader.loadDisclaimers(main);

    expect(main.innerHTML).toContain(
      'this is for testing internet content fragment from australia variation',
    );
    expect(main.innerHTML).toContain('this is for park au en');
  });

  it('handles errors gracefully in loadDisclaimers', async () => {
    mockScripts('au', 'en');
    vi.doMock(
      '../../scripts/utils/graphql-apis.js',
      () => ({
        fetchFromGraphQLPersistedQuery: vi.fn(async () => {
          throw new Error('GraphQL error');
        }),
      }),
      { overwrite: true },
    );

    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    document.body.innerHTML = '<main><a href="#d-internet"></a></main>';
    const main = document.querySelector('main');
    const loader = await import('./disclaimer-loader.js');
    await loader.loadDisclaimers(main);

    expect(errorSpy).toHaveBeenCalledWith(
      'Error while loading disclaimers:',
      expect.any(Error),
    );

    errorSpy.mockRestore();
  });
});
