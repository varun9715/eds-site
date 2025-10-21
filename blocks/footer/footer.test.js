import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import decorate from './footer.js';

// Mocked modules
import { loadFragment } from '../fragment/fragment.js';
import { createElementWithClasses } from '../../scripts/utils/dom.js';
import { addClassToSelectors, isAuthorMode } from '../../scripts/utils/common-utils.js';
import { getPathDetails, fetchLanguagePlaceholders } from '../../scripts/scripts.js';
import { generateDataLayer } from '../../scripts/utils/analytics.js';

vi.mock('../fragment/fragment.js', () => ({
  loadFragment: vi.fn(),
}));

vi.mock('../../scripts/utils/dom.js', () => ({
  createElementWithClasses: vi.fn(),
  getTextContent: vi.fn(),
}));

vi.mock('../../scripts/utils/common-utils.js', () => ({
  addClassToSelectors: vi.fn(),
  isAuthorMode: vi.fn(),
}));

vi.mock('../../scripts/scripts.js', () => ({
  getPathDetails: vi.fn(),
  fetchLanguagePlaceholders: vi.fn(),
}));

vi.mock('../../scripts/utils/analytics.js', () => ({
  generateDataLayer: vi.fn(),
  EVENT_NAMES: {
    BACK_CLICK: 'back_click',
    LINK_CLICK: 'link_click',
    MENU_CLICK: 'menu_click',
    HOME_CLICK: 'home_click',
  },
  ITEM_TYPES: {
    SOCIAL: 'social',
    MENU: 'menu',
    LOGO: 'logo',
  },
  LINK_TYPES: {
    EXTERNAL: 'external',
  },
}));

// Mock global objects
Object.defineProperty(window, 'digitalDataLayer', {
  value: {
    push: vi.fn(),
  },
  writable: true,
});

describe('generateDataLayer()', () => {
  let mockConsoleWarn;

  beforeEach(() => {
    vi.clearAllMocks();
    mockConsoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    mockConsoleWarn.mockRestore();
  });

  it('warns and returns early for invalid link element', () => {
    generateDataLayer.mockImplementation((linkElement) => {
      if (!linkElement || linkElement.tagName !== 'A') {
        console.warn('generateDataLayer: Invalid link element provided');
      }
    });

    generateDataLayer(null, 'footer', 'test_event');
    expect(mockConsoleWarn).toHaveBeenCalledWith(
      'generateDataLayer: Invalid link element provided',
    );
  });

  it('warns and returns early for non-anchor element', () => {
    generateDataLayer.mockImplementation((linkElement) => {
      if (!linkElement || linkElement.tagName !== 'A') {
        console.warn('generateDataLayer: Invalid link element provided');
      }
    });

    const mockDiv = { tagName: 'DIV' };
    generateDataLayer(mockDiv, 'footer', 'test_event');
    expect(mockConsoleWarn).toHaveBeenCalledWith(
      'generateDataLayer: Invalid link element provided',
    );
  });
});

