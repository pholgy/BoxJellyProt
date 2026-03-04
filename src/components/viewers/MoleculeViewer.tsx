import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ELEMENT_DATA, Lang } from './residueInfo';
import { useLanguage } from '../../i18n';

interface MoleculeViewerProps {
  cid: string;
  smiles: string;
  drugName: string;
  height?: string;
}

type MolStyle = 'ball-stick' | 'stick' | 'sphere' | 'line' | 'surface';
type ColorScheme = 'jmol' | 'rasmol' | 'greenCarbon' | 'cyanCarbon';

export const MoleculeViewer: React.FC<MoleculeViewerProps> = ({
  cid,
  smiles,
  drugName,
  height = '330px'
}) => {
  const { language, t } = useLanguage();
  const lang = language as Lang;
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const [status, setStatus] = useState<'loading' | 'loaded' | 'fallback' | 'error'>('loading');
  const [source, setSource] = useState<string>('');
  const [activeStyle, setActiveStyle] = useState<MolStyle>('ball-stick');
  const [activeColor, setActiveColor] = useState<ColorScheme>('jmol');
  const [isSpinning, setIsSpinning] = useState(false);
  const [clickedElem, setClickedElem] = useState<{
    elem: string; serial: number; bonds: number;
  } | null>(null);

  const applyStyle = useCallback((style: MolStyle, color: ColorScheme) => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    viewer.removeAllSurfaces();
    const colorscheme = color;

    switch (style) {
      case 'ball-stick':
        viewer.setStyle({}, {
          stick: { radius: 0.15, colorscheme },
          sphere: { scale: 0.25, colorscheme }
        });
        break;
      case 'stick':
        viewer.setStyle({}, {
          stick: { radius: 0.15, colorscheme }
        });
        break;
      case 'sphere':
        viewer.setStyle({}, {
          sphere: { colorscheme }
        });
        break;
      case 'line':
        viewer.setStyle({}, {
          line: { colorscheme }
        });
        break;
      case 'surface':
        viewer.setStyle({}, {
          stick: { radius: 0.1, colorscheme, opacity: 0.4 }
        });
        viewer.addSurface('VDW', {
          opacity: 0.85,
          colorscheme,
        });
        break;
    }

    viewer.render();
  }, []);

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
        setClickedElem({
          elem: atom.elem || '',
          serial: atom.serial || 0,
          bonds: atom.bonds?.length || 0,
        });

        viewer.removeAllLabels();
        viewer.addLabel(atom.elem || '', {
          position: { x: atom.x, y: atom.y, z: atom.z },
          backgroundColor: 'rgba(0,0,0,0.75)',
          fontColor: 'white',
          fontSize: 12,
          borderRadius: 4,
          padding: 4,
        });
        viewer.render();
      };

      const onAtomHover = (atom: any) => {
        if (!atom) {
          viewer.removeAllLabels();
          viewer.render();
          return;
        }
        viewer.removeAllLabels();
        viewer.addLabel(atom.elem || '', {
          position: { x: atom.x, y: atom.y, z: atom.z },
          backgroundColor: 'rgba(0,0,0,0.6)',
          fontColor: 'white',
          fontSize: 11,
          borderRadius: 4,
          padding: 3,
        });
        viewer.render();
      };

      const onAtomUnhover = () => {
        viewer.removeAllLabels();
        viewer.render();
      };

      const setupInteraction = () => {
        viewer.setClickable({}, true, onAtomClick);
        viewer.setHoverable({}, true, onAtomHover, onAtomUnhover);
      };

      // Try PubChem 3D SDF first
      try {
        const pubchemUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/SDF?record_type=3d`;
        const response = await fetch(pubchemUrl);
        if (response.ok) {
          const sdfData = await response.text();
          if (sdfData.includes('V2000') || sdfData.includes('V3000')) {
            if (!cancelled) {
              viewer.addModel(sdfData, 'sdf');
              setupInteraction();
              applyStyle(activeStyle, activeColor);
              viewer.zoomTo();
              viewer.rotate(30, 'y');
              viewer.render();
              setStatus('loaded');
              setSource('PubChem 3D');
              return;
            }
          }
        }
      } catch {}

      // Try PubChem 2D SDF as fallback
      try {
        const pubchem2dUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/SDF?record_type=2d`;
        const response = await fetch(pubchem2dUrl);
        if (response.ok) {
          const sdfData = await response.text();
          if (sdfData.includes('V2000') || sdfData.includes('V3000')) {
            if (!cancelled) {
              viewer.addModel(sdfData, 'sdf');
              setupInteraction();
              applyStyle(activeStyle, activeColor);
              viewer.zoomTo();
              viewer.render();
              setStatus('loaded');
              setSource('PubChem 2D');
              return;
            }
          }
        }
      } catch {}

      // Final fallback: SMILES
      if (!cancelled && smiles) {
        try {
          viewer.addModel(smiles, 'smi');
          setupInteraction();
          applyStyle(activeStyle, activeColor);
          viewer.zoomTo();
          viewer.render();
          setStatus('fallback');
          setSource('SMILES');
        } catch {
          setStatus('error');
        }
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
  }, [cid, smiles]);

  const handleStyleChange = (style: MolStyle) => {
    setActiveStyle(style);
    applyStyle(style, activeColor);
  };

  const handleColorChange = (color: ColorScheme) => {
    setActiveColor(color);
    applyStyle(activeStyle, color);
  };

  const handleSpin = () => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    if (isSpinning) {
      viewer.spin(false);
    } else {
      viewer.spin('y');
    }
    setIsSpinning(!isSpinning);
  };

  const handleReset = () => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    viewer.spin(false);
    setIsSpinning(false);
    setActiveStyle('ball-stick');
    setActiveColor('jmol');
    applyStyle('ball-stick', 'jmol');
    viewer.zoomTo();
    viewer.rotate(30, 'y');
    viewer.render();
  };

  const STYLE_KEYS: { key: MolStyle; tKey: string }[] = [
    { key: 'ball-stick', tKey: 'viewer.ballStick' },
    { key: 'stick', tKey: 'viewer.stick' },
    { key: 'sphere', tKey: 'viewer.sphere' },
    { key: 'line', tKey: 'viewer.line' },
    { key: 'surface', tKey: 'viewer.surface' },
  ];

  const COLOR_KEYS: { key: ColorScheme; tKey: string }[] = [
    { key: 'jmol', tKey: 'viewer.jmol' },
    { key: 'rasmol', tKey: 'viewer.rasmol' },
    { key: 'greenCarbon', tKey: 'viewer.greenC' },
    { key: 'cyanCarbon', tKey: 'viewer.cyanC' },
  ];

  const btnClass = (active: boolean) =>
    `viewer-btn px-2 py-1 text-xs rounded ${
      active
        ? 'bg-blue-500 text-white shadow-sm'
        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
    }`;

  return (
    <div role="img" aria-label={`3D molecular structure of ${drugName}`}>
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
      {status !== 'loading' && status !== 'error' && (
        <div className="viewer-panel-enter border-t border-gray-100 bg-gray-50/50 px-3 py-2 space-y-2 rounded-b-xl">
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
              <button className={btnClass(isSpinning)} onClick={handleSpin}>
                {isSpinning ? t('viewer.stop') : t('viewer.spin')}
              </button>
              <button className={`${btnClass(false)} !bg-gray-200`} onClick={handleReset}>
                {t('viewer.reset')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Educational info panel */}
      {clickedElem && (() => {
        const info = ELEMENT_DATA[clickedElem.elem];
        return (
          <div className="viewer-panel-enter border-t border-gray-200 bg-white">
            <div className="flex items-start justify-between px-4 pt-3 pb-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-gray-900">
                  {info?.name[lang] || clickedElem.elem}
                </span>
                <span className="text-xs font-mono text-gray-500">
                  {t('viewer.atom')} #{clickedElem.serial} ({clickedElem.bonds} {t('viewer.bonds')})
                </span>
                {info && (
                  <span className={`viewer-badge-enter text-[10px] px-1.5 py-0.5 rounded-full font-medium ${info.color}`}>
                    {info.symbol}
                  </span>
                )}
              </div>
              <button
                onClick={() => {
                  setClickedElem(null);
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
                    {t('viewer.roleInDrugs')}
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
                  {clickedElem.elem} - {t('viewer.atom')} #{clickedElem.serial}
                </p>
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
};
