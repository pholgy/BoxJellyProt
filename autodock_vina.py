# -*- coding: utf-8 -*-
"""
AutoDock Vina Integration Module
Wrapper for real molecular docking using AutoDock Vina

REQUIREMENTS:
1. AutoDock Vina must be installed: https://vina.scripps.edu/
2. For Windows: Download vina.exe and add to PATH
3. For Linux/Mac: Install via conda: conda install -c conda-forge autodock-vina

WORKFLOW:
1. Prepare protein (PDBQT format)
2. Prepare ligand (PDBQT format)
3. Define search box (binding site)
4. Run docking
5. Analyze results
"""

import subprocess
import os
import tempfile
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass
import shutil


@dataclass
class VinaConfig:
    """Configuration for AutoDock Vina docking"""
    center_x: float = 0.0
    center_y: float = 0.0
    center_z: float = 0.0
    size_x: float = 20.0
    size_y: float = 20.0
    size_z: float = 20.0
    exhaustiveness: int = 8
    num_modes: int = 9
    energy_range: float = 3.0


@dataclass
class VinaResult:
    """Result from AutoDock Vina docking"""
    mode: int
    affinity: float  # kcal/mol
    rmsd_lb: float
    rmsd_ub: float
    pose_pdbqt: str = ""


class AutoDockVinaWrapper:
    """
    Wrapper class for AutoDock Vina

    Example usage:
        vina = AutoDockVinaWrapper()

        # Check if Vina is installed
        if vina.is_available():
            results = vina.dock(
                protein_pdbqt="protein.pdbqt",
                ligand_pdbqt="ligand.pdbqt",
                config=VinaConfig(center_x=10, center_y=20, center_z=15)
            )
            print(f"Best binding affinity: {results[0].affinity} kcal/mol")
    """

    def __init__(self, vina_path: str = "vina"):
        """
        Initialize AutoDock Vina wrapper

        Args:
            vina_path: Path to vina executable (default assumes it's in PATH)
        """
        self.vina_path = vina_path
        self.temp_dir = tempfile.mkdtemp(prefix="vina_")

    def is_available(self) -> bool:
        """Check if AutoDock Vina is installed and accessible"""
        try:
            result = subprocess.run(
                [self.vina_path, "--version"],
                capture_output=True,
                text=True,
                timeout=10
            )
            return result.returncode == 0 or "AutoDock Vina" in result.stdout
        except (subprocess.TimeoutExpired, FileNotFoundError):
            return False

    def get_version(self) -> str:
        """Get AutoDock Vina version"""
        try:
            result = subprocess.run(
                [self.vina_path, "--version"],
                capture_output=True,
                text=True,
                timeout=10
            )
            return result.stdout.strip()
        except:
            return "Unknown"

    def dock(self, protein_pdbqt: str, ligand_pdbqt: str,
             config: VinaConfig = None, output_dir: str = None) -> List[VinaResult]:
        """
        Run molecular docking with AutoDock Vina

        Args:
            protein_pdbqt: Path to protein PDBQT file
            ligand_pdbqt: Path to ligand PDBQT file
            config: Docking configuration
            output_dir: Directory for output files

        Returns:
            List of VinaResult objects sorted by binding affinity
        """
        if config is None:
            config = VinaConfig()

        if output_dir is None:
            output_dir = self.temp_dir

        output_pdbqt = os.path.join(output_dir, "docked_poses.pdbqt")
        log_file = os.path.join(output_dir, "vina_log.txt")

        # Build command
        cmd = [
            self.vina_path,
            "--receptor", protein_pdbqt,
            "--ligand", ligand_pdbqt,
            "--center_x", str(config.center_x),
            "--center_y", str(config.center_y),
            "--center_z", str(config.center_z),
            "--size_x", str(config.size_x),
            "--size_y", str(config.size_y),
            "--size_z", str(config.size_z),
            "--exhaustiveness", str(config.exhaustiveness),
            "--num_modes", str(config.num_modes),
            "--energy_range", str(config.energy_range),
            "--out", output_pdbqt
        ]

        # Run Vina
        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=3600  # 1 hour timeout
            )

            # Save log
            with open(log_file, 'w') as f:
                f.write(result.stdout)
                f.write(result.stderr)

            # Parse results
            results = self._parse_output(result.stdout, output_pdbqt)
            return results

        except subprocess.TimeoutExpired:
            raise RuntimeError("Docking timed out after 1 hour")
        except Exception as e:
            raise RuntimeError(f"Docking failed: {e}")

    def _parse_output(self, output: str, poses_file: str) -> List[VinaResult]:
        """Parse Vina output to extract results"""
        results = []

        # Parse the output table
        lines = output.split('\n')
        parsing = False

        for line in lines:
            if '-----+' in line:
                parsing = True
                continue

            if parsing and line.strip():
                parts = line.split()
                if len(parts) >= 4:
                    try:
                        mode = int(parts[0])
                        affinity = float(parts[1])
                        rmsd_lb = float(parts[2])
                        rmsd_ub = float(parts[3])

                        results.append(VinaResult(
                            mode=mode,
                            affinity=affinity,
                            rmsd_lb=rmsd_lb,
                            rmsd_ub=rmsd_ub
                        ))
                    except (ValueError, IndexError):
                        continue

        # Read poses from output file if exists
        if os.path.exists(poses_file):
            with open(poses_file, 'r') as f:
                poses_content = f.read()

            # Split into individual poses
            poses = poses_content.split('MODEL')
            for i, pose in enumerate(poses[1:], 1):
                if i <= len(results):
                    results[i-1].pose_pdbqt = 'MODEL' + pose

        return results

    def cleanup(self):
        """Clean up temporary files"""
        if os.path.exists(self.temp_dir):
            shutil.rmtree(self.temp_dir)


