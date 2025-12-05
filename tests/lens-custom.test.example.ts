/**
 * Example Custom Lens Tests
 * 
 * This file demonstrates how to write custom tests for your lens using the lens-utils module.
 * 
 * To use this file:
 * 1. Rename it to `lens-custom.test.ts` (remove `.example`)
 * 2. Customize the tests for your specific lens behavior
 * 3. Run `npm test` to execute all tests including your custom tests
 */

import {
  loadEPI,
  loadIPS,
  loadLens,
  loadAllEPIs,
  loadAllIPS,
  applyLens,
  isTextHighlighted,
  isTextCollapsed,
  countElementsWithClass,
  hasFocusingErrors,
  getFocusingErrors,
  isContentPreserved
} from './lens-utils';

describe('Custom Lens Behavior Tests', () => {
  // Load your lens once before all tests
  const myLens = loadLens('my-lens');

  describe('Highlighting Behavior', () => {
    it('should highlight pregnancy warnings for pregnant patients', async () => {
      // Load test data
      const epi = loadEPI('Bundle-processedbundledovato-en.json');
      const ips = loadIPS('IPS-bundle-01.json');

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
      const ips = loadIPS('IPS-bundle-01.json');

      const result = await applyLens(epi, ips, myLens);

      // Check multiple highlighted terms
      const highlightedTerms = ['pregnancy', 'breastfeeding', 'liver'];
      const highlightedCount = highlightedTerms.filter(term =>
        isTextHighlighted(result.epi, term)
      ).length;

      expect(highlightedCount).toBeGreaterThan(0);
    });
  });

  describe('Collapsing Behavior', () => {
    it('should collapse irrelevant sections for male patients', async () => {
      const epi = loadEPI('Bundle-processedbundledovato-en.json');
      const ips = loadIPS('IPS-bundle-01.json'); // Assuming this is a male patient

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
      const ips = loadIPS('IPS-bundle-01.json');

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
      const ips = loadIPS('IPS-bundle-01.json');

      const result = await applyLens(epi, ips, myLens);

      // Verify pediatric sections are highlighted
      expect(isTextHighlighted(result.epi, 'children')).toBe(true);

      // Ensure no errors
      expect(hasFocusingErrors(result)).toBe(false);
    });

    it('should handle patients with liver conditions', async () => {
      const epi = loadEPI('Bundle-processedbundledovato-en.json');
      const ips = loadIPS('IPS-bundle-01.json');

      const result = await applyLens(epi, ips, myLens);

      // Check if liver-related warnings are highlighted
      expect(isTextHighlighted(result.epi, 'liver')).toBe(true);
    });
  });

  describe('Multiple Lens Application', () => {
    it('should work correctly with multiple ePIs', async () => {
      const epis = loadAllEPIs();
      const ips = loadIPS('IPS-bundle-01.json');

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
      const ips = loadIPS('IPS-bundle-01.json');

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
