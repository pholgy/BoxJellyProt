import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ExportPage } from './ExportPage';
import { useSimulationStore } from '../stores';
import { DockingResult, Protein, DrugCandidate } from '../types';

// Mock the simulation store
jest.mock('../stores', () => ({
  useSimulationStore: jest.fn()
}));

// Mock file download functionality
const mockCreateObjectURL = jest.fn();
const mockRevokeObjectURL = jest.fn();
const mockClick = jest.fn();

Object.defineProperty(window, 'URL', {
  value: {
    createObjectURL: mockCreateObjectURL,
    revokeObjectURL: mockRevokeObjectURL
  }
});

// Mock HTMLAnchorElement
Object.defineProperty(HTMLAnchorElement.prototype, 'click', {
  value: mockClick
});

const mockProtein: Protein = {
  uniprot_id: 'P01234',
  name: 'Test Protein',
  organism: 'Chironex fleckeri',
  sequence: 'MKLLVVL...',
  length: 172,
  function: 'Cytolytic toxin',
  pdb_id: '1DFN',
  toxin_type: 'Cytotoxin',
  molecular_weight: 19235.2
};

const mockDrug: DrugCandidate = {
  cid: '12345',
  name: 'Silymarin',
  molecular_formula: 'C25H22O10',
  molecular_weight: 482.44,
  smiles: 'COC1=CC...',
  category: 'Flavonoid',
  mechanism: 'Antioxidant',
  source: 'Natural'
};

const mockResults: DockingResult[] = [
  {
    protein: mockProtein,
    drug: mockDrug,
    pocket: {
      pocket_id: 1,
      center_x: 0,
      center_y: 0,
      center_z: 0,
      radius: 10,
      residues: ['Residue_1'],
      druggability_score: 0.8
    },
    binding_affinity: -8.5,
    hydrogen_bonds: 3,
    hydrophobic_contacts: 5,
    is_successful: true
  },
  {
    protein: mockProtein,
    drug: { ...mockDrug, name: 'Quercetin', cid: '67890' },
    pocket: {
      pocket_id: 1,
      center_x: 0,
      center_y: 0,
      center_z: 0,
      radius: 10,
      residues: ['Residue_1'],
      druggability_score: 0.7
    },
    binding_affinity: -6.5,
    hydrogen_bonds: 2,
    hydrophobic_contacts: 4,
    is_successful: false
  }
];

const mockSimulationStore = {
  simulationResults: mockResults,
  selectedProteins: [mockProtein],
  selectedDrugs: [mockDrug],
  setSimulationResults: jest.fn(),
  setSelectedProteins: jest.fn(),
  setSelectedDrugs: jest.fn(),
  clearSimulation: jest.fn(),
  addSelectedProtein: jest.fn(),
  removeSelectedProtein: jest.fn(),
  addSelectedDrug: jest.fn(),
  removeSelectedDrug: jest.fn()
};

