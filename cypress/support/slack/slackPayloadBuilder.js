/* eslint-disable class-methods-use-this */
const IdentifySlackUser = require('./IdentifySlackUser.js');

const ENVIRONMENT = process.env.ENVIRONMENT || 'dev';
const { GITHUB_RUN_NUMBER } = process.env;
const { GITHUB_RUN_ID } = process.env;
const { GITHUB_REF_NAME } = process.env;
const { GITHUB_ACTOR } = process.env;
const { GITHUB_SERVER_URL } = process.env;
const { GITHUB_REPOSITORY } = process.env;
const { GITHUB_SHA } = process.env;
const { GITHUB_WORKFLOW } = process.env;
const SLACK_CHANNEL = 'test-automation-notification';

const RUN_STATUSES = {
  PASSED: 'PASSED',
  FAILED: 'FAILED',
  SKIPPED: 'SKIPPED',
  CANCELLED: 'CANCELLED',
  PENDING: 'PENDING',
};

const SLACK_NOTIFICATION_COLORS = {
  SUCCESS: '#2eb872',
  DANGER: '#e01e5a',
  NEUTRAL: '#A0A0A0',
  INFO: '#3AA3E3',
  UNKNOWN: '#444444',
};

function getPassRateEmoji(passRate) {
  const rate = Number(passRate);
  if (rate === 100) return '🟢🟢🟢🟢🟢';
  if (rate >= 95) return '🟢🟢🟢🟢🟢';
  if (rate >= 85) return '🟢🟢🟢🟢🟡';
  if (rate >= 75) return '🟢🟢🟢🟡🟡';
  if (rate >= 60) return '🟢🟡🟡🟡🟠';
  if (rate >= 45) return '🟡🟡🟠🟠🔴';
  if (rate >= 30) return '🟠🟠🔴🔴🔴';
  if (rate > 0) return '🔴🔴🔴🔴🔴';
  return '❌';
}

class SlackPayloadBuilder {
  buildPayload = async (results) => {
    if (!results) throw new Error('Results are undefined or null');
    this.runResult = this.#getRunResult(results);
    this.attachmentStatusColor = this.#getColor(this.runResult);
    this.skippedReason = await this.#getMessage(this.runResult);
    return this.#generatePayloadMetadata(results);
  };

  hasRunResultsPassed = async (results) => {
    if (!results) throw new Error('Results are undefined or null');
    this.runResult = this.#getRunResult(results);
    return this.runResult === RUN_STATUSES.PASSED;
  };

  // eslint-disable-next-line class-methods-use-this
  extracteds-siteReportUrl = async () => {
    const fallbackUrl = 'https://github.com';
    const githubPagesUrl = process.env.GITHUB_PAGES_URL;
    if (githubPagesUrl) {
      return githubPagesUrl;
    }
    if (!githubPagesUrl || githubPagesUrl.trim() === '') {
      console.warn('\n⚠️  Environment variable GITHUB_PAGES_URL is missing or empty.');
      console.warn('🔁 Falling back to the GitHub repository homepage.\n');
    }
    return fallbackUrl;
  };

