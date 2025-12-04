# Test Infrastructure for Lens Development

This directory contains the test infrastructure and test data for validating your Gravitate Health lens.

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
├── fixtures.ts           # Utility functions for loading test resources
├── lens.test.ts          # Main test suite for lens validation
├── PePIs/               # Preprocessed ePIs (electronic Product Information)
│   └── *.json           # PePI Bundle resources
└── IPS/                 # International Patient Summary resources
    └── *.json           # IPS Bundle resources
```

## Test Data

- **PePIs** (`tests/PePIs/`): Preprocessed electronic Product Information documents with semantic annotations
- **IPS** (`tests/IPS/`): International Patient Summary resources representing patient clinical status

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

## Dependencies

All dependencies in `package.json` are **development/testing only**:
- `jest` - Test framework
- `ts-jest` - TypeScript support for Jest
- `typescript` - TypeScript compiler
- `@types/node` - Node.js type definitions
- `@types/jest` - Jest type definitions

These dependencies are not required for production use of the lens.

**Note**: The tests use the actual `@gravitatehealth/lens-execution-environment` package (version ^0.0.1) to execute lenses in the same way they would run in production. This ensures your lens will work correctly when deployed to the Gravitate Health platform.

## Adding Test Data

To add more test cases:
1. Add PePI JSON files to `tests/PePIs/`
2. Add IPS JSON files to `tests/IPS/`
3. Run `npm test` - new files will be automatically included
