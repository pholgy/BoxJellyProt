/**
 * TypeScript interfaces for Box Jellyfish Toxin Protein Analysis
 * These interfaces match the Python dataclass structure exactly
 */

export interface Protein {
  uniprot_id: string;
  name: string;
  organism: string;
  sequence: string;
  length: number;
  function: string;
  pdb_id: string;
  toxin_type: string;
  molecular_weight: number;
}

export interface DrugCandidate {
  cid: string;
  name: string;
  molecular_formula: string;
  molecular_weight: number;
  smiles: string;
  category: string;
  mechanism: string;
  source: string;
}

export interface BindingPocket {
  pocket_id: number;
  center_x: number;
  center_y: number;
  center_z: number;
  radius: number;
  residues: string[];
  druggability_score: number;
}

export interface DockingResult {
  protein: Protein;
  drug: DrugCandidate;
  pocket: BindingPocket;
  binding_affinity: number;
  hydrogen_bonds: number;
  hydrophobic_contacts: number;
  is_successful: boolean;
}

// Additional utility types for the application
export interface DatabaseStats {
  total_proteins: number;
  total_drugs: number;
  organisms: string[];
  toxin_types: string[];
  drug_categories: string[];
}

// Type guards for runtime type checking
export function isProtein(obj: any): obj is Protein {
  return obj &&
    typeof obj.uniprot_id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.organism === 'string' &&
    typeof obj.sequence === 'string' &&
    typeof obj.length === 'number' &&
    typeof obj.function === 'string' &&
    typeof obj.pdb_id === 'string' &&
    typeof obj.toxin_type === 'string' &&
    typeof obj.molecular_weight === 'number';
}

export function isDrugCandidate(obj: any): obj is DrugCandidate {
  return obj &&
    typeof obj.cid === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.molecular_formula === 'string' &&
    typeof obj.molecular_weight === 'number' &&
    typeof obj.smiles === 'string' &&
    typeof obj.category === 'string' &&
    typeof obj.mechanism === 'string' &&
    typeof obj.source === 'string';
}

export function isBindingPocket(obj: any): obj is BindingPocket {
  return obj &&
    typeof obj.pocket_id === 'number' &&
    typeof obj.center_x === 'number' &&
    typeof obj.center_y === 'number' &&
    typeof obj.center_z === 'number' &&
    typeof obj.radius === 'number' &&
    Array.isArray(obj.residues) &&
    typeof obj.druggability_score === 'number';
}

export function isDockingResult(obj: any): obj is DockingResult {
  return obj &&
    isProtein(obj.protein) &&
    isDrugCandidate(obj.drug) &&
    isBindingPocket(obj.pocket) &&
    typeof obj.binding_affinity === 'number' &&
    typeof obj.hydrogen_bonds === 'number' &&
    typeof obj.hydrophobic_contacts === 'number' &&
    typeof obj.is_successful === 'boolean';
}