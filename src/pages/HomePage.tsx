import React from 'react';
import { Card, Row, Col, Table, Alert, Statistic, Divider, Typography } from 'antd';
import { useLanguage } from '../i18n';
import './HomePage.css';

const { Title, Paragraph, Text } = Typography;

export const HomePage: React.FC = () => {
  const { t, tArray, tWorkflow } = useLanguage();

  const workflowColumns = [
    {
      title: t('home.workflowColumns.step'),
      dataIndex: 'step',
      key: 'step',
      width: 80,
    },
    {
      title: t('home.workflowColumns.details'),
      dataIndex: 'details',
      key: 'details',
    },
    {
      title: t('home.workflowColumns.tools'),
      dataIndex: 'tools',
      key: 'tools',
      width: 150,
    },
  ];

  const workflowData = tWorkflow('home.workflowSteps').map((row, index) => ({
    key: String(index + 1),
    step: row.step,
    details: row.details,
    tools: row.tools,
  }));

  const proteinDbItems = tArray('home.proteinDbItems');
  const drugDbItems = tArray('home.drugDbItems');
  const simulationItems = tArray('home.simulationItems');
  const quickStartSteps = tArray('home.quickStartSteps');

  return (
    <div className="homepage">
      {/* Main Header */}
      <div className="header-section">
        <Title level={1} className="main-header">
          {t('home.title')}
        </Title>
        <Paragraph className="sub-header">
          {t('home.subtitle')}
        </Paragraph>
      </div>

      {/* Feature Cards */}
      <Row gutter={[24, 24]} className="feature-cards">
        <Col xs={24} md={8}>
          <Card title={t('home.proteinDbTitle')} size="small">
            <ul>
              {proteinDbItems.map((item, index) => (
                <li key={index}>
                  {index === 0 ? <strong>{item}</strong> : item}
                </li>
              ))}
            </ul>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card title={t('home.drugDbTitle')} size="small">
            <ul>
              {drugDbItems.map((item, index) => (
                <li key={index}>
                  {index === 0 ? <strong>{item}</strong> : item}
                </li>
              ))}
            </ul>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card title={t('home.simulationTitle')} size="small">
            <ul>
              {simulationItems.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </Card>
        </Col>
      </Row>

      <Divider />

      {/* Workflow Section */}
      <div className="workflow-section">
        <Title level={2}>{t('home.workflowTitle')}</Title>

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
              message={t('home.quickStart')}
              description={
                <ol>
                  {quickStartSteps.map((step, index) => (
                    <li key={index}>
                      {index === 0 ? (
                        <span dangerouslySetInnerHTML={{
                          __html: step.replace(
                            /(จำลองการทดลอง|Simulation)/,
                            '<strong>$1</strong>'
                          ),
                        }} />
                      ) : (
                        step
                      )}
                    </li>
                  ))}
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
        <Title level={2}>{t('home.featuredTitle')}</Title>

        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} md={8}>
            <div className="featured-metric">
              <Statistic
                title={t('home.bestInhibitor')}
                value="Silymarin"
                suffix={
                  <div>
                    <div className="binding-affinity">-9.5 kcal/mol</div>
                    <Text type="secondary" className="target-protein">
                      {t('home.targetProtein')}
                    </Text>
                  </div>
                }
              />
            </div>
          </Col>

          <Col xs={24} md={16}>
            <Paragraph>
              {t('home.featuredDescription')}
            </Paragraph>
            <Paragraph className="reference">
              <em>{t('home.reference')}</em>
            </Paragraph>
          </Col>
        </Row>
      </div>
    </div>
  );
};
