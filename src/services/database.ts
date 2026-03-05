import { Protein, DrugCandidate, DatabaseStats } from '../types';

// ============================================================================
// JELLYFISH TOXIN DATABASE - Exact port from Python database.py
// ============================================================================

const JELLYFISH_TOXINS_DATA = {
  // Chironex fleckeri (Australian Box Jellyfish) - Most dangerous
  "CfTX-1": {
    "uniprot_id": "C0HJU7",
    "name": "CfTX-1 (Box Jellyfish Toxin 1)",
    "organism": "Chironex fleckeri",
    "function": "Pore-forming toxin causing cardiac toxicity and cell lysis",
    "toxin_type": "Cytolytic toxin",
    "pdb_id": "",
    "sequence": "MKLFILAFLVLISTFANAVTAEEVRRRLEEALKQKLEALKEQLEVLKSELSKLGEELDKAVDKAVDKAVDKAVDKAVDKAVDKAVDKAVDKAVDKAVDKAVDKAVDKAVDKAVDKAVDKAVD",
    "molecular_weight": 43000
  },
  "CfTX-2": {
    "uniprot_id": "C0HJU8",
    "name": "CfTX-2 (Box Jellyfish Toxin 2)",
    "organism": "Chironex fleckeri",
    "function": "Cytolytic toxin with hemolytic and cardiovascular effects",
    "toxin_type": "Cytolytic toxin",
    "pdb_id": "",
    "sequence": "MKLFVLAFLVLISAFANAVTAEEVRRRLEEALKQKLDALKDQLEVLKSELSKLGEELDKAVDKAVDKAVDKAVDKAVDKAVDKAVDKAVDKAVDKAVDKAVDKAVDKAVDKAVDKAVDKAVD",
    "molecular_weight": 45000
  },
  "CfTX-A": {
    "uniprot_id": "P0DL47",
    "name": "CfTX-A (Box Jellyfish Toxin A)",
    "organism": "Chironex fleckeri",
    "function": "Pore-forming toxin targeting cell membranes",
    "toxin_type": "Pore-forming toxin",
    "pdb_id": "",
    "sequence": "MKTLFILAFLVLISTFANAVTAEEVRRRLEEALKQKLEALKEQLEVLKSELSKLGEELDKAVDKAVDKAVDKAVD",
    "molecular_weight": 40000
  },
  "CfTX-B": {
    "uniprot_id": "P0DL48",
    "name": "CfTX-B (Box Jellyfish Toxin B)",
    "organism": "Chironex fleckeri",
    "function": "Hemolytic toxin causing red blood cell destruction",
    "toxin_type": "Hemolytic toxin",
    "pdb_id": "",
    "sequence": "MKTLFILAFLVLISTFANAVTAEEVRRRLEEALKQKLEALKEQLEVLKSELSKLGEELDKAVDKAVDKAVDKAVDKAVD",
    "molecular_weight": 42000
  },

  // Nemopilema nomurai (Giant Jellyfish) - Common in Asia
  "NnV-MLP": {
    "uniprot_id": "A0A1I9LP01",
    "name": "Metalloproteinase-like protein (NnV-Mlp)",
    "organism": "Nemopilema nomurai",
    "function": "Causes tissue damage, inflammation, hemorrhage, edema",
    "toxin_type": "Metalloproteinase",
    "pdb_id": "",
    "sequence": "MKTLLVLAFLVAISAFANAVTAEEVRRRLEEALKQKLEALKEQLEVLKSELSKLGEELDKAVDKAVDKAVDKAVDKAVDKAVDKAVDKAVDKAVDKAVDKAVDKAVDKAVDKAVDKAVDKAVDKAVDKAVDKAVDKAVDKAVDKAVDKAVDKAVD",
    "molecular_weight": 65000
  },
  "NnV-PLA2": {
    "uniprot_id": "A0A2B4RK01",
    "name": "Phospholipase A2 (NnV-PLA2)",
    "organism": "Nemopilema nomurai",
    "function": "Inflammatory response, cell membrane damage, pain",
    "toxin_type": "Phospholipase",
    "pdb_id": "",
    "sequence": "MKFLLLAFLVLISTFANAVTAEEVRRRLEEALKQKLEALKEQLEVLKSELSKLGEELDKAVDKAVDKAVDKAVDKAVDKAVDKAVDKAVDKAVD",
    "molecular_weight": 14000
  },
  "NnV-CTX": {
    "uniprot_id": "A0A2B4RK02",
    "name": "Cytotoxin (NnV-CTX)",
    "organism": "Nemopilema nomurai",
    "function": "Cell death induction, tissue necrosis",
    "toxin_type": "Cytotoxin",
    "pdb_id": "",
    "sequence": "MKTLLVLAFLVAISAFANAVTAEEVRRRLEEALKQKLEALKEQLEVLKSELSKLGEELDKAVDKAVDKAVDKAVDKAVDKAVD",
    "molecular_weight": 35000
  },
  "NnV-Hemolysin": {
    "uniprot_id": "A0A2B4RK03",
    "name": "Hemolysin (NnV-Hemolysin)",
    "organism": "Nemopilema nomurai",
    "function": "Red blood cell lysis, hemolytic activity",
    "toxin_type": "Hemolysin",
    "pdb_id": "",
    "sequence": "MKTLLVLAFLVAISAFANAVTAEEVRRRLEEALKQKLEALKEQLEVLKSELSKLGEELDKAVDKAVDKAVDKAVDKAVDKAVDKAVDKAVD",
    "molecular_weight": 38000
  },

  // Carybdea rastonii (Jimble Box Jellyfish)
  "CrTX-A": {
    "uniprot_id": "Q9U8W1",
    "name": "CrTX-A (Carybdea Toxin A)",
    "organism": "Carybdea rastonii",
    "function": "Hemolytic and cytotoxic activity",
    "toxin_type": "Cytolytic toxin",
    "pdb_id": "",
    "sequence": "MKLFILAFLVLISTFANAVTAEEVRRRLEEALKQKLEALKEQLEVLKSELSKLGEELDKAVDKAVDKAVD",
    "molecular_weight": 43000
  },

  // Chrysaora quinquecirrha (Sea Nettle)
  "CqTX-1": {
    "uniprot_id": "Q0VZT1",
    "name": "CqTX-1 (Sea Nettle Toxin 1)",
    "organism": "Chrysaora quinquecirrha",
    "function": "Cardiotoxic and hemolytic effects",
    "toxin_type": "Cardiotoxin",
    "pdb_id": "",
    "sequence": "MKLFILAFLVLISTFANAVTAEEVRRRLEEALKQKLEALKEQLEVLKSELSKLGEELDKAVDKAVDKAVDKAVDKAVD",
    "molecular_weight": 150000
  },

  // Pelagia noctiluca (Mauve Stinger)
  "PnTX-1": {
    "uniprot_id": "A0A0K1",
    "name": "PnTX-1 (Mauve Stinger Toxin 1)",
    "organism": "Pelagia noctiluca",
    "function": "Cytolytic, hemolytic, neurotoxic effects",
    "toxin_type": "Neurotoxin",
    "pdb_id": "",
    "sequence": "MKLFILAFLVLISTFANAVTAEEVRRRLEEALKQKLEALKEQLEVLKSELSKLGEELDKAVDKAVDKAVDKAVD",
    "molecular_weight": 70000
  },

  // Cyanea capillata (Lion's Mane Jellyfish)
  "CcTX-1": {
    "uniprot_id": "B0FXK1",
    "name": "CcTX-1 (Lion's Mane Toxin 1)",
    "organism": "Cyanea capillata",
    "function": "Hemolytic and cytotoxic activity",
    "toxin_type": "Hemolytic toxin",
    "pdb_id": "",
    "sequence": "MKLFILAFLVLISTFANAVTAEEVRRRLEEALKQKLEALKEQLEVLKSELSKLGEELDKAVDKAVDKAVDKAVDKAVDKAVD",
    "molecular_weight": 95000
  }
};

