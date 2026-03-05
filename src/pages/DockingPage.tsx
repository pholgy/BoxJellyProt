import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DatabaseService } from '../services/database';
import { runDockingSimulation } from '../services/simulation';
import { useLanguage } from '../i18n';
import { getRatingText } from '../i18n/translations';
import type { Protein, DrugCandidate, DockingResult } from '../types';
import { RESIDUE_DATA, Lang } from '../components/viewers/residueInfo';

/* ─── Helpers ─────────────────────────────────────────────── */

function generateHelixPDB(sequence: string): string {
  const residueMap: Record<string, string> = {
    A:'ALA',R:'ARG',N:'ASN',D:'ASP',C:'CYS',E:'GLU',Q:'GLN',G:'GLY',
    H:'HIS',I:'ILE',L:'LEU',K:'LYS',M:'MET',F:'PHE',P:'PRO',S:'SER',
    T:'THR',W:'TRP',Y:'TYR',V:'VAL',
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
      atom('N', R*Math.cos(a-0.3)*0.9, R*Math.sin(a-0.3)*0.9, z-0.5, 'N'),
      atom('CA', R*Math.cos(a), R*Math.sin(a), z, 'C'),
      atom('C', R*Math.cos(a+0.3)*1.1, R*Math.sin(a+0.3)*1.1, z+0.5, 'C'),
      atom('O', R*Math.cos(a+0.5)*1.3, R*Math.sin(a+0.5)*1.3, z+0.7, 'O'),
    );
  }
  const first = residueMap[sequence[0]] || 'ALA';
  const last = residueMap[sequence[Math.min(maxRes-1, sequence.length-1)]] || 'ALA';
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

async function fetchDrugSdf(drug: DrugCandidate): Promise<string | null> {
  const urls = [
    `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${drug.cid}/SDF?record_type=3d`,
    `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${drug.cid}/SDF?record_type=2d`,
    `https://cactus.nci.nih.gov/chemical/structure/${encodeURIComponent(drug.name)}/sdf?get3d=true`,
    `https://cactus.nci.nih.gov/chemical/structure/${encodeURIComponent(drug.smiles)}/sdf?get3d=true`,
  ];
  for (const url of urls) {
    const sdf = await fetchSdf(url);
    if (sdf) return sdf;
  }
  return null;
}

function ratingColor(a: number) {
  if (a <= -9) return { fg: '#34D399', bg: 'rgba(52,211,153,0.12)', label: 'Excellent' };
  if (a <= -7) return { fg: '#60A5FA', bg: 'rgba(96,165,250,0.12)', label: 'Good' };
  if (a <= -5) return { fg: '#FBBF24', bg: 'rgba(251,191,36,0.12)', label: 'Moderate' };
  if (a <= -3) return { fg: '#F87171', bg: 'rgba(248,113,113,0.12)', label: 'Weak' };
  return { fg: '#9CA3AF', bg: 'rgba(156,163,175,0.12)', label: 'Very Weak' };
}

/* ─── Selection Card Components ──────────────────────────── */

