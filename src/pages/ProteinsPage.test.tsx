import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProteinsPage } from './ProteinsPage';
import { useDatabaseStore } from '../stores';
import { Protein } from '../types';

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
  Box: () => <mesh data-testid="protein-structure" />,
  Text: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

const mockProteins: Protein[] = [
  {
    uniprot_id: 'P01234',
    name: 'Test Protein 1',
    organism: 'Chironex fleckeri',
    sequence: 'MKLLVVLSVLLLTVAAFATCVLDDDGLKCVTVLKNRGPIDLNLQCFCKKLCVNLRRGTTKRCAPSCQCQTQDVFSDGFGDVFQMAASNQAKDVKTFVDKTLMKNLNFIGDKLMKGDSHPQDQLRHLILNSRSIGFQTMQNLLDSKDMTTLDAEAVLQRILNELEQKKLVDRLLALIDSLKFEQMLKTGNMKHQR',
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
    sequence: 'MTLLLVLSVLLLTVAAFATCVLDDDGLKCVTVLKNRGPIDLNLQCFCKKLCVNLRRGTTKRCAPSCQCQTQDVFSDGFGDVFQMAASNQAKDVKTFVDKTLMKNLNFIGDKLMKGDSHPQDQLRHLILNSRSIGFQTMQNLLDSKDMTTLDAEAVLQRILNELEQKKLVDRLLALIDSLKFEQMLKTGNMKHQR',
    length: 175,
    function: 'Metalloproteinase',
    pdb_id: '2ABC',
    toxin_type: 'Enzyme',
    molecular_weight: 20123.5
  }
];

