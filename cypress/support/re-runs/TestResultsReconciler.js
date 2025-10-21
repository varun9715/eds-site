/* eslint-disable class-methods-use-this */
const fs = require('fs').promises;
const path = require('path');
const fsSync = require('fs');
const { ResultsReconciler } = require('./ResultsReconciler.js');
const { ResultsValidator } = require('./ResultsValidator.js');
const { TestResultParser } = require('./TestResultParser.js');
const TestOwnersResolver = require('../testOwnerResolver.js');

const testOwnersFilePath = path.resolve(__dirname, '../../TESTOWNERS');

class TestResultsReconciler {
  constructor(options = {}) {
    this.resultFilePath = options.resultFilePath || './cypress/testResults.json';
    this.resultParser = new TestResultParser();
    this.validator = new ResultsValidator();
  }

  async processResults(cypressResults) {
    if (!this.validator.isValidCypressResults(cypressResults)) {
      console.warn('⚠️ Invalid or missing Cypress results. Skipping processing.');
      return;
    }

    const testOwnersResolver =
      await TestOwnersResolver.createFromFile(testOwnersFilePath);
    this.resultParser = new TestResultParser(testOwnersResolver);

    const runStatus = this.#determineRunStatus(cypressResults);
    console.log(`🚀 Test run completed with status: ${runStatus}`);

    cypressResults.status = runStatus;
    const extractedResults = this.resultParser.extract(cypressResults);

    let isRerun;
    try {
      await fs.access(this.resultFilePath);
      isRerun = true;
    } catch (e) {
      isRerun = false;
    }

    if (isRerun) {
      await this.#handleRerun(extractedResults);
    } else {
      await this.#handleInitialRun(extractedResults);
    }
  }

  #determineRunStatus(results) {
    const totalFailed = results.totalFailed ?? 0;
    return totalFailed > 0 ? 'FAILED' : 'PASSED';
  }

  async #handleRerun(newResults) {
    console.log('🔄 Detected RE-RUN. Processing results reconciliation...');

    try {
      const originalResults = await this.#loadOriginalResults();
      if (!this.validator.hasNewPassingTests(newResults)) {
        console.log('ℹ️ No new passing tests in re-run. Skipping reconciliation.');
        return;
      }
      const reconciledResults = this.#reconcileResults(originalResults, newResults);
      await this.#saveResults(reconciledResults);

      console.log('✅ Successfully reconciled and updated test results.');
    } catch (error) {
      console.error('❌ Failed to process re-run results:', error);
      // Fallback: save new results as-is
      await this.#saveResults(newResults);
    }
  }

  async #handleInitialRun(results) {
    console.log('📝 Generating new test results file...');
    await this.#saveResults(results);
    console.log('✅ Created testResults.json from initial test run.');
  }

  async #loadOriginalResults() {
    try {
      const fileContent = await fs.readFile(this.resultFilePath, 'utf8');
      const originalData = JSON.parse(fileContent);

      if (!this.validator.isValidTestResults(originalData)) {
        throw new Error('Original results file is corrupted or invalid');
      }
      return originalData;
    } catch (error) {
      throw new Error(`Failed to load original results: ${error.message}`);
    }
  }

  #reconcileResults(originalResults, rerunResults) {
    const reconciler = new ResultsReconciler();
    return reconciler.reconcile(originalResults, rerunResults);
  }

  async #saveResults(results) {
    const formattedResults = JSON.stringify(results, null, 2);

    const dir = path.dirname(this.resultFilePath);
    if (!fsSync.existsSync(dir)) {
      await fs.mkdir(dir, { recursive: true });
    }

    await fs.writeFile(this.resultFilePath, formattedResults);
    console.log(`✅ Test results written to ${this.resultFilePath}`);
  }
}

module.exports = { TestResultsReconciler };
