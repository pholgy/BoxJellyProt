import React, { useEffect, useRef, useState, useCallback } from 'react';
import { RESIDUE_DATA, Lang } from './residueInfo';
import { useLanguage } from '../../i18n';

interface ProteinViewerProps {
  uniprotId: string;
  sequence: string;
  proteinName: string;
  height?: string;
}

type StyleMode = 'cartoon' | 'surface' | 'stick' | 'line' | 'sphere';
type ColorScheme = 'spectrum' | 'chain' | 'ss' | 'bfactor';

function generateHelixPDB(sequence: string): string {
  const residueMap: Record<string, string> = {
    'A': 'ALA', 'R': 'ARG', 'N': 'ASN', 'D': 'ASP', 'C': 'CYS',
    'E': 'GLU', 'Q': 'GLN', 'G': 'GLY', 'H': 'HIS', 'I': 'ILE',
    'L': 'LEU', 'K': 'LYS', 'M': 'MET', 'F': 'PHE', 'P': 'PRO',
    'S': 'SER', 'T': 'THR', 'W': 'TRP', 'Y': 'TYR', 'V': 'VAL',
  };

  const lines: string[] = [];
  const maxResidues = Math.min(sequence.length, 120);
  let atomNum = 1;

  const risePer = 1.5;
  const radiansPerResidue = (2 * Math.PI) / 3.6;
  const helixRadius = 2.3;

  for (let i = 0; i < maxResidues; i++) {
    const aa = sequence[i];
    const resName = residueMap[aa] || 'ALA';
    const resSeq = i + 1;
    const angle = i * radiansPerResidue;
    const z = i * risePer;

    const caX = (helixRadius * Math.cos(angle)).toFixed(3);
    const caY = (helixRadius * Math.sin(angle)).toFixed(3);
    const caZ = z.toFixed(3);

    const nX = (helixRadius * Math.cos(angle - 0.3) * 0.9).toFixed(3);
    const nY = (helixRadius * Math.sin(angle - 0.3) * 0.9).toFixed(3);
    const nZ = (z - 0.5).toFixed(3);

    const cX = (helixRadius * Math.cos(angle + 0.3) * 1.1).toFixed(3);
    const cY = (helixRadius * Math.sin(angle + 0.3) * 1.1).toFixed(3);
    const cZ = (z + 0.5).toFixed(3);

    const oX = (helixRadius * Math.cos(angle + 0.5) * 1.3).toFixed(3);
    const oY = (helixRadius * Math.sin(angle + 0.5) * 1.3).toFixed(3);
    const oZ = (z + 0.7).toFixed(3);

    lines.push(
      `ATOM  ${String(atomNum++).padStart(5)}  N   ${resName} A${String(resSeq).padStart(4)}    ${nX.padStart(8)}${nY.padStart(8)}${nZ.padStart(8)}  1.00  0.00           N`,
      `ATOM  ${String(atomNum++).padStart(5)}  CA  ${resName} A${String(resSeq).padStart(4)}    ${caX.padStart(8)}${caY.padStart(8)}${caZ.padStart(8)}  1.00  0.00           C`,
      `ATOM  ${String(atomNum++).padStart(5)}  C   ${resName} A${String(resSeq).padStart(4)}    ${cX.padStart(8)}${cY.padStart(8)}${cZ.padStart(8)}  1.00  0.00           C`,
      `ATOM  ${String(atomNum++).padStart(5)}  O   ${resName} A${String(resSeq).padStart(4)}    ${oX.padStart(8)}${oY.padStart(8)}${oZ.padStart(8)}  1.00  0.00           O`,
    );
  }

  lines.unshift(
    `HELIX    1  H1 ${residueMap[sequence[0]] || 'ALA'} A    1  ${residueMap[sequence[Math.min(maxResidues - 1, sequence.length - 1)]] || 'ALA'} A ${String(maxResidues).padStart(4)}  1                              ${String(maxResidues).padStart(3)}`
  );

  lines.push('END');
  return lines.join('\n');
}

