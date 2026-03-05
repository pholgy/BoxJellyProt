import React, { useState } from 'react';
import { OrganicFlowDemo } from './OrganicFlowDemo';
import { ClinicalDemo } from './ClinicalDemo';
import './DesignDemo.css';

/* ── Mock Data ── */
const DRUGS = [
  { name: 'Tetrodotoxin', mw: '319.27', target: 'Nav1.4', affinity: '2.1 nM', type: 'Neurotoxin' },
  { name: 'Lidocaine', mw: '234.34', target: 'Nav1.5', affinity: '180 nM', type: 'Anesthetic' },
  { name: 'Conotoxin', mw: '1,264.5', target: 'nAChR', affinity: '0.8 nM', type: 'Peptide' },
  { name: 'Silymarin', mw: '482.44', target: 'CYP3A4', affinity: '45 \u03BCM', type: 'Flavonoid' },
  { name: 'Captopril', mw: '217.28', target: 'ACE', affinity: '6.9 nM', type: 'Inhibitor' },
];

const STATS = { proteins: 12, drugs: 48, simulations: 156 };

const DETAIL = {
  name: 'CfTX-1',
  organism: 'Chironex fleckeri',
  length: '436 aa',
  mass: '46.8 kDa',
  pI: '5.42',
  family: 'CfTX toxin family',
  pdb: '6D1T',
  function: 'Pore-forming toxin',
};

const NAV_ITEMS = ['Dashboard', 'Proteins', 'Drugs', 'Simulation', 'Results', 'Export'];
const NAV_ICONS = ['\u25A3', '\u03B1', '\u2B22', '\u2697', '\u2261', '\u21E3'];

/* ── Card background mini-previews ── */
const CARD_COLORS: Record<number, { bg: string; accent: string }> = {
  1: { bg: '#060a12', accent: '#00f0ff' },
  2: { bg: '#faf7f2', accent: '#c44d2b' },
  3: { bg: '#f5f5f7', accent: '#007aff' },
  4: { bg: '#1a1640', accent: '#8b5cf6' },
  5: { bg: '#0d1117', accent: '#39ff14' },
  6: { bg: '#fefcf9', accent: '#00b894' },
  7: { bg: '#F9FAFB', accent: '#111827' },
};

/* ═══════════════════════════════════════════
   GALLERY
   ═══════════════════════════════════════════ */
