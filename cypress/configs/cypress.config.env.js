const { Tags } = require('../support/tagList.js');

const branchName = process.env.BRANCH_NAME || 'trunk';
const selectedEnv = process.env.CYPRESS_ENV || 'dev';

const createEnvConfig = ({ tag, domain, authorUrl }) => ({
  baseUrl: domain,
  grepTags: tag,
  env: {
    edsUrl: domain,
    authorUrl,
    universalEditorUrl: 'https://universal-editor-service.adobe.io',
  },
});

const envConfigs = {
  uat: createEnvConfig({
    tag: Tags.UAT,
    domain: 'https://uat.qantas.com',
    authorUrl: 'https://author-p147452-e1557413.adobeaemcloud.com',
  }),
  dev: createEnvConfig({
    tag: Tags.DEV,
    domain: `https://${branchName}.dev.qantas.com`,
    authorUrl: 'https://author-p147452-e1510306.adobeaemcloud.com',
  }),
  test: createEnvConfig({
    tag: Tags.TEST,
    domain: `https://${branchName}.test.qantas.com`,
    authorUrl: 'https://author-p147452-e1510355.adobeaemcloud.com',
  }),
  stage: createEnvConfig({
    tag: Tags.STG,
    domain: 'https://stage.qantas.com',
    authorUrl: 'https://author-p147452-e1510356.adobeaemcloud.com',
  }),
};

if (!envConfigs[selectedEnv]) {
  throw new Error(
    `Invalid CYPRESS_ENV: "${selectedEnv}". Valid options: ${Object.keys(envConfigs).join(', ')}`,
  );
}

module.exports = envConfigs[selectedEnv];
