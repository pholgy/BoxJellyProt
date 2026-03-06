# วิธีการดำเนินงาน (Methodology)

## โครงการ: โปรแกรมวิเคราะห์โครงสร้างโปรตีนในพิษแมงกะพรุนกล่อง
### พัฒนาเป็นเว็บแอปพลิเคชันด้วย React + TypeScript (ย้ายจาก Streamlit)

---

## ขั้นตอนที่ 1: รวบรวมข้อมูลโปรตีนพิษแมงกะพรุน

1. เข้าเว็บไซต์ฐานข้อมูล UniProt (www.uniprot.org)
2. ค้นหาคำว่า "jellyfish toxin" หรือ "box jellyfish"
3. เลือกโปรตีนพิษที่น่าสนใจ เช่น CfTX-1, CfTX-2 จากแมงกะพรุนกล่อง
4. บันทึกข้อมูลที่สำคัญ ได้แก่:
   - รหัสโปรตีน
   - ชื่อโปรตีน
   - สายพันธุ์แมงกะพรุน
   - ลำดับกรดอะมิโน
   - หน้าที่ของพิษ

---

## ขั้นตอนที่ 2: รวบรวมข้อมูลสารยาที่มีศักยภาพ

1. เข้าเว็บไซต์ฐานข้อมูล PubChem (pubchem.ncbi.nlm.nih.gov)
2. ค้นหาสารที่มีการศึกษาว่าสามารถยับยั้งพิษได้ เช่น Silymarin, Quercetin
3. บันทึกข้อมูลที่สำคัญ ได้แก่:
   - รหัสสาร (CID)
   - ชื่อสาร
   - สูตรโมเลกุล
   - น้ำหนักโมเลกุล
   - โครงสร้าง SMILES

---

## ขั้นตอนที่ 3: สร้างฐานข้อมูลในโปรแกรม

1. สร้างไฟล์สำหรับเก็บข้อมูลโปรตีนและสารยา
2. นำข้อมูลที่รวบรวมมาจัดเก็บอย่างเป็นระบบ
3. จัดแบ่งหมวดหมู่ตามสายพันธุ์แมงกะพรุนและประเภทสารยา

---

## ขั้นตอนที่ 4: สร้างส่วนแสดงผลโครงสร้าง 3 มิติ

1. ใช้เครื่องมือ 3Dmol.js แสดงโครงสร้างโมเลกุลแบบ 3 มิติ
2. เชื่อมต่อกับ PubChem และ NCI Cactus เพื่อดึงโครงสร้าง 3 มิติของสารยา (SDF format)
3. เชื่อมต่อกับ AlphaFold API เพื่อดึงโครงสร้าง 3 มิติของโปรตีน (PDB format)
4. แสดง Molecular Surface (พื้นผิวโมเลกุล) แบบ PyMOL-style
5. แสดงลูกศรอธิบาย (Annotations) ชี้ตำแหน่ง Binding Pocket, Drug Molecule, และ H-bonds

---

## ขั้นตอนที่ 5: สร้างส่วนจำลองการจับกันของโมเลกุล

1. สร้างสูตรคำนวณค่า Binding Affinity โดยพิจารณาจาก:
   - น้ำหนักโมเลกุลของสารยา
   - ความเหมาะสมของตำแหน่งที่จับ
   - ความเข้ากันได้ระหว่างโปรตีนและสารยา

2. กำหนดเกณฑ์การตัดสิน:
   - ดีเยี่ยม: ต่ำกว่า -9.0 kcal/mol
   - ดี: -9.0 ถึง -7.0 kcal/mol
   - ปานกลาง: -7.0 ถึง -5.0 kcal/mol

---

## ขั้นตอนที่ 6: ออกแบบและสร้างหน้าเว็บ

