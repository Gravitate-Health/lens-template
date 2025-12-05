/**
 * Lens Developer Utilities
 * 
 * This module provides helper functions for lens developers to write custom tests.
 * Use these utilities to load resources, apply lenses, and verify lens behavior.
 */

import * as fs from 'fs';
import * as path from 'path';
import { applyLenses } from '@gravitate-health/lens-execution-environment';

export interface FHIRResource {
  resourceType: string;
  id?: string;
  [key: string]: any;
}

export interface LensLibrary extends FHIRResource {
  resourceType: 'Library';
  name?: string;
  content?: Array<{
    contentType: string;
    data: string;
  }>;
}

export interface LensResult {
  epi: FHIRResource;
  ips: FHIRResource;
  focusingErrors?: any[];
}

/**
 * Load all JSON files from a directory
 * @param directory - Path to directory containing JSON files
 * @returns Array of parsed JSON resources
 */
export function loadJsonFiles(directory: string): FHIRResource[] {
  if (!fs.existsSync(directory)) {
    throw new Error(`Directory not found: ${directory}`);
  }

  const files = fs.readdirSync(directory).filter(f => f.endsWith('.json'));
  return files.map(filename => {
    const filePath = path.join(directory, filename);
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  });
}

/**
 * Load a specific ePI by filename
 * @param filename - Name of the ePI JSON file (e.g., 'Bundle-processedbundledovato-en.json')
 * @returns The ePI Bundle resource
 */
