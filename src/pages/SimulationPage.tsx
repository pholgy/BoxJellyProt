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
import { runBatchDockingSimulation, getRatingThai } from '../services/simulation';

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
 * - All Thai text preserved exactly from original
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
    // Validation - exact error message from Streamlit
    if (selectedProteins.length === 0 || selectedDrugs.length === 0) {
      setSimulationError('กรุณาเลือกอย่างน้อย 1 โปรตีน และ 1 สารยา!');
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
        สารยา: r.drug.name,
        โปรตีน: r.protein.name.length > 30 ? r.protein.name.substring(0, 30) + '...' : r.protein.name,
        'Binding Affinity': `${r.binding_affinity} kcal/mol`,
        ระดับ: getRatingThai(r.binding_affinity)
      }));

      setPreviewResults(preview);
      setSimulationComplete(true);

    } catch (error) {
      console.error('Simulation error:', error);
      setSimulationError('เกิดข้อผิดพลาดในการจำลอง กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSimulating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-[1400px] mx-auto p-6">
        <div className="text-center">
          <p className="text-lg text-zinc-300">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto p-6">
      {/* Header - exact Thai text from Streamlit */}
      <h1 className="text-3xl font-bold mb-8 text-center text-zinc-100">🔬 การจำลอง Molecular Docking</h1>

      {/* Selection sections - exact col1, col2 layout from Streamlit */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Protein selection - exact structure from Streamlit */}
        <div className="glass-panel p-0">
          <Card className="bg-transparent border-0">
            <CardHeader>
              <CardTitle className="text-zinc-100">เลือกโปรตีนเป้าหมาย</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="select-all-proteins"
                  checked={selectAllProteins}
                  onCheckedChange={handleSelectAllProteins}
                />
                <Label htmlFor="select-all-proteins" className="text-zinc-300">เลือกทุกโปรตีน</Label>
              </div>

              {!selectAllProteins && (
                <div className="space-y-2">
                  <Label htmlFor="protein-multiselect" className="text-zinc-300">เลือกโปรตีน</Label>
                  <div className="border border-white/[0.08] rounded-md p-3 max-h-40 overflow-y-auto bio-scrollbar">
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
                        <Label htmlFor={`protein-${protein.uniprot_id}`} className="text-sm text-zinc-400">
                          {protein.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Badge variant="secondary">
                เลือกแล้ว: {selectedProteins.length} โปรตีน
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Drug selection - exact structure from Streamlit */}
        <div className="glass-panel p-0">
          <Card className="bg-transparent border-0">
            <CardHeader>
              <CardTitle className="text-zinc-100">เลือกสารยาที่ต้องการทดสอบ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="select-all-drugs"
                  checked={selectAllDrugs}
                  onCheckedChange={handleSelectAllDrugs}
                />
                <Label htmlFor="select-all-drugs" className="text-zinc-300">เลือกทุกสารยา</Label>
              </div>

              {!selectAllDrugs && (
                <div className="space-y-2">
                  <Label htmlFor="drug-multiselect" className="text-zinc-300">เลือกสารยา</Label>
                  <div className="border border-white/[0.08] rounded-md p-3 max-h-40 overflow-y-auto bio-scrollbar">
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
                        <Label htmlFor={`drug-${drug.cid}`} className="text-sm text-zinc-400">
                          {drug.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Badge variant="secondary">
                เลือกแล้ว: {selectedDrugs.length} สารยา
              </Badge>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Simulation settings - exact col1, col2, col3 layout from Streamlit */}
      <div className="glass-panel p-0 mb-8">
        <Card className="bg-transparent border-0">
          <CardHeader>
            <CardTitle className="text-zinc-100">⚙️ ตั้งค่าการจำลอง</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="exhaustiveness" className="text-zinc-300">ความละเอียด (Exhaustiveness)</Label>
                <Input
                  id="exhaustiveness"
                  type="range"
                  min="1"
                  max="32"
                  value={exhaustiveness}
                  onChange={(e) => setExhaustiveness(Number(e.target.value))}
                  className="w-full"
                />
                <p className="text-sm text-zinc-400 text-center font-mono">{exhaustiveness}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="num-modes" className="text-zinc-300">จำนวน poses</Label>
                <Input
                  id="num-modes"
                  type="range"
                  min="1"
                  max="20"
                  value={numModes}
                  onChange={(e) => setNumModes(Number(e.target.value))}
                  className="w-full"
                />
                <p className="text-sm text-zinc-400 text-center font-mono">{numModes}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="random-seed" className="text-zinc-300">Random seed</Label>
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

        {/* Simulation button - exact style from Streamlit */}
        <Button
          onClick={runSimulation}
          disabled={isSimulating}
          size="lg"
          className="w-full bio-button-primary"
        >
          🚀 เริ่มการจำลอง
        </Button>

        {/* Progress and status */}
        {isSimulating && (
          <div className="space-y-4">
            <p className="text-center text-zinc-300">
              กำลังจำลอง {selectedProteins.length * selectedDrugs.length} การทดลอง...
            </p>
            <Progress value={simulationProgress} className="w-full" />
          </div>
        )}

        {/* Success message and preview - exact structure from Streamlit */}
        {simulationComplete && (
          <div className="space-y-6">
            <Alert>
              <AlertDescription>
                ✅ การจำลองเสร็จสิ้น! สร้างผลลัพธ์ {selectedProteins.length * selectedDrugs.length} รายการ
              </AlertDescription>
            </Alert>

            {/* Preview results - exact structure from Streamlit */}
            <div className="glass-panel p-0">
              <Card className="bg-transparent border-0">
                <CardHeader>
                  <CardTitle className="text-zinc-100">ตัวอย่างผลลัพธ์</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-white/[0.08]">
                      <thead>
                        <tr className="bg-accent/10">
                          <th className="border border-white/[0.08] px-4 py-2 text-left text-zinc-100">สารยา</th>
                          <th className="border border-white/[0.08] px-4 py-2 text-left text-zinc-100">โปรตีน</th>
                          <th className="border border-white/[0.08] px-4 py-2 text-left text-zinc-100">Binding Affinity</th>
                          <th className="border border-white/[0.08] px-4 py-2 text-left text-zinc-100">ระดับ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {previewResults.map((result, index) => (
                          <tr key={index} className="hover:bg-white/[0.04]">
                            <td className="border border-white/[0.06] px-4 py-2 text-zinc-300">{result.สารยา}</td>
                            <td className="border border-white/[0.06] px-4 py-2 text-zinc-300">{result.โปรตีน}</td>
                            <td className="border border-white/[0.06] px-4 py-2 text-zinc-300 font-mono">{result['Binding Affinity']}</td>
                            <td className="border border-white/[0.06] px-4 py-2 text-zinc-300">{result.ระดับ}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-4">
                    <Badge variant="secondary">
                      ไปที่หน้า **ผลลัพธ์** เพื่อดูรายละเอียดเพิ่มเติม!
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
