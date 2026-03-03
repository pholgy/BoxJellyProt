import { describe, test, expect, beforeEach } from 'vitest';
import { useSimulationStore } from './simulationStore';
import { useDatabaseStore } from './databaseStore';
import type { DockingResult, Protein, DrugCandidate } from '../types';

// Mock data for testing
const mockProtein: Protein = {
  uniprot_id: 'TEST001',
  name: 'Test Protein',
  organism: 'Test Organism',
  sequence: 'MKLFILA',
  length: 7,
  function: 'Test function',
  pdb_id: 'TEST',
  toxin_type: 'Test toxin',
  molecular_weight: 1000
};

const mockDrug: DrugCandidate = {
  cid: 'TEST001',
  name: 'Test Drug',
  molecular_formula: 'C6H12O6',
  molecular_weight: 180.16,
  smiles: 'OCC(O)C(O)C(O)C(O)C=O',
  category: 'Test category',
  mechanism: 'Test mechanism',
  source: 'Test source'
};

const mockDockingResult: DockingResult = {
  protein: mockProtein,
  drug: mockDrug,
  pocket: {
    pocket_id: 1,
    center_x: 0,
    center_y: 0,
    center_z: 0,
    radius: 5,
    residues: ['ALA1', 'LYS2'],
    druggability_score: 0.8
  },
  binding_affinity: -8.5,
  hydrogen_bonds: 3,
  hydrophobic_contacts: 5,
  is_successful: true
};

describe('Simulation Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    useSimulationStore.getState().setSimulationResults(null);
    useSimulationStore.getState().setSelectedProteins([]);
    useSimulationStore.getState().setSelectedDrugs([]);
  });

  test('has correct initial state', () => {
    const store = useSimulationStore.getState();
    expect(store.simulationResults).toBeNull();
    expect(store.selectedProteins).toEqual([]);
    expect(store.selectedDrugs).toEqual([]);
  });

  test('can set and get simulation results', () => {
    const store = useSimulationStore.getState();
    const results = [mockDockingResult];

    store.setSimulationResults(results);

    expect(useSimulationStore.getState().simulationResults).toEqual(results);
  });

  test('can set and get selected proteins', () => {
    const store = useSimulationStore.getState();
    const proteins = [mockProtein];

    store.setSelectedProteins(proteins);

    expect(useSimulationStore.getState().selectedProteins).toEqual(proteins);
  });

  test('can set and get selected drugs', () => {
    const store = useSimulationStore.getState();
    const drugs = [mockDrug];

    store.setSelectedDrugs(drugs);

    expect(useSimulationStore.getState().selectedDrugs).toEqual(drugs);
  });

  test('can clear simulation results', () => {
    const store = useSimulationStore.getState();

    // Set some results first
    store.setSimulationResults([mockDockingResult]);
    expect(useSimulationStore.getState().simulationResults).toHaveLength(1);

    // Clear results
    store.setSimulationResults(null);
    expect(useSimulationStore.getState().simulationResults).toBeNull();
  });

  test('stores are independent', () => {
    const store = useSimulationStore.getState();

    store.setSelectedProteins([mockProtein]);
    store.setSelectedDrugs([mockDrug]);

    expect(useSimulationStore.getState().selectedProteins).toHaveLength(1);
    expect(useSimulationStore.getState().selectedDrugs).toHaveLength(1);
    expect(useSimulationStore.getState().simulationResults).toBeNull();
  });
});

describe('Database Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    const store = useDatabaseStore.getState();
    // Reset to initial state
    useDatabaseStore.setState({
      proteins: [],
      drugs: [],
      stats: { total_proteins: 0, total_drugs: 0 }
    });
  });

  test('has correct initial state', () => {
    const store = useDatabaseStore.getState();
    expect(store.proteins).toEqual([]);
    expect(store.drugs).toEqual([]);
    expect(store.stats).toEqual({ total_proteins: 0, total_drugs: 0 });
    expect(typeof store.loadData).toBe('function');
  });

  test('loadData function exists and can be called', () => {
    const store = useDatabaseStore.getState();
    expect(() => store.loadData()).not.toThrow();
  });

  test('can manually set proteins and drugs', () => {
    const proteins = [mockProtein];
    const drugs = [mockDrug];

    useDatabaseStore.setState({
      proteins,
      drugs,
      stats: { total_proteins: proteins.length, total_drugs: drugs.length }
    });

    const store = useDatabaseStore.getState();
    expect(store.proteins).toEqual(proteins);
    expect(store.drugs).toEqual(drugs);
    expect(store.stats.total_proteins).toBe(1);
    expect(store.stats.total_drugs).toBe(1);
  });

  test('store state persists across calls', () => {
    const proteins = [mockProtein];

    useDatabaseStore.setState({ proteins });

    const store1 = useDatabaseStore.getState();
    const store2 = useDatabaseStore.getState();

    expect(store1.proteins).toEqual(store2.proteins);
  });
});

describe('Store Integration', () => {
  test('simulation store and database store are independent', () => {
    // Set up database store
    useDatabaseStore.setState({
      proteins: [mockProtein],
      drugs: [mockDrug],
      stats: { total_proteins: 1, total_drugs: 1 }
    });

    // Set up simulation store
    useSimulationStore.getState().setSelectedProteins([mockProtein]);

    // Verify they don't interfere with each other
    expect(useDatabaseStore.getState().proteins).toHaveLength(1);
    expect(useSimulationStore.getState().selectedProteins).toHaveLength(1);
    expect(useSimulationStore.getState().simulationResults).toBeNull();
  });
});