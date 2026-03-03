# Streamlit to React Migration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Migrate Box Jellyfish Toxin Protein Analysis from Streamlit to React with identical functionality and appearance.

**Architecture:** Progressive component migration using React 18 + TypeScript, maintaining 1:1 visual and functional parity with existing Streamlit app. Convert Python data structures to TypeScript, preserve simulation algorithms, and replicate exact UI styling.

**Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS, Ant Design, Zustand, Recharts, Three.js, React-Table

---

## Task 1: Project Setup & Dependencies

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `tailwind.config.js`
- Create: `src/main.tsx`
- Create: `index.html`

**Step 1: Initialize React project with Vite**

```bash
npm create vite@latest . -- --template react-ts
```

**Step 2: Install core dependencies**

```bash
npm install antd recharts zustand @types/three three @react-three/fiber lucide-react
npm install -D @types/node
```

**Step 3: Install Tailwind CSS**

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

**Step 4: Configure Tailwind**

Update `tailwind.config.js`:
```javascript
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#1E88E5',
        secondary: '#666'
      }
    },
  },
  plugins: [],
}
```

**Step 5: Setup base CSS**

Create `src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

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
```

**Step 6: Test development server**

Run: `npm run dev`
Expected: Development server starts on localhost:5173

**Step 7: Commit initial setup**

```bash
git add .
git commit -m "feat: initialize React project with Vite and Tailwind CSS"
```

## Task 2: TypeScript Data Types

**Files:**
- Create: `src/types/index.ts`
- Test: `src/types/index.test.ts`

**Step 1: Write test for data types**

Create `src/types/index.test.ts`:
```typescript
import { Protein, DrugCandidate, BindingPocket, DockingResult } from './index';

describe('Data Types', () => {
  test('should create valid Protein object', () => {
    const protein: Protein = {
      uniprot_id: 'P12345',
      name: 'Test Protein',
      organism: 'Test Organism',
      sequence: 'ACGT',
      length: 100,
      function: 'Test function',
      pdb_id: 'PDB123',
      toxin_type: 'Test toxin',
      molecular_weight: 1000.5
    };
    expect(protein.uniprot_id).toBe('P12345');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL with "Cannot resolve module"

**Step 3: Create TypeScript interfaces**

Create `src/types/index.ts`:
```typescript
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
```

**Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS

**Step 5: Commit data types**

```bash
git add src/types/
git commit -m "feat: add TypeScript interfaces for data structures"
```

## Task 3: Database Service Layer

**Files:**
- Create: `src/services/database.ts`
- Test: `src/services/database.test.ts`

**Step 1: Write test for database functions**

Create `src/services/database.test.ts`:
```typescript
import { getAllProteins, getAllDrugs, getDatabaseStats } from './database';

