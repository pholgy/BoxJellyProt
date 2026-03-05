import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DatabaseService } from '../services/database';
import { runDockingSimulation } from '../services/simulation';
import { useLanguage } from '../i18n';
import { getRatingText } from '../i18n/translations';
import type { Protein, DrugCandidate, DockingResult } from '../types';
import { RESIDUE_DATA, Lang } from '../components/viewers/residueInfo';

// ── Helpers ──────────────────────────────────────────────────────

function generateHelixPDB(sequence: string): string {
  const residueMap: Record<string, string> = {
    'A': 'ALA', 'R': 'ARG', 'N': 'ASN', 'D': 'ASP', 'C': 'CYS',
    'E': 'GLU', 'Q': 'GLN', 'G': 'GLY', 'H': 'HIS', 'I': 'ILE',
    'L': 'LEU', 'K': 'LYS', 'M': 'MET', 'F': 'PHE', 'P': 'PRO',
    'S': 'SER', 'T': 'THR', 'W': 'TRP', 'Y': 'TYR', 'V': 'VAL',
  };
  const lines: string[] = [];
  const maxRes = Math.min(sequence.length, 120);
  let n = 1;
  const rise = 1.5, radPer = (2 * Math.PI) / 3.6, R = 2.3;
  for (let i = 0; i < maxRes; i++) {
    const res = residueMap[sequence[i]] || 'ALA';
    const seq = i + 1, a = i * radPer, z = i * rise;
    const fmt = (v: number) => v.toFixed(3).padStart(8);
    const atom = (nm: string, x: number, y: number, zz: number, el: string) =>
      `ATOM  ${String(n++).padStart(5)}  ${nm.padEnd(3)} ${res} A${String(seq).padStart(4)}    ${fmt(x)}${fmt(y)}${fmt(zz)}  1.00  0.00           ${el}`;
    lines.push(
      atom('N', R * Math.cos(a - 0.3) * 0.9, R * Math.sin(a - 0.3) * 0.9, z - 0.5, 'N'),
      atom('CA', R * Math.cos(a), R * Math.sin(a), z, 'C'),
      atom('C', R * Math.cos(a + 0.3) * 1.1, R * Math.sin(a + 0.3) * 1.1, z + 0.5, 'C'),
      atom('O', R * Math.cos(a + 0.5) * 1.3, R * Math.sin(a + 0.5) * 1.3, z + 0.7, 'O'),
    );
  }
  const first = residueMap[sequence[0]] || 'ALA';
  const last = residueMap[sequence[Math.min(maxRes - 1, sequence.length - 1)]] || 'ALA';
  lines.unshift(`HELIX    1  H1 ${first} A    1  ${last} A ${String(maxRes).padStart(4)}  1                              ${String(maxRes).padStart(3)}`);
  lines.push('END');
  return lines.join('\n');
}

async function fetchSdf(url: string): Promise<string | null> {
  try {
    const r = await fetch(url);
    if (!r.ok) return null;
    const t = await r.text();
    if (t.includes('V2000') || t.includes('V3000')) return t;
    return null;
  } catch { return null; }
}

function getRatingColor(a: number) {
  if (a <= -9) return '#059669';
  if (a <= -7) return '#2563EB';
  if (a <= -5) return '#D97706';
  if (a <= -3) return '#DC2626';
  return '#6B7280';
}
function getRatingBg(a: number) {
  if (a <= -9) return '#ECFDF5';
  if (a <= -7) return '#EFF6FF';
  if (a <= -5) return '#FFFBEB';
  if (a <= -3) return '#FEF2F2';
  return '#F9FAFB';
}

// ── Component ────────────────────────────────────────────────────

