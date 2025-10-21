import fs from 'fs-extra';
import path, { dirname } from 'path';
import chalk from 'chalk';
import { fileURLToPath } from 'url';

const filename = fileURLToPath(import.meta.url);
const dir = dirname(filename);

function getReportType(filePath) {
  const fileName = path.basename(filePath);
  if (fileName.includes('testResults')) return 'custom';
  if (fileName.includes('merged-report') || fileName.includes('mochawesome')) return 'mochawesome';
  return 'unknown';
}

// possible report file locations
const possiblePaths = [
  path.resolve(dir, '../../../cypress/testResults.json'),
  path.resolve(dir, '../../../cypress/reports/merged-report.json'),
  path.resolve(dir, '../../../cypress/reports/mochawesome.json'),
  path.resolve(dir, '../../../cypress/results/results.json'),
  path.resolve(dir, '../../../testResults.json'),
  path.resolve(dir, '../../../reports/merged-report.json'),
];

function findReportFile() {
  const foundPath = possiblePaths.find((filePath) => fs.existsSync(filePath));
  return foundPath ? { path: foundPath, type: getReportType(foundPath) } : null;
}

function parseCustomReport(data) {
  return {
    status: data.status,
    startedAt: data.startedTestsAt,
    endedAt: data.endedTestsAt,
    duration: data.totalDuration,
    totalSuites: data.totalSuites,
    totalTests: data.totalTests,
    passed: data.totalPassed,
    failed: data.totalFailed,
    pending: data.totalPending,
    skipped: data.totalSkipped,
    failedTests: data.failedTests || [],
  };
}

function parseMochawesomeReport(data) {
  const stats = data.stats || {};
  const failures = data.failures || [];

  return {
    status: stats.failures > 0 ? 'FAILED' : 'PASSED',
    startedAt: stats.start || 'Unknown',
    endedAt: stats.end || 'Unknown',
    duration: stats.duration || 0,
    totalSuites: stats.suites || 0,
    totalTests: stats.tests || 0,
    passed: stats.passes || 0,
    failed: stats.failures || 0,
    pending: stats.pending || 0,
    skipped: stats.skipped || 0,
    failedTests: failures.map((failure) => ({
      title: failure.fullTitle || failure.title,
      fileName: failure.file || 'Unknown',
      displayError: failure.err?.message || failure.message || 'Unknown error',
    })),
  };
}

function formatRow(label, value, emoji = '', color = chalk.white) {
  const paddedLabel = chalk.bold(label.padEnd(18));
  return `${paddedLabel}: ${color(value)} ${emoji}`;
}

function drawBar(label, count, total, color, maxWidth = 34) {
  if (total === 0) return `${label.padEnd(10)} ${chalk.gray('░'.repeat(maxWidth))} ${count.toString().padStart(3)}`;

  const ratio = count / total;
  const filledLength = Math.round(ratio * maxWidth);
  const emptyLength = maxWidth - filledLength;

  const filledBar = color('█'.repeat(filledLength));
  const emptyBar = chalk.gray('░'.repeat(emptyLength));

  const labelPadded = label.padEnd(10);
  const value = count.toString().padStart(3);

  return `${labelPadded} ${filledBar}${emptyBar} ${value}`;
}

function generateReport(results) {
  console.log(chalk.cyanBright.bold('\n✨ CYPRESS TEST SUMMARY REPORT ✨'));
  console.log(chalk.gray('────────────────────────────────────────────'));

  console.log(
    formatRow(
      'Status',
      results.status,
      '',
      results.status === 'PASSED' ? chalk.green : chalk.red,
    ),
  );
  console.log(formatRow('Started At', results.startedAt, '🕒', chalk.gray));
  console.log(formatRow('Ended At', results.endedAt, '🕒', chalk.gray));
  console.log(formatRow('Duration', `${results.duration} ms`, '⏱️', chalk.blue));
  console.log(formatRow('Total Suites', results.totalSuites, '📦', chalk.magenta));
  console.log(formatRow('Total Tests', results.totalTests, '🧪'));
  console.log(formatRow('Passed', results.passed, '✅', chalk.green));
  console.log(formatRow('Pending', results.pending, '⚠️', chalk.yellow));
  console.log(formatRow('Failed', results.failed, '❌', chalk.red));
  console.log(formatRow('Skipped', results.skipped, '⏭️', chalk.gray));

  if (results.totalTests > 0) {
    const passRate = ((results.passed / results.totalTests) * 100).toFixed(1);
    console.log(formatRow('Pass Rate', `${passRate}%`, '', chalk.green));

    console.log(`\n${chalk.white.bold('📊 TEST DISTRIBUTION')}`);
    console.log(drawBar('Passed', results.passed, results.totalTests, chalk.green));
    console.log(drawBar('Failed', results.failed, results.totalTests, chalk.red));
    console.log(drawBar('Pending', results.pending, results.totalTests, chalk.yellow));
    console.log(drawBar('Skipped', results.skipped, results.totalTests, chalk.gray));
  }

  if (results.failedTests?.length) {
    console.log(`\n${chalk.red.bold('❌ FAILED TESTS:')}`);
    results.failedTests.forEach((test, index) => {
      console.log(`\n${chalk.red(`${index + 1}. ${test.title}`)}`);
      console.log(`${chalk.gray('   📁 File')}: ${chalk.blueBright(test.fileName)}`);
      console.log(
        `${chalk.gray('   🧯 Error')}: ${chalk.redBright(test.displayError.split('\n')[0])}`,
      );
    });
  } else if (results.failed === 0 && results.totalTests > 0) {
    console.log(`\n${chalk.greenBright('🎉 All tests passed!')}`);
  }

  console.log(chalk.gray('\n────────────────────────────────────────────\n'));
}

// Main execution
try {
  const reportFile = findReportFile();

  if (!reportFile) {
    console.error(chalk.red('❗ No report file found in any of these locations:'));
    possiblePaths.forEach((filePath) => console.error(chalk.gray(`   - ${filePath}`)));
    process.exit(1);
  }

  console.log(chalk.blue(`📋 Found report file: ${reportFile.path}`));
  console.log(chalk.blue(`📋 Report type: ${reportFile.type}`));

  const rawData = await fs.readFile(reportFile.path, 'utf8');
  const data = JSON.parse(rawData);

  let results;
  switch (reportFile.type) {
    case 'custom':
      results = parseCustomReport(data);
      break;
    case 'mochawesome':
      results = parseMochawesomeReport(data);
      break;
    default:
      // Try to auto-detect structure
      if (data.totalTests !== undefined) {
        results = parseCustomReport(data);
      } else if (data.stats !== undefined) {
        results = parseMochawesomeReport(data);
      } else {
        throw new Error('Unknown report format');
      }
  }

  generateReport(results);
} catch (error) {
  console.error(chalk.red(`❗ Error generating report: ${error.message}`));
  console.error(chalk.gray(error.stack));
  process.exit(1);
}