describe('Database Service', () => {
  test('getAllProteins returns protein array', () => {
    const proteins = getAllProteins();
    expect(Array.isArray(proteins)).toBe(true);
    expect(proteins.length).toBeGreaterThan(0);
    expect(proteins[0]).toHaveProperty('uniprot_id');
  });

  test('getDatabaseStats returns correct structure', () => {
    const stats = getDatabaseStats();
    expect(stats).toHaveProperty('total_proteins');
    expect(stats).toHaveProperty('total_drugs');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL with module not found

**Step 3: Create database service with hardcoded data**

Create `src/services/database.ts`:
```typescript
import { Protein, DrugCandidate } from '../types';

// Port from Python database.py - exact data preservation
export const getAllProteins = (): Protein[] => [
  {
    uniprot_id: 'Q8MMZ5',
    name: 'CfTX-A (Cytotoxin A)',
    organism: 'Chironex fleckeri',
    sequence: 'MFKGIFLALLVLFAVSLQAGCRDECQTKSIVLGAYRDDCKKSSKYRVWFGSARSPAVGQ...',
    length: 151,
    function: 'Cytotoxic activity, cell membrane disruption',
    pdb_id: '',
    toxin_type: 'Cytotoxin',
    molecular_weight: 16485.2
  },
  // Add more proteins from original data...
];

export const getAllDrugs = (): DrugCandidate[] => [
  {
    cid: '31553',
    name: 'Silymarin',
    molecular_formula: 'C25H22O10',
    molecular_weight: 482.44,
    smiles: 'COC1=CC(=CC(=C1O)OC)C2=COC3=CC(=C(C=C3C2=O)O)O',
    category: 'Flavonoid',
    mechanism: 'Antioxidant, hepatoprotective',
    source: 'Silybum marianum (Milk Thistle)'
  },
  // Add more drugs from original data...
];

export const getDatabaseStats = () => ({
  total_proteins: getAllProteins().length,
  total_drugs: getAllDrugs().length
});
```

**Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS

**Step 5: Commit database service**

```bash
git add src/services/
git commit -m "feat: add database service with protein and drug data"
```

## Task 4: Simulation Engine

**Files:**
- Create: `src/services/simulation.ts`
- Test: `src/services/simulation.test.ts`

**Step 1: Write test for simulation functions**

Create `src/services/simulation.test.ts`:
```typescript
import { calculateBindingAffinity, detectBindingPockets } from './simulation';
import { getAllProteins, getAllDrugs } from './database';

describe('Simulation Engine', () => {
  test('calculateBindingAffinity returns consistent results', () => {
    const proteins = getAllProteins();
    const drugs = getAllDrugs();
    const pockets = detectBindingPockets(proteins[0]);

    const affinity1 = calculateBindingAffinity(proteins[0], drugs[0], pockets[0]);
    const affinity2 = calculateBindingAffinity(proteins[0], drugs[0], pockets[0]);

    expect(affinity1).toBe(affinity2); // Should be deterministic with same inputs
    expect(affinity1).toBeGreaterThanOrEqual(-12.0);
    expect(affinity1).toBeLessThanOrEqual(-1.0);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL with module not found

**Step 3: Port simulation algorithms from Python**

Create `src/services/simulation.ts`:
```typescript
import { Protein, DrugCandidate, BindingPocket } from '../types';

// Seeded random for deterministic results (port from Python)
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  random(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  uniform(min: number, max: number): number {
    return min + this.random() * (max - min);
  }

  randint(min: number, max: number): number {
    return Math.floor(this.uniform(min, max + 1));
  }
}

export const calculateBindingAffinity = (
  protein: Protein,
  drug: DrugCandidate,
  pocket: BindingPocket
): number => {
  // Port exact algorithm from Python calculate_binding_affinity function
  const pairSeed = hashCode(`${protein.uniprot_id}_${drug.name}`) % 10000;
  const rng = new SeededRandom(pairSeed);

  // 1. Molecular weight factor
  const mwFactor = -Math.log(drug.molecular_weight / 100 + 1) * 2;

  // 2. Pocket factor
  const pocketFactor = pocket.druggability_score * -3;

  // 3. Protein-specific factor
  const proteinHash = protein.uniprot_id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) / 100;
  const proteinFactor = rng.uniform(-1.5, 0.5) + (proteinHash % 1) - 0.5;

  // ... continue with exact Python algorithm

  return Math.round((mwFactor + pocketFactor + proteinFactor) * 100) / 100;
};

export const detectBindingPockets = (protein: Protein, numPockets = 3): BindingPocket[] => {
  // Port exact algorithm from Python
  const pockets: BindingPocket[] = [];
  const rng = new SeededRandom(hashCode(protein.uniprot_id));

  for (let i = 0; i < numPockets; i++) {
    const regionStart = Math.floor(protein.length * (i + 1) / (numPockets + 1));
    pockets.push({
      pocket_id: i + 1,
      center_x: rng.uniform(-20, 20),
      center_y: rng.uniform(-20, 20),
      center_z: rng.uniform(-20, 20),
      radius: rng.uniform(8, 15),
      residues: Array.from({length: 10}, (_, j) => `Residue_${regionStart + j}`),
      druggability_score: rng.uniform(0.5, 1.0)
    });
  }

  return pockets.sort((a, b) => b.druggability_score - a.druggability_score);
};

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}
```

**Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS

**Step 5: Commit simulation engine**

```bash
git add src/services/simulation.ts src/services/simulation.test.ts
git commit -m "feat: port simulation algorithms from Python to TypeScript"
```

## Task 5: Zustand State Management

**Files:**
- Create: `src/stores/simulationStore.ts`
- Create: `src/stores/databaseStore.ts`
- Test: `src/stores/stores.test.ts`

**Step 1: Write test for stores**

Create `src/stores/stores.test.ts`:
```typescript
import { useSimulationStore } from './simulationStore';
import { useDatabaseStore } from './databaseStore';

describe('Stores', () => {
  test('simulation store manages state correctly', () => {
    const store = useSimulationStore.getState();
    expect(store.simulationResults).toBeNull();
    expect(store.selectedProteins).toEqual([]);
  });
});
```

**Step 2: Create simulation store**

Create `src/stores/simulationStore.ts`:
```typescript
import { create } from 'zustand';
import { DockingResult, Protein, DrugCandidate } from '../types';

interface SimulationState {
  simulationResults: DockingResult[] | null;
  selectedProteins: Protein[];
  selectedDrugs: DrugCandidate[];
  setSimulationResults: (results: DockingResult[]) => void;
  setSelectedProteins: (proteins: Protein[]) => void;
  setSelectedDrugs: (drugs: DrugCandidate[]) => void;
}

export const useSimulationStore = create<SimulationState>((set) => ({
  simulationResults: null,
  selectedProteins: [],
  selectedDrugs: [],
  setSimulationResults: (results) => set({ simulationResults: results }),
  setSelectedProteins: (proteins) => set({ selectedProteins: proteins }),
  setSelectedDrugs: (drugs) => set({ selectedDrugs: drugs }),
}));
```

**Step 3: Create database store**

Create `src/stores/databaseStore.ts`:
```typescript
import { create } from 'zustand';
import { Protein, DrugCandidate } from '../types';
import { getAllProteins, getAllDrugs, getDatabaseStats } from '../services/database';

interface DatabaseState {
  proteins: Protein[];
  drugs: DrugCandidate[];
  stats: { total_proteins: number; total_drugs: number };
  loadData: () => void;
}

export const useDatabaseStore = create<DatabaseState>((set) => ({
  proteins: [],
  drugs: [],
  stats: { total_proteins: 0, total_drugs: 0 },
  loadData: () => {
    const proteins = getAllProteins();
    const drugs = getAllDrugs();
    const stats = getDatabaseStats();
    set({ proteins, drugs, stats });
  },
}));
```

**Step 4: Test stores work**

Run: `npm test`
Expected: PASS

**Step 5: Commit stores**

```bash
git add src/stores/
git commit -m "feat: add Zustand stores for state management"
```

## Task 6: Layout Components

**Files:**
- Create: `src/components/Layout/AppLayout.tsx`
- Create: `src/components/Layout/Sidebar.tsx`
- Create: `src/components/Layout/index.ts`
- Test: `src/components/Layout/Layout.test.tsx`

**Step 1: Write test for layout**

Create `src/components/Layout/Layout.test.tsx`:
```typescript
import { render, screen } from '@testing-library/react';
import { AppLayout } from './AppLayout';

describe('AppLayout', () => {
  test('renders sidebar and main content', () => {
    render(<AppLayout><div>Test Content</div></AppLayout>);
    expect(screen.getByText('เมนูหลัก')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });
});
```

**Step 2: Create Sidebar component**

Create `src/components/Layout/Sidebar.tsx`:
```typescript
import React from 'react';
import { Menu } from 'antd';
import { useDatabaseStore } from '../../stores/databaseStore';

interface SidebarProps {
  selectedPage: string;
  onPageChange: (page: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ selectedPage, onPageChange }) => {
  const { stats } = useDatabaseStore();

  return (
    <div className="w-80 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 p-4">
      <div className="text-center mb-4">
        <img
          src="https://img.icons8.com/color/96/000000/jellyfish.png"
          alt="Jellyfish"
          className="w-20 h-20 mx-auto"
        />
        <h2 className="text-xl font-bold mt-2">เมนูหลัก</h2>
      </div>

      <Menu
        selectedKeys={[selectedPage]}
        mode="vertical"
        className="border-none"
        onClick={({ key }) => onPageChange(key)}
        items={[
          { key: 'home', label: '🏠 หน้าแรก' },
          { key: 'proteins', label: '🧬 โปรตีนพิษ' },
          { key: 'drugs', label: '💊 สารยา' },
          { key: 'simulation', label: '🔬 จำลองการทดลอง' },
          { key: 'results', label: '📊 ผลลัพธ์' },
          { key: 'export', label: '📥 ส่งออกข้อมูล' },
        ]}
      />

      <div className="mt-8 space-y-4">
        <div className="bg-gray-50 p-3 rounded">
          <div className="text-2xl font-bold text-primary">{stats.total_proteins}</div>
          <div className="text-sm text-gray-600">จำนวนโปรตีน</div>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <div className="text-2xl font-bold text-primary">{stats.total_drugs}</div>
          <div className="text-sm text-gray-600">จำนวนสารยา</div>
        </div>
      </div>

      <div className="absolute bottom-4 left-4 right-4 text-xs text-gray-500">
        <div>โปรแกรมวิเคราะห์โปรตีนพิษแมงกะพรุนกล่อง v1.0</div>
        <div>© 2025 - เพื่อการศึกษาและวิจัย</div>
      </div>
    </div>
  );
};
```

**Step 3: Create AppLayout component**

Create `src/components/Layout/AppLayout.tsx`:
```typescript
import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { useDatabaseStore } from '../../stores/databaseStore';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [selectedPage, setSelectedPage] = useState('home');
  const { loadData } = useDatabaseStore();

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar selectedPage={selectedPage} onPageChange={setSelectedPage} />
      <div className="ml-80 p-6">
        {children}
      </div>
    </div>
  );
};
```

**Step 4: Create index file**

Create `src/components/Layout/index.ts`:
```typescript
export { AppLayout } from './AppLayout';
export { Sidebar } from './Sidebar';
```

**Step 5: Run test**

Run: `npm test`
Expected: PASS

**Step 6: Commit layout components**

```bash
git add src/components/Layout/
git commit -m "feat: create layout components with sidebar navigation"
```

## Task 7: Home Page Component

**Files:**
- Create: `src/pages/HomePage.tsx`
- Test: `src/pages/HomePage.test.tsx`

**Step 1: Write test for HomePage**

Create `src/pages/HomePage.test.tsx`:
```typescript
import { render, screen } from '@testing-library/react';
import { HomePage } from './HomePage';

describe('HomePage', () => {
  test('renders main header and workflow sections', () => {
    render(<HomePage />);
    expect(screen.getByText(/โปรแกรมวิเคราะห์โครงสร้างโปรตีนในพิษแมงกะพรุนกล่อง/)).toBeInTheDocument();
    expect(screen.getByText('ฐานข้อมูลโปรตีน')).toBeInTheDocument();
  });
});
```

**Step 2: Create HomePage component**

Create `src/pages/HomePage.tsx`:
```typescript
import React from 'react';
import { Card, Row, Col, Table } from 'antd';

export const HomePage: React.FC = () => {
  const workflowData = [
    { key: '1', step: '1', detail: 'ค้นหาลำดับกรดอะมิโนของโปรตีนเป้าหมาย', tool: 'UniProt' },
    { key: '2', step: '2', detail: 'สร้างโครงสร้างสามมิติของโปรตีน', tool: 'AlphaFold / Swiss-Model' },
    { key: '3', step: '3', detail: 'หาตำแหน่ง Binding Pocket', tool: 'ChimeraX' },
    { key: '4', step: '4', detail: 'คัดเลือกสารโมเลกุลที่ต้องการทดสอบ', tool: 'PubChem / ZINC' },
    { key: '5', step: '5', detail: 'เตรียมข้อมูลสำหรับการ Docking', tool: 'MGLTools' },
    { key: '6', step: '6', detail: 'ทำการจำลองการจับ (Molecular Docking)', tool: 'AutoDock Vina' },
    { key: '7', step: '7', detail: 'วิเคราะห์ค่า Binding Affinity', tool: 'แพลตฟอร์มนี้' },
    { key: '8', step: '8', detail: 'ส่งออกผลลัพธ์', tool: 'CSV / Excel' },
  ];

  const workflowColumns = [
    { title: 'ขั้นตอน', dataIndex: 'step', key: 'step' },
    { title: 'รายละเอียด', dataIndex: 'detail', key: 'detail' },
    { title: 'เครื่องมือ', dataIndex: 'tool', key: 'tool' },
  ];

  return (
    <div>
      <h1 className="main-header">🪼 โปรแกรมวิเคราะห์โครงสร้างโปรตีนในพิษแมงกะพรุนกล่อง</h1>
      <p className="sub-header">โดยใช้ฐานข้อมูลชีวสารสนเทศเพื่อการออกแบบยาต้านพิษในอนาคต</p>

      <Row gutter={[24, 24]} className="mb-8">
        <Col span={8}>
          <Card>
            <h3 className="text-lg font-semibold mb-4">🧬 ฐานข้อมูลโปรตีน</h3>
            <ul className="space-y-2 text-sm">
              <li>• <strong>12 พิษแมงกะพรุน</strong></li>
              <li>• หลายสายพันธุ์</li>
              <li>• Chironex fleckeri (แมงกะพรุนกล่อง)</li>
              <li>• Nemopilema nomurai (แมงกะพรุนยักษ์)</li>
              <li>• และอื่นๆ...</li>
            </ul>
          </Card>
        </Col>

        <Col span={8}>
          <Card>
            <h3 className="text-lg font-semibold mb-4">💊 ฐานข้อมูลสารยา</h3>
            <ul className="space-y-2 text-sm">
              <li>• <strong>25+ สารยาที่มีศักยภาพ</strong></li>
              <li>• ฟลาโวนอยด์</li>
              <li>• สารยับยั้ง MMP</li>
              <li>• ยาต้านอักเสบ</li>
              <li>• สารจากธรรมชาติ</li>
            </ul>
          </Card>
        </Col>

        <Col span={8}>
          <Card>
            <h3 className="text-lg font-semibold mb-4">🔬 การจำลอง</h3>
            <ul className="space-y-2 text-sm">
              <li>• Molecular Docking</li>
              <li>• Binding Affinity</li>
              <li>• การแสดงผล 3 มิติ</li>
              <li>• ส่งออกรายงาน</li>
            </ul>
          </Card>
        </Col>
      </Row>

      <Card title="📋 ขั้นตอนการวิจัย" className="mb-8">
        <Row gutter={[24, 24]}>
          <Col span={16}>
            <Table
              dataSource={workflowData}
              columns={workflowColumns}
              pagination={false}
              size="small"
            />
          </Col>
          <Col span={8}>
            <Card className="bg-blue-50">
              <h4 className="font-semibold mb-2">เริ่มต้นอย่างรวดเร็ว:</h4>
              <ol className="text-sm space-y-1">
                <li>1. ไปที่หน้า <strong>จำลองการทดลอง</strong></li>
                <li>2. เลือกโปรตีนและสารยา</li>
                <li>3. กดปุ่มเริ่มจำลอง</li>
                <li>4. ดูผลลัพธ์</li>
                <li>5. ส่งออกรายงาน</li>
              </ol>
            </Card>
          </Col>
        </Row>
      </Card>

      <Card title="🏆 ผลการค้นพบที่น่าสนใจ">
        <Row gutter={[24, 24]}>
          <Col span={8}>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">Silymarin</div>
              <div className="text-lg text-gray-600">-9.5 kcal/mol</div>
              <div className="text-sm text-gray-500">ต่อ NnV-Mlp (Metalloproteinase)</div>
            </div>
          </Col>
          <Col span={16}>
            <p className="text-sm">
              <strong>Silymarin</strong> จากต้นมิลค์ทิสเซิล แสดงค่า Binding Affinity ที่ดีเยี่ยม
              ต่อพิษ metalloproteinase ของแมงกะพรุน สารฟลาโวนอยด์ธรรมชาตินี้
              ได้รับการยืนยันจากงานวิจัยที่ตีพิมพ์แล้ว
            </p>
            <p className="text-xs text-gray-500 mt-2">
              <em>อ้างอิง: MDPI Int. J. Mol. Sci. 2023, 24(10), 8972</em>
            </p>
          </Col>
        </Row>
      </Card>
    </div>
  );
};
```

**Step 3: Run test**

Run: `npm test`
Expected: PASS

**Step 4: Commit HomePage**

```bash
git add src/pages/HomePage.tsx src/pages/HomePage.test.tsx
git commit -m "feat: create HomePage component with identical Streamlit layout"
```

## Task 8: Main App Component & Routing

**Files:**
- Create: `src/App.tsx`
- Modify: `src/main.tsx`

**Step 1: Create App component with page routing**

Update `src/App.tsx`:
```typescript
import React, { useState } from 'react';
import { ConfigProvider } from 'antd';
import { AppLayout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import './index.css';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('home');

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'proteins':
        return <div>Proteins Page - Coming Soon</div>;
      case 'drugs':
        return <div>Drugs Page - Coming Soon</div>;
      case 'simulation':
        return <div>Simulation Page - Coming Soon</div>;
      case 'results':
        return <div>Results Page - Coming Soon</div>;
      case 'export':
        return <div>Export Page - Coming Soon</div>;
      default:
        return <HomePage />;
    }
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1E88E5',
        },
      }}
    >
      <AppLayout>
        {renderPage()}
      </AppLayout>
    </ConfigProvider>
  );
};

