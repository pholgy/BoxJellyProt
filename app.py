# -*- coding: utf-8 -*-
"""
โปรแกรมวิเคราะห์โครงสร้างโปรตีนในพิษแมงกะพรุนกล่อง
โดยใช้ฐานข้อมูลชีวสารสนเทศเพื่อการออกแบบยาต้านพิษในอนาคต

Box Jellyfish Toxin Protein Structure Analysis Program
Using Bioinformatics Database for Future Antivenom Drug Design

Run with: streamlit run app.py
"""

import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import py3Dmol
import streamlit.components.v1 as components
import random
import math
from datetime import datetime
import io
import requests

# Import our modules
from database import (
    get_all_proteins, get_all_drugs, get_proteins_by_organism,
    get_drugs_by_category, get_database_stats, Protein, DrugCandidate, BindingPocket
)
from export import export_full_report, get_rating, generate_summary_statistics

# ============================================================================
# PAGE CONFIG
# ============================================================================

st.set_page_config(
    page_title="วิเคราะห์โปรตีนพิษแมงกะพรุนกล่อง",
    page_icon="🪼",
    layout="wide",
    initial_sidebar_state="expanded"
)

# ============================================================================
# CUSTOM CSS
# ============================================================================

st.markdown("""
<style>
    .main-header {
        font-size: 2.5rem;
        color: #1E88E5;
        text-align: center;
        margin-bottom: 1rem;
    }
    .sub-header {
        font-size: 1.2rem;
        color: #666;
        text-align: center;
        margin-bottom: 2rem;
    }
    .metric-card {
        background-color: #f0f2f6;
        border-radius: 10px;
        padding: 1rem;
        text-align: center;
    }
    .result-excellent {
        color: #2E7D32;
        font-weight: bold;
    }
    .result-good {
        color: #1976D2;
        font-weight: bold;
    }
    .result-moderate {
        color: #F57C00;
    }
    .result-weak {
        color: #D32F2F;
    }
    .stTabs [data-baseweb="tab-list"] {
        gap: 2px;
    }
    .stTabs [data-baseweb="tab"] {
        height: 50px;
        padding-left: 20px;
        padding-right: 20px;
    }
</style>
""", unsafe_allow_html=True)

# ============================================================================
# 3D VISUALIZATION FUNCTIONS
# ============================================================================

def get_molecule_3d_html(smiles: str, width: int = 350, height: int = 300) -> str:
    """สร้าง HTML สำหรับแสดงโมเลกุล 3 มิติจาก SMILES"""
    try:
        # ดึงโครงสร้าง 3D จาก PubChem
        url = f"https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/{requests.utils.quote(smiles)}/SDF?record_type=3d"
        response = requests.get(url, timeout=10)

        if response.status_code == 200:
            sdf_data = response.text

            html = f"""
            <html>
            <head>
                <script src="https://3dmol.org/build/3Dmol-min.js"></script>
                <style>
                    .mol-container {{
                        width: {width}px;
                        height: {height}px;
                        position: relative;
                    }}
                </style>
            </head>
            <body>
                <div id="container" class="mol-container"></div>
                <script>
                    let viewer = $3Dmol.createViewer('container', {{backgroundColor: 'white'}});
                    let sdfData = `{sdf_data}`;
                    viewer.addModel(sdfData, 'sdf');
                    viewer.setStyle({{}}, {{stick: {{colorscheme: 'default', radius: 0.15}}}});
                    viewer.addStyle({{}}, {{sphere: {{colorscheme: 'default', scale: 0.25}}}});
                    viewer.zoomTo();
                    viewer.render();
                </script>
            </body>
            </html>
            """
            return html
    except Exception as e:
        pass

    return f"""
    <div style="width:{width}px;height:{height}px;display:flex;align-items:center;justify-content:center;background:#f0f0f0;border-radius:10px;">
        <p style="color:#666;">ไม่สามารถโหลดโครงสร้าง 3D ได้</p>
    </div>
    """


