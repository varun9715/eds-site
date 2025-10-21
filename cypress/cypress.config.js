/* eslint-disable import/no-unresolved, import/extensions, import/no-dynamic-require,
global-require, no-console */
const { exchange } = require('qantas-adobe-helper');
const fs = require('fs');
const eyesPlugin = require('@applitools/eyes-cypress');
const cypressFailFast = require('cypress-fail-fast/plugin.js');
const path = require('path');
const { defineConfig } = require('cypress');
const envConfig = require('./configs/cypress.config.env.js');
const { TestResultsReconciler } = require('./support/re-runs/ReconcileRerunResults.js');
const { logCypressConfig } = require('./support/utils/debugLogger');

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const env = process.env.CYPRESS_ENV || 'dev';
const isRunningOnGHA = process.env.GITHUB_ACTIONS === 'true';
const isParallelRun = process.env.CYPRESS_PARALLEL === 'true';
const jobIndex = process.env.CYPRESS_JOB_INDEX;

const envVariables = {
  ...process.env,
  ...(isRunningOnGHA ? { AKAMAIHEADER: undefined, AKAMAIHEADERPASSWORD: undefined } : {}),
};
const cypressResultFilePath =
  isParallelRun && jobIndex
    ? path.resolve(__dirname, `test-results-${jobIndex}`, 'testResults.json')
    : path.resolve(__dirname, 'testResults.json');

function ensureDirectoryExists(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function loadCredentials() {
  const credPath = path.resolve(__dirname, '../tech_account_creds.json');

  if (fs.existsSync(credPath)) {
    try {
      return require(credPath);
    } catch (error) {
      console.error('❌ Error loading tech_account_creds.json:', error.message);
      throw new Error('Failed to load or parse tech account credentials');
    }
  } else {
    console.error('❌ tech_account_creds.json file not found at:', credPath);
    throw new Error('Tech account credentials file not found');
  }
}

function getReporterConfig() {
  return {
    reporter: 'cypress-mochawesome-reporter',
    reporterOptions: {
      reportDir: 'cypress/reports',
      reportFilename: 'report',
      saveHtml: true,
      saveJson: true,
      embeddedScreenshots: true,
      inlineAssets: true,
      reportTitle: `eds-site-regression-${env}`,
      reportPageTitle: `eds-site-regression-${env}`,
    },
  };
}

module.exports = eyesPlugin(
  defineConfig({
    video: true,
    videoCompression: 38,
    videosFolder: 'cypress/videos',
    retries: {
      runMode: 2,
    },
    viewportWidth: 1024,
    viewportHeight: 768,
    ...getReporterConfig(),
    e2e: {
      defaultCommandTimeout: 15000,
      pageLoadTimeout: 30000,
      requestTimeout: 15000,
      baseUrl: envConfig.baseUrl,
      env: {
        ...envConfig.env,
        grepTags: envConfig.grepTags,
      },
      setupNodeEvents(on, config) {
        logCypressConfig(config, { isParallelRun, isRunningOnGHA, jobIndex });
        config.baseUrl = envConfig.baseUrl;
        if (envConfig.env) {
          config.env = {
            ...envConfig.env,
            ...config.env,
            ...envVariables,
            grepFilterSpecs: true,
            grepOmitFiltered: true,
            FAIL_FAST_STRATEGY: 'spec',
            FAIL_FAST_ENABLED: true,
          };
        }

        require('cypress-mochawesome-reporter/plugin')(on);
        require('@cypress/grep/src/plugin.js')(on, config);

        on('task', {
          log(message) {
            console.log(message);
            return null;
          },
          async exchangeJwtForAccessToken() {
            try {
              // Load credentials dynamically when the task is called
              const jsonFile = loadCredentials();
              const response = await exchange(jsonFile);

              if (!response.access_token) {
                throw new Error(
                  'Failed to obtain access token for UniversalEditorHTTPServices',
                );
              }
              return response.access_token;
            } catch (error) {
              console.error('❌ Error in exchangeJwtForAccessToken:', error.message);
              throw error;
            }
          },
        });

        on('before:run', async (details) => {
          const { AEMStatusService } = require('./support/AEM/aemStatusServices.js');
          const aemStatusService = new AEMStatusService(config.env.edsUrl);
          await aemStatusService.waitUntilHomepageAvailable();

          const { beforeRunHook } = require('cypress-mochawesome-reporter/lib');
          await beforeRunHook(details);
        });

        on('after:spec', async (spec, results) => {
          if (results && results.video) {
            const testsPassed = results.stats.failures === 0;
            if (!isRunningOnGHA && testsPassed) {
              try {
                fs.unlinkSync(results.video);
                console.log(`✅ Deleted video for passed spec: ${spec.relativeFile}`);
              } catch (err) {
                console.warn(
                  `⚠️ Could not delete video ${results.video} after passed spec:`,
                  err.message,
                );
              }
            }
          }
        });

        on('after:run', async (results) => {
          try {
            ensureDirectoryExists(cypressResultFilePath);
            const testReconciler = new TestResultsReconciler({
              resultFilePath: cypressResultFilePath,
            });
            await testReconciler.processResults(results);
            console.log(`✅ Results written to ${cypressResultFilePath}`);
            const fallbackResultPath = path.resolve(__dirname, 'testResults.json');
            if (cypressResultFilePath !== fallbackResultPath) {
              fs.copyFileSync(cypressResultFilePath, fallbackResultPath);
              console.log(
                `📄 Copied test results to ${fallbackResultPath} for rerun compatibility`,
              );
            }
          } catch (error) {
            console.error('❌ Error in custom test reconciliation:', error);
          }
          try {
            const { afterRunHook } = require('cypress-mochawesome-reporter/lib');
            await afterRunHook?.(results);
          } catch (error) {
            console.error(
              '❌ Error in cypress-mochawesome-reporter afterRunHook:',
              error,
            );
          }
        });

        cypressFailFast(on, config);
        return config;
      },
      specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    },
  }),
);
