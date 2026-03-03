import { create } from 'zustand';
import { Protein, DrugCandidate } from '../types';
import { getAllProteins, getAllDrugs, getDatabaseStats } from '../services/database';

/**
 * Database Store Interface
 * Manages state for database-related functionality
 * Provides centralized access to proteins, drugs, and database statistics
 */
interface DatabaseState {
  // Core data
  proteins: Protein[];
  drugs: DrugCandidate[];
  stats: { total_proteins: number; total_drugs: number };

  // Loading states
  isLoading: boolean;
  lastLoadTime: number | null;

  // Actions
  loadData: () => void;
  loadProteins: () => void;
  loadDrugs: () => void;
  loadStats: () => void;
  clearData: () => void;

  // Computed getters for convenience
  getProteinByUniprotId: (id: string) => Protein | undefined;
  getDrugByCid: (cid: string) => DrugCandidate | undefined;
  getProteinsByOrganism: (organism: string) => Protein[];
  getDrugsByCategory: (category: string) => DrugCandidate[];
}

/**
 * Zustand store for database state management
 *
 * This store centralizes all database access and caching.
 * It replaces multiple calls to database functions throughout the app
 * and provides a single source of truth for database state.
 */
export const useDatabaseStore = create<DatabaseState>((set, get) => ({
  // Initial state
  proteins: [],
  drugs: [],
  stats: { total_proteins: 0, total_drugs: 0 },
  isLoading: false,
  lastLoadTime: null,

  // Main data loading function
  loadData: () => {
    set({ isLoading: true });

    try {
      const proteins = getAllProteins();
      const drugs = getAllDrugs();
      const stats = getDatabaseStats();

      set({
        proteins,
        drugs,
        stats: {
          total_proteins: stats.total_proteins,
          total_drugs: stats.total_drugs
        },
        isLoading: false,
        lastLoadTime: Date.now()
      });
    } catch (error) {
      console.error('Error loading database data:', error);
      set({ isLoading: false });
    }
  },

  // Load only proteins
  loadProteins: () => {
    try {
      const proteins = getAllProteins();
      set({ proteins });
    } catch (error) {
      console.error('Error loading proteins:', error);
    }
  },

  // Load only drugs
  loadDrugs: () => {
    try {
      const drugs = getAllDrugs();
      set({ drugs });
    } catch (error) {
      console.error('Error loading drugs:', error);
    }
  },

  // Load only statistics
  loadStats: () => {
    try {
      const stats = getDatabaseStats();
      set({
        stats: {
          total_proteins: stats.total_proteins,
          total_drugs: stats.total_drugs
        }
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  },

  // Clear all data
  clearData: () => {
    set({
      proteins: [],
      drugs: [],
      stats: { total_proteins: 0, total_drugs: 0 },
      lastLoadTime: null
    });
  },

  // Computed getter: find protein by UniProt ID
  getProteinByUniprotId: (id: string) => {
    const { proteins } = get();
    return proteins.find(protein => protein.uniprot_id === id);
  },

  // Computed getter: find drug by CID
  getDrugByCid: (cid: string) => {
    const { drugs } = get();
    return drugs.find(drug => drug.cid === cid);
  },

  // Computed getter: filter proteins by organism
  getProteinsByOrganism: (organism: string) => {
    const { proteins } = get();
    const searchTerm = organism.toLowerCase();
    return proteins.filter(protein =>
      protein.organism.toLowerCase().includes(searchTerm)
    );
  },

  // Computed getter: filter drugs by category
  getDrugsByCategory: (category: string) => {
    const { drugs } = get();
    const searchTerm = category.toLowerCase();
    return drugs.filter(drug =>
      drug.category.toLowerCase().includes(searchTerm)
    );
  }
}));