# Test Infrastructure for Lens Development

This directory contains the test infrastructure and test data for validating your Gravitate Health lens.

**Note:** This project now uses the `@gravitate-health/lens-tool-test` library for test utilities. All helper functions are provided by this library, which includes bundled test data and comprehensive testing utilities.

## Automatic Lens Discovery

**Tests automatically discover and validate ALL lenses in the root directory.** The test suite:
- Scans the root directory for `.json` files that match the Lens Profile
- Finds corresponding `.js` files with the same basename
- Compiles each lens (encodes JavaScript as base64 in the FHIR Library content)
- Tests each lens against all ePI + IPS combinations

You can rename `my-lens.{json|js}` to any name (e.g., `diabetes-lens.{json|js}`) as long as both files share the same basename.

## Directory Structure

```
tests/
├── lens.test.ts                    # Automated test suite (validates all lenses)
├── lens-custom.test.example.ts     # Example custom test patterns
├── PePIs/                          # Preprocessed ePIs (electronic Product Information)
│   └── *.json                      # PePI Bundle resources
└── IPS/                            # International Patient Summary resources
    └── *.json                      # IPS Bundle resources
```

## Test Data

The library provides bundled test data:
- **7 preprocessed ePIs** with semantic annotations
- **2 IPS resources** representing different patient profiles

You can extend this with custom test data in `custom-test-data/`:
- **Custom ePIs**: Add to `custom-test-data/PePIs/`
- **Custom IPS**: Add to `custom-test-data/IPS/`

See [custom-test-data/README.md](custom-test-data/README.md) for examples and usage.

## Test Utilities Library

This project uses `@gravitate-health/lens-tool-test` which provides:
- **Bundled Test Data**: 7 preprocessed ePIs and 2 IPS resources
- **Data Loading**: `loadEPI()`, `loadIPS()`, `loadAllEPIs()`, `loadAllIPS()`
- **Lens Operations**: `loadLens()`, `applyLens()`, `applyMultipleLenses()`
- **HTML Analysis**: `isTextHighlighted()`, `isTextCollapsed()`, `countElementsWithClass()`
- **Validation**: `hasFocusingErrors()`, `isContentPreserved()`, `getContentPreservationMetrics()`

### Using Bundled Data

```typescript
import { loadEPI, loadIPS, loadAllEPIs } from '@gravitate-health/lens-tool-test';

// Load specific bundled ePI
const epi = loadEPI('Bundle-processedbundledovato-en.json');

// Load all bundled ePIs (returns 7 ePIs)
const allEPIs = loadAllEPIs();
```

### Using Custom Data

```typescript
import { configureTestData, loadEPI, loadAllEPIs } from '@gravitate-health/lens-tool-test';
import * as path from 'path';

// Configure custom data directory
configureTestData({
  pepisPath: path.join(__dirname, 'custom-test-data', 'PePIs'),
  ipsPath: path.join(__dirname, 'custom-test-data', 'IPS')
});

// Load custom ePI
const customEPI = loadEPI('custom-medication-epi.json');

// Load ALL ePIs (bundled + custom)
const allEPIs = loadAllEPIs(); // Returns 8+ ePIs (7 bundled + your custom ones)
```

## Test Data

- **PePIs** (`tests/PePIs/`): Preprocessed electronic Product Information documents with semantic annotations
- **IPS** (`tests/IPS/`): International Patient Summary resources representing patient clinical status

The tests are configured to use your local test data while also having access to the bundled data from the library.

## Running Tests

The test suite validates that your lens:
1. **Operates correctly** - No focusing errors occur during execution
2. **Preserves content** - Never removes original ePI content
3. **Only enhances** - Only adds CSS classes or supplementary content

### Install dependencies:
```bash
npm install
```

### Run all tests:
```bash
npm test
```

### Run tests in watch mode:
```bash
npm run test:watch
```

### Run tests with coverage:
```bash
npm run test:coverage
```

## Test Scope

For each lens discovered in the root directory, the test suite:
1. **Loads test resources**:
   - All preprocessed ePIs from the `PePIs/` directory (7 ePIs)
   - All IPS resources from the `IPS/` directory (2 IPS)
2. **Compiles the lens**:
   - Reads the `.js` file and encodes it as base64
   - Embeds the base64 content into the `.json` FHIR Library resource
3. **Applies the lens**:
   - Tests every combination of ePI + IPS (e.g., 7 × 2 = 14 test cases)
   - Uses `@gravitatehealth/lens-execution-environment` for realistic execution
4. **Validates behavior**:
   - No focusing errors occur
   - No original content is removed
   - Only additions/enhancements are made

## Test Validations

### 1. No Focusing Errors
The lens must execute without throwing errors or returning `focusingErrors`.

### 2. Content Preservation
The lens **must not** remove any original content from the ePI. The core text is highly regulated and cannot be modified or removed.

### 3. Enhancement Only
The lens may only:
- Apply CSS classes (`highlight`, `collapse`) to sections
- Add supplementary information (links, images, videos, tooltips)

