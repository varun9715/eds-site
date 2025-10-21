import decorate from './logo.js';

export default {
  title: 'Components/Logo',
};

const Template = () => {
  const block = document.createElement('div');
  block.classList.add('logo');

  const logoData = [
    {
      text: 'Qantas',
      link: '#',
      imgSrc: '/icons/runway_brand_logo_master_qantas_horiz.svg',
    },
  ];

  logoData.forEach((data) => {
    block.innerHTML += `
    <a href="${data.link}" title="${data.text}" class=""><img data-icon-name="runway_brand_logo_master_qantas_horiz" src="${data.imgSrc}">${data.text}</a>
    `;
  });

  // Apply the decorate function
  decorate(block);

  // Return the decorated block
  return block;
};

export const Default = Template.bind({});
