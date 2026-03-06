import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useDatabaseStore } from '../stores';
import { useLanguage } from '../i18n';
import { MoleculeViewer } from '../components/viewers/MoleculeViewer';

export const DrugsPage: React.FC = () => {
  const { t } = useLanguage();
  const { drugs, isLoading, loadData } = useDatabaseStore();
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedDrugName, setSelectedDrugName] = useState<string>("");

  // Load data when component mounts
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Get unique categories for filter (exact Streamlit logic)
  const categories = useMemo(() => {
    return Array.from(new Set(drugs.map(d => d.category).filter(Boolean)));
  }, [drugs]);

  // Apply filters (exact Streamlit logic)
  const filteredDrugs = useMemo(() => {
    let filtered = drugs;

    if (categoryFilter !== "all") {
      filtered = filtered.filter(d => d.category === categoryFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(d =>
        d.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [drugs, categoryFilter, searchTerm]);

  // Get selected drug details
  const selectedDrug = useMemo(() => {
    return filteredDrugs.find(d => d.name === selectedDrugName) || filteredDrugs[0];
  }, [filteredDrugs, selectedDrugName]);

  // Update selected drug when filters change
  useEffect(() => {
    if (filteredDrugs.length > 0 && !filteredDrugs.find(d => d.name === selectedDrugName)) {
      setSelectedDrugName(filteredDrugs[0].name);
    }
  }, [filteredDrugs, selectedDrugName]);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="text-center" role="status" aria-live="polite">
          <p className="text-lg text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <h1 className="text-2xl font-semibold text-gray-900">
        <motion.span
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          style={{ display: 'inline-block' }}
        >
          💊
        </motion.span>{' '}
        {t('drugs.title')}
      </h1>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category-filter" className="text-gray-600">{t('drugs.filterCategory')}</Label>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger id="category-filter">
              <SelectValue placeholder={t('drugs.selectCategory')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('common.all')}</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="search-input" className="text-gray-600">{t('drugs.searchName')}</Label>
          <Input
            id="search-input"
            type="search"
            autoComplete="off"
            placeholder={`🔍 ${t('drugs.searchPlaceholder')}`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="focus:ring-2 focus:ring-blue-300 transition-shadow duration-200"
          />
        </div>
      </div>

      {/* Drug data table */}
      <div>
        <div className="overflow-x-auto glass-panel rounded-xl">
          <table className="w-full border-collapse" aria-label="Drug compounds list">
            <thead>
              <tr className="bg-gray-50/80">
                <th scope="col" className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('common.name')}</th>
                <th scope="col" className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('common.molecularFormula')}</th>
                <th scope="col" className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('common.molecularWeight')} (g/mol)</th>
                <th scope="col" className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('common.category')}</th>
                <th scope="col" className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('common.source')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredDrugs.map((drug) => (
                <tr key={drug.cid} className="border-b border-gray-100 hover:bg-gray-50/50 hover:scale-[1.005] transition-transform duration-150 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-700 font-medium">{drug.name}</td>
                  <td className="px-4 py-3 font-mono text-sm text-gray-600">{drug.molecular_formula}</td>
                  <td className="px-4 py-3 font-mono text-sm text-gray-600">{drug.molecular_weight}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{drug.category}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{drug.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredDrugs.length === 0 && (
          <div className="text-center py-8" role="status" aria-live="polite">
            <motion.span
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              style={{ display: 'inline-block', fontSize: '2rem' }}
            >
              🤷
            </motion.span>
            <p className="text-gray-500 text-lg mt-2">{t('drugs.noDrugs')}</p>
          </div>
        )}
      </div>

      {/* Drug detail section */}
      {filteredDrugs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="glass-panel rounded-xl"
        >
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">{t('drugs.drugDetails')}</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {/* Drug selection */}
              <div className="space-y-2">
                <Label htmlFor="drug-select" className="text-gray-600">{t('drugs.selectDrug')}</Label>
                <Select value={selectedDrugName} onValueChange={setSelectedDrugName}>
                  <SelectTrigger id="drug-select">
                    <SelectValue placeholder={t('drugs.selectDrugPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredDrugs.map(drug => (
                      <SelectItem key={drug.cid} value={drug.name}>
                        {drug.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Drug details - exact col1, col2 layout from Streamlit */}
              {selectedDrug && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left column - drug information */}
                  <div className="glass-panel-light rounded-xl p-5 space-y-4">
                    <div>
                      <h3 className="text-xl font-bold mb-3 text-gray-900">{selectedDrug.name}</h3>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p><strong className="text-gray-900">{t('drugs.pubchemCid')}:</strong> {selectedDrug.cid}</p>
                        <p><strong className="text-gray-900">{t('common.molecularFormula')}:</strong> <span className="font-mono">{selectedDrug.molecular_formula}</span></p>
                        <p><strong className="text-gray-900">{t('common.molecularWeight')}:</strong> <span className="font-mono">{selectedDrug.molecular_weight} g/mol</span></p>
                        <p><strong className="text-gray-900">{t('common.category')}:</strong> {selectedDrug.category}</p>
                        <p><strong className="text-gray-900">{t('drugs.mechanism')}:</strong> {selectedDrug.mechanism}</p>
                        <p><strong className="text-gray-900">{t('common.source')}:</strong> {selectedDrug.source}</p>
                      </div>
                    </div>

                    {/* SMILES display - exact structure from Streamlit */}
                    {selectedDrug.smiles && (
                      <div>
                        <p className="font-bold mb-2 text-gray-900">SMILES:</p>
                        <div className="bg-gray-50 p-3 rounded-md border border-gray-200" aria-label="SMILES code">
                          <code className="text-sm font-mono break-all text-blue-600">
                            {selectedDrug.smiles}
                          </code>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right column - 3D molecular structure */}
                  <div className="space-y-4">
                    {selectedDrug.smiles && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2, duration: 0.4 }}
                      >
                        <h3 className="font-bold mb-3 text-gray-900">{t('drugs.structure3d')}</h3>
                        <div className="relative border border-gray-200 rounded-xl overflow-hidden">
                          <MoleculeViewer
                            cid={selectedDrug.cid}
                            smiles={selectedDrug.smiles}
                            drugName={selectedDrug.name}
                          />
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
