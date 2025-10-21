export default {
  title: 'Components/Title',
};

const createHeading = (tag, text) => {
  const heading = document.createElement(tag);
  heading.innerText = text;
  return heading;
};

export const Headings = {
  render: (args) => {
    const container = document.createElement('div');
    const headings = ['h1', 'h2', 'h3', 'h4'];

    headings.forEach((tag) => {
      const heading = createHeading(tag, `${tag.toUpperCase()} - ${args.text}`);
      container.appendChild(heading);
    });

    return container;
  },
  args: {
    text: 'Sample Heading',
  },
  argTypes: {
    text: {
      control: { type: 'text' },
    },
  },
};
