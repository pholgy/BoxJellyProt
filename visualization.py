# -*- coding: utf-8 -*-
"""
3D Molecular Visualization Module
Uses py3Dmol for interactive 3D visualization
"""

import py3Dmol
from typing import Optional, List, Dict
import requests


def create_molecule_viewer(width: int = 800, height: int = 600) -> py3Dmol.view:
    """Create a new 3D molecule viewer"""
    return py3Dmol.view(width=width, height=height)


def visualize_protein_from_pdb(pdb_id: str, width: int = 800, height: int = 600) -> py3Dmol.view:
    """
    Visualize a protein from PDB database

    Args:
        pdb_id: PDB ID (e.g., '1ABC')
        width: Viewer width in pixels
        height: Viewer height in pixels

    Returns:
        py3Dmol view object
    """
    viewer = py3Dmol.view(query=f'pdb:{pdb_id}', width=width, height=height)
    viewer.setStyle({'cartoon': {'color': 'spectrum'}})
    viewer.setBackgroundColor('white')
    viewer.zoomTo()
    return viewer


def visualize_protein_from_sequence(sequence: str, name: str = "Protein",
                                     width: int = 800, height: int = 600) -> py3Dmol.view:
    """
    Create a simplified visualization for a protein sequence
    (Note: For actual 3D structure, use AlphaFold or Swiss-Model first)

    Args:
        sequence: Amino acid sequence
        name: Protein name for display
        width: Viewer width
        height: Viewer height

    Returns:
        py3Dmol view object with placeholder structure
    """
    # Create a simple helix representation
    viewer = py3Dmol.view(width=width, height=height)

    # Generate simple PDB-like structure (alpha helix approximation)
    pdb_string = generate_simple_helix_pdb(sequence[:50])  # First 50 residues

    viewer.addModel(pdb_string, 'pdb')
    viewer.setStyle({'cartoon': {'color': 'spectrum'}})
    viewer.setBackgroundColor('white')
    viewer.zoomTo()

    return viewer


def generate_simple_helix_pdb(sequence: str) -> str:
    """Generate a simple alpha helix PDB structure from sequence"""
    pdb_lines = []

    # Alpha helix parameters
    rise_per_residue = 1.5  # Angstroms
    radius = 2.3  # Angstroms
    residues_per_turn = 3.6

    import math

    for i, aa in enumerate(sequence):
        angle = (2 * math.pi * i) / residues_per_turn
        x = radius * math.cos(angle)
        y = radius * math.sin(angle)
        z = i * rise_per_residue

        # CA atom (alpha carbon)
        pdb_lines.append(
            f"ATOM  {i+1:5d}  CA  ALA A{i+1:4d}    {x:8.3f}{y:8.3f}{z:8.3f}  1.00  0.00           C"
        )

    pdb_lines.append("END")
    return "\n".join(pdb_lines)


def visualize_molecule_from_smiles(smiles: str, name: str = "Molecule",
                                    width: int = 400, height: int = 400) -> py3Dmol.view:
    """
    Visualize a small molecule from SMILES string

    Args:
        smiles: SMILES string of the molecule
        name: Molecule name
        width: Viewer width
        height: Viewer height

    Returns:
        py3Dmol view object
    """
    viewer = py3Dmol.view(width=width, height=height)

    # Try to get 3D structure from PubChem
    try:
        # Use PubChem to convert SMILES to 3D
        url = f"https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/{smiles}/SDF?record_type=3d"
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            viewer.addModel(response.text, 'sdf')
        else:
            # Fallback: add SMILES directly (2D representation)
            viewer.addModel(smiles, 'smiles')
    except:
        viewer.addModel(smiles, 'smiles')

    viewer.setStyle({'stick': {'colorscheme': 'default'}})
    viewer.setBackgroundColor('white')
    viewer.zoomTo()

    return viewer


def visualize_docking_result(protein_pdb: str, ligand_sdf: str,
                             binding_site: Dict = None,
                             width: int = 800, height: int = 600) -> py3Dmol.view:
    """
    Visualize a docking result showing protein and ligand

    Args:
        protein_pdb: PDB format string of protein
        ligand_sdf: SDF format string of ligand
        binding_site: Dictionary with binding site coordinates
        width: Viewer width
        height: Viewer height

    Returns:
        py3Dmol view object
    """
    viewer = py3Dmol.view(width=width, height=height)

    # Add protein
    viewer.addModel(protein_pdb, 'pdb')
    viewer.setStyle({'model': 0}, {'cartoon': {'color': 'lightblue', 'opacity': 0.8}})

    # Add ligand
    viewer.addModel(ligand_sdf, 'sdf')
    viewer.setStyle({'model': 1}, {'stick': {'colorscheme': 'greenCarbon', 'radius': 0.2}})

    # Highlight binding site if provided
    if binding_site:
        viewer.addSphere({
            'center': {'x': binding_site.get('x', 0),
                      'y': binding_site.get('y', 0),
                      'z': binding_site.get('z', 0)},
            'radius': binding_site.get('radius', 10),
            'color': 'yellow',
            'opacity': 0.3
        })

    viewer.setBackgroundColor('white')
    viewer.zoomTo()

    return viewer


