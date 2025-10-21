/** @type { import('@storybook/html').Preview } */
const preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    options: {
      storySort: {
        order: ['Introduction'],
      },
    },
    backgrounds: {
      default: '$color-grey5',
      values: [
        {
          name: '$color-grey5',
          value: '#f8f8f8',
        },
        {
          name: '$color-white',
          value: '#ffffff',
        },
        {
          name: '$color-warning-bg',
          value: '#ffeac4',
        },
        {
          name: '$color-success-bg',
          value: '#d5f2ca',
        },
      ],
    },
  },
};

export default preview;
