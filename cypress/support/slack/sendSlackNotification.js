const fs = require('fs').promises;
const FetchClient = require('./fetchClient.js');
const SlackPayloadBuilder = require('./slackPayloadBuilder.js');
const TestOwnersResolver = require('../testOwnerResolver.js');

class SlackNotificationService {
  constructor() {
    this.slackToken = process.env.SLACK_FAILURE_NOTIFIER_TOKEN;
    this.slackApiEndpoint = 'https://slack.com/api/chat.postMessage';
    this.mergedReportPath = 'cypress/reports/html/index.json';
    this.testOwnersFilePath = './cypress/TESTOWNERS';
    this.reportsDir = 'cypress/reports';
    this.debugMode = process.env.DEBUG === 'true';

    this.validateSlackToken();

    this.slackPayloadBuilder = new SlackPayloadBuilder();
    this.client = new FetchClient();

    if (this.debugMode) {
      console.log('\n🔧 ================= DEBUG MODE ACTIVE =================');
      console.log('🐛 Detailed internal logging is now enabled.');
      console.log('======================================================\n');
    }
  }

  debugLog(message, ...args) {
    if (this.debugMode) {
      console.log(message, ...args);
    }
  }

  validateSlackToken() {
    if (!this.slackToken || this.slackToken.trim() === '') {
      console.warn('\n=================⚠️  Slack Notification Warning =================');
      console.warn(
        '⚠️ Slack notifier disabled: SLACK_FAILURE_NOTIFIER_TOKEN is not set.',
      );
      console.warn('➡️ Notifications will not be sent for this test run.');
      console.warn('===============================================================\n');
    }
  }

  async processTestResults() {
    console.log(`🔍 Checking for merged test report at: ${this.mergedReportPath}`);

    const mochawesomeResults = await this.loadTestResults();
    if (!mochawesomeResults) {
      return;
    }

    const transformedResults = await this.transformResults(mochawesomeResults);
    await this.saveTransformedResults(transformedResults);

    const hasPassed =
      await this.slackPayloadBuilder.hasRunResultsPassed(transformedResults);

    if (!hasPassed) {
      console.warn('\n🚨 TEST FAILURE DETECTED 🚨');
      console.warn('❗ One or more tests have failed.');
      console.warn('📣 Sending failure notification to stakeholders via Slack...');
      console.warn('-------------------------------------------------------------\n');
    } else {
      console.log('\n✅ TEST SUCCESS ✅');
      console.log('🎉 All tests passed successfully!');
      console.log('📣 Sending success notification to stakeholders via Slack...');
      console.log('-------------------------------------------------------------\n');
    }

    await this.sendNotification(transformedResults);
  }

  async loadTestResults() {
    const fileExists = await fs
      .access(this.mergedReportPath)
      .then(() => true)
      .catch(() => false);

    if (!fileExists) {
      this.logFileNotFound();
      return null;
    }

    console.log(`✅ Found merged report file at ${this.mergedReportPath}`);

    try {
      const rawResults = await fs.readFile(this.mergedReportPath, 'utf8');
      console.log(`📄 File read successfully. Size: ${rawResults.length} characters`);

      console.log('🔄 Parsing JSON content...');
      const mochawesomeResults = JSON.parse(rawResults);
      console.log(
        `✅ Successfully parsed merged report. Found ${mochawesomeResults?.stats?.tests || 0} total tests`,
      );

      return mochawesomeResults;
    } catch (error) {
      this.logParsingError(error);
      return null;
    }
  }

  logFileNotFound() {
    console.warn(`⚠️  No merged test results found at ${this.mergedReportPath}.`);
    console.warn('   Please check that:');
    console.warn('   1. The test runner has completed successfully');
    console.warn('   2. The report merger has run');
    console.warn('   3. The path is correct');
    console.warn('   Skipping detailed Slack notification.');
  }

  logParsingError(error) {
    console.error(
      `❌ Error reading or parsing merged report at ${this.mergedReportPath}:`,
    );
    console.error(`   Error type: ${error.name}`);
    console.error(`   Error message: ${error.message}`);
    if (error.name === 'SyntaxError') {
      console.error(
        '   This appears to be a JSON parsing error. The file may be corrupted or incomplete.',
      );
    }
  }

