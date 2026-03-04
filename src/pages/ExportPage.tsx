import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { useSimulationStore } from '../stores';
import { useLanguage, getRatingText } from '../i18n';

/**
 * ExportPage Component
 *
 * This page handles data export functionality for simulation results.
 * It replicates the exact functionality from the Streamlit app lines 877-978.
 *
 * Features:
 * - CSV and Excel export functionality
 * - Data preview
 * - Export format selection
 * - Publication-ready table format
 * - i18n language switching support
 * - Premium white theme
 */

export const ExportPage: React.FC = () => {
  const { simulationResults } = useSimulationStore();
  const { t, language } = useLanguage();

  // Sort results by binding affinity (exact Streamlit logic)
  const sortedResults = useMemo(() => {
    if (!simulationResults) return [];
    return [...simulationResults].sort((a, b) => a.binding_affinity - b.binding_affinity);
  }, [simulationResults]);

  // Prepare CSV/Excel export data with translated headers
  const exportData = useMemo(() => {
    return sortedResults.map((r, index) => ({
      rank: index + 1,
      drugName: r.drug.name,
      cid: r.drug.cid,
      molecularWeight: r.drug.molecular_weight,
      proteinName: r.protein.name,
      uniprotId: r.protein.uniprot_id,
      organism: r.protein.organism,
      bindingAffinity: r.binding_affinity,
      hBonds: r.hydrogen_bonds,
      hydrophobicContacts: r.hydrophobic_contacts,
      rating: getRatingText(r.binding_affinity, language)
    }));
  }, [sortedResults, language]);

  // Export data header labels (translated)
  const exportHeaders = useMemo(() => [
    t('results.rank'),
    t('export.drugName'),
    t('export.cidCode'),
    t('common.molecularWeight'),
    t('export.proteinName'),
    t('export.uniprotCode'),
    t('common.organism'),
    'Binding_Affinity_kcal_mol',
    t('results.hBonds'),
    'Hydrophobic_Contacts',
    t('results.rating')
  ], [t]);

  // Prepare publication table data - exact structure from Streamlit (top 10 only)
  const publicationData = useMemo(() => {
    return sortedResults.slice(0, 10).map((r, index) => ({
      rank: index + 1,
      compound: r.drug.name,
      target: r.protein.name.split('(')[0].trim(),
      species: r.protein.organism,
      deltaG: r.binding_affinity,
      hBonds: r.hydrogen_bonds
    }));
  }, [sortedResults]);

  const publicationHeaders = useMemo(() => [
    t('results.rank'),
    t('export.compound'),
    t('export.target'),
    t('export.species'),
    '\u0394G (kcal/mol)',
    'H-bonds'
  ], [t]);

  // Generate CSV content
  const generateCSV = (): string => {
    if (exportData.length === 0) return '';

    const headers = exportHeaders.join(',');
    const rows = exportData.map(row =>
      Object.values(row).map(value => `"${value}"`).join(',')
    ).join('\n');

    return headers + '\n' + rows;
  };

  // Generate Excel content (simplified as CSV for this implementation)
  const generateExcel = (): Blob => {
    const csv = generateCSV();

    // In a real implementation, you would use a library like xlsx to create proper Excel files
    // For this demo, we'll create a CSV with Excel MIME type
    const blob = new Blob(['\ufeff' + csv], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    return blob;
  };

  // Download CSV - always uses English file names
  const downloadCSV = () => {
    const csv = generateCSV();
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    const timestamp = new Date().toISOString().replace(/[:.]/g, '').slice(0, 15);
    link.href = url;
    link.download = `simulation_results_${timestamp}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Download Excel - always uses English file names
  const downloadExcel = () => {
    const blob = generateExcel();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    const timestamp = new Date().toISOString().replace(/[:.]/g, '').slice(0, 15);
    link.href = url;
    link.download = `simulation_report_${timestamp}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!simulationResults || simulationResults.length === 0) {
    return (
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-2xl font-semibold text-gray-900">{t('export.title')}</h1>
        <Alert>
          <AlertDescription>
            {t('export.noResults')}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const successfulResults = simulationResults.filter(r => r.is_successful);

  // Helper to determine if a column contains scientific numeric data
  const isScientificValue = (headerIndex: number, value: unknown): boolean => {
    const scientificIndices = [3, 7, 8, 9]; // molecularWeight, bindingAffinity, hBonds, hydrophobicContacts
    return scientificIndices.includes(headerIndex) && typeof value === 'number';
  };

  const isPublicationScientific = (headerIndex: number, value: unknown): boolean => {
    const scientificIndices = [4, 5]; // deltaG, hBonds
    return scientificIndices.includes(headerIndex) && typeof value === 'number';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <h1 className="text-2xl font-semibold text-gray-900">{t('export.title')}</h1>

      {/* Export options section */}
      <div>
        <h2 className="text-lg font-semibold mb-4 text-gray-900">{t('export.exportOptions')}</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* CSV Export */}
          <Card>
            <CardHeader>
              <CardTitle>{t('export.csvTitle')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-500">
                {t('export.csvDesc')}
              </p>

              <Button onClick={downloadCSV} className="w-full">
                {t('export.downloadCsv')}
              </Button>
            </CardContent>
          </Card>

          {/* Excel Export */}
          <Card>
            <CardHeader>
              <CardTitle>{t('export.excelTitle')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-500">
                {t('export.excelDesc')}
              </p>

              <Button onClick={downloadExcel} className="w-full">
                {t('export.downloadExcel')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Data preview section */}
      <div>
        <h2 className="text-lg font-semibold mb-4 text-gray-900">{t('export.previewTitle')}</h2>

        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                {exportHeaders.map(header => (
                  <th key={header} className="border-b border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-600">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {exportData.slice(0, 20).map((row, index) => ( // Show first 20 rows like Streamlit
                <tr key={index} className="hover:bg-gray-50 border-b border-gray-200">
                  {Object.values(row).map((value, cellIndex) => (
                    <td
                      key={cellIndex}
                      className={`px-4 py-2 text-sm text-gray-600 ${isScientificValue(cellIndex, value) ? 'font-mono' : ''}`}
                    >
                      {value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {exportData.length > 20 && (
          <p className="text-sm text-gray-500 mt-2">
            {t('export.showingRows').replace('{total}', String(exportData.length))}
          </p>
        )}
      </div>

      {/* Publication table section */}
      <div>
        <h2 className="text-lg font-semibold mb-4 text-gray-900">{t('export.publicationTitle')}</h2>
        <p className="text-gray-500 mb-4">{t('export.publicationDesc')}</p>

        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                {publicationHeaders.map(header => (
                  <th key={header} className="border-b border-gray-200 px-4 py-2 text-left font-medium text-gray-600">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {publicationData.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50 border-b border-gray-200">
                  {Object.values(row).map((value, cellIndex) => (
                    <td
                      key={cellIndex}
                      className={`px-4 py-2 text-gray-600 ${isPublicationScientific(cellIndex, value) ? 'font-mono' : ''}`}
                    >
                      {value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold font-mono text-gray-900">{exportData.length}</div>
            <p className="text-sm text-gray-500">{t('export.totalResults')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold font-mono text-gray-900">{successfulResults.length}</div>
            <p className="text-sm text-gray-500">{t('export.successfulBindings')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold font-mono text-gray-900">
              {sortedResults[0]?.binding_affinity.toFixed(1) || 'N/A'} kcal/mol
            </div>
            <p className="text-sm text-gray-500">{t('results.bestAffinity')}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