const Gallery: React.FC<{ onSelect: (n: number) => void }> = ({ onSelect }) => (
  <div className="demo-gallery">
    <h1>Layout Concepts</h1>
    <p className="subtitle">Seven approaches to presenting the BoxJellyProt research interface</p>
    <div className="demo-grid">
      {[
        { id: 7, title: 'Clinical White', desc: 'Apple/Stripe-inspired. Ultra-clean, precise spacing, monochrome with surgical precision. Full interactive demo.' },
        { id: 1, title: 'Command Center', desc: 'Dense, dark, mission-control aesthetic. Monospace typography, cyan accents, multi-panel grid.' },
        { id: 2, title: 'Editorial Science', desc: 'Magazine-style layout with serif typography, warm tones, and asymmetric composition.' },
        { id: 3, title: 'Bento Box', desc: 'Apple-inspired modular containers with pill navigation, rounded cards, system fonts.' },
        { id: 4, title: 'Floating Glass', desc: 'Glassmorphism panels over gradient backgrounds, purple/blue accents, depth layering.' },
        { id: 5, title: 'Neo-Terminal', desc: 'Retro CRT terminal aesthetic with phosphor green, scanlines, monospace everything.' },
        { id: 6, title: 'Organic Flow', desc: 'Soft pastel blobs, rounded cards, warm whites, playful but professional.' },
      ].map(c => (
        <div key={c.id} className="demo-card" onClick={() => onSelect(c.id)}>
          <div
            className="demo-card-bg"
            style={{
              background: CARD_COLORS[c.id].bg,
              border: `1px solid ${CARD_COLORS[c.id].accent}22`,
            }}
          >
            {/* Mini-preview decorative elements */}
            <div style={{
              position: 'absolute', top: '20%', left: '10%', right: '10%', bottom: '40%',
              border: `1px solid ${CARD_COLORS[c.id].accent}30`,
              borderRadius: c.id === 3 || c.id === 6 ? '16px' : '4px',
            }} />
            <div style={{
              position: 'absolute', bottom: '20%', left: '10%', width: '35%', height: '15%',
              background: `${CARD_COLORS[c.id].accent}15`,
              borderRadius: c.id === 3 || c.id === 6 ? '12px' : '4px',
            }} />
            <div style={{
              position: 'absolute', bottom: '20%', right: '10%', width: '35%', height: '15%',
              background: `${CARD_COLORS[c.id].accent}10`,
              borderRadius: c.id === 3 || c.id === 6 ? '12px' : '4px',
            }} />
          </div>
          <div className="demo-card-content">
            <span className="demo-card-number">Concept {c.id}</span>
            <h3>{c.title}</h3>
            <p>{c.desc}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

/* ═══════════════════════════════════════════
   CONCEPT 1: COMMAND CENTER
   ═══════════════════════════════════════════ */
const CommandCenter: React.FC = () => (
  <div className="c1">
    <div className="topbar">
      <span className="topbar-title">BoxJellyProt // Toxin Analysis</span>
      <div className="topbar-stats">
        STATUS: <span>ONLINE</span> | NODES: <span>3</span> | UPTIME: <span>99.7%</span>
      </div>
    </div>
    <div className="main-grid">
      <div className="sidenav">
        {NAV_ICONS.map((icon, i) => (
          <button key={i} className={i === 0 ? 'active' : ''} title={NAV_ITEMS[i]}>{icon}</button>
        ))}
      </div>
      <div className="panel">
        <div className="panel-title">Protein Detail // CfTX-1</div>
        <div className="viewer-placeholder">[ 3D Molecular Viewer ]</div>
        <div style={{ marginTop: '0.75rem' }}>
          {Object.entries(DETAIL).map(([k, v]) => (
            <div className="data-row" key={k}>
              <span className="label">{k.toUpperCase()}</span>
              <span className="value">{v}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="panel">
        <div className="panel-title">System Metrics</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
          {[
            { label: 'PROTEINS', val: STATS.proteins },
            { label: 'DRUGS', val: STATS.drugs },
            { label: 'SIMS', val: STATS.simulations },
          ].map(s => (
            <div key={s.label} style={{ background: '#060a12', border: '1px solid #00f0ff15', borderRadius: '4px', padding: '0.75rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#00f0ff' }}>{s.val}</div>
              <div style={{ fontSize: '0.55rem', color: '#506070', letterSpacing: '0.1em' }}>{s.label}</div>
            </div>
          ))}
        </div>
        <div className="panel-title">Activity Log</div>
        {['Simulation #156 completed', 'CfTX-2 structure resolved', 'Tetrodotoxin docking finished', 'New PDB entry: 6D1T'].map((log, i) => (
          <div className="data-row" key={i}>
            <span className="label">{`T-${(i + 1) * 4}m`}</span>
            <span className="value">{log}</span>
          </div>
        ))}
      </div>
      <div className="panel table-grid">
        <div className="panel-title">Drug Compounds Database</div>
        <table>
          <thead>
            <tr>
              <th>Compound</th><th>MW (Da)</th><th>Target</th><th>Affinity</th><th>Type</th>
            </tr>
          </thead>
          <tbody>
            {DRUGS.map(d => (
              <tr key={d.name}>
                <td style={{ color: '#00f0ff' }}>{d.name}</td>
                <td>{d.mw}</td><td>{d.target}</td><td>{d.affinity}</td><td>{d.type}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

/* ═══════════════════════════════════════════
   CONCEPT 2: EDITORIAL SCIENCE
   ═══════════════════════════════════════════ */
const Editorial: React.FC = () => (
  <div className="c2">
    <div className="topnav">
      <span className="topnav-logo">BoxJellyProt</span>
      <div className="topnav-links">
        {NAV_ITEMS.map((item, i) => (
          <a key={item} className={i === 1 ? 'active' : ''}>{item}</a>
        ))}
      </div>
    </div>
    <div className="hero">
      <h1>Understanding <em>Box Jellyfish</em> Toxin Mechanisms</h1>
      <p>
        A comprehensive analysis platform for studying Chironex fleckeri
        toxin proteins and their molecular interactions with therapeutic compounds.
      </p>
    </div>
    <div className="stat-row">
      {[
        { num: STATS.proteins, desc: 'Toxin proteins catalogued' },
        { num: STATS.drugs, desc: 'Drug compounds analyzed' },
        { num: STATS.simulations, desc: 'Docking simulations run' },
      ].map(s => (
        <div className="stat-item" key={s.desc}>
          <div className="num">{s.num}</div>
          <div className="desc">{s.desc}</div>
        </div>
      ))}
    </div>
    <div className="editorial-grid" style={{ paddingTop: '3rem' }}>
      <div>
        <div className="pullquote">
          CfTX-1 demonstrates remarkable specificity for mammalian cardiac ion channels,
          making it both a potent venom component and a promising pharmacological tool.
        </div>
        <div className="viewer-placeholder">[ 3D Protein Structure ]</div>
      </div>
      <div className="detail-card">
        <h3>CfTX-1 Protein Profile</h3>
        {Object.entries(DETAIL).map(([k, v]) => (
          <div className="detail-row" key={k}>
            <span className="label">{k.charAt(0).toUpperCase() + k.slice(1)}</span>
            <span>{v}</span>
          </div>
        ))}
        <div style={{ marginTop: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>Drug Interactions</h3>
          {DRUGS.slice(0, 3).map(d => (
            <div className="detail-row" key={d.name}>
              <span style={{ color: '#c44d2b', fontWeight: 500 }}>{d.name}</span>
              <span className="label">{d.affinity}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

/* ═══════════════════════════════════════════
   CONCEPT 3: BENTO BOX
   ═══════════════════════════════════════════ */
const BentoBox: React.FC = () => (
  <div className="c3">
    <div className="topbar">
      <h1>BoxJellyProt</h1>
      <div className="pill-nav">
        {NAV_ITEMS.map((item, i) => (
          <button key={item} className={i === 0 ? 'active' : ''}>{item}</button>
        ))}
      </div>
    </div>
    <div className="bento">
      {/* Stats row */}
      {[
        { num: STATS.proteins, desc: 'Proteins' },
        { num: STATS.drugs, desc: 'Drugs' },
      ].map(s => (
        <div className="bento-item bento-stat" key={s.desc}>
          <div className="num">{s.num}</div>
          <div className="desc">{s.desc}</div>
        </div>
      ))}

      {/* 3D viewer */}
      <div className="bento-item bento-viewer">
        <div className="placeholder">[ 3D Molecular Viewer ]</div>
      </div>

      {/* Detail panel */}
      <div className="bento-item bento-detail">
        <div style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#86868b', marginBottom: '0.75rem' }}>
          Protein Detail
        </div>
        {Object.entries(DETAIL).slice(0, 5).map(([k, v]) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', fontSize: '0.85rem', borderBottom: '1px solid #f0f0f5' }}>
            <span style={{ color: '#86868b' }}>{k.charAt(0).toUpperCase() + k.slice(1)}</span>
            <span style={{ fontWeight: 500 }}>{v}</span>
          </div>
        ))}
      </div>
      <div className="bento-item bento-detail">
        <div style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#86868b', marginBottom: '0.75rem' }}>
          Quick Actions
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {['Run Simulation', 'Export PDB', 'View Alignment', 'Compare Sequences'].map(a => (
            <span key={a} className="tag blue" style={{ cursor: 'pointer' }}>{a}</span>
          ))}
        </div>
      </div>

      {/* Full-width table */}
      <div className="bento-item bento-table">
        <table>
          <thead>
            <tr>
              <th>Compound</th><th>MW (Da)</th><th>Target</th><th>Affinity</th><th>Type</th>
            </tr>
          </thead>
          <tbody>
            {DRUGS.map(d => (
              <tr key={d.name}>
                <td style={{ fontWeight: 500 }}>{d.name}</td>
                <td>{d.mw}</td><td>{d.target}</td><td>{d.affinity}</td>
                <td><span className={`tag ${d.type === 'Neurotoxin' ? 'orange' : d.type === 'Peptide' ? 'green' : 'blue'}`}>{d.type}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

/* ═══════════════════════════════════════════
   CONCEPT 4: FLOATING GLASS
   ═══════════════════════════════════════════ */
const FloatingGlass: React.FC = () => (
  <div className="c4">
    <div className="glass glass-nav">
      <h1>BoxJellyProt</h1>
      <div className="glass-nav-links">
        {NAV_ITEMS.map((item, i) => (
          <button key={item} className={i === 0 ? 'active' : ''}>{item}</button>
        ))}
      </div>
    </div>

    <div className="glass-stat-row">
      {[
        { num: STATS.proteins, desc: 'Toxin Proteins' },
        { num: STATS.drugs, desc: 'Drug Compounds' },
        { num: STATS.simulations, desc: 'Simulations' },
      ].map(s => (
        <div className="glass glass-stat" key={s.desc}>
          <div className="num">{s.num}</div>
          <div className="desc">{s.desc}</div>
        </div>
      ))}
    </div>

    <div className="glass-grid">
      <div className="glass glass-panel">
        <h3>Protein Detail</h3>
        {Object.entries(DETAIL).map(([k, v]) => (
          <div className="detail-row" key={k}>
            <span className="label">{k.charAt(0).toUpperCase() + k.slice(1)}</span>
            <span>{v}</span>
          </div>
        ))}
      </div>
      <div className="glass glass-panel">
        <h3>3D Visualization</h3>
        <div className="viewer-placeholder">[ 3D Molecular Viewer ]</div>
      </div>
    </div>

    <div className="glass glass-table">
      <table>
        <thead>
          <tr>
            <th>Compound</th><th>Molecular Weight</th><th>Target</th><th>Binding Affinity</th><th>Classification</th>
          </tr>
        </thead>
        <tbody>
          {DRUGS.map(d => (
            <tr key={d.name}>
              <td style={{ color: '#c084fc' }}>{d.name}</td>
              <td>{d.mw} Da</td><td>{d.target}</td><td>{d.affinity}</td><td>{d.type}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

/* ═══════════════════════════════════════════
   CONCEPT 5: NEO-TERMINAL
   ═══════════════════════════════════════════ */
const NeoTerminal: React.FC = () => (
  <div className="c5">
    <div className="term-header">
      <span className="title">boxjellyprot@research:~$</span>
      <div className="term-tabs">
        {NAV_ITEMS.map((item, i) => (
          <button key={item} className={i === 0 ? 'active' : ''}>{item.toLowerCase()}</button>
        ))}
      </div>
    </div>
    <div className="term-body">
      <div className="term-panel">
        <div className="section-title">// protein.detail</div>
        <div className="prompt">
          <span className="cmd">$ query</span> <span className="arg">--protein</span> <span className="val">CfTX-1</span>
          <span className="cursor-blink" />
        </div>
        <div style={{ marginTop: '0.75rem' }}>
          {Object.entries(DETAIL).map(([k, v]) => (
            <div className="data-line" key={k}>
              <span className="key">{k}:</span>
              <span className="val">{v}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: '1rem' }}>
          <div className="section-title">// 3d.viewer</div>
          <div className="viewer-placeholder">[ 3D Molecular Viewer ]</div>
        </div>
      </div>
      <div className="term-panel">
        <div className="section-title">// system.stats</div>
        <div className="prompt" style={{ marginBottom: '0.75rem' }}>
          <span className="cmd">$ status</span> <span className="arg">--all</span>
        </div>
        {[
          { key: 'proteins', val: `${STATS.proteins} loaded` },
          { key: 'drugs', val: `${STATS.drugs} compounds` },
          { key: 'simulations', val: `${STATS.simulations} completed` },
          { key: 'uptime', val: '14d 6h 23m' },
          { key: 'memory', val: '2.4 GB / 8 GB' },
        ].map(s => (
          <div className="data-line" key={s.key}>
            <span className="key">{s.key}:</span>
            <span className="val">{s.val}</span>
          </div>
        ))}

        <div className="section-title" style={{ marginTop: '1.5rem' }}>// recent.activity</div>
        {['[OK] Simulation #156 completed (2.4s)', '[OK] CfTX-2 resolved via AlphaFold', '[WARN] PubChem rate limit hit', '[OK] Tetrodotoxin docking done'].map((log, i) => (
          <div className="data-line" key={i}>
            <span className="val" style={{ color: log.includes('WARN') ? '#ffa657' : '#39ff14' }}>{log}</span>
          </div>
        ))}
      </div>
      <div className="term-panel term-table">
        <div className="section-title">// drugs.database</div>
        <div className="prompt" style={{ marginBottom: '0.5rem' }}>
          <span className="cmd">$ list</span> <span className="arg">--drugs</span> <span className="arg">--format</span> <span className="val">table</span>
        </div>
        <table>
          <thead>
            <tr>
              <th>NAME</th><th>MW</th><th>TARGET</th><th>AFFINITY</th><th>TYPE</th>
            </tr>
          </thead>
          <tbody>
            {DRUGS.map(d => (
              <tr key={d.name}>
                <td style={{ color: '#39ff14' }}>{d.name}</td>
                <td>{d.mw}</td><td style={{ color: '#58a6ff' }}>{d.target}</td><td>{d.affinity}</td><td style={{ color: '#ffa657' }}>{d.type}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

/* ═══════════════════════════════════════════
   CONCEPT 6: ORGANIC FLOW
   ═══════════════════════════════════════════ */
/* ═══════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════ */
const CONCEPTS: Record<number, React.FC> = {
  1: CommandCenter,
  2: Editorial,
  3: BentoBox,
  4: FloatingGlass,
  5: NeoTerminal,
  6: OrganicFlowDemo,
  7: ClinicalDemo,
};

export const DesignDemoPage: React.FC = () => {
  const [active, setActive] = useState<number | null>(null);

  if (active === null) {
    return <Gallery onSelect={setActive} />;
  }

  const Concept = CONCEPTS[active];
  return (
    <div style={{ position: 'relative' }}>
      <button className="demo-back" onClick={() => setActive(null)}>
        Back to Gallery
      </button>
      <Concept />
    </div>
  );
};