class MoleculePreparation:
    """
    Utilities for preparing molecules for docking

    Note: Full preparation requires additional tools:
    - Open Babel (for format conversion)
    - MGLTools/AutoDockTools (for PDBQT preparation)
    - RDKit (for molecule manipulation)
    """

    @staticmethod
    def pdb_to_pdbqt_simple(pdb_file: str, output_file: str, is_receptor: bool = True) -> bool:
        """
        Simple PDB to PDBQT conversion (basic, may need refinement)

        For proper conversion, use:
        - prepare_receptor4.py from MGLTools (for proteins)
        - prepare_ligand4.py from MGLTools (for ligands)
        - Open Babel: obabel input.pdb -O output.pdbqt

        Args:
            pdb_file: Input PDB file path
            output_file: Output PDBQT file path
            is_receptor: True for protein, False for ligand

        Returns:
            True if successful
        """
        try:
            with open(pdb_file, 'r') as f:
                pdb_content = f.read()

            # Basic conversion (add charge and atom type columns)
            pdbqt_lines = []
            for line in pdb_content.split('\n'):
                if line.startswith('ATOM') or line.startswith('HETATM'):
                    # Add placeholder charge and atom type
                    atom_name = line[12:16].strip()
                    atom_type = atom_name[0] if atom_name else 'C'

                    # Pad line to 78 characters and add charge/type
                    padded_line = line.ljust(78)
                    pdbqt_line = f"{padded_line[:66]}  0.00 {atom_type:>2}"
                    pdbqt_lines.append(pdbqt_line)
                elif line.startswith('END'):
                    pdbqt_lines.append(line)

            with open(output_file, 'w') as f:
                f.write('\n'.join(pdbqt_lines))

            return True

        except Exception as e:
            print(f"Conversion error: {e}")
            return False

    @staticmethod
    def smiles_to_pdbqt(smiles: str, output_file: str) -> bool:
        """
        Convert SMILES to PDBQT format

        Requires Open Babel or RDKit

        Args:
            smiles: SMILES string
            output_file: Output PDBQT file path

        Returns:
            True if successful
        """
        try:
            # Try using Open Babel
            result = subprocess.run(
                ['obabel', '-:' + smiles, '-O', output_file, '--gen3d'],
                capture_output=True,
                text=True,
                timeout=60
            )
            return result.returncode == 0
        except FileNotFoundError:
            print("Open Babel not found. Please install: conda install -c conda-forge openbabel")
            return False
        except Exception as e:
            print(f"Conversion error: {e}")
            return False

    @staticmethod
    def get_binding_site_center(pdb_file: str, residue_ids: List[int] = None) -> Tuple[float, float, float]:
        """
        Calculate center of binding site from PDB file

        Args:
            pdb_file: Path to PDB file
            residue_ids: List of residue IDs defining binding site (optional)

        Returns:
            Tuple of (x, y, z) coordinates for center
        """
        x_coords, y_coords, z_coords = [], [], []

        with open(pdb_file, 'r') as f:
            for line in f:
                if line.startswith('ATOM'):
                    # Parse coordinates
                    if residue_ids:
                        res_id = int(line[22:26].strip())
                        if res_id not in residue_ids:
                            continue

                    x = float(line[30:38])
                    y = float(line[38:46])
                    z = float(line[46:54])

                    x_coords.append(x)
                    y_coords.append(y)
                    z_coords.append(z)

        if not x_coords:
            return (0.0, 0.0, 0.0)

        center_x = sum(x_coords) / len(x_coords)
        center_y = sum(y_coords) / len(y_coords)
        center_z = sum(z_coords) / len(z_coords)

        return (center_x, center_y, center_z)