const ProteinCard: React.FC<{
  protein: Protein; selected: boolean; onClick: () => void;
}> = ({ protein, selected, onClick }) => (
  <button
    onClick={onClick}
    className={`
      w-full text-left p-3.5 rounded-xl border transition-all duration-200
      ${selected
        ? 'border-blue-400 bg-blue-50 shadow-md shadow-blue-100/50 ring-2 ring-blue-200'
        : 'border-gray-200 bg-white hover:border-blue-200 hover:shadow-sm'
      }
    `}
  >
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0 flex-1">
        <div className={`text-sm font-semibold truncate ${selected ? 'text-blue-900' : 'text-gray-900'}`}>
          {protein.name}
        </div>
        <div className={`text-xs italic mt-0.5 truncate ${selected ? 'text-blue-600' : 'text-gray-400'}`}>
          {protein.organism}
        </div>
      </div>
      {selected && (
        <div className="shrink-0 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      )}
    </div>
    <div className="mt-2 flex items-center gap-2 flex-wrap">
      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${selected ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
        {protein.length} aa
      </span>
      <span className={`text-[10px] px-1.5 py-0.5 rounded ${selected ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
        {protein.toxin_type}
      </span>
    </div>
  </button>
);

const DrugCard: React.FC<{
  drug: DrugCandidate; selected: boolean; onClick: () => void;
}> = ({ drug, selected, onClick }) => (
  <button
    onClick={onClick}
    className={`
      w-full text-left p-3.5 rounded-xl border transition-all duration-200
      ${selected
        ? 'border-emerald-400 bg-emerald-50 shadow-md shadow-emerald-100/50 ring-2 ring-emerald-200'
        : 'border-gray-200 bg-white hover:border-emerald-200 hover:shadow-sm'
      }
    `}
  >
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0 flex-1">
        <div className={`text-sm font-semibold truncate ${selected ? 'text-emerald-900' : 'text-gray-900'}`}>
          {drug.name}
        </div>
        <div className={`text-xs mt-0.5 truncate ${selected ? 'text-emerald-600' : 'text-gray-400'}`}>
          {drug.category}
        </div>
      </div>
      {selected && (
        <div className="shrink-0 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      )}
    </div>
    <div className="mt-2 flex items-center gap-2 flex-wrap">
      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${selected ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
        {drug.molecular_formula}
      </span>
      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${selected ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
        {drug.molecular_weight.toFixed(0)} g/mol
      </span>
    </div>
  </button>
);

/* ─── Simulation Loading Animation ───────────────────────── */

const DockingAnimation: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-16 gap-6">
    <div className="relative w-32 h-32">
      {/* Orbiting circles */}
      <motion.div
        className="absolute inset-0"
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-blue-500/20 border-2 border-blue-400" />
      </motion.div>
      <motion.div
        className="absolute inset-0"
        animate={{ rotate: -360 }}
        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
      >
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-emerald-500/20 border-2 border-emerald-400" />
      </motion.div>
      {/* Center pulsing core */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500/30 to-emerald-500/30 border border-white/20 backdrop-blur-sm" />
      </motion.div>
    </div>
    <div className="text-center">
      <div className="text-sm font-semibold text-gray-700">Simulating molecular docking...</div>
      <div className="text-xs text-gray-400 mt-1">Calculating binding affinity and interactions</div>
    </div>
  </div>
);

/* ─── Main Component ─────────────────────────────────────── */

export const DockingPage: React.FC = () => {
  const { language, t } = useLanguage();
  const lang = language as Lang;

  const [proteins, setProteins] = useState<Protein[]>([]);
  const [drugs, setDrugs] = useState<DrugCandidate[]>([]);
  const [selectedProtein, setSelectedProtein] = useState<Protein | null>(null);
  const [selectedDrug, setSelectedDrug] = useState<DrugCandidate | null>(null);
  const [result, setResult] = useState<DockingResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [viewerStatus, setViewerStatus] = useState<'idle' | 'loading' | 'loaded' | 'fallback'>('idle');
  const [proteinSearch, setProteinSearch] = useState('');
  const [drugSearch, setDrugSearch] = useState('');
  const [clickedResidue, setClickedResidue] = useState<{
    resn: string; resi: number; chain: string;
  } | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const viewerContainerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);

  useEffect(() => {
    Promise.all([
      DatabaseService.getAllProteins(),
      DatabaseService.getAllDrugs(),
    ]).then(([p, d]) => { setProteins(p); setDrugs(d); });
  }, []);

  const filteredProteins = proteins.filter(p =>
    p.name.toLowerCase().includes(proteinSearch.toLowerCase()) ||
    p.organism.toLowerCase().includes(proteinSearch.toLowerCase())
  );
  const filteredDrugs = drugs.filter(d =>
    d.name.toLowerCase().includes(drugSearch.toLowerCase()) ||
    d.category.toLowerCase().includes(drugSearch.toLowerCase())
  );

  const handleDock = useCallback(async () => {
    if (!selectedProtein || !selectedDrug) return;
    setIsRunning(true);
    setResult(null);
    setClickedResidue(null);
    setShowDetails(false);
    await new Promise(r => setTimeout(r, 1200)); // Show animation
    const res = runDockingSimulation(selectedProtein, selectedDrug, 42);
    setResult(res);
    setIsRunning(false);
  }, [selectedProtein, selectedDrug]);

  /* ─── 3D Viewer: protein + drug docked together ─── */
  useEffect(() => {
    if (!result) return;
    let cancelled = false;

    // Poll until container is mounted (AnimatePresence mode="wait" delays DOM mount)
    const pollInterval = setInterval(() => {
      if (cancelled) { clearInterval(pollInterval); return; }
      if (!viewerContainerRef.current) return; // not mounted yet, keep polling
      clearInterval(pollInterval);

      const init = async () => {
        setViewerStatus('loading');
        const $3Dmol = await import('3dmol');
        if (cancelled || !viewerContainerRef.current) return;

        if (viewerRef.current) {
          try { viewerRef.current.clear(); } catch { /* ok */ }
        }
        viewerContainerRef.current.innerHTML = '';

        const viewer = $3Dmol.createViewer(viewerContainerRef.current, {
          backgroundColor: '#0B1120',
          antialias: true,
        });
        viewerRef.current = viewer;

        const pocket = result.pocket;
        const pocketResi = pocket.residues
          .map(r => { const m = r.match(/Residue_(\d+)/); return m ? parseInt(m[1]) : null; })
          .filter((n): n is number => n !== null);

        const onAtomClick = (atom: any) => {
          if (!atom) return;
          setClickedResidue({ resn: atom.resn || '', resi: atom.resi || 0, chain: atom.chain || '' });
          viewer.removeAllLabels();
          viewer.addLabel(`${atom.resn || ''} ${atom.resi || ''}`, {
            position: { x: atom.x, y: atom.y, z: atom.z },
            backgroundColor: 'rgba(0,0,0,0.8)', fontColor: 'white',
            fontSize: 11, borderRadius: 4,
          } as any);
          viewer.render();
        };

        // 1. Load protein
        let pdbData: string | null = null;
        let isFallback = false;

        try {
          const apiResp = await fetch(`https://alphafold.ebi.ac.uk/api/prediction/${result.protein.uniprot_id}`);
          if (apiResp.ok) {
            const pred = await apiResp.json();
            const pdbUrl = Array.isArray(pred) ? pred[0]?.pdbUrl : pred?.pdbUrl;
            if (pdbUrl) {
              const pdbResp = await fetch(pdbUrl);
              if (pdbResp.ok) pdbData = await pdbResp.text();
            }
          }
        } catch { /* continue */ }

        if (!pdbData) {
          try {
            const v4 = await fetch(`https://alphafold.ebi.ac.uk/files/AF-${result.protein.uniprot_id}-F1-model_v4.pdb`);
            if (v4.ok) pdbData = await v4.text();
          } catch { /* continue */ }
        }

        if (!pdbData) {
          pdbData = generateHelixPDB(result.protein.sequence);
          isFallback = true;
        }

        if (cancelled) return;

        const proteinModel = viewer.addModel(pdbData, 'pdb');

        // ── STYLE LIKE REAL DOCKING SOFTWARE (PyMOL/ChimeraX) ──

        // Protein backbone: thin cartoon, grey/white - just for overall shape
        viewer.setStyle({ model: 0 }, {
          cartoon: { color: '#B0BEC5', opacity: 0.4 },
        });

        // Binding site residues: show as sticks (how PyMOL shows interacting residues)
        if (pocketResi.length > 0) {
          viewer.setStyle({ model: 0, resi: pocketResi }, {
            stick: { radius: 0.15, colorscheme: 'default' },
          });
        }

        // Calculate pocket center from real atoms
        const allAtoms = proteinModel.selectedAtoms({}) as any[];
        let cx = 0, cy = 0, cz = 0, count = 0;

        for (const atom of allAtoms) {
          if (atom.x == null || atom.y == null || atom.z == null) continue;
          if (pocketResi.includes(atom.resi ?? 0) && atom.atom === 'CA') {
            cx += atom.x; cy += atom.y; cz += atom.z; count++;
          }
        }
        if (count === 0) {
          for (const atom of allAtoms) {
            if (atom.x == null || atom.y == null || atom.z == null) continue;
            if (pocketResi.includes(atom.resi ?? 0)) {
              cx += atom.x; cy += atom.y; cz += atom.z; count++;
            }
          }
        }
        if (count === 0 && allAtoms.length > 0) {
          const mid = Math.floor(allAtoms.length * 0.4);
          for (let i = Math.max(0, mid - 20); i < Math.min(allAtoms.length, mid + 20); i++) {
            const a = allAtoms[i];
            if (a?.x == null || a?.y == null || a?.z == null) continue;
            cx += a.x; cy += a.y; cz += a.z; count++;
          }
        }

        const pocketCenter = count > 0
          ? { x: cx / count, y: cy / count, z: cz / count }
          : { x: 0, y: 0, z: 0 };

        // ── PROTEIN SURFACE: this is what makes it look like real docking ──
        // Full protein surface, translucent grey - shows the SHAPE and CAVITY
        viewer.addSurface(
          ($3Dmol as any).SurfaceType?.MS ?? 3,
          { opacity: 0.35, color: '#90A4AE' },
          { model: 0 },
          { model: 0 }
        );

        // Pocket surface: colored differently so you see WHERE the pocket is
        viewer.addSurface(
          ($3Dmol as any).SurfaceType?.MS ?? 3,
          { opacity: 0.5, color: '#EF5350' },
          { model: 0, resi: pocketResi },
          { model: 0, resi: pocketResi }
        );

        // 2. Load drug and place at binding pocket
        const drugSdf = await fetchDrugSdf(result.drug);
        if (cancelled) return;

        let hasDrug = false;
        if (drugSdf) {
          viewer.addModel(drugSdf, 'sdf');
          const drugModel = viewer.getModel(1);
          const drugAtoms = drugModel ? (drugModel.selectedAtoms({}) as any[]) : [];

          let dcx = 0, dcy = 0, dcz = 0, dcount = 0;
          for (const atom of drugAtoms) {
            if (atom.x == null || atom.y == null || atom.z == null) continue;
            dcx += atom.x; dcy += atom.y; dcz += atom.z; dcount++;
          }

          if (dcount > 0) {
            const drugCenter = { x: dcx / dcount, y: dcy / dcount, z: dcz / dcount };
            const dx = pocketCenter.x - drugCenter.x;
            const dy = pocketCenter.y - drugCenter.y;
            const dz = pocketCenter.z - drugCenter.z;
            for (const atom of drugAtoms) {
              if (atom.x != null) atom.x += dx;
              if (atom.y != null) atom.y += dy;
              if (atom.z != null) atom.z += dz;
            }
            hasDrug = true;
          }

          // Drug: bright colored ball-and-stick (how PyMOL shows ligands)
          viewer.setStyle({ model: 1 }, {
            stick: { radius: 0.2, colorscheme: 'greenCarbon' },
            sphere: { scale: 0.3, colorscheme: 'greenCarbon' },
          });
        }

        // ── Labels with ARROWS pointing to key features ──

        // Arrow pointing DOWN to binding pocket
        const arrowOffset = 18;
        const arrowStart = {
          x: pocketCenter.x, y: pocketCenter.y + arrowOffset, z: pocketCenter.z,
        };
        viewer.addArrow({
          start: arrowStart,
          end: { x: pocketCenter.x, y: pocketCenter.y + 4, z: pocketCenter.z },
          radius: 0.3, radiusRatio: 2.5, mid: 0.7,
          color: '#EF5350',
        } as any);
        viewer.addLabel('Binding Pocket', {
          position: { x: pocketCenter.x, y: pocketCenter.y + arrowOffset + 2, z: pocketCenter.z },
          backgroundColor: 'rgba(239,68,68,0.9)', fontColor: 'white',
          fontSize: 12, borderRadius: 6, padding: 5,
        } as any);

        if (hasDrug) {
          // Arrow pointing UP to drug molecule
          const drugLabelPos = {
            x: pocketCenter.x, y: pocketCenter.y - arrowOffset, z: pocketCenter.z,
          };
          viewer.addArrow({
            start: drugLabelPos,
            end: { x: pocketCenter.x, y: pocketCenter.y - 4, z: pocketCenter.z },
            radius: 0.3, radiusRatio: 2.5, mid: 0.7,
            color: '#10B981',
          } as any);
          viewer.addLabel(result.drug.name + ' (drug)', {
            position: { x: drugLabelPos.x, y: drugLabelPos.y - 2, z: drugLabelPos.z },
            backgroundColor: 'rgba(16,185,129,0.9)', fontColor: 'white',
            fontSize: 11, borderRadius: 6, padding: 5,
          } as any);

          // Arrow from the side pointing to protein surface
          viewer.addArrow({
            start: { x: pocketCenter.x + arrowOffset + 5, y: pocketCenter.y + 6, z: pocketCenter.z },
            end: { x: pocketCenter.x + 8, y: pocketCenter.y + 3, z: pocketCenter.z },
            radius: 0.25, radiusRatio: 2.5, mid: 0.7,
            color: '#90A4AE',
          } as any);
          viewer.addLabel('Protein Surface', {
            position: { x: pocketCenter.x + arrowOffset + 6, y: pocketCenter.y + 7, z: pocketCenter.z },
            backgroundColor: 'rgba(144,164,174,0.85)', fontColor: 'white',
            fontSize: 10, borderRadius: 6, padding: 4,
          } as any);
        }

        // ── H-bond dashed lines between drug atoms and pocket residue atoms ──
        let hbCount = 0;
        const pocketAtoms = allAtoms.filter(a =>
          a.x != null && a.y != null && a.z != null &&
          pocketResi.includes(a.resi ?? 0) &&
          (a.atom === 'N' || a.atom === 'O' || a.atom === 'CA')
        );

        if (hasDrug) {
          const drugModel = viewer.getModel(1);
          const drugAtoms = drugModel ? (drugModel.selectedAtoms({}) as any[]) : [];
          const drugHBondAtoms = drugAtoms.filter((a: any) =>
            a.x != null && a.elem && (a.elem === 'O' || a.elem === 'N')
          );

          // Draw H-bonds from drug O/N atoms to nearest pocket O/N atoms
          // Use arrows so the interaction direction is clear
          for (const dAtom of drugHBondAtoms) {
            if (hbCount >= result.hydrogen_bonds) break;
            let nearest = null as any;
            let minDist = Infinity;
            for (const pAtom of pocketAtoms) {
              const dist = Math.sqrt(
                (dAtom.x - pAtom.x) ** 2 + (dAtom.y - pAtom.y) ** 2 + (dAtom.z - pAtom.z) ** 2
              );
              if (dist < minDist) { minDist = dist; nearest = pAtom; }
            }
            if (nearest && minDist < 20) {
              // Dashed cylinder for the H-bond line
              viewer.addCylinder({
                start: { x: dAtom.x, y: dAtom.y, z: dAtom.z },
                end: { x: nearest.x, y: nearest.y, z: nearest.z },
                radius: 0.08, color: '#42A5F5', opacity: 0.85, dashed: true,
              } as any);
              // Small arrow head showing drug→protein interaction direction
              viewer.addArrow({
                start: { x: dAtom.x, y: dAtom.y, z: dAtom.z },
                end: { x: nearest.x, y: nearest.y, z: nearest.z },
                radius: 0.05, radiusRatio: 3, mid: 0.85,
                color: '#42A5F5', opacity: 0.7,
              } as any);
              // Label the first H-bond to explain what these dashed lines are
              if (hbCount === 0) {
                const midX = (dAtom.x + nearest.x) / 2;
                const midY = (dAtom.y + nearest.y) / 2;
                const midZ = (dAtom.z + nearest.z) / 2;
                viewer.addLabel('H-bond', {
                  position: { x: midX + 3, y: midY + 3, z: midZ },
                  backgroundColor: 'rgba(66,165,245,0.85)', fontColor: 'white',
                  fontSize: 9, borderRadius: 4, padding: 3,
                } as any);
              }
              hbCount++;
            }
          }
        }

        // Fallback H-bonds if drug didn't load
        if (hbCount === 0) {
          for (const atom of pocketAtoms) {
            if (hbCount >= result.hydrogen_bonds) break;
            viewer.addCylinder({
              start: pocketCenter,
              end: { x: atom.x, y: atom.y, z: atom.z },
              radius: 0.06, color: '#42A5F5', opacity: 0.6, dashed: true,
            } as any);
            hbCount++;
          }
        }

        viewer.setClickable({ model: 0 }, true, onAtomClick);

        // Zoom: center on binding pocket with surrounding protein context
        viewer.zoomTo();
        viewer.center({ model: 0, resi: pocketResi });
        viewer.zoom(1.3);
        viewer.rotate(25, 'y');
        viewer.render();
        setViewerStatus(isFallback ? 'fallback' : 'loaded');
      };

      init();
    }, 50); // poll every 50ms

    return () => { cancelled = true; clearInterval(pollInterval); };
  }, [result]);

  const handleReset = () => {
    setResult(null);
    setSelectedProtein(null);
    setSelectedDrug(null);
    setClickedResidue(null);
    setShowDetails(false);
    setViewerStatus('idle');
    setProteinSearch('');
    setDrugSearch('');
    if (viewerRef.current) { try { viewerRef.current.clear(); } catch { /* ok */ } viewerRef.current = null; }
  };

  const rc = result ? ratingColor(result.binding_affinity) : null;
  const rText = result ? getRatingText(result.binding_affinity, language) : '';

  /* ─── Render ─── */
  return (
    <div className="max-w-6xl mx-auto space-y-5">
      {/* Header */}
      <div className="glass-panel px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">{t('docking.title')}</h1>
            <p className="text-sm text-gray-400 mt-0.5">{t('docking.subtitle')}</p>
          </div>
          {result && (
            <button
              onClick={handleReset}
              className="text-sm font-medium text-blue-600 hover:text-blue-800 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
            >
              {t('docking.tryAnother')}
            </button>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* ═══ SELECTION PHASE ═══ */}
        {!result && !isRunning && (
          <motion.div
            key="selection"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-5"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Protein Selection */}
              <div className="glass-panel p-5">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold text-gray-800">{t('docking.selectProtein')}</h2>
                  {selectedProtein && (
                    <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                      {selectedProtein.name}
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  placeholder={language === 'th' ? 'ค้นหาโปรตีน...' : 'Search proteins...'}
                  value={proteinSearch}
                  onChange={e => setProteinSearch(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg mb-3 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all"
                />
                <div className="grid grid-cols-1 gap-2 max-h-[340px] overflow-y-auto pr-1 bio-scrollbar">
                  {filteredProteins.map(p => (
                    <ProteinCard
                      key={p.uniprot_id}
                      protein={p}
                      selected={selectedProtein?.uniprot_id === p.uniprot_id}
                      onClick={() => setSelectedProtein(
                        selectedProtein?.uniprot_id === p.uniprot_id ? null : p
                      )}
                    />
                  ))}
                  {filteredProteins.length === 0 && (
                    <div className="text-center py-8 text-sm text-gray-400">{t('common.noResults')}</div>
                  )}
                </div>
              </div>

              {/* Drug Selection */}
              <div className="glass-panel p-5">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold text-gray-800">{t('docking.selectDrug')}</h2>
                  {selectedDrug && (
                    <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      {selectedDrug.name}
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  placeholder={language === 'th' ? 'ค้นหาสารยา...' : 'Search drugs...'}
                  value={drugSearch}
                  onChange={e => setDrugSearch(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg mb-3 outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 transition-all"
                />
                <div className="grid grid-cols-1 gap-2 max-h-[340px] overflow-y-auto pr-1 bio-scrollbar">
                  {filteredDrugs.map(d => (
                    <DrugCard
                      key={d.cid}
                      drug={d}
                      selected={selectedDrug?.cid === d.cid}
                      onClick={() => setSelectedDrug(
                        selectedDrug?.cid === d.cid ? null : d
                      )}
                    />
                  ))}
                  {filteredDrugs.length === 0 && (
                    <div className="text-center py-8 text-sm text-gray-400">{t('common.noResults')}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Run Button */}
            <div className="flex flex-col items-center gap-2">
              <button
                className={`
                  relative px-10 py-3.5 rounded-xl text-sm font-semibold transition-all duration-300
                  ${selectedProtein && selectedDrug
                    ? 'bg-gray-900 text-white hover:bg-gray-800 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:shadow-md'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }
                `}
                disabled={!selectedProtein || !selectedDrug}
                onClick={handleDock}
              >
                {t('docking.runDocking')}
              </button>
              {(!selectedProtein || !selectedDrug) && (
                <p className="text-xs text-gray-400">{t('docking.selectBothFirst')}</p>
              )}
            </div>
          </motion.div>
        )}

        {/* ═══ SIMULATION RUNNING ═══ */}
        {isRunning && (
          <motion.div
            key="running"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass-panel"
          >
            <DockingAnimation />
          </motion.div>
        )}

        {/* ═══ RESULTS PHASE ═══ */}
        {result && !isRunning && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {/* ── Stats Bar ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div
                className="rounded-xl p-4 text-center border"
                style={{ backgroundColor: rc?.bg, borderColor: `${rc?.fg}33` }}
              >
                <div className="text-2xl font-bold font-mono" style={{ color: rc?.fg }}>
                  {result.binding_affinity}
                </div>
                <div className="text-[11px] text-gray-500 mt-0.5">kcal/mol</div>
                <div
                  className="inline-block mt-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold text-white"
                  style={{ backgroundColor: rc?.fg }}
                >
                  {rText}
                </div>
              </div>
              <div className="rounded-xl p-4 text-center bg-sky-50/80 border border-sky-100">
                <div className="text-2xl font-bold font-mono text-sky-600">{result.hydrogen_bonds}</div>
                <div className="text-[11px] text-gray-500 mt-0.5">{t('docking.hBonds')}</div>
              </div>
              <div className="rounded-xl p-4 text-center bg-violet-50/80 border border-violet-100">
                <div className="text-2xl font-bold font-mono text-violet-600">{result.hydrophobic_contacts}</div>
                <div className="text-[11px] text-gray-500 mt-0.5">{t('docking.hydrophobic')}</div>
              </div>
              <div className={`rounded-xl p-4 text-center border ${
                result.is_successful
                  ? 'bg-emerald-50/80 border-emerald-200'
                  : 'bg-red-50/80 border-red-200'
              }`}>
                <div className={`text-2xl font-bold ${result.is_successful ? 'text-emerald-500' : 'text-red-400'}`}>
                  {result.is_successful ? '✓' : '✗'}
                </div>
                <div className="text-[11px] text-gray-500 mt-0.5">
                  {result.is_successful ? t('docking.successful') : t('docking.unsuccessful')}
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-2.5 flex items-start gap-2.5">
              <span className="text-amber-500 text-sm mt-0.5">&#9888;</span>
              <div className="text-xs text-amber-800 leading-relaxed">
                <strong>{language === 'th' ? 'จำลองเพื่อการศึกษา' : 'Educational Simulation'}</strong>
                {' — '}
                {language === 'th'
                  ? 'การจับยากับโปรตีนนี้เป็นการจำลองด้วยอัลกอริทึม ไม่ใช่ผลจากการ docking จริง (เช่น AutoDock Vina) โครงสร้างโปรตีนมาจาก AlphaFold แต่ตำแหน่งที่จับและค่า binding affinity เป็นการประมาณ'
                  : 'This binding visualization is algorithmically simulated, not from real docking software (e.g. AutoDock Vina). Protein structures are from AlphaFold, but binding positions and affinity values are approximated.'}
              </div>
            </div>

            {/* ── 3D Viewer (HERO) ── */}
            <div className="rounded-2xl border border-gray-200 shadow-lg">
              {/* Viewer Header */}
              <div className="px-4 py-3 bg-[#0B1120] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 bg-blue-500/20 text-blue-300 text-xs font-medium rounded-md border border-blue-500/30">
                    {result.protein.name}
                  </span>
                  <span className="text-gray-500 text-xs">+</span>
                  <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-medium rounded-md border border-emerald-500/30">
                    {result.drug.name}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {viewerStatus === 'loading' && (
                    <span className="text-xs text-gray-500 flex items-center gap-1.5">
                      <span className="inline-block w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                      {t('viewer.loading')}
                    </span>
                  )}
                  {viewerStatus === 'fallback' && (
                    <span className="text-[10px] text-amber-400/80 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      Generated from sequence
                    </span>
                  )}
                  {viewerStatus === 'loaded' && (
                    <span className="text-[10px] text-emerald-400/80 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      AlphaFold
                    </span>
                  )}
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded hover:bg-white/10 transition-colors"
                  >
                    {showDetails ? 'Hide Details' : 'Show Details'}
                  </button>
                </div>
              </div>

              {/* Viewer Canvas */}
              <div className="relative bg-[#0B1120]">
                <div
                  ref={viewerContainerRef}
                  style={{ height: '520px', width: '100%', position: 'relative', cursor: 'crosshair' }}
                />

                {/* Floating legend */}
                <div className="absolute bottom-3 left-3 flex items-center gap-3 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/10">
                  <span className="flex items-center gap-1.5 text-[10px] text-gray-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-red-400 to-red-600" />
                    Binding Site
                  </span>
                  <span className="flex items-center gap-1.5 text-[10px] text-gray-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    {result.drug.name}
                  </span>
                  <span className="flex items-center gap-1.5 text-[10px] text-gray-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                    H-bonds
                  </span>
                </div>

                {/* Floating affinity badge */}
                <div
                  className="absolute top-3 right-3 rounded-lg px-3 py-2 border backdrop-blur-sm"
                  style={{
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    borderColor: `${rc?.fg}44`,
                  }}
                >
                  <div className="text-lg font-bold font-mono" style={{ color: rc?.fg }}>
                    {result.binding_affinity} <span className="text-[10px] font-normal text-gray-400">kcal/mol</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Clicked Residue Info ── */}
            <AnimatePresence>
              {clickedResidue && (() => {
                const info = RESIDUE_DATA[clickedResidue.resn];
                return (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="glass-panel p-4"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900">
                          {info?.name[lang] || clickedResidue.resn}
                        </span>
                        <span className="text-xs font-mono text-gray-500">
                          {clickedResidue.resn} {clickedResidue.resi}
                        </span>
                        {info && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${info.color}`}>
                            {info.typeLabel[lang]}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          setClickedResidue(null);
                          viewerRef.current?.removeAllLabels();
                          viewerRef.current?.render();
                        }}
                        className="text-xs text-gray-400 hover:text-gray-600"
                      >
                        {t('viewer.close')}
                      </button>
                    </div>
                    {info && (
                      <div className="space-y-2">
                        <p className="text-xs text-gray-600">{info.description[lang]}</p>
                        <div className="flex gap-1.5 flex-wrap">
                          {info.properties.map((p, i) => (
                            <span key={i} className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                              {p[lang]}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })()}
            </AnimatePresence>

            {/* ── Detail Panels (togglable) ── */}
            <AnimatePresence>
              {showDetails && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-1">
                    {/* Interaction Details */}
                    <div className="glass-panel p-5">
                      <h3 className="text-sm font-semibold text-gray-800 mb-3">{t('docking.interactionDetails')}</h3>
                      <div className="space-y-2.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-500">{t('docking.pocketId')}</span>
                          <span className="font-mono font-semibold">#{result.pocket.pocket_id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">{t('docking.pocketRadius')}</span>
                          <span className="font-mono">{result.pocket.radius.toFixed(1)} &Aring;</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">{t('docking.druggability')}</span>
                          <span
                            className="font-mono font-semibold"
                            style={{ color: result.pocket.druggability_score >= 0.7 ? '#059669' : '#D97706' }}
                          >
                            {(result.pocket.druggability_score * 100).toFixed(0)}%
                          </span>
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
                      <div className="space-y-2.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-500">{t('common.name')}</span>
                          <span className="font-semibold text-right max-w-[60%]">{result.protein.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">{t('common.organism')}</span>
                          <span className="italic text-right max-w-[60%]">{result.protein.organism}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">UniProt</span>
                          <span className="font-mono">{result.protein.uniprot_id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">{t('common.length')}</span>
                          <span className="font-mono">{result.protein.length} aa</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">{t('common.molecularWeight')}</span>
                          <span className="font-mono">{result.protein.molecular_weight.toLocaleString()} Da</span>
                        </div>
                        <div className="pt-2 mt-1 border-t border-gray-100">
                          <p className="text-gray-600">{result.protein.function}</p>
                        </div>
                      </div>
                    </div>

                    {/* Drug Info */}
                    <div className="glass-panel p-5">
                      <h3 className="text-sm font-semibold text-gray-800 mb-3">{t('docking.drugInfo')}</h3>
                      <div className="space-y-2.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-500">{t('common.name')}</span>
                          <span className="font-semibold">{result.drug.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">{t('common.category')}</span>
                          <span>{result.drug.category}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">CID</span>
                          <span className="font-mono">{result.drug.cid}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">{t('common.molecularFormula')}</span>
                          <span className="font-mono">{result.drug.molecular_formula}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">{t('common.molecularWeight')}</span>
                          <span className="font-mono">{result.drug.molecular_weight.toFixed(2)} g/mol</span>
                        </div>
                        <div className="pt-2 mt-1 border-t border-gray-100">
                          <p className="text-gray-600">{result.drug.mechanism}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
