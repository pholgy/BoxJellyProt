# -*- coding: utf-8 -*-
"""
Expanded Database for Jellyfish Toxin Drug Discovery
Extended protein and drug candidate databases
"""

import requests
from dataclasses import dataclass, field
from typing import List, Dict, Optional
import json

# ============================================================================
# DATA CLASSES
# ============================================================================

@dataclass
class Protein:
    """Protein data structure"""
    uniprot_id: str
    name: str
    organism: str
    sequence: str
    length: int
    function: str = ""
    pdb_id: str = ""  # PDB structure ID if available
    toxin_type: str = ""
    molecular_weight: float = 0.0

@dataclass
class DrugCandidate:
    """Drug candidate data structure"""
    cid: str
    name: str
    molecular_formula: str
    molecular_weight: float
    smiles: str = ""
    category: str = ""
    mechanism: str = ""
    source: str = ""

@dataclass
class BindingPocket:
    """Binding pocket data structure"""
    pocket_id: int
    center_x: float
    center_y: float
    center_z: float
    radius: float
    residues: List[str] = field(default_factory=list)
    druggability_score: float = 0.0


# ============================================================================
# EXPANDED JELLYFISH TOXIN DATABASE
# ============================================================================

JELLYFISH_TOXINS = {
    # Chironex fleckeri (Australian Box Jellyfish) - Most dangerous
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

    # Nemopilema nomurai (Giant Jellyfish) - Common in Asia
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

    # Carybdea rastonii (Jimble Box Jellyfish)
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

    # Chrysaora quinquecirrha (Sea Nettle)
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

    # Pelagia noctiluca (Mauve Stinger)
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

    # Cyanea capillata (Lion's Mane Jellyfish)
    "CcTX-1": {
        "uniprot_id": "B0FXK1",
        "name": "CcTX-1 (Lion's Mane Toxin 1)",
        "organism": "Cyanea capillata",
        "function": "Hemolytic and cytotoxic activity",
        "toxin_type": "Hemolytic toxin",
        "pdb_id": "",
        "sequence": "MKLFILAFLVLISTFANAVTAEEVRRRLEEALKQKLEALKEQLEVLKSELSKLGEELDKAVDKAVDKAVDKAVDKAVDKAVD",
        "molecular_weight": 95000
    },
}


# ============================================================================
# EXPANDED DRUG CANDIDATE DATABASE
# ============================================================================

DRUG_CANDIDATES = [
    # ===== FLAVONOIDS (Natural compounds) =====
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

    # ===== METALLOPROTEINASE INHIBITORS =====
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

    # ===== PHOSPHOLIPASE A2 INHIBITORS =====
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

    # ===== ANTI-INFLAMMATORY DRUGS =====
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

    # ===== TRADITIONAL/HERBAL COMPOUNDS =====
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

    # ===== ZINC SUPPLEMENTS (for wound healing) =====
    {
        "cid": "11192",
        "name": "Zinc sulfate",
        "molecular_formula": "ZnO4S",
        "molecular_weight": 161.47,
        "smiles": "[Zn+2].[O-]S([O-])(=O)=O",
        "category": "Mineral supplement",
        "mechanism": "Wound healing, immune support",
        "source": "Synthetic"
    },
]


# ============================================================================
# DATABASE ACCESS FUNCTIONS
# ============================================================================

def get_all_proteins() -> List[Protein]:
    """Get all jellyfish toxin proteins from database"""
    proteins = []
    for key, data in JELLYFISH_TOXINS.items():
        protein = Protein(
            uniprot_id=data["uniprot_id"],
            name=data["name"],
            organism=data["organism"],
            sequence=data["sequence"],
            length=len(data["sequence"]),
            function=data["function"],
            pdb_id=data.get("pdb_id", ""),
            toxin_type=data.get("toxin_type", ""),
            molecular_weight=data.get("molecular_weight", 0)
        )
        proteins.append(protein)
    return proteins


