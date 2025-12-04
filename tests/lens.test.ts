/**
 * Lens Integration Tests
 * 
 * These tests validate that the lens:
 * 1. Loads resources correctly
 * 2. Compiles the lens (base64 encoding)
 * 3. Applies the lens to each ePI + IPS combination
 * 4. Checks for no focusing errors
 * 5. Verifies no content removal from original ePI
 */

import * as fs from 'fs';
import * as path from 'path';
import { applyLenses } from '@gravitate-health/lens-execution-environment';

const WRITE_LENS_OUTPUTS = process.env.WRITE_LENS_OUTPUTS || 'false';

interface FHIRResource {
  resourceType: string;
  id?: string;
  [key: string]: any;
  filename?: string;
}

interface LensLibrary extends FHIRResource {
  resourceType: 'Library';
  content?: Array<{
    contentType: string;
    data: string;
  }>;
}

const PEPIS_DIR = path.join(__dirname, 'PePIs');
const IPS_DIR = path.join(__dirname, 'IPS');
const LENS_PATH = path.join(__dirname, '..');

/**
 * Load all JSON files from a directory
 */
function loadJsonFiles(directory: string): Array<FHIRResource> {
  if (!fs.existsSync(directory)) {
    console.warn(`Directory not found: ${directory}`);
    return [];
  }

  const files = fs.readdirSync(directory).filter(f => f.endsWith('.json'));
  return files.map(filename => {
    const resource = JSON.parse(fs.readFileSync(path.join(directory, filename), 'utf-8'));
    return { ...resource, filename };
  });
}

/**
 * Extract text content from HTML (strips all tags)
 */