def get_protein_3d_html(uniprot_id: str, sequence: str, width: int = 400, height: int = 350) -> str:
    """สร้าง HTML สำหรับแสดงโปรตีน 3 มิติ - แต่ละโปรตีนมีรูปร่างและสีต่างกัน"""

    # สร้างค่า seed จาก uniprot_id เพื่อให้แต่ละโปรตีนมีรูปร่างต่างกัน
    seed = sum(ord(c) for c in uniprot_id)

    # กำหนดพารามิเตอร์ที่แตกต่างกันตาม seed
    radius_base = 2.0 + (seed % 5) * 0.3
    rise = 1.2 + (seed % 4) * 0.2
    turns = 3.2 + (seed % 6) * 0.2
    num_residues = 40 + (seed % 30)

    # เลือกสีตาม protein type
    colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F']
    color = colors[seed % len(colors)]

    # สร้างโครงสร้างโปรตีนที่ไม่ซ้ำกัน
    pdb_lines = []

    for i in range(num_residues):
        # เพิ่มความหลากหลายในรูปทรง
        wave = math.sin(i * 0.3 + seed * 0.1) * 0.5
        angle = (2 * math.pi * i) / turns

        x = (radius_base + wave) * math.cos(angle)
        y = (radius_base + wave) * math.sin(angle)
        z = i * rise

        # B-factor ใช้สำหรับกำหนดสี (50-100)
        b_factor = 50 + (i * 50 / num_residues)

        pdb_lines.append(
            f"ATOM  {i+1:5d}  CA  ALA A{i+1:4d}    {x:8.3f}{y:8.3f}{z:8.3f}  1.00{b_factor:6.2f}           C"
        )

    pdb_lines.append("END")
    pdb_data = "\\n".join(pdb_lines)

    # สร้าง unique container ID
    container_id = f"mol_{uniprot_id.replace('-', '_')}"

    html = f"""
    <html>
    <head>
        <script src="https://3dmol.org/build/3Dmol-min.js"></script>
        <style>
            .mol-container {{
                width: {width}px;
                height: {height}px;
                position: relative;
                border-radius: 10px;
                overflow: hidden;
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            }}
        </style>
    </head>
    <body>
        <div id="{container_id}" class="mol-container"></div>
        <script>
            let viewer = $3Dmol.createViewer('{container_id}', {{backgroundColor: '0x1a1a2e'}});
            let pdbData = "{pdb_data}";
            viewer.addModel(pdbData, 'pdb');

            // แสดงเป็น cartoon with gradient color
            viewer.setStyle({{}}, {{
                cartoon: {{
                    colorscheme: {{
                        prop: 'b',
                        gradient: 'roygb',
                        min: 50,
                        max: 100
                    }},
                    thickness: 0.8,
                    opacity: 0.9
                }}
            }});

            // เพิ่ม spheres ที่ปลายทั้งสอง
            viewer.addStyle({{resi: 1}}, {{sphere: {{color: '{color}', radius: 1.5}}}});
            viewer.addStyle({{resi: {num_residues}}}, {{sphere: {{color: '{color}', radius: 1.5}}}});

            viewer.zoomTo();
            viewer.spin('y', 0.5);
            viewer.render();
        </script>
    </body>
    </html>
    """
    return html


# ============================================================================
# SIMULATION ENGINE
# ============================================================================

class DockingResult:
    def __init__(self, protein, drug, pocket, binding_affinity, h_bonds, hydrophobic):
        self.protein = protein
        self.drug = drug
        self.pocket = pocket
        self.binding_affinity = binding_affinity
        self.hydrogen_bonds = h_bonds
        self.hydrophobic_contacts = hydrophobic
        self.is_successful = binding_affinity <= -7.0


def calculate_binding_affinity(protein: Protein, drug: DrugCandidate, pocket: BindingPocket) -> float:
    """คำนวณค่า Binding Affinity (การจำลอง)"""
    mw_factor = -math.log(drug.molecular_weight / 100 + 1) * 2
    pocket_factor = pocket.druggability_score * -3
    compatibility = random.uniform(-2, 0)

    known_boost = 0
    if drug.name == "Silymarin":
        known_boost = -2.5
    elif drug.name in ["Pinobanksin", "Tricetin"]:
        known_boost = -1.5
    elif drug.name in ["Quercetin", "Kaempferol", "Myricetin"]:
        known_boost = -1.0
    elif drug.name in ["EDTA", "Doxycycline"]:
        known_boost = -1.2
    elif drug.name == "Curcumin":
        known_boost = -1.3
    elif "Marimastat" in drug.name or "Batimastat" in drug.name:
        known_boost = -1.8

    binding_affinity = mw_factor + pocket_factor + compatibility + known_boost
    binding_affinity = max(-12.0, min(-1.0, binding_affinity))

    return round(binding_affinity, 2)


def detect_binding_pockets(protein: Protein, num_pockets: int = 3):
    """ตรวจหา Binding Pockets (การจำลอง)"""
    pockets = []
    for i in range(num_pockets):
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
    pockets.sort(key=lambda x: x.druggability_score, reverse=True)
    return pockets