// ============================================================================
// DRUG CANDIDATES DATABASE - Exact port from Python database.py
// ============================================================================

const DRUG_CANDIDATES_DATA = [
  // ===== FLAVONOIDS (Natural compounds) =====
  {
    "cid": "5280443",
    "name": "Silymarin",
    "molecular_formula": "C25H22O10",
    "molecular_weight": 482.4,
    "smiles": "COc1cc(ccc1O)[C@H]2Oc3cc(O)cc(O)c3C(=O)[C@@H]2O",
    "category": "Flavonoid",
    "mechanism": "Antioxidant, metalloproteinase inhibitor",
    "source": "Milk thistle (Silybum marianum)"
  },
  {
    "cid": "73160",
    "name": "Pinobanksin",
    "molecular_formula": "C15H12O5",
    "molecular_weight": 272.25,
    "smiles": "OC1C(=O)c2c(O)cc(O)cc2OC1c3ccccc3",
    "category": "Flavonoid",
    "mechanism": "Antioxidant, anti-inflammatory",
    "source": "Propolis, pine"
  },
  {
    "cid": "5281701",
    "name": "Tricetin",
    "molecular_formula": "C15H10O7",
    "molecular_weight": 302.23,
    "smiles": "Oc1cc(O)c2C(=O)C=C(Oc2c1)c3cc(O)c(O)c(O)c3",
    "category": "Flavonoid",
    "mechanism": "Antioxidant, enzyme inhibitor",
    "source": "Eucalyptus, Myrtaceae family"
  },
  {
    "cid": "5280961",
    "name": "Quercetin",
    "molecular_formula": "C15H10O7",
    "molecular_weight": 302.24,
    "smiles": "Oc1cc(O)c2C(=O)C(O)=C(Oc2c1)c3ccc(O)c(O)c3",
    "category": "Flavonoid",
    "mechanism": "Antioxidant, anti-inflammatory, PLA2 inhibitor",
    "source": "Onions, apples, berries"
  },
  {
    "cid": "5280863",
    "name": "Kaempferol",
    "molecular_formula": "C15H10O6",
    "molecular_weight": 286.24,
    "smiles": "Oc1ccc(cc1)c2oc3cc(O)cc(O)c3c(=O)c2O",
    "category": "Flavonoid",
    "mechanism": "Antioxidant, anti-venom properties",
    "source": "Tea, broccoli, apples"
  },
  {
    "cid": "5280343",
    "name": "Apigenin",
    "molecular_formula": "C15H10O5",
    "molecular_weight": 270.24,
    "smiles": "Oc1ccc(cc1)c2cc(=O)c3c(O)cc(O)cc3o2",
    "category": "Flavonoid",
    "mechanism": "Anti-inflammatory, enzyme inhibitor",
    "source": "Chamomile, parsley, celery"
  },
  {
    "cid": "5280445",
    "name": "Luteolin",
    "molecular_formula": "C15H10O6",
    "molecular_weight": 286.24,
    "smiles": "Oc1cc(O)c2c(c1)oc(cc2=O)c3ccc(O)c(O)c3",
    "category": "Flavonoid",
    "mechanism": "Anti-inflammatory, antioxidant",
    "source": "Celery, parsley, broccoli"
  },
  {
    "cid": "159654",
    "name": "Myricetin",
    "molecular_formula": "C15H10O8",
    "molecular_weight": 318.24,
    "smiles": "Oc1cc(O)c2c(c1)oc(c(O)c2=O)c3cc(O)c(O)c(O)c3",
    "category": "Flavonoid",
    "mechanism": "Antioxidant, enzyme inhibitor",
    "source": "Berries, walnuts, tea"
  },
  {
    "cid": "10680",
    "name": "Hesperidin",
    "molecular_formula": "C28H34O15",
    "molecular_weight": 610.56,
    "smiles": "COc1ccc(cc1O)C2CC(=O)c3c(O)cc(OC4OC(COC5OC(C)C(O)C(O)C5O)C(O)C(O)C4O)cc3O2",
    "category": "Flavonoid glycoside",
    "mechanism": "Anti-inflammatory, vascular protection",
    "source": "Citrus fruits"
  },

  // ===== METALLOPROTEINASE INHIBITORS =====
  {
    "cid": "3220",
    "name": "EDTA",
    "molecular_formula": "C10H16N2O8",
    "molecular_weight": 292.24,
    "smiles": "OC(=O)CN(CCN(CC(O)=O)CC(O)=O)CC(O)=O",
    "category": "Chelating agent",
    "mechanism": "Metal chelator, metalloproteinase inhibitor",
    "source": "Synthetic"
  },
  {
    "cid": "6419725",
    "name": "Marimastat",
    "molecular_formula": "C15H29N3O5S",
    "molecular_weight": 363.47,
    "smiles": "CC(C)C(CC(=O)NO)C(=O)NC(C(C)C)C(=O)NC",
    "category": "MMP inhibitor",
    "mechanism": "Broad-spectrum metalloproteinase inhibitor",
    "source": "Synthetic"
  },
  {
    "cid": "119373",
    "name": "Batimastat",
    "molecular_formula": "C23H31N3O4S2",
    "molecular_weight": 477.64,
    "smiles": "CC(C)CC(CC(=O)NO)C(=O)NC1CCCCC1",
    "category": "MMP inhibitor",
    "mechanism": "Metalloproteinase inhibitor",
    "source": "Synthetic"
  },
  {
    "cid": "5288798",
    "name": "Doxycycline",
    "molecular_formula": "C22H24N2O8",
    "molecular_weight": 444.43,
    "smiles": "CC1C2C(C3C(C(=O)C(=C(C3(C(=O)C2=C(C4=C1C=CC=C4O)O)O)O)C(=O)N)N(C)C)O",
    "category": "Tetracycline antibiotic",
    "mechanism": "MMP inhibitor, anti-inflammatory",
    "source": "Semi-synthetic"
  },
  {
    "cid": "72276",
    "name": "Tetracycline",
    "molecular_formula": "C22H24N2O8",
    "molecular_weight": 444.4,
    "smiles": "CN(C)C1C2CC3C(c4cccc(O)c4C(=O)C3=C(O)C2(C)C(=O)C(=C1O)C(N)=O)O",
    "category": "Antibiotic",
    "mechanism": "Metalloproteinase inhibitor",
    "source": "Streptomyces"
  },

  // ===== PHOSPHOLIPASE A2 INHIBITORS =====
  {
    "cid": "4671",
    "name": "Mepacrine",
    "molecular_formula": "C23H30ClN3O",
    "molecular_weight": 399.96,
    "smiles": "CCN(CC)CCCC(C)Nc1c2ccc(Cl)cc2nc2ccc(OC)cc12",
    "category": "PLA2 inhibitor",
    "mechanism": "Phospholipase A2 inhibitor",
    "source": "Synthetic"
  },
  {
    "cid": "4495",
    "name": "Aristolochic acid",
    "molecular_formula": "C17H11NO7",
    "molecular_weight": 341.27,
    "smiles": "COc1cccc2c1cc3c(c2C(=O)O)c(c4ccccc4n3)C(=O)O",
    "category": "PLA2 inhibitor",
    "mechanism": "PLA2 inhibitor (use with caution - nephrotoxic)",
    "source": "Aristolochia plants"
  },

  // ===== ANTI-INFLAMMATORY DRUGS =====
  {
    "cid": "2244",
    "name": "Aspirin",
    "molecular_formula": "C9H8O4",
    "molecular_weight": 180.16,
    "smiles": "CC(=O)Oc1ccccc1C(O)=O",
    "category": "NSAID",
    "mechanism": "COX inhibitor, anti-inflammatory",
    "source": "Synthetic (from willow bark)"
  },
  {
    "cid": "3672",
    "name": "Ibuprofen",
    "molecular_formula": "C13H18O2",
    "molecular_weight": 206.28,
    "smiles": "CC(C)Cc1ccc(cc1)C(C)C(O)=O",
    "category": "NSAID",
    "mechanism": "COX inhibitor, anti-inflammatory",
    "source": "Synthetic"
  },
  {
    "cid": "3033",
    "name": "Indomethacin",
    "molecular_formula": "C19H16ClNO4",
    "molecular_weight": 357.79,
    "smiles": "COc1ccc2n(C)c(C)c(CC(=O)O)c2c1C(=O)c1ccc(Cl)cc1",
    "category": "NSAID",
    "mechanism": "COX inhibitor, potent anti-inflammatory",
    "source": "Synthetic"
  },
  {
    "cid": "5090",
    "name": "Prednisolone",
    "molecular_formula": "C21H28O5",
    "molecular_weight": 360.44,
    "smiles": "CC12CC(O)C3C(CCC4=CC(=O)C=CC34C)C1CCC2(O)C(=O)CO",
    "category": "Corticosteroid",
    "mechanism": "Anti-inflammatory, immunosuppressant",
    "source": "Synthetic"
  },

  // ===== TRADITIONAL/HERBAL COMPOUNDS =====
  {
    "cid": "969516",
    "name": "Curcumin",
    "molecular_formula": "C21H20O6",
    "molecular_weight": 368.38,
    "smiles": "COc1cc(ccc1O)C=CC(=O)CC(=O)C=Cc2ccc(O)c(OC)c2",
    "category": "Polyphenol",
    "mechanism": "Anti-inflammatory, antioxidant, anti-venom",
    "source": "Turmeric (Curcuma longa)"
  },
  {
    "cid": "442793",
    "name": "Resveratrol",
    "molecular_formula": "C14H12O3",
    "molecular_weight": 228.24,
    "smiles": "Oc1ccc(cc1)C=Cc2cc(O)cc(O)c2",
    "category": "Stilbenoid",
    "mechanism": "Antioxidant, anti-inflammatory",
    "source": "Grapes, red wine"
  },
  {
    "cid": "65064",
    "name": "Epigallocatechin gallate",
    "molecular_formula": "C22H18O11",
    "molecular_weight": 458.37,
    "smiles": "Oc1cc(O)c2c(c1)OC(c1cc(O)c(O)c(O)c1)C(O)C2OC(=O)c1cc(O)c(O)c(O)c1",
    "category": "Catechin",
    "mechanism": "Antioxidant, MMP inhibitor",
    "source": "Green tea"
  },
  {
    "cid": "638024",
    "name": "Glycyrrhizin",
    "molecular_formula": "C42H62O16",
    "molecular_weight": 822.93,
    "smiles": "CC1(C)C(CCC2(C)C1CCC1(C)C2C(=O)C=C2C3CC(C)(C)CCC3(C(O)=O)CCC12C)OC1OC(C(O)C(O)C1OC1OC(C(O)C(O)C1O)C(O)=O)C(O)=O",
    "category": "Triterpenoid saponin",
    "mechanism": "Anti-inflammatory, detoxification",
    "source": "Licorice root"
  },

  // ===== ZINC SUPPLEMENTS (for wound healing) =====
  {
    "cid": "11192",
    "name": "Zinc sulfate",
    "molecular_formula": "ZnO4S",
    "molecular_weight": 161.47,
    "smiles": "[Zn+2].[O-]S([O-])(=O)=O",
    "category": "Mineral supplement",
    "mechanism": "Wound healing, immune support",
    "source": "Synthetic"
  }
];

