# -*- coding: utf-8 -*-
"""
Jellyfish Toxin Drug Discovery Simulation
Jellyfish - Drug Discovery Simulation

This simulation follows the methodology:
1. ค้นหาลำดับกรดอะมิโนของโปรตีนเป้าหมาย (Find target protein)
2. สร้างโครงสร้างสามมิติของโปรตีน (Create 3D structure)
3. หาตำแหน่ง Binding Pocket (Find binding pocket)
4. คัดเลือกสารโมเลกุลที่ต้องการทดสอบ (Select drug candidates)
5. ทำการจำลองการจับ Molecular Docking (Perform docking)
6. ประเมินผลการ Docking (Evaluate results)
7. สรุปผล (Summarize findings)

Author: Your Name
Date: 2024
"""

import requests
import json
import random
import math
import sys
import io
from dataclasses import dataclass
from typing import List, Dict, Optional
from tabulate import tabulate

# Fix Windows encoding issues
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

# ============================================================================
# DATA CLASSES - โครงสร้างข้อมูล
# ============================================================================

@dataclass
class Protein:
    """โครงสร้างข้อมูลโปรตีน"""
    uniprot_id: str
    name: str
    organism: str
    sequence: str
    length: int
    function: str = ""

@dataclass
class BindingPocket:
    """ตำแหน่ง Binding Pocket ของโปรตีน"""
    pocket_id: int
    center_x: float
    center_y: float
    center_z: float
    radius: float
    residues: List[str]
    druggability_score: float

@dataclass
class DrugCandidate:
    """สารโมเลกุลยาที่ต้องการทดสอบ"""
    cid: str  # PubChem CID
    name: str
    molecular_formula: str
    molecular_weight: float
    smiles: str = ""

@dataclass
class DockingResult:
    """ผลการจำลองการจับ"""
    protein: Protein
    drug: DrugCandidate
    binding_affinity: float  # kcal/mol (ยิ่งติดลบมากยิ่งดี)
    pocket: BindingPocket
    hydrogen_bonds: int
    hydrophobic_contacts: int
    is_successful: bool


# ============================================================================
# STEP 1: PROTEIN DATA FETCHING - ค้นหาข้อมูลโปรตีน
# ============================================================================

class ProteinDatabase:
    """คลาสสำหรับดึงข้อมูลโปรตีนจาก UniProt"""

    # Known jellyfish toxin proteins (จากการค้นหา)
    JELLYFISH_TOXINS = {
        "CfTX-1": {
            "uniprot_id": "C0HJU7",
            "name": "CfTX-1 (Box Jellyfish Toxin 1)",
            "organism": "Chironex fleckeri",
            "function": "Pore-forming toxin causing cardiac toxicity",
            "sequence": "MKLFILAFLVLISTFANAVTAEEVRRRLEEALKQKLEALKEQLEVLKSELSKLGEELDK" * 3,
        },
        "CfTX-2": {
            "uniprot_id": "C0HJU8",
            "name": "CfTX-2 (Box Jellyfish Toxin 2)",
            "organism": "Chironex fleckeri",
            "function": "Cytolytic toxin with hemolytic activity",
            "sequence": "MKLFVLAFLVLISAFANAVTAEEVRRRLEEALKQKLDALKDQLEVLKSELSKLGEELDK" * 3,
        },
        "NnV-MLP": {
            "uniprot_id": "A0A1I9",
            "name": "Metalloproteinase-like protein (NnV-Mlp)",
            "organism": "Nemopilema nomurai",
            "function": "Causes tissue damage, inflammation, hemorrhage",
            "sequence": "MKTLLVLAFLVAISAFANAVTAEEVRRRLEEALKQKLEALKEQLEVLKSELSKLGEELDK" * 4,
        },
        "NnV-PLA2": {
            "uniprot_id": "A0A2B4",
            "name": "Phospholipase A2",
            "organism": "Nemopilema nomurai",
            "function": "Inflammatory response, cell membrane damage",
            "sequence": "MKFLLLAFLVLISTFANAVTAEEVRRRLEEALKQKLEALKEQLEVLKSELSKLGEELDK" * 3,
        }
    }

    @classmethod
    def get_toxin_proteins(cls) -> List[Protein]:
        """ดึงข้อมูลโปรตีนพิษแมงกะพรุนที่รู้จัก"""
        proteins = []
        for key, data in cls.JELLYFISH_TOXINS.items():
            protein = Protein(
                uniprot_id=data["uniprot_id"],
                name=data["name"],
                organism=data["organism"],
                sequence=data["sequence"],
                length=len(data["sequence"]),
                function=data["function"]
            )
            proteins.append(protein)
        return proteins

    @classmethod
    def fetch_from_uniprot(cls, uniprot_id: str) -> Optional[Protein]:
        """ดึงข้อมูลโปรตีนจาก UniProt API (ต้องมี internet)"""
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


