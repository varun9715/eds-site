/* eslint-disable class-methods-use-this */
class ResultsValidator {
  isValidCypressResults(results) {
    return (
      results && typeof results === 'object' && typeof results.totalFailed === 'number'
    );
  }

  isValidTestResults(results) {
    return (
      results &&
      typeof results === 'object' &&
      typeof results.totalTests === 'number' &&
      typeof results.totalPassed === 'number' &&
      typeof results.totalFailed === 'number'
    );
  }

  hasNewPassingTests(rerunResults) {
    const totalPassed = rerunResults?.totalPassed ?? 0;
    return totalPassed > 0;
  }
}

module.exports = { ResultsValidator };