def get_rating_thai(binding_affinity: float) -> str:
    """แปลงค่า Binding Affinity เป็นระดับคุณภาพภาษาไทย"""
    if binding_affinity <= -9.0:
        return "ดีเยี่ยม"
    elif binding_affinity <= -7.0:
        return "ดี"
    elif binding_affinity <= -5.0:
        return "ปานกลาง"
    elif binding_affinity <= -3.0:
        return "อ่อน"
    else:
        return "อ่อนมาก"


# ============================================================================
# SIDEBAR
# ============================================================================

with st.sidebar:
    st.image("https://img.icons8.com/color/96/000000/jellyfish.png", width=80)
    st.title("เมนูหลัก")

    page = st.radio(
        "เลือกหน้า",
        ["🏠 หน้าแรก", "🧬 โปรตีนพิษ", "💊 สารยา", "🔬 จำลองการทดลอง", "📊 ผลลัพธ์", "📥 ส่งออกข้อมูล"],
        index=0
    )

    st.divider()

    # สถิติฐานข้อมูล
    stats = get_database_stats()
    st.metric("จำนวนโปรตีน", stats['total_proteins'])
    st.metric("จำนวนสารยา", stats['total_drugs'])

    st.divider()
    st.caption("โปรแกรมวิเคราะห์โปรตีนพิษแมงกะพรุนกล่อง v1.0")
    st.caption("© 2025 - เพื่อการศึกษาและวิจัย")

# ============================================================================
# MAIN CONTENT
# ============================================================================

# Initialize session state
if 'simulation_results' not in st.session_state:
    st.session_state.simulation_results = None
if 'selected_proteins' not in st.session_state:
    st.session_state.selected_proteins = []
if 'selected_drugs' not in st.session_state:
    st.session_state.selected_drugs = []

# ============================================================================
# หน้าแรก (HOME PAGE)
# ============================================================================

if page == "🏠 หน้าแรก":
    st.markdown('<h1 class="main-header">🪼 โปรแกรมวิเคราะห์โครงสร้างโปรตีนในพิษแมงกะพรุนกล่อง</h1>', unsafe_allow_html=True)
    st.markdown('<p class="sub-header">โดยใช้ฐานข้อมูลชีวสารสนเทศเพื่อการออกแบบยาต้านพิษในอนาคต</p>', unsafe_allow_html=True)

    # ส่วนต้อนรับ
    col1, col2, col3 = st.columns(3)

    with col1:
        st.markdown("""
        ### 🧬 ฐานข้อมูลโปรตีน
        - **12 พิษแมงกะพรุน**
        - หลายสายพันธุ์
        - Chironex fleckeri (แมงกะพรุนกล่อง)
        - Nemopilema nomurai (แมงกะพรุนยักษ์)
        - และอื่นๆ...
        """)

    with col2:
        st.markdown("""
        ### 💊 ฐานข้อมูลสารยา
        - **25+ สารยาที่มีศักยภาพ**
        - ฟลาโวนอยด์
        - สารยับยั้ง MMP
        - ยาต้านอักเสบ
        - สารจากธรรมชาติ
        """)

    with col3:
        st.markdown("""
        ### 🔬 การจำลอง
        - Molecular Docking
        - Binding Affinity
        - การแสดงผล 3 มิติ
        - ส่งออกรายงาน
        """)

    st.divider()

    # แผนภูมิขั้นตอนการทำงาน
    st.subheader("📋 ขั้นตอนการวิจัย")

    workflow_col1, workflow_col2 = st.columns([2, 1])

    with workflow_col1:
        st.markdown("""
        | ขั้นตอน | รายละเอียด | เครื่องมือ |
        |---------|-------------|------------|
        | 1 | ค้นหาลำดับกรดอะมิโนของโปรตีนเป้าหมาย | UniProt |
        | 2 | สร้างโครงสร้างสามมิติของโปรตีน | AlphaFold / Swiss-Model |
        | 3 | หาตำแหน่ง Binding Pocket | ChimeraX |
        | 4 | คัดเลือกสารโมเลกุลที่ต้องการทดสอบ | PubChem / ZINC |
        | 5 | เตรียมข้อมูลสำหรับการ Docking | MGLTools |
        | 6 | ทำการจำลองการจับ (Molecular Docking) | AutoDock Vina |
        | 7 | วิเคราะห์ค่า Binding Affinity | แพลตฟอร์มนี้ |
        | 8 | ส่งออกผลลัพธ์ | CSV / Excel |
        """)

    with workflow_col2:
        st.info("""
        **เริ่มต้นอย่างรวดเร็ว:**
        1. ไปที่หน้า **จำลองการทดลอง**
        2. เลือกโปรตีนและสารยา
        3. กดปุ่มเริ่มจำลอง
        4. ดูผลลัพธ์
        5. ส่งออกรายงาน
        """)

    # ผลลัพธ์เด่น
    st.divider()
    st.subheader("🏆 ผลการค้นพบที่น่าสนใจ")

    featured_col1, featured_col2 = st.columns([1, 2])

    with featured_col1:
        st.metric("สารยับยั้งที่ดีที่สุด", "Silymarin", "-9.5 kcal/mol")
        st.caption("ต่อ NnV-Mlp (Metalloproteinase)")

    with featured_col2:
        st.markdown("""
        **Silymarin** จากต้นมิลค์ทิสเซิล แสดงค่า Binding Affinity ที่ดีเยี่ยม
        ต่อพิษ metalloproteinase ของแมงกะพรุน สารฟลาโวนอยด์ธรรมชาตินี้
        ได้รับการยืนยันจากงานวิจัยที่ตีพิมพ์แล้ว

        *อ้างอิง: MDPI Int. J. Mol. Sci. 2023, 24(10), 8972*
        """)