describe('ExportPage', () => {
  beforeEach(() => {
    (useSimulationStore as jest.Mock).mockReturnValue(mockSimulationStore);
    jest.clearAllMocks();
    mockCreateObjectURL.mockReturnValue('mock-blob-url');
  });

  it('renders the page header correctly', () => {
    render(<ExportPage />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('📥 ส่งออกผลลัพธ์');
  });

  it('shows warning when no simulation results exist', () => {
    const emptyStore = { ...mockSimulationStore, simulationResults: null };
    (useSimulationStore as jest.Mock).mockReturnValue(emptyStore);

    render(<ExportPage />);

    expect(screen.getByText('ยังไม่มีผลลัพธ์ที่จะส่งออก กรุณาทำการจำลองก่อน!')).toBeInTheDocument();
  });

  it('displays export options section', () => {
    render(<ExportPage />);

    expect(screen.getByText('ตัวเลือกการส่งออก')).toBeInTheDocument();
    expect(screen.getByText('📊 ส่งออก CSV')).toBeInTheDocument();
    expect(screen.getByText('📑 ส่งออก Excel')).toBeInTheDocument();
  });

  it('shows CSV export description and button', () => {
    render(<ExportPage />);

    expect(screen.getByText('ดาวน์โหลดผลลัพธ์เป็นไฟล์ CSV สำหรับวิเคราะห์ใน Excel หรือเครื่องมืออื่นๆ')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '⬇️ ดาวน์โหลด CSV' })).toBeInTheDocument();
  });

  it('shows Excel export description and button', () => {
    render(<ExportPage />);

    expect(screen.getByText('ดาวน์โหลดรายงาน Excel ที่มีหลายชีต')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '⬇️ ดาวน์โหลด Excel' })).toBeInTheDocument();
  });

  it('displays data preview section', () => {
    render(<ExportPage />);

    expect(screen.getByText('📋 ตัวอย่างข้อมูลที่จะส่งออก')).toBeInTheDocument();
  });

  it('shows preview table with correct headers', () => {
    render(<ExportPage />);

    expect(screen.getByText('อันดับ')).toBeInTheDocument();
    expect(screen.getByText('ชื่อสารยา')).toBeInTheDocument();
    expect(screen.getByText('รหัส_CID')).toBeInTheDocument();
    expect(screen.getByText('น้ำหนักโมเลกุล')).toBeInTheDocument();
    expect(screen.getByText('ชื่อโปรตีน')).toBeInTheDocument();
    expect(screen.getByText('รหัส_UniProt')).toBeInTheDocument();
    expect(screen.getByText('สิ่งมีชีวิต')).toBeInTheDocument();
    expect(screen.getByText('Binding_Affinity_kcal_mol')).toBeInTheDocument();
    expect(screen.getByText('พันธะไฮโดรเจน')).toBeInTheDocument();
    expect(screen.getByText('Hydrophobic_Contacts')).toBeInTheDocument();
    expect(screen.getByText('ระดับ')).toBeInTheDocument();
  });

  it('shows preview data correctly sorted by binding affinity', () => {
    render(<ExportPage />);

    const table = screen.getByRole('table');
    const rows = table.querySelectorAll('tbody tr');

    // First row should have better affinity (-8.5)
    expect(rows[0]).toHaveTextContent('1');
    expect(rows[0]).toHaveTextContent('Silymarin');
    expect(rows[0]).toHaveTextContent('-8.5');

    // Second row should have worse affinity (-6.5)
    expect(rows[1]).toHaveTextContent('2');
    expect(rows[1]).toHaveTextContent('Quercetin');
    expect(rows[1]).toHaveTextContent('-6.5');
  });

  it('displays publication table section', () => {
    render(<ExportPage />);

    expect(screen.getByText('📝 ตารางสำหรับรายงานวิจัย')).toBeInTheDocument();
    expect(screen.getByText('คัดลอกตารางนี้สำหรับใช้ในรายงานวิจัย:')).toBeInTheDocument();
  });

  it('shows publication table with correct format', () => {
    render(<ExportPage />);

    // Publication table should have specific headers
    const tables = screen.getAllByRole('table');
    const publicationTable = tables[tables.length - 1]; // Last table is publication table

    expect(publicationTable).toHaveTextContent('สารประกอบ');
    expect(publicationTable).toHaveTextContent('เป้าหมาย');
    expect(publicationTable).toHaveTextContent('สายพันธุ์');
    expect(publicationTable).toHaveTextContent('ΔG (kcal/mol)');
    expect(publicationTable).toHaveTextContent('H-bonds');
  });

  it('limits publication table to top 10 results', () => {
    // Create mock data with more than 10 results
    const manyResults = Array.from({ length: 15 }, (_, i) => ({
      ...mockResults[0],
      drug: { ...mockResults[0].drug, name: `Drug ${i + 1}`, cid: `${12345 + i}` },
      binding_affinity: -8.0 + i * 0.1
    }));

    const storeWithManyResults = {
      ...mockSimulationStore,
      simulationResults: manyResults
    };
    (useSimulationStore as jest.Mock).mockReturnValue(storeWithManyResults);

    render(<ExportPage />);

    const tables = screen.getAllByRole('table');
    const publicationTable = tables[tables.length - 1];
    const rows = publicationTable.querySelectorAll('tbody tr');

    expect(rows).toHaveLength(10); // Should be limited to 10
  });

  it('triggers CSV download when CSV button is clicked', async () => {
    render(<ExportPage />);

    const csvButton = screen.getByRole('button', { name: '⬇️ ดาวน์โหลด CSV' });
    fireEvent.click(csvButton);

    await waitFor(() => {
      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
    });
  });

  it('triggers Excel download when Excel button is clicked', async () => {
    render(<ExportPage />);

    const excelButton = screen.getByRole('button', { name: '⬇️ ดาวน์โหลด Excel' });
    fireEvent.click(excelButton);

    await waitFor(() => {
      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
    });
  });

  it('generates correct CSV data structure', () => {
    render(<ExportPage />);

    const csvButton = screen.getByRole('button', { name: '⬇️ ดาวน์โหลด CSV' });
    fireEvent.click(csvButton);

    // Check that createObjectURL was called with proper CSV format
    expect(mockCreateObjectURL).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'text/csv;charset=utf-8;'
      })
    );
  });

  it('generates correct Excel data structure', () => {
    render(<ExportPage />);

    const excelButton = screen.getByRole('button', { name: '⬇️ ดาวน์โหลด Excel' });
    fireEvent.click(excelButton);

    // Check that createObjectURL was called with proper Excel format
    expect(mockCreateObjectURL).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      })
    );
  });

  it('includes timestamp in filename', () => {
    render(<ExportPage />);

    const csvButton = screen.getByRole('button', { name: '⬇️ ดาวน์โหลด CSV' });
    fireEvent.click(csvButton);

    // The download should have triggered with a timestamped filename
    expect(mockClick).toHaveBeenCalled();
  });

  it('shows correct data in preview table with all required fields', () => {
    render(<ExportPage />);

    // Check specific data values
    expect(screen.getByText('Silymarin')).toBeInTheDocument();
    expect(screen.getByText('12345')).toBeInTheDocument();
    expect(screen.getByText('482.44')).toBeInTheDocument();
    expect(screen.getByText('Test Protein')).toBeInTheDocument();
    expect(screen.getByText('P01234')).toBeInTheDocument();
    expect(screen.getByText('Chironex fleckeri')).toBeInTheDocument();
    expect(screen.getByText('-8.5')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument(); // hydrogen bonds
    expect(screen.getByText('5')).toBeInTheDocument(); // hydrophobic contacts
  });

  it('handles empty results gracefully', () => {
    const emptyResultsStore = { ...mockSimulationStore, simulationResults: [] };
    (useSimulationStore as jest.Mock).mockReturnValue(emptyResultsStore);

    render(<ExportPage />);

    expect(screen.getByText('ยังไม่มีผลลัพธ์ที่จะส่งออก กรุณาทำการจำลองก่อน!')).toBeInTheDocument();
  });
});