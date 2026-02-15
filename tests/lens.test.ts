/**
 * Lens Integration Tests
 * 
 * Validates the lens by applying it to all combinations of ePIs and IPS resources.
 * Tests verify no focusing errors occur and content preservation is maintained.
 * Uses @gravitate-health/lens-tool-test library for comprehensive testing.
 */

import * as path from 'path';
import {
  configureTestData,
  loadAllLenses,
  runComprehensiveLensTests
} from '@gravitate-health/lens-tool-test';

// Optional: Configure custom test data to extend bundled library data
configureTestData({
  pepisPath: path.join(__dirname, 'custom-test-data', 'PePIs'),
  ipsPath: path.join(__dirname, 'custom-test-data', 'IPS')
});

describe('Lens Integration Tests', () => {
  test('should apply lens to all ePI + IPS combinations without errors', async () => {
    // Load all lenses from the project root (skips tsconfig.json)
    const lenses = loadAllLenses(path.join(__dirname, '..'), false);
    expect(lenses.length).toBeGreaterThan(0);
    // Run comprehensive tests on all ePI/IPS combinations
    // This tests both bundled library data and custom test data
    const results = await runComprehensiveLensTests(lenses, {
      preservationThresholdPercentage: 0.95
    });

    // Analyze results
    const totalErrors = results.filter(r => r.hasErrors).length;
    const contentRemovalErrors = results.filter(r => !r.success).length;

    console.log(`\n=== Test Summary ===`);
    console.log(`Total combinations tested: ${results.length}`);
    console.log(`Focusing errors: ${totalErrors}`);
    console.log(`Content removal errors: ${contentRemovalErrors}\n`);

    // All tests should pass without errors
    expect(totalErrors).toBe(0);
    expect(contentRemovalErrors).toBe(0);
  }, 60000);
});