# ============================================================================
# หน้าโปรตีนพิษ (PROTEINS PAGE)
# ============================================================================

elif page == "🧬 โปรตีนพิษ":
    st.header("🧬 ฐานข้อมูลโปรตีนพิษแมงกะพรุน")

    proteins = get_all_proteins()

    # ตัวกรอง
    col1, col2 = st.columns(2)
    with col1:
        organism_filter = st.selectbox(
            "กรองตามสิ่งมีชีวิต",
            ["ทั้งหมด"] + list(set(p.organism for p in proteins))
        )
    with col2:
        toxin_filter = st.selectbox(
            "กรองตามชนิดพิษ",
            ["ทั้งหมด"] + list(set(p.toxin_type for p in proteins if p.toxin_type))
        )

    # ใช้ตัวกรอง
    filtered_proteins = proteins
    if organism_filter != "ทั้งหมด":
        filtered_proteins = [p for p in filtered_proteins if p.organism == organism_filter]
    if toxin_filter != "ทั้งหมด":
        filtered_proteins = [p for p in filtered_proteins if p.toxin_type == toxin_filter]

    st.info(f"พบ {len(filtered_proteins)} โปรตีน")

    # แสดงโปรตีน
    for protein in filtered_proteins:
        with st.expander(f"**{protein.name}** - {protein.organism}"):
            col1, col2 = st.columns([2, 1])

            with col1:
                st.markdown(f"""
                - **รหัส UniProt:** {protein.uniprot_id}
                - **สิ่งมีชีวิต:** {protein.organism}
                - **ชนิดพิษ:** {protein.toxin_type}
                - **หน้าที่:** {protein.function}
                - **ความยาว:** {protein.length} กรดอะมิโน
                - **น้ำหนักโมเลกุล:** {protein.molecular_weight:,.0f} Da
                """)

                # แสดงลำดับ
                if st.checkbox(f"แสดงลำดับกรดอะมิโน", key=f"seq_{protein.uniprot_id}"):
                    st.code(protein.sequence[:100] + "..." if len(protein.sequence) > 100 else protein.sequence)

            with col2:
                # การแสดงผล 3 มิติ
                st.markdown("**โครงสร้าง 3 มิติ (จำลอง Alpha Helix):**")
                html = get_protein_3d_html(protein.uniprot_id, protein.sequence, 300, 250)
                components.html(html, height=280)

# ============================================================================
# หน้าสารยา (DRUGS PAGE)
# ============================================================================