def run_batch_docking(proteins: List[str], ligands: List[str],
                      config: VinaConfig = None, output_dir: str = ".") -> List[Dict]:
    """
    Run batch docking for multiple protein-ligand pairs

    Args:
        proteins: List of protein PDBQT file paths
        ligands: List of ligand PDBQT file paths
        config: Docking configuration
        output_dir: Output directory

    Returns:
        List of result dictionaries
    """
    vina = AutoDockVinaWrapper()

    if not vina.is_available():
        print("AutoDock Vina is not available!")
        print("Please install it from: https://vina.scripps.edu/")
        return []

    results = []

    for protein in proteins:
        for ligand in ligands:
            print(f"Docking: {os.path.basename(protein)} + {os.path.basename(ligand)}")

            try:
                docking_results = vina.dock(protein, ligand, config, output_dir)

                if docking_results:
                    best = docking_results[0]
                    results.append({
                        'protein': os.path.basename(protein),
                        'ligand': os.path.basename(ligand),
                        'binding_affinity': best.affinity,
                        'rmsd': best.rmsd_lb,
                        'num_poses': len(docking_results)
                    })
            except Exception as e:
                print(f"  Error: {e}")

    vina.cleanup()
    return results


# ============================================================================
# INSTALLATION INSTRUCTIONS
# ============================================================================

INSTALLATION_GUIDE = """
=============================================================================
AutoDock Vina Installation Guide
=============================================================================

OPTION 1: Download Binary (Easiest)
-----------------------------------
1. Go to: https://vina.scripps.edu/downloads/
2. Download the appropriate version for your OS
3. Extract and add to PATH

For Windows:
  - Download vina_1.2.x_win.exe
  - Rename to vina.exe
  - Add to PATH or place in project folder

For Linux:
  - Download vina_1.2.x_linux_x86_64
  - chmod +x vina_1.2.x_linux_x86_64
  - sudo mv vina_1.2.x_linux_x86_64 /usr/local/bin/vina

For Mac:
  - Download vina_1.2.x_mac_x86_64
  - chmod +x vina_1.2.x_mac_x86_64
  - sudo mv vina_1.2.x_mac_x86_64 /usr/local/bin/vina


OPTION 2: Conda Installation
----------------------------
conda install -c conda-forge autodock-vina


OPTION 3: Python Package (for scripting)
----------------------------------------
pip install vina


ADDITIONAL TOOLS RECOMMENDED:
-----------------------------
1. Open Babel (for molecule conversion):
   conda install -c conda-forge openbabel

2. MGLTools (for PDBQT preparation):
   Download from: https://ccsb.scripps.edu/mgltools/downloads/

3. PyMOL (for visualization):
   conda install -c conda-forge pymol-open-source

=============================================================================
"""


if __name__ == "__main__":
    print(INSTALLATION_GUIDE)

    # Check if Vina is available
    vina = AutoDockVinaWrapper()
    if vina.is_available():
        print(f"\nAutoDock Vina is installed!")
        print(f"Version: {vina.get_version()}")
    else:
        print("\nAutoDock Vina is NOT installed.")
        print("Please follow the installation guide above.")