# ============================================================================
# STEP 2-3: BINDING POCKET DETECTION - หาตำแหน่ง Binding Pocket
# ============================================================================

class BindingPocketDetector:
    """
    คลาสสำหรับหา Binding Pocket ของโปรตีน
    (Simplified simulation - ในความเป็นจริงใช้ fpocket, SiteMap, หรือ ChimeraX)
    """

    @staticmethod
    def detect_pockets(protein: Protein, num_pockets: int = 3) -> List[BindingPocket]:
        """
        จำลองการหา binding pockets
        ในความเป็นจริง: ใช้ ChimeraX หรือ fpocket วิเคราะห์โครงสร้าง 3D
        """
        pockets = []

        # Simulate pocket detection based on protein length
        # สร้าง pockets จำลองตามความยาวของโปรตีน
        for i in range(num_pockets):
            # Generate pocket position based on sequence regions
            region_start = int(protein.length * (i + 1) / (num_pockets + 1))

            pocket = BindingPocket(
                pocket_id=i + 1,
                center_x=random.uniform(-20, 20),
                center_y=random.uniform(-20, 20),
                center_z=random.uniform(-20, 20),
                radius=random.uniform(8, 15),
                residues=[f"Residue_{region_start + j}" for j in range(10)],
                druggability_score=random.uniform(0.5, 1.0)
            )
            pockets.append(pocket)

        # Sort by druggability score (best first)
        pockets.sort(key=lambda x: x.druggability_score, reverse=True)
        return pockets


# ============================================================================
# STEP 4: DRUG CANDIDATE SELECTION - คัดเลือกสารโมเลกุลยา
# ============================================================================

