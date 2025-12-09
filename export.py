# -*- coding: utf-8 -*-
"""
Data Export Module
Export simulation results to CSV, Excel, and other formats
"""

import pandas as pd
from typing import List, Dict, Any, Optional
from dataclasses import asdict
from datetime import datetime
import json
import os


def export_to_csv(results: List[Dict], filename: str, output_dir: str = ".") -> str:
    """
    Export results to CSV file

    Args:
        results: List of result dictionaries
        filename: Output filename (without extension)
        output_dir: Output directory

    Returns:
        Path to created file
    """
    df = pd.DataFrame(results)
    filepath = os.path.join(output_dir, f"{filename}.csv")
    df.to_csv(filepath, index=False, encoding='utf-8-sig')
    print(f"Exported to: {filepath}")
    return filepath


def export_to_excel(results: List[Dict], filename: str, output_dir: str = ".",
                    sheet_name: str = "Results") -> str:
    """
    Export results to Excel file

    Args:
        results: List of result dictionaries
        filename: Output filename (without extension)
        output_dir: Output directory
        sheet_name: Name of the Excel sheet

    Returns:
        Path to created file
    """
    df = pd.DataFrame(results)
    filepath = os.path.join(output_dir, f"{filename}.xlsx")
    df.to_excel(filepath, index=False, sheet_name=sheet_name, engine='openpyxl')
    print(f"Exported to: {filepath}")
    return filepath


def export_full_report(docking_results: List[Any], proteins: List[Any],
                       drugs: List[Any], output_dir: str = ".") -> str:
    """
    Export comprehensive report to Excel with multiple sheets

    Args:
        docking_results: List of DockingResult objects
        proteins: List of Protein objects
        drugs: List of DrugCandidate objects
        output_dir: Output directory

    Returns:
        Path to created file
    """
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"docking_report_{timestamp}.xlsx"
    filepath = os.path.join(output_dir, filename)

    with pd.ExcelWriter(filepath, engine='xlsxwriter') as writer:
        # Sheet 1: Summary
        summary_data = {
            'Metric': [
                'Total Docking Simulations',
                'Successful Bindings (≤ -7.0 kcal/mol)',
                'Success Rate (%)',
                'Best Binding Affinity (kcal/mol)',
                'Best Drug Candidate',
                'Best Target Protein',
                'Report Generated'
            ],
            'Value': [
                len(docking_results),
                len([r for r in docking_results if r.binding_affinity <= -7.0]),
                f"{len([r for r in docking_results if r.binding_affinity <= -7.0]) / len(docking_results) * 100:.1f}%",
                min(r.binding_affinity for r in docking_results),
                min(docking_results, key=lambda x: x.binding_affinity).drug.name,
                min(docking_results, key=lambda x: x.binding_affinity).protein.name,
                datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            ]
        }
        pd.DataFrame(summary_data).to_excel(writer, sheet_name='Summary', index=False)

        # Sheet 2: All Docking Results
        results_data = []
        for r in sorted(docking_results, key=lambda x: x.binding_affinity):
            results_data.append({
                'Rank': len(results_data) + 1,
                'Drug Name': r.drug.name,
                'Drug CID': r.drug.cid,
                'Drug MW': r.drug.molecular_weight,
                'Protein Name': r.protein.name,
                'Protein ID': r.protein.uniprot_id,
                'Organism': r.protein.organism,
                'Binding Affinity (kcal/mol)': r.binding_affinity,
                'H-Bonds': r.hydrogen_bonds,
                'Hydrophobic Contacts': r.hydrophobic_contacts,
                'Success': 'Yes' if r.is_successful else 'No',
                'Rating': get_rating(r.binding_affinity)
            })
        pd.DataFrame(results_data).to_excel(writer, sheet_name='Docking Results', index=False)

        # Sheet 3: Protein Database
        protein_data = []
        for p in proteins:
            protein_data.append({
                'UniProt ID': p.uniprot_id,
                'Name': p.name,
                'Organism': p.organism,
                'Function': p.function,
                'Toxin Type': getattr(p, 'toxin_type', ''),
                'Length (aa)': p.length,
                'MW (Da)': getattr(p, 'molecular_weight', 0),
                'PDB ID': getattr(p, 'pdb_id', '')
            })
        pd.DataFrame(protein_data).to_excel(writer, sheet_name='Proteins', index=False)

        # Sheet 4: Drug Database
        drug_data = []
        for d in drugs:
            drug_data.append({
                'PubChem CID': d.cid,
                'Name': d.name,
                'Formula': d.molecular_formula,
                'MW (g/mol)': d.molecular_weight,
                'Category': getattr(d, 'category', ''),
                'Mechanism': getattr(d, 'mechanism', ''),
                'Source': getattr(d, 'source', ''),
                'SMILES': d.smiles
            })
        pd.DataFrame(drug_data).to_excel(writer, sheet_name='Drug Candidates', index=False)

        # Sheet 5: Top 10 Results
        top10_data = results_data[:10]
        pd.DataFrame(top10_data).to_excel(writer, sheet_name='Top 10', index=False)

        # Sheet 6: Results by Protein
        by_protein = {}
        for r in docking_results:
            pname = r.protein.name
            if pname not in by_protein:
                by_protein[pname] = []
            by_protein[pname].append({
                'Drug': r.drug.name,
                'Binding Affinity': r.binding_affinity,
                'Rating': get_rating(r.binding_affinity)
            })

        protein_summary = []
        for pname, results in by_protein.items():
            best = min(results, key=lambda x: x['Binding Affinity'])
            avg = sum(r['Binding Affinity'] for r in results) / len(results)
            protein_summary.append({
                'Protein': pname,
                'Best Drug': best['Drug'],
                'Best Affinity': best['Binding Affinity'],
                'Avg Affinity': round(avg, 2),
                'Drugs Tested': len(results)
            })
        pd.DataFrame(protein_summary).to_excel(writer, sheet_name='By Protein', index=False)

        # Sheet 7: Results by Drug
        by_drug = {}
        for r in docking_results:
            dname = r.drug.name
            if dname not in by_drug:
                by_drug[dname] = []
            by_drug[dname].append({
                'Protein': r.protein.name,
                'Binding Affinity': r.binding_affinity,
                'Rating': get_rating(r.binding_affinity)
            })

        drug_summary = []
        for dname, results in by_drug.items():
            best = min(results, key=lambda x: x['Binding Affinity'])
            avg = sum(r['Binding Affinity'] for r in results) / len(results)
            drug_summary.append({
                'Drug': dname,
                'Best Protein': best['Protein'],
                'Best Affinity': best['Binding Affinity'],
                'Avg Affinity': round(avg, 2),
                'Proteins Tested': len(results)
            })
        pd.DataFrame(drug_summary).to_excel(writer, sheet_name='By Drug', index=False)

        # Format worksheets
        workbook = writer.book
        header_format = workbook.add_format({
            'bold': True,
            'bg_color': '#4472C4',
            'font_color': 'white',
            'border': 1
        })

        for sheet_name in writer.sheets:
            worksheet = writer.sheets[sheet_name]
            worksheet.set_column('A:Z', 18)

    print(f"Full report exported to: {filepath}")
    return filepath


