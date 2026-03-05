import React, { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../components/ui/collapsible';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { useDatabaseStore } from '../stores';
import { useLanguage } from '../i18n';
import { ProteinViewer } from '../components/viewers/ProteinViewer';

export const ProteinsPage: React.FC = () => {
  const { t } = useLanguage();
  const { proteins, isLoading, loadData } = useDatabaseStore();
  const [organismFilter, setOrganismFilter] = useState<string>("all");
  const [toxinFilter, setToxinFilter] = useState<string>("all");
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

    if (organismFilter !== "all") {
      filtered = filtered.filter(p => p.organism === organismFilter);
    }

    if (toxinFilter !== "all") {
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
      <h1 className="text-2xl font-semibold text-gray-900">{t('proteins.title')}</h1>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="organism-filter" className="text-gray-600">{t('proteins.filterOrganism')}</Label>
          <Select value={organismFilter} onValueChange={setOrganismFilter}>
            <SelectTrigger id="organism-filter" className="border-gray-200">
              <SelectValue placeholder={t('proteins.selectOrganism')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('common.all')}</SelectItem>
              {organisms.map(organism => (
                <SelectItem key={organism} value={organism}>
                  {organism}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="toxin-filter" className="text-gray-600">{t('proteins.filterToxin')}</Label>
          <Select value={toxinFilter} onValueChange={setToxinFilter}>
            <SelectTrigger id="toxin-filter" className="border-gray-200">
              <SelectValue placeholder={t('proteins.selectToxin')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('common.all')}</SelectItem>
              {toxinTypes.map(toxinType => (
                <SelectItem key={toxinType} value={toxinType}>
                  {toxinType}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Result count info */}
      <div>
        <Badge variant="secondary" className="text-sm px-3 py-1.5 bg-blue-50 text-blue-600">
          {t('proteins.found')} {filteredProteins.length} {t('proteins.proteinsUnit')}
        </Badge>
      </div>

      {/* Protein cards */}
      <div className="space-y-4">
        {filteredProteins.map((protein) => {
          const isExpanded = expandedProteins.has(protein.uniprot_id);
          const isSequenceVisible = sequenceVisible.has(protein.uniprot_id);

          return (
            <Card key={protein.uniprot_id} className="w-full glass-panel border-gray-200">
              <Collapsible
                open={isExpanded}
                onOpenChange={() => toggleProteinExpansion(protein.uniprot_id)}
              >
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-gray-50">
                    <CardTitle className="flex justify-between items-center text-gray-900">
                      <span>
                        <strong>{protein.name}</strong> - {protein.organism}
                      </span>
                      {isExpanded ? (
                        <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                      )}
                    </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Left column - protein details (exact Streamlit col1 structure) */}
                      <div className="lg:col-span-2 space-y-4">
                        <div className="space-y-2 text-gray-600">
                          <p><strong className="text-gray-900">{t('proteins.uniprotId')}:</strong> {protein.uniprot_id}</p>
                          <p><strong className="text-gray-900">{t('common.organism')}:</strong> {protein.organism}</p>
                          <p><strong className="text-gray-900">{t('proteins.toxinType')}:</strong> {protein.toxin_type}</p>
                          <p><strong className="text-gray-900">{t('common.function')}:</strong> {protein.function}</p>
                          <p><strong className="text-gray-900">{t('common.length')}:</strong> {protein.length} {t('common.aminoAcids')}</p>
                          <p><strong className="text-gray-900">{t('common.molecularWeight')}:</strong> {protein.molecular_weight.toLocaleString()} Da</p>
                        </div>

                        {/* Sequence toggle - exact Streamlit checkbox logic */}
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`seq-${protein.uniprot_id}`}
                              checked={isSequenceVisible}
                              onCheckedChange={() => toggleSequenceVisibility(protein.uniprot_id)}
                            />
                            <Label htmlFor={`seq-${protein.uniprot_id}`} className="text-gray-600">
                              {t('proteins.showSequence')}
                            </Label>
                          </div>

                          {isSequenceVisible && (
                            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                              <code className="text-sm font-mono break-all text-gray-600">
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
                          <h4 className="font-bold mb-3 text-gray-900">{t('proteins.structure3d')}</h4>
                          <div className="relative border border-gray-200 rounded-xl overflow-hidden">
                            <ProteinViewer
                              uniprotId={protein.uniprot_id}
                              sequence={protein.sequence}
                              proteinName={protein.name}
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
          <p className="text-gray-400 text-lg">{t('proteins.noProteins')}</p>
        </div>
      )}
    </div>
  );
};