## Writing Custom Tests

You can write custom tests using the utilities from `@gravitate-health/lens-tool-test`:

```typescript
import {
  configureTestData,
  loadEPI,
  loadIPS,
  loadLens,
  applyLens,
  hasFocusingErrors,
  isContentPreserved,
  isTextHighlighted,
  countElementsWithClass
} from '@gravitate-health/lens-tool-test';
import * as path from 'path';

// Configure to use custom test data
configureTestData({
  pepisPath: path.join(__dirname, 'custom-test-data', 'PePIs'),
  ipsPath: path.join(__dirname, 'custom-test-data', 'IPS')
});

// Test with bundled data
test('works with bundled data', async () => {
  const lens = loadLens(path.join(__dirname, '..'), 'my-lens');
  const epi = loadEPI('Bundle-processedbundledovato-en.json');
  const ips = loadIPS('alicia-patient_summary.json');
  
  const result = await applyLens(epi, ips, lens);
  
  expect(hasFocusingErrors(result)).toBe(false);
  expect(isContentPreserved(epi, result.epi)).toBe(true);
});

// Test with custom data
test('works with custom data', async () => {
  const lens = loadLens(path.join(__dirname, '..'), 'my-lens');
  const epi = loadEPI('custom-medication-epi.json');
  const ips = loadIPS('custom-patient.json');
  
  const result = await applyLens(epi, ips, lens);
  
  expect(hasFocusingErrors(result)).toBe(false);
});
```

See [lens-custom.test.example.ts](lens-custom.test.example.ts) for more examples.

## Dependencies

All dependencies in `package.json` are **development/testing only**:
- `jest` - Test framework
- `ts-jest` - TypeScript support for Jest
- `typescript` - TypeScript compiler
- `@types/node` - Node.js type definitions
- `@types/jest` - Jest type definitions
- `@gravitate-health/lens-tool-test` - Testing utilities, bundled test data, and lens runtime (includes lens-execution-environment)

These dependencies are not required for production use of the lens.

**Note**: The tests use the actual `@gravitatehealth/lens-execution-environment` package (version ^0.0.1) to execute lenses in the same way they would run in production. This ensures your lens will work correctly when deployed to the Gravitate Health platform.

## Custom Test Development

### Using the Lens Utilities Module

The `lens-utils.ts` module provides helper functions for writing custom tests specific to your lens behavior. This is useful when you want to verify particular highlighting patterns, collapsed sections, or specific patient scenarios.

#### Available Utility Functions

**Loading Resources:**
- `loadEPI(filename)` - Load a specific ePI by filename
- `loadAllEPIs()` - Load all preprocessed ePIs
- `loadIPS(filename)` - Load a specific IPS by filename  
- `loadAllIPS()` - Load all IPS resources
- `loadLens(baseName)` - Load and compile a lens from JSON/JS files

**Applying Lenses:**
- `applyLens(epi, ips, lens)` - Apply a lens to an ePI + IPS combination

**Verification Functions:**
- `isTextHighlighted(epi, text, options?)` - Check if text has `highlight` class
- `isTextCollapsed(epi, text, options?)` - Check if text has `collapse` class
- `countElementsWithClass(epi, className)` - Count elements with a CSS class
- `hasFocusingErrors(result)` - Check if lens produced errors
- `getFocusingErrors(result)` - Get array of error messages
- `isContentPreserved(originalEPI, enhancedEPI, threshold?)` - Verify content preservation

**Helper Functions:**
- `extractHTMLFromEPI(bundle)` - Extract all HTML sections from ePI
- `extractTextContent(html)` - Strip HTML tags to get plain text

### Writing Custom Tests

1. **Copy the example file:**
   ```bash
   cp tests/lens-custom.test.example.ts tests/lens-custom.test.ts
   ```

2. **Customize the tests** for your lens behavior:
   ```typescript
   import { loadEPI, loadIPS, loadLens, applyLens, isTextHighlighted } from './lens-utils';
   
   describe('My Lens Custom Tests', () => {
     const myLens = loadLens('my-lens');
     
     it('should highlight pregnancy warnings', async () => {
       const epi = loadEPI('Bundle-processedbundledovato-en.json');
       const ips = loadIPS('IPS-bundle-01.json');
       const result = await applyLens(epi, ips, myLens);
       
       expect(isTextHighlighted(result.epi, 'pregnancy')).toBe(true);
     });
   });
   ```

3. **Run all tests** (including your custom tests):
   ```bash
   npm test
   ```

### Example Test Scenarios

The `lens-custom.test.example.ts` file demonstrates:
- Testing highlighting behavior for specific patient conditions
- Verifying collapsed sections for irrelevant content
- Checking content preservation across all ePI + IPS combinations
- Handling specific patient scenarios (pediatric, liver conditions, etc.)
- Testing error handling and edge cases

## Adding Test Data

To add more test cases:
1. Add PePI JSON files to `tests/PePIs/`
2. Add IPS JSON files to `tests/IPS/`
3. Run `npm test` - new files will be automatically included
