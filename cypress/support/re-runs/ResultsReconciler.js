/* eslint-disable class-methods-use-this */
class ResultsReconciler {
  reconcile(originalResults, rerunResults) {
    if (!this.#validateInputs(originalResults, rerunResults)) {
      console.warn('⚠️ Invalid reconciliation inputs. Returning original results.');
      return originalResults;
    }

    this.#logReconciliationStart(originalResults, rerunResults);

    const reconciledResults = this.#performReconciliation(
      { ...originalResults },
      rerunResults,
    );

    this.#logReconciliationComplete(reconciledResults);
    this.#validateReconciledResults(reconciledResults);

    return reconciledResults;
  }

  #validateInputs(original, rerun) {
    return original && rerun && typeof original === 'object' && typeof rerun === 'object';
  }

  #performReconciliation(original, rerun) {
    // 1. Accumulate total duration
    original.totalDuration = this.#calculateTotalDuration(original, rerun);

    // 2. Update failure counts (key insight: fewer failures = tests that now pass)
    original.totalFailed = Math.min(original.totalFailed || 0, rerun.totalFailed || 0);

    // 3. Recalculate passed tests based on updated failure count
    original.totalPassed = this.#calculatePassedTests(original);

    // 4. Update timing and metadata
    original.endedTestsAt = rerun.endedTestsAt || original.endedTestsAt;
    original.lastUpdated = new Date().toISOString();

    // 5. Update failed tests list with latest failures
    original.failedTests = this.#consolidateFailedTests(
      original.failedTests,
      rerun.failedTests,
    );

    // 6. Add rerun metadata
    original.rerunMetadata = this.#buildRerunMetadata(original, rerun);

    return original;
  }

  #calculateTotalDuration(original, rerun) {
    const originalDuration = original.totalDuration || 0;
    const rerunDuration = rerun.totalDuration || 0;
    return originalDuration + rerunDuration;
  }

  #calculatePassedTests(results) {
    const totalTests = results.totalTests || 0;
    const totalFailed = results.totalFailed || 0;
    const totalPending = results.totalPending || 0;
    const totalSkipped = results.totalSkipped || 0;

    const totalPassed = totalTests - totalFailed - totalPending - totalSkipped;
    return Math.max(0, totalPassed); // Ensure non-negative
  }

  #consolidateFailedTests(originalFailed = [], rerunFailed = []) {
    // Use rerun failed tests as the source of truth
    // but preserve any additional context from original failures
    const rerunFailedMap = new Map(
      rerunFailed.map((test) => [this.#getTestKey(test), test]),
    );

    // Add any original failed tests that weren't re-run
    const consolidatedTests = [...rerunFailed];

    originalFailed.forEach((originalTest) => {
      const testKey = this.#getTestKey(originalTest);
      if (!rerunFailedMap.has(testKey)) {
        // This test wasn't re-run, so keep original failure
        consolidatedTests.push({
          ...originalTest,
          wasNotRerun: true,
        });
      }
    });

    return consolidatedTests;
  }

  #getTestKey(test) {
    // Create unique key for test identification
    return `${test.title || test.name || ''}-${test.fullTitle || ''}`.trim();
  }

  #buildRerunMetadata(original, rerun) {
    const existingReruns = original.rerunMetadata?.rerunCount || 0;

    return {
      rerunCount: existingReruns + 1,
      lastRerunAt: new Date().toISOString(),
      improvementSummary: {
        testsFixed: (original.totalFailed || 0) - (rerun.totalFailed || 0),
        additionalDuration: rerun.totalDuration || 0,
      },
    };
  }

  #logReconciliationStart(original, rerun) {
    console.log('🔄 Starting test results reconciliation...');
    console.log('📊 Original Results:', this.#formatResultsSummary(original));
    console.log('🔍 Rerun Results:', this.#formatResultsSummary(rerun));
  }

  #logReconciliationComplete(results) {
    console.log('✅ Reconciliation complete!');
    console.log('📈 Final Results:', this.#formatResultsSummary(results));

    if (results.rerunMetadata?.improvementSummary?.testsFixed > 0) {
      console.log(
        `🎉 Great! Fixed ${results.rerunMetadata.improvementSummary.testsFixed} test(s) in this rerun!`,
      );
    }
  }

  #formatResultsSummary(results) {
    return {
      totalTests: results.totalTests || 0,
      totalPassed: results.totalPassed || 0,
      totalFailed: results.totalFailed || 0,
      totalPending: results.totalPending || 0,
      totalSkipped: results.totalSkipped || 0,
      totalDuration: `${Math.round((results.totalDuration || 0) / 1000)}s`,
    };
  }

  #validateReconciledResults(results) {
    const total =
      (results.totalPassed || 0) +
      (results.totalFailed || 0) +
      (results.totalPending || 0) +
      (results.totalSkipped || 0);

    if (total !== (results.totalTests || 0)) {
      console.warn("⚠️ Results validation warning: Test counts don't add up correctly");
      console.warn(`Expected: ${results.totalTests}, Actual: ${total}`);
    }
  }
}

module.exports = { ResultsReconciler };
