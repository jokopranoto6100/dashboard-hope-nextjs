// Test logic for SIMTP reporting period
// Current date: July 5, 2025

// Test cases:
// 1. Current month = July (7), current year = 2025
// 2. Reporting period should be for June (6) data
// 3. Mobile view should focus on June column
// 4. June should show "ongoing period" indicator

const testCases = [
  {
    description: "July 2025 - Should report June 2025 data",
    currentMonth: 7, // July
    currentYear: 2025,
    expectedReportingMonth: 6, // June
    expectedReportingYear: 2025
  },
  {
    description: "January 2025 - Should report December 2024 data",
    currentMonth: 1, // January  
    currentYear: 2025,
    expectedReportingMonth: 12, // December
    expectedReportingYear: 2024
  },
  {
    description: "March 2025 - Should report February 2025 data",
    currentMonth: 3, // March
    currentYear: 2025,
    expectedReportingMonth: 2, // February
    expectedReportingYear: 2025
  }
];

// Logic validation:
function calculateReportingPeriod(currentMonth: number, currentYear: number) {
  const reportingMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const reportingYear = currentMonth === 1 ? currentYear - 1 : currentYear;
  return { reportingMonth, reportingYear };
}

testCases.forEach(testCase => {
  const result = calculateReportingPeriod(testCase.currentMonth, testCase.currentYear);
  const isCorrect = result.reportingMonth === testCase.expectedReportingMonth && 
                   result.reportingYear === testCase.expectedReportingYear;
  
  console.log(`${testCase.description}: ${isCorrect ? 'PASS' : 'FAIL'}`);
  console.log(`  Expected: ${testCase.expectedReportingMonth}/${testCase.expectedReportingYear}`);
  console.log(`  Got: ${result.reportingMonth}/${result.reportingYear}`);
});

// Current situation (July 5, 2025):
// - Current month: July (7)
// - Reporting period: June (6) 2025
// - Mobile view: Focus on June column
// - June column: Shows clock icon (ongoing period)
// - Tooltip: "Periode pelaporan sedang berjalan"
