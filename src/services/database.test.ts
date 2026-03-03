import { getAllProteins, getAllDrugs, getDatabaseStats } from './database';
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
});