  #getMessage = async (runResult) => {
    if (runResult === RUN_STATUSES.SKIPPED) {
      return 'All tests were skipped during execution';
    }
    return '';
  };

  #getColor = (runResult) => {
    const statusColors = {
      [RUN_STATUSES.PASSED]: SLACK_NOTIFICATION_COLORS.SUCCESS,
      [RUN_STATUSES.FAILED]: SLACK_NOTIFICATION_COLORS.DANGER,
      [RUN_STATUSES.SKIPPED]: SLACK_NOTIFICATION_COLORS.NEUTRAL,
      [RUN_STATUSES.CANCELLED]: SLACK_NOTIFICATION_COLORS.NEUTRAL,
      [RUN_STATUSES.PENDING]: SLACK_NOTIFICATION_COLORS.INFO,
    };
    return statusColors[runResult] || SLACK_NOTIFICATION_COLORS.UNKNOWN;
  };

  #getRunResult = (results) => {
    if (
      !results ||
      results.totalTests === 0 ||
      results.totalTests === results.totalSkipped
    ) return RUN_STATUSES.SKIPPED;

    if (process.env.JOB_STATUS === 'cancelled') return RUN_STATUSES.CANCELLED;
    if (results.totalTests === results.totalPending) return RUN_STATUSES.PENDING;
    if (results.totalFailed > 0) return RUN_STATUSES.FAILED;

    const { totalTests } = results;
    const totalPassed = results.totalPassed ?? 0;
    const totalPending = results.totalPending ?? 0;
    const totalSkipped = results.totalSkipped ?? 0;

    const sumValid =
      totalPassed === totalTests ||
      totalPassed + totalPending === totalTests ||
      totalPassed + totalPending + totalSkipped === totalTests;
    if (sumValid) return RUN_STATUSES.PASSED;
    return undefined;
  };

  #generatePayloadMetadata = async (results) => ({
    channel: SLACK_CHANNEL,
    username: 'Cypress Notifier',
    jobStatus: process.env.JOB_STATUS,
    runStatus: `${this.runResult}`,
    attachments: [
      {
        color: this.attachmentStatusColor,
        blocks: [
          ...(await this.#generateMainHeaderSection()),
          this.#generateDivider(),
          ...(results ? this.#generateTestResultSummary(results) : []),
          this.#generateDivider(),
          await this.#generateActionButtons(),
          ...(results?.totalFailed
            ? [this.#generateDivider(), ...this.#generateFailedSummarySection(results)]
            : []),
          this.#generateDivider(),
          this.#generateRepoBranchContext(),
        ],
      },
    ],
  });

  #generateActionButtons = async () => {
    const reportUrl = await this.extracteds-siteReportUrl();
    let buttonStyle;

    if (this.runResult === RUN_STATUSES.PASSED) {
      buttonStyle = 'primary';
    } else if (this.runResult === RUN_STATUSES.FAILED) {
      buttonStyle = 'danger';
    }
    const viewReportButton = {
      type: 'button',
      text: {
        type: 'plain_text',
        text: 'View Full Report',
      },
      url: reportUrl,
    };

    if (buttonStyle) {
      viewReportButton.style = buttonStyle;
    }
    return {
      type: 'actions',
      elements: [
        viewReportButton,
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: 'View GHA Console',
          },
          url: `${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID}`,
        },
      ],
    };
  };

  #generateRepoBranchContext = () => ({
    type: 'context',
    elements: [
      {
        type: 'image',
        image_url: 'https://slack.github.com/static/img/favicon-neutral.png',
        alt_text: 'GitHub Logo',
      },
      {
        type: 'mrkdwn',
        text: `<${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}|${GITHUB_REPOSITORY}> (Branch: <${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}/tree/${GITHUB_REF_NAME}|${GITHUB_REF_NAME}>) `,
      },
    ],
  });

  // eslint-disable-next-line prefer-template
  #generateMainHeaderSection = async () => {
    let headerText = '';
    let emojiPrefix = '';
    const reportUrl = await this.extracteds-siteReportUrl();

    if (this.runResult === RUN_STATUSES.PASSED) {
      headerText = '  E2E Test Run PASSED!  ';
      emojiPrefix = '🎊';
    } else if (this.runResult === RUN_STATUSES.FAILED) {
      headerText = '  E2E Test Run FAILED!  ';
      emojiPrefix = '❌';
    } else if (
      this.runResult === RUN_STATUSES.SKIPPED ||
      this.runResult === RUN_STATUSES.CANCELLED
    ) {
      headerText = `  E2E Test Run ${this.runResult}!  `;
      emojiPrefix = this.runResult === RUN_STATUSES.SKIPPED ? '⏭️' : '🚫';
    } else {
      headerText = `  E2E Test Run ${this.runResult}!  `;
      emojiPrefix = '⏳';
    }

    const skippedReasonLine = this.skippedReason
      ? `*Skipped Reason*: ${this.skippedReason}`
      : '';

    const reportLink = reportUrl ? ` [<${reportUrl}|_Report_>]` : '';
    const runUrl = `${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID}`;
    const buildLink = `<${runUrl}|#${GITHUB_RUN_NUMBER}>`;

    return [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `${emojiPrefix}  ${headerText}  ${emojiPrefix}`,
          emoji: true,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: [
            `*Build ID*: ${buildLink} _(${this.runResult.toLowerCase()} on ${ENVIRONMENT.toUpperCase()})_ ${reportLink ? `→ ${reportLink}` : ''}`,
            `*Triggered by*: <${GITHUB_SERVER_URL}/${GITHUB_ACTOR}|${GITHUB_ACTOR}>`,
            `*Workflow*: ${GITHUB_WORKFLOW} (<${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}/commit/${GITHUB_SHA}|#${GITHUB_SHA.substring(0, 7)}>)`,
            `*Branch*: <${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}/tree/${GITHUB_REF_NAME}|${GITHUB_REF_NAME}>`,
            skippedReasonLine,
          ]
            .filter(Boolean)
            .join('\n'),
        },
      },
    ];
  };

  #generateTestResultSummary = (results) => {
    const { totalTests, totalPassed, totalFailed, totalSkipped, totalPending } = results;
    const passRate =
      totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(1) : '0.0';
    const passRateEmoji = getPassRateEmoji(passRate);

    return [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*📊 Test Results Summary*',
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*🧮 Total Tests*: ${totalTests}`,
          },
          {
            type: 'mrkdwn',
            text: `*📈 Pass Rate*: ${passRate}% ${passRateEmoji}`,
          },
          {
            type: 'mrkdwn',
            text: `*✅ Passed*: ${totalPassed}/${totalTests}`,
          },
          {
            type: 'mrkdwn',
            text: `*❌ Failed*: ${totalFailed}/${totalTests}`,
          },
          {
            type: 'mrkdwn',
            text: `*⏭️ Skipped*: ${totalSkipped}`,
          },
          {
            type: 'mrkdwn',
            text: `*⏳ Pending*: ${totalPending}`,
          },
        ],
      },
    ];
  };

  #generateFailedTestRow = (failedTestName, failureReason) => ({
    type: 'section',
    fields: [
      {
        type: 'mrkdwn',
        text: `${failedTestName}`,
      },
      {
        type: 'mrkdwn',
        text: `${failureReason}`,
      },
    ],
  });

  #generateDivider = () => ({
    type: 'divider',
  });

  #generateFailedSummarySection = (results) => {
    const failedSection = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '❌ Failed test cases',
          emoji: true,
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: '*Failed test:*',
          },
          {
            type: 'mrkdwn',
            text: '*Reason:*',
          },
        ],
      },
      {
        type: 'divider',
      },
    ];

    if (results.totalFailed) {
      const failedTestRows = results.failedTests.map((failedTest) => {
        const testName = failedTest.title;
        const reason = failedTest.displayError
          .slice(0, Math.min(240, failedTest.displayError.length))
          .replaceAll('"', '');
        return this.#generateFailedTestRow(testName, reason);
      });
      failedTestRows.forEach((row) => failedSection.push(row, this.#generateDivider()));
    }

    const FAILED_SECTION_PREVIEW_LENGTH_LIMIT = 8000;
    if (JSON.stringify(failedSection).length > FAILED_SECTION_PREVIEW_LENGTH_LIMIT) {
      const messageForTooManyFailures = [
        {
          type: 'context',
          elements: [
            {
              type: 'image',
              image_url:
                'https://api.slack.com/img/blocks/bkb_template_images/notificationsWarningIcon.png',
              alt_text: 'notifications warning icon',
            },
            {
              type: 'mrkdwn',
              text: '*Too many test failures than Slack can list. Use the buttons above for more insights.*',
            },
          ],
        },
      ];

      return messageForTooManyFailures;
    }
    return failedSection;
  };

  buildThreadPayload = async (threadTs, failingTests) => {
    const { SLACK_FAILURE_NOTIFIER_TOKEN } = process.env;
    if (!threadTs || !failingTests || !SLACK_FAILURE_NOTIFIER_TOKEN) {
      throw new Error(
        'Cannot build thread payload because threadTs or test results are missing',
      );
    }
    const slackUser = new IdentifySlackUser(SLACK_FAILURE_NOTIFIER_TOKEN);
    const blocks = [];

    const userLookupPromises = failingTests.map(async (test) => {
      if (test.ownerEmail && test.ownerEmail.includes('.com')) {
        try {
          const userId = await slackUser.getSlackUserId(test.ownerEmail);
          return { email: test.ownerEmail, id: userId, error: null };
        } catch (error) {
          console.error(
            `Error fetching Slack user ID for email ${test.ownerEmail}: ${error.message}`,
          );
          return { email: test.ownerEmail, id: null, error: error.message };
        }
      }
      return { email: test.ownerEmail, id: null, error: 'Not an email or no owner' };
    });

    const userLookups = await Promise.all(userLookupPromises);

    for (let i = 0; i < failingTests.length; i += 1) {
      const test = failingTests[i];
      const lookupResult = userLookups[i];
      let ownerDetailsText = '';

      if (!test.ownerEmail) {
        console.log(
          `No owner email found in TESTOWNERS file for test "${test.title}".\n still continuing ahead with the slack notification....\n `,
        );
        ownerDetailsText =
          '⚠️ No owner found for this test. Please update the TESTOWNERS file\n';
      } else if (test.ownerEmail.includes('.com') === false) {
        const ownerSlackIdToTag = `!subteam^${test.ownerEmail}`;
        ownerDetailsText = `<${ownerSlackIdToTag}>`;
      } else {
        ownerDetailsText = lookupResult.id
          ? `<@${lookupResult.id}>`
          : `\`${test.ownerEmail}\` (Slack ID lookup failed: ${lookupResult.error || 'unknown reason'})`;
      }

      const sectionMarkdownText = `\n:bust_in_silhouette: *Owner* - ${ownerDetailsText}. ⚠️ Action required: Please investigate and resolve the failed test per SLA commitments.\n:exclamation: *Failing test ${
        i + 1
      }*\n:heavy_multiplication_x: *Title:* "${test.title}"\n:warning: *Root cause:* "${test.displayError}"`;

      const truncatedSectionMarkdownText =
        this.#truncateDisplayErrorIfTextIsGreaterThanExpected(sectionMarkdownText);

      const testSection = {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: truncatedSectionMarkdownText,
        },
      };

      blocks.push(testSection);

      if (i !== failingTests.length - 1) {
        const divider = {
          type: 'divider',
        };
        blocks.push(divider);
      }
    }

    return {
      channel: SLACK_CHANNEL,
      thread_ts: threadTs,
      blocks,
    };
  };

  #truncateDisplayErrorIfTextIsGreaterThanExpected(inputString) {
    const maxLength = 3000; // slack message limit
    if (inputString.length <= maxLength) {
      return inputString;
    }
    return inputString.slice(0, maxLength);
  }
}

module.exports = SlackPayloadBuilder;