function buildStyleSpec(style: StyleMode, color: ColorScheme): Record<string, any> {
  const colorValue = color === 'ss' ? 'ssJmol'
    : color === 'bfactor' ? 'bfactor'
    : color === 'chain' ? 'chain'
    : 'spectrum';

  const colorProp = (color === 'ss' || color === 'bfactor' || color === 'chain')
    ? { colorscheme: colorValue }
    : { color: colorValue };

  switch (style) {
    case 'cartoon':
      return { cartoon: { ...colorProp, opacity: 0.95 } };
    case 'surface':
      return { cartoon: { ...colorProp, opacity: 0.5 } };
    case 'stick':
      return { stick: { radius: 0.15, ...colorProp } };
    case 'line':
      return { line: { ...colorProp } };
    case 'sphere':
      return { sphere: { scale: 0.3, ...colorProp } };
    default:
      return { cartoon: { ...colorProp, opacity: 0.95 } };
  }
}

export const ProteinViewer: React.FC<ProteinViewerProps> = ({
  uniprotId,
  sequence,
  proteinName,
  height = '320px'
}) => {
  const { language, t } = useLanguage();
  const lang = language as Lang;
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const [status, setStatus] = useState<'loading' | 'loaded' | 'fallback' | 'error'>('loading');
  const [source, setSource] = useState<string>('');
  const [activeStyle, setActiveStyle] = useState<StyleMode>('cartoon');
  const [activeColor, setActiveColor] = useState<ColorScheme>('spectrum');
  const [spinning, setSpinning] = useState(false);
  const [clickedResidue, setClickedResidue] = useState<{
    resn: string; resi: number; chain: string; atom: string; elem: string;
  } | null>(null);

  const applyStyle = useCallback((style: StyleMode, color: ColorScheme) => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    const spec = buildStyleSpec(style, color);
    viewer.setStyle({}, spec);

    if (style === 'surface') {
      viewer.addSurface(
        0,
        {
          opacity: 0.7,
          colorscheme: color === 'spectrum' ? undefined : (
            color === 'ss' ? 'ssJmol' :
            color === 'bfactor' ? 'bfactor' :
            color === 'chain' ? 'chain' : undefined
          ),
        },
        {}
      );
    }

    viewer.render();
  }, []);

  const handleStyleChange = useCallback((style: StyleMode) => {
    setActiveStyle(style);
    const viewer = viewerRef.current;
    if (!viewer) return;
    viewer.removeAllSurfaces();
    applyStyle(style, activeColor);
  }, [activeColor, applyStyle]);

  const handleColorChange = useCallback((color: ColorScheme) => {
    setActiveColor(color);
    const viewer = viewerRef.current;
    if (!viewer) return;
    viewer.removeAllSurfaces();
    applyStyle(activeStyle, color);
  }, [activeStyle, applyStyle]);

  const handleSpinToggle = useCallback(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    if (spinning) {
      viewer.spin(false);
      setSpinning(false);
    } else {
      viewer.spin('y');
      setSpinning(true);
    }
  }, [spinning]);

  const handleReset = useCallback(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    viewer.spin(false);
    setSpinning(false);
    setActiveStyle('cartoon');
    setActiveColor('spectrum');
    viewer.removeAllSurfaces();
    applyStyle('cartoon', 'spectrum');
    viewer.zoomTo();
    viewer.rotate(45, 'y');
    viewer.render();
  }, [applyStyle]);

  useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;

    const init = async () => {
      const $3Dmol = await import('3dmol');
      if (cancelled || !containerRef.current) return;

      containerRef.current.innerHTML = '';

      const viewer = $3Dmol.createViewer(containerRef.current, {
        backgroundColor: '#F8F9FB',
        antialias: true,
      });
      viewerRef.current = viewer;

      const onAtomClick = (atom: any) => {
        if (!atom) return;
        setClickedResidue({
          resn: atom.resn || '',
          resi: atom.resi || 0,
          chain: atom.chain || '',
          atom: atom.atom || '',
          elem: atom.elem || '',
        });

        const label = `${atom.resn || ''} ${atom.resi || ''}`;
        viewer.removeAllLabels();
        viewer.addLabel(label, {
          position: { x: atom.x, y: atom.y, z: atom.z },
          backgroundColor: 'rgba(0,0,0,0.75)',
          fontColor: 'white',
          fontSize: 12,
        } as any);
        viewer.render();
      };

      const onAtomHover = (atom: any) => {
        if (!atom) {
          viewer.removeAllLabels();
          viewer.render();
          return;
        }
        const label = `${atom.resn || ''} ${atom.resi || ''}${atom.chain ? ':' + atom.chain : ''}`;
        viewer.removeAllLabels();
        viewer.addLabel(label, {
          position: { x: atom.x, y: atom.y, z: atom.z },
          backgroundColor: 'rgba(0,0,0,0.6)',
          fontColor: 'white',
          fontSize: 11,
        } as any);
        viewer.render();
      };

      const onAtomUnhover = () => {
        viewer.removeAllLabels();
        viewer.render();
      };

      const loadPdb = (pdbData: string, sourceName: string, isFallback: boolean) => {
        if (cancelled) return;
        viewer.addModel(pdbData, 'pdb');
        viewer.setStyle({}, { cartoon: { color: 'spectrum', opacity: 0.95 } });
        viewer.setClickable({}, true, onAtomClick);
        viewer.setHoverable({}, true, onAtomHover, onAtomUnhover);
        viewer.zoomTo();
        viewer.rotate(45, 'y');
        viewer.render();
        setStatus(isFallback ? 'fallback' : 'loaded');
        setSource(sourceName);
      };

      try {
        const apiUrl = `https://alphafold.ebi.ac.uk/api/prediction/${uniprotId}`;
        const apiResponse = await fetch(apiUrl);
        if (apiResponse.ok) {
          const predictions = await apiResponse.json();
          const pdbUrl = Array.isArray(predictions) ? predictions[0]?.pdbUrl : predictions?.pdbUrl;
          if (pdbUrl) {
            const pdbResponse = await fetch(pdbUrl);
            if (pdbResponse.ok) {
              loadPdb(await pdbResponse.text(), 'AlphaFold DB', false);
              return;
            }
          }
        }
      } catch {}

      try {
        const v4Url = `https://alphafold.ebi.ac.uk/files/AF-${uniprotId}-F1-model_v4.pdb`;
        const response = await fetch(v4Url);
        if (response.ok) {
          loadPdb(await response.text(), 'AlphaFold DB', false);
          return;
        }
      } catch {}

      if (!cancelled) {
        loadPdb(generateHelixPDB(sequence), 'Generated from sequence', true);
      }
    };

    init().catch(() => {
      if (!cancelled) setStatus('error');
    });

    return () => {
      cancelled = true;
      if (viewerRef.current) {
        try { viewerRef.current.clear(); } catch {}
      }
    };
  }, [uniprotId, sequence]);

  const isReady = status === 'loaded' || status === 'fallback';

  const STYLE_KEYS: { key: StyleMode; tKey: string }[] = [
    { key: 'cartoon', tKey: 'viewer.cartoon' },
    { key: 'surface', tKey: 'viewer.surface' },
    { key: 'stick', tKey: 'viewer.stick' },
    { key: 'line', tKey: 'viewer.line' },
    { key: 'sphere', tKey: 'viewer.sphere' },
  ];

  const COLOR_KEYS: { key: ColorScheme; tKey: string }[] = [
    { key: 'spectrum', tKey: 'viewer.spectrum' },
    { key: 'chain', tKey: 'viewer.chain' },
    { key: 'ss', tKey: 'viewer.ss' },
    { key: 'bfactor', tKey: 'viewer.bfactor' },
  ];

  const btnClass = (active: boolean) =>
    `viewer-btn px-2 py-1 text-xs rounded ${
      active
        ? 'bg-blue-500 text-white shadow-sm'
        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
    }`;

  return (
    <div role="img" aria-label={`3D protein structure of ${proteinName}`}>
      <div className="relative">
        <div
          ref={containerRef}
          style={{ height, width: '100%', position: 'relative', cursor: 'crosshair' }}
        />
        <div className="absolute bottom-2 left-2 flex items-center gap-2">
          {status === 'loading' && (
            <span className="viewer-status text-xs text-gray-400 bg-white/80 px-2 py-0.5 rounded">
              {t('viewer.loading')}
            </span>
          )}
          {status === 'loaded' && (
            <span className="viewer-status text-xs text-green-600 bg-white/80 px-2 py-0.5 rounded">
              {source}
            </span>
          )}
          {status === 'fallback' && (
            <span className="viewer-status text-xs text-amber-600 bg-white/80 px-2 py-0.5 rounded">
              {source}
            </span>
          )}
          {status === 'error' && (
            <span className="viewer-status text-xs text-red-500 bg-white/80 px-2 py-0.5 rounded">
              {t('viewer.failed')}
            </span>
          )}
        </div>
      </div>

      {/* Interactive Controls */}
      {isReady && (
        <div className="viewer-panel-enter border-t border-gray-100 bg-gray-50/50 px-3 py-2 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] text-gray-400 uppercase font-medium tracking-wider w-10 shrink-0">
              {t('viewer.style')}
            </span>
            <div className="flex gap-1 flex-wrap">
              {STYLE_KEYS.map(({ key, tKey }) => (
                <button key={key} className={btnClass(activeStyle === key)} onClick={() => handleStyleChange(key)}>
                  {t(tKey)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] text-gray-400 uppercase font-medium tracking-wider w-10 shrink-0">
              {t('viewer.color')}
            </span>
            <div className="flex gap-1 flex-wrap">
              {COLOR_KEYS.map(({ key, tKey }) => (
                <button key={key} className={btnClass(activeColor === key)} onClick={() => handleColorChange(key)}>
                  {t(tKey)}
                </button>
              ))}
            </div>
            <div className="ml-auto flex gap-1">
              <button className={btnClass(spinning)} onClick={handleSpinToggle}>
                {spinning ? t('viewer.stop') : t('viewer.spin')}
              </button>
              <button className={`${btnClass(false)} !bg-gray-200`} onClick={handleReset}>
                {t('viewer.reset')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Educational info panel */}
      {clickedResidue && (() => {
        const info = RESIDUE_DATA[clickedResidue.resn];
        return (
          <div className="viewer-panel-enter border-t border-gray-200 bg-white">
            <div className="flex items-start justify-between px-4 pt-3 pb-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-gray-900">
                  {info?.name[lang] || clickedResidue.resn}
                </span>
                <span className="text-xs font-mono text-gray-500">
                  {clickedResidue.resn} {clickedResidue.resi}{clickedResidue.chain ? ':' + clickedResidue.chain : ''}
                </span>
                {info && (
                  <span className={`viewer-badge-enter text-[10px] px-1.5 py-0.5 rounded-full font-medium ${info.color}`}>
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
                className="viewer-btn text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md px-2 py-1"
                aria-label="Close"
              >
                {t('viewer.close')}
              </button>
            </div>
            {info ? (
              <div className="px-4 pb-3 space-y-2">
                <p className="text-xs text-gray-600 leading-relaxed">{info.description[lang]}</p>
                <div>
                  <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1">
                    {t('viewer.whyItMatters')}
                  </p>
                  <p className="text-xs text-gray-600 leading-relaxed">{info.role[lang]}</p>
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {info.properties.map((p, i) => (
                    <span key={i} className="viewer-tag text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                      {p[lang]}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="px-4 pb-3">
                <p className="text-xs text-gray-500">
                  {t('viewer.atom')}: {clickedResidue.atom} ({clickedResidue.elem})
                </p>
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
};
