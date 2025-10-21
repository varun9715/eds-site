import { buildImage } from '../image/image.js';
import { createElementWithClasses } from '../../scripts/utils/dom.js';
import { attachTestId } from '../../scripts/utils/common-utils.js';
import { fetchLanguagePlaceholders, moveInstrumentation } from '../../scripts/scripts.js';

// Module-level placeholder variables
let placeholders = {};

// Constants
const INTERSECTION_THRESHOLD = 0.5;
const DEFAULT_SLIDE_INDEX = 0;

/**
 * Creates slide counter spans with proper accessibility attributes
 */
function createSlideCounterSpans(visibleText, accessibleText) {
  // Visible-only text (hidden from SR)
  const visualSpan = document.createElement('span');
  visualSpan.textContent = visibleText;
  visualSpan.setAttribute('aria-hidden', 'true');

  // Screen-reader-only span
  const srSpan = document.createElement('span');
  srSpan.className = 'visually-hidden';
  srSpan.textContent = accessibleText;

  return { visualSpan, srSpan };
}

/**
 * Extracts caption text and adds "link" suffix to link text
 */
function getCaptionWithLinks(caption) {
  if (!caption) return '';

  let captionText = caption.textContent || caption.innerText || '';
  const links = caption.querySelectorAll('a');

  links.forEach((link) => {
    const linkText = link.textContent.trim();
    if (linkText) {
      const linkPosition = captionText.indexOf(linkText);
      const charBefore = captionText.charAt(linkPosition - 1);
      // Only add period if there's actual text before the link and it's not punctuation
      const needsPeriod = charBefore && charBefore.trim() && !/[.!?:]/.test(charBefore);
      const prefix = needsPeriod ? '. ' : ' ';
      captionText = captionText.replace(linkText, `${prefix}${linkText} link`);
    }
  });

  return captionText;
}

/**
 * Formats base text with proper punctuation and spacing
 */
function formatBaseText(text) {
  if (!text) return '';

  const trimmed = text.trim();
  if (!trimmed) return '';

  const withPeriod = trimmed.endsWith('.') ? trimmed : `${trimmed}.`;
  return `${withPeriod} `;
}

/**
 * Updates slide ARIA attributes and link focus management
 */
function updateSlideAccessibility(slides, activeSlideIndex) {
  slides.forEach((slide, idx) => {
    slide.setAttribute('role', 'group');
    slide.setAttribute('aria-roledescription', 'slide');
    slide.classList.add('slide');
    slide.setAttribute('aria-hidden', idx !== activeSlideIndex);

    slide.querySelectorAll('a').forEach((link) => {
      if (idx !== activeSlideIndex) {
        link.setAttribute('tabindex', '-1');
        link.setAttribute('aria-hidden', 'true');
      } else {
        link.removeAttribute('tabindex');
        link.removeAttribute('aria-hidden');
      }
    });
  });
}

/**
 * Updates the active slide visually and for accessibility.
 * - Sets the dataset property on the block.
 * - Updates ARIA attributes and slide counter.
 * - Handles link focus within visible slide.
 * @param {HTMLElement} slide - The slide element to make active.
 * @param {string} source - The source of the update ('navigation' or 'observer').
 */

function updateActiveSlide(slide, source = 'observer') {
  const block = slide.closest('.gallery');
  const slideIndex = parseInt(slide.dataset.slideIndex, 10);

  // Exit early if this slide is already active
  if (block.dataset.activeSlide === slideIndex.toString()) return;

  block.dataset.activeSlide = slideIndex;

  const slides = block.querySelectorAll('.carousel-slide');
  const totalSlides = slides.length;
  const currentSlide = slideIndex + 1;

  // Update slide counter
  const slideCounter = block.querySelector('.slide-counter');
  if (slideCounter) {
    const visibleText = `${currentSlide} ${placeholders.of} ${totalSlides}`;
    const accessibleText = `${placeholders.slide} ${currentSlide} ${placeholders.of} ${totalSlides}`;

    // Clear any previous content
    slideCounter.innerHTML = '';

    const { visualSpan, srSpan } = createSlideCounterSpans(visibleText, accessibleText);
    slideCounter.append(visualSpan, srSpan);
  }

  // Update slide ARIA states
  updateSlideAccessibility(slides, slideIndex);

  // Announce caption or alt text + slide number via live region
  const liveRegion = block.querySelector('.sr-live-region');
  if (!liveRegion) return;

  const shouldAnnounce =
    source === 'navigation' ||
    (source === 'observer' && block.dataset.isScrolling !== 'true');

  if (!shouldAnnounce) return;

  const slideText = `${placeholders.slide} ${currentSlide} ${placeholders.of} ${totalSlides}`;
  const captionText = getCaptionWithLinks(slide.querySelector('figcaption'));
  const altText = slide.querySelector('img')?.getAttribute('alt');
  const baseText = formatBaseText(captionText || altText);

  liveRegion.textContent = `${baseText}${slideText}`;
}

