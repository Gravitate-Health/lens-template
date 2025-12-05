# [Lens Name]

> **Short description**: One-sentence summary of what this lens does and who it's for.

[![License](https://img.shields.io/badge/license-[LICENSE]-blue.svg)](LICENSE)
[![FHIR](https://img.shields.io/badge/FHIR-R4-orange.svg)](http://hl7.org/fhir/R4/)
[![Gravitate Health](https://img.shields.io/badge/Gravitate-Health-green.svg)](https://www.gravitatehealth.eu/)

## Table of Contents

- [Overview](#overview)
- [Lens Developers](#lens-developers)
- [Target Subjects](#target-subjects)
- [Purpose and Benefits](#purpose-and-benefits)
- [When to Use This Lens](#when-to-use-this-lens)
- [How It Works](#how-it-works)
- [Privacy and Data Usage](#privacy-and-data-usage)
- [Installation and Usage](#installation-and-usage)
- [Testing](#testing)
- [License](#license)
- [Contributing](#contributing)
- [Acknowledgments](#acknowledgments)

## Overview

**Lens Name**: `[your-lens-name]`  
**Version**: `[version number]`  
**Status**: `[active/draft/experimental]`

### Concepts and Operation

Provide a comprehensive explanation of:
- What medical/clinical knowledge this lens encodes
- The Terms and parameters it is using to make decisions
- What visual or content changes users will see
- The decision logic behind the lens behavior

**Example:**
> This lens highlights medication warnings and contraindications relevant to patients with chronic kidney disease (CKD). It analyzes the patient's IPS for kidney function indicators (eGFR values, diagnosis codes) and emphasizes sections of the ePI that discuss renal dosing adjustments, contraindications for impaired renal function, and potential nephrotoxicity risks.

## Lens Developers

**Primary Developer(s):**
- [Name] - [Organization/Institution] - [Email/GitHub]
- [Name] - [Organization/Institution] - [Email/GitHub]

**Contributors:**
- [Name] - [Role/Contribution]

**Development Period**: [Start Date] - [End Date/Ongoing]

**Funding/Support**: 
- [Grant/Project Name if applicable]
- [Supporting Organization]

## Target Subjects

### Primary Target Users

Describe the specific patient populations or user groups this lens is designed for:

- **Medical Conditions**: [List specific conditions, e.g., diabetes, pregnancy, kidney disease]
- **Demographics**: [Age groups, gender, if relevant]
- **Clinical Context**: [Specific situations where this lens applies]
- **Exclusions**: [Patient groups for whom this lens is NOT intended]

**Example:**
> - Adult patients (18+ years) diagnosed with Type 2 Diabetes Mellitus
> - Patients with HbA1c values above 7.0% in their IPS
> - Patients prescribed oral antidiabetic medications
> - NOT intended for Type 1 diabetes or gestational diabetes patients

### Use Cases

1. **Use Case 1**: [Description]
   - Patient profile: [Details]
   - Expected lens behavior: [What happens]

2. **Use Case 2**: [Description]
   - Patient profile: [Details]
   - Expected lens behavior: [What happens]

## Purpose and Benefits

### Clinical Benefits

Explain how this lens improves patient safety and understanding:

- **Safety Improvements**: [How it reduces risks]
- **Comprehension**: [How it aids understanding]
- **Personalization**: [How it adapts to individual needs]
- **Decision Support**: [How it helps clinical decisions]

**Example:**
> - **Reduces medication errors** by highlighting renal dosing adjustments
> - **Improves adherence** by emphasizing relevant warnings for the patient's condition
> - **Saves time** by collapsing irrelevant sections not applicable to CKD patients
> - **Empowers patients** with condition-specific educational content

### Expected Outcomes

- [Measurable outcome 1]
- [Measurable outcome 2]
- [Measurable outcome 3]

## When to Use This Lens

### Appropriate Scenarios

This lens is most beneficial when:

1. **[Scenario 1]**: [Description of when to use]
2. **[Scenario 2]**: [Description of when to use]
3. **[Scenario 3]**: [Description of when to use]

**Example:**
> 1. **At prescription time**: When a patient with CKD is prescribed a new medication
> 2. **During medication review**: When healthcare providers review medications for CKD patients
> 3. **For patient education**: When patients want to understand their medication risks
> 4. **Before dose adjustments**: When dosage needs to be modified based on renal function

### When NOT to Use This Lens

This lens should NOT be used when:

- [Contraindication 1]
- [Contraindication 2]
- [Limitation 1]

## How It Works

### Input Data Requirements

#### International Patient Summary (IPS) Data Used

This lens analyzes the following IPS resources and elements:

- **[Resource Type]**: 
  - Fields: [specific fields/codes]
  - Purpose: [why this data is needed]
  
**Example:**
> - **Observation**: 
>   - Fields: LOINC codes for eGFR (estimated Glomerular Filtration Rate)
>   - Purpose: To determine stage of kidney disease
> - **Condition**:
>   - Fields: SNOMED-CT codes for chronic kidney disease
>   - Purpose: To confirm CKD diagnosis
> - **MedicationStatement**:
>   - Fields: Current medications (RxNorm codes)
>   - Purpose: To check for nephrotoxic drug interactions

#### ePI Structure Requirements

- [Specify any special ePI structure requirements]
- [Expected coding systems or annotations]

### Lens Logic

Describe the algorithm/decision tree:

```
1. Extract kidney function indicators from IPS
   - If eGFR < 60 mL/min → Stage 3+ CKD
   - If CKD diagnosis codes present → Confirm condition

2. Identify relevant ePI sections
   - Search for keywords: "renal", "kidney", "dosing adjustment"
   - Locate contraindication sections

3. Apply enhancements
   - Highlight: Sections mentioning renal dosing
   - Highlight: Contraindications for renal impairment
   - Collapse: Sections about hepatic dosing (if not applicable)
   - Add: Information icons with CKD-specific guidance
```

### Visual Changes Applied

- **Highlighted sections** (CSS class: `highlight`):
  - [Description of what gets highlighted]
  
- **Collapsed sections** (CSS class: `collapse`):
  - [Description of what gets collapsed]
  
- **Additional content**:
  - [Description of supplementary information added]

### Code Examples

Brief code snippets showing key lens logic (optional):

```javascript
function enhance() {
    // Extract eGFR from IPS
    const egfr = extractEGFR(ipsData);
    
    // If reduced kidney function, highlight renal warnings
    if (egfr < 60) {
        if (htmlData.includes('renal') || htmlData.includes('kidney')) {
            transformedContent = '<div class="highlight">' + htmlData + '</div>';
        }
    }
    
    return transformedContent;
}
```

## Privacy and Data Usage

### Data Collection and Processing

**IPS Data Accessed:**

| Data Element | Purpose | Processing | Storage |
|--------------|---------|------------|---------|
| eGFR values | Determine kidney function stage | Compared against thresholds | Not stored |
| CKD diagnosis codes | Confirm patient condition | Matched against criteria | Not stored |
| Current medications | Check for contraindications | Cross-referenced with rules | Not stored |

### Privacy Considerations

- **No data storage**: This lens does NOT store, transmit, or persist any patient data
- **Local processing**: All data processing occurs within the Lens Execution Environment
- **No external services**: This lens does NOT connect to external APIs or services
- **No identifiable information**: Only clinical data elements are accessed, no PII

**OR (if external services are used):**

- **External service connections**: 
  - Service: [Service name]
  - Purpose: [Why connection is needed]
  - Data transmitted: [Specific data elements]
  - Security: [Encryption/security measures]
  - Privacy policy: [Link to service privacy policy]

### Compliance

- **GDPR**: [Compliance statement]
- **HIPAA**: [Compliance statement if applicable]
- **Local regulations**: [Other relevant regulations]

### Data Security

- [Security measures in place]
- [How patient data is protected]
- [Encryption or anonymization techniques used]

## Installation and Usage

### Prerequisites

- Gravitate Health Focusing Manager
- Lens Execution Environment (LEE) version `[X.X.X]` or higher
- Compatible ePI format: [FHIR version/profile]

### Deployment

This lens is deployed as a FHIR Library resource compliant with the [Gravitate Health Lens Profile](https://build.fhir.org/ig/hl7-eu/gravitate-health/StructureDefinition-lens.html).

**Deployment steps:**
1. [Step-by-step deployment instructions]
2. [Configuration requirements]
3. [Integration with Focusing Manager]

### Configuration Options

If your lens supports configuration parameters:

- **Parameter 1**: [Description, default value]
- **Parameter 2**: [Description, default value]

## Testing

### Test Coverage

This lens includes comprehensive automated tests:

```bash
npm install
npm test
```

### Test Scenarios

The test suite validates:

1. **Resource Loading**: All test ePIs and IPS load correctly
2. **Lens Compilation**: JavaScript is properly encoded as base64
3. **Focusing Errors**: No errors occur during lens execution
4. **Content Preservation**: Original ePI content is never removed
5. **Enhancement Behavior**: Correct sections are highlighted/collapsed

### Test Data

- **ePIs tested**: [Number and types of ePIs]
- **IPS profiles tested**: [Number and types of patient profiles]
- **Total test cases**: [Number of ePI × IPS combinations]

### Custom Tests

This lens includes custom behavior tests in `tests/lens-custom.test.ts`:

- [Test category 1]: [What is tested]
- [Test category 2]: [What is tested]
- [Test category 3]: [What is tested]

**Example:**
> - **Highlighting verification**: Tests that kidney-related warnings are highlighted for CKD patients
> - **Patient-specific scenarios**: Tests with varying eGFR values (stages 1-5 CKD)
> - **Edge cases**: Tests with missing IPS data or incomplete ePI sections

### Running Custom Tests

```bash
# Run all tests including custom tests
npm test

# Run only custom tests
npm test -- lens-custom.test.ts

# Run tests in watch mode
npm run test:watch
```

### Test Results

[Include recent test results or link to CI/CD badges]

## License

This lens is licensed under the **[LICENSE NAME]** - see the [LICENSE](LICENSE) file for details.

**Key terms:**
- [Brief summary of license terms]
- [Commercial use allowed/restricted]
- [Attribution requirements]
- [Derivative works policy]

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details on:

- How to report bugs
- How to suggest enhancements
- Code style guidelines
- Pull request process

### Development Setup

```bash
# Clone the repository
git clone [repository-url]

# Install dependencies
npm install

# Run tests
npm test
```

## Acknowledgments

### Citations

If this lens is based on published research or clinical guidelines:

- [Citation 1]
- [Citation 2]

### Clinical Input

- [Healthcare professionals who provided clinical input]
- [Institutions or organizations that contributed]

### Funding

This work was supported by:
- [Grant/funding source]
- [Project name and grant number]

## Contact and Support

- **Issues**: [GitHub Issues URL or email]
- **Questions**: [Contact method]
- **Documentation**: [Additional documentation links]

## Version History

### [Version X.X.X] - YYYY-MM-DD
- [Change description]
- [Bug fixes]
- [New features]

### [Version X.X.X] - YYYY-MM-DD
- Initial release

---

**Gravitate Health Project**: This lens is part of the Gravitate Health ecosystem.  
Learn more at [https://www.gravitatehealth.eu/](https://www.gravitatehealth.eu/)

**FHIR Resources**: [Link to your lens FHIR Library resource]
