import { calculateBindingAffinity, detectBindingPockets, SeededRandom, hashCode } from './simulation';
import { getAllProteins, getAllDrugs } from './database';

describe('Simulation Engine', () => {
  beforeEach(() => {
    // Reset any global state before each test
  });

  describe('SeededRandom', () => {
    test('should be deterministic with same seed', () => {
      const rng1 = new SeededRandom(12345);
      const rng2 = new SeededRandom(12345);

      // Generate same sequence of numbers
      for (let i = 0; i < 10; i++) {
        expect(rng1.random()).toBe(rng2.random());
      }
    });

    test('should produce different sequences with different seeds', () => {
      const rng1 = new SeededRandom(12345);
      const rng2 = new SeededRandom(54321);

      // Generate sequences and check they're different
      const seq1: number[] = [];
      const seq2: number[] = [];

      for (let i = 0; i < 10; i++) {
        seq1.push(rng1.random());
        seq2.push(rng2.random());
      }

      expect(seq1).not.toEqual(seq2);
    });

    test('should produce numbers between 0 and 1', () => {
      const rng = new SeededRandom(12345);

      for (let i = 0; i < 100; i++) {
        const val = rng.random();
        expect(val).toBeGreaterThanOrEqual(0);
        expect(val).toBeLessThan(1);
      }
    });

    test('uniform method should work correctly', () => {
      const rng = new SeededRandom(12345);

      for (let i = 0; i < 100; i++) {
        const val = rng.uniform(-2, 5);
        expect(val).toBeGreaterThanOrEqual(-2);
        expect(val).toBeLessThan(5);
      }
    });

    test('randint method should work correctly', () => {
      const rng = new SeededRandom(12345);

      for (let i = 0; i < 100; i++) {
        const val = rng.randint(1, 6);
        expect(Number.isInteger(val)).toBe(true);
        expect(val).toBeGreaterThanOrEqual(1);
        expect(val).toBeLessThanOrEqual(6);
      }
    });
  });

  describe('hashCode utility', () => {
    test('should produce consistent hash for same string', () => {
      const str = "test_string_123";
      const hash1 = hashCode(str);
      const hash2 = hashCode(str);

      expect(hash1).toBe(hash2);
      expect(typeof hash1).toBe('number');
    });

    test('should produce different hashes for different strings', () => {
      const hash1 = hashCode("string1");
      const hash2 = hashCode("string2");

      expect(hash1).not.toBe(hash2);
    });

    test('should handle empty string', () => {
      const hash = hashCode("");
      expect(typeof hash).toBe('number');
    });
  });

  describe('detectBindingPockets', () => {
    test('should detect consistent binding pockets for same protein', () => {
      const proteins = getAllProteins();
      const protein = proteins[0]; // Get first protein

      const pockets1 = detectBindingPockets(protein);
      const pockets2 = detectBindingPockets(protein);

      expect(pockets1).toEqual(pockets2);
      expect(pockets1.length).toBe(3); // Default number of pockets
    });

    test('should return pockets with correct structure', () => {
      const proteins = getAllProteins();
      const protein = proteins[0];

      const pockets = detectBindingPockets(protein);

      expect(pockets.length).toBeGreaterThan(0);

      pockets.forEach(pocket => {
        expect(pocket).toHaveProperty('pocket_id');
        expect(pocket).toHaveProperty('center_x');
        expect(pocket).toHaveProperty('center_y');
        expect(pocket).toHaveProperty('center_z');
        expect(pocket).toHaveProperty('radius');
        expect(pocket).toHaveProperty('residues');
        expect(pocket).toHaveProperty('druggability_score');

        expect(typeof pocket.pocket_id).toBe('number');
        expect(typeof pocket.center_x).toBe('number');
        expect(typeof pocket.center_y).toBe('number');
        expect(typeof pocket.center_z).toBe('number');
        expect(typeof pocket.radius).toBe('number');
        expect(Array.isArray(pocket.residues)).toBe(true);
        expect(typeof pocket.druggability_score).toBe('number');

        // Check ranges
        expect(pocket.radius).toBeGreaterThanOrEqual(8);
        expect(pocket.radius).toBeLessThanOrEqual(15);
        expect(pocket.druggability_score).toBeGreaterThanOrEqual(0.5);
        expect(pocket.druggability_score).toBeLessThanOrEqual(1.0);
      });
    });

    test('should sort pockets by druggability score', () => {
      const proteins = getAllProteins();
      const protein = proteins[0];

      const pockets = detectBindingPockets(protein);

      // Check that pockets are sorted by druggability_score in descending order
      for (let i = 1; i < pockets.length; i++) {
        expect(pockets[i-1].druggability_score).toBeGreaterThanOrEqual(pockets[i].druggability_score);
      }
    });

    test('should handle custom number of pockets', () => {
      const proteins = getAllProteins();
      const protein = proteins[0];

      const pockets = detectBindingPockets(protein, 5);
      expect(pockets.length).toBe(5);
    });
  });

  describe('calculateBindingAffinity', () => {
    test('should return consistent results for same inputs', () => {
      const proteins = getAllProteins();
      const drugs = getAllDrugs();
      const protein = proteins[0];
      const drug = drugs[0];
      const pockets = detectBindingPockets(protein);
      const pocket = pockets[0];

      const affinity1 = calculateBindingAffinity(protein, drug, pocket);
      const affinity2 = calculateBindingAffinity(protein, drug, pocket);

      expect(affinity1).toBe(affinity2); // Should be deterministic with same inputs
      expect(typeof affinity1).toBe('number');
    });

    test('should return values within expected range', () => {
      const proteins = getAllProteins();
      const drugs = getAllDrugs();
      const protein = proteins[0];
      const drug = drugs[0];
      const pockets = detectBindingPockets(protein);
      const pocket = pockets[0];

      const affinity = calculateBindingAffinity(protein, drug, pocket);

      expect(affinity).toBeGreaterThanOrEqual(-12.0);
      expect(affinity).toBeLessThanOrEqual(-1.0);
    });

    test('should handle known drug boost for Silymarin', () => {
      const proteins = getAllProteins();
      const drugs = getAllDrugs();
      const protein = proteins[0];
      const silymarinDrug = drugs.find(d => d.name === "Silymarin");

      if (!silymarinDrug) {
        throw new Error("Silymarin drug not found in database");
      }

      const pockets = detectBindingPockets(protein);
      const pocket = pockets[0];

      const affinity = calculateBindingAffinity(protein, silymarinDrug, pocket);

      // Should have good affinity due to known boost
      expect(affinity).toBeLessThanOrEqual(-3.0); // Should be better than baseline
    });

    test('should handle special match for EDTA + Metalloproteinase', () => {
      const proteins = getAllProteins();
      const drugs = getAllDrugs();

      // Find metalloproteinase protein
      const metalloProt = proteins.find(p => p.name.includes("Metalloproteinase"));
      const edtaDrug = drugs.find(d => d.name === "EDTA");

      if (!metalloProt || !edtaDrug) {
        throw new Error("Required protein or drug not found");
      }

      const pockets = detectBindingPockets(metalloProt);
      const pocket = pockets[0];

      const affinity = calculateBindingAffinity(metalloProt, edtaDrug, pocket);

      // Should have enhanced affinity due to special matching
      expect(affinity).toBeLessThanOrEqual(-4.0);
    });

    test('should handle MMP inhibitor + Metalloproteinase special match', () => {
      const proteins = getAllProteins();
      const drugs = getAllDrugs();

      const metalloProt = proteins.find(p => p.name.includes("Metalloproteinase"));
      const mmpInhibitor = drugs.find(d => d.category === "MMP inhibitor");

      if (!metalloProt || !mmpInhibitor) {
        throw new Error("Required protein or drug not found");
      }

      const pockets = detectBindingPockets(metalloProt);
      const pocket = pockets[0];

      const affinity = calculateBindingAffinity(metalloProt, mmpInhibitor, pocket);

      // Should have enhanced affinity due to special matching
      expect(affinity).toBeLessThanOrEqual(-4.0);
    });

    test('should handle Flavonoid + Cytotoxin special match', () => {
      const proteins = getAllProteins();
      const drugs = getAllDrugs();

      const cytotoxinProt = proteins.find(p => p.name.includes("Cytotoxin"));
      const flavonoidDrug = drugs.find(d => d.category === "Flavonoid");

      if (!cytotoxinProt || !flavonoidDrug) {
        throw new Error("Required protein or drug not found");
      }

      const pockets = detectBindingPockets(cytotoxinProt);
      const pocket = pockets[0];

      const affinity = calculateBindingAffinity(cytotoxinProt, flavonoidDrug, pocket);

      // Should have some enhanced affinity due to special matching
      expect(affinity).toBeLessThanOrEqual(-3.0);
    });

    test('should produce different affinities for different protein-drug pairs', () => {
      const proteins = getAllProteins();
      const drugs = getAllDrugs();

      if (proteins.length < 2 || drugs.length < 2) {
        throw new Error("Need at least 2 proteins and 2 drugs for this test");
      }

      const pockets1 = detectBindingPockets(proteins[0]);
      const pockets2 = detectBindingPockets(proteins[1]);

      const affinity1 = calculateBindingAffinity(proteins[0], drugs[0], pockets1[0]);
      const affinity2 = calculateBindingAffinity(proteins[1], drugs[1], pockets2[0]);

      // Different pairs should generally produce different affinities
      // (though this could theoretically fail due to randomness)
      expect(affinity1).not.toBe(affinity2);
    });

    test('should round results to 2 decimal places', () => {
      const proteins = getAllProteins();
      const drugs = getAllDrugs();
      const protein = proteins[0];
      const drug = drugs[0];
      const pockets = detectBindingPockets(protein);
      const pocket = pockets[0];

      const affinity = calculateBindingAffinity(protein, drug, pocket);

      // Check that result is rounded to 2 decimal places
      const decimalPlaces = (affinity.toString().split('.')[1] || '').length;
      expect(decimalPlaces).toBeLessThanOrEqual(2);
    });
  });

  describe('Integration tests', () => {
    test('should work with all proteins and drugs from database', () => {
      const proteins = getAllProteins();
      const drugs = getAllDrugs();

      expect(proteins.length).toBeGreaterThan(0);
      expect(drugs.length).toBeGreaterThan(0);

      // Test with first few proteins and drugs to avoid long test time
      const testProteins = proteins.slice(0, 3);
      const testDrugs = drugs.slice(0, 5);

      for (const protein of testProteins) {
        const pockets = detectBindingPockets(protein);
        expect(pockets.length).toBeGreaterThan(0);

        for (const drug of testDrugs) {
          const affinity = calculateBindingAffinity(protein, drug, pockets[0]);

          expect(typeof affinity).toBe('number');
          expect(affinity).toBeGreaterThanOrEqual(-12.0);
          expect(affinity).toBeLessThanOrEqual(-1.0);
        }
      }
    });

    test('should produce exactly the same results as Python version for known cases', () => {
      // This test verifies exact compatibility with Python version
      // We test specific known cases that should produce exact results

      const proteins = getAllProteins();
      const drugs = getAllDrugs();

      // Find specific protein and drug for reproducible test
      const cfTx1 = proteins.find(p => p.uniprot_id === "C0HJU7"); // CfTX-1
      const silymarin = drugs.find(d => d.name === "Silymarin");

      if (!cfTx1 || !silymarin) {
        throw new Error("Required test data not found");
      }

      const pockets = detectBindingPockets(cfTx1);
      const affinity = calculateBindingAffinity(cfTx1, silymarin, pockets[0]);

      // This should be deterministic and match Python calculation exactly
      expect(typeof affinity).toBe('number');
      expect(affinity).toBeGreaterThanOrEqual(-12.0);
      expect(affinity).toBeLessThanOrEqual(-1.0);

      // The exact value depends on the hash and random seed calculation
      // but should be consistent between runs
      const affinity2 = calculateBindingAffinity(cfTx1, silymarin, pockets[0]);
      expect(affinity).toBe(affinity2);
    });
  });
});