// ============================================================================
// CACHING AND PERFORMANCE OPTIMIZATIONS
// ============================================================================

// Cache for expensive computations
const cache = {
  allProteins: null as Protein[] | null,
  allDrugs: null as DrugCandidate[] | null,
  proteinsByOrganism: new Map<string, Protein[]>(),
  proteinsByToxinType: new Map<string, Protein[]>(),
  drugsByCategory: new Map<string, DrugCandidate[]>(),
  databaseStats: null as DatabaseStats | null
};

/**
 * Clear all caches - useful for testing or if data changes
 */
export function clearCache(): void {
  cache.allProteins = null;
  cache.allDrugs = null;
  cache.proteinsByOrganism.clear();
  cache.proteinsByToxinType.clear();
  cache.drugsByCategory.clear();
  cache.databaseStats = null;
}

/**
 * Get cache statistics for monitoring
 */
export function getCacheStats() {
  return {
    proteinsByOrganismCacheSize: cache.proteinsByOrganism.size,
    proteinsByToxinTypeCacheSize: cache.proteinsByToxinType.size,
    drugsByCategoryCacheSize: cache.drugsByCategory.size,
    hasAllProteinsCache: cache.allProteins !== null,
    hasAllDrugsCache: cache.allDrugs !== null,
    hasDatabaseStatsCache: cache.databaseStats !== null
  };
}

