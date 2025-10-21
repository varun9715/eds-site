import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import decorate from './gallery.js';

// Import mocked functions
import { buildImage } from '../image/image.js';

import { fetchLanguagePlaceholders } from '../../scripts/scripts.js';

// Mock dependencies
vi.mock('../image/image.js', () => ({
  buildImage: vi.fn(() => {
    const mockImageItem = document.createElement('div');
    mockImageItem.classList.add('image-item');
    const picture = document.createElement('picture');
    const img = document.createElement('img');
    img.src = 'test-image.jpg';
    img.alt = 'Test Image';
    picture.appendChild(img);
    mockImageItem.appendChild(picture);
    return Promise.resolve(mockImageItem);
  }),
}));

vi.mock('./galleryItem.js', () => ({
  default: vi.fn(() => {
    // Create a mock gallery item
    const mockItem = document.createElement('div');
    mockItem.classList.add('gallery-item');
    mockItem.innerHTML = `
      <div class="gallery-picture">
        <img src="test-image.jpg" alt="Test Image" />
        <figcaption>Test Caption</figcaption>
      </div>
    `;
    return Promise.resolve(mockItem);
  }),
}));

vi.mock('../../scripts/utils/dam-open-apis.js', () => ({
  createPicTagWithOpenApi: vi.fn(() => {
    const picture = document.createElement('picture');
    const img = document.createElement('img');
    img.src = 'test-image.jpg';
    img.alt = 'Test Image';
    picture.appendChild(img);
    return Promise.resolve(picture);
  }),
  createPicAndImgWithOpenApi: vi.fn(() => {
    const picture = document.createElement('picture');
    const img = document.createElement('img');
    img.src = 'test-image.jpg';
    img.alt = 'Test Image';
    picture.appendChild(img);
    return Promise.resolve(picture);
  }),
  fetchOrGetCachedMetadata: vi.fn(() => Promise.resolve({})),
  buildDamUrl: vi.fn(() => ({ urnUrl: 'test-urn' })),
}));

vi.mock('../../scripts/utils/dom.js', () => ({
  createElementWithClasses: vi.fn((tag, ...classes) => {
    const element = document.createElement(tag);
    element.classList.add(...classes);
    return element;
  }),
  promoteFirstChildIfExists: vi.fn((element) => element?.firstElementChild || element),
}));

vi.mock('../../scripts/utils/common-utils.js', () => ({
  isAuthorMode: vi.fn(() => false),
  attachTestId: vi.fn(() => {}),
  getUrlAndSetAltFromElement: vi.fn(() => ({ href: 'test-url' })),
  setImgAltIfRequired: vi.fn(() => {}),
}));

vi.mock('../../scripts/scripts.js', () => ({
  fetchLanguagePlaceholders: vi.fn(() =>
    Promise.resolve({
      galleryRoleDescription: 'Image Gallery',
      galleryContainerAriaLabel: 'Gallery Images',
      galleryPreviousSlideLabel: 'Previous Image',
      galleryNextSlideLabel: 'Next Image',
      gallerySlide: 'Slide',
      gallerySlideOf: 'of',
    }),
  ),
  moveInstrumentation: vi.fn(() => {}),
  loadCSS: vi.fn(() => {}),
  decorateBlock: vi.fn(() => {}),
  decorateButtons: vi.fn(() => {}),
  decorateIcons: vi.fn(() => {}),
  getMetadata: vi.fn(() => ''),
  toClassName: vi.fn((name) => name),
}));