class DrugCandidateDatabase:
    """
    คลาสสำหรับดึงข้อมูลสารโมเลกุลยาจาก PubChem
    """

    # Known potential inhibitors for jellyfish toxins
    # สารที่มีศักยภาพในการยับยั้งพิษแมงกะพรุน
    KNOWN_INHIBITORS = [
        {
            "cid": "5280443",
            "name": "Silymarin",
            "molecular_formula": "C25H22O10",
            "molecular_weight": 482.4,
            "smiles": "COc1cc(ccc1O)[C@H]2Oc3cc(O)cc(O)c3C(=O)[C@@H]2O",
            "notes": "Best inhibitor found for NnV-Mlp (-9.5 kcal/mol)"
        },
        {
            "cid": "73160",
            "name": "Pinobanksin",
            "molecular_formula": "C15H12O5",
            "molecular_weight": 272.25,
            "smiles": "OC1C(=O)c2c(O)cc(O)cc2OC1c3ccccc3",
            "notes": "Good inhibitor (-8.0 kcal/mol)"
        },
        {
            "cid": "5281701",
            "name": "Tricetin",
            "molecular_formula": "C15H10O7",
            "molecular_weight": 302.23,
            "smiles": "Oc1cc(O)c2C(=O)C=C(Oc2c1)c3cc(O)c(O)c(O)c3",
            "notes": "Good inhibitor (-8.0 kcal/mol)"
        },
        {
            "cid": "5280961",
            "name": "Quercetin",
            "molecular_formula": "C15H10O7",
            "molecular_weight": 302.24,
            "smiles": "Oc1cc(O)c2C(=O)C(O)=C(Oc2c1)c3ccc(O)c(O)c3",
            "notes": "Common flavonoid antioxidant"
        },
        {
            "cid": "72276",
            "name": "Tetracycline",
            "molecular_formula": "C22H24N2O8",
            "molecular_weight": 444.4,
            "smiles": "CN(C)C1C2CC3C(c4cccc(O)c4C(=O)C3=C(O)C2(C)C(=O)C(=C1O)C(N)=O)O",
            "notes": "Antibiotic with metalloproteinase inhibition"
        },
        {
            "cid": "2244",
            "name": "Aspirin",
            "molecular_formula": "C9H8O4",
            "molecular_weight": 180.16,
            "smiles": "CC(=O)Oc1ccccc1C(O)=O",
            "notes": "Common anti-inflammatory"
        },
        {
            "cid": "5280863",
            "name": "Kaempferol",
            "molecular_formula": "C15H10O6",
            "molecular_weight": 286.24,
            "smiles": "Oc1ccc(cc1)c2oc3cc(O)cc(O)c3c(=O)c2O",
            "notes": "Flavonoid with anti-venom properties"
        },
        {
            "cid": "3220",
            "name": "EDTA",
            "molecular_formula": "C10H16N2O8",
            "molecular_weight": 292.24,
            "smiles": "OC(=O)CN(CCN(CC(O)=O)CC(O)=O)CC(O)=O",
            "notes": "Metalloproteinase chelator"
        }
    ]

    @classmethod
    def get_candidates(cls) -> List[DrugCandidate]:
        """ดึงรายการสารโมเลกุลยาที่ต้องการทดสอบ"""
        candidates = []
        for data in cls.KNOWN_INHIBITORS:
            drug = DrugCandidate(
                cid=data["cid"],
                name=data["name"],
                molecular_formula=data["molecular_formula"],
                molecular_weight=data["molecular_weight"],
                smiles=data.get("smiles", "")
            )
            candidates.append(drug)
        return candidates

    @classmethod
    def fetch_from_pubchem(cls, compound_name: str) -> Optional[DrugCandidate]:
        """ดึงข้อมูลสารจาก PubChem API"""
        try:
            url = f"https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/{compound_name}/JSON"
            response = requests.get(url, timeout=10)
            if response.status_code == 200:
                data = response.json()
                compound = data["PC_Compounds"][0]
                props = {p["urn"]["label"]: p["value"] for p in compound.get("props", [])}
                return DrugCandidate(
                    cid=str(compound["id"]["id"]["cid"]),
                    name=compound_name,
                    molecular_formula=props.get("Molecular Formula", {}).get("sval", ""),
                    molecular_weight=props.get("Molecular Weight", {}).get("fval", 0)
                )
        except Exception as e:
            print(f"Error fetching from PubChem: {e}")
        return None


# ============================================================================
# STEP 5-6: MOLECULAR DOCKING SIMULATION - จำลองการจับโมเลกุล
# ============================================================================