  async transformResults(mochawesomeResults) {
    const testOwnersResolver = await TestOwnersResolver.createFromFile(
      this.testOwnersFilePath,
    );
    console.log('Code Owners Map loaded...');

    const transformedResults = {
      totalTests: mochawesomeResults.stats.tests,
      totalPassed: mochawesomeResults.stats.passes,
      totalFailed: mochawesomeResults.stats.failures,
      totalSkipped: mochawesomeResults.stats.skipped,
      totalPending: mochawesomeResults.stats.pending,
      failedTests: [],
    };

    this.extractFailedTests(mochawesomeResults, testOwnersResolver, transformedResults);
    return transformedResults;
  }

  extractFailedTests(mochawesomeResults, testOwnersResolver, transformedResults) {
    this.debugLog('🔍 Debug: Starting to extract failed tests...');

    mochawesomeResults.results.forEach((suite, suiteIndex) => {
      this.debugLog(`🔍 Debug: Processing suite ${suiteIndex}: ${suite.file}`);

      if (suite.tests && Array.isArray(suite.tests) && suite.tests.length > 0) {
        this.debugLog(`🔍 Debug: Suite has ${suite.tests.length} direct tests`);
        this.processTestsInSuite(
          suite.tests,
          suite,
          testOwnersResolver,
          transformedResults,
        );
      }

      if (suite.suites && Array.isArray(suite.suites)) {
        this.debugLog(`🔍 Debug: Suite has ${suite.suites.length} nested suites`);
        this.processNestedSuites(
          suite.suites,
          suite,
          testOwnersResolver,
          transformedResults,
        );
      }
    });

    this.debugLog(
      `🔍 Debug: Total failed tests extracted: ${transformedResults.failedTests.length}`,
    );
  }

  processNestedSuites(nestedSuites, parentSuite, testOwnersResolver, transformedResults) {
    nestedSuites.forEach((nestedSuite, nestedIndex) => {
      this.debugLog(
        `🔍 Debug: Processing nested suite ${nestedIndex}:`,
        nestedSuite.title || 'Untitled',
      );
      this.debugLog('🔍 Debug: Nested suite keys:', Object.keys(nestedSuite));

      if (nestedSuite.tests && Array.isArray(nestedSuite.tests)) {
        this.debugLog(`🔍 Debug: Nested suite has ${nestedSuite.tests.length} tests`);
        this.processTestsInSuite(
          nestedSuite.tests,
          parentSuite,
          testOwnersResolver,
          transformedResults,
        );
      }

      // Recursively process any further nested suites
      if (nestedSuite.suites && Array.isArray(nestedSuite.suites)) {
        this.debugLog(
          `🔍 Debug: Nested suite has ${nestedSuite.suites.length} further nested suites`,
        );
        this.processNestedSuites(
          nestedSuite.suites,
          parentSuite,
          testOwnersResolver,
          transformedResults,
        );
      }
    });
  }

  processTestsInSuite(tests, parentSuite, testOwnersResolver, transformedResults) {
    tests.forEach((test, testIndex) => {
      this.debugLog(
        `🔍 Debug: Test ${testIndex} - Title: ${test.title || test.fullTitle}`,
      );
      this.debugLog(`🔍 Debug: Test state: ${test.state}`);
      this.debugLog(`🔍 Debug: Test pass: ${test.pass}`);
      this.debugLog(`🔍 Debug: Test fail: ${test.fail}`);
      this.debugLog(`🔍 Debug: Test pending: ${test.pending}`);
      this.debugLog('🔍 Debug: Test err:', test.err ? 'Has error' : 'No error');

      // Check for failed tests using multiple possible indicators
      const isFailed = test.state === 'failed' || test.fail === true;

      if (isFailed) {
        this.debugLog(`✅ Debug: Found failed test: ${test.title || test.fullTitle}`);

        const displayError = this.extractErrorMessage(test);
        this.debugLog(
          `Getting owner for parentSuite.file: "${parentSuite.file}"`,
        );
        const ownerEmail = testOwnersResolver.findOwner(parentSuite.file);
        this.logOwnerResolution(ownerEmail, parentSuite.file);

        transformedResults.failedTests.push({
          title: test.fullTitle || test.title,
          displayError,
          ownerEmail,
        });
      } else {
        this.debugLog(
          `🔍 Debug: Test not considered failed: ${test.title || test.fullTitle}`,
        );
        if (test.err) {
          this.debugLog(
            `⚠️ Warning: Test passed but has error: ${test.title || test.fullTitle}`,
          );
        }
      }
    });
  }

  // eslint-disable-next-line class-methods-use-this
  extractErrorMessage(test) {
    if (test.err && test.err.message) {
      return test.err.message.split('\n')[0];
    }
    return 'ℹ️  No specific error message captured for this test.';
  }

