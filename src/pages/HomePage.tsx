import React from 'react';
import { Card, Row, Col, Table, Alert, Statistic, Divider, Typography } from 'antd';
import { motion } from 'framer-motion';
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
      <header className="header-section">
        <Title level={1} className="main-header">
          <motion.span
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            style={{ display: 'inline-block' }}
          >🪼</motion.span>{' '}{t('home.title').replace(/^🪼\s*/, '')}
        </Title>
        <Paragraph className="sub-header">
          {t('home.subtitle')}
        </Paragraph>
      </header>

      {/* Feature Cards */}
      <Row gutter={[24, 24]} className="feature-cards">
        <Col xs={24} md={8}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 * 0.15, duration: 0.5 }}
            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
          >
            <Card title={t('home.proteinDbTitle')} size="small">
              <ul role="list">
                {proteinDbItems.map((item, index) => (
                  <li key={index}>
                    {index === 0 ? <strong>{item}</strong> : item}
                  </li>
                ))}
              </ul>
            </Card>
          </motion.div>
        </Col>

        <Col xs={24} md={8}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 * 0.15, duration: 0.5 }}
            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
          >
            <Card title={t('home.drugDbTitle')} size="small">
              <ul role="list">
                {drugDbItems.map((item, index) => (
                  <li key={index}>
                    {index === 0 ? <strong>{item}</strong> : item}
                  </li>
                ))}
              </ul>
            </Card>
          </motion.div>
        </Col>

        <Col xs={24} md={8}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2 * 0.15, duration: 0.5 }}
            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
          >
            <Card title={t('home.simulationTitle')} size="small">
              <ul role="list">
                {simulationItems.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </Card>
          </motion.div>
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
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
            >
              <Alert
                message={t('home.quickStart')}
                description={
                  <ol>
                    {quickStartSteps.map((step, index) => {
                      const stepEmojis = ['\uD83D\uDD2C', '\u26A1', '\uD83D\uDCCA', '\uD83E\uDDEA', '\uD83D\uDCE4'];
                      const emoji = stepEmojis[index] || '\u2728';
                      return (
                        <li key={index}>
                          <motion.span
                            style={{ display: 'inline-block', cursor: 'default' }}
                            whileHover={{ rotate: [0, -10, 10, -10, 0], transition: { duration: 0.4 } }}
                          >{emoji}</motion.span>{' '}
                          {index === 0 ? (
                            (() => {
                              const match = step.match(/(จำลองการทดลอง|Simulation)/);
                              if (match && match.index !== undefined) {
                                const before = step.slice(0, match.index);
                                const matched = match[1];
                                const after = step.slice(match.index + matched.length);
                                return <>{before}<strong>{matched}</strong>{after}</>;
                              }
                              return step;
                            })()
                          ) : (
                            step
                          )}
                        </li>
                      );
                    })}
                  </ol>
                }
                type="info"
                showIcon
              />
            </motion.div>
          </Col>
        </Row>
      </div>

      <Divider />

      {/* Featured Results */}
      <div className="featured-results">
        <Title level={2}>{t('home.featuredTitle')}</Title>

        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} md={8}>
            <motion.div
              className="featured-metric"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
            >
              <Statistic
                title={t('home.bestInhibitor')}
                value="Silymarin"
                suffix={
                  <span style={{ display: 'block' }}>
                    <motion.span
                      style={{ display: 'block' }}
                      className="binding-affinity"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6, duration: 0.4 }}
                    >-9.5 kcal/mol</motion.span>
                    <Text type="secondary" className="target-protein">
                      {t('home.targetProtein')}
                    </Text>
                  </span>
                }
              />
            </motion.div>
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
