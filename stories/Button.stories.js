export default {
  title: 'Components/Button',
};

export const Primary = {
  render: (args) => {
    const btn = document.createElement('button');
    btn.innerText = args.label;

    // const mode = args.primary ? 'primary' : 'secondary';
    const { variant } = args;
    const { size } = args;
    const { width } = args;
    btn.className = ['button-test', variant, size, width].join(' ');

    return btn;
  },
  args: {
    icon: true,
    label: 'Button',
  },
  argTypes: {
    variant: {
      options: ['primary', 'secondary', 'tertiary', 'muted'],
      control: { type: 'radio' },
    },
    size: {
      options: ['small', 'medium', 'large', 'xlarge'],
      control: { type: 'radio' },
    },
    width: {
      options: ['hug', 'full'],
      control: { type: 'radio' },
    },
  },
};
