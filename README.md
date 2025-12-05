# G-Lens Project: Lens Development Template

This repository serves as a **template** (skeleton) for developing custom **Lenses** for the Gravitate-Health Federated Open-Source Platform and Services (FOSPS). This project is designed to be **forked** for new lens development.

## Quick Start

### 1. Customize Your Lens

The template includes two files that define your lens:

#### **`my-lens.json`** - FHIR Library Resource Metadata

Update this file with your lens information:

```json
{
  "resourceType": "Library",
  "identifier": [{
    "system": "http://gravitate-health.lst.tfo.upm.es",
    "value": "my-lens"  // ← Change to your lens ID
  }],
  "version": "1.0.0",        // ← Update version
  "name": "MyLens",          // ← Change to your lens name (no spaces)
  "title": "My Warning Lens", // ← Update display title
  "status": "active",
  "publisher": "Your Name/Organization",  // ← Update publisher
  "description": "Description of what your lens does", // ← Update description
  "purpose": "Why this lens is needed"  // ← Update purpose
}
```

#### **`my-lens.js`** - Lens Implementation Code

Implement your lens logic in the `enhance()` function:

```javascript
function enhance() {
    // Access available data:
    // - htmlData: Current section's HTML content (string)
    // - ipsData: Patient's International Patient Summary (object)
    // - pvData: Persona Vector with user preferences (object)
    // - epiData: Full ePI Bundle resource (object)
    
    // Transform the HTML content
    let transformedContent = htmlData;
    
    // Example: Add CSS class to highlight content
    if (ipsData.someCondition) {
        transformedContent = '<div class="highlight">' + htmlData + '</div>';
    }
    
    return transformedContent;
}
```

**Important**: You can rename both files (e.g., `diabetes-lens.json` and `diabetes-lens.js`) as long as they:
- Share the same **basename** (part before the extension)
- Are located in the **root directory**

### 2. Testing

The template includes automated tests that validate your lens:

```bash
npm install  # Install test dependencies (dev only)
npm test     # Run all tests
```

**Tests automatically discover and validate ALL lenses** (`.json`/`.js` pairs) in the root directory.

See [`tests/README.md`](tests/README.md) for detailed testing documentation.

## Core Concepts

