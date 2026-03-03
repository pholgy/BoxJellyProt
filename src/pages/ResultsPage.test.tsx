import { render, screen, fireEvent } from '@testing-library/react';
import { ResultsPage } from './ResultsPage';
import { useSimulationStore } from '../stores';
import { DockingResult, Protein, DrugCandidate } from '../types';

// Mock the simulation store
jest.mock('../stores', () => ({
  useSimulationStore: jest.fn()
}));

// Mock Recharts
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="chart-container">{children}</div>,
  BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
  PieChart: ({ children }: { children: React.ReactNode }) => <div data-testid="pie-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  ReferenceLine: () => <div data-testid="reference-line" />
}));

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

describe('ResultsPage', () => {
  beforeEach(() => {
    (useSimulationStore as jest.Mock).mockReturnValue(mockSimulationStore);
    jest.clearAllMocks();
  });

  it('renders the page header correctly', () => {
    render(<ResultsPage />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('📊 ผลลัพธ์การจำลอง');
  });

  it('shows warning when no simulation results exist', () => {
    const emptyStore = { ...mockSimulationStore, simulationResults: null };
    (useSimulationStore as jest.Mock).mockReturnValue(emptyStore);

    render(<ResultsPage />);

    expect(screen.getByText('ยังไม่มีผลลัพธ์การจำลอง กรุณาทำการจำลองก่อน!')).toBeInTheDocument();
  });

  it('displays statistics summary correctly', () => {
    render(<ResultsPage />);

    expect(screen.getByText('📈 สรุปสถิติ')).toBeInTheDocument();
    expect(screen.getByText('จำนวนการจำลองทั้งหมด')).toBeInTheDocument();
    expect(screen.getByText('การจับที่สำเร็จ')).toBeInTheDocument();
    expect(screen.getByText('อัตราความสำเร็จ')).toBeInTheDocument();
    expect(screen.getByText('Affinity ที่ดีที่สุด')).toBeInTheDocument();

    // Check values
    expect(screen.getByText('2')).toBeInTheDocument(); // total simulations
    expect(screen.getByText('1')).toBeInTheDocument(); // successful
    expect(screen.getByText('50.0%')).toBeInTheDocument(); // success rate
    expect(screen.getByText('-8.5 kcal/mol')).toBeInTheDocument(); // best affinity
  });

  it('displays all tabs correctly', () => {
    render(<ResultsPage />);

    expect(screen.getByText('📋 ผลลัพธ์ทั้งหมด')).toBeInTheDocument();
    expect(screen.getByText('📊 กราฟ')).toBeInTheDocument();
    expect(screen.getByText('🏆 10 อันดับแรก')).toBeInTheDocument();
    expect(screen.getByText('🔍 วิเคราะห์')).toBeInTheDocument();
  });

  it('shows results table in first tab', () => {
    render(<ResultsPage />);

    // Check table headers
    expect(screen.getByText('อันดับ')).toBeInTheDocument();
    expect(screen.getByText('สารยา')).toBeInTheDocument();
    expect(screen.getByText('โปรตีน')).toBeInTheDocument();
    expect(screen.getByText('สิ่งมีชีวิต')).toBeInTheDocument();
    expect(screen.getByText('Affinity (kcal/mol)')).toBeInTheDocument();
    expect(screen.getByText('พันธะไฮโดรเจน')).toBeInTheDocument();
    expect(screen.getByText('Hydrophobic')).toBeInTheDocument();
    expect(screen.getByText('ระดับ')).toBeInTheDocument();

    // Check data
    expect(screen.getByText('Silymarin')).toBeInTheDocument();
    expect(screen.getByText('Test Protein')).toBeInTheDocument();
    expect(screen.getByText('Chironex fleckeri')).toBeInTheDocument();
    expect(screen.getByText('-8.5')).toBeInTheDocument();
  });

  it('displays charts in graphs tab', () => {
    render(<ResultsPage />);

    // Click on graphs tab
    const graphsTab = screen.getByText('📊 กราฟ');
    fireEvent.click(graphsTab);

    expect(screen.getByText('การกระจายของค่า Binding Affinity')).toBeInTheDocument();
    expect(screen.getByText('ผลลัพธ์แบ่งตามระดับ')).toBeInTheDocument();
    expect(screen.getByText('แผนที่ความร้อน Binding Affinity')).toBeInTheDocument();

    // Check if chart components are rendered
    expect(screen.getAllByTestId('chart-container')).toHaveLength(3);
  });

  it('shows top 10 results in third tab', () => {
    render(<ResultsPage />);

    // Click on top 10 tab
    const top10Tab = screen.getByText('🏆 10 อันดับแรก');
    fireEvent.click(top10Tab);

    expect(screen.getByText('🏆 10 อันดับผลลัพธ์ที่ดีที่สุด')).toBeInTheDocument();

    // Check if results are displayed with ranking
    expect(screen.getByText(/#1:/)).toBeInTheDocument();
    expect(screen.getByText('Silymarin')).toBeInTheDocument();
    expect(screen.getByText('(-8.5 kcal/mol)')).toBeInTheDocument();
  });

  it('displays analysis in fourth tab', () => {
    render(<ResultsPage />);

    // Click on analysis tab
    const analysisTab = screen.getByText('🔍 วิเคราะห์');
    fireEvent.click(analysisTab);

    expect(screen.getByText('🔍 การวิเคราะห์เชิงลึก')).toBeInTheDocument();
    expect(screen.getByText('ผลลัพธ์แบ่งตามโปรตีน')).toBeInTheDocument();
    expect(screen.getByText('ผลลัพธ์แบ่งตามสารยา')).toBeInTheDocument();
    expect(screen.getByText('สารยาที่ดีที่สุดสำหรับแต่ละโปรตีน')).toBeInTheDocument();
  });

  it('sorts results by binding affinity (best first)', () => {
    render(<ResultsPage />);

    const table = screen.getByRole('table');
    const rows = table.querySelectorAll('tbody tr');

    // First row should have better affinity (-8.5)
    expect(rows[0]).toHaveTextContent('-8.5');
    // Second row should have worse affinity (-6.5)
    expect(rows[1]).toHaveTextContent('-6.5');
  });

  it('shows correct success rate calculation', () => {
    render(<ResultsPage />);

    // With 1 successful out of 2 total, should show 50%
    expect(screen.getByText('50.0%')).toBeInTheDocument();
  });

  it('displays correct ratings for binding affinities', () => {
    render(<ResultsPage />);

    // Check that ratings are displayed
    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();

    // The exact ratings depend on the getRatingThai implementation
    // We're just checking that rating columns exist
    expect(screen.getByText('ระดับ')).toBeInTheDocument();
  });

  it('handles empty results gracefully', () => {
    const emptyResultsStore = { ...mockSimulationStore, simulationResults: [] };
    (useSimulationStore as jest.Mock).mockReturnValue(emptyResultsStore);

    render(<ResultsPage />);

    expect(screen.getByText('0')).toBeInTheDocument(); // total simulations
    expect(screen.getByText('0%')).toBeInTheDocument(); // success rate
  });

  it('shows expandable details in top 10 section', () => {
    render(<ResultsPage />);

    // Click on top 10 tab
    const top10Tab = screen.getByText('🏆 10 อันดับแรก');
    fireEvent.click(top10Tab);

    // Look for expandable content with drug and protein details
    expect(screen.getByText('สูตร:')).toBeInTheDocument();
    expect(screen.getByText('น้ำหนักโมเลกุล:')).toBeInTheDocument();
    expect(screen.getByText('ประเภท:')).toBeInTheDocument();
    expect(screen.getByText('สิ่งมีชีวิต:')).toBeInTheDocument();
    expect(screen.getByText('หน้าที่:')).toBeInTheDocument();
  });
});