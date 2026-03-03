import {
  getAllProteins,
  getAllDrugs,
  getDatabaseStats,
  getProteinsByOrganism,
  getProteinsByToxinType,
  getDrugsByCategory,
  clearCache,
  getCacheStats
} from './database';
import { Protein, DrugCandidate, DatabaseStats } from '../types';

describe('Database Service', () => {
  test('getAllProteins returns protein array', () => {
    const proteins = getAllProteins();
    expect(Array.isArray(proteins)).toBe(true);
    expect(proteins.length).toBeGreaterThan(0);
    expect(proteins[0]).toHaveProperty('uniprot_id');
    expect(proteins[0]).toHaveProperty('name');
    expect(proteins[0]).toHaveProperty('organism');
    expect(proteins[0]).toHaveProperty('sequence');
    expect(proteins[0]).toHaveProperty('length');
    expect(proteins[0]).toHaveProperty('function');
    expect(proteins[0]).toHaveProperty('pdb_id');
    expect(proteins[0]).toHaveProperty('toxin_type');
    expect(proteins[0]).toHaveProperty('molecular_weight');
  });

  test('getAllDrugs returns drug array', () => {
    const drugs = getAllDrugs();
    expect(Array.isArray(drugs)).toBe(true);
    expect(drugs.length).toBeGreaterThan(0);
    expect(drugs[0]).toHaveProperty('cid');
    expect(drugs[0]).toHaveProperty('name');
    expect(drugs[0]).toHaveProperty('molecular_formula');
    expect(drugs[0]).toHaveProperty('molecular_weight');
    expect(drugs[0]).toHaveProperty('smiles');
    expect(drugs[0]).toHaveProperty('category');
    expect(drugs[0]).toHaveProperty('mechanism');
    expect(drugs[0]).toHaveProperty('source');
  });

  test('getDatabaseStats returns correct structure', () => {
    const stats = getDatabaseStats();
    expect(stats).toHaveProperty('total_proteins');
    expect(stats).toHaveProperty('total_drugs');
    expect(stats).toHaveProperty('organisms');
    expect(stats).toHaveProperty('toxin_types');
    expect(stats).toHaveProperty('drug_categories');
    expect(typeof stats.total_proteins).toBe('number');
    expect(typeof stats.total_drugs).toBe('number');
    expect(Array.isArray(stats.organisms)).toBe(true);
    expect(Array.isArray(stats.toxin_types)).toBe(true);
    expect(Array.isArray(stats.drug_categories)).toBe(true);
  });

  test('protein data matches expected structure from database.py', () => {
    const proteins = getAllProteins();

    // Verify we have the expected number of proteins from the Python data
    expect(proteins.length).toBe(12); // Based on JELLYFISH_TOXINS count

    // Check specific protein data to ensure exact match
    const cfTx1 = proteins.find(p => p.uniprot_id === 'C0HJU7');
    expect(cfTx1).toBeDefined();
    expect(cfTx1?.name).toBe('CfTX-1 (Box Jellyfish Toxin 1)');
    expect(cfTx1?.organism).toBe('Chironex fleckeri');
    expect(cfTx1?.toxin_type).toBe('Cytolytic toxin');
    expect(cfTx1?.molecular_weight).toBe(43000);
  });

  test('drug data matches expected structure from database.py', () => {
    const drugs = getAllDrugs();

    // Verify we have the expected number of drugs from the Python data
    expect(drugs.length).toBe(25); // Based on DRUG_CANDIDATES count

    // Check specific drug data to ensure exact match
    const silymarin = drugs.find(d => d.cid === '5280443');
    expect(silymarin).toBeDefined();
    expect(silymarin?.name).toBe('Silymarin');
    expect(silymarin?.molecular_formula).toBe('C25H22O10');
    expect(silymarin?.molecular_weight).toBe(482.4);
    expect(silymarin?.category).toBe('Flavonoid');
  });

  test('database stats match exact counts', () => {
    const stats = getDatabaseStats();
    expect(stats.total_proteins).toBe(12);
    expect(stats.total_drugs).toBe(25);

    // Verify specific organisms are included
    expect(stats.organisms).toContain('Chironex fleckeri');
    expect(stats.organisms).toContain('Nemopilema nomurai');

    // Verify specific toxin types are included
    expect(stats.toxin_types).toContain('Cytolytic toxin');
    expect(stats.toxin_types).toContain('Metalloproteinase');

    // Verify specific drug categories are included
    expect(stats.drug_categories).toContain('Flavonoid');
    expect(stats.drug_categories).toContain('MMP inhibitor');
  });

  // ========================================================================
  // FILTER FUNCTION TESTS - Critical fixes for Task 3
  // ========================================================================

  describe('getProteinsByOrganism', () => {
    test('should return proteins for valid organism (exact match)', () => {
      const proteins = getProteinsByOrganism('Chironex fleckeri');
      expect(proteins.length).toBeGreaterThan(0);
      proteins.forEach(p => {
        expect(p.organism.toLowerCase()).toContain('chironex fleckeri');
      });
    });

    test('should return proteins for partial organism match', () => {
      const proteins = getProteinsByOrganism('Chironex');
      expect(proteins.length).toBeGreaterThan(0);
      proteins.forEach(p => {
        expect(p.organism.toLowerCase()).toContain('chironex');
      });
    });

    test('should be case-insensitive', () => {
      const proteins1 = getProteinsByOrganism('CHIRONEX FLECKERI');
      const proteins2 = getProteinsByOrganism('chironex fleckeri');
      const proteins3 = getProteinsByOrganism('Chironex Fleckeri');

      expect(proteins1.length).toBe(proteins2.length);
      expect(proteins2.length).toBe(proteins3.length);
      expect(proteins1.length).toBeGreaterThan(0);
    });

    test('should return empty array for non-existent organism', () => {
      const proteins = getProteinsByOrganism('Non-existent organism');
      expect(proteins).toEqual([]);
    });

    test('should handle null input gracefully', () => {
      const proteins = getProteinsByOrganism(null as any);
      expect(proteins).toEqual([]);
    });

    test('should handle undefined input gracefully', () => {
      const proteins = getProteinsByOrganism(undefined as any);
      expect(proteins).toEqual([]);
    });

    test('should handle empty string input', () => {
      const proteins = getProteinsByOrganism('');
      // Empty string should match all proteins since includes('') is always true
      const allProteins = getAllProteins();
      expect(proteins.length).toBe(allProteins.length);
    });

    test('should return specific organism count matches', () => {
      const chironexProteins = getProteinsByOrganism('Chironex fleckeri');
      const nemopilemaProteins = getProteinsByOrganism('Nemopilema nomurai');

      // Based on the database, should have 4 Chironex and 4 Nemopilema proteins
      expect(chironexProteins.length).toBe(4);
      expect(nemopilemaProteins.length).toBe(4);
    });
  });

  describe('getProteinsByToxinType', () => {
    test('should return proteins for valid toxin type (exact match)', () => {
      const proteins = getProteinsByToxinType('Cytolytic toxin');
      expect(proteins.length).toBeGreaterThan(0);
      proteins.forEach(p => {
        expect(p.toxin_type.toLowerCase()).toContain('cytolytic toxin');
      });
    });

    test('should return proteins for partial toxin type match', () => {
      const proteins = getProteinsByToxinType('toxin');
      expect(proteins.length).toBeGreaterThan(0);
      proteins.forEach(p => {
        expect(p.toxin_type.toLowerCase()).toContain('toxin');
      });
    });

    test('should be case-insensitive', () => {
      const proteins1 = getProteinsByToxinType('CYTOLYTIC TOXIN');
      const proteins2 = getProteinsByToxinType('cytolytic toxin');
      const proteins3 = getProteinsByToxinType('Cytolytic Toxin');

      expect(proteins1.length).toBe(proteins2.length);
      expect(proteins2.length).toBe(proteins3.length);
      expect(proteins1.length).toBeGreaterThan(0);
    });

    test('should return empty array for non-existent toxin type', () => {
      const proteins = getProteinsByToxinType('Non-existent toxin type');
      expect(proteins).toEqual([]);
    });

    test('should handle null input gracefully', () => {
      const proteins = getProteinsByToxinType(null as any);
      expect(proteins).toEqual([]);
    });

    test('should handle undefined input gracefully', () => {
      const proteins = getProteinsByToxinType(undefined as any);
      expect(proteins).toEqual([]);
    });

    test('should handle empty string input', () => {
      const proteins = getProteinsByToxinType('');
      // Empty string should match all proteins since includes('') is always true
      const allProteins = getAllProteins();
      expect(proteins.length).toBe(allProteins.length);
    });

    test('should return specific toxin type counts', () => {
      const cytolyticProteins = getProteinsByToxinType('Cytolytic toxin');
      const hemolyticProteins = getProteinsByToxinType('Hemolytic toxin');

      // Based on the database structure
      expect(cytolyticProteins.length).toBeGreaterThan(0);
      expect(hemolyticProteins.length).toBeGreaterThan(0);
    });
  });

  describe('getDrugsByCategory', () => {
    test('should return drugs for valid category (exact match)', () => {
      const drugs = getDrugsByCategory('Flavonoid');
      expect(drugs.length).toBeGreaterThan(0);
      drugs.forEach(d => {
        expect(d.category.toLowerCase()).toContain('flavonoid');
      });
    });

    test('should return drugs for partial category match', () => {
      const drugs = getDrugsByCategory('NSAID');
      expect(drugs.length).toBeGreaterThan(0);
      drugs.forEach(d => {
        expect(d.category.toLowerCase()).toContain('nsaid');
      });
    });

    test('should be case-insensitive', () => {
      const drugs1 = getDrugsByCategory('FLAVONOID');
      const drugs2 = getDrugsByCategory('flavonoid');
      const drugs3 = getDrugsByCategory('Flavonoid');

      expect(drugs1.length).toBe(drugs2.length);
      expect(drugs2.length).toBe(drugs3.length);
      expect(drugs1.length).toBeGreaterThan(0);
    });

    test('should return empty array for non-existent category', () => {
      const drugs = getDrugsByCategory('Non-existent category');
      expect(drugs).toEqual([]);
    });

    test('should handle null input gracefully', () => {
      const drugs = getDrugsByCategory(null as any);
      expect(drugs).toEqual([]);
    });

    test('should handle undefined input gracefully', () => {
      const drugs = getDrugsByCategory(undefined as any);
      expect(drugs).toEqual([]);
    });

    test('should handle empty string input', () => {
      const drugs = getDrugsByCategory('');
      // Empty string should match all drugs since includes('') is always true
      const allDrugs = getAllDrugs();
      expect(drugs.length).toBe(allDrugs.length);
    });

    test('should return specific category counts', () => {
      const flavonoidDrugs = getDrugsByCategory('Flavonoid');
      const nsaidDrugs = getDrugsByCategory('NSAID');
      const mmpInhibitors = getDrugsByCategory('MMP inhibitor');

      // Based on the database, should have specific counts
      expect(flavonoidDrugs.length).toBeGreaterThanOrEqual(8); // Many flavonoids in the data
      expect(nsaidDrugs.length).toBeGreaterThanOrEqual(3); // Several NSAIDs
      expect(mmpInhibitors.length).toBeGreaterThanOrEqual(2); // Multiple MMP inhibitors
    });

    test('should match compound category names', () => {
      const glycosideDrugs = getDrugsByCategory('glycoside');
      expect(glycosideDrugs.length).toBeGreaterThan(0);

      // Should find "Flavonoid glycoside" category
      const flavonoidGlycosides = getDrugsByCategory('Flavonoid glycoside');
      expect(flavonoidGlycosides.length).toBeGreaterThan(0);
    });
  });

  // ========================================================================
  // EDGE CASE AND ERROR HANDLING TESTS
  // ========================================================================

  describe('Edge cases and error handling', () => {
    test('filter functions should handle special characters in input', () => {
      expect(() => getProteinsByOrganism('Chironex & fleckeri')).not.toThrow();
      expect(() => getProteinsByToxinType('toxin-type')).not.toThrow();
      expect(() => getDrugsByCategory('category/subcategory')).not.toThrow();
    });

    test('filter functions should handle very long input strings', () => {
      const longString = 'a'.repeat(1000);
      expect(() => getProteinsByOrganism(longString)).not.toThrow();
      expect(() => getProteinsByToxinType(longString)).not.toThrow();
      expect(() => getDrugsByCategory(longString)).not.toThrow();

      expect(getProteinsByOrganism(longString)).toEqual([]);
      expect(getProteinsByToxinType(longString)).toEqual([]);
      expect(getDrugsByCategory(longString)).toEqual([]);
    });

    test('filter functions should handle numeric inputs gracefully', () => {
      expect(() => getProteinsByOrganism(123 as any)).not.toThrow();
      expect(() => getProteinsByToxinType(456 as any)).not.toThrow();
      expect(() => getDrugsByCategory(789 as any)).not.toThrow();
    });
  });

  // ========================================================================
  // PERFORMANCE AND CACHING TESTS
  // ========================================================================

  describe('Performance and caching', () => {
    beforeEach(() => {
      // Clear cache before each test to ensure clean state
      clearCache();
    });

    test('getAllProteins should cache results', () => {
      const proteins1 = getAllProteins();
      const proteins2 = getAllProteins();

      // Should return the same array reference due to caching
      expect(proteins1).toBe(proteins2);
      expect(proteins1.length).toBeGreaterThan(0);
    });

    test('getAllDrugs should cache results', () => {
      const drugs1 = getAllDrugs();
      const drugs2 = getAllDrugs();

      // Should return the same array reference due to caching
      expect(drugs1).toBe(drugs2);
      expect(drugs1.length).toBeGreaterThan(0);
    });

    test('getDatabaseStats should cache results', () => {
      const stats1 = getDatabaseStats();
      const stats2 = getDatabaseStats();

      // Should return the same object reference due to caching
      expect(stats1).toBe(stats2);
    });

    test('filter functions should cache results by search term', () => {
      const proteins1 = getProteinsByOrganism('Chironex');
      const proteins2 = getProteinsByOrganism('Chironex');

      // Should return the same array reference due to caching
      expect(proteins1).toBe(proteins2);

      const toxins1 = getProteinsByToxinType('Cytolytic');
      const toxins2 = getProteinsByToxinType('Cytolytic');

      expect(toxins1).toBe(toxins2);

      const drugs1 = getDrugsByCategory('Flavonoid');
      const drugs2 = getDrugsByCategory('Flavonoid');

      expect(drugs1).toBe(drugs2);
    });

    test('cache should be case-sensitive for search terms', () => {
      const proteins1 = getProteinsByOrganism('Chironex');
      const proteins2 = getProteinsByOrganism('chironex');

      // Different cases should produce separate cache entries
      // but same results
      expect(proteins1.length).toBe(proteins2.length);
      proteins1.forEach((protein, index) => {
        expect(protein.uniprot_id).toBe(proteins2[index].uniprot_id);
      });
    });

    test('clearCache should reset all caches', () => {
      // Populate caches
      getAllProteins();
      getAllDrugs();
      getDatabaseStats();
      getProteinsByOrganism('Chironex');
      getProteinsByToxinType('Cytolytic');
      getDrugsByCategory('Flavonoid');

      const statsBefore = getCacheStats();
      expect(statsBefore.hasAllProteinsCache).toBe(true);
      expect(statsBefore.hasAllDrugsCache).toBe(true);
      expect(statsBefore.hasDatabaseStatsCache).toBe(true);
      expect(statsBefore.proteinsByOrganismCacheSize).toBeGreaterThan(0);

      // Clear cache
      clearCache();

      const statsAfter = getCacheStats();
      expect(statsAfter.hasAllProteinsCache).toBe(false);
      expect(statsAfter.hasAllDrugsCache).toBe(false);
      expect(statsAfter.hasDatabaseStatsCache).toBe(false);
      expect(statsAfter.proteinsByOrganismCacheSize).toBe(0);
      expect(statsAfter.proteinsByToxinTypeCacheSize).toBe(0);
      expect(statsAfter.drugsByCategoryCacheSize).toBe(0);
    });

    test('getCacheStats should provide accurate cache metrics', () => {
      clearCache();
      const initialStats = getCacheStats();

      // Initially empty
      expect(initialStats.proteinsByOrganismCacheSize).toBe(0);
      expect(initialStats.hasAllProteinsCache).toBe(false);

      // Populate some caches
      getProteinsByOrganism('Chironex');
      getProteinsByOrganism('Nemopilema');
      getProteinsByToxinType('Cytolytic');
      getAllProteins();

      const populatedStats = getCacheStats();
      expect(populatedStats.proteinsByOrganismCacheSize).toBe(2);
      expect(populatedStats.proteinsByToxinTypeCacheSize).toBe(1);
      expect(populatedStats.hasAllProteinsCache).toBe(true);
    });

    test('performance: repeated calls should be faster with cache', () => {
      clearCache();

      // First call (no cache) - measure baseline
      const start1 = performance.now();
      getProteinsByOrganism('Chironex');
      const time1 = performance.now() - start1;

      // Second call (with cache) - should be faster
      const start2 = performance.now();
      getProteinsByOrganism('Chironex');
      const time2 = performance.now() - start2;

      // Cache hit should be significantly faster (at least 2x faster)
      expect(time2).toBeLessThan(time1 / 2);
    });

    test('cache should handle different trim scenarios', () => {
      const proteins1 = getProteinsByOrganism('  Chironex  ');
      const proteins2 = getProteinsByOrganism('Chironex');

      // Should use the same cache entry after trimming
      expect(proteins1).toBe(proteins2);
    });
  });
});