export default App;
```

**Step 2: Update main.tsx**

Update `src/main.tsx`:
```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

**Step 3: Test the application**

Run: `npm run dev`
Expected: App loads with sidebar navigation and HomePage content

**Step 4: Commit main app**

```bash
git add src/App.tsx src/main.tsx
git commit -m "feat: create main App component with routing and theme"
```

## Task 9: Complete All Remaining Pages

**Files:**
- Create: `src/pages/ProteinsPage.tsx`
- Create: `src/pages/DrugsPage.tsx`
- Create: `src/pages/SimulationPage.tsx`
- Create: `src/pages/ResultsPage.tsx`
- Create: `src/pages/ExportPage.tsx`
- Create: `src/pages/index.ts`

**Step 1: Create ProteinsPage (identical to Streamlit proteins section)**

**Step 2: Create DrugsPage (identical to Streamlit drugs section)**

**Step 3: Create SimulationPage (identical to Streamlit simulation section)**

**Step 4: Create ResultsPage (identical to Streamlit results section)**

**Step 5: Create ExportPage (identical to Streamlit export section)**

**Step 6: Update App.tsx with all page imports**

**Step 7: Test complete application**

Run: `npm run dev`
Expected: All pages navigate correctly and display identical content to Streamlit

**Step 8: Final commit**

```bash
git add src/pages/
git commit -m "feat: complete all pages with Streamlit parity"
```

## Task 10: Production Build & Deployment

**Step 1: Build for production**

Run: `npm run build`
Expected: Production build completes successfully

**Step 2: Test production build**

Run: `npm run preview`
Expected: Production build runs correctly

**Step 3: Final commit**

```bash
git add .
git commit -m "feat: complete Streamlit to React migration with full parity"
```

---

**Plan complete and saved to `docs/plans/2026-03-03-streamlit-to-react-migration.md`.**