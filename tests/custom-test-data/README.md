# Custom Test Data

This directory contains simple, custom test data for demonstrating lens behavior.

## Purpose

These files showcase how to:
- Add custom test data to your lens tests
- Extend the bundled test data from `@gravitate-health/lens-tool-test`
- Create minimal, understandable examples for testing specific lens features

## Contents

### IPS (International Patient Summary)
- **custom-patient.json** - A minimal patient summary with:
  - Female patient born in 1990
  - Penicillin allergy
  - Active diabetes condition

### PePIs (Preprocessed Electronic Product Information)
- **custom-medication-epi.json** - A simplified medication leaflet with:
  - Therapeutic indications (diabetes treatment)
  - Contraindications (pregnancy, allergies, kidney problems)
  - Side effects (common and serious)

## Usage in Tests

```typescript
import { configureTestData, loadEPI, loadIPS } from '@gravitate-health/lens-tool-test';
import * as path from 'path';

// Configure to use custom test data
configureTestData({
  pepisPath: path.join(__dirname, 'custom-test-data', 'PePIs'),
  ipsPath: path.join(__dirname, 'custom-test-data', 'IPS')
});

// Load custom data
const customEPI = loadEPI('custom-medication-epi.json');
const customIPS = loadIPS('custom-patient.json');

// Or use loadAllEPIs() to get both bundled + custom data
const allEPIs = loadAllEPIs(); // Includes 7 bundled + your custom ones
```

## Customization

Feel free to:
- Add more custom test files for specific test scenarios
- Modify these examples to match your lens requirements
- Use these as templates for creating targeted test cases

The library's bundled test data (7 ePIs and 2 IPS) is still available and will be combined with your custom data when using `loadAllEPIs()` and `loadAllIPS()`.
