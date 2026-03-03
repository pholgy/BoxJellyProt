/**
 * Store exports - Centralized store access
 *
 * This file provides a single entry point for all Zustand stores
 * used in the Box Jellyfish Toxin Protein Analysis application.
 */

export { useSimulationStore } from './simulationStore';
export { useDatabaseStore } from './databaseStore';

// Store types for external use
export type {
  // Re-export interfaces if needed for external consumption
} from './simulationStore';

export type {
  // Re-export interfaces if needed for external consumption
} from './databaseStore';

/**
 * Utility function to reset all stores to initial state
 * Useful for testing and cleanup
 */
export const resetAllStores = () => {
  // Import stores dynamically to avoid circular dependencies
  import('./simulationStore').then(({ useSimulationStore }) => {
    useSimulationStore.getState().clearSimulation();
  });

  import('./databaseStore').then(({ useDatabaseStore }) => {
    useDatabaseStore.getState().clearData();
  });
};