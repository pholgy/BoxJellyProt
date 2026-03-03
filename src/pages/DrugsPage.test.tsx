import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DrugsPage } from './DrugsPage';
import { useDatabaseStore } from '../stores';
import { DrugCandidate } from '../types';

// Mock the database store
jest.mock('../stores', () => ({
  useDatabaseStore: jest.fn()
}));

// Mock Three.js components
jest.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => <div data-testid="3d-canvas">{children}</div>
}));

jest.mock('@react-three/drei', () => ({
  OrbitControls: () => <div data-testid="orbit-controls" />,
  Sphere: () => <mesh data-testid="molecule-structure" />,
  Text: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

const mockDrugs: DrugCandidate[] = [
  {
    cid: '12345',
    name: 'Silymarin',
    molecular_formula: 'C25H22O10',
    molecular_weight: 482.44,
    smiles: 'COC1=CC(=CC(=C1O)OC)C2=COC3=CC(=C(C(=C3C2=O)O)O)O',
    category: 'Flavonoid',
    mechanism: 'Antioxidant',
    source: 'Natural'
  },
  {
    cid: '67890',
    name: 'Quercetin',
    molecular_formula: 'C15H10O7',
    molecular_weight: 302.24,
    smiles: 'C1=CC(=C(C=C1C2=C(C(=O)C3=C(C=C(C=C3O2)O)O)O)O)O',
    category: 'Flavonoid',
    mechanism: 'Anti-inflammatory',
    source: 'Natural'
  },
  {
    cid: '11111',
    name: 'EDTA',
    molecular_formula: 'C10H16N2O8',
    molecular_weight: 292.24,
    smiles: 'C(CN(CC(=O)O)CC(=O)O)N(CC(=O)O)CC(=O)O',
    category: 'Chelator',
    mechanism: 'Metal chelation',
    source: 'Synthetic'
  }
];

const mockDatabaseStore = {
  proteins: [],
  drugs: mockDrugs,
  stats: { total_proteins: 0, total_drugs: 3 },
  isLoading: false,
  lastLoadTime: Date.now(),
  loadData: jest.fn(),
  loadProteins: jest.fn(),
  loadDrugs: jest.fn(),
  loadStats: jest.fn(),
  clearData: jest.fn(),
  getProteinByUniprotId: jest.fn(),
  getDrugByCid: jest.fn(),
  getProteinsByOrganism: jest.fn(),
  getDrugsByCategory: jest.fn()
};

describe('DrugsPage', () => {
  beforeEach(() => {
    (useDatabaseStore as jest.Mock).mockReturnValue(mockDatabaseStore);
    jest.clearAllMocks();
  });

  it('renders the page header correctly', () => {
    render(<DrugsPage />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('💊 ฐานข้อมูลสารยาที่มีศักยภาพ');
  });

  it('displays category filter options', () => {
    render(<DrugsPage />);

    const categorySelect = screen.getByLabelText('กรองตามประเภท');
    expect(categorySelect).toBeInTheDocument();

    fireEvent.click(categorySelect);
    expect(screen.getByText('ทั้งหมด')).toBeInTheDocument();
    expect(screen.getByText('Flavonoid')).toBeInTheDocument();
    expect(screen.getByText('Chelator')).toBeInTheDocument();
  });

  it('displays search input', () => {
    render(<DrugsPage />);

    const searchInput = screen.getByLabelText('ค้นหาตามชื่อ');
    expect(searchInput).toBeInTheDocument();
  });

  it('filters drugs by category correctly', async () => {
    render(<DrugsPage />);

    const categorySelect = screen.getByLabelText('กรองตามประเภท');
    fireEvent.change(categorySelect, { target: { value: 'Flavonoid' } });

    await waitFor(() => {
      expect(screen.getByText('Silymarin')).toBeInTheDocument();
      expect(screen.getByText('Quercetin')).toBeInTheDocument();
      expect(screen.queryByText('EDTA')).not.toBeInTheDocument();
    });
  });

  it('filters drugs by search term correctly', async () => {
    render(<DrugsPage />);

    const searchInput = screen.getByLabelText('ค้นหาตามชื่อ');
    fireEvent.change(searchInput, { target: { value: 'sily' } });

    await waitFor(() => {
      expect(screen.getByText('Silymarin')).toBeInTheDocument();
      expect(screen.queryByText('Quercetin')).not.toBeInTheDocument();
      expect(screen.queryByText('EDTA')).not.toBeInTheDocument();
    });
  });

  it('displays drug data table with correct information', () => {
    render(<DrugsPage />);

    // Check table headers
    expect(screen.getByText('ชื่อ')).toBeInTheDocument();
    expect(screen.getByText('สูตรโมเลกุล')).toBeInTheDocument();
    expect(screen.getByText('น้ำหนักโมเลกุล (g/mol)')).toBeInTheDocument();
    expect(screen.getByText('ประเภท')).toBeInTheDocument();
    expect(screen.getByText('แหล่งที่มา')).toBeInTheDocument();

    // Check drug data
    expect(screen.getByText('Silymarin')).toBeInTheDocument();
    expect(screen.getByText('C25H22O10')).toBeInTheDocument();
    expect(screen.getByText('482.44')).toBeInTheDocument();
    expect(screen.getByText('Flavonoid')).toBeInTheDocument();
    expect(screen.getByText('Natural')).toBeInTheDocument();
  });

  it('displays drug detail section', () => {
    render(<DrugsPage />);

    expect(screen.getByText('รายละเอียดสารยา')).toBeInTheDocument();
    expect(screen.getByLabelText('เลือกสารยาเพื่อดูรายละเอียด')).toBeInTheDocument();
  });

  it('shows detailed drug information when drug is selected', async () => {
    render(<DrugsPage />);

    const drugSelect = screen.getByLabelText('เลือกสารยาเพื่อดูรายละเอียด');
    fireEvent.change(drugSelect, { target: { value: 'Silymarin' } });

    await waitFor(() => {
      expect(screen.getByText('รหัส PubChem CID: 12345')).toBeInTheDocument();
      expect(screen.getByText('สูตรโมเลกุล: C25H22O10')).toBeInTheDocument();
      expect(screen.getByText('น้ำหนักโมเลกุล: 482.44 g/mol')).toBeInTheDocument();
      expect(screen.getByText('ประเภท: Flavonoid')).toBeInTheDocument();
      expect(screen.getByText('กลไกการออกฤทธิ์: Antioxidant')).toBeInTheDocument();
      expect(screen.getByText('แหล่งที่มา: Natural')).toBeInTheDocument();
    });
  });

  it('displays SMILES structure when available', async () => {
    render(<DrugsPage />);

    const drugSelect = screen.getByLabelText('เลือกสารยาเพื่อดูรายละเอียด');
    fireEvent.change(drugSelect, { target: { value: 'Silymarin' } });

    await waitFor(() => {
      expect(screen.getByText('SMILES:')).toBeInTheDocument();
      expect(screen.getByText('COC1=CC(=CC(=C1O)OC)C2=COC3=CC(=C(C(=C3C2=O)O)O)O')).toBeInTheDocument();
    });
  });

  it('displays 3D molecular structure when SMILES is available', async () => {
    render(<DrugsPage />);

    const drugSelect = screen.getByLabelText('เลือกสารยาเพื่อดูรายละเอียด');
    fireEvent.change(drugSelect, { target: { value: 'Silymarin' } });

    await waitFor(() => {
      expect(screen.getByText('โครงสร้าง 3 มิติ:')).toBeInTheDocument();
      expect(screen.getByTestId('3d-canvas')).toBeInTheDocument();
      expect(screen.getByTestId('molecule-structure')).toBeInTheDocument();
    });
  });

  it('loads data when component mounts', () => {
    render(<DrugsPage />);

    expect(mockDatabaseStore.loadData).toHaveBeenCalledTimes(1);
  });

  it('shows loading state when data is loading', () => {
    const loadingStore = { ...mockDatabaseStore, isLoading: true };
    (useDatabaseStore as jest.Mock).mockReturnValue(loadingStore);

    render(<DrugsPage />);

    expect(screen.getByText('กำลังโหลดข้อมูล...')).toBeInTheDocument();
  });

  it('applies combined filters correctly', async () => {
    render(<DrugsPage />);

    // Apply category filter
    const categorySelect = screen.getByLabelText('กรองตามประเภท');
    fireEvent.change(categorySelect, { target: { value: 'Flavonoid' } });

    // Apply search filter
    const searchInput = screen.getByLabelText('ค้นหาตามชื่อ');
    fireEvent.change(searchInput, { target: { value: 'quer' } });

    await waitFor(() => {
      expect(screen.getByText('Quercetin')).toBeInTheDocument();
      expect(screen.queryByText('Silymarin')).not.toBeInTheDocument();
      expect(screen.queryByText('EDTA')).not.toBeInTheDocument();
    });
  });

  it('handles case insensitive search', async () => {
    render(<DrugsPage />);

    const searchInput = screen.getByLabelText('ค้นหาตามชื่อ');
    fireEvent.change(searchInput, { target: { value: 'SILY' } });

    await waitFor(() => {
      expect(screen.getByText('Silymarin')).toBeInTheDocument();
      expect(screen.queryByText('Quercetin')).not.toBeInTheDocument();
    });
  });

  it('shows empty state when no drugs match filters', async () => {
    render(<DrugsPage />);

    const searchInput = screen.getByLabelText('ค้นหาตามชื่อ');
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

    await waitFor(() => {
      expect(screen.getByText('ไม่พบสารยาที่ตรงกับเงื่อนไขการกรอง')).toBeInTheDocument();
    });
  });
});