import { render, screen } from '@testing-library/react';
import { HomePage } from './HomePage';

describe('HomePage', () => {
  test('renders main header and workflow sections', () => {
    render(<HomePage />);
    expect(screen.getByText(/โปรแกรมวิเคราะห์โครงสร้างโปรตีนในพิษแมงกะพรุนกล่อง/)).toBeInTheDocument();
    expect(screen.getByText('ฐานข้อมูลโปรตีน')).toBeInTheDocument();
  });

  test('renders all three feature cards', () => {
    render(<HomePage />);

    // Check feature card titles
    expect(screen.getByText('🧬 ฐานข้อมูลโปรตีน')).toBeInTheDocument();
    expect(screen.getByText('💊 ฐานข้อมูลสารยา')).toBeInTheDocument();
    expect(screen.getByText('🔬 การจำลอง')).toBeInTheDocument();

    // Check some feature content
    expect(screen.getByText('12 พิษแมงกะพรุน')).toBeInTheDocument();
    expect(screen.getByText('25+ สารยาที่มีศักยภาพ')).toBeInTheDocument();
    expect(screen.getByText('Molecular Docking')).toBeInTheDocument();
  });

  test('renders workflow table with all 8 steps', () => {
    render(<HomePage />);

    // Check workflow section title
    expect(screen.getByText('📋 ขั้นตอนการวิจัย')).toBeInTheDocument();

    // Check some workflow steps
    expect(screen.getByText(/ค้นหาลำดับกรดอะมิโนของโปรตีนเป้าหมาย/)).toBeInTheDocument();
    expect(screen.getByText(/ทำการจำลองการจับ \(Molecular Docking\)/)).toBeInTheDocument();
    expect(screen.getByText(/ส่งออกผลลัพธ์/)).toBeInTheDocument();
  });

  test('renders quick start guide', () => {
    render(<HomePage />);

    expect(screen.getByText('เริ่มต้นอย่างรวดเร็ว:')).toBeInTheDocument();
    expect(screen.getByText(/ไปที่หน้า.*จำลองการทดลอง/)).toBeInTheDocument();
    expect(screen.getByText('ส่งออกรายงาน')).toBeInTheDocument();
  });

  test('renders featured results section', () => {
    render(<HomePage />);

    // Check featured results title
    expect(screen.getByText('🏆 ผลการค้นพบที่น่าสนใจ')).toBeInTheDocument();

    // Check Silymarin metric and description
    expect(screen.getByText('สารยับยั้งที่ดีที่สุด')).toBeInTheDocument();
    expect(screen.getByText('Silymarin')).toBeInTheDocument();
    expect(screen.getByText('-9.5 kcal/mol')).toBeInTheDocument();
    expect(screen.getByText('ต่อ NnV-Mlp (Metalloproteinase)')).toBeInTheDocument();

    // Check description text
    expect(screen.getByText(/Silymarin.*จากต้นมิลค์ทิสเซิล/)).toBeInTheDocument();
    expect(screen.getByText(/MDPI Int. J. Mol. Sci. 2023, 24\(10\), 8972/)).toBeInTheDocument();
  });
});