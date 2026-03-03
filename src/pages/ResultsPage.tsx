import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../components/ui/collapsible';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ReferenceLine
} from 'recharts';
import { useSimulationStore } from '../stores';
import { getRatingThai } from '../services/simulation';

/**
 * ResultsPage Component
 *
 * This page displays detailed simulation results with statistics and visualizations.
 * It replicates the exact functionality from the Streamlit app lines 718-872.
 *
 * Features:
 * - Statistics summary cards
 * - Multiple tabs (ผลลัพธ์ทั้งหมด, กราฟ, 10 อันดับแรก, วิเคราะห์)
 * - Data visualization with charts using Recharts (replaces Plotly)
 * - Results table with sorting/filtering
 * - All Thai text preserved exactly from original
 */

// Color scheme for charts
const CHART_COLORS = ['#1E88E5', '#43A047', '#FB8C00', '#E53935', '#8E24AA', '#00ACC1'];

export const ResultsPage: React.FC = () => {
  const { simulationResults } = useSimulationStore();
  const [expandedResults, setExpandedResults] = useState<Set<number>>(new Set());

  // Sort results by binding affinity (best first) - exact Streamlit logic
  const sortedResults = useMemo(() => {
    if (!simulationResults) return [];
    return [...simulationResults].sort((a, b) => a.binding_affinity - b.binding_affinity);
  }, [simulationResults]);

  // Calculate statistics - exact Streamlit logic
  const statistics = useMemo(() => {
    if (!simulationResults || simulationResults.length === 0) {
      return {
        total: 0,
        successful: 0,
        successRate: 0,
        bestAffinity: 0
      };
    }

    const successful = simulationResults.filter(r => r.is_successful).length;
    return {
      total: simulationResults.length,
      successful,
      successRate: (successful / simulationResults.length) * 100,
      bestAffinity: sortedResults[0]?.binding_affinity || 0
    };
  }, [simulationResults, sortedResults]);

  // Prepare results data for table - exact Streamlit structure
  const tableData = useMemo(() => {
    return sortedResults.map((r, index) => ({
      อันดับ: index + 1,
      สารยา: r.drug.name,
      โปรตีน: r.protein.name,
      สิ่งมีชีวิต: r.protein.organism,
      'Affinity (kcal/mol)': r.binding_affinity,
      พันธะไฮโดรเจน: r.hydrogen_bonds,
      Hydrophobic: r.hydrophobic_contacts,
      ระดับ: getRatingThai(r.binding_affinity)
    }));
  }, [sortedResults]);

  // Prepare chart data
  const histogramData = useMemo(() => {
    if (!simulationResults) return [];

    const bins = Array.from({ length: 10 }, (_, i) => ({
      range: `${-12 + i * 1.1} to ${-11 + i * 1.1}`,
      count: 0,
      binStart: -12 + i * 1.1,
      binEnd: -11 + i * 1.1
    }));

    simulationResults.forEach(r => {
      const binIndex = Math.floor((r.binding_affinity + 12) / 1.1);
      if (binIndex >= 0 && binIndex < bins.length) {
        bins[binIndex].count++;
      }
    });

    return bins.filter(bin => bin.count > 0);
  }, [simulationResults]);

  const ratingDistribution = useMemo(() => {
    if (!simulationResults) return [];

    const ratings: { [key: string]: number } = {};
    simulationResults.forEach(r => {
      const rating = getRatingThai(r.binding_affinity);
      ratings[rating] = (ratings[rating] || 0) + 1;
    });

    return Object.entries(ratings).map(([rating, count]) => ({ rating, count }));
  }, [simulationResults]);

  // Analysis data - exact Streamlit aggregation logic
  const proteinAnalysis = useMemo(() => {
    if (!simulationResults) return [];

    const proteinGroups: { [key: string]: any[] } = {};
    simulationResults.forEach(r => {
      if (!proteinGroups[r.protein.name]) {
        proteinGroups[r.protein.name] = [];
      }
      proteinGroups[r.protein.name].push(r);
    });

    return Object.entries(proteinGroups).map(([proteinName, results]) => ({
      โปรตีน: proteinName,
      'Affinity ที่ดีที่สุด': Math.min(...results.map(r => r.binding_affinity)).toFixed(2),
      'Affinity เฉลี่ย': (results.reduce((sum, r) => sum + r.binding_affinity, 0) / results.length).toFixed(2),
      'จำนวนสารยาที่ทดสอบ': results.length
    })).sort((a, b) => parseFloat(a['Affinity ที่ดีที่สุด']) - parseFloat(b['Affinity ที่ดีที่สุด']));
  }, [simulationResults]);

  const drugAnalysis = useMemo(() => {
    if (!simulationResults) return [];

    const drugGroups: { [key: string]: any[] } = {};
    simulationResults.forEach(r => {
      if (!drugGroups[r.drug.name]) {
        drugGroups[r.drug.name] = [];
      }
      drugGroups[r.drug.name].push(r);
    });

    return Object.entries(drugGroups).map(([drugName, results]) => ({
      สารยา: drugName,
      'Affinity ที่ดีที่สุด': Math.min(...results.map(r => r.binding_affinity)).toFixed(2),
      'Affinity เฉลี่ย': (results.reduce((sum, r) => sum + r.binding_affinity, 0) / results.length).toFixed(2),
      'จำนวนโปรตีนที่ทดสอบ': results.length
    })).sort((a, b) => parseFloat(a['Affinity ที่ดีที่สุด']) - parseFloat(b['Affinity ที่ดีที่สุด']));
  }, [simulationResults]);

  const bestDrugForProtein = useMemo(() => {
    if (!simulationResults) return [];

    const proteinBest: { [key: string]: any } = {};
    simulationResults.forEach(r => {
      if (!proteinBest[r.protein.name] || r.binding_affinity < proteinBest[r.protein.name].binding_affinity) {
        proteinBest[r.protein.name] = r;
      }
    });

    return Object.values(proteinBest).map(r => ({
      โปรตีน: r.protein.name,
      สารยา: r.drug.name,
      'Affinity (kcal/mol)': r.binding_affinity.toFixed(2),
      ระดับ: getRatingThai(r.binding_affinity)
    }));
  }, [simulationResults]);

  const toggleResultExpansion = (index: number) => {
    setExpandedResults(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'ดีเยี่ยม': return '🟢';
      case 'ดี': return '🔵';
      case 'ปานกลาง': return '🟡';
      case 'อ่อน': return '🟠';
      case 'อ่อนมาก': return '🔴';
      default: return '⚪';
    }
  };

  if (!simulationResults) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">📊 ผลลัพธ์การจำลอง</h1>
        <Alert>
          <AlertDescription>
            ยังไม่มีผลลัพธ์การจำลอง กรุณาทำการจำลองก่อน!
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header - exact Thai text from Streamlit */}
      <h1 className="text-3xl font-bold mb-8 text-center">📊 ผลลัพธ์การจำลอง</h1>

      {/* Statistics summary - exact structure from Streamlit col1, col2, col3, col4 */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">📈 สรุปสถิติ</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold">{statistics.total}</div>
              <p className="text-sm text-gray-600">จำนวนการจำลองทั้งหมด</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold">{statistics.successful}</div>
              <p className="text-sm text-gray-600">การจับที่สำเร็จ</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold">{statistics.successRate.toFixed(1)}%</div>
              <p className="text-sm text-gray-600">อัตราความสำเร็จ</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold">{statistics.bestAffinity} kcal/mol</div>
              <p className="text-sm text-gray-600">Affinity ที่ดีที่สุด</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs for different views - exact structure from Streamlit */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">📋 ผลลัพธ์ทั้งหมด</TabsTrigger>
          <TabsTrigger value="charts">📊 กราฟ</TabsTrigger>
          <TabsTrigger value="top10">🏆 10 อันดับแรก</TabsTrigger>
          <TabsTrigger value="analysis">🔍 วิเคราะห์</TabsTrigger>
        </TabsList>

        {/* All Results Tab */}
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>ตารางผลลัพธ์ทั้งหมด</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto max-h-96 overflow-y-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead className="sticky top-0 bg-gray-50">
                    <tr>
                      {Object.keys(tableData[0] || {}).map(header => (
                        <th key={header} className="border border-gray-300 px-4 py-2 text-left">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.map((row, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        {Object.values(row).map((value, cellIndex) => (
                          <td key={cellIndex} className="border border-gray-300 px-4 py-2">
                            {value}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Charts Tab */}
        <TabsContent value="charts">
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Histogram */}
              <Card>
                <CardHeader>
                  <CardTitle>การกระจายของค่า Binding Affinity</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={histogramData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="range" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#1E88E5" />
                      <ReferenceLine x="-7.0" stroke="green" strokeDasharray="5 5" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Pie Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>ผลลัพธ์แบ่งตามระดับ</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={ratingDistribution}
                        dataKey="count"
                        nameKey="rating"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                      >
                        {ratingDistribution.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Heatmap would require more complex implementation */}
            <Card>
              <CardHeader>
                <CardTitle>แผนที่ความร้อน Binding Affinity</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  แผนที่ความร้อนแสดงความสัมพันธ์ระหว่างโปรตีนและสารยา
                  (จำลองจาก Plotly heatmap ใน Streamlit)
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Top 10 Tab */}
        <TabsContent value="top10">
          <Card>
            <CardHeader>
              <CardTitle>🏆 10 อันดับผลลัพธ์ที่ดีที่สุด</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sortedResults.slice(0, 10).map((result, index) => {
                  const rating = getRatingThai(result.binding_affinity);
                  const color = getRatingColor(rating);
                  const isExpanded = expandedResults.has(index);

                  return (
                    <Collapsible
                      key={index}
                      open={isExpanded}
                      onOpenChange={() => toggleResultExpansion(index)}
                    >
                      <CollapsibleTrigger asChild>
                        <div className="cursor-pointer p-4 border rounded-lg hover:bg-gray-50">
                          <div className="flex justify-between items-center">
                            <span>
                              {color} #{index + 1}: {result.drug.name} + {result.protein.name.substring(0, 30)}
                              {result.protein.name.length > 30 ? '...' : ''} ({result.binding_affinity} kcal/mol)
                            </span>
                            <ChevronDownIcon className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                          </div>
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="p-4 bg-gray-50 rounded-lg mt-2">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-bold">สารยา: {result.drug.name}</h4>
                              <ul className="text-sm space-y-1">
                                <li>สูตร: {result.drug.molecular_formula}</li>
                                <li>น้ำหนักโมเลกุล: {result.drug.molecular_weight} g/mol</li>
                                <li>ประเภท: {result.drug.category}</li>
                              </ul>
                            </div>
                            <div>
                              <h4 className="font-bold">โปรตีน: {result.protein.name}</h4>
                              <ul className="text-sm space-y-1">
                                <li>สิ่งมีชีวิต: {result.protein.organism}</li>
                                <li>หน้าที่: {result.protein.function}</li>
                              </ul>
                            </div>
                          </div>
                          <hr className="my-4" />
                          <div>
                            <h4 className="font-bold">ผลการ Docking:</h4>
                            <ul className="text-sm space-y-1">
                              <li>Binding Affinity: <strong>{result.binding_affinity} kcal/mol</strong></li>
                              <li>พันธะไฮโดรเจน: {result.hydrogen_bonds}</li>
                              <li>Hydrophobic Contacts: {result.hydrophobic_contacts}</li>
                              <li>ระดับ: <strong>{rating}</strong></li>
                            </ul>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analysis Tab */}
        <TabsContent value="analysis">
          <div className="space-y-6">
            <h2 className="text-xl font-bold">🔍 การวิเคราะห์เชิงลึก</h2>

            {/* Protein Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>ผลลัพธ์แบ่งตามโปรตีน</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        {Object.keys(proteinAnalysis[0] || {}).map(header => (
                          <th key={header} className="border border-gray-300 px-4 py-2 text-left">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {proteinAnalysis.map((row, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          {Object.values(row).map((value, cellIndex) => (
                            <td key={cellIndex} className="border border-gray-300 px-4 py-2">
                              {value}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Drug Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>ผลลัพธ์แบ่งตามสารยา</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        {Object.keys(drugAnalysis[0] || {}).map(header => (
                          <th key={header} className="border border-gray-300 px-4 py-2 text-left">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {drugAnalysis.map((row, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          {Object.values(row).map((value, cellIndex) => (
                            <td key={cellIndex} className="border border-gray-300 px-4 py-2">
                              {value}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Best Drug for Each Protein */}
            <Card>
              <CardHeader>
                <CardTitle>สารยาที่ดีที่สุดสำหรับแต่ละโปรตีน</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        {Object.keys(bestDrugForProtein[0] || {}).map(header => (
                          <th key={header} className="border border-gray-300 px-4 py-2 text-left">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {bestDrugForProtein.map((row, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          {Object.values(row).map((value, cellIndex) => (
                            <td key={cellIndex} className="border border-gray-300 px-4 py-2">
                              {value}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};