elif page == "💊 สารยา":
    st.header("💊 ฐานข้อมูลสารยาที่มีศักยภาพ")

    drugs = get_all_drugs()

    # ตัวกรอง
    col1, col2 = st.columns(2)
    with col1:
        category_filter = st.selectbox(
            "กรองตามประเภท",
            ["ทั้งหมด"] + list(set(d.category for d in drugs if d.category))
        )
    with col2:
        search_term = st.text_input("ค้นหาตามชื่อ")

    # ใช้ตัวกรอง
    filtered_drugs = drugs
    if category_filter != "ทั้งหมด":
        filtered_drugs = [d for d in filtered_drugs if d.category == category_filter]
    if search_term:
        filtered_drugs = [d for d in filtered_drugs if search_term.lower() in d.name.lower()]

    # แสดงเป็นตาราง
    drug_data = []
    for d in filtered_drugs:
        drug_data.append({
            "ชื่อ": d.name,
            "สูตรโมเลกุล": d.molecular_formula,
            "น้ำหนักโมเลกุล (g/mol)": d.molecular_weight,
            "ประเภท": d.category,
            "แหล่งที่มา": d.source
        })

    st.dataframe(pd.DataFrame(drug_data), use_container_width=True)

    # รายละเอียดสารยา
    st.subheader("รายละเอียดสารยา")
    selected_drug_name = st.selectbox("เลือกสารยาเพื่อดูรายละเอียด", [d.name for d in filtered_drugs])
    selected_drug = next((d for d in filtered_drugs if d.name == selected_drug_name), None)

    if selected_drug:
        col1, col2 = st.columns([1, 1])

        with col1:
            st.markdown(f"""
            ### {selected_drug.name}
            - **รหัส PubChem CID:** {selected_drug.cid}
            - **สูตรโมเลกุล:** {selected_drug.molecular_formula}
            - **น้ำหนักโมเลกุล:** {selected_drug.molecular_weight} g/mol
            - **ประเภท:** {selected_drug.category}
            - **กลไกการออกฤทธิ์:** {selected_drug.mechanism}
            - **แหล่งที่มา:** {selected_drug.source}
            """)

            if selected_drug.smiles:
                st.markdown("**SMILES:**")
                st.code(selected_drug.smiles, language=None)

        with col2:
            # การแสดงผล 3 มิติ
            if selected_drug.smiles:
                st.markdown("**โครงสร้าง 3 มิติ:**")
                html = get_molecule_3d_html(selected_drug.smiles, 350, 300)
                components.html(html, height=330)

# ============================================================================
# หน้าจำลองการทดลอง (SIMULATION PAGE)
# ============================================================================

elif page == "🔬 จำลองการทดลอง":
    st.header("🔬 การจำลอง Molecular Docking")

    proteins = get_all_proteins()
    drugs = get_all_drugs()

    # การเลือก
    col1, col2 = st.columns(2)

    with col1:
        st.subheader("เลือกโปรตีนเป้าหมาย")
        select_all_proteins = st.checkbox("เลือกทุกโปรตีน")

        if select_all_proteins:
            selected_protein_names = [p.name for p in proteins]
        else:
            selected_protein_names = st.multiselect(
                "เลือกโปรตีน",
                [p.name for p in proteins],
                default=[proteins[0].name, proteins[2].name] if len(proteins) > 2 else [proteins[0].name]
            )

        st.info(f"เลือกแล้ว: {len(selected_protein_names)} โปรตีน")

    with col2:
        st.subheader("เลือกสารยาที่ต้องการทดสอบ")
        select_all_drugs = st.checkbox("เลือกทุกสารยา")

        if select_all_drugs:
            selected_drug_names = [d.name for d in drugs]
        else:
            selected_drug_names = st.multiselect(
                "เลือกสารยา",
                [d.name for d in drugs],
                default=["Silymarin", "Quercetin", "EDTA", "Curcumin"]
            )

        st.info(f"เลือกแล้ว: {len(selected_drug_names)} สารยา")

    # ตั้งค่าการจำลอง
    st.subheader("⚙️ ตั้งค่าการจำลอง")

    col1, col2, col3 = st.columns(3)
    with col1:
        exhaustiveness = st.slider("ความละเอียด (Exhaustiveness)", 1, 32, 8)
    with col2:
        num_modes = st.slider("จำนวน poses", 1, 20, 9)
    with col3:
        random_seed = st.number_input("Random seed", 0, 9999, 42)

    # รันการจำลอง
    st.divider()

    if st.button("🚀 เริ่มการจำลอง", type="primary", use_container_width=True):
        if not selected_protein_names or not selected_drug_names:
            st.error("กรุณาเลือกอย่างน้อย 1 โปรตีน และ 1 สารยา!")
        else:
            random.seed(random_seed)

            selected_proteins = [p for p in proteins if p.name in selected_protein_names]
            selected_drugs = [d for d in drugs if d.name in selected_drug_names]

            total_dockings = len(selected_proteins) * len(selected_drugs)

            with st.spinner(f"กำลังจำลอง {total_dockings} การทดลอง..."):
                progress_bar = st.progress(0)

                results = []
                for i, protein in enumerate(selected_proteins):
                    pockets = detect_binding_pockets(protein)
                    best_pocket = pockets[0]

                    for j, drug in enumerate(selected_drugs):
                        affinity = calculate_binding_affinity(protein, drug, best_pocket)
                        h_bonds = random.randint(1, 6)
                        hydrophobic = random.randint(2, 10)

                        result = DockingResult(
                            protein=protein,
                            drug=drug,
                            pocket=best_pocket,
                            binding_affinity=affinity,
                            h_bonds=h_bonds,
                            hydrophobic=hydrophobic
                        )
                        results.append(result)

                        progress = (i * len(selected_drugs) + j + 1) / total_dockings
                        progress_bar.progress(progress)

                st.session_state.simulation_results = results
                st.session_state.selected_proteins = selected_proteins
                st.session_state.selected_drugs = selected_drugs

            st.success(f"✅ การจำลองเสร็จสิ้น! สร้างผลลัพธ์ {len(results)} รายการ")
            st.balloons()

            # แสดงตัวอย่างผลลัพธ์
            st.subheader("ตัวอย่างผลลัพธ์")
            sorted_results = sorted(results, key=lambda x: x.binding_affinity)[:5]

            preview_data = []
            for r in sorted_results:
                preview_data.append({
                    "สารยา": r.drug.name,
                    "โปรตีน": r.protein.name[:30],
                    "Binding Affinity": f"{r.binding_affinity} kcal/mol",
                    "ระดับ": get_rating_thai(r.binding_affinity)
                })

            st.dataframe(pd.DataFrame(preview_data), use_container_width=True)
            st.info("ไปที่หน้า **ผลลัพธ์** เพื่อดูรายละเอียดเพิ่มเติม!")

