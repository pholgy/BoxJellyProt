import { create } from 'zustand';
import { DockingResult, Protein, DrugCandidate } from '../types';

/**
 * Simulation Store Interface
 * Manages state for molecular docking simulation functionality
 * Replaces Streamlit's session state for simulation-related data:
 * - st.session_state['simulation_results']
 * - st.session_state['selected_proteins']
 * - st.session_state['selected_drugs']
 */
interface SimulationState {
  // Core simulation data
  simulationResults: DockingResult[] | null;
  selectedProteins: Protein[];
  selectedDrugs: DrugCandidate[];

  // Actions to update state
  setSimulationResults: (results: DockingResult[] | null) => void;
  setSelectedProteins: (proteins: Protein[]) => void;
  setSelectedDrugs: (drugs: DrugCandidate[]) => void;

  // Utility actions
  clearSimulation: () => void;
  addSelectedProtein: (protein: Protein) => void;
  removeSelectedProtein: (proteinId: string) => void;
  addSelectedDrug: (drug: DrugCandidate) => void;
  removeSelectedDrug: (drugId: string) => void;
}

/**
 * Zustand store for simulation state management
 *
 * This store replaces Streamlit's session state variables:
 * - simulationResults ↔ st.session_state['simulation_results']
 * - selectedProteins ↔ st.session_state['selected_proteins']
 * - selectedDrugs ↔ st.session_state['selected_drugs']
 */
export const useSimulationStore = create<SimulationState>((set, get) => ({
  // Initial state - matches Streamlit's initial session state
  simulationResults: null,
  selectedProteins: [],
  selectedDrugs: [],

  // Core setters - direct replacements for session state assignment
  setSimulationResults: (results: DockingResult[] | null) => {
    set({ simulationResults: results });
  },

  setSelectedProteins: (proteins: Protein[]) => {
    set({ selectedProteins: proteins });
  },

  setSelectedDrugs: (drugs: DrugCandidate[]) => {
    set({ selectedDrugs: drugs });
  },

  // Utility action to clear all simulation data
  clearSimulation: () => {
    set({
      simulationResults: null,
      selectedProteins: [],
      selectedDrugs: []
    });
  },

  // Individual protein management
  addSelectedProtein: (protein: Protein) => {
    const { selectedProteins } = get();
    // Prevent duplicates based on uniprot_id
    if (!selectedProteins.find(p => p.uniprot_id === protein.uniprot_id)) {
      set({ selectedProteins: [...selectedProteins, protein] });
    }
  },

  removeSelectedProtein: (proteinId: string) => {
    const { selectedProteins } = get();
    set({
      selectedProteins: selectedProteins.filter(p => p.uniprot_id !== proteinId)
    });
  },

  // Individual drug management
  addSelectedDrug: (drug: DrugCandidate) => {
    const { selectedDrugs } = get();
    // Prevent duplicates based on cid
    if (!selectedDrugs.find(d => d.cid === drug.cid)) {
      set({ selectedDrugs: [...selectedDrugs, drug] });
    }
  },

  removeSelectedDrug: (drugId: string) => {
    const { selectedDrugs } = get();
    set({
      selectedDrugs: selectedDrugs.filter(d => d.cid !== drugId)
    });
  }
}));