describe('decorate()', () => {
  let mockBlock;
  let mockFragment;
  let mockFooterContainer;
  let mockAcknowledgementContainer;
  let mockFooterNavigation;
  let mockFooterAckWrapper;

  beforeEach(() => {
    vi.clearAllMocks();

    mockBlock = {
      textContent: 'initial',
      append: vi.fn(),
      prepend: vi.fn(),
    };

    mockFragment = {
      firstElementChild: null,
    };

    // Mock footerSocialTitle element
    const mockFooterSocialTitle = {
      classList: {
        add: vi.fn(),
        remove: vi.fn(),
        // eslint-disable-next-line generator-star-spacing
        *[Symbol.iterator]() {
          yield 'existing-class-1';
          yield 'existing-class-2';
        },
      },
    };

    mockFooterContainer = {
      append: vi.fn(),
      children: [],
      querySelectorAll: vi.fn().mockReturnValue([]),
      querySelector: vi.fn().mockImplementation((selector) => {
        if (selector === '.footer-social .menu-heading-container .menu-heading') {
          return mockFooterSocialTitle;
        }
        if (selector === '.footer-acknowledgement') {
          return null;
        }
        return null;
      }),
    };

    mockAcknowledgementContainer = {
      append: vi.fn(),
    };

    // Mock footer navigation element with all required methods
    mockFooterNavigation = {
      querySelectorAll: vi.fn().mockReturnValue([]),
      appendChild: vi.fn(),
      classList: { add: vi.fn() },
    };

    // Mock footer acknowledgement wrapper
    mockFooterAckWrapper = {
      classList: { add: vi.fn() },
    };

    // Default mocks
    getPathDetails.mockReturnValue({ langRegion: 'us/en' });
    fetchLanguagePlaceholders.mockResolvedValue({ globalBackToTop: 'Back to top' });
    isAuthorMode.mockReturnValue(false);
    loadFragment.mockResolvedValue(mockFragment);
    generateDataLayer.mockReturnValue({ event: 'test_event' });

    createElementWithClasses.mockImplementation((tag, className) => {
      if (className === 'footer-container') return mockFooterContainer;
      if (className === 'footer-acknowledgement-container') {
        return mockAcknowledgementContainer;
      }
      if (className === 'back-to-top-link') {
        return {
          href: '',
          textContent: '',
          addEventListener: vi.fn(),
          setAttribute: vi.fn(),
          removeAttribute: vi.fn(),
          tagName: 'A',
        };
      }
      return { classList: { add: vi.fn() } };
    });

    // Mock mockBlock.querySelector with proper return values
    mockBlock.querySelector = vi.fn().mockImplementation((selector) => {
      if (selector === '.footer-navigation') {
        return mockFooterNavigation;
      }
      if (selector === '.footer-acknowledgement .default-content-wrapper') {
        return mockFooterAckWrapper;
      }
      return null;
    });

    // Mock document.createElement
    document.createElement = vi.fn().mockImplementation((tagName) => {
      if (tagName === 'nav') {
        return {
          setAttribute: vi.fn(),
          appendChild: vi.fn(),
        };
      }
      return {
        setAttribute: vi.fn(),
        appendChild: vi.fn(),
        classList: { add: vi.fn() },
      };
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('loads correct path for footer in normal mode', async () => {
    await decorate(mockBlock);
    expect(loadFragment).toHaveBeenCalledWith('/us/en/fragments/footer');
  });

  it('handles author mode with language-masters path correctly', async () => {
    getPathDetails.mockReturnValue({ langRegion: 'language-masters/us/en' });
    isAuthorMode.mockReturnValue(true);

    await decorate(mockBlock);
    expect(loadFragment).toHaveBeenCalledWith(
      '/language-masters/us/en/en/fragments/footer',
    );
  });

  it('handles author mode without language-masters path', async () => {
    getPathDetails.mockReturnValue({ langRegion: 'us/en' });
    isAuthorMode.mockReturnValue(true);

    await decorate(mockBlock);
    expect(loadFragment).toHaveBeenCalledWith('/us/en/fragments/footer');
  });

  it('handles author mode with language-masters path correctly', async () => {
    getPathDetails.mockReturnValue({ langRegion: 'language-masters/us/en' });
    isAuthorMode.mockReturnValue(true);

    await decorate(mockBlock);
    expect(loadFragment).toHaveBeenCalledWith(
      '/language-masters/us/en/en/fragments/footer',
    );
  });

  it('handles author mode without language-masters path', async () => {
    getPathDetails.mockReturnValue({ langRegion: 'us/en' });
    isAuthorMode.mockReturnValue(true);

    await decorate(mockBlock);
    expect(loadFragment).toHaveBeenCalledWith('/us/en/fragments/footer');
  });

  it('adds all footer classes to children', async () => {
    const children = Array.from({ length: 7 }, () => ({
      classList: { add: vi.fn() },
    }));
    mockFooterContainer.children = children;

    await decorate(mockBlock);

    const expectedClasses = [
      'footer-backtotop',
      'footer-brand',
      'footer-navigation',
      'footer-social',
      'footer-links',
      'footer-copyright',
      'footer-acknowledgement',
    ];

    expectedClasses.forEach((className, index) => {
      if (children[index]) {
        expect(children[index].classList.add).toHaveBeenCalledWith(className);
      }
    });
  });

  it('handles back-to-top with empty placeholders', async () => {
    const mockBackToTopElement = { appendChild: vi.fn() };

    mockFooterContainer.querySelector.mockImplementation((selector) => {
      if (selector === '[data-show-back-to-link="true"]') return mockBackToTopElement;
      return null;
    });

    fetchLanguagePlaceholders.mockResolvedValue({});

    await decorate(mockBlock);
    // Should return early when placeholders is empty
    expect(mockBackToTopElement.appendChild).not.toHaveBeenCalled();
  });

  it('handles back-to-top with null placeholders', async () => {
    const mockBackToTopElement = { appendChild: vi.fn() };

    mockFooterContainer.querySelector.mockImplementation((selector) => {
      if (selector === '[data-show-back-to-link="true"]') return mockBackToTopElement;
      return null;
    });

    fetchLanguagePlaceholders.mockResolvedValue(null);

    await decorate(mockBlock);
    // Should return early when placeholders is null
    expect(mockBackToTopElement.appendChild).not.toHaveBeenCalled();
  });

  it('processes social elements completely', async () => {
    const mockSpan = { innerHTML: '  Facebook  ', remove: vi.fn() };
    const mockImg = { setAttribute: vi.fn(), removeAttribute: vi.fn() };
    const mockAnchor = {
      setAttribute: vi.fn(),
      removeAttribute: vi.fn(),
      addEventListener: vi.fn(),
      getAttribute: vi.fn().mockReturnValue('https://facebook.com'),
      tagName: 'A',
    };

    const mockLi = {
      querySelector: vi.fn().mockImplementation((selector) => {
        if (selector === 'span') return mockSpan;
        if (selector === 'img') return mockImg;
        if (selector === 'a') return mockAnchor;
        return null;
      }),
    };

    mockFooterContainer.querySelectorAll.mockImplementation((selector) => {
      if (selector === '.footer-social li') return [mockLi];
      return [];
    });

    await decorate(mockBlock);

    expect(mockImg.setAttribute).toHaveBeenCalledWith('alt', 'Facebook');
    expect(mockImg.removeAttribute).toHaveBeenCalledWith('aria-hidden');
    expect(mockSpan.remove).toHaveBeenCalled();
  });

  it('handles acknowledgement section movement', async () => {
    const mockAcknowledgement = {
      tagName: 'DIV',
      classList: { contains: vi.fn().mockReturnValue(true) },
    };

    mockFooterContainer.querySelector.mockImplementation((selector) => {
      if (selector === '.footer-acknowledgement') return mockAcknowledgement;
      return null;
    });

    await decorate(mockBlock);

    expect(mockAcknowledgementContainer.append).toHaveBeenCalledWith(mockAcknowledgement);
    expect(mockBlock.append).toHaveBeenCalledWith(mockAcknowledgementContainer);
  });

  it('adds caption class to footer acknowledgement wrapper', async () => {
    await decorate(mockBlock);

    expect(mockBlock.querySelector).toHaveBeenCalledWith(
      '.footer-acknowledgement .default-content-wrapper',
    );
    expect(mockFooterAckWrapper.classList.add).toHaveBeenCalledWith('caption');
  });

  it('clears block textContent and sets up footer structure', async () => {
    await decorate(mockBlock);

    expect(mockBlock.textContent).toBe('');
    expect(createElementWithClasses).toHaveBeenCalledWith('div', 'footer-container');
    expect(mockBlock.prepend).toHaveBeenCalledWith(mockFooterContainer);
  });

  it('calls addClassToSelectors with correct parameters', async () => {
    await decorate(mockBlock);

    expect(addClassToSelectors).toHaveBeenCalledWith(
      mockFooterContainer,
      ['.footer-links li a', '.footer-copyright div'],
      'caption',
    );
  });

  it('handles fragments with multiple children', async () => {
    const elements = [
      { tagName: 'DIV', id: 'el1' },
      { tagName: 'P', id: 'el2' },
      { tagName: 'SPAN', id: 'el3' },
    ];

    let elementIndex = 0;
    Object.defineProperty(mockFragment, 'firstElementChild', {
      get: () => {
        if (elementIndex < elements.length) {
          const currentElement = elements[elementIndex];
          elementIndex += 1;
          return currentElement;
        }
        return null;
      },
    });

    await decorate(mockBlock);

    expect(mockFooterContainer.append).toHaveBeenCalledTimes(2);
  });
});
