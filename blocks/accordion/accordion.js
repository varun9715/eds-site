import createAccordionItem from './accordionItem.js';
import { createElementWithClasses } from '../../scripts/utils/dom.js';
import { fetchLanguagePlaceholders } from '../../scripts/scripts.js';
import { isAuthorEditMode } from '../../scripts/utils/common-utils.js';

const toggleAccordion = (block, isAllExpanded) =>
  [...block.querySelectorAll('.accordion-item')].forEach((item) => {
    if (isAllExpanded) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
    const contentArea = item.querySelector('.accordion-panel');
    contentArea.setAttribute('aria-hidden', !isAllExpanded);
    const button = item.querySelector('.accordion-button');
    if (button) button.setAttribute('aria-expanded', isAllExpanded);
  });

const activateAccordionFromHash = () => {
  const { hash } = window.location;
  if (!hash) return;

  const id = hash.substring(1);
  if (!id) return;

  const targetElement = document.getElementById(id);
  if (!targetElement) return;

  // Check if it's an accordion-botton class
  if (!targetElement.classList.contains('accordion-button')) return;

  const accordionItem = targetElement.closest('.accordion-item');
  if (!accordionItem) return;

  const accordionPanel = accordionItem.querySelector('.accordion-panel');
  if (!accordionPanel) return;

  // Expand the accordion item
  accordionItem.classList.add('active');
  targetElement.setAttribute('aria-expanded', 'true');
  accordionPanel.setAttribute('aria-hidden', 'false');
};

const decorate = async (block) => {
  const [accordionHeadingTypeEl, isExpandFirstAccordionEl, isFaq, ...accordionListEl] = [
    ...block.children,
  ];

  block.innerHTML = '';

  if (isAuthorEditMode()) block.classList.add('author-edit');

  block.classList.add('accordion');
  let isAllExpanded = false;

  // Add data attribute to track expand all state
  block.setAttribute('data-expand-all-active', 'false');

  // Fetching placeholders.json data
  const placeholder = await fetchLanguagePlaceholders();
  if (!placeholder || Object.keys(placeholder).length === 0) return;

  const getLabel = () =>
    (isAllExpanded
      ? `${placeholder.accordionCollapseAll}`
      : `${placeholder.accordionExpandAll}`);
  const accordionHeadingType = accordionHeadingTypeEl?.textContent.trim();
  const isExpandFirstAccordion = isExpandFirstAccordionEl?.textContent.trim() === 'true';
  const isFaqEnabled = isFaq?.textContent.trim() === 'true';
  const expandAllButton = createElementWithClasses('button', 'expand-all-button');
  expandAllButton.textContent = getLabel();
  expandAllButton.setAttribute('aria-expanded', isAllExpanded.toString());
  expandAllButton.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    isAllExpanded = !isAllExpanded;
    expandAllButton.setAttribute('aria-expanded', isAllExpanded.toString());

    // Update the data attribute to track state
    block.setAttribute('data-expand-all-active', isAllExpanded.toString());

    toggleAccordion(block, isAllExpanded);
    e.currentTarget.textContent = getLabel();
  });

  if (accordionListEl.length > 0) block.append(expandAllButton);

  // Schema.org JSON-LD injection
  if (isFaqEnabled) {
    const schemaFaqs = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: accordionListEl
        .map((accordionItem) => {
          const question = accordionItem.children[0]?.innerHTML;
          const answer = accordionItem.children[2]?.innerHTML;

          if (!question || !answer) return null;

          // Clean whitespace but keep HTML, replace quotes to avoid JSON escaping
          const cleanQuestion = question
            .replace(/\s+/g, ' ')
            .replace(/"/g, "'") // Replace double quotes with single quotes
            .trim();

          const cleanAnswer = answer
            .replace(/\s+/g, ' ')
            .replace(/"/g, "'") // Replace double quotes with single quotes
            .trim();

          return {
            '@type': 'Question',
            name: cleanQuestion,
            acceptedAnswer: {
              '@type': 'Answer',
              text: cleanAnswer,
            },
          };
        })
        .filter((item) => item !== null),
    };

    const schemaScript = document.createElement('script');
    schemaScript.type = 'application/ld+json';
    schemaScript.id = 'faqpage-schema';
    schemaScript.textContent = JSON.stringify(schemaFaqs);
    document.head.appendChild(schemaScript);
  }

  block.append(
    ...(await Promise.all(
      accordionListEl.map((accordionItem, idx) =>
        createAccordionItem(
          accordionItem,
          isExpandFirstAccordion && idx === 0,
          `acc-${idx}`,
          accordionHeadingType,
        ),
      ),
    )),
  );

  // open accordion if id added to URL
  activateAccordionFromHash();
};

export default decorate;