def create_comparison_view(molecules: List[Dict], width: int = 800, height: int = 600):
    """
    Create a grid view comparing multiple molecules

    Args:
        molecules: List of dicts with 'smiles' and 'name' keys
        width: Total width
        height: Total height

    Returns:
        List of py3Dmol view objects
    """
    viewers = []
    n = len(molecules)

    # Calculate grid dimensions
    cols = min(3, n)
    rows = (n + cols - 1) // cols

    cell_width = width // cols
    cell_height = height // rows

    for mol in molecules:
        viewer = visualize_molecule_from_smiles(
            mol['smiles'],
            mol.get('name', 'Unknown'),
            cell_width - 10,
            cell_height - 10
        )
        viewers.append(viewer)

    return viewers


def get_protein_structure_from_alphafold(uniprot_id: str) -> Optional[str]:
    """
    Fetch predicted protein structure from AlphaFold database

    Args:
        uniprot_id: UniProt accession ID

    Returns:
        PDB format string or None if not found
    """
    try:
        url = f"https://alphafold.ebi.ac.uk/files/AF-{uniprot_id}-F1-model_v4.pdb"
        response = requests.get(url, timeout=30)
        if response.status_code == 200:
            return response.text
    except Exception as e:
        print(f"Error fetching AlphaFold structure: {e}")
    return None


def visualize_alphafold_structure(uniprot_id: str, width: int = 800, height: int = 600) -> Optional[py3Dmol.view]:
    """
    Visualize AlphaFold predicted structure

    Args:
        uniprot_id: UniProt accession ID
        width: Viewer width
        height: Viewer height

    Returns:
        py3Dmol view object or None
    """
    pdb_string = get_protein_structure_from_alphafold(uniprot_id)

    if pdb_string:
        viewer = py3Dmol.view(width=width, height=height)
        viewer.addModel(pdb_string, 'pdb')

        # Color by pLDDT confidence (stored in B-factor)
        viewer.setStyle({
            'cartoon': {
                'colorscheme': {
                    'prop': 'b',
                    'gradient': 'roygb',
                    'min': 50,
                    'max': 100
                }
            }
        })

        viewer.setBackgroundColor('white')
        viewer.zoomTo()
        return viewer

    return None


# ============================================================================
# STREAMLIT VISUALIZATION HELPERS
# ============================================================================

def show_molecule_in_streamlit(viewer: py3Dmol.view, key: str = "mol_viewer"):
    """
    Display py3Dmol viewer in Streamlit

    Args:
        viewer: py3Dmol view object
        key: Unique key for Streamlit component
    """
    import streamlit.components.v1 as components

    # Get HTML representation
    viewer_html = viewer._make_html()

    # Display in Streamlit
    components.html(viewer_html, height=viewer.height + 50, scrolling=False)


def create_molecule_html(smiles: str, width: int = 400, height: int = 400) -> str:
    """
    Create HTML string for molecule visualization

    Args:
        smiles: SMILES string
        width: Width in pixels
        height: Height in pixels

    Returns:
        HTML string
    """
    viewer = visualize_molecule_from_smiles(smiles, width=width, height=height)
    return viewer._make_html()


def create_protein_html(sequence: str, width: int = 600, height: int = 400) -> str:
    """
    Create HTML string for protein visualization

    Args:
        sequence: Amino acid sequence
        width: Width in pixels
        height: Height in pixels

    Returns:
        HTML string
    """
    viewer = visualize_protein_from_sequence(sequence, width=width, height=height)
    return viewer._make_html()


# ============================================================================
# EXAMPLE USAGE
# ============================================================================

if __name__ == "__main__":
    print("Visualization Module - Example Usage")
    print("=" * 50)

    # Example: Visualize Silymarin
    silymarin_smiles = "COc1cc(ccc1O)[C@H]2Oc3cc(O)cc(O)c3C(=O)[C@@H]2O"
    print(f"Creating visualization for Silymarin...")
    print(f"SMILES: {silymarin_smiles}")

    viewer = visualize_molecule_from_smiles(silymarin_smiles, "Silymarin")
    print("Viewer created successfully!")
    print("\nTo view in Jupyter notebook, just display the viewer object.")
    print("To view in Streamlit, use show_molecule_in_streamlit(viewer)")
