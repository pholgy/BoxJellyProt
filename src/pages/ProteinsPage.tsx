import React, { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../components/ui/collapsible';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Box } from '@react-three/drei';
import { useDatabaseStore } from '../stores';
import { Protein } from '../types';

/**
 * ProteinsPage Component
 *
 * This page displays the protein database with filtering and 3D visualization.
 * It replicates the exact functionality from the Streamlit app lines 476-527.
 *
 * Features:
 * - Filter by organism and toxin type (exactly like Streamlit selectboxes)
 * - Protein cards with expandable details
 * - 3D protein structure visualization using Three.js (replaces py3Dmol)
 * - Sequence display toggle
 * - All Thai text preserved exactly from original
 */

// Component for 3D Alpha Helix visualization
const AlphaHelixVisualization: React.FC<{ proteinId: string; sequence: string }> = ({
  proteinId,
  sequence
}) => {
  return (
    <Canvas style={{ height: '280px', width: '100%' }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />

      {/* Create alpha helix structure - series of boxes representing protein backbone */}
      {Array.from({ length: Math.min(20, sequence.length / 10) }, (_, i) => {
        const t = i * 0.5;
        const x = Math.cos(t) * 2;
        const y = t * 0.3;
        const z = Math.sin(t) * 2;

        return (
          <Box
            key={i}
            position={[x, y, z]}
            scale={[0.2, 0.2, 0.2]}
            rotation={[0, t, 0]}
          >
            <meshStandardMaterial color={`hsl(${(i * 360) / 20}, 70%, 50%)`} />
          </Box>
        );
      })}

      <OrbitControls enableZoom enablePan enableRotate />
    </Canvas>
  );
};

export const ProteinsPage: React.FC = () => {
  const { proteins, isLoading, loadData } = useDatabaseStore();
  const [organismFilter, setOrganismFilter] = useState<string>("ทั้งหมด");
  const [toxinFilter, setToxinFilter] = useState<string>("ทั้งหมด");
  const [expandedProteins, setExpandedProteins] = useState<Set<string>>(new Set());
  const [sequenceVisible, setSequenceVisible] = useState<Set<string>>(new Set());

  // Load data when component mounts
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Get unique organisms for filter (exact Streamlit logic)
  const organisms = useMemo(() => {
    return Array.from(new Set(proteins.map(p => p.organism)));
  }, [proteins]);

  // Get unique toxin types for filter (exact Streamlit logic)
  const toxinTypes = useMemo(() => {
    return Array.from(new Set(proteins.map(p => p.toxin_type).filter(Boolean)));
  }, [proteins]);

  // Apply filters (exact Streamlit logic)
  const filteredProteins = useMemo(() => {
    let filtered = proteins;

    if (organismFilter !== "ทั้งหมด") {
      filtered = filtered.filter(p => p.organism === organismFilter);
    }

    if (toxinFilter !== "ทั้งหมด") {
      filtered = filtered.filter(p => p.toxin_type === toxinFilter);
    }

    return filtered;
  }, [proteins, organismFilter, toxinFilter]);

  const toggleProteinExpansion = (proteinId: string) => {
    setExpandedProteins(prev => {
      const newSet = new Set(prev);
      if (newSet.has(proteinId)) {
        newSet.delete(proteinId);
      } else {
        newSet.add(proteinId);
      }
      return newSet;
    });
  };

  const toggleSequenceVisibility = (proteinId: string) => {
    setSequenceVisible(prev => {
      const newSet = new Set(prev);
      if (newSet.has(proteinId)) {
        newSet.delete(proteinId);
      } else {
        newSet.add(proteinId);
      }
      return newSet;
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-lg">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header - exact Thai text from Streamlit */}
      <h1 className="text-3xl font-bold mb-8 text-center">🧬 ฐานข้อมูลโปรตีนพิษแมงกะพรุน</h1>

      {/* Filters - exact layout from Streamlit col1, col2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="space-y-2">
          <Label htmlFor="organism-filter">กรองตามสิ่งมีชีวิต</Label>
          <Select value={organismFilter} onValueChange={setOrganismFilter}>
            <SelectTrigger id="organism-filter">
              <SelectValue placeholder="เลือกสิ่งมีชีวิต" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ทั้งหมด">ทั้งหมด</SelectItem>
              {organisms.map(organism => (
                <SelectItem key={organism} value={organism}>
                  {organism}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="toxin-filter">กรองตามชนิดพิษ</Label>
          <Select value={toxinFilter} onValueChange={setToxinFilter}>
            <SelectTrigger id="toxin-filter">
              <SelectValue placeholder="เลือกชนิดพิษ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ทั้งหมด">ทั้งหมด</SelectItem>
              {toxinTypes.map(toxinType => (
                <SelectItem key={toxinType} value={toxinType}>
                  {toxinType}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Result count info - exact Thai text from Streamlit */}
      <div className="mb-6">
        <Badge variant="secondary" className="text-lg px-4 py-2">
          พบ {filteredProteins.length} โปรตีน
        </Badge>
      </div>

      {/* Protein cards - exact structure from Streamlit st.expander */}
      <div className="space-y-4">
        {filteredProteins.map((protein) => {
          const isExpanded = expandedProteins.has(protein.uniprot_id);
          const isSequenceVisible = sequenceVisible.has(protein.uniprot_id);

          return (
            <Card key={protein.uniprot_id} className="w-full">
              <Collapsible
                open={isExpanded}
                onOpenChange={() => toggleProteinExpansion(protein.uniprot_id)}
              >
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-gray-50">
                    <CardTitle className="flex justify-between items-center">
                      <span>
                        <strong>{protein.name}</strong> - {protein.organism}
                      </span>
                      {isExpanded ? (
                        <ChevronUpIcon className="h-5 w-5" />
                      ) : (
                        <ChevronDownIcon className="h-5 w-5" />
                      )}
                    </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Left column - protein details (exact Streamlit col1 structure) */}
                      <div className="lg:col-span-2 space-y-4">
                        <div className="space-y-2">
                          <p><strong>รหัส UniProt:</strong> {protein.uniprot_id}</p>
                          <p><strong>สิ่งมีชีวิต:</strong> {protein.organism}</p>
                          <p><strong>ชนิดพิษ:</strong> {protein.toxin_type}</p>
                          <p><strong>หน้าที่:</strong> {protein.function}</p>
                          <p><strong>ความยาว:</strong> {protein.length} กรดอะมิโน</p>
                          <p><strong>น้ำหนักโมเลกุล:</strong> {protein.molecular_weight.toLocaleString()} Da</p>
                        </div>

                        {/* Sequence toggle - exact Streamlit checkbox logic */}
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`seq-${protein.uniprot_id}`}
                              checked={isSequenceVisible}
                              onCheckedChange={() => toggleSequenceVisibility(protein.uniprot_id)}
                            />
                            <Label htmlFor={`seq-${protein.uniprot_id}`}>
                              แสดงลำดับกรดอะมิโน
                            </Label>
                          </div>

                          {isSequenceVisible && (
                            <div className="bg-gray-100 p-4 rounded-md">
                              <code className="text-sm font-mono break-all">
                                {protein.sequence.length > 100
                                  ? protein.sequence.substring(0, 100) + "..."
                                  : protein.sequence
                                }
                              </code>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right column - 3D visualization (exact Streamlit col2 structure) */}
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-bold mb-3">โครงสร้าง 3 มิติ (จำลอง Alpha Helix):</h4>
                          <div className="border rounded-lg overflow-hidden">
                            <AlphaHelixVisualization
                              proteinId={protein.uniprot_id}
                              sequence={protein.sequence}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          );
        })}
      </div>

      {/* Empty state */}
      {filteredProteins.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg">ไม่พบโปรตีนที่ตรงกับเงื่อนไขการกรอง</p>
        </div>
      )}
    </div>
  );
};