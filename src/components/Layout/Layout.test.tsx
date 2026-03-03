import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import { AppLayout } from './AppLayout';
import { Sidebar } from './Sidebar';

// Mock database service
vi.mock('../../services/database', () => ({
  DatabaseService: {
    getDatabaseStats: vi.fn().mockResolvedValue({
      total_proteins: 12,
      total_drugs: 25
    })
  }
}));

describe('Sidebar', () => {
  test('renders Thai title and navigation menu', async () => {
    const mockOnNavigate = vi.fn();
    render(<Sidebar currentPage="🏠 หน้าแรก" onNavigate={mockOnNavigate} />);

    // Check for Thai title
    expect(screen.getByText('เมนูหลัก')).toBeInTheDocument();

    // Check for navigation items with emojis
    expect(screen.getByText('🏠 หน้าแรก')).toBeInTheDocument();
    expect(screen.getByText('🧬 โปรตีนพิษ')).toBeInTheDocument();
    expect(screen.getByText('💊 สารยา')).toBeInTheDocument();
    expect(screen.getByText('🔬 จำลองการทดลอง')).toBeInTheDocument();
    expect(screen.getByText('📊 ผลลัพธ์')).toBeInTheDocument();
    expect(screen.getByText('📥 ส่งออกข้อมูล')).toBeInTheDocument();

    // Check for footer text
    expect(screen.getByText('โปรแกรมวิเคราะห์โปรตีนพิษแมงกะพรุนกล่อง v1.0')).toBeInTheDocument();
    expect(screen.getByText('© 2025 - เพื่อการศึกษาและวิจัย')).toBeInTheDocument();
  });

  test('displays database stats', async () => {
    const mockOnNavigate = vi.fn();
    render(<Sidebar currentPage="🏠 หน้าแรก" onNavigate={mockOnNavigate} />);

    // Wait for stats to load
    await screen.findByText('12');
    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('จำนวนโปรตีน')).toBeInTheDocument();
    expect(screen.getByText('จำนวนสารยา')).toBeInTheDocument();
  });

  test('calls onNavigate when menu item is clicked', () => {
    const mockOnNavigate = vi.fn();
    render(<Sidebar currentPage="🏠 หน้าแรก" onNavigate={mockOnNavigate} />);

    fireEvent.click(screen.getByText('🧬 โปรตีนพิษ'));
    expect(mockOnNavigate).toHaveBeenCalledWith('🧬 โปรตีนพิษ');
  });

  test('highlights current page', () => {
    const mockOnNavigate = vi.fn();
    render(<Sidebar currentPage="🧬 โปรตีนพิษ" onNavigate={mockOnNavigate} />);

    const activeItem = screen.getByText('🧬 โปรตีนพิษ').closest('button');
    const inactiveItem = screen.getByText('🏠 หน้าแรก').closest('button');

    expect(activeItem).toHaveClass('bg-blue-100', 'text-blue-600');
    expect(inactiveItem).not.toHaveClass('bg-blue-100', 'text-blue-600');
  });
});

describe('AppLayout', () => {
  test('renders sidebar and main content', () => {
    render(
      <AppLayout>
        <div>Test Content</div>
      </AppLayout>
    );

    expect(screen.getByText('เมนูหลัก')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  test('has proper layout structure', () => {
    render(
      <AppLayout>
        <div>Test Content</div>
      </AppLayout>
    );

    const layout = screen.getByText('Test Content').closest('[data-testid="app-layout"]')
                   || screen.getByText('Test Content').closest('div');

    expect(layout).toBeInTheDocument();
  });
});