// ============================================================================
// DATABASE ACCESS FUNCTIONS
// ============================================================================

/**
 * Get all jellyfish toxin proteins from database
 * Port from Python get_all_proteins() function
 * Uses caching for performance optimization
 */
export function getAllProteins(): Protein[] {
  // Return cached result if available
  if (cache.allProteins !== null) {
    return cache.allProteins;
  }

  const proteins: Protein[] = [];

  for (const data of Object.values(JELLYFISH_TOXINS_DATA)) {
    const protein: Protein = {
      uniprot_id: data.uniprot_id,
      name: data.name,
      organism: data.organism,
      sequence: data.sequence,
      length: data.sequence.length,
      function: data.function,
      pdb_id: data.pdb_id || "",
      toxin_type: data.toxin_type || "",
      molecular_weight: data.molecular_weight || 0
    };
    proteins.push(protein);
  }

  // Cache the result for future calls
  cache.allProteins = proteins;
  return proteins;
}

/**
 * Get all drug candidates from database
 * Port from Python get_all_drugs() function
 * Uses caching for performance optimization
 */
export function getAllDrugs(): DrugCandidate[] {
  // Return cached result if available
  if (cache.allDrugs !== null) {
    return cache.allDrugs;
  }

  const drugs: DrugCandidate[] = [];

  for (const data of DRUG_CANDIDATES_DATA) {
    const drug: DrugCandidate = {
      cid: data.cid,
      name: data.name,
      molecular_formula: data.molecular_formula,
      molecular_weight: data.molecular_weight,
      smiles: data.smiles || "",
      category: data.category || "",
      mechanism: data.mechanism || "",
      source: data.source || ""
    };
    drugs.push(drug);
  }

  // Cache the result for future calls
  cache.allDrugs = drugs;
  return drugs;
}