const mockDatabaseStore = {
  proteins: mockProteins,
  drugs: [],
  stats: { total_proteins: 2, total_drugs: 0 },
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

describe('ProteinsPage', () => {
  beforeEach(() => {
    (useDatabaseStore as jest.Mock).mockReturnValue(mockDatabaseStore);
    jest.clearAllMocks();
  });

  it('renders the page header correctly', () => {
    render(<ProteinsPage />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('🧬 ฐานข้อมูลโปรตีนพิษแมงกะพรุน');
  });

  it('displays organism filter options', () => {
    render(<ProteinsPage />);

    const organismSelect = screen.getByLabelText('กรองตามสิ่งมีชีวิต');
    expect(organismSelect).toBeInTheDocument();

    fireEvent.click(organismSelect);
    expect(screen.getByText('ทั้งหมด')).toBeInTheDocument();
    expect(screen.getByText('Chironex fleckeri')).toBeInTheDocument();
    expect(screen.getByText('Chiropsalmus quadrigatus')).toBeInTheDocument();
  });

  it('displays toxin type filter options', () => {
    render(<ProteinsPage />);

    const toxinSelect = screen.getByLabelText('กรองตามชนิดพิษ');
    expect(toxinSelect).toBeInTheDocument();

    fireEvent.click(toxinSelect);
    expect(screen.getByText('ทั้งหมด')).toBeInTheDocument();
    expect(screen.getByText('Cytotoxin')).toBeInTheDocument();
    expect(screen.getByText('Enzyme')).toBeInTheDocument();
  });

  it('filters proteins by organism correctly', async () => {
    render(<ProteinsPage />);

    const organismSelect = screen.getByLabelText('กรองตามสิ่งมีชีวิต');
    fireEvent.change(organismSelect, { target: { value: 'Chironex fleckeri' } });

    await waitFor(() => {
      expect(screen.getByText('พบ 1 โปรตีน')).toBeInTheDocument();
      expect(screen.getByText('Test Protein 1')).toBeInTheDocument();
      expect(screen.queryByText('Test Protein 2')).not.toBeInTheDocument();
    });
  });

  it('filters proteins by toxin type correctly', async () => {
    render(<ProteinsPage />);

    const toxinSelect = screen.getByLabelText('กรองตามชนิดพิษ');
    fireEvent.change(toxinSelect, { target: { value: 'Enzyme' } });

    await waitFor(() => {
      expect(screen.getByText('พบ 1 โปรตีน')).toBeInTheDocument();
      expect(screen.getByText('Test Protein 2')).toBeInTheDocument();
      expect(screen.queryByText('Test Protein 1')).not.toBeInTheDocument();
    });
  });

  it('displays protein cards with correct information', () => {
    render(<ProteinsPage />);

    // Check if protein information is displayed
    expect(screen.getByText('Test Protein 1')).toBeInTheDocument();
    expect(screen.getByText('P01234')).toBeInTheDocument();
    expect(screen.getByText('Chironex fleckeri')).toBeInTheDocument();
    expect(screen.getByText('Cytolytic toxin')).toBeInTheDocument();
    expect(screen.getByText('172 กรดอะมิโน')).toBeInTheDocument();
    expect(screen.getByText('19,235 Da')).toBeInTheDocument();
  });

  it('toggles sequence display when checkbox is clicked', async () => {
    render(<ProteinsPage />);

    // Click on protein card to expand
    const proteinCard = screen.getByText('Test Protein 1').closest('div');
    fireEvent.click(proteinCard!);

    // Find and click sequence toggle
    const sequenceCheckbox = screen.getByLabelText('แสดงลำดับกรดอะมิโน');
    fireEvent.click(sequenceCheckbox);

    await waitFor(() => {
      expect(screen.getByText(/MKLLVVLSVLLLTVAAFATCV/)).toBeInTheDocument();
    });

    // Click again to hide sequence
    fireEvent.click(sequenceCheckbox);

    await waitFor(() => {
      expect(screen.queryByText(/MKLLVVLSVLLLTVAAFATCV/)).not.toBeInTheDocument();
    });
  });

  it('displays 3D protein visualization', () => {
    render(<ProteinsPage />);

    // Click on protein card to expand
    const proteinCard = screen.getByText('Test Protein 1').closest('div');
    fireEvent.click(proteinCard!);

    expect(screen.getByTestId('3d-canvas')).toBeInTheDocument();
    expect(screen.getByTestId('protein-structure')).toBeInTheDocument();
  });

  it('loads data when component mounts', () => {
    render(<ProteinsPage />);

    expect(mockDatabaseStore.loadData).toHaveBeenCalledTimes(1);
  });

  it('shows loading state when data is loading', () => {
    const loadingStore = { ...mockDatabaseStore, isLoading: true };
    (useDatabaseStore as jest.Mock).mockReturnValue(loadingStore);

    render(<ProteinsPage />);

    expect(screen.getByText('กำลังโหลดข้อมูล...')).toBeInTheDocument();
  });

  it('displays all proteins when no filter is applied', () => {
    render(<ProteinsPage />);

    expect(screen.getByText('พบ 2 โปรตีน')).toBeInTheDocument();
    expect(screen.getByText('Test Protein 1')).toBeInTheDocument();
    expect(screen.getByText('Test Protein 2')).toBeInTheDocument();
  });

  it('applies combined filters correctly', async () => {
    render(<ProteinsPage />);

    // Apply organism filter
    const organismSelect = screen.getByLabelText('กรองตามสิ่งมีชีวิต');
    fireEvent.change(organismSelect, { target: { value: 'Chironex fleckeri' } });

    // Apply toxin type filter
    const toxinSelect = screen.getByLabelText('กรองตามชนิดพิษ');
    fireEvent.change(toxinSelect, { target: { value: 'Cytotoxin' } });

    await waitFor(() => {
      expect(screen.getByText('พบ 1 โปรตีน')).toBeInTheDocument();
      expect(screen.getByText('Test Protein 1')).toBeInTheDocument();
      expect(screen.queryByText('Test Protein 2')).not.toBeInTheDocument();
    });
  });

  it('shows correct structure title in 3D view', () => {
    render(<ProteinsPage />);

    // Click on protein card to expand
    const proteinCard = screen.getByText('Test Protein 1').closest('div');
    fireEvent.click(proteinCard!);

    expect(screen.getByText('โครงสร้าง 3 มิติ (จำลอง Alpha Helix):')).toBeInTheDocument();
  });
});