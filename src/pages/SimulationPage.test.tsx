import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SimulationPage } from './SimulationPage';
import { useDatabaseStore, useSimulationStore } from '../stores';
import { Protein, DrugCandidate } from '../types';

// Mock the stores
jest.mock('../stores', () => ({
  useDatabaseStore: jest.fn(),
  useSimulationStore: jest.fn()
}));

// Mock the simulation service
jest.mock('../services/simulation', () => ({
  runBatchDockingSimulation: jest.fn(),
  getRatingThai: jest.fn((affinity) => {
    if (affinity <= -9.0) return "ดีเยี่ยม";
    if (affinity <= -7.0) return "ดี";
    return "ปานกลาง";
  })
}));

const mockProteins: Protein[] = [
  {
    uniprot_id: 'P01234',
    name: 'Test Protein 1',
    organism: 'Chironex fleckeri',
    sequence: 'MKLLVVL...',
    length: 172,
    function: 'Cytolytic toxin',
    pdb_id: '1DFN',
    toxin_type: 'Cytotoxin',
    molecular_weight: 19235.2
  },
  {
    uniprot_id: 'P56789',
    name: 'Test Protein 2',
    organism: 'Chiropsalmus quadrigatus',
    sequence: 'MTLLLVL...',
    length: 175,
    function: 'Metalloproteinase',
    pdb_id: '2ABC',
    toxin_type: 'Enzyme',
    molecular_weight: 20123.5
  }
];

const mockDrugs: DrugCandidate[] = [
  {
    cid: '12345',
    name: 'Silymarin',
    molecular_formula: 'C25H22O10',
    molecular_weight: 482.44,
    smiles: 'COC1=CC...',
    category: 'Flavonoid',
    mechanism: 'Antioxidant',
    source: 'Natural'
  },
  {
    cid: '67890',
    name: 'Quercetin',
    molecular_formula: 'C15H10O7',
    molecular_weight: 302.24,
    smiles: 'C1=CC...',
    category: 'Flavonoid',
    mechanism: 'Anti-inflammatory',
    source: 'Natural'
  }
];

