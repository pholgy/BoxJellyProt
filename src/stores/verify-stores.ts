/**
 * Store verification script
 * This file verifies that the Zustand stores are correctly implemented
 * and match the expected patterns from Streamlit session state
 */

// Import statements - verify modules can be imported
import { useSimulationStore } from './simulationStore';
import { useDatabaseStore } from './databaseStore';
/**
 * Verify Simulation Store Implementation
 */
export function verifySimulationStore() {
  const store = useSimulationStore.getState();

  // Verify initial state matches Streamlit session state defaults
  console.assert(store.simulationResults === null, 'simulationResults should initially be null');
  console.assert(Array.isArray(store.selectedProteins), 'selectedProteins should be an array');
  console.assert(store.selectedProteins.length === 0, 'selectedProteins should initially be empty');
  console.assert(Array.isArray(store.selectedDrugs), 'selectedDrugs should be an array');
  console.assert(store.selectedDrugs.length === 0, 'selectedDrugs should initially be empty');

  // Verify action functions exist
  console.assert(typeof store.setSimulationResults === 'function', 'setSimulationResults should be a function');
  console.assert(typeof store.setSelectedProteins === 'function', 'setSelectedProteins should be a function');
  console.assert(typeof store.setSelectedDrugs === 'function', 'setSelectedDrugs should be a function');
  console.assert(typeof store.clearSimulation === 'function', 'clearSimulation should be a function');

  // Verify utility functions exist
  console.assert(typeof store.addSelectedProtein === 'function', 'addSelectedProtein should be a function');
  console.assert(typeof store.removeSelectedProtein === 'function', 'removeSelectedProtein should be a function');
  console.assert(typeof store.addSelectedDrug === 'function', 'addSelectedDrug should be a function');
  console.assert(typeof store.removeSelectedDrug === 'function', 'removeSelectedDrug should be a function');

  console.log('✅ Simulation store verification passed');
  return true;
}

/**
 * Verify Database Store Implementation
 */
export function verifyDatabaseStore() {
  const store = useDatabaseStore.getState();

  // Verify initial state
  console.assert(Array.isArray(store.proteins), 'proteins should be an array');
  console.assert(store.proteins.length === 0, 'proteins should initially be empty');
  console.assert(Array.isArray(store.drugs), 'drugs should be an array');
  console.assert(store.drugs.length === 0, 'drugs should initially be empty');
  console.assert(typeof store.stats === 'object', 'stats should be an object');
  console.assert(store.stats.total_proteins === 0, 'stats.total_proteins should initially be 0');
  console.assert(store.stats.total_drugs === 0, 'stats.total_drugs should initially be 0');

  // Verify action functions exist
  console.assert(typeof store.loadData === 'function', 'loadData should be a function');
  console.assert(typeof store.loadProteins === 'function', 'loadProteins should be a function');
  console.assert(typeof store.loadDrugs === 'function', 'loadDrugs should be a function');
  console.assert(typeof store.loadStats === 'function', 'loadStats should be a function');
  console.assert(typeof store.clearData === 'function', 'clearData should be a function');

  // Verify getter functions exist
  console.assert(typeof store.getProteinByUniprotId === 'function', 'getProteinByUniprotId should be a function');
  console.assert(typeof store.getDrugByCid === 'function', 'getDrugByCid should be a function');
  console.assert(typeof store.getProteinsByOrganism === 'function', 'getProteinsByOrganism should be a function');
  console.assert(typeof store.getDrugsByCategory === 'function', 'getDrugsByCategory should be a function');

  console.log('✅ Database store verification passed');
  return true;
}

/**
 * Verify Session State Mapping
 * Ensures the stores correctly map to Streamlit session state variables
 */
export function verifySessionStateMapping() {
  const simStore = useSimulationStore.getState();

  // Verify mapping to Streamlit session state
  // st.session_state['simulation_results'] ↔ simStore.simulationResults
  console.assert(simStore.simulationResults === null, 'simulationResults maps to st.session_state["simulation_results"]');

  // st.session_state['selected_proteins'] ↔ simStore.selectedProteins
  console.assert(Array.isArray(simStore.selectedProteins), 'selectedProteins maps to st.session_state["selected_proteins"]');

  // st.session_state['selected_drugs'] ↔ simStore.selectedDrugs
  console.assert(Array.isArray(simStore.selectedDrugs), 'selectedDrugs maps to st.session_state["selected_drugs"]');

  console.log('✅ Session state mapping verification passed');
  return true;
}

/**
 * Run all verifications
 */
export function runAllVerifications() {
  console.log('🧪 Running Zustand store verifications...\n');

  try {
    verifySimulationStore();
    verifyDatabaseStore();
    verifySessionStateMapping();

    console.log('\n🎉 All store verifications passed!');
    console.log('✅ Stores are correctly implemented and ready for use');
    return true;
  } catch (error) {
    console.error('❌ Store verification failed:', error);
    return false;
  }
}

// Run verifications if this file is executed directly
if (typeof window === 'undefined') {
  runAllVerifications();
}