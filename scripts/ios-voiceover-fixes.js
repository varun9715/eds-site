/* eslint-disable import/no-cycle */
import { fetchLanguagePlaceholders } from './scripts.js';

/**
 * Disables smooth scrolling for jump links that scroll up,
 * otherwise VoiceOver will focus on a random element during the scroll animation.
 *
 * This workaround is not required for links that scroll down though.
 */
function fixScrollUpJumpLinks() {
  const html = document.documentElement;
  const scrollUpLinks = document.querySelectorAll('.back-to-top-link');
  scrollUpLinks.forEach((anchorElement) => {
    anchorElement.addEventListener('click', (event) => {
      event.preventDefault();

      const target = document.querySelector(anchorElement.hash);
      if (target) {
        // Disable smooth scrolling
        const previousScrollBehavior = html.style.scrollBehavior;
        html.style.scrollBehavior = 'auto';

        // Jump scroll immediately
        target.scrollIntoView();

        // Reset smooth scrolling after a short delay
        setTimeout(() => {
          html.style.scrollBehavior = previousScrollBehavior;
        }, 10);
      }
    });
  });
}

async function fixToggleMenuButtons() {
  const placeholder = await fetchLanguagePlaceholders();
  if (!placeholder || Object.keys(placeholder).length === 0) return;

  // Build announcer
  const announcer = document.createElement('div');
  announcer.id = 'ios-voice-over-announcer';
  announcer.className = 'visually-hidden';
  announcer.ariaLive = 'polite';
  announcer.ariaHidden = 'true';
  document.body.appendChild(announcer);

  // Attach click listeners to menu toggle buttons
  document.querySelectorAll('.mobile-menu-toggle').forEach((button) => {
    button.addEventListener('click', () => {
      const opened = button.ariaExpanded === 'true';
      announcer.ariaHidden = 'false';
      setTimeout(() => {
        announcer.textContent = opened
          ? placeholder.globalCloseMenu
          : placeholder.globalOpenMenu;
        setTimeout(() => {
          announcer.ariaHidden = 'true';
        }, 1000);
      }, 150);
    });
  });
}

export default function applyFixes() {
  fixScrollUpJumpLinks();
  fixToggleMenuButtons();
}