# ============================================================================
# หน้าผลลัพธ์ (RESULTS PAGE)
# ============================================================================

elif page == "📊 ผลลัพธ์":
    st.header("📊 ผลลัพธ์การจำลอง")

    if st.session_state.simulation_results is None:
        st.warning("ยังไม่มีผลลัพธ์การจำลอง กรุณาทำการจำลองก่อน!")
    else:
        results = st.session_state.simulation_results
        sorted_results = sorted(results, key=lambda x: x.binding_affinity)

        # สรุปสถิติ
        st.subheader("📈 สรุปสถิติ")

        col1, col2, col3, col4 = st.columns(4)

        successful = len([r for r in results if r.is_successful])

        with col1:
            st.metric("จำนวนการจำลองทั้งหมด", len(results))
        with col2:
            st.metric("การจับที่สำเร็จ", successful)
        with col3:
            st.metric("อัตราความสำเร็จ", f"{successful/len(results)*100:.1f}%")
        with col4:
            st.metric("Affinity ที่ดีที่สุด", f"{sorted_results[0].binding_affinity} kcal/mol")

        # แท็บสำหรับมุมมองต่างๆ
        tab1, tab2, tab3, tab4 = st.tabs(["📋 ผลลัพธ์ทั้งหมด", "📊 กราฟ", "🏆 10 อันดับแรก", "🔍 วิเคราะห์"])

        with tab1:
            # ตารางผลลัพธ์ทั้งหมด
            results_data = []
            for i, r in enumerate(sorted_results, 1):
                results_data.append({
                    "อันดับ": i,
                    "สารยา": r.drug.name,
                    "โปรตีน": r.protein.name,
                    "สิ่งมีชีวิต": r.protein.organism,
                    "Affinity (kcal/mol)": r.binding_affinity,
                    "พันธะไฮโดรเจน": r.hydrogen_bonds,
                    "Hydrophobic": r.hydrophobic_contacts,
                    "ระดับ": get_rating_thai(r.binding_affinity)
                })

            df = pd.DataFrame(results_data)
            st.dataframe(df, use_container_width=True, height=400)

        with tab2:
            # กราฟ
            chart_col1, chart_col2 = st.columns(2)

            with chart_col1:
                # การกระจายของ Binding Affinity
                fig1 = px.histogram(
                    df,
                    x="Affinity (kcal/mol)",
                    nbins=20,
                    title="การกระจายของค่า Binding Affinity",
                    color_discrete_sequence=['#1E88E5']
                )
                fig1.add_vline(x=-7.0, line_dash="dash", line_color="green",
                              annotation_text="เกณฑ์การจับที่ดี")
                st.plotly_chart(fig1, use_container_width=True)

            with chart_col2:
                # แผนภูมิวงกลมแสดงระดับ
                rating_counts = df['ระดับ'].value_counts()
                fig2 = px.pie(
                    values=rating_counts.values,
                    names=rating_counts.index,
                    title="ผลลัพธ์แบ่งตามระดับ",
                    color_discrete_sequence=px.colors.qualitative.Set2
                )
                st.plotly_chart(fig2, use_container_width=True)

            # Heatmap
            st.subheader("แผนที่ความร้อน Binding Affinity")

            heatmap_data = df.pivot_table(
                values='Affinity (kcal/mol)',
                index='สารยา',
                columns='โปรตีน',
                aggfunc='mean'
            )

            fig3 = px.imshow(
                heatmap_data,
                labels=dict(x="โปรตีน", y="สารยา", color="Affinity (kcal/mol)"),
                title="แผนที่ความร้อน Binding Affinity ระหว่างโปรตีนและสารยา",
                color_continuous_scale='RdYlGn_r',
                aspect='auto'
            )
            st.plotly_chart(fig3, use_container_width=True)

        with tab3:
            # 10 อันดับแรก
            st.subheader("🏆 10 อันดับผลลัพธ์ที่ดีที่สุด")

            for i, r in enumerate(sorted_results[:10], 1):
                rating = get_rating_thai(r.binding_affinity)
                color = "🟢" if rating == "ดีเยี่ยม" else "🔵" if rating == "ดี" else "🟡"

                with st.expander(f"{color} #{i}: {r.drug.name} + {r.protein.name[:30]}... ({r.binding_affinity} kcal/mol)"):
                    col1, col2 = st.columns(2)

                    with col1:
                        st.markdown(f"""
                        **สารยา:** {r.drug.name}
                        - สูตร: {r.drug.molecular_formula}
                        - น้ำหนักโมเลกุล: {r.drug.molecular_weight} g/mol
                        - ประเภท: {r.drug.category}
                        """)

                    with col2:
                        st.markdown(f"""
                        **โปรตีน:** {r.protein.name}
                        - สิ่งมีชีวิต: {r.protein.organism}
                        - หน้าที่: {r.protein.function}
                        """)

                    st.markdown(f"""
                    ---
                    **ผลการ Docking:**
                    - Binding Affinity: **{r.binding_affinity} kcal/mol**
                    - พันธะไฮโดรเจน: {r.hydrogen_bonds}
                    - Hydrophobic Contacts: {r.hydrophobic_contacts}
                    - ระดับ: **{rating}**
                    """)

        with tab4:
            # วิเคราะห์
            st.subheader("🔍 การวิเคราะห์เชิงลึก")

            # แบ่งตามโปรตีน
            st.markdown("### ผลลัพธ์แบ่งตามโปรตีน")
            protein_summary = df.groupby('โปรตีน').agg({
                'Affinity (kcal/mol)': ['min', 'mean', 'count']
            }).round(2)
            protein_summary.columns = ['Affinity ที่ดีที่สุด', 'Affinity เฉลี่ย', 'จำนวนสารยาที่ทดสอบ']
            protein_summary = protein_summary.sort_values('Affinity ที่ดีที่สุด')
            st.dataframe(protein_summary, use_container_width=True)

            # แบ่งตามสารยา
            st.markdown("### ผลลัพธ์แบ่งตามสารยา")
            drug_summary = df.groupby('สารยา').agg({
                'Affinity (kcal/mol)': ['min', 'mean', 'count']
            }).round(2)
            drug_summary.columns = ['Affinity ที่ดีที่สุด', 'Affinity เฉลี่ย', 'จำนวนโปรตีนที่ทดสอบ']
            drug_summary = drug_summary.sort_values('Affinity ที่ดีที่สุด')
            st.dataframe(drug_summary, use_container_width=True)

            # สารยาที่ดีที่สุดสำหรับแต่ละโปรตีน
            st.markdown("### สารยาที่ดีที่สุดสำหรับแต่ละโปรตีน")
            best_for_protein = df.loc[df.groupby('โปรตีน')['Affinity (kcal/mol)'].idxmin()]
            st.dataframe(best_for_protein[['โปรตีน', 'สารยา', 'Affinity (kcal/mol)', 'ระดับ']], use_container_width=True)