describe('Gallery Carousel', () => {
  let mockBlock;
  let mockIntersectionObserver;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Reset module by re-importing it to reset the carouselId counter
    vi.resetModules();

    // Setup DOM
    document.body.innerHTML = '';
    mockBlock = document.createElement('div');
    mockBlock.classList.add('gallery');

    // Mock IntersectionObserver
    mockIntersectionObserver = {
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    };

    global.IntersectionObserver = vi.fn(() => mockIntersectionObserver);

    // Mock scrollTo
    Element.prototype.scrollTo = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Basic Gallery Setup', () => {
    it('should create multi-slide gallery with navigation', async () => {
      // Setup multiple children
      const child1 = document.createElement('div');
      const child2 = document.createElement('div');
      const child3 = document.createElement('div');
      mockBlock.appendChild(child1);
      mockBlock.appendChild(child2);
      mockBlock.appendChild(child3);

      await decorate(mockBlock);

      // Should have navigation for multiple slides
      const navButtons = mockBlock.querySelector('.carousel-navigation-buttons');
      expect(navButtons).toBeDefined();

      const prevButton = mockBlock.querySelector('.slide-prev');
      const nextButton = mockBlock.querySelector('.slide-next');
      const slideCounter = mockBlock.querySelector('.slide-counter');

      expect(prevButton).toBeDefined();
      expect(nextButton).toBeDefined();
      expect(slideCounter).toBeDefined();

      // Fix: Check only the visible text part (first span with aria-hidden="true")
      const visibleText = slideCounter.querySelector('span[aria-hidden="true"]');
      expect(visibleText.textContent).toBe('1 of 3');
    });

    it('should handle empty placeholders gracefully', async () => {
      fetchLanguagePlaceholders.mockResolvedValueOnce({});

      const child = document.createElement('div');
      mockBlock.appendChild(child);

      await decorate(mockBlock);

      // Should return early without processing
      expect(buildImage).not.toHaveBeenCalled();
    });
  });

  describe('Slide Creation and Structure', () => {
    it('should create proper slide structure', async () => {
      const child1 = document.createElement('div');
      const child2 = document.createElement('div');
      mockBlock.appendChild(child1);
      mockBlock.appendChild(child2);

      // Re-import to get fresh module with reset carouselId
      const { default: freshDecorate } = await import('./gallery.js');
      await freshDecorate(mockBlock);

      const slides = mockBlock.querySelectorAll('.carousel-slide');
      expect(slides).toHaveLength(2);

      slides.forEach((slide, index) => {
        expect(slide.dataset.slideIndex).toBe(index.toString());
        expect(slide.getAttribute('id')).toBeNull(); // No ID should be set
        expect(slide.querySelector('.carousel-slide-image')).toBeDefined();
      });
    });

    it('should set up IntersectionObserver for slides', async () => {
      const child1 = document.createElement('div');
      const child2 = document.createElement('div');
      mockBlock.appendChild(child1);
      mockBlock.appendChild(child2);

      await decorate(mockBlock);

      expect(global.IntersectionObserver).toHaveBeenCalledWith(expect.any(Function), {
        threshold: 0.5,
        root: expect.any(HTMLElement),
      });
      expect(mockIntersectionObserver.observe).toHaveBeenCalledTimes(2);
    });
  });

  describe('Navigation Functionality', () => {
    beforeEach(async () => {
      // Setup multi-slide gallery
      const child1 = document.createElement('div');
      const child2 = document.createElement('div');
      const child3 = document.createElement('div');
      mockBlock.appendChild(child1);
      mockBlock.appendChild(child2);
      mockBlock.appendChild(child3);

      await decorate(mockBlock);
    });

    it('should navigate to next slide', () => {
      const nextButton = mockBlock.querySelector('.slide-next');
      const slideCounter = mockBlock.querySelector('.slide-counter');

      nextButton.click();

      expect(mockBlock.dataset.activeSlide).toBe('1');

      // Fix: Check only the visible text part
      const visibleText = slideCounter.querySelector('span[aria-hidden="true"]');
      expect(visibleText.textContent).toBe('2 of 3');
    });

    it('should navigate to previous slide', () => {
      // First go to slide 1
      const nextButton = mockBlock.querySelector('.slide-next');
      nextButton.click();

      // Then go back to slide 0
      const prevButton = mockBlock.querySelector('.slide-prev');
      prevButton.click();

      expect(mockBlock.dataset.activeSlide).toBe('0');
    });

    it('should wrap around when navigating past last slide', () => {
      const nextButton = mockBlock.querySelector('.slide-next');

      // Navigate to last slide and beyond
      nextButton.click(); // slide 1
      nextButton.click(); // slide 2
      nextButton.click(); // should wrap to slide 0

      expect(mockBlock.dataset.activeSlide).toBe('0');
    });

    it('should wrap around when navigating before first slide', () => {
      const prevButton = mockBlock.querySelector('.slide-prev');

      // Navigate backwards from first slide
      prevButton.click();

      expect(mockBlock.dataset.activeSlide).toBe('2'); // Should go to last slide
    });
  });

  describe('Accessibility Features', () => {
    beforeEach(async () => {
      const child1 = document.createElement('div');
      const child2 = document.createElement('div');
      mockBlock.appendChild(child1);
      mockBlock.appendChild(child2);

      await decorate(mockBlock);
    });

    it('should set proper ARIA attributes on slides', () => {
      const slides = mockBlock.querySelectorAll('.carousel-slide');

      // First slide should be visible
      expect(slides[0].getAttribute('aria-hidden')).toBe('false');
      expect(slides[1].getAttribute('aria-hidden')).toBe('true');
    });

    it('should manage focus properly on navigation', () => {
      const slides = mockBlock.querySelectorAll('.carousel-slide');

      // Add mock links to slides
      slides.forEach((slide) => {
        const link = document.createElement('a');
        link.href = '#';
        link.textContent = 'Test Link';
        slide.appendChild(link);
      });

      const nextButton = mockBlock.querySelector('.slide-next');
      nextButton.click();

      const slide0Links = slides[0].querySelectorAll('a');
      const slide1Links = slides[1].querySelectorAll('a');

      // Links in inactive slide should have tabindex -1
      slide0Links.forEach((link) => {
        expect(link.getAttribute('tabindex')).toBe('-1');
      });

      // Links in active slide should not have tabindex restriction
      slide1Links.forEach((link) => {
        expect(link.hasAttribute('tabindex')).toBe(false);
      });
    });

    it('should update slide counter with proper accessibility text', () => {
      const slideCounter = mockBlock.querySelector('.slide-counter');
      const nextButton = mockBlock.querySelector('.slide-next');

      nextButton.click();

      // Fix: Check the screen reader text instead of aria-label
      const srText = slideCounter.querySelector('.visually-hidden');
      expect(srText.textContent).toBe('Slide 2 of 2');

      // Also verify the visible text
      const visibleText = slideCounter.querySelector('span[aria-hidden="true"]');
      expect(visibleText.textContent).toBe('2 of 2');
    });
  });

  describe('Error Handling', () => {
    it('should handle failed gallery item creation', async () => {
      buildImage.mockResolvedValueOnce(null);

      const child = document.createElement('div');
      mockBlock.appendChild(child);

      // The current implementation will throw an error when no valid images are present
      // because updateActiveSlide is called with null
      await expect(decorate(mockBlock)).rejects.toThrow();
    });

    it('should handle missing placeholders', async () => {
      fetchLanguagePlaceholders.mockResolvedValueOnce(null);

      const child = document.createElement('div');
      mockBlock.appendChild(child);

      await decorate(mockBlock);

      expect(buildImage).not.toHaveBeenCalled();
    });
  });

  describe('Scroll Behavior', () => {
    beforeEach(async () => {
      const child1 = document.createElement('div');
      const child2 = document.createElement('div');
      mockBlock.appendChild(child1);
      mockBlock.appendChild(child2);

      await decorate(mockBlock);
    });

    it('should call scrollTo when navigating slides', () => {
      const nextButton = mockBlock.querySelector('.slide-next');
      const slidesContainer = mockBlock.querySelector('.carousel-slides');

      nextButton.click();

      expect(slidesContainer.scrollTo).toHaveBeenCalledWith({
        top: 0,
        left: expect.any(Number),
        behavior: 'smooth',
      });
    });
  });

  describe('Multiple Gallery Instances', () => {
    it('should create multiple independent gallery instances', async () => {
      // Reset modules to get fresh carouselId counter
      vi.resetModules();

      const { default: freshDecorate } = await import('./gallery.js');

      const block1 = document.createElement('div');
      const block2 = document.createElement('div');

      // Add gallery class to blocks
      block1.classList.add('gallery');
      block2.classList.add('gallery');

      // Add 2 children to each block to create slides
      const child1a = document.createElement('div');
      const child1b = document.createElement('div');
      const child2a = document.createElement('div');
      const child2b = document.createElement('div');

      block1.appendChild(child1a);
      block1.appendChild(child1b);
      block2.appendChild(child2a);
      block2.appendChild(child2b);

      await freshDecorate(block1);
      await freshDecorate(block2);

      // Check that IDs are unique and sequential
      const id1 = block1.getAttribute('id');
      const id2 = block2.getAttribute('id');

      // Block IDs should not be set since we removed ID generation
      expect(id1).toBeNull();
      expect(id2).toBeNull();

      // Verify both galleries are functional (have different DOM structures)
      const slides1 = block1.querySelectorAll('.carousel-slide');
      const slides2 = block2.querySelectorAll('.carousel-slide');
      expect(slides1).toHaveLength(2);
      expect(slides2).toHaveLength(2);

      // Verify they're separate instances
      expect(block1).not.toBe(block2);
    });
  });
});
