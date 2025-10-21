import { describe, it, expect, vi, beforeEach } from 'vitest';
import decorate from './menu.js';

import { moveInstrumentation } from '../../scripts/scripts.js';

// Mock the moveInstrumentation function
vi.mock('../../scripts/scripts.js', () => ({
  moveInstrumentation: vi.fn(() => {}),
}));

describe('decorate()', () => {
  let block;

  beforeEach(() => {
    vi.clearAllMocks();

    // Create a mock block element with children
    block = document.createElement('div');
    block.innerHTML = `
        <div>
            <div>
                <p>Shortcut</p>
            </div>
        </div>
        <div>
            <div>
                <p>
                    <a href="#" title="Book flights" class="button">Book flights</a>
                </p>
            </div>
            <div>
                <p><span class="icon icon-runway_pictogram_plane_tail_red"><img data-icon-name="runway_pictogram_plane_tail_red" src="/icons/runway_pictogram_plane_tail_red.svg" alt="" loading="lazy"></span></p>
            </div>
        </div>
        <div>
            <div>
                <p><a href="#" title="Check-in" class="button">Check-in</a></p>
            </div>
            <div>
                <p><span class="icon icon-runway_pictogram_boarding_passes_plane"><img data-icon-name="runway_pictogram_boarding_passes_plane" src="/icons/runway_pictogram_boarding_passes_plane.svg" alt="" loading="lazy"></span></p>
            </div>
        </div>
        <div>
            <div>
                <p><a href="#" title="Manage booking" class="button">Manage booking</a></p>
            </div>
            <div>
                <p><span class="icon icon-runway_pictogram_cogwheel_with_plane"><img data-icon-name="runway_pictogram_cogwheel_with_plane" src="/icons/runway_pictogram_cogwheel_with_plane.svg" alt="" loading="lazy"></span></p>
            </div>
        </div>
        <div>
            <div>
                <p><a href="#" title="Flight status" class="button">Flight status</a></p>
            </div>
            <div>
                <p><span class="icon icon-runway_pictogram_plane_with_clock"><img data-icon-name="runway_pictogram_plane_with_clock" src="/icons/runway_pictogram_plane_with_clock.svg" alt="" loading="lazy"></span></p>
            </div>
        </div>
        <div>
            <div>
                <p><a href="#" title="Baggage" class="button">Baggage</a></p>
            </div>
            <div>
                <p><span class="icon icon-runway_pictogram_baggage_additional_payment"><img data-icon-name="runway_pictogram_baggage_additional_payment" src="/icons/runway_pictogram_baggage_additional_payment.svg" alt="" loading="lazy"></span></p>
            </div>
        </div>
        <div>
            <div>
                <p><a href="#" title="Travel credits" class="button">Travel credits</a></p>
            </div>
            <div>
                <p><span class="icon icon-runway_pictogram_ticket_multi_trip"><img data-icon-name="runway_pictogram_ticket_multi_trip" src="/icons/runway_pictogram_ticket_multi_trip.svg" alt="" loading="lazy"></span></p>
            </div>
        </div>`;
  });

  it('should transform the block into a list of menus', () => {
    decorate(block);

    // Check if the block is transformed into a ul element
    const ul = block.querySelector('ul');
    expect(ul).not.toBeNull();

    // Check if the ul element contains li elements
    const liElements = ul.querySelectorAll('li');
    expect(liElements.length).toBe(6);
  });

  it('should call moveInstrumentation for each row and image', () => {
    decorate(block);

    // Check if moveInstrumentation is called for each row and image
    expect(vi.mocked(moveInstrumentation).mock.calls.length).toBe(6);
  });

  it('should render menu heading as h3', () => {
    decorate(block);

    const heading = block.querySelector('h3');
    expect(heading).not.toBeNull();
    expect(heading.textContent).toBe('Shortcut');
  });

  it('links should include analytics elements', () => {
    decorate(block);

    [...block.querySelectorAll('ul li')].forEach((li) => {
      const linkElement = li.querySelector('a');
      expect(linkElement).not.toBeNull();
      expect(linkElement.getAttribute('data-wae-event')).toBe('menu_click');
      expect(linkElement.getAttribute('data-wae-menu-type')).toBe('header');
      expect(linkElement.getAttribute('data-wae-menu-level')).toBe('2');
    });
  });
});
