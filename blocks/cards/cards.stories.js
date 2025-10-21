import decorate from './cards.js';
import './cards.css';

export default {
  title: 'Components/Cards',
};

const Template = () => {
  const block = document.createElement('div');
  block.classList.add('cards');

  // Array of card data
  const cardData = [
    {
      imgSrc: 'https://via.placeholder.com/150',
      title: 'Unmatched speed',
      description: 'AEM is the fastest way to publish, create, and serve websites',
    },
    {
      imgSrc: 'https://via.placeholder.com/150',
      title: 'Seamless Integration',
      description: 'Easily integrate with other Adobe products',
    },
    {
      imgSrc: 'https://via.placeholder.com/150',
      title: 'Scalability',
      description: 'Scale your content effortlessly with AEM',
    },
  ];

  cardData.forEach((data) => {
    block.innerHTML += `
      <div class="card">
        <div>
          <img src="${data.imgSrc}" alt="Sample Image">
        </div>
        <div>
          <p><strong>${data.title}</strong></p>
          <p>${data.description}</p>
        </div>
      </div>
    `;
  });

  // Apply the decorate function
  decorate(block);

  // Return the decorated block
  return block;
};

export const Default = Template.bind({});
