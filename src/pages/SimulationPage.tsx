import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Checkbox } from '../components/ui/checkbox';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { useDatabaseStore, useSimulationStore } from '../stores';
import { runBatchDockingSimulation } from '../services/simulation';
import { useLanguage, getRatingText } from '../i18n';

/**
 * SimulationPage Component
 *
 * This page handles molecular docking simulation setup and execution.
 * It replicates the exact functionality from the Streamlit app lines 601-713.
 *
 * Features:
 * - Protein and drug multi-selection with "select all" options
 * - Simulation parameters configuration (exhaustiveness, poses, seed)
 * - Progress tracking during simulation execution
 * - Results preview with top 5 best results
 * - Integration with simulation engine from Task 4
 * - i18n language switching support
 * - Premium white theme
 */

export const SimulationPage: React.FC = () => {
  const { proteins, drugs, isLoading, loadData } = useDatabaseStore();
  const {
    selectedProteins,
    selectedDrugs,
    setSelectedProteins,
    setSelectedDrugs,
    setSimulationResults
  } = useSimulationStore();
  const { t, language } = useLanguage();

  // Simulation parameters (exact default values from Streamlit)
  const [exhaustiveness, setExhaustiveness] = useState<number>(8);
  const [numModes, setNumModes] = useState<number>(9);
  const [randomSeed, setRandomSeed] = useState<number>(42);

  // UI state
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationProgress, setSimulationProgress] = useState<number>(0);
  const [simulationError, setSimulationError] = useState<string>('');
  const [simulationComplete, setSimulationComplete] = useState<boolean>(false);
  const [previewResults, setPreviewResults] = useState<any[]>([]);

  // Selection state
  const [selectAllProteins, setSelectAllProteins] = useState<boolean>(false);
  const [selectAllDrugs, setSelectAllDrugs] = useState<boolean>(false);

  // Load data when component mounts
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle select all proteins
  const handleSelectAllProteins = (checked: boolean) => {
    setSelectAllProteins(checked);
    if (checked) {
      setSelectedProteins(proteins);
    } else {
      setSelectedProteins([]);
    }
  };

  // Handle select all drugs
  const handleSelectAllDrugs = (checked: boolean) => {
    setSelectAllDrugs(checked);
    if (checked) {
      setSelectedDrugs(drugs);
    } else {
      setSelectedDrugs([]);
    }
  };

  // Handle individual protein selection
  const handleProteinSelection = (proteinNames: string[]) => {
    const selected = proteins.filter(p => proteinNames.includes(p.name));
    setSelectedProteins(selected);
    setSelectAllProteins(selected.length === proteins.length);
  };

  // Handle individual drug selection
  const handleDrugSelection = (drugNames: string[]) => {
    const selected = drugs.filter(d => drugNames.includes(d.name));
    setSelectedDrugs(selected);
    setSelectAllDrugs(selected.length === drugs.length);
  };

  // Run simulation (exact logic from Streamlit)
  const runSimulation = async () => {
    // Validation
    if (selectedProteins.length === 0 || selectedDrugs.length === 0) {
      setSimulationError(t('simulation.errorSelectBoth'));
      return;
    }

    setSimulationError('');
    setIsSimulating(true);
    setSimulationProgress(0);
    setSimulationComplete(false);

    try {
      const totalDockings = selectedProteins.length * selectedDrugs.length;

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setSimulationProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      // Run actual simulation
      const results = await runBatchDockingSimulation(
        selectedProteins,
        selectedDrugs,
        randomSeed
      );

      // Complete progress
      clearInterval(progressInterval);
      setSimulationProgress(100);

      // Store results
      setSimulationResults(results);

      // Create preview data (exact logic from Streamlit - top 5 sorted by affinity)
      const sortedResults = [...results].sort((a, b) => a.binding_affinity - b.binding_affinity);
      const top5 = sortedResults.slice(0, 5);

      const preview = top5.map(r => ({
        drug: r.drug.name,
        protein: r.protein.name.length > 30 ? r.protein.name.substring(0, 30) + '...' : r.protein.name,
        affinity: `${r.binding_affinity} kcal/mol`,
        rating: getRatingText(r.binding_affinity, language)
      }));

      setPreviewResults(preview);
      setSimulationComplete(true);

    } catch (error) {
      console.error('Simulation error:', error);
      setSimulationError(t('simulation.errorGeneral'));
    } finally {
      setIsSimulating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="text-center">
          <p className="text-lg text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <h1 className="text-2xl font-semibold text-gray-900">{t('simulation.title')}</h1>

      {/* Selection sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Protein selection */}
        <div className="glass-panel p-0">
          <Card className="bg-transparent border-0">
            <CardHeader>
              <CardTitle className="text-gray-900">{t('simulation.selectProteins')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="select-all-proteins"
                  checked={selectAllProteins}
                  onCheckedChange={handleSelectAllProteins}
                />
                <Label htmlFor="select-all-proteins" className="text-gray-600">{t('simulation.selectAllProteins')}</Label>
              </div>

              {!selectAllProteins && (
                <div className="space-y-2">
                  <Label htmlFor="protein-multiselect" className="text-gray-600">{t('simulation.selectProtein')}</Label>
                  <div className="border border-gray-200 rounded-md p-3 max-h-40 overflow-y-auto bio-scrollbar">
                    {proteins.map((protein) => (
                      <div key={protein.uniprot_id} className="flex items-center space-x-2 py-1">
                        <Checkbox
                          id={`protein-${protein.uniprot_id}`}
                          checked={selectedProteins.some(p => p.uniprot_id === protein.uniprot_id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedProteins([...selectedProteins, protein]);
                            } else {
                              setSelectedProteins(selectedProteins.filter(p => p.uniprot_id !== protein.uniprot_id));
                            }
                          }}
                        />
                        <Label htmlFor={`protein-${protein.uniprot_id}`} className="text-sm text-gray-500">
                          {protein.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Badge variant="secondary">
                {t('simulation.selectedProteins').replace('{count}', String(selectedProteins.length))}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Drug selection */}
        <div className="glass-panel p-0">
          <Card className="bg-transparent border-0">
            <CardHeader>
              <CardTitle className="text-gray-900">{t('simulation.selectDrugs')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="select-all-drugs"
                  checked={selectAllDrugs}
                  onCheckedChange={handleSelectAllDrugs}
                />
                <Label htmlFor="select-all-drugs" className="text-gray-600">{t('simulation.selectAllDrugs')}</Label>
              </div>

              {!selectAllDrugs && (
                <div className="space-y-2">
                  <Label htmlFor="drug-multiselect" className="text-gray-600">{t('simulation.selectDrug')}</Label>
                  <div className="border border-gray-200 rounded-md p-3 max-h-40 overflow-y-auto bio-scrollbar">
                    {drugs.map((drug) => (
                      <div key={drug.cid} className="flex items-center space-x-2 py-1">
                        <Checkbox
                          id={`drug-${drug.cid}`}
                          checked={selectedDrugs.some(d => d.cid === drug.cid)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedDrugs([...selectedDrugs, drug]);
                            } else {
                              setSelectedDrugs(selectedDrugs.filter(d => d.cid !== drug.cid));
                            }
                          }}
                        />
                        <Label htmlFor={`drug-${drug.cid}`} className="text-sm text-gray-500">
                          {drug.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Badge variant="secondary">
                {t('simulation.selectedDrugs').replace('{count}', String(selectedDrugs.length))}
              </Badge>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Simulation settings */}
      <div className="glass-panel p-0">
        <Card className="bg-transparent border-0">
          <CardHeader>
            <CardTitle className="text-gray-900">{t('simulation.settings')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="exhaustiveness" className="text-gray-600">{t('simulation.exhaustiveness')}</Label>
                <Input
                  id="exhaustiveness"
                  type="range"
                  min="1"
                  max="32"
                  value={exhaustiveness}
                  onChange={(e) => setExhaustiveness(Number(e.target.value))}
                  className="w-full"
                />
                <p className="text-sm text-gray-500 text-center font-mono">{exhaustiveness}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="num-modes" className="text-gray-600">{t('simulation.numPoses')}</Label>
                <Input
                  id="num-modes"
                  type="range"
                  min="1"
                  max="20"
                  value={numModes}
                  onChange={(e) => setNumModes(Number(e.target.value))}
                  className="w-full"
                />
                <p className="text-sm text-gray-500 text-center font-mono">{numModes}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="random-seed" className="text-gray-600">{t('simulation.randomSeed')}</Label>
                <Input
                  id="random-seed"
                  type="number"
                  min="0"
                  max="9999"
                  value={randomSeed}
                  onChange={(e) => setRandomSeed(Number(e.target.value))}
                  className="font-mono"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Simulation execution section */}
      <div className="space-y-6">
        {/* Error display */}
        {simulationError && (
          <Alert variant="destructive">
            <AlertDescription>{simulationError}</AlertDescription>
          </Alert>
        )}

        {/* Simulation button */}
        <Button
          onClick={runSimulation}
          disabled={isSimulating}
          size="lg"
          className="w-full bio-button-primary"
        >
          {t('simulation.startSimulation')}
        </Button>

        {/* Progress and status */}
        {isSimulating && (
          <div className="space-y-4">
            <p className="text-center text-gray-600">
              {t('simulation.simulating').replace('{count}', String(selectedProteins.length * selectedDrugs.length))}
            </p>
            <Progress value={simulationProgress} className="w-full" />
          </div>
        )}

        {/* Success message and preview */}
        {simulationComplete && (
          <div className="space-y-6">
            <Alert>
              <AlertDescription>
                {t('simulation.complete').replace('{count}', String(selectedProteins.length * selectedDrugs.length))}
              </AlertDescription>
            </Alert>

            {/* Preview results */}
            <div className="glass-panel p-0">
              <Card className="bg-transparent border-0">
                <CardHeader>
                  <CardTitle className="text-gray-900">{t('simulation.previewResults')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-200">
                      <thead>
                        <tr className="bg-blue-50">
                          <th className="border border-gray-200 px-4 py-2 text-left text-gray-900">{t('simulation.drug')}</th>
                          <th className="border border-gray-200 px-4 py-2 text-left text-gray-900">{t('simulation.protein')}</th>
                          <th className="border border-gray-200 px-4 py-2 text-left text-gray-900">{t('results.bindingAffinity')}</th>
                          <th className="border border-gray-200 px-4 py-2 text-left text-gray-900">{t('simulation.level')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {previewResults.map((result, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="border border-gray-200 px-4 py-2 text-gray-600">{result.drug}</td>
                            <td className="border border-gray-200 px-4 py-2 text-gray-600">{result.protein}</td>
                            <td className="border border-gray-200 px-4 py-2 text-gray-600 font-mono">{result.affinity}</td>
                            <td className="border border-gray-200 px-4 py-2 text-gray-600">{result.rating}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-4">
                    <Badge variant="secondary">
                      {t('simulation.goToResults')}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