/**
 * Get proteins filtered by organism name
 * Port from Python get_proteins_by_organism() function
 *
 * @param organism - The organism name to search for (case-insensitive partial match)
 * @returns Array of proteins matching the organism search term
 * @throws Error if input validation fails
 */
export function getProteinsByOrganism(organism: string): Protein[] {
  // Input validation
  if (organism === null || organism === undefined) {
    console.warn('getProteinsByOrganism: received null/undefined input, returning empty array');
    return [];
  }

  if (typeof organism !== 'string') {
    console.warn('getProteinsByOrganism: received non-string input, converting to string');
    organism = String(organism);
  }

  const searchTerm = organism.toLowerCase().trim();

  // Check cache first
  if (cache.proteinsByOrganism.has(searchTerm)) {
    return cache.proteinsByOrganism.get(searchTerm)!;
  }

  try {
    const allProteins = getAllProteins();

    const results = allProteins.filter(p => {
      if (!p.organism || typeof p.organism !== 'string') {
        return false;
      }
      return p.organism.toLowerCase().includes(searchTerm);
    });

    // Cache the result for future calls
    cache.proteinsByOrganism.set(searchTerm, results);
    return results;
  } catch (error) {
    console.error('Error in getProteinsByOrganism:', error);
    throw new Error(`Failed to filter proteins by organism "${organism}": ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get proteins filtered by toxin type
 * Port from Python get_proteins_by_toxin_type() function
 *
 * @param toxinType - The toxin type to search for (case-insensitive partial match)
 * @returns Array of proteins matching the toxin type search term
 * @throws Error if input validation fails
 */
export function getProteinsByToxinType(toxinType: string): Protein[] {
  // Input validation
  if (toxinType === null || toxinType === undefined) {
    console.warn('getProteinsByToxinType: received null/undefined input, returning empty array');
    return [];
  }

  if (typeof toxinType !== 'string') {
    console.warn('getProteinsByToxinType: received non-string input, converting to string');
    toxinType = String(toxinType);
  }

  const searchTerm = toxinType.toLowerCase().trim();

  // Check cache first
  if (cache.proteinsByToxinType.has(searchTerm)) {
    return cache.proteinsByToxinType.get(searchTerm)!;
  }

  try {
    const allProteins = getAllProteins();

    const results = allProteins.filter(p => {
      if (!p.toxin_type || typeof p.toxin_type !== 'string') {
        return false;
      }
      return p.toxin_type.toLowerCase().includes(searchTerm);
    });

    // Cache the result for future calls
    cache.proteinsByToxinType.set(searchTerm, results);
    return results;
  } catch (error) {
    console.error('Error in getProteinsByToxinType:', error);
    throw new Error(`Failed to filter proteins by toxin type "${toxinType}": ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get drugs filtered by category
 * Port from Python get_drugs_by_category() function
 *
 * @param category - The drug category to search for (case-insensitive partial match)
 * @returns Array of drugs matching the category search term
 * @throws Error if input validation fails
 */
export function getDrugsByCategory(category: string): DrugCandidate[] {
  // Input validation
  if (category === null || category === undefined) {
    console.warn('getDrugsByCategory: received null/undefined input, returning empty array');
    return [];
  }

  if (typeof category !== 'string') {
    console.warn('getDrugsByCategory: received non-string input, converting to string');
    category = String(category);
  }

  const searchTerm = category.toLowerCase().trim();

  // Check cache first
  if (cache.drugsByCategory.has(searchTerm)) {
    return cache.drugsByCategory.get(searchTerm)!;
  }

  try {
    const allDrugs = getAllDrugs();

    const results = allDrugs.filter(d => {
      if (!d.category || typeof d.category !== 'string') {
        return false;
      }
      return d.category.toLowerCase().includes(searchTerm);
    });

    // Cache the result for future calls
    cache.drugsByCategory.set(searchTerm, results);
    return results;
  } catch (error) {
    console.error('Error in getDrugsByCategory:', error);
    throw new Error(`Failed to filter drugs by category "${category}": ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get statistics about the database
 * Port from Python get_database_stats() function
 * Uses caching for performance optimization
 */
export function getDatabaseStats(): DatabaseStats {
  // Return cached result if available
  if (cache.databaseStats !== null) {
    return cache.databaseStats;
  }

  const proteins = getAllProteins();
  const drugs = getAllDrugs();

  const organisms = Array.from(new Set(proteins.map(p => p.organism)));
  const toxinTypes = Array.from(new Set(
    proteins.map(p => p.toxin_type).filter(t => t !== "")
  ));
  const drugCategories = Array.from(new Set(
    drugs.map(d => d.category).filter(c => c !== "")
  ));

  const stats = {
    total_proteins: proteins.length,
    total_drugs: drugs.length,
    organisms: organisms,
    toxin_types: toxinTypes,
    drug_categories: drugCategories
  };

  // Cache the result for future calls
  cache.databaseStats = stats;
  return stats;
}

// ============================================================================
// DATABASE SERVICE OBJECT - For component compatibility
// ============================================================================

/**
 * DatabaseService object that wraps all database functions
 * This maintains compatibility with components that expect DatabaseService.methodName()
 */
export const DatabaseService = {
  getAllProteins,
  getAllDrugs,
  getProteinsByOrganism,
  getProteinsByToxinType,
  getDrugsByCategory,
  getDatabaseStats,
  clearCache,
  getCacheStats
} as const;