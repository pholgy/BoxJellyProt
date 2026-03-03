import React from 'react';
import { Card, Row, Col, Table, Alert, Statistic, Divider, Typography } from 'antd';
import './HomePage.css';

const { Title, Paragraph, Text } = Typography;

export const HomePage: React.FC = () => {
  const workflowColumns = [
    {
      title: 'ขั้นตอน',
      dataIndex: 'step',
      key: 'step',
      width: 80,
    },
    {
      title: 'รายละเอียด',
      dataIndex: 'details',
      key: 'details',
    },
    {
      title: 'เครื่องมือ',
      dataIndex: 'tools',
      key: 'tools',
      width: 150,
    },
  ];

  const workflowData = [
    {
      key: '1',
      step: '1',
      details: 'ค้นหาลำดับกรดอะมิโนของโปรตีนเป้าหมาย',
      tools: 'UniProt',
    },
    {
      key: '2',
      step: '2',
      details: 'สร้างโครงสร้างสามมิติของโปรตีน',
      tools: 'AlphaFold / Swiss-Model',
    },
    {
      key: '3',
      step: '3',
      details: 'หาตำแหน่ง Binding Pocket',
      tools: 'ChimeraX',
    },
    {
      key: '4',
      step: '4',
      details: 'คัดเลือกสารโมเลกุลที่ต้องการทดสอบ',
      tools: 'PubChem / ZINC',
    },
    {
      key: '5',
      step: '5',
      details: 'เตรียมข้อมูลสำหรับการ Docking',
      tools: 'MGLTools',
    },
    {
      key: '6',
      step: '6',
      details: 'ทำการจำลองการจับ (Molecular Docking)',
      tools: 'AutoDock Vina',
    },
    {
      key: '7',
      step: '7',
      details: 'วิเคราะห์ค่า Binding Affinity',
      tools: 'แพลตฟอร์มนี้',
    },
    {
      key: '8',
      step: '8',
      details: 'ส่งออกผลลัพธ์',
      tools: 'CSV / Excel',
    },
  ];

  return (
    <div className="homepage">
      {/* Main Header */}
      <div className="header-section">
        <Title level={1} className="main-header main-header-glow">
          🪼 โปรแกรมวิเคราะห์โครงสร้างโปรตีนในพิษแมงกะพรุนกล่อง
        </Title>
        <Paragraph className="sub-header">
          โดยใช้ฐานข้อมูลชีวสารสนเทศเพื่อการออกแบบยาต้านพิษในอนาคต
        </Paragraph>
      </div>

      {/* Feature Cards */}
      <Row gutter={[24, 24]} className="feature-cards">
        <Col xs={24} md={8}>
          <Card title="🧬 ฐานข้อมูลโปรตีน" size="small">
            <ul>
              <li><strong>12 พิษแมงกะพรุน</strong></li>
              <li>หลายสายพันธุ์</li>
              <li>Chironex fleckeri (แมงกะพรุนกล่อง)</li>
              <li>Nemopilema nomurai (แมงกะพรุนยักษ์)</li>
              <li>และอื่นๆ...</li>
            </ul>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card title="💊 ฐานข้อมูลสารยา" size="small">
            <ul>
              <li><strong>25+ สารยาที่มีศักยภาพ</strong></li>
              <li>ฟลาโวนอยด์</li>
              <li>สารยับยั้ง MMP</li>
              <li>ยาต้านอักเสบ</li>
              <li>สารจากธรรมชาติ</li>
            </ul>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card title="🔬 การจำลอง" size="small">
            <ul>
              <li>Molecular Docking</li>
              <li>Binding Affinity</li>
              <li>การแสดงผล 3 มิติ</li>
              <li>ส่งออกรายงาน</li>
            </ul>
          </Card>
        </Col>
      </Row>

      <Divider />

      {/* Workflow Section */}
      <div className="workflow-section">
        <Title level={2}>📋 ขั้นตอนการวิจัย</Title>

        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <Table
              columns={workflowColumns}
              dataSource={workflowData}
              pagination={false}
              size="small"
              bordered
            />
          </Col>

          <Col xs={24} lg={8}>
            <Alert
              message="เริ่มต้นอย่างรวดเร็ว:"
              description={
                <ol>
                  <li>ไปที่หน้า <strong>จำลองการทดลอง</strong></li>
                  <li>เลือกโปรตีนและสารยา</li>
                  <li>กดปุ่มเริ่มจำลอง</li>
                  <li>ดูผลลัพธ์</li>
                  <li>ส่งออกรายงาน</li>
                </ol>
              }
              type="info"
              showIcon
            />
          </Col>
        </Row>
      </div>

      <Divider />

      {/* Featured Results */}
      <div className="featured-results">
        <Title level={2}>🏆 ผลการค้นพบที่น่าสนใจ</Title>

        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} md={8}>
            <div className="featured-metric">
              <Statistic
                title="สารยับยั้งที่ดีที่สุด"
                value="Silymarin"
                suffix={
                  <div>
                    <div className="binding-affinity">-9.5 kcal/mol</div>
                    <Text type="secondary" className="target-protein">
                      ต่อ NnV-Mlp (Metalloproteinase)
                    </Text>
                  </div>
                }
              />
            </div>
          </Col>

          <Col xs={24} md={16}>
            <Paragraph>
              <strong>Silymarin</strong> จากต้นมิลค์ทิสเซิล แสดงค่า Binding Affinity ที่ดีเยี่ยม
              ต่อพิษ metalloproteinase ของแมงกะพรุน สารฟลาโวนอยด์ธรรมชาตินี้
              ได้รับการยืนยันจากงานวิจัยที่ตีพิมพ์แล้ว
            </Paragraph>
            <Paragraph className="reference">
              <em>อ้างอิง: MDPI Int. J. Mol. Sci. 2023, 24(10), 8972</em>
            </Paragraph>
          </Col>
        </Row>
      </div>
    </div>
  );
};