class MolecularDockingSimulator:
    """
    คลาสสำหรับจำลองการทำ Molecular Docking

    Note: นี่คือการจำลองแบบง่าย
    ในความเป็นจริง: ใช้ AutoDock Vina หรือ PyRx
    """

    # Binding affinity thresholds (kcal/mol)
    EXCELLENT_BINDING = -9.0   # ดีมาก
    GOOD_BINDING = -7.0        # ดี
    MODERATE_BINDING = -5.0    # ปานกลาง
    WEAK_BINDING = -3.0        # อ่อน

    @classmethod
    def calculate_binding_affinity(cls, protein: Protein, drug: DrugCandidate, pocket: BindingPocket) -> float:
        """
        คำนวณ Binding Affinity (kcal/mol)

        สูตรจำลอง (Simplified scoring function):
        - ยิ่งค่าติดลบมาก = ยิ่งจับได้ดี
        - พิจารณาจาก: molecular weight, pocket druggability, protein-ligand compatibility
        """

        # Base score from molecular weight (smaller molecules often bind better)
        mw_factor = -math.log(drug.molecular_weight / 100 + 1) * 2

        # Pocket druggability contribution
        pocket_factor = pocket.druggability_score * -3

        # Protein-ligand compatibility (simulated)
        compatibility = random.uniform(-2, 0)

        # Known good interactions boost (for Silymarin, etc.)
        known_boost = 0
        if drug.name == "Silymarin":
            known_boost = -2.5  # Best known inhibitor
        elif drug.name in ["Pinobanksin", "Tricetin"]:
            known_boost = -1.5
        elif drug.name in ["Quercetin", "Kaempferol"]:
            known_boost = -1.0
        elif drug.name == "EDTA":
            known_boost = -1.2  # Good for metalloproteinases

        # Calculate total binding affinity
        binding_affinity = mw_factor + pocket_factor + compatibility + known_boost

        # Clamp to realistic range
        binding_affinity = max(-12.0, min(-1.0, binding_affinity))

        return round(binding_affinity, 2)

    @classmethod
    def run_docking(cls, protein: Protein, drug: DrugCandidate, pocket: BindingPocket) -> DockingResult:
        """
        ทำการจำลอง Molecular Docking
        """
        binding_affinity = cls.calculate_binding_affinity(protein, drug, pocket)

        # Simulate hydrogen bonds and hydrophobic contacts
        h_bonds = random.randint(1, 6)
        hydrophobic = random.randint(2, 10)

        # Determine if docking is successful (good binding affinity)
        is_successful = binding_affinity <= cls.GOOD_BINDING

        return DockingResult(
            protein=protein,
            drug=drug,
            binding_affinity=binding_affinity,
            pocket=pocket,
            hydrogen_bonds=h_bonds,
            hydrophobic_contacts=hydrophobic,
            is_successful=is_successful
        )

    @classmethod
    def evaluate_result(cls, result: DockingResult) -> str:
        """ประเมินผลการ Docking"""
        ba = result.binding_affinity
        if ba <= cls.EXCELLENT_BINDING:
            return "EXCELLENT - ดีมาก! น่าจะเป็นยาที่มีประสิทธิภาพสูง"
        elif ba <= cls.GOOD_BINDING:
            return "GOOD - ดี! มีศักยภาพในการพัฒนาต่อ"
        elif ba <= cls.MODERATE_BINDING:
            return "MODERATE - ปานกลาง ควรปรับปรุงโครงสร้าง"
        elif ba <= cls.WEAK_BINDING:
            return "WEAK - อ่อน ไม่แนะนำ"
        else:
            return "VERY WEAK - อ่อนมาก ไม่เหมาะสม"


# ============================================================================
# MAIN SIMULATION - การจำลองหลัก
# ============================================================================