The central goal of the G-Lens solution is the **[Focusing Mechanism](https://gravitate-health.github.io/reference/focusing)**, which is defined as adapting electronic Product Information (ePI) to the context of the end user for effective and optimal understanding.

### Lenses

A **Lens** is an algorithm or piece of code that encodes specific knowledge (e.g., medical facts, clinical rules, cultural aspects) required to make automated decisions on how to better adapt the content for a user.

Lenses are executed by the **Lens Execution Environment (LEE)**, a service that executes the lenses on an ePI based on patient data.

Lenses take three main inputs from the Focusing Manager:

1.  **[Preprocessed ePI (p(ePI))](https://gravitate-health.github.io/reference/p-epi)**: The electronic Patient Information document, which has been semantically annotated using standard terminologies (like SNOMED-CT or ICPC-2).
2.  **[International Patient Summary (IPS)](https://gravitate-health.github.io/reference/ips)**: A snapshot of the patient’s clinical status.
3.  **Persona Vector (PV)**: A standardization element designed to codify and standardize the user’s context and preferences.

### Permitted Operations

Due to legal and regulatory constraints, the core text content of the ePI is highly regulated and **cannot be modified or removed** by the lenses. Lens operations are restricted to presentation and supplementary information:

*   **Attention Detail Modification**: Applying CSS classes (not styles) to sections of the text:
    *   `highlight`: For increasing attention detail (e.g., highly relevant sections).
    *   `collapse`: For decreased attention detail, allowing the user to skim or skip sections while retaining access to the content.
*   **Addition of Supplementary Information**: Adding new content via HTML tags, such as hyperlinks, images, videos, or interactive elements like “Hovering” functions to explain certain words.

## Procedures and Development

### Forking and Contribution

To begin development:

1. **Fork this project** into your personal GitHub account
2. **Rename the repository** to reflect your lens name (e.g., `pregnancy-lens`, `diabetes-lens`)
3. **Replace this README** with comprehensive documentation using [`LENS_README_TEMPLATE.md`](LENS_README_TEMPLATE.md) as a guide

### Documenting Your Lens

**Proper documentation is critical for lens adoption and trust.** When you fork this template, you should replace this README with documentation specific to your lens.

Use the **[`LENS_README_TEMPLATE.md`](LENS_README_TEMPLATE.md)** file as a starting point. Your lens documentation should include:

- **Lens name and developers** - Who created this lens
- **Overall operation** - What medical knowledge it encodes
- **Target subjects** - Who this lens is for (patient populations, conditions)
- **Purpose and benefits** - How it improves safety and understanding
- **Usage guidance** - When to use (and not use) this lens
- **Privacy concerns** - What IPS data is accessed and why
- **External services** - Any connections to APIs or external systems
- **Licensing** - How others can use or modify the lens
- **Testing** - How the lens is validated and test coverage
- **Clinical evidence** - Supporting research or guidelines

**See [`LENS_README_TEMPLATE.md`](LENS_README_TEMPLATE.md) for a comprehensive documentation template.**

### Lens Structure and Naming

Each lens consists of two files with matching basenames:

1.  **`{name}.json`**: FHIR Library resource with metadata (identifier, version, title, description, publisher, etc.)
2.  **`{name}.js`**: JavaScript implementation with `enhance()` and `explanation()` functions

**File Naming Rules:**
- Both files must share the same basename (e.g., `diabetes-lens.json` and `diabetes-lens.js`)
- Files must be located in the root directory of the repository
- Recommended convention: `{purpose}-lens` (e.g., `pregnancy-lens`, `pediatric-lens`)

**Implementation Requirements:**
1.  The core lens logic must be in the **`enhance()` function**
2.  The function must return transformed HTML content (string)
3.  The lens may only add CSS classes or supplementary content, never remove original text

### Development Commands

Lenses need to be bundled as a FHIR Lens Profile, which includes a callable object implemented in JavaScript enconded as base64 as the FHIR Lens content.  

### Using the FHIR Lens Bundler

Lenses are structured as FHIR objects, following the **Lens Profile** archetype (derived from the FHIR `Library` resource). The actual lens code is present in the `content` field, encoded in Base64.

To transform your JavaScript code into a FHIR lens object that can be integrated into FOSPS, the developer should utilize the **[FHIR lens bundler](https://github.com/Gravitate-Health/fhir-lens-bundler)** developed for Gravitate-Health.

## Links to Implementation Guide and Documentation

### FHIR Implementation Guides (IGs)

The structure for the lens resource is defined in the Gravitate Health FHIR Implementation Guide:

*   **Lens Profile Resource Definition:** The specific resource definition used for lenses in the G-Lens ecosystem.
    *   *Link:* [Lens Profile](https://build.fhir.org/ig/hl7-eu/gravitate-health/StructureDefinition-lens.html)
*   **ePI FHIR Implementation Guide (IG):** Provides the standardized framework for ePI data upon which lenses operate.
    *   *Link:* [ePI IG](https://build.fhir.org/ig/HL7/emedicinal-product-info/en/)

### Developer Documentation and Tutorials

*   **FOSPS Developer Manual (Lens Development):** Comprehensive guidelines on the focusing process, constraints, and other tricks.
    *   *link:* [Lens Tutorial](https://gravitate-health.github.io/docs/category/tutorial---lens).
*   **Gravitate-Health GitHub Organization:** Access source code and additional FOSPS modules.
    *   *Link:* https://github.com/Gravitate-Health/

## Lens Development Checklist

When forking this template to create your own lens, follow this checklist:

### 1. Repository Setup
- [ ] Fork this repository to your account
- [ ] Rename repository to match your lens (e.g., `pregnancy-lens`)
- [ ] Update repository description

### 2. Lens Implementation
- [ ] Rename `my-lens.json` and `my-lens.js` to your lens name
- [ ] Update FHIR Library metadata in the JSON file:
  - [ ] Identifier and name
  - [ ] Version, title, and status
  - [ ] Publisher and description
  - [ ] Purpose and jurisdiction
- [ ] Implement lens logic in the JavaScript file:
  - [ ] Complete the `enhance()` function
  - [ ] Complete the `explanation()` function
  - [ ] Add appropriate CSS classes (`highlight`, `collapse`)
  - [ ] Access only necessary IPS data

### 3. Testing
- [ ] Run automated tests: `npm test`
- [ ] All tests pass without errors
- [ ] Create custom tests in `tests/lens-custom.test.ts`
- [ ] Verify highlighting behavior
- [ ] Verify collapsing behavior
- [ ] Test with multiple patient scenarios
- [ ] Test edge cases and error handling

### 4. Documentation (Critical!)
- [ ] **Replace this README** with lens-specific documentation
- [ ] Use [`LENS_README_TEMPLATE.md`](LENS_README_TEMPLATE.md) as starting point
- [ ] Document lens name and developers
- [ ] Describe target patient populations
- [ ] Explain purpose and clinical benefits
- [ ] Detail when to use (and not use) the lens
- [ ] **Document privacy and data usage**:
  - [ ] List all IPS data elements accessed
  - [ ] Explain why each data element is needed
  - [ ] Disclose any external service connections
  - [ ] State data retention policy (should be "none")
- [ ] Specify license
- [ ] Document testing approach and coverage
- [ ] Add clinical evidence or guidelines supporting the lens

### 5. Privacy and Compliance
- [ ] Minimize IPS data access (only what's necessary)
- [ ] Never store or persist patient data
- [ ] Document all data usage transparently
- [ ] If using external services, explain why and ensure security
- [ ] Comply with GDPR, HIPAA, and local regulations

### 6. Quality Assurance
- [ ] Code is well-commented
- [ ] No hardcoded patient data or test data in production code
- [ ] Error handling is robust
- [ ] Performance is acceptable (lens executes quickly)
- [ ] Follows Gravitate Health lens development guidelines

### 7. Publication and Sharing
- [ ] Create clear GitHub releases with version tags
- [ ] Add appropriate license file
- [ ] Consider adding CONTRIBUTING.md for community contributions
- [ ] Share with Gravitate Health community
- [ ] Submit to lens registry (if available)

## Support and Community

For questions about lens development:
- **Template issues**: Open an issue in this repository
- **Gravitate Health documentation**: [https://gravitate-health.github.io/](https://gravitate-health.github.io/)
- **Community discussions**: [Gravitate Health GitHub Discussions](https://github.com/orgs/Gravitate-Health/discussions)