export function loadEPI(filename: string): FHIRResource {
  const testsDir = __dirname;
  const filePath = path.join(testsDir, 'PePIs', filename);
  
  if (!fs.existsSync(filePath)) {
    throw new Error(`ePI not found: ${filePath}`);
  }
  
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

/**
 * Load all preprocessed ePIs from the test data directory
 * @returns Array of ePI Bundle resources
 */
export function loadAllEPIs(): FHIRResource[] {
  const testsDir = __dirname;
  return loadJsonFiles(path.join(testsDir, 'PePIs'));
}

/**
 * Load a specific IPS by filename
 * @param filename - Name of the IPS JSON file (e.g., 'IPS-minimal.json')
 * @returns The IPS Bundle resource
 */
export function loadIPS(filename: string): FHIRResource {
  const testsDir = __dirname;
  const filePath = path.join(testsDir, 'IPS', filename);
  
  if (!fs.existsSync(filePath)) {
    throw new Error(`IPS not found: ${filePath}`);
  }
  
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

/**
 * Load all IPS resources from the test data directory
 * @returns Array of IPS Bundle resources
 */
export function loadAllIPS(): FHIRResource[] {
  const testsDir = __dirname;
  return loadJsonFiles(path.join(testsDir, 'IPS'));
}

/**
 * Load and compile a lens from JSON and JS files
 * @param baseName - Base name of the lens files (without extension), e.g., 'my-lens'
 * @returns Compiled FHIR Library resource with base64-encoded JavaScript content
 */
export function loadLens(baseName: string): LensLibrary {
  const rootDir = path.join(__dirname, '..');
  const jsonPath = path.join(rootDir, `${baseName}.json`);
  const jsPath = path.join(rootDir, `${baseName}.js`);

  if (!fs.existsSync(jsonPath)) {
    throw new Error(`Lens JSON not found: ${jsonPath}`);
  }
  if (!fs.existsSync(jsPath)) {
    throw new Error(`Lens JavaScript not found: ${jsPath}`);
  }

  const lensLibrary: LensLibrary = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  const jsCode = fs.readFileSync(jsPath, 'utf-8');
  const base64Code = Buffer.from(jsCode).toString('base64');

  // Add or update the content field with base64-encoded JavaScript
  lensLibrary.content = [{
    contentType: 'application/javascript',
    data: base64Code
  }];

  return lensLibrary;
}

/**
 * Apply a lens to an ePI and IPS combination
 * @param epi - ePI Bundle resource
 * @param ips - IPS Bundle resource
 * @param lens - Compiled lens Library resource
 * @returns Result containing enhanced ePI and any focusing errors
 */
export async function applyLens(
  epi: FHIRResource,
  ips: FHIRResource,
  lens: LensLibrary
): Promise<LensResult> {
  return await applyLenses(epi, ips, [lens]);
}

/**
 * Extract all HTML content from an ePI Bundle
 * @param bundle - ePI Bundle resource
 * @returns Array of HTML strings from all sections
 */
export function extractHTMLFromEPI(bundle: FHIRResource): string[] {
  if (bundle.resourceType !== 'Bundle' || !bundle.entry) {
    return [];
  }

  const htmlParts: string[] = [];

  function extractFromSection(section: any): void {
    if (section.text?.div) {
      htmlParts.push(section.text.div);
    }
    if (section.section && Array.isArray(section.section)) {
      section.section.forEach((subsection: any) => extractFromSection(subsection));
    }
  }

  for (const entry of bundle.entry) {
    if (entry.resource?.resourceType === 'Composition' && entry.resource.section) {
      entry.resource.section.forEach((section: any) => extractFromSection(section));
    }
  }

  return htmlParts;
}

/**
 * Check if specific text is highlighted in the enhanced ePI
 * @param enhancedEPI - Enhanced ePI Bundle from lens application
 * @param searchText - Text to search for within highlighted sections
 * @param options - Search options (caseSensitive: default false, partial: default true)
 * @returns true if the text is found within an element with class="highlight"
 */
export function isTextHighlighted(
  enhancedEPI: FHIRResource,
  searchText: string,
  options: { caseSensitive?: boolean; partial?: boolean } = {}
): boolean {
  const { caseSensitive = false, partial = true } = options;
  const htmlSections = extractHTMLFromEPI(enhancedEPI);
  
  const searchPattern = caseSensitive ? searchText : searchText.toLowerCase();

  for (const html of htmlSections) {
    const htmlToSearch = caseSensitive ? html : html.toLowerCase();
    
    // Check if text appears within a highlight element
    const highlightRegex = /<[^>]*class="[^"]*highlight[^"]*"[^>]*>(.*?)<\/[^>]+>/gs;
    let match;
    
    while ((match = highlightRegex.exec(htmlToSearch)) !== null) {
      const highlightedContent = match[1];
      
      if (partial) {
        if (highlightedContent.includes(searchPattern)) {
          return true;
        }
      } else {
        // Strip HTML tags for exact text matching
        const textContent = highlightedContent.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        if (textContent === searchPattern) {
          return true;
        }
      }
    }
  }

  return false;
}

/**
 * Check if specific text is collapsed in the enhanced ePI
 * @param enhancedEPI - Enhanced ePI Bundle from lens application
 * @param searchText - Text to search for within collapsed sections
 * @param options - Search options (caseSensitive: default false, partial: default true)
 * @returns true if the text is found within an element with class="collapse"
 */
export function isTextCollapsed(
  enhancedEPI: FHIRResource,
  searchText: string,
  options: { caseSensitive?: boolean; partial?: boolean } = {}
): boolean {
  const { caseSensitive = false, partial = true } = options;
  const htmlSections = extractHTMLFromEPI(enhancedEPI);
  
  const searchPattern = caseSensitive ? searchText : searchText.toLowerCase();

  for (const html of htmlSections) {
    const htmlToSearch = caseSensitive ? html : html.toLowerCase();
    
    // Check if text appears within a collapse element
    const collapseRegex = /<[^>]*class="[^"]*collapse[^"]*"[^>]*>(.*?)<\/[^>]+>/gs;
    let match;
    
    while ((match = collapseRegex.exec(htmlToSearch)) !== null) {
      const collapsedContent = match[1];
      
      if (partial) {
        if (collapsedContent.includes(searchPattern)) {
          return true;
        }
      } else {
        // Strip HTML tags for exact text matching
        const textContent = collapsedContent.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        if (textContent === searchPattern) {
          return true;
        }
      }
    }
  }

  return false;
}

/**
 * Count how many sections have a specific CSS class
 * @param enhancedEPI - Enhanced ePI Bundle from lens application
 * @param className - CSS class to search for (e.g., 'highlight', 'collapse')
 * @returns Number of HTML elements with the specified class
 */
export function countElementsWithClass(enhancedEPI: FHIRResource, className: string): number {
  const htmlSections = extractHTMLFromEPI(enhancedEPI);
  let count = 0;

  const classRegex = new RegExp(`<[^>]*class="[^"]*\\b${className}\\b[^"]*"[^>]*>`, 'g');

  for (const html of htmlSections) {
    const matches = html.match(classRegex);
    if (matches) {
      count += matches.length;
    }
  }

  return count;
}

/**
 * Check if the lens has any focusing errors
 * @param result - Result from applyLens or applyLenses
 * @returns true if there are focusing errors, false otherwise
 */
export function hasFocusingErrors(result: LensResult): boolean {
  if (!result.focusingErrors || result.focusingErrors.length === 0) {
    return false;
  }

  const allErrors = result.focusingErrors.flat().filter(e => e);
  return allErrors.length > 0;
}

/**
 * Get all focusing error messages
 * @param result - Result from applyLens or applyLenses
 * @returns Array of error messages
 */
export function getFocusingErrors(result: LensResult): string[] {
  if (!result.focusingErrors || result.focusingErrors.length === 0) {
    return [];
  }

  const allErrors = result.focusingErrors.flat().filter(e => e);
  return allErrors.map((err: any) => err.message || String(err));
}

/**
 * Extract plain text content from HTML (strips all tags)
 * @param html - HTML string
 * @returns Plain text content
 */
export function extractTextContent(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Check if all original content is preserved in the enhanced ePI
 * @param originalEPI - Original ePI Bundle
 * @param enhancedEPI - Enhanced ePI Bundle from lens application
 * @param threshold - Minimum percentage of content that must be preserved (default: 0.95 = 95%)
 * @returns true if at least the threshold percentage of content is preserved
 */
export function isContentPreserved(
  originalEPI: FHIRResource,
  enhancedEPI: FHIRResource,
  threshold: number = 0.95
): boolean {
  const originalHTML = extractHTMLFromEPI(originalEPI);
  const enhancedHTML = extractHTMLFromEPI(enhancedEPI);

  const originalText = originalHTML.map(html => extractTextContent(html)).join(' ');
  const enhancedText = enhancedHTML.map(html => extractTextContent(html)).join(' ');

  const originalWords = originalText.split(/\s+/).filter(w => w.length > 3);
  const enhancedLower = enhancedText.toLowerCase();

  let missingWords = 0;
  for (const word of originalWords) {
    if (!enhancedLower.includes(word.toLowerCase())) {
      missingWords++;
    }
  }

  const matchRatio = (originalWords.length - missingWords) / originalWords.length;
  return matchRatio >= threshold;
}