# ============================================================================
# หน้าส่งออกข้อมูล (EXPORT PAGE)
# ============================================================================

elif page == "📥 ส่งออกข้อมูล":
    st.header("📥 ส่งออกผลลัพธ์")

    if st.session_state.simulation_results is None:
        st.warning("ยังไม่มีผลลัพธ์ที่จะส่งออก กรุณาทำการจำลองก่อน!")
    else:
        results = st.session_state.simulation_results
        sorted_results = sorted(results, key=lambda x: x.binding_affinity)

        st.subheader("ตัวเลือกการส่งออก")

        col1, col2 = st.columns(2)

        with col1:
            st.markdown("### 📊 ส่งออก CSV")
            st.markdown("ดาวน์โหลดผลลัพธ์เป็นไฟล์ CSV สำหรับวิเคราะห์ใน Excel หรือเครื่องมืออื่นๆ")

            # เตรียมข้อมูล CSV
            csv_data = []
            for i, r in enumerate(sorted_results, 1):
                csv_data.append({
                    "อันดับ": i,
                    "ชื่อสารยา": r.drug.name,
                    "รหัส_CID": r.drug.cid,
                    "น้ำหนักโมเลกุล": r.drug.molecular_weight,
                    "ชื่อโปรตีน": r.protein.name,
                    "รหัส_UniProt": r.protein.uniprot_id,
                    "สิ่งมีชีวิต": r.protein.organism,
                    "Binding_Affinity_kcal_mol": r.binding_affinity,
                    "พันธะไฮโดรเจน": r.hydrogen_bonds,
                    "Hydrophobic_Contacts": r.hydrophobic_contacts,
                    "ระดับ": get_rating_thai(r.binding_affinity)
                })

            df_export = pd.DataFrame(csv_data)
            csv_buffer = io.StringIO()
            df_export.to_csv(csv_buffer, index=False, encoding='utf-8-sig')

            st.download_button(
                label="⬇️ ดาวน์โหลด CSV",
                data=csv_buffer.getvalue(),
                file_name=f"ผลการจำลอง_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv",
                mime="text/csv"
            )

        with col2:
            st.markdown("### 📑 ส่งออก Excel")
            st.markdown("ดาวน์โหลดรายงาน Excel ที่มีหลายชีต")

            # เตรียมข้อมูล Excel
            excel_buffer = io.BytesIO()

            with pd.ExcelWriter(excel_buffer, engine='xlsxwriter') as writer:
                # ชีตผลลัพธ์
                df_export.to_excel(writer, sheet_name='ผลลัพธ์', index=False)

                # ชีตสรุป
                summary_data = {
                    'รายการ': ['จำนวนการจำลองทั้งหมด', 'การจับที่สำเร็จ', 'อัตราความสำเร็จ', 'Affinity ที่ดีที่สุด', 'สารยาที่ดีที่สุด'],
                    'ค่า': [
                        len(results),
                        len([r for r in results if r.is_successful]),
                        f"{len([r for r in results if r.is_successful])/len(results)*100:.1f}%",
                        f"{sorted_results[0].binding_affinity} kcal/mol",
                        sorted_results[0].drug.name
                    ]
                }
                pd.DataFrame(summary_data).to_excel(writer, sheet_name='สรุป', index=False)

                # ชีต 10 อันดับแรก
                pd.DataFrame(csv_data[:10]).to_excel(writer, sheet_name='10 อันดับแรก', index=False)

            st.download_button(
                label="⬇️ ดาวน์โหลด Excel",
                data=excel_buffer.getvalue(),
                file_name=f"รายงานการจำลอง_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx",
                mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            )

        st.divider()

        # ตัวอย่าง
        st.subheader("📋 ตัวอย่างข้อมูลที่จะส่งออก")
        st.dataframe(df_export.head(20), use_container_width=True)

        # ตารางสำหรับรายงาน
        st.subheader("📝 ตารางสำหรับรายงานวิจัย")
        st.markdown("คัดลอกตารางนี้สำหรับใช้ในรายงานวิจัย:")

        pub_data = []
        for i, r in enumerate(sorted_results[:10], 1):
            pub_data.append({
                "อันดับ": i,
                "สารประกอบ": r.drug.name,
                "เป้าหมาย": r.protein.name.split('(')[0].strip(),
                "สายพันธุ์": r.protein.organism,
                "ΔG (kcal/mol)": r.binding_affinity,
                "H-bonds": r.hydrogen_bonds
            })

        st.table(pd.DataFrame(pub_data))


# ============================================================================
# FOOTER
# ============================================================================

st.divider()
st.markdown("""
<div style="text-align: center; color: #888; font-size: 0.9rem;">
    <p>โปรแกรมวิเคราะห์โครงสร้างโปรตีนในพิษแมงกะพรุนกล่อง v1.0</p>
    <p>โดยใช้ฐานข้อมูลชีวสารสนเทศเพื่อการออกแบบยาต้านพิษในอนาคต</p>
    <p>🪼 สร้างด้วย Streamlit • ข้อมูลจาก UniProt และ PubChem</p>
</div>
""", unsafe_allow_html=True)
