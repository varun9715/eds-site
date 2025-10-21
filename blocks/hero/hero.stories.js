import decorate from './hero.js';
import './hero.css';

export default {
  title: 'Blocks/Hero',
};

const Template = () => {
  const block = document.createElement('div');
  block.classList.add('hero');

  // Array of card data
  const heroData = [
    'https://delivery-p146463-e1510253.adobeaemcloud.com/adobe/assets/urn:aaid:aem:95c8832d-7df6-4769-bb8d-cc420b7fbf9c',
    'true',
    'Photo courtesy of Mad Paws',
    'Qantas Pet Sitting',
    'Need someone to love your pet while you are away? We have partnered with Mad Paws to connect you with one of over 14,000 trusted, local and insured pet sitters.',
    'https://delivery-p146463-e1510253.adobeaemcloud.com/adobe/assets/urn:aaid:aem:a8614f7e-2849-408e-9d59-24e0373c1591',
    'true',
  ];

  block.innerHTML += `
          <div>
            <div><a href="${heroData[0]}" title="alt text 1">${heroData[0]}</a></div>
          </div>
          <div>
            <div>${heroData[1]}</div>
          </div>
          <div>
            <div>${heroData[2]}</div>
          </div>
          <div>
            <div>
              <h1 id="qantas-pet-sitting">${heroData[3]}</h1>
            </div>
          </div>
          <div>
            <div>${heroData[4]}</div>
          </div>
          <div>
            <div><a href="${heroData[5]}" title="logo text 1">${heroData[5]}</a></div>
          </div>
          <div>
            <div>${heroData[6]}</div>
          </div>

    `;

  // Apply the decorate function
  decorate(block);

  // Return the decorated block
  return block;
};

export const Default = Template.bind({});
