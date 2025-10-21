/* eslint-disable class-methods-use-this */
const fs = require('fs').promises;
const path = require('path');

class FailedTestIdentifier {
  constructor(options = {}) {
    this.testResultsPath =
      options.testResultsPath ||
      path.resolve(__dirname, '../../../cypress/testResults.json');
    this.outputFileName = options.outputFileName || 'failed-specs.txt';
    this.cypressFolder = path.dirname(this.testResultsPath);
    this.outputPath = path.join(this.cypressFolder, this.outputFileName);
    this.separator = options.separator || ',';
  }

  async readTestResults() {
    console.log(`📖 Reading test results from: ${this.testResultsPath}`);
    try {
      const data = await fs.readFile(this.testResultsPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.warn(`⚠️ Test results file not found at ${this.testResultsPath}`);
        return null;
      }
      throw new Error(`Failed to read test results: ${error.message}`);
    }
  }

  validateTestResults(testResults) {
    if (!testResults) return false;

    return (
      testResults.totalFailed > 0 &&
      Array.isArray(testResults.failedTests) &&
      testResults.failedTests.length > 0
    );
  }

  extractFailedTestFiles(failedTests) {
    return failedTests
      .map((test) => {
        if (!test?.fileName) {
          console.warn('⚠️ Skipping failed test without fileName property');
          return null;
        }
        return test.fileName;
      })
      .filter(Boolean);
  }

  async writeFailedTestFiles(fileNames) {
    if (fileNames.length === 0) {
      console.log('ℹ️ No valid failed test filenames to write');
      return false;
    }
    const content = fileNames.join(this.separator);
    try {
      await fs.writeFile(this.outputPath, content);
      console.log(
        `✅ Successfully created '${this.outputFileName}' with ${fileNames.length} failed test files`,
      );
      return true;
    } catch (error) {
      throw new Error(`Failed to write output file: ${error.message}`);
    }
  }

  async identify() {
    try {
      const testResults = await this.readTestResults();
      if (!this.validateTestResults(testResults)) {
        console.log(
          'ℹ️ No failed tests found - creating empty output file for shell compatibility',
        );
        // Imp - Create empty file to prevent shell errors in CI
        await fs.writeFile(this.outputFileName, '');
        return { success: true, filesWritten: 0 };
      }
      const failedTestFiles = this.extractFailedTestFiles(testResults.failedTests);
      const filesWritten = await this.writeFailedTestFiles(failedTestFiles);
      return {
        success: true,
        filesWritten: filesWritten ? failedTestFiles.length : 0,
        failedTestFiles,
      };
    } catch (error) {
      console.error('❌ Error identifying failed tests:', error.message);
      throw error;
    }
  }
}

async function identifyFailedTests(options = {}) {
  const identifier = new FailedTestIdentifier(options);
  return identifier.identify();
}

if (require.main === module) {
  identifyFailedTests()
    .then((result) => {
      console.log(`🎉 Process completed: ${result.filesWritten} files identified`);
      if (result.filesWritten === 0) {
        console.log('ℹ️ No failed tests to rerun - skipping rerun step');
      }
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Unexpected error:', error.message);
      process.exit(1);
    });
}

module.exports = {
  FailedTestIdentifier,
  identifyFailedTests,
};