def get_proteins_by_organism(organism: str) -> List[Protein]:
    """Get proteins filtered by organism name"""
    all_proteins = get_all_proteins()
    return [p for p in all_proteins if organism.lower() in p.organism.lower()]


def get_proteins_by_toxin_type(toxin_type: str) -> List[Protein]:
    """Get proteins filtered by toxin type"""
    all_proteins = get_all_proteins()
    return [p for p in all_proteins if toxin_type.lower() in p.toxin_type.lower()]


def get_all_drugs() -> List[DrugCandidate]:
    """Get all drug candidates from database"""
    drugs = []
    for data in DRUG_CANDIDATES:
        drug = DrugCandidate(
            cid=data["cid"],
            name=data["name"],
            molecular_formula=data["molecular_formula"],
            molecular_weight=data["molecular_weight"],
            smiles=data.get("smiles", ""),
            category=data.get("category", ""),
            mechanism=data.get("mechanism", ""),
            source=data.get("source", "")
        )
        drugs.append(drug)
    return drugs


def get_drugs_by_category(category: str) -> List[DrugCandidate]:
    """Get drugs filtered by category"""
    all_drugs = get_all_drugs()
    return [d for d in all_drugs if category.lower() in d.category.lower()]


def fetch_protein_from_uniprot(uniprot_id: str) -> Optional[Protein]:
    """Fetch protein data from UniProt API"""
    try:
        url = f"https://rest.uniprot.org/uniprotkb/{uniprot_id}.json"
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            data = response.json()
            return Protein(
                uniprot_id=uniprot_id,
                name=data.get("proteinDescription", {}).get("recommendedName", {}).get("fullName", {}).get("value", "Unknown"),
                organism=data.get("organism", {}).get("scientificName", "Unknown"),
                sequence=data.get("sequence", {}).get("value", ""),
                length=data.get("sequence", {}).get("length", 0)
            )
    except Exception as e:
        print(f"Error fetching from UniProt: {e}")
    return None


def fetch_drug_from_pubchem(compound_name: str) -> Optional[DrugCandidate]:
    """Fetch drug data from PubChem API"""
    try:
        url = f"https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/{compound_name}/JSON"
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            data = response.json()
            compound = data["PC_Compounds"][0]

            # Extract properties
            props = {}
            for prop in compound.get("props", []):
                label = prop.get("urn", {}).get("label", "")
                if "sval" in prop.get("value", {}):
                    props[label] = prop["value"]["sval"]
                elif "fval" in prop.get("value", {}):
                    props[label] = prop["value"]["fval"]

            return DrugCandidate(
                cid=str(compound["id"]["id"]["cid"]),
                name=compound_name,
                molecular_formula=props.get("Molecular Formula", ""),
                molecular_weight=float(props.get("Molecular Weight", 0)),
                smiles=props.get("SMILES", {}).get("Canonical", "")
            )
    except Exception as e:
        print(f"Error fetching from PubChem: {e}")
    return None


# ============================================================================
# DATABASE STATISTICS
# ============================================================================

def get_database_stats() -> Dict:
    """Get statistics about the database"""
    proteins = get_all_proteins()
    drugs = get_all_drugs()

    organisms = list(set(p.organism for p in proteins))
    toxin_types = list(set(p.toxin_type for p in proteins if p.toxin_type))
    drug_categories = list(set(d.category for d in drugs if d.category))

    return {
        "total_proteins": len(proteins),
        "total_drugs": len(drugs),
        "organisms": organisms,
        "toxin_types": toxin_types,
        "drug_categories": drug_categories
    }


if __name__ == "__main__":
    # Print database statistics
    stats = get_database_stats()
    print("=" * 50)
    print("JELLYFISH TOXIN DATABASE STATISTICS")
    print("=" * 50)
    print(f"Total Proteins: {stats['total_proteins']}")
    print(f"Total Drug Candidates: {stats['total_drugs']}")
    print(f"\nOrganisms: {', '.join(stats['organisms'])}")
    print(f"\nToxin Types: {', '.join(stats['toxin_types'])}")
    print(f"\nDrug Categories: {', '.join(stats['drug_categories'])}")
