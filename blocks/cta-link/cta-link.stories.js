import decorate from './cta-link.js';
import './cta-link.css';

export default {
  title: 'Blocks/CTA Link',
  argTypes: {
    styles: {
      control: 'multi-select',
      options: ['first-cta-primary', 'fill-container', 'hug-content'],
      description: 'Style options for the CTA links',
    },
    link1CtaText: {
      control: 'text',
      description: 'Primary link text',
    },
    link1Cta: {
      control: 'text',
      description: 'Primary link URL',
    },
    link1AriaLabel: {
      control: 'text',
      description: 'Aria label for primary link',
    },
    link1QueryParamKey: {
      control: 'text',
      description: 'Query parameter key for primary link',
    },
    link1QueryParamValue: {
      control: 'text',
      description: 'Query parameter value for primary link',
    },
    link1CampaignCode: {
      control: 'text',
      description: 'Campaign code for primary link',
    },
    link2CtaText: {
      control: 'text',
      description: 'Secondary link text',
    },
    link2Cta: {
      control: 'text',
      description: 'Secondary link URL',
    },
    link2AriaLabel: {
      control: 'text',
      description: 'Aria label for secondary link',
    },
    link2QueryParamKey: {
      control: 'text',
      description: 'Query parameter key for secondary link',
    },
    link2QueryParamValue: {
      control: 'text',
      description: 'Query parameter value for secondary link',
    },
    link2CampaignCode: {
      control: 'text',
      description: 'Campaign code for secondary link',
    },
  },
};

const Template = ({
  styles = 'first-cta-primary',
  link1CtaText = 'Primary Link',
  link1Cta = 'https://qantas.com',
  link1AriaLabel = 'Primary link description',
  link1QueryParamKey = 'utm_source',
  link1QueryParamValue = 'storybook',
  link1CampaignCode = 'TEST_CAMPAIGN',
  link2CtaText = 'Secondary Link',
  link2Cta = 'https://qantas.com/help',
  link2AriaLabel = 'Secondary link description',
  link2QueryParamKey = 'utm_medium',
  link2QueryParamValue = 'storybook',
  link2CampaignCode = 'TEST_CAMPAIGN_2',
}) => {
  const block = document.createElement('div');
  block.classList.add('cta-link');

  // Create the structure that matches the block's expected format
  block.innerHTML = `
    <div>${styles}</div>
    <div>${link1CtaText}</div>
    <div><a href="${link1Cta}">${link1Cta}</a></div>
    <div>${link1AriaLabel}</div>
    <div>${link1QueryParamKey}</div>
    <div>${link1QueryParamValue}</div>
    <div>${link1CampaignCode}</div>
    <div>${link2CtaText}</div>
    <div><a href="${link2Cta}">${link2Cta}</a></div>
    <div>${link2AriaLabel}</div>
    <div>${link2QueryParamKey}</div>
    <div>${link2QueryParamValue}</div>
    <div>${link2CampaignCode}</div>
  `;

  // Apply the decorate function
  decorate(block);

  // Return the decorated block
  return block;
};

export const PrimaryOnly = Template.bind({});
PrimaryOnly.args = {
  link2CtaText: '',
  link2Cta: '',
};

export const SecondaryOnly = Template.bind({});
SecondaryOnly.args = {
  styles: '',
  link1CtaText: '',
  link1Cta: '',
};

export const BothLinks = Template.bind({});

export const ExternalLinks = Template.bind({});
ExternalLinks.args = {
  link1Cta: 'https://external-site.com',
  link2Cta: 'https://another-external-site.com',
};

export const WithQueryParams = Template.bind({});
WithQueryParams.args = {
  link1QueryParamKey: 'source',
  link1QueryParamValue: 'test',
  link2QueryParamKey: 'medium',
  link2QueryParamValue: 'test',
};

export const WithCampaignTracking = Template.bind({});
WithCampaignTracking.args = {
  link1CampaignCode: 'CAMPAIGN_2024_Q1',
  link2CampaignCode: 'CAMPAIGN_2024_Q2',
};

export const WithWidthOptions = Template.bind({});
WithWidthOptions.args = {
  styles: 'first-cta-primary,fill-container',
};

export const TextOnlyLinks = Template.bind({});
TextOnlyLinks.args = {
  link1Cta: 'https://qantas.com/text-only',
  link2Cta: 'https://qantas.com/help/text-only',
};

export const HugContentStyle = Template.bind({});
HugContentStyle.args = {
  styles: 'hug-content',
};

export const FillContainerStyle = Template.bind({});
FillContainerStyle.args = {
  styles: 'fill-container',
};

export const MultipleStyles = Template.bind({});
MultipleStyles.args = {
  styles: 'first-cta-primary,fill-container,hug-content',
};
