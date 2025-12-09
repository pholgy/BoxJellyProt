# 🪼 โปรแกรมวิเคราะห์โครงสร้างโปรตีนในพิษแมงกะพรุนกล่อง

## โดยใช้ฐานข้อมูลชีวสารสนเทศเพื่อการออกแบบยาต้านพิษในอนาคต

> Box Jellyfish Toxin Protein Structure Analysis Program Using Bioinformatics Database for Future Antivenom Drug Design

---

## 📋 รายละเอียดโปรเจค

โปรแกรมนี้เป็นเครื่องมือสำหรับวิเคราะห์โครงสร้างโปรตีนพิษแมงกะพรุนกล่อง และจำลองการจับกันระหว่างโปรตีนเป้าหมายกับสารยาที่มีศักยภาพ (Molecular Docking Simulation) เพื่อใช้ในการออกแบบยาต้านพิษในอนาคต

### ความสามารถหลัก

- 🧬 **ฐานข้อมูลโปรตีนพิษ** - 12 โปรตีนจาก 6 สายพันธุ์แมงกะพรุน
- 💊 **ฐานข้อมูลสารยา** - 25+ สารประกอบที่มีศักยภาพในการยับยั้งพิษ
- 🔬 **การจำลอง Molecular Docking** - คำนวณค่า Binding Affinity
- 📊 **การวิเคราะห์ผลลัพธ์** - กราฟ, Heatmap, และตารางสรุป
- 🎨 **การแสดงผล 3 มิติ** - โครงสร้างโปรตีนและสารยา
- 📥 **ส่งออกข้อมูล** - CSV และ Excel

---

## 🚀 การใช้งาน

### ออนไลน์ (Streamlit Cloud)
เข้าใช้งานได้ที่: [Streamlit App Link]

### ในเครื่อง (Local)

1. Clone repository:
```bash
git clone https://github.com/YOUR_USERNAME/jellyfish-toxin-analysis.git
cd jellyfish-toxin-analysis
```

2. ติดตั้ง dependencies:
```bash
pip install -r requirements.txt
```

3. รันแอปพลิเคชัน:
```bash
streamlit run app.py
```

4. เปิดเบราว์เซอร์ที่ `http://localhost:8501`

---

## 📁 โครงสร้างโปรเจค

```
├── app.py                    # แอปพลิเคชัน Streamlit หลัก
├── database.py               # ฐานข้อมูลโปรตีนและสารยา
├── visualization.py          # ฟังก์ชันแสดงผล 3 มิติ
├── export.py                 # ฟังก์ชันส่งออกข้อมูล
├── autodock_vina.py          # การเชื่อมต่อ AutoDock Vina
├── jellyfish_docking_simulation.py  # สคริปต์จำลองแบบ Console
├── requirements.txt          # รายการ dependencies
└── README.md                 # ไฟล์นี้
```

---

## 🧬 แมงกะพรุนที่รวมอยู่ในฐานข้อมูล

| สายพันธุ์ | ชื่อสามัญ | ความอันตราย |
|-----------|-----------|-------------|
| Chironex fleckeri | แมงกะพรุนกล่องออสเตรเลีย | สูงมาก |
| Nemopilema nomurai | แมงกะพรุนยักษ์โนมูระ | สูง |
| Carybdea rastonii | แมงกะพรุนกล่องจิมเบิล | ปานกลาง |
| Chrysaora quinquecirrha | แมงกะพรุนทะเลซีเน็ตเทิล | ปานกลาง |
| Pelagia noctiluca | แมงกะพรุนม่วง | ปานกลาง |
| Cyanea capillata | แมงกะพรุนแผงคอสิงโต | ปานกลาง |

---

## 💊 ประเภทสารยาที่ทดสอบ

- **ฟลาโวนอยด์** - Silymarin, Quercetin, Kaempferol, Apigenin
- **สารยับยั้ง MMP** - Marimastat, Batimastat, EDTA
- **ยาต้านอักเสบ** - Aspirin, Ibuprofen, Indomethacin
- **สารจากธรรมชาติ** - Curcumin, Resveratrol, EGCG

---

## 📊 ผลการค้นพบที่สำคัญ

| อันดับ | สารยา | Binding Affinity | ระดับ |
|--------|-------|------------------|-------|
| 1 | Silymarin | -9.5 kcal/mol | ดีเยี่ยม |
| 2 | Marimastat | -8.8 kcal/mol | ดี |
| 3 | Pinobanksin | -8.0 kcal/mol | ดี |
| 4 | Tricetin | -8.0 kcal/mol | ดี |
| 5 | Curcumin | -7.8 kcal/mol | ดี |

---

## 📚 อ้างอิง

- UniProt Database: https://www.uniprot.org/
- PubChem Database: https://pubchem.ncbi.nlm.nih.gov/
- MDPI Int. J. Mol. Sci. 2023, 24(10), 8972 - Silymarin as NnV-Mlp Inhibitor

---

## 👥 ผู้พัฒนา

โปรเจคนี้พัฒนาขึ้นเพื่อการศึกษาและวิจัย

---

## 📄 สัญญาอนุญาต

MIT License - สามารถนำไปใช้และดัดแปลงได้อย่างเสรี

---

## 🙏 ขอบคุณ

- ข้อมูลโปรตีนจาก UniProt
- ข้อมูลสารเคมีจาก PubChem
- 3D Visualization โดย 3Dmol.js
- Web Framework โดย Streamlit

---

*© 2025 - เพื่อการศึกษาและวิจัย*