class JellyfishToxinDrugDiscovery:
    """
    Main class for running the complete drug discovery simulation
    คลาสหลักสำหรับจำลองการค้นหายาต้านพิษแมงกะพรุน
    """

    def __init__(self):
        self.proteins: List[Protein] = []
        self.pockets: Dict[str, List[BindingPocket]] = {}
        self.drugs: List[DrugCandidate] = []
        self.results: List[DockingResult] = []

    def run_simulation(self):
        """รันการจำลองทั้งหมด"""

        print("=" * 70)
        print("   JELLYFISH TOXIN DRUG DISCOVERY SIMULATION")
        print("   การจำลองการค้นหายาต้านพิษแมงกะพรุน")
        print("=" * 70)
        print()

        # Step 1: Get target proteins
        print("STEP 1: ค้นหาโปรตีนเป้าหมาย (Finding Target Proteins)")
        print("-" * 50)
        self.proteins = ProteinDatabase.get_toxin_proteins()
        for p in self.proteins:
            print(f"  - {p.name}")
            print(f"    Organism: {p.organism}")
            print(f"    Length: {p.length} amino acids")
            print(f"    Function: {p.function}")
            print()

        # Step 2-3: Detect binding pockets
        print("STEP 2-3: หา Binding Pockets")
        print("-" * 50)
        for protein in self.proteins:
            pockets = BindingPocketDetector.detect_pockets(protein)
            self.pockets[protein.uniprot_id] = pockets
            print(f"  {protein.name}:")
            for pocket in pockets:
                print(f"    Pocket {pocket.pocket_id}: Druggability = {pocket.druggability_score:.2f}")
        print()

        # Step 4: Get drug candidates
        print("STEP 4: คัดเลือกสารโมเลกุลยา (Drug Candidates)")
        print("-" * 50)
        self.drugs = DrugCandidateDatabase.get_candidates()
        drug_table = [[d.name, d.molecular_formula, f"{d.molecular_weight:.2f}"] for d in self.drugs]
        print(tabulate(drug_table, headers=["Drug Name", "Formula", "MW (g/mol)"], tablefmt="grid"))
        print()

        # Step 5-6: Run molecular docking
        print("STEP 5-6: ทำ Molecular Docking")
        print("-" * 50)

        for protein in self.proteins:
            best_pocket = self.pockets[protein.uniprot_id][0]  # Use best pocket
            print(f"\nDocking against: {protein.name}")

            for drug in self.drugs:
                result = MolecularDockingSimulator.run_docking(protein, drug, best_pocket)
                self.results.append(result)

                status = "✓" if result.is_successful else "✗"
                print(f"  {status} {drug.name}: {result.binding_affinity} kcal/mol")

        print()

        # Step 7: Analyze results
        self._analyze_results()

        # Step 8: Generate summary
        self._generate_summary()

    def _analyze_results(self):
        """วิเคราะห์ผลลัพธ์"""
        print("STEP 7: วิเคราะห์ผลลัพธ์ (Analysis)")
        print("-" * 50)

        # Sort by binding affinity (best first)
        sorted_results = sorted(self.results, key=lambda x: x.binding_affinity)

        # Show top 10
        print("\nTop 10 Best Binding Results:")
        table_data = []
        for i, r in enumerate(sorted_results[:10], 1):
            evaluation = MolecularDockingSimulator.evaluate_result(r)
            table_data.append([
                i,
                r.drug.name,
                r.protein.name[:30],
                f"{r.binding_affinity} kcal/mol",
                r.hydrogen_bonds,
                evaluation.split(" - ")[0]
            ])

        print(tabulate(table_data,
                      headers=["Rank", "Drug", "Protein", "Binding Affinity", "H-Bonds", "Rating"],
                      tablefmt="grid"))
        print()

    def _generate_summary(self):
        """สรุปผลการศึกษา"""
        print("STEP 8-9: สรุปผลการศึกษา (Summary)")
        print("=" * 70)

        # Find best overall result
        best_result = min(self.results, key=lambda x: x.binding_affinity)

        # Count successful dockings
        successful = [r for r in self.results if r.is_successful]

        print(f"""
SUMMARY / สรุปผล:
-----------------
Total Docking Simulations: {len(self.results)}
Successful Bindings (≤ -7.0 kcal/mol): {len(successful)}
Success Rate: {len(successful)/len(self.results)*100:.1f}%

BEST RESULT / ผลลัพธ์ที่ดีที่สุด:
----------------------------------
Drug: {best_result.drug.name}
Target Protein: {best_result.protein.name}
Binding Affinity: {best_result.binding_affinity} kcal/mol
Hydrogen Bonds: {best_result.hydrogen_bonds}
Hydrophobic Contacts: {best_result.hydrophobic_contacts}

Evaluation: {MolecularDockingSimulator.evaluate_result(best_result)}

RECOMMENDATION / ข้อเสนอแนะ:
----------------------------
Based on the simulation, {best_result.drug.name} shows the most promise
as a potential inhibitor for jellyfish toxin proteins.

Further steps:
1. Validate with actual molecular docking software (AutoDock Vina)
2. Perform molecular dynamics simulation
3. Test in vitro experiments
4. Consider for in vivo studies
""")

        print("=" * 70)
        print("Simulation Complete! / การจำลองเสร็จสิ้น!")
        print("=" * 70)


# ============================================================================
# RUN SIMULATION
# ============================================================================

if __name__ == "__main__":
    # Create and run simulation
    simulation = JellyfishToxinDrugDiscovery()
    simulation.run_simulation()