export const DockingPage: React.FC = () => {
  const { language, t } = useLanguage();
  const lang = language as Lang;

  const [proteins, setProteins] = useState<Protein[]>([]);
  const [drugs, setDrugs] = useState<DrugCandidate[]>([]);
  const [selectedProtein, setSelectedProtein] = useState<Protein | null>(null);
  const [selectedDrug, setSelectedDrug] = useState<DrugCandidate | null>(null);
  const [result, setResult] = useState<DockingResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [proteinStatus, setProteinStatus] = useState<'idle' | 'loading' | 'loaded' | 'fallback'>('idle');
  const [drugStatus, setDrugStatus] = useState<'idle' | 'loading' | 'loaded'>('idle');
  const [clickedResidue, setClickedResidue] = useState<{
    resn: string; resi: number; chain: string;
  } | null>(null);

  const proteinContainerRef = useRef<HTMLDivElement>(null);
  const drugContainerRef = useRef<HTMLDivElement>(null);
  const pViewerRef = useRef<any>(null);
  const dViewerRef = useRef<any>(null);

  // Load data
  useEffect(() => {
    Promise.all([
      DatabaseService.getAllProteins(),
      DatabaseService.getAllDrugs(),
    ]).then(([p, d]) => { setProteins(p); setDrugs(d); });
  }, []);

  // Run docking
  const handleDock = useCallback(async () => {
    if (!selectedProtein || !selectedDrug) return;
    setIsRunning(true);
    setResult(null);
    setClickedResidue(null);
    await new Promise(r => setTimeout(r, 500));
    const res = runDockingSimulation(selectedProtein, selectedDrug, 42);
    setResult(res);
    setIsRunning(false);
  }, [selectedProtein, selectedDrug]);

  // ── Protein 3D viewer ──
  useEffect(() => {
    if (!result) return;
    // Wait for DOM to have the container
    const timer = setTimeout(() => {
      if (!proteinContainerRef.current) return;
      let cancelled = false;

      const init = async () => {
        setProteinStatus('loading');
        const $3Dmol = await import('3dmol');
        if (cancelled || !proteinContainerRef.current) return;

        // Clear old viewer
        if (pViewerRef.current) {
          try { pViewerRef.current.clear(); } catch { /* ok */ }
        }
        proteinContainerRef.current.innerHTML = '';

        const viewer = $3Dmol.createViewer(proteinContainerRef.current, {
          backgroundColor: '#F8F9FB',
          antialias: true,
        });
        pViewerRef.current = viewer;

        const pocket = result.pocket;

        const onAtomClick = (atom: any) => {
          if (!atom) return;
          setClickedResidue({ resn: atom.resn || '', resi: atom.resi || 0, chain: atom.chain || '' });
          viewer.removeAllLabels();
          viewer.addLabel(`${atom.resn || ''} ${atom.resi || ''}`, {
            position: { x: atom.x, y: atom.y, z: atom.z },
            backgroundColor: 'rgba(0,0,0,0.75)', fontColor: 'white', fontSize: 12,
          } as any);
          viewer.render();
        };

        const loadPdb = (pdbData: string, isFallback: boolean) => {
          if (cancelled) return;

          const model = viewer.addModel(pdbData, 'pdb');

          // Base style: cartoon spectrum
          viewer.setStyle({}, { cartoon: { color: 'spectrum', opacity: 0.9 } });

          // Get pocket residue numbers from the simulation
          const pocketResi = pocket.residues
            .map(r => { const m = r.match(/Residue_(\d+)/); return m ? parseInt(m[1]) : null; })
            .filter((n): n is number => n !== null);

          // ── Calculate REAL binding pocket center from actual atom positions ──
          const allAtoms = model.selectedAtoms({}) as any[];
          let cx = 0, cy = 0, cz = 0, count = 0;

          if (pocketResi.length > 0 && allAtoms.length > 0) {
            // Find CA atoms in pocket residues
            for (const atom of allAtoms) {
              if (atom.x == null || atom.y == null || atom.z == null) continue;
              if (pocketResi.includes(atom.resi ?? 0) && atom.atom === 'CA') {
                cx += atom.x; cy += atom.y; cz += atom.z; count++;
              }
            }
            // Fallback: any atom in pocket residues
            if (count === 0) {
              for (const atom of allAtoms) {
                if (atom.x == null || atom.y == null || atom.z == null) continue;
                if (pocketResi.includes(atom.resi ?? 0)) {
                  cx += atom.x; cy += atom.y; cz += atom.z; count++;
                }
              }
            }
          }

          // If no pocket residues matched, use a region ~40% along the protein chain
          if (count === 0 && allAtoms.length > 0) {
            const midIdx = Math.floor(allAtoms.length * 0.4);
            const regionStart = Math.max(0, midIdx - 20);
            const regionEnd = Math.min(allAtoms.length, midIdx + 20);
            for (let i = regionStart; i < regionEnd; i++) {
              const a = allAtoms[i];
              if (a?.x == null || a?.y == null || a?.z == null) continue;
              cx += a.x; cy += a.y; cz += a.z; count++;
            }
          }

          const pocketCenter = count > 0
            ? { x: cx / count, y: cy / count, z: cz / count }
            : { x: 0, y: 0, z: 0 };

          // Calculate visual radius from spread of pocket atoms
          let maxDist = 0;
          if (count > 0) {
            for (const atom of allAtoms) {
              if (atom.x == null || atom.y == null || atom.z == null) continue;
              if (pocketResi.includes(atom.resi ?? 0)) {
                const dx = atom.x - pocketCenter.x, dy = atom.y - pocketCenter.y, dz = atom.z - pocketCenter.z;
                const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
                if (d > maxDist) maxDist = d;
              }
            }
          }
          const sphereRadius = Math.max(maxDist + 3, 6);

          // Highlight pocket residues in red with sticks
          if (pocketResi.length > 0) {
            viewer.setStyle({ resi: pocketResi }, {
              cartoon: { color: '#FF4444', opacity: 1.0 },
              stick: { radius: 0.15, color: '#FF6B6B' },
            });
          }

          // Translucent red sphere at REAL pocket location
          viewer.addSphere({
            center: pocketCenter,
            radius: sphereRadius,
            color: '#FF4444', opacity: 0.15,
          } as any);

          // Wireframe outline
          viewer.addSphere({
            center: pocketCenter,
            radius: sphereRadius,
            color: '#FF6666', opacity: 0.3, wireframe: true,
          } as any);

          // Label at pocket center
          viewer.addLabel('Binding Pocket', {
            position: pocketCenter,
            backgroundColor: 'rgba(220, 38, 38, 0.85)', fontColor: 'white', fontSize: 11,
          } as any);

          // H-bond indicator spheres around the REAL pocket
          for (let i = 0; i < result.hydrogen_bonds; i++) {
            const ang = (i / result.hydrogen_bonds) * Math.PI * 2;
            const hr = sphereRadius * 0.6;
            viewer.addSphere({
              center: {
                x: pocketCenter.x + hr * Math.cos(ang),
                y: pocketCenter.y + hr * Math.sin(ang),
                z: pocketCenter.z + (i - result.hydrogen_bonds / 2) * 1.5,
              },
              radius: 0.6, color: '#2563EB', opacity: 0.6,
            } as any);
          }

          // Draw dashed interaction lines from pocket center to pocket residue CAs
          let lineCount = 0;
          for (const atom of allAtoms) {
            if (lineCount >= 5) break;
            if (atom.x == null || atom.y == null || atom.z == null) continue;
            if (pocketResi.includes(atom.resi ?? 0) && atom.atom === 'CA') {
              viewer.addCylinder({
                start: pocketCenter,
                end: { x: atom.x, y: atom.y, z: atom.z },
                radius: 0.08, color: '#2563EB', opacity: 0.4, dashed: true,
              } as any);
              lineCount++;
            }
          }

          viewer.setClickable({}, true, onAtomClick);
          viewer.zoomTo();
          viewer.rotate(30, 'y');
          viewer.render();
          setProteinStatus(isFallback ? 'fallback' : 'loaded');
        };

        // Try AlphaFold API
        try {
          const apiResp = await fetch(`https://alphafold.ebi.ac.uk/api/prediction/${result.protein.uniprot_id}`);
          if (apiResp.ok) {
            const pred = await apiResp.json();
            const pdbUrl = Array.isArray(pred) ? pred[0]?.pdbUrl : pred?.pdbUrl;
            if (pdbUrl) {
              const pdbResp = await fetch(pdbUrl);
              if (pdbResp.ok) { loadPdb(await pdbResp.text(), false); return; }
            }
          }
        } catch { /* continue */ }

        // Try AlphaFold v4 direct
        try {
          const v4 = await fetch(`https://alphafold.ebi.ac.uk/files/AF-${result.protein.uniprot_id}-F1-model_v4.pdb`);
          if (v4.ok) { loadPdb(await v4.text(), false); return; }
        } catch { /* continue */ }

        // Fallback: generate helix
        if (!cancelled) loadPdb(generateHelixPDB(result.protein.sequence), true);
      };

      init();

      return () => { cancelled = true; };
    }, 100); // small delay to ensure DOM is mounted

    return () => clearTimeout(timer);
  }, [result]);

  // ── Drug 3D viewer ──
  useEffect(() => {
    if (!result) return;

    const timer = setTimeout(() => {
      if (!drugContainerRef.current) return;
      let cancelled = false;

      const init = async () => {
        setDrugStatus('loading');
        const $3Dmol = await import('3dmol');
        if (cancelled || !drugContainerRef.current) return;

        if (dViewerRef.current) {
          try { dViewerRef.current.clear(); } catch { /* ok */ }
        }
        drugContainerRef.current.innerHTML = '';

        const viewer = $3Dmol.createViewer(drugContainerRef.current, {
          backgroundColor: '#F8F9FB',
          antialias: true,
        });
        dViewerRef.current = viewer;

        const drug = result.drug;

        // Try PubChem 3D → PubChem 2D → NCI Cactus name → NCI Cactus SMILES
        const sdf3d = await fetchSdf(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${drug.cid}/SDF?record_type=3d`);
        if (!cancelled && sdf3d) {
          viewer.addModel(sdf3d, 'sdf');
          viewer.setStyle({}, { stick: { radius: 0.15, colorscheme: 'jmol' }, sphere: { scale: 0.25, colorscheme: 'jmol' } });
          viewer.zoomTo(); viewer.rotate(20, 'y'); viewer.spin('y'); viewer.render();
          setDrugStatus('loaded');
          return;
        }

        const sdf2d = await fetchSdf(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${drug.cid}/SDF?record_type=2d`);
        if (!cancelled && sdf2d) {
          viewer.addModel(sdf2d, 'sdf');
          viewer.setStyle({}, { stick: { radius: 0.15, colorscheme: 'jmol' }, sphere: { scale: 0.25, colorscheme: 'jmol' } });
          viewer.zoomTo(); viewer.rotate(20, 'y'); viewer.render();
          setDrugStatus('loaded');
          return;
        }

        const cactus = await fetchSdf(`https://cactus.nci.nih.gov/chemical/structure/${encodeURIComponent(drug.name)}/sdf?get3d=true`);
        if (!cancelled && cactus) {
          viewer.addModel(cactus, 'sdf');
          viewer.setStyle({}, { stick: { radius: 0.15, colorscheme: 'jmol' }, sphere: { scale: 0.25, colorscheme: 'jmol' } });
          viewer.zoomTo(); viewer.rotate(20, 'y'); viewer.spin('y'); viewer.render();
          setDrugStatus('loaded');
          return;
        }

        const cactusSmiles = await fetchSdf(`https://cactus.nci.nih.gov/chemical/structure/${encodeURIComponent(drug.smiles)}/sdf?get3d=true`);
        if (!cancelled && cactusSmiles) {
          viewer.addModel(cactusSmiles, 'sdf');
          viewer.setStyle({}, { stick: { radius: 0.15, colorscheme: 'jmol' }, sphere: { scale: 0.25, colorscheme: 'jmol' } });
          viewer.zoomTo(); viewer.rotate(20, 'y'); viewer.render();
          setDrugStatus('loaded');
          return;
        }

        // All failed - show label
        if (!cancelled) {
          viewer.addLabel(drug.name, {
            position: { x: 0, y: 0, z: 0 },
            backgroundColor: 'rgba(0,0,0,0.7)', fontColor: '#3B82F6', fontSize: 14,
          } as any);
          viewer.render();
          setDrugStatus('loaded');
        }
      };

      init();

      return () => { cancelled = true; };
    }, 100);

    return () => clearTimeout(timer);
  }, [result]);

  const handleReset = () => {
    setResult(null);
    setSelectedProtein(null);
    setSelectedDrug(null);
    setClickedResidue(null);
    setProteinStatus('idle');
    setDrugStatus('idle');
    if (pViewerRef.current) { try { pViewerRef.current.clear(); } catch { /* ok */ } pViewerRef.current = null; }
    if (dViewerRef.current) { try { dViewerRef.current.clear(); } catch { /* ok */ } dViewerRef.current = null; }
  };

  const rColor = result ? getRatingColor(result.binding_affinity) : '#6B7280';
  const rBg = result ? getRatingBg(result.binding_affinity) : '#F9FAFB';
  const rText = result ? getRatingText(result.binding_affinity, language) : '';

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Title */}
      <div className="glass-panel p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">{t('docking.title')}</h1>
        <p className="text-sm text-gray-500">{t('docking.subtitle')}</p>
      </div>

      {/* ── Selection ── */}
      {!result && (
        <div className="glass-panel p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">{t('docking.selectProtein')}</label>
              <select
                className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                value={selectedProtein?.uniprot_id || ''}
                onChange={e => setSelectedProtein(proteins.find(x => x.uniprot_id === e.target.value) || null)}
              >
                <option value="">{t('docking.proteinPlaceholder')}</option>
                {proteins.map(p => <option key={p.uniprot_id} value={p.uniprot_id}>{p.name} ({p.organism})</option>)}
              </select>
              {selectedProtein && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg text-xs space-y-1">
                  <div className="font-semibold text-blue-900">{selectedProtein.name}</div>
                  <div className="text-blue-700">{selectedProtein.organism}</div>
                  <div className="text-blue-600">{t('common.length')}: {selectedProtein.length} {t('common.aminoAcids')} | {selectedProtein.toxin_type}</div>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">{t('docking.selectDrug')}</label>
              <select
                className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                value={selectedDrug?.cid || ''}
                onChange={e => setSelectedDrug(drugs.find(x => x.cid === e.target.value) || null)}
              >
                <option value="">{t('docking.drugPlaceholder')}</option>
                {drugs.map(d => <option key={d.cid} value={d.cid}>{d.name} ({d.category})</option>)}
              </select>
              {selectedDrug && (
                <div className="mt-3 p-3 bg-emerald-50 rounded-lg text-xs space-y-1">
                  <div className="font-semibold text-emerald-900">{selectedDrug.name}</div>
                  <div className="text-emerald-700">{selectedDrug.category} - {selectedDrug.mechanism}</div>
                  <div className="text-emerald-600">{selectedDrug.molecular_formula} | {selectedDrug.molecular_weight.toFixed(2)} g/mol</div>
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-center pt-2">
            <button
              className="bio-button-primary px-8 py-3 text-base font-semibold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed"
              disabled={!selectedProtein || !selectedDrug || isRunning}
              onClick={handleDock}
            >
              {isRunning ? (
                <span className="flex items-center gap-2">
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t('docking.running')}
                </span>
              ) : t('docking.runDocking')}
            </button>
          </div>
          {(!selectedProtein || !selectedDrug) && (
            <p className="text-center text-xs text-gray-400">{t('docking.selectBothFirst')}</p>
          )}
        </div>
      )}

      {/* ── Results ── */}
      {result && (
        <>
          {/* Summary cards */}
          <div className="glass-panel p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">{t('docking.bindingResults')}</h2>
              <button className="text-sm text-blue-600 hover:text-blue-800 font-medium" onClick={handleReset}>
                {t('docking.tryAnother')}
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <div className="rounded-xl p-4 text-center" style={{ backgroundColor: rBg, border: `1px solid ${rColor}22` }}>
                <div className="text-2xl font-bold font-mono" style={{ color: rColor }}>{result.binding_affinity}</div>
                <div className="text-xs text-gray-500 mt-1">kcal/mol</div>
                <div className="inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-semibold text-white" style={{ backgroundColor: rColor }}>{rText}</div>
              </div>
              <div className="rounded-xl p-4 text-center bg-cyan-50 border border-cyan-100">
                <div className="text-2xl font-bold font-mono text-cyan-700">{result.hydrogen_bonds}</div>
                <div className="text-xs text-gray-500 mt-1">{t('docking.hBonds')}</div>
              </div>
              <div className="rounded-xl p-4 text-center bg-purple-50 border border-purple-100">
                <div className="text-2xl font-bold font-mono text-purple-700">{result.hydrophobic_contacts}</div>
                <div className="text-xs text-gray-500 mt-1">{t('docking.hydrophobic')}</div>
              </div>
              <div className={`rounded-xl p-4 text-center ${result.is_successful ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <div className={`text-2xl font-bold ${result.is_successful ? 'text-green-600' : 'text-red-500'}`}>{result.is_successful ? '✓' : '✗'}</div>
                <div className="text-xs text-gray-500 mt-1">{result.is_successful ? t('docking.successful') : t('docking.unsuccessful')}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md font-medium">{result.protein.name}</span>
              <span className="text-gray-400">+</span>
              <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded-md font-medium">{result.drug.name}</span>
            </div>
          </div>

          {/* 3D Viewers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Protein */}
            <div className="glass-panel">
              <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-800">{t('docking.proteinStructure')}</h3>
                {proteinStatus === 'loading' && (
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <span className="inline-block w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                    {t('viewer.loading')}
                  </span>
                )}
                {proteinStatus === 'fallback' && <span className="text-xs text-amber-500">Generated from sequence</span>}
                {proteinStatus === 'loaded' && <span className="text-xs text-green-500">AlphaFold</span>}
              </div>
              <div
                ref={proteinContainerRef}
                style={{ height: '420px', width: '100%', position: 'relative', cursor: 'crosshair' }}
              />
              <div className="px-4 py-2 border-t border-gray-200 bg-gray-50 text-xs text-gray-500">
                {t('docking.bindingPocketLabel')}
              </div>
            </div>

            {/* Drug */}
            <div className="glass-panel">
              <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-800">{t('docking.drugStructure')}</h3>
                {drugStatus === 'loading' && (
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <span className="inline-block w-3 h-3 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                    {t('viewer.loading')}
                  </span>
                )}
              </div>
              <div
                ref={drugContainerRef}
                style={{ height: '420px', width: '100%', position: 'relative', cursor: 'crosshair' }}
              />
              <div className="px-4 py-2 border-t border-gray-200 bg-gray-50 text-xs text-gray-500">
                {result.drug.name} - {result.drug.molecular_formula}
              </div>
            </div>
          </div>

          {/* Info panels */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Interaction Details */}
            <div className="glass-panel p-5">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">{t('docking.interactionDetails')}</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between"><span className="text-gray-500">{t('docking.pocketId')}</span><span className="font-mono font-semibold">#{result.pocket.pocket_id}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">{t('docking.pocketRadius')}</span><span className="font-mono">{result.pocket.radius.toFixed(1)} A</span></div>
                <div className="flex justify-between"><span className="text-gray-500">{t('docking.druggability')}</span>
                  <span className="font-mono font-semibold" style={{ color: result.pocket.druggability_score >= 0.7 ? '#059669' : '#D97706' }}>
                    {(result.pocket.druggability_score * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="flex justify-between"><span className="text-gray-500">{t('docking.pocketLocation')}</span>
                  <span className="font-mono text-[10px]">({result.pocket.center_x.toFixed(1)}, {result.pocket.center_y.toFixed(1)}, {result.pocket.center_z.toFixed(1)})</span>
                </div>
              </div>
              <div className="pt-3 mt-3 border-t border-gray-100">
                <div className="text-xs text-gray-500 mb-2">{t('docking.bindingSiteResidues')}</div>
                <div className="flex flex-wrap gap-1">
                  {result.pocket.residues.map((r, i) => (
                    <span key={i} className="text-[10px] px-1.5 py-0.5 bg-red-50 text-red-700 rounded font-mono">{r}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Protein Info */}
            <div className="glass-panel p-5">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">{t('docking.proteinInfo')}</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between"><span className="text-gray-500">{t('common.name')}</span><span className="font-semibold text-right max-w-[60%]">{result.protein.name}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">{t('common.organism')}</span><span className="text-right max-w-[60%] italic">{result.protein.organism}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">UniProt ID</span><span className="font-mono">{result.protein.uniprot_id}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">{t('common.length')}</span><span className="font-mono">{result.protein.length} aa</span></div>
                <div className="flex justify-between"><span className="text-gray-500">{t('common.molecularWeight')}</span><span className="font-mono">{result.protein.molecular_weight.toLocaleString()} Da</span></div>
                <div className="pt-2 border-t border-gray-100">
                  <span className="text-gray-500">{t('common.function')}</span>
                  <p className="mt-1 text-gray-700">{result.protein.function}</p>
                </div>
              </div>
            </div>

            {/* Drug Info */}
            <div className="glass-panel p-5">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">{t('docking.drugInfo')}</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between"><span className="text-gray-500">{t('common.name')}</span><span className="font-semibold">{result.drug.name}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">{t('common.category')}</span><span>{result.drug.category}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">PubChem CID</span><span className="font-mono">{result.drug.cid}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">{t('common.molecularFormula')}</span><span className="font-mono">{result.drug.molecular_formula}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">{t('common.molecularWeight')}</span><span className="font-mono">{result.drug.molecular_weight.toFixed(2)} g/mol</span></div>
                <div className="pt-2 border-t border-gray-100">
                  <span className="text-gray-500">{t('common.source')}</span>
                  <p className="mt-1 text-gray-700">{result.drug.source}</p>
                </div>
                <div>
                  <span className="text-gray-500">{t('drugs.mechanism')}</span>
                  <p className="mt-1 text-gray-700">{result.drug.mechanism}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Clicked residue info */}
          {clickedResidue && (() => {
            const info = RESIDUE_DATA[clickedResidue.resn];
            return (
              <div className="glass-panel p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">{info?.name[lang] || clickedResidue.resn}</span>
                    <span className="text-xs font-mono text-gray-500">{clickedResidue.resn} {clickedResidue.resi}</span>
                    {info && <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${info.color}`}>{info.typeLabel[lang]}</span>}
                  </div>
                  <button onClick={() => { setClickedResidue(null); pViewerRef.current?.removeAllLabels(); pViewerRef.current?.render(); }} className="text-xs text-gray-400 hover:text-gray-600">{t('viewer.close')}</button>
                </div>
                {info && (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-600">{info.description[lang]}</p>
                    <div className="flex gap-1.5 flex-wrap">
                      {info.properties.map((p, i) => <span key={i} className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">{p[lang]}</span>)}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </>
      )}
    </div>
  );
};
