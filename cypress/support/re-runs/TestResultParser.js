/* eslint-disable class-methods-use-this */
class TestResultParser {
  constructor(testOwnersResolver) {
    this.testOwnersResolver = testOwnersResolver;
  }

  // base structure for extracted results
  static DEFAULT_RESULT_STRUCTURE = {
    status: null,
    startedTestsAt: null,
    endedTestsAt: null,
    totalDuration: 0,
    totalSuites: 0,
    totalTests: 0,
    totalPassed: 0,
    totalPending: 0,
    totalFailed: 0,
    totalSkipped: 0,
    failedTests: [],
    config: {
      env: { grepTags: null },
      disabledTests: null,
    },
  };

  extract(results) {
    if (!this.#isValidResults(results)) {
      console.warn('⚠️ Invalid results provided to TestResultParser');
      return { ...TestResultParser.DEFAULT_RESULT_STRUCTURE };
    }
    const coreMetrics = this.#extractCoreMetrics(results);
    let failedTests = this.#extractFailedTests(results.runs);
    const config = this.#extractConfig(results.config);

    if (this.testOwnersResolver) {
      failedTests = failedTests.map((test) => ({
        ...test,
        ownerEmail: this.testOwnersResolver.findOwner(test.fileName) || null,
      }));
    }

    return {
      ...coreMetrics,
      failedTests,
      config,
    };
  }

  #isValidResults(results) {
    return results && typeof results === 'object' && Array.isArray(results.runs);
  }

  #extractCoreMetrics(results) {
    const {
      status = null,
      startedTestsAt = null,
      endedTestsAt = null,
      totalDuration = 0,
      totalSuites = 0,
      totalTests = 0,
      totalPassed = 0,
      totalPending = 0,
      totalFailed = 0,
      totalSkipped = 0,
    } = results;

    return {
      status,
      startedTestsAt,
      endedTestsAt,
      totalDuration,
      totalSuites,
      totalTests,
      totalPassed,
      totalPending,
      totalFailed,
      totalSkipped,
    };
  }

  #extractFailedTests(runs = []) {
    return runs.flatMap(({ tests = [], spec }) => {
      if (!spec?.relative) return [];

      return tests
        .filter((test) => test.state === 'failed')
        .map((test) => ({
          title: this.#formatTestTitle(test.title),
          displayError: test.displayError || '',
          fileName: spec.relative,
          ownerEmail: this.testOwnersResolver.findOwner(spec.relative),
        }));
    });
  }

  #formatTestTitle(title) {
    if (!title) return '';
    return Array.isArray(title) ? title.join(' ') : String(title);
  }

  #extractConfig(config = {}) {
    return {
      env: {
        grepTags: config.env?.grepTags || null,
      },
      disabledTests: config.excludeSpecPattern || null,
    };
  }
}

module.exports = { TestResultParser };
