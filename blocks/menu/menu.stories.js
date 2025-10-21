import decorate from './menu.js';
import './menu.css';

export default {
  title: 'Components/Navigation Menu',
};

const Template = () => {
  const block = document.createElement('div');
  block.classList.add('menu', 'shortcuts');
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

  // Apply the decorate function
  decorate(block);

  // Return the decorated block
  return block;
};

export const Default = Template.bind({});