const mockDatabaseStore = {
  proteins: mockProteins,
  drugs: mockDrugs,
  stats: { total_proteins: 2, total_drugs: 2 },
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

const mockSimulationStore = {
  simulationResults: null,
  selectedProteins: [],
  selectedDrugs: [],
  setSimulationResults: jest.fn(),
  setSelectedProteins: jest.fn(),
  setSelectedDrugs: jest.fn(),
  clearSimulation: jest.fn(),
  addSelectedProtein: jest.fn(),
  removeSelectedProtein: jest.fn(),
  addSelectedDrug: jest.fn(),
  removeSelectedDrug: jest.fn()
};

describe('SimulationPage', () => {
  beforeEach(() => {
    (useDatabaseStore as jest.Mock).mockReturnValue(mockDatabaseStore);
    (useSimulationStore as jest.Mock).mockReturnValue(mockSimulationStore);
    jest.clearAllMocks();
  });

  it('renders the page header correctly', () => {
    render(<SimulationPage />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('🔬 การจำลอง Molecular Docking');
  });

  it('displays protein selection section', () => {
    render(<SimulationPage />);

    expect(screen.getByText('เลือกโปรตีนเป้าหมาย')).toBeInTheDocument();
    expect(screen.getByLabelText('เลือกทุกโปรตีน')).toBeInTheDocument();
    expect(screen.getByLabelText('เลือกโปรตีน')).toBeInTheDocument();
  });

  it('displays drug selection section', () => {
    render(<SimulationPage />);

    expect(screen.getByText('เลือกสารยาที่ต้องการทดสอบ')).toBeInTheDocument();
    expect(screen.getByLabelText('เลือกทุกสารยา')).toBeInTheDocument();
    expect(screen.getByLabelText('เลือกสารยา')).toBeInTheDocument();
  });

  it('displays simulation settings section', () => {
    render(<SimulationPage />);

    expect(screen.getByText('⚙️ ตั้งค่าการจำลอง')).toBeInTheDocument();
    expect(screen.getByLabelText('ความละเอียด (Exhaustiveness)')).toBeInTheDocument();
    expect(screen.getByLabelText('จำนวน poses')).toBeInTheDocument();
    expect(screen.getByLabelText('Random seed')).toBeInTheDocument();
  });

  it('shows protein count when proteins are selected', () => {
    const storeWithSelection = {
      ...mockSimulationStore,
      selectedProteins: [mockProteins[0]]
    };
    (useSimulationStore as jest.Mock).mockReturnValue(storeWithSelection);

    render(<SimulationPage />);

    expect(screen.getByText('เลือกแล้ว: 1 โปรตีน')).toBeInTheDocument();
  });

  it('shows drug count when drugs are selected', () => {
    const storeWithSelection = {
      ...mockSimulationStore,
      selectedDrugs: [mockDrugs[0]]
    };
    (useSimulationStore as jest.Mock).mockReturnValue(storeWithSelection);

    render(<SimulationPage />);

    expect(screen.getByText('เลือกแล้ว: 1 สารยา')).toBeInTheDocument();
  });

  it('selects all proteins when checkbox is clicked', () => {
    render(<SimulationPage />);

    const selectAllCheckbox = screen.getByLabelText('เลือกทุกโปรตีน');
    fireEvent.click(selectAllCheckbox);

    expect(mockSimulationStore.setSelectedProteins).toHaveBeenCalledWith(mockProteins);
  });

  it('selects all drugs when checkbox is clicked', () => {
    render(<SimulationPage />);

    const selectAllCheckbox = screen.getByLabelText('เลือกทุกสารยา');
    fireEvent.click(selectAllCheckbox);

    expect(mockSimulationStore.setSelectedDrugs).toHaveBeenCalledWith(mockDrugs);
  });

  it('updates exhaustiveness setting', () => {
    render(<SimulationPage />);

    const exhaustivenessSlider = screen.getByLabelText('ความละเอียด (Exhaustiveness)');
    fireEvent.change(exhaustivenessSlider, { target: { value: '16' } });

    expect(exhaustivenessSlider).toHaveValue('16');
  });

  it('updates poses setting', () => {
    render(<SimulationPage />);

    const posesSlider = screen.getByLabelText('จำนวน poses');
    fireEvent.change(posesSlider, { target: { value: '15' } });

    expect(posesSlider).toHaveValue('15');
  });

  it('updates random seed setting', () => {
    render(<SimulationPage />);

    const seedInput = screen.getByLabelText('Random seed');
    fireEvent.change(seedInput, { target: { value: '123' } });

    expect(seedInput).toHaveValue(123);
  });

  it('displays simulation button', () => {
    render(<SimulationPage />);

    expect(screen.getByRole('button', { name: '🚀 เริ่มการจำลอง' })).toBeInTheDocument();
  });

  it('shows error when no proteins or drugs selected', async () => {
    render(<SimulationPage />);

    const simulationButton = screen.getByRole('button', { name: '🚀 เริ่มการจำลอง' });
    fireEvent.click(simulationButton);

    await waitFor(() => {
      expect(screen.getByText('กรุณาเลือกอย่างน้อย 1 โปรตีน และ 1 สารยา!')).toBeInTheDocument();
    });
  });

  it('runs simulation when proteins and drugs are selected', async () => {
    const storeWithSelection = {
      ...mockSimulationStore,
      selectedProteins: [mockProteins[0]],
      selectedDrugs: [mockDrugs[0]]
    };
    (useSimulationStore as jest.Mock).mockReturnValue(storeWithSelection);

    // Mock successful simulation
    const { runBatchDockingSimulation } = require('../services/simulation');
    const mockResults = [
      {
        protein: mockProteins[0],
        drug: mockDrugs[0],
        pocket: { druggability_score: 0.8 },
        binding_affinity: -8.5,
        hydrogen_bonds: 3,
        hydrophobic_contacts: 5,
        is_successful: true
      }
    ];
    runBatchDockingSimulation.mockResolvedValue(mockResults);

    render(<SimulationPage />);

    const simulationButton = screen.getByRole('button', { name: '🚀 เริ่มการจำลอง' });
    fireEvent.click(simulationButton);

    await waitFor(() => {
      expect(screen.getByText(/การจำลองเสร็จสิ้น/)).toBeInTheDocument();
    });

    expect(runBatchDockingSimulation).toHaveBeenCalledWith(
      [mockProteins[0]],
      [mockDrugs[0]],
      42 // default random seed
    );
    expect(mockSimulationStore.setSimulationResults).toHaveBeenCalledWith(mockResults);
  });

  it('shows simulation progress', async () => {
    const storeWithSelection = {
      ...mockSimulationStore,
      selectedProteins: mockProteins,
      selectedDrugs: mockDrugs
    };
    (useSimulationStore as jest.Mock).mockReturnValue(storeWithSelection);

    render(<SimulationPage />);

    const simulationButton = screen.getByRole('button', { name: '🚀 เริ่มการจำลอง' });
    fireEvent.click(simulationButton);

    expect(screen.getByText(/กำลังจำลอง \d+ การทดลอง/)).toBeInTheDocument();
  });

  it('displays preview results after simulation', async () => {
    const storeWithSelection = {
      ...mockSimulationStore,
      selectedProteins: [mockProteins[0]],
      selectedDrugs: [mockDrugs[0]]
    };
    (useSimulationStore as jest.Mock).mockReturnValue(storeWithSelection);

    const { runBatchDockingSimulation } = require('../services/simulation');
    const mockResults = [
      {
        protein: mockProteins[0],
        drug: mockDrugs[0],
        pocket: { druggability_score: 0.8 },
        binding_affinity: -8.5,
        hydrogen_bonds: 3,
        hydrophobic_contacts: 5,
        is_successful: true
      }
    ];
    runBatchDockingSimulation.mockResolvedValue(mockResults);

    render(<SimulationPage />);

    const simulationButton = screen.getByRole('button', { name: '🚀 เริ่มการจำลอง' });
    fireEvent.click(simulationButton);

    await waitFor(() => {
      expect(screen.getByText('ตัวอย่างผลลัพธ์')).toBeInTheDocument();
      expect(screen.getByText('ไปที่หน้า **ผลลัพธ์** เพื่อดูรายละเอียดเพิ่มเติม!')).toBeInTheDocument();
    });
  });

  it('loads data when component mounts', () => {
    render(<SimulationPage />);

    expect(mockDatabaseStore.loadData).toHaveBeenCalledTimes(1);
  });

  it('shows loading state when data is loading', () => {
    const loadingStore = { ...mockDatabaseStore, isLoading: true };
    (useDatabaseStore as jest.Mock).mockReturnValue(loadingStore);

    render(<SimulationPage />);

    expect(screen.getByText('กำลังโหลดข้อมูล...')).toBeInTheDocument();
  });

  it('displays default simulation parameters correctly', () => {
    render(<SimulationPage />);

    const exhaustivenessSlider = screen.getByLabelText('ความละเอียด (Exhaustiveness)');
    const posesSlider = screen.getByLabelText('จำนวน poses');
    const seedInput = screen.getByLabelText('Random seed');

    expect(exhaustivenessSlider).toHaveValue('8');
    expect(posesSlider).toHaveValue('9');
    expect(seedInput).toHaveValue(42);
  });
});