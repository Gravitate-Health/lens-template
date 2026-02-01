/**
 * Example Custom Lens Tests
 * 
 * This file demonstrates how to write custom tests for your lens using the @gravitate-health/lens-tool-test library.
 * 
 * To use this file:
 * 1. Rename it to `lens-custom.test.ts` (remove `.example`)
 * 2. Customize the tests for your specific lens behavior
 * 3. Run `npm test` to execute all tests including your custom tests
 */

import * as path from 'path';
import {
  configureTestData,
  loadEPI,
  loadIPS,
  loadAllLenses,
  loadAllEPIs,
  loadAllIPS,
  applyLens,
  isTextHighlighted,
  isTextCollapsed,
  countElementsWithClass,
  hasFocusingErrors,
  getFocusingErrors,
  isContentPreserved
} from '@gravitate-health/lens-tool-test';

// Configure to use custom test data (extends bundled data)
configureTestData({
  pepisPath: path.join(__dirname, 'custom-test-data', 'PePIs'),
  ipsPath: path.join(__dirname, 'custom-test-data', 'IPS')
});

describe('Custom Lens Behavior Tests', () => {
  // Load all lenses from the project root
  const lenses = loadAllLenses(path.join(__dirname, '..'));
  const myLens = lenses[0]; // Use first lens for custom tests
  // you can select a specific lens if needed
  // const myLens = loadLens('my-lens'); // Uncomment and replace 'my-lens' with your lens name

  describe('Highlighting Behavior', () => {
    it('should highlight pregnancy warnings for pregnant patients', async () => {
      // Load test data - using bundled data
      const epi = loadEPI('Bundle-processedbundledovato-en.json');
      const ips = loadIPS('alicia-patient_summary.json');

      // Apply lens
      const result = await applyLens(epi, ips, myLens);

      // Verify no errors occurred
      expect(hasFocusingErrors(result)).toBe(false);

      // Check if pregnancy-related text is highlighted
      expect(isTextHighlighted(result.epi, 'pregnancy')).toBe(true);
      expect(isTextHighlighted(result.epi, 'pregnant')).toBe(true);

      // Verify at least one highlight was applied
      expect(countElementsWithClass(result.epi, 'highlight')).toBeGreaterThan(0);

      // Ensure content is preserved
      expect(isContentPreserved(epi, result.epi)).toBe(true);
    });

    it('should highlight multiple relevant sections', async () => {
      const epi = loadEPI('Bundle-processedbundledovato-en.json');
      const ips = loadIPS('alicia-patient_summary.json');

      const result = await applyLens(epi, ips, myLens);

      // Check multiple highlighted terms
      const highlightedTerms = ['pregnancy', 'breastfeeding', 'liver'];
      const highlightedCount = highlightedTerms.filter(term =>
        isTextHighlighted(result.epi, term)
      ).length;

      expect(highlightedCount).toBeGreaterThan(0);
    });
  });

  describe('Custom Data Tests', () => {
    it('should work with custom test data', async () => {
      // Load custom test data
      const customEPI = loadEPI('custom-medication-epi.json');
      const customIPS = loadIPS('custom-patient.json');

      const result = await applyLens(customEPI, customIPS, myLens);

      // Verify no errors
      expect(hasFocusingErrors(result)).toBe(false);

      // Verify content preservation
      expect(isContentPreserved(customEPI, result.epi)).toBe(true);

      // You can add custom assertions based on your lens behavior
      // For example, if your lens highlights diabetes-related content:
      // expect(isTextHighlighted(result.epi, 'diabetes')).toBe(true);
    });
  });

  describe('Collapsing Behavior', () => {
    it('should collapse irrelevant sections for male patients', async () => {
      const epi = loadEPI('Bundle-processedbundledovato-en.json');
      const ips = loadIPS('pedro-patient_summary.json'); // Assuming this is a male patient

      const result = await applyLens(epi, ips, myLens);

      // Check if pregnancy sections are collapsed for male patients
      // (Adjust this based on your lens logic)
      expect(isTextCollapsed(result.epi, 'pregnancy', { partial: true })).toBe(false);
      
      // Or verify that certain sections ARE collapsed
      // expect(countElementsWithClass(result.epi, 'collapse')).toBeGreaterThan(0);
    });
  });

  describe('Content Preservation', () => {
    it('should not remove any original content', async () => {
      const epis = loadAllEPIs();
      const ipsList = loadAllIPS();

      // Test all combinations
      for (const epi of epis) {
        for (const ips of ipsList) {
          const result = await applyLens(epi, ips, myLens);

          // Verify no content was removed
          expect(isContentPreserved(epi, result.epi, 0.95)).toBe(true);
        }
      }
    });
  });

  describe('Error Handling', () => {
    it('should not produce focusing errors', async () => {
      const epi = loadEPI('Bundle-processedbundledovato-en.json');
      const ips = loadIPS('alicia-patient_summary.json');

      const result = await applyLens(epi, ips, myLens);

      expect(hasFocusingErrors(result)).toBe(false);

      // If there are errors, log them for debugging
      if (hasFocusingErrors(result)) {
        const errors = getFocusingErrors(result);
        console.error('Focusing errors:', errors);
      }
    });
  });

  describe('Specific Patient Scenarios', () => {
    it('should handle pediatric patients appropriately', async () => {
      // Load an ePI that has pediatric information
      const epi = loadEPI('Bundle-processedbundledovato-en.json');
      
      // Load an IPS for a pediatric patient
      // (You may need to create or use a specific IPS)
      const ips = loadIPS('alicia-patient_summary.json');

      const result = await applyLens(epi, ips, myLens);

      // Verify pediatric sections are highlighted
      expect(isTextHighlighted(result.epi, 'children')).toBe(true);

      // Ensure no errors
      expect(hasFocusingErrors(result)).toBe(false);
    });

    it('should handle patients with liver conditions', async () => {
      const epi = loadEPI('Bundle-processedbundledovato-en.json');
      const ips = loadIPS('pedro-patient_summary.json');

      const result = await applyLens(epi, ips, myLens);

      // Check if liver-related warnings are highlighted
      expect(isTextHighlighted(result.epi, 'liver')).toBe(true);
    });
  });

  describe('Multiple Lens Application', () => {
    it('should work correctly with all ePIs (bundled + custom)', async () => {
      // loadAllEPIs() returns both bundled (7) and custom data
      const epis = loadAllEPIs();
      const ips = loadIPS('alicia-patient_summary.json');

      // Should have at least 8 ePIs (7 bundled + 1 custom)
      expect(epis.length).toBeGreaterThanOrEqual(8);

      for (const epi of epis) {
        const result = await applyLens(epi, ips, myLens);

        // Each ePI should be processed without errors
        expect(hasFocusingErrors(result)).toBe(false);

        // Content should be preserved in all cases
        expect(isContentPreserved(epi, result.epi)).toBe(true);
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle ePIs with missing sections gracefully', async () => {
      // Test with different ePIs to ensure robustness
      const epis = loadAllEPIs();
      const ips = loadIPS('alicia-patient_summary.json');

      for (const epi of epis) {
        // Should not throw errors even with unusual ePI structures
        await expect(applyLens(epi, ips, myLens)).resolves.toBeDefined();
      }
    });
  });
});

/**
 * Additional test patterns you can use:
 * 
 * 1. Test specific CSS class application:
 *    expect(countElementsWithClass(result.epi, 'highlight')).toBe(expectedCount);
 * 
 * 2. Test exact text matching (not partial):
 *    expect(isTextHighlighted(result.epi, 'Pregnancy', { partial: false })).toBe(true);
 * 
 * 3. Test case-sensitive matching:
 *    expect(isTextHighlighted(result.epi, 'Pregnancy', { caseSensitive: true })).toBe(true);
 * 
 * 4. Test that certain content is NOT highlighted:
 *    expect(isTextHighlighted(result.epi, 'irrelevant info')).toBe(false);
 * 
 * 5. Check error messages in detail:
 *    const errors = getFocusingErrors(result);
 *    expect(errors).toHaveLength(0);
 * 
 * 6. Test content preservation with custom threshold:
 *    expect(isContentPreserved(epi, result.epi, 0.99)).toBe(true); // 99% threshold
 */
