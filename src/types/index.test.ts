import { Protein, DrugCandidate, BindingPocket, DockingResult } from './index';

describe('Data Types', () => {
  test('should create valid Protein object', () => {
    const protein: Protein = {
      uniprot_id: 'P12345',
      name: 'Test Protein',
      organism: 'Test Organism',
      sequence: 'ACGT',
      length: 100,
      function: 'Test function',
      pdb_id: 'PDB123',
      toxin_type: 'Test toxin',
      molecular_weight: 1000.5
    };
    expect(protein.uniprot_id).toBe('P12345');
    expect(protein.name).toBe('Test Protein');
    expect(protein.length).toBe(100);
    expect(protein.molecular_weight).toBe(1000.5);
  });

  test('should create valid DrugCandidate object', () => {
    const drug: DrugCandidate = {
      cid: 'CID12345',
      name: 'Test Drug',
      molecular_formula: 'C6H12O6',
      molecular_weight: 180.16,
      smiles: 'C(C(C(C(C(C=O)O)O)O)O)O',
      category: 'Flavonoid',
      mechanism: 'Test mechanism',
      source: 'Test source'
    };
    expect(drug.cid).toBe('CID12345');
    expect(drug.name).toBe('Test Drug');
    expect(drug.molecular_weight).toBe(180.16);
    expect(drug.category).toBe('Flavonoid');
  });

  test('should create valid BindingPocket object', () => {
    const pocket: BindingPocket = {
      pocket_id: 1,
      center_x: 10.5,
      center_y: 20.3,
      center_z: 15.7,
      radius: 8.2,
      residues: ['ALA', 'GLY', 'VAL'],
      druggability_score: 0.85
    };
    expect(pocket.pocket_id).toBe(1);
    expect(pocket.center_x).toBe(10.5);
    expect(pocket.residues).toEqual(['ALA', 'GLY', 'VAL']);
    expect(pocket.druggability_score).toBe(0.85);
  });

  test('should create valid DockingResult object', () => {
    const protein: Protein = {
      uniprot_id: 'P12345',
      name: 'Test Protein',
      organism: 'Test Organism',
      sequence: 'ACGT',
      length: 100,
      function: 'Test function',
      pdb_id: 'PDB123',
      toxin_type: 'Test toxin',
      molecular_weight: 1000.5
    };

    const drug: DrugCandidate = {
      cid: 'CID12345',
      name: 'Test Drug',
      molecular_formula: 'C6H12O6',
      molecular_weight: 180.16,
      smiles: 'C(C(C(C(C(C=O)O)O)O)O)O',
      category: 'Flavonoid',
      mechanism: 'Test mechanism',
      source: 'Test source'
    };

    const pocket: BindingPocket = {
      pocket_id: 1,
      center_x: 10.5,
      center_y: 20.3,
      center_z: 15.7,
      radius: 8.2,
      residues: ['ALA', 'GLY', 'VAL'],
      druggability_score: 0.85
    };

    const dockingResult: DockingResult = {
      protein,
      drug,
      pocket,
      binding_affinity: -8.5,
      hydrogen_bonds: 3,
      hydrophobic_contacts: 7,
      is_successful: true
    };

    expect(dockingResult.protein).toBe(protein);
    expect(dockingResult.drug).toBe(drug);
    expect(dockingResult.pocket).toBe(pocket);
    expect(dockingResult.binding_affinity).toBe(-8.5);
    expect(dockingResult.hydrogen_bonds).toBe(3);
    expect(dockingResult.hydrophobic_contacts).toBe(7);
    expect(dockingResult.is_successful).toBe(true);
  });

  test('should handle optional fields in Protein object', () => {
    const protein: Protein = {
      uniprot_id: 'P12345',
      name: 'Test Protein',
      organism: 'Test Organism',
      sequence: 'ACGT',
      length: 100,
      function: '',
      pdb_id: '',
      toxin_type: '',
      molecular_weight: 0.0
    };
    expect(protein.function).toBe('');
    expect(protein.pdb_id).toBe('');
    expect(protein.toxin_type).toBe('');
    expect(protein.molecular_weight).toBe(0.0);
  });

  test('should handle optional fields in DrugCandidate object', () => {
    const drug: DrugCandidate = {
      cid: 'CID12345',
      name: 'Test Drug',
      molecular_formula: 'C6H12O6',
      molecular_weight: 180.16,
      smiles: '',
      category: '',
      mechanism: '',
      source: ''
    };
    expect(drug.smiles).toBe('');
    expect(drug.category).toBe('');
    expect(drug.mechanism).toBe('');
    expect(drug.source).toBe('');
  });

  test('should handle empty residues array in BindingPocket', () => {
    const pocket: BindingPocket = {
      pocket_id: 1,
      center_x: 10.5,
      center_y: 20.3,
      center_z: 15.7,
      radius: 8.2,
      residues: [],
      druggability_score: 0.0
    };
    expect(pocket.residues).toEqual([]);
    expect(pocket.druggability_score).toBe(0.0);
  });
});