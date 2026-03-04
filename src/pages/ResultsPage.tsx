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
import { useLanguage, getRatingText } from '../i18n';

/**
 * ResultsPage Component
 *
 * This page displays detailed simulation results with statistics and visualizations.
 * It replicates the exact functionality from the Streamlit app lines 718-872.
 *
 * Features:
 * - Statistics summary cards
 * - Multiple tabs (All Results, Charts, Top 10, Analysis)
 * - Data visualization with charts using Recharts (replaces Plotly)
 * - Results table with sorting/filtering
 * - i18n language switching support
 * - Premium white theme
 */

// Color scheme for charts - premium white theme palette
const CHART_COLORS = ['#2563EB', '#059669', '#D97706', '#EA580C', '#DC2626'];

export const ResultsPage: React.FC = () => {
  const { simulationResults } = useSimulationStore();
  const { t, language } = useLanguage();
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

  // Prepare results data for table
  const tableData = useMemo(() => {
    return sortedResults.map((r, index) => ({
      rank: index + 1,
      drug: r.drug.name,
      protein: r.protein.name,
      organism: r.protein.organism,
      affinity: r.binding_affinity,
      hBonds: r.hydrogen_bonds,
      hydrophobic: r.hydrophobic_contacts,
      rating: getRatingText(r.binding_affinity, language)
    }));
  }, [sortedResults, language]);

  // Table header labels (translated)
  const tableHeaders = useMemo(() => [
    t('results.rank'),
    t('simulation.drug'),
    t('simulation.protein'),
    t('common.organism'),
    t('results.affinity'),
    t('results.hBonds'),
    t('results.hydrophobic'),
    t('results.rating')
  ], [t]);

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
      const rating = getRatingText(r.binding_affinity, language);
      ratings[rating] = (ratings[rating] || 0) + 1;
    });

    return Object.entries(ratings).map(([rating, count]) => ({ rating, count }));
  }, [simulationResults, language]);

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
      protein: proteinName,
      bestAffinity: Math.min(...results.map(r => r.binding_affinity)).toFixed(2),
      avgAffinity: (results.reduce((sum, r) => sum + r.binding_affinity, 0) / results.length).toFixed(2),
      drugsTested: results.length
    })).sort((a, b) => parseFloat(a.bestAffinity) - parseFloat(b.bestAffinity));
  }, [simulationResults]);

  const proteinAnalysisHeaders = useMemo(() => [
    t('simulation.protein'),
    t('results.bestAffinityCol'),
    t('results.avgAffinity'),
    t('results.drugsTestedCount')
  ], [t]);

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
      drug: drugName,
      bestAffinity: Math.min(...results.map(r => r.binding_affinity)).toFixed(2),
      avgAffinity: (results.reduce((sum, r) => sum + r.binding_affinity, 0) / results.length).toFixed(2),
      proteinsTested: results.length
    })).sort((a, b) => parseFloat(a.bestAffinity) - parseFloat(b.bestAffinity));
  }, [simulationResults]);

  const drugAnalysisHeaders = useMemo(() => [
    t('simulation.drug'),
    t('results.bestAffinityCol'),
    t('results.avgAffinity'),
    t('results.proteinsTestedCount')
  ], [t]);

  const bestDrugForProtein = useMemo(() => {
    if (!simulationResults) return [];

    const proteinBest: { [key: string]: any } = {};
    simulationResults.forEach(r => {
      if (!proteinBest[r.protein.name] || r.binding_affinity < proteinBest[r.protein.name].binding_affinity) {
        proteinBest[r.protein.name] = r;
      }
    });

    return Object.values(proteinBest).map(r => ({
      protein: r.protein.name,
      drug: r.drug.name,
      affinity: r.binding_affinity.toFixed(2),
      rating: getRatingText(r.binding_affinity, language)
    }));
  }, [simulationResults, language]);

  const bestDrugHeaders = useMemo(() => [
    t('simulation.protein'),
    t('simulation.drug'),
    t('results.affinity'),
    t('results.rating')
  ], [t]);

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

  const getRatingBadgeColor = (rating: string) => {
    const excellent = getRatingText(-10, language);
    const good = getRatingText(-8, language);
    const moderate = getRatingText(-6, language);
    const weak = getRatingText(-4, language);

    if (rating === excellent) return 'bg-green-100 text-green-800 border-green-200';
    if (rating === good) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (rating === moderate) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (rating === weak) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  if (!simulationResults) {
    return (
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-2xl font-semibold text-gray-900">{t('results.title')}</h1>
        <Alert>
          <AlertDescription>
            {t('results.noResults')}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <h1 className="text-2xl font-semibold text-gray-900">{t('results.title')}</h1>

      {/* Statistics summary */}
      <div>
        <h2 className="text-lg font-semibold mb-4 text-gray-900">{t('results.statsSummary')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="metric-card">
            <CardContent className="p-6">
              <div className="text-2xl font-bold font-mono text-gray-900">{statistics.total}</div>
              <p className="text-sm text-gray-500">{t('results.totalSimulations')}</p>
            </CardContent>
          </Card>
          <Card className="metric-card">
            <CardContent className="p-6">
              <div className="text-2xl font-bold font-mono text-gray-900">{statistics.successful}</div>
              <p className="text-sm text-gray-500">{t('results.successfulBindings')}</p>
            </CardContent>
          </Card>
          <Card className="metric-card">
            <CardContent className="p-6">
              <div className="text-2xl font-bold font-mono text-gray-900">{statistics.successRate.toFixed(1)}%</div>
              <p className="text-sm text-gray-500">{t('results.successRate')}</p>
            </CardContent>
          </Card>
          <Card className="metric-card">
            <CardContent className="p-6">
              <div className="text-2xl font-bold font-mono text-gray-900">{statistics.bestAffinity} kcal/mol</div>
              <p className="text-sm text-gray-500">{t('results.bestAffinity')}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">{t('results.tabAll')}</TabsTrigger>
          <TabsTrigger value="charts">{t('results.tabCharts')}</TabsTrigger>
          <TabsTrigger value="top10">{t('results.tabTop10')}</TabsTrigger>
          <TabsTrigger value="analysis">{t('results.tabAnalysis')}</TabsTrigger>
        </TabsList>

        {/* All Results Tab */}
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>{t('results.allResultsTable')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bio-table-wrapper overflow-x-auto max-h-96 overflow-y-auto">
                <table className="w-full border-collapse border border-gray-200">
                  <thead className="sticky top-0 bg-gray-100">
                    <tr>
                      {tableHeaders.map(header => (
                        <th key={header} className="border border-gray-200 px-4 py-2 text-left text-gray-600">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.map((row, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border border-gray-200 px-4 py-2 text-gray-600">{row.rank}</td>
                        <td className="border border-gray-200 px-4 py-2 text-gray-600">{row.drug}</td>
                        <td className="border border-gray-200 px-4 py-2 text-gray-600">{row.protein}</td>
                        <td className="border border-gray-200 px-4 py-2 text-gray-600">{row.organism}</td>
                        <td className="border border-gray-200 px-4 py-2 text-gray-600 font-mono">{row.affinity}</td>
                        <td className="border border-gray-200 px-4 py-2 text-gray-600 font-mono">{row.hBonds}</td>
                        <td className="border border-gray-200 px-4 py-2 text-gray-600 font-mono">{row.hydrophobic}</td>
                        <td className="border border-gray-200 px-4 py-2">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${getRatingBadgeColor(row.rating)}`}>
                            {row.rating}
                          </span>
                        </td>
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
                  <CardTitle>{t('results.affinityDistribution')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={histogramData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                      <XAxis dataKey="range" tick={{ fill: '#6b7280' }} stroke="rgba(0,0,0,0.1)" />
                      <YAxis tick={{ fill: '#6b7280' }} stroke="rgba(0,0,0,0.1)" />
                      <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', color: '#111827' }} />
                      <Bar dataKey="count" fill="#2563EB" />
                      <ReferenceLine x="-7.0" stroke="#059669" strokeDasharray="5 5" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Pie Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('results.resultsByRating')}</CardTitle>
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
                        fill="#2563EB"
                      >
                        {ratingDistribution.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', color: '#111827' }} />
                      <Legend wrapperStyle={{ color: '#6b7280' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Heatmap */}
            <Card>
              <CardHeader>
                <CardTitle>{t('results.heatmap')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">
                  {t('results.heatmapDesc')}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Top 10 Tab */}
        <TabsContent value="top10">
          <Card>
            <CardHeader>
              <CardTitle>{t('results.top10Title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sortedResults.slice(0, 10).map((result, index) => {
                  const rating = getRatingText(result.binding_affinity, language);
                  const badgeColor = getRatingBadgeColor(rating);
                  const isExpanded = expandedResults.has(index);

                  return (
                    <Collapsible
                      key={index}
                      open={isExpanded}
                      onOpenChange={() => toggleResultExpansion(index)}
                    >
                      <CollapsibleTrigger asChild>
                        <div className="cursor-pointer p-4 border border-gray-200 rounded-lg hover:bg-gray-50 bg-white">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-900">
                              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border mr-2 ${badgeColor}`}>
                                {rating}
                              </span>
                              #{index + 1}: {result.drug.name} + {result.protein.name.substring(0, 30)}
                              {result.protein.name.length > 30 ? '...' : ''} ({result.binding_affinity} kcal/mol)
                            </span>
                            <ChevronDownIcon className={`h-4 w-4 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                          </div>
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="p-4 bg-gray-50 rounded-lg mt-2">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-bold text-gray-900">{t('simulation.drug')}: {result.drug.name}</h4>
                              <ul className="text-sm space-y-1 text-gray-600">
                                <li>{t('results.formula')}: {result.drug.molecular_formula}</li>
                                <li>{t('common.molecularWeight')}: {result.drug.molecular_weight} g/mol</li>
                                <li>{t('common.category')}: {result.drug.category}</li>
                              </ul>
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900">{t('simulation.protein')}: {result.protein.name}</h4>
                              <ul className="text-sm space-y-1 text-gray-600">
                                <li>{t('common.organism')}: {result.protein.organism}</li>
                                <li>{t('common.function')}: {result.protein.function}</li>
                              </ul>
                            </div>
                          </div>
                          <hr className="my-4 border-gray-200" />
                          <div>
                            <h4 className="font-bold text-gray-900">{t('results.dockingResults')}</h4>
                            <ul className="text-sm space-y-1 text-gray-600">
                              <li>{t('results.bindingAffinity')}: <strong className="text-blue-600 font-mono">{result.binding_affinity} kcal/mol</strong></li>
                              <li>{t('results.hBonds')}: <span className="font-mono">{result.hydrogen_bonds}</span></li>
                              <li>{t('results.hydrophobicContacts')}: <span className="font-mono">{result.hydrophobic_contacts}</span></li>
                              <li>{t('results.rating')}: <strong>{rating}</strong></li>
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
            <h2 className="text-lg font-semibold text-gray-900">{t('results.deepAnalysis')}</h2>

            {/* Protein Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>{t('results.byProtein')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bio-table-wrapper overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-200">
                    <thead>
                      <tr className="bg-gray-100">
                        {proteinAnalysisHeaders.map(header => (
                          <th key={header} className="border border-gray-200 px-4 py-2 text-left text-gray-600">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {proteinAnalysis.map((row, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border border-gray-200 px-4 py-2 text-gray-600">{row.protein}</td>
                          <td className="border border-gray-200 px-4 py-2 text-gray-600 font-mono">{row.bestAffinity}</td>
                          <td className="border border-gray-200 px-4 py-2 text-gray-600 font-mono">{row.avgAffinity}</td>
                          <td className="border border-gray-200 px-4 py-2 text-gray-600 font-mono">{row.drugsTested}</td>
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
                <CardTitle>{t('results.byDrug')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bio-table-wrapper overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-200">
                    <thead>
                      <tr className="bg-gray-100">
                        {drugAnalysisHeaders.map(header => (
                          <th key={header} className="border border-gray-200 px-4 py-2 text-left text-gray-600">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {drugAnalysis.map((row, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border border-gray-200 px-4 py-2 text-gray-600">{row.drug}</td>
                          <td className="border border-gray-200 px-4 py-2 text-gray-600 font-mono">{row.bestAffinity}</td>
                          <td className="border border-gray-200 px-4 py-2 text-gray-600 font-mono">{row.avgAffinity}</td>
                          <td className="border border-gray-200 px-4 py-2 text-gray-600 font-mono">{row.proteinsTested}</td>
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
                <CardTitle>{t('results.bestDrugPerProtein')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bio-table-wrapper overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-200">
                    <thead>
                      <tr className="bg-gray-100">
                        {bestDrugHeaders.map(header => (
                          <th key={header} className="border border-gray-200 px-4 py-2 text-left text-gray-600">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {bestDrugForProtein.map((row, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border border-gray-200 px-4 py-2 text-gray-600">{row.protein}</td>
                          <td className="border border-gray-200 px-4 py-2 text-gray-600">{row.drug}</td>
                          <td className="border border-gray-200 px-4 py-2 text-gray-600 font-mono">{row.affinity}</td>
                          <td className="border border-gray-200 px-4 py-2">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${getRatingBadgeColor(row.rating)}`}>
                              {row.rating}
                            </span>
                          </td>
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