  logOwnerResolution(ownerEmail, file) {
    if (ownerEmail) {
      this.debugLog(`🔍 Found owner "${ownerEmail}" for test file: ${file}`);
    } else {
      this.debugLog(`⚠️ No specific owner found in TESTOWNERS for test file: ${file}.`);
    }
  }

  async saveTransformedResults(transformedResults) {
    if (!this.debugMode) return;

    const transformedResultsPath = `${this.reportsDir}/transformed-results.json`;
    try {
      await fs.writeFile(
        transformedResultsPath,
        JSON.stringify(transformedResults, null, 2),
      );
      this.debugLog(`📄 Saved transformed results to: ${transformedResultsPath}`);
    } catch (error) {
      console.warn('🟡 Could not save transformed results to file:', error.message);
    }
  }

  async sendNotification(transformedResults) {
    try {
      const payload = await this.slackPayloadBuilder.buildPayload(transformedResults);
      await this.savePayloadForDebugging(payload);

      const slackResponse = await this.sendSlackMessage(payload);
      const parsedResponse = await slackResponse.json();

      if (parsedResponse.ok) {
        console.log('::group::✅ Slack Notification');
        console.log('SLACK NOTIFICATION SENT SUCCESSFULLY');
        console.log('========================================');
        console.log('::endgroup::');
        await this.handleThreadNotification(parsedResponse.ts, transformedResults);
      } else {
        this.handleSlackError(parsedResponse);
      }
    } catch (error) {
      console.error('Error sending Slack notification:', error);
    }
  }

  async savePayloadForDebugging(payload) {
    if (!this.debugMode) return;

    const payloadPath = `${this.reportsDir}/slack-payload.json`;
    try {
      await fs.writeFile(payloadPath, JSON.stringify(payload, null, 2));
      this.debugLog(`📄 Saved Slack payload to: ${payloadPath}`);
    } catch (error) {
      console.warn('Could not save Slack payload to file:', error.message);
    }
  }

  async sendSlackMessage(payload) {
    return this.client.request(this.slackApiEndpoint, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
        Authorization: `Bearer ${this.slackToken}`,
      },
      body: JSON.stringify(payload),
    });
  }

  async handleThreadNotification(threadIdentifier, transformedResults) {
    if (!threadIdentifier) {
      console.warn('\n⚠️  No Slack thread identifier found.');
      console.warn('🛑 Skipping test owner tagging in thread notification.\n');
      return;
    }
    if (!this.shouldTagOwners(transformedResults)) {
      console.log('\nℹ️  No owner-specific test failures found.');
      console.log('✅  Skipping Slack thread tagging.\n');
      return;
    }

    console.log('\n📣 Now tagging test owners in Slack thread for failed tests...\n');
    await this.sendThreadMessage(threadIdentifier, transformedResults.failedTests);
  }

  // eslint-disable-next-line class-methods-use-this
  shouldTagOwners(transformedResults) {
    return (
      transformedResults.totalFailed > 0 && transformedResults.failedTests.length > 0
    );
  }

  async sendThreadMessage(threadIdentifier, failedTests) {
    try {
      const threadMessagePayload = await this.slackPayloadBuilder.buildThreadPayload(
        threadIdentifier,
        failedTests,
      );

      const messageResult = await this.sendSlackMessage(threadMessagePayload);
      const threadResponseText = await messageResult.text();
      this.debugLog('🔍 Thread message response:', threadResponseText);
    } catch (error) {
      console.error('Error sending thread message:', error);
    }
  }

  // eslint-disable-next-line class-methods-use-this
  handleSlackError(parsedResponse) {
    console.error('\n🚨 SLACK NOTIFICATION FAILED\n');
    console.error('❗ An error occurred while trying to send a message to Slack.');
    console.error('🧾 Error Summary:', parsedResponse.error);
    console.error(
      '📦 Full Slack API Response:\n',
      JSON.stringify(parsedResponse, null, 2),
    );
    console.error(
      '💡 Please verify your Slack token, payload structure, and channel permissions.\n',
    );
  }
}

const sendNotification = async () => {
  try {
    const slackNotificationService = new SlackNotificationService();
    await slackNotificationService.processTestResults();
  } catch (error) {
    console.error('\n❌ FATAL: An error occurred in the Slack notification service.');
    console.error('💥 Details:', error, '\n');
    process.exit(1);
  }
};

sendNotification();