def get_rating(binding_affinity: float) -> str:
    """Get rating string based on binding affinity"""
    if binding_affinity <= -9.0:
        return "EXCELLENT"
    elif binding_affinity <= -7.0:
        return "GOOD"
    elif binding_affinity <= -5.0:
        return "MODERATE"
    elif binding_affinity <= -3.0:
        return "WEAK"
    else:
        return "VERY WEAK"


def export_to_json(results: List[Dict], filename: str, output_dir: str = ".") -> str:
    """
    Export results to JSON file

    Args:
        results: List of result dictionaries
        filename: Output filename (without extension)
        output_dir: Output directory

    Returns:
        Path to created file
    """
    filepath = os.path.join(output_dir, f"{filename}.json")
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False, default=str)
    print(f"Exported to: {filepath}")
    return filepath


def export_for_publication(docking_results: List[Any], output_dir: str = ".") -> str:
    """
    Export results in publication-ready format

    Args:
        docking_results: List of DockingResult objects
        output_dir: Output directory

    Returns:
        Path to created file
    """
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"publication_table_{timestamp}.csv"
    filepath = os.path.join(output_dir, filename)

    # Sort by binding affinity
    sorted_results = sorted(docking_results, key=lambda x: x.binding_affinity)

    # Create publication-ready table
    data = []
    for i, r in enumerate(sorted_results, 1):
        data.append({
            'Rank': i,
            'Compound': r.drug.name,
            'Target Protein': r.protein.name.split('(')[0].strip(),
            'Species': r.protein.organism,
            'Binding Energy (kcal/mol)': r.binding_affinity,
            'No. of H-bonds': r.hydrogen_bonds,
            'Hydrophobic Interactions': r.hydrophobic_contacts
        })

    df = pd.DataFrame(data)
    df.to_csv(filepath, index=False)
    print(f"Publication table exported to: {filepath}")
    return filepath


def generate_summary_statistics(docking_results: List[Any]) -> Dict:
    """
    Generate summary statistics for docking results

    Args:
        docking_results: List of DockingResult objects

    Returns:
        Dictionary with statistics
    """
    affinities = [r.binding_affinity for r in docking_results]

    return {
        'total_simulations': len(docking_results),
        'successful_bindings': len([a for a in affinities if a <= -7.0]),
        'success_rate': len([a for a in affinities if a <= -7.0]) / len(affinities) * 100,
        'mean_affinity': sum(affinities) / len(affinities),
        'best_affinity': min(affinities),
        'worst_affinity': max(affinities),
        'std_affinity': (sum((a - sum(affinities)/len(affinities))**2 for a in affinities) / len(affinities)) ** 0.5,
        'excellent_count': len([a for a in affinities if a <= -9.0]),
        'good_count': len([a for a in affinities if -9.0 < a <= -7.0]),
        'moderate_count': len([a for a in affinities if -7.0 < a <= -5.0]),
        'weak_count': len([a for a in affinities if a > -5.0])
    }


if __name__ == "__main__":
    print("Export Module - Ready")
    print("Available functions:")
    print("  - export_to_csv(results, filename)")
    print("  - export_to_excel(results, filename)")
    print("  - export_full_report(docking_results, proteins, drugs)")
    print("  - export_to_json(results, filename)")
    print("  - export_for_publication(docking_results)")