function extractTextContent(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extract all HTML div content from an ePI Bundle (preserving HTML structure)
 */
function extractAllHTMLFromEPI(bundle: FHIRResource): string[] {
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
 * Check if all HTML content from original is present in enhanced
 * The lens execution environment may restructure sections, but content should be preserved
 */
function containsAllOriginalContent(originalHTML: string[], enhancedHTML: string[]): boolean {
  // Extract all text from both original and enhanced
  const originalText = originalHTML.map(html => extractTextContent(html)).join(' ');
  const enhancedText = enhancedHTML.map(html => extractTextContent(html)).join(' ');
  
  // Split into words (filter out very short words and common symbols)
  const originalWords = originalText.split(/\s+/).filter(w => w.length > 3);
  const enhancedLower = enhancedText.toLowerCase();
  
  // Count how many original words appear in enhanced
  let missingWords = 0;
  for (const word of originalWords) {
    if (!enhancedLower.includes(word.toLowerCase())) {
      missingWords++;
    }
  }
  
  const matchRatio = (originalWords.length - missingWords) / originalWords.length;
  
  // Require at least 95% of words to be present (allows for minor HTML encoding differences)
  if (matchRatio < 0.95) {
    console.log(`Content match: ${(matchRatio * 100).toFixed(1)}% (${missingWords}/${originalWords.length} words missing)`);
    return false;
  }

  return true;
}

describe('Lens Integration Tests', () => {
  let ePIs: any[] = [];
  let ipsResources: any[] = [];
  let fhirLenses: LensLibrary[] = [];

  beforeAll(() => {
    // 1. Load resources
    console.log('\n=== Loading Test Resources ===');
    ePIs = loadJsonFiles(PEPIS_DIR);
    ipsResources = loadJsonFiles(IPS_DIR);
    
    console.log(`Loaded ${ePIs.length} preprocessed ePIs`);
    console.log(`Loaded ${ipsResources.length} IPS resources\n`);

    expect(ePIs.length).toBeGreaterThan(0);
    expect(ipsResources.length).toBeGreaterThan(0);

    // 2. Compile the lenses (add base64 JS as content to FHIR lens JSON)
    console.log('=== Compiling Lenses ===');
    // locate all lens FHIR files
    fhirLenses = loadJsonFiles(LENS_PATH).filter(res => res.resourceType === 'Library') as LensLibrary[];
    expect(fhirLenses.length).toBeGreaterThan(0);
    // verify each lens has content
    fhirLenses.forEach(lens => {
      if (!lens.content || lens.content.length === 0) {
        //if no content, add base64 JS as content
        const lensJsPath = lens.filename ? lens.filename.replace('.json', '.js') : path.join(LENS_PATH, `${lens.id}.js`);
        if (fs.existsSync(lensJsPath)) {
          const lensJs = fs.readFileSync(lensJsPath, 'utf-8');
          const base64LensCode = Buffer.from(lensJs).toString('base64');
          lens.content = [{
            contentType: 'application/javascript',
            data: base64LensCode
          }];
          console.log(`Added content to lens: ${lens.name || lens.id}`);
        } else {
          throw new Error(`Lens JS file not found for lens ${lens.name || lens.id} at path: ${lensJsPath}`);
        }
      }
    });
    
    console.log(`Compiled lenses: ${path.join(LENS_PATH, fhirLenses.map(l => l.name || l.id).join(', '))}\n`);
  });

  describe('Resource Loading', () => {
    test('should load preprocessed ePIs', () => {
      expect(ePIs.length).toBeGreaterThan(0);
      expect(ePIs[0].resourceType).toBe('Bundle');
    });

    test('should load IPS resources', () => {
      expect(ipsResources.length).toBeGreaterThan(0);
      expect(ipsResources[0].resourceType).toBe('Bundle');
    });
  });

  describe('Lenses Compilation', () => {
    test('should have compiled lens with base64 content', () => {
      expect(fhirLenses.length).toBeGreaterThan(0);
      expect(fhirLenses[0].resourceType).toBe('Library');
      for (const lens of fhirLenses) {
        expect(lens.content).toBeDefined();
        expect(lens.content!.length).toBeGreaterThan(0);
        expect(lens.content![0].data).toBeTruthy();
      }
    });

    test('lenses content should be valid base64', () => {
      for (const lens of fhirLenses) {
        const decoded = Buffer.from(lens.content![0].data, 'base64').toString('utf-8');
        expect(decoded.length).toBeGreaterThan(0);
        expect(decoded).toContain('enhance');
        expect(decoded).toContain('function');
      }
    });
  });

  describe('Lens Application', () => {
    
    // Test all combinations of ePI + IPS
    test('should apply lens to all ePI + IPS combinations without errors', async () => {
      const combinations = ePIs.length * ipsResources.length;
      console.log(`\nTesting ${combinations} combinations (${ePIs.length} ePIs × ${ipsResources.length} IPS)\n`);

      let totalErrors = 0;
      let contentRemovalErrors = 0;

      for (let i = 0; i < ePIs.length; i++) {
        const epi = ePIs[i];
        const epiId = epi.id || `ePI-${i}`;

        for (let j = 0; j < ipsResources.length; j++) {
          const ips = ipsResources[j];
          const ipsId = ips.id || `IPS-${j}`;

          console.log(`  Testing: ${epiId} + ${ipsId}`);

          // Extract original content before applying lens (HTML sections)
          const originalHTML = extractAllHTMLFromEPI(epi);
          expect(originalHTML.length).toBeGreaterThan(0);

          // 3. Apply lens using applyLenses(epi, IPS, [my-lens])
          const result = await applyLenses(epi, ips, fhirLenses);

          // 3.0 write output epi for debugging if enabled
          if (WRITE_LENS_OUTPUTS === 'true') {
            const outputDir = path.join(__dirname, 'test-outputs');
            if (!fs.existsSync(outputDir)) {
              fs.mkdirSync(outputDir);
            }
            const outputPath = path.join(outputDir, `output-${epiId}-${ipsId}.json`);
            fs.writeFileSync(outputPath, JSON.stringify(result.epi, null, 2), 'utf-8');
          }

          // 3.1 Check there are no focusingError messages
          if (result.focusingErrors && result.focusingErrors.length > 0) {
            const allErrors = result.focusingErrors.flat().filter((e: any) => e);
            if (allErrors.length > 0) {
              totalErrors += allErrors.length;
              console.error(`\n    ❌ Focusing Errors for ${epiId} + ${ipsId}:`);
              allErrors.forEach((err: any) => {
                console.error(`       - ${err.message || err} (lens: ${err.lensName || 'unknown'})`);
              });
              console.log('');
            }
          }

          // 3.2 Check there is no removal of content from original ePI
          const enhancedHTML = extractAllHTMLFromEPI(result.epi);
          const hasAllContent = containsAllOriginalContent(originalHTML, enhancedHTML);
          
          if (!hasAllContent) {
            contentRemovalErrors++;
            console.error(`\n    ❌ Content removed from ${epiId} + ${ipsId}\n`);
          } 
        }
      }

      console.log(`\n=== Test Summary ===`);
      console.log(`Total combinations tested: ${combinations}`);
      console.log(`Focusing errors: ${totalErrors}`);
      console.log(`Content removal errors: ${contentRemovalErrors}\n`);

      // Assertions
      expect(totalErrors).toBe(0);
      expect(contentRemovalErrors).toBe(0);
    }, 60000); // 60 second timeout for all combinations
  });

  describe('Lens Behavior Summary', () => {
    test('should process all combinations', () => {
      const totalCombinations = ePIs.length * ipsResources.length;
      console.log(`\n✅ Successfully tested ${totalCombinations} ePI + IPS combinations`);
      expect(totalCombinations).toBeGreaterThan(0);
    });
  });
});
