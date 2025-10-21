const { TestResultsReconciler } = require('./TestResultsReconciler.js');
const { ResultsReconciler } = require('./ResultsReconciler.js');
const { ResultsValidator } = require('./ResultsValidator.js');

const reconcileRerunResults = (originalTestResults, rerunExtractedResults) => {
  const reconciler = new ResultsReconciler();
  return reconciler.reconcile(originalTestResults, rerunExtractedResults);
};

module.exports = {
  TestResultsReconciler,
  ResultsReconciler,
  ResultsValidator,
  reconcileRerunResults,
};