> พัฒนาด้วย React 18 + TypeScript + Vite + Tailwind CSS + Ant Design
> รองรับ 2 ภาษา (ไทย/อังกฤษ) ทั้งเว็บไซต์
> Deploy บน Vercel (https://boxjellyprot.vercel.app)

### หน้าที่ 1: หน้าแรก (Home)
- แสดงข้อมูลภาพรวมของโครงการ
- แสดงจำนวนโปรตีนและสารยาในฐานข้อมูล
- แสดงผลลัพธ์เด่น (Featured Result) พร้อมค่า Binding Affinity
- มี Micro-interactions และ Animations ด้วย Framer Motion

### หน้าที่ 2: โปรตีนพิษ (Proteins)
- แสดงรายการโปรตีนพิษทั้งหมดแบบ Card-based
- มีตัวกรองตามสายพันธุ์และชนิดพิษ
- แสดงโครงสร้าง 3 มิติของโปรตีนจาก AlphaFold API
- แสดงลำดับกรดอะมิโนแบบขยาย/ย่อได้

### หน้าที่ 3: สารยา (Drugs)
- แสดงรายการสารยาทั้งหมดในตาราง
- มีช่องค้นหาและตัวกรองตามประเภท
- แสดงโครงสร้าง 3 มิติของสารจาก PubChem/NCI Cactus

### หน้าที่ 4: จำลองการทดลอง (Simulation)
- ให้ผู้ใช้เลือกโปรตีนและสารยาที่ต้องการทดสอบ (เลือกทั้งหมดได้)
- ปรับพารามิเตอร์ Exhaustiveness, Num Modes, Random Seed
- แสดง Progress Bar ระหว่างจำลอง
- แสดงผลลัพธ์ Top 5 ทันทีหลังจำลองเสร็จ

### หน้าที่ 5: ผลลัพธ์ (Results)
- แสดงตารางผลลัพธ์ทั้งหมดพร้อมระดับคุณภาพ
- แสดงกราฟ Bar Chart, Scatter Plot ด้วย Recharts
- แสดง Heatmap เปรียบเทียบผลลัพธ์
- กรองข้อมูลตามโปรตีนและระดับคุณภาพ

### หน้าที่ 6: ส่งออกข้อมูล (Export)
- ปุ่มดาวน์โหลดไฟล์ CSV
- สถิติสรุปผลลัพธ์ก่อนส่งออก

### หน้าที่ 7: จำลองการจับกัน (Docking Visualization) — **ใหม่**
- เลือกคู่โปรตีน-สารยาแบบ Card-based
- แสดงโครงสร้าง 3 มิติแบบ Surface Rendering (PyMOL-style)
- แสดง Binding Pocket (สีแดง), Drug Molecule (สีเขียว), Protein Surface (สีเทา)
- ลูกศรอธิบาย (Annotations) ชี้ตำแหน่งสำคัญ
- แสดงค่า Binding Affinity, H-bonds, Hydrophobic Contacts

---

## ขั้นตอนที่ 7: ทดสอบและปรับปรุง

1. ทดสอบการทำงานของทุกหน้าด้วย Playwright End-to-End Tests
2. ตรวจสอบความถูกต้องของข้อมูล
3. ทดสอบการส่งออกไฟล์
4. ตรวจสอบ Accessibility (WCAG 2.1) ด้วย RAMS Design Review
5. แก้ไขข้อผิดพลาดที่พบ (TypeScript type-checking)
6. ปรับปรุงหน้าตาให้สวยงามและใช้งานง่าย
7. เพิ่ม Micro-interactions, Kawaii Jellyfish Mascot, และ Ocean Bubbles Effect

---

## สรุปขั้นตอน

```
รวบรวมข้อมูล → สร้างฐานข้อมูล → สร้างส่วนแสดงผล 3D →
สร้างส่วนจำลอง → ออกแบบหน้าเว็บ → ทดสอบและปรับปรุง
```

## เทคโนโลยีที่ใช้ (Tech Stack)

| เทคโนโลยี | หน้าที่ |
|-----------|---------|
| React 18 + TypeScript | Frontend framework |
| Vite | Build tool |
| Tailwind CSS | Utility-first CSS |
| Ant Design | UI component library |
| Framer Motion | Animations & micro-interactions |
| 3Dmol.js | 3D molecular visualization (WebGL) |
| Recharts | Data visualization / charts |
| Zustand | State management |
| Playwright | End-to-end testing |
| Vercel | Deployment & hosting |
| AlphaFold API | Protein 3D structures |
| PubChem / NCI Cactus | Drug 3D structures (SDF) |
