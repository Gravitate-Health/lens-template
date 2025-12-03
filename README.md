# G-Lens Project: Lens Development Template

This repository serves as a **template** (skeleton) for developing custom **Lenses** for the Gravitate-Health Federated Open-Source Platform and Services (FOSPS). This project is designed to be **forked** for new lens development.

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

To begin development, **you must fork this project** into your personal GitHub account.

### Lens Structure and Naming

Lenses should be compliant with the Lens Execution Environment documentation.

1.  **Implementation:** The core logic of the lens must reside within the **`enhance()` function**.
2.  **File Naming Convention:** Lenses should follow a specific naming convention: `name-lens` (e.g., `diabetes-lens`).

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