/**
 * Scrolls to a specific slide and updates state.
 * @param {HTMLElement} block - The carousel container.
 * @param {number} slideIndex - Index of the target slide.
 */

// eslint-disable-next-line default-param-last
function showSlide(block, slideIndex = 0) {
  const slides = block.querySelectorAll('.carousel-slide');
  let realSlideIndex = slideIndex < 0 ? slides.length - 1 : slideIndex;
  if (slideIndex >= slides.length) realSlideIndex = 0;
  const activeSlide = slides[realSlideIndex];

  // Mark as scrolling to prevent observer announcements
  block.dataset.isScrolling = 'true';

  updateActiveSlide(activeSlide, 'navigation');

  // Smooth scroll to the active slide
  block.querySelector('.carousel-slides').scrollTo({
    top: 0,
    left: activeSlide.offsetLeft,
    behavior: 'smooth',
  });

  // Clear scrolling flag after animation completes
  setTimeout(() => {
    block.dataset.isScrolling = 'false';
  }, 500);
}

/**
 * Creates navigation button click handlers
 */
function createNavigationHandlers(block) {
  const handlePrevious = () => {
    const currentSlide = parseInt(block.dataset.activeSlide || DEFAULT_SLIDE_INDEX, 10);
    showSlide(block, currentSlide - 1);
  };

  const handleNext = () => {
    const currentSlide = parseInt(block.dataset.activeSlide || DEFAULT_SLIDE_INDEX, 10);
    showSlide(block, currentSlide + 1);
  };

  return { handlePrevious, handleNext };
}

/**
 * Binds navigation and observer events to the carousel.
 * @param {HTMLElement} block - The main carousel block.
 */
function bindEvents(block) {
  const prevButton = block.querySelector('.slide-prev');
  const nextButton = block.querySelector('.slide-next');
  const carouselNavigation = block.querySelector('.carousel-navigation-buttons');

  // Get navigation handlers
  const { handlePrevious, handleNext } = createNavigationHandlers(block);

  // Navigation button events
  prevButton.addEventListener('click', handlePrevious);
  nextButton.addEventListener('click', handleNext);

  carouselNavigation.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      prevButton.focus();
      prevButton.click();
    } else if (event.key === 'ArrowRight') {
      nextButton.focus();
      nextButton.click();
    }
  });

  // Set initial active slide if not set
  if (!block.dataset.activeSlide) {
    block.dataset.activeSlide = DEFAULT_SLIDE_INDEX;
  }

  // Observe slides for intersection to auto-update active state
  const slideObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) updateActiveSlide(entry.target, 'observer');
      });
    },
    { threshold: INTERSECTION_THRESHOLD, root: block.querySelector('.carousel-slides') },
  );

  block.querySelectorAll('.carousel-slide').forEach((slide) => {
    slideObserver.observe(slide);
  });
}

/**
 * Creates a single carousel slide element from a DOM row.
 * @param {HTMLElement} row - DOM node representing the slide content.
 * @param {number} slideIndex - Index of this slide.
 * @param {number} totalSlides - Total number of slides.
 * @returns {HTMLElement} - The generated slide element.
 */
function createSlide(row, slideIndex, totalSlides) {
  const slide = createElementWithClasses('div', 'carousel-slide');
  slide.dataset.slideIndex = slideIndex;
  slide.setAttribute('aria-label', `${slideIndex + 1} ${placeholders.of} ${totalSlides}`);
  row.classList.add('carousel-slide-image');
  slide.append(row);

  // Set ARIA labeling if a heading exists
  const labeledBy = slide.querySelector('h2, h3, h4');
  if (labeledBy) {
    slide.setAttribute('aria-labelledby', labeledBy.getAttribute('id'));
  }

  return slide;
}

function attachTestIdToElements(block) {
  const elementsToAttach = [
    { selector: '.image-item', elementName: 'item' },
    { selector: '.image-item figure', elementName: 'figure' },
    { selector: '.image-item picture', elementName: 'picture-tag' },
    { selector: '.image-item figcaption', elementName: 'figcaption' },
    { selector: '.carousel-slide', elementName: 'slide' },
    { selector: '.carousel-navigation-buttons', elementName: 'slide-Nav-buttons' },
    { selector: '.slide-prev', elementName: 'slide-prev' },
    { selector: '.slide-next', elementName: 'slide-next' },
    { selector: '.slide-counter', elementName: 'slide-counter' },
  ];

  elementsToAttach.forEach(({ selector, elementName }) => {
    attachTestId({ block, selector, elementName });
  });
}

export default async function decorate(block) {
  const galleryChildren = [...block.children];
  // Fetching placeholders.json data
  const placeholder = await fetchLanguagePlaceholders();
  if (!placeholder || Object.keys(placeholder).length === 0) return;

  // Populate module-level placeholders with fallbacks
  placeholders = {
    containerAriaLabel: placeholder.galleryContainerAriaLabel,
    roleDescription: placeholder.galleryRoleDescription,
    slide: placeholder.gallerySlide,
    of: placeholder.gallerySlideOf,
    previousSlideLabel: placeholder.galleryPreviousSlideLabel,
    nextSlideLabel: placeholder.galleryNextSlideLabel,
  };

  const processedImages = await Promise.all(
    galleryChildren.map(async (child) => {
      const image = await buildImage(child);
      moveInstrumentation(child, image);
      return image;
    }),
  );
  const validImages = processedImages.filter((img) => img !== null);

  // Create outer container
  const container = createElementWithClasses('div', 'carousel-slides-container');

  container.setAttribute('role', 'group');
  container.setAttribute('aria-label', placeholders.containerAriaLabel);

  // Create slides wrapper
  const slidesWrapper = createElementWithClasses('div', 'carousel-slides');
  slidesWrapper.setAttribute('tabindex', '-1');

  // Append processed image slides
  validImages.forEach((image, idx) => {
    const slide = createSlide(image, idx, validImages.length);
    slidesWrapper.append(slide);
  });

  // Add live region for screen reader announcements
  const liveRegion = createElementWithClasses('div', 'sr-live-region', 'visually-hidden');
  liveRegion.setAttribute('aria-live', 'polite');
  liveRegion.setAttribute('aria-atomic', true);
  slidesWrapper.appendChild(liveRegion);

  container.append(slidesWrapper);

  // Add navigation and counter
  const slideNavButtons = createElementWithClasses('div', 'carousel-navigation-buttons');
  slideNavButtons.innerHTML = `
      <button type="button" class="slide-prev" aria-label="${placeholders.previousSlideLabel}"></button>
      <div class="slide-counter caption"></div>
      <button type="button" class="slide-next" aria-label="${placeholders.nextSlideLabel}"></button>
    `;
  container.append(slideNavButtons);

  // If container has a ficaption element then add a class of hasCaption to the container
  if (container.querySelector('figcaption')) {
    container.classList.add('hasCaption');
  }

  // remove existing content in the block
  block.innerHTML = ''; // Clear existing content
  // Add carousel container to block
  block.appendChild(container);

  // Initialize slide accessibility (hide links in non-active slides)
  const initialSlides = block.querySelectorAll('.carousel-slide');
  updateSlideAccessibility(initialSlides, DEFAULT_SLIDE_INDEX);

  // Initialize interactivity - this will set the activeSlide dataset
  updateActiveSlide(block.querySelector('.carousel-slide'), 'navigation');
  bindEvents(block);

  // testing requirement - set attribute 'data-testid' for elements
  attachTestIdToElements(block);
}
