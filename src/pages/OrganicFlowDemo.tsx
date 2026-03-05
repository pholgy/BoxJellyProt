import React, { useState } from 'react';
import './DesignDemo.css';

/* ═══════════════════════════════════════════
   MOCK DATA
   ═══════════════════════════════════════════ */

const PROTEINS = [
  { id: 'P0DL47', name: 'CfTX-1', organism: 'Chironex fleckeri', type: 'Cytotoxin', function: 'Pore-forming toxin', length: 436, mw: '46.8 kDa', sequence: 'MKSFLLLVALVAGAAQALPYGEFSQLREKNPHVSYDTCAEGFRGGKTCHSHGKDMIGRDCKGDVDCAST...' },
  { id: 'P0DL48', name: 'CfTX-2', organism: 'Chironex fleckeri', type: 'Cytotoxin', function: 'Membrane disruption', length: 458, mw: '49.2 kDa', sequence: 'MKSFLLVLALVAGAAQALPFGQFSQMREKYPHVSYDTCAEGFRGKKTCHSHGKDLIGRDCKGDVDCAST...' },
  { id: 'Q9GV72', name: 'CfTX-A', organism: 'Chironex fleckeri', type: 'Hemolysin', function: 'Hemolytic activity', length: 412, mw: '44.1 kDa', sequence: 'MKTFLLLVSLVAGAAQGLPYAEYSQMREKNPHVSFDTCAEGFRGGKTCHSHGKDMIGRDCKGDVDCAST...' },
  { id: 'A0A1B2', name: 'CaTX-A', organism: 'Carukia barnesi', type: 'Neurotoxin', function: 'Ion channel modulation', length: 324, mw: '35.6 kDa', sequence: 'MKSFLLLVALVAGAKQTLPFGEYSQLRERNPHVSYDTCAEGFRGGKTCHSHGKDMIGRDCKGDVDCAST...' },
  { id: 'B3EWI9', name: 'SmTX-1', organism: 'Stomolophus meleagris', type: 'Metalloprotease', function: 'Extracellular matrix degradation', length: 298, mw: '32.4 kDa', sequence: 'MKGFLALVALVTGAAQSLPFGEFSQLRQKNPHVSHDTCAEGFRGGKTCHSHGKDLIGRDCKGDVDCAST...' },
];

const DRUGS = [
  { name: 'Tetrodotoxin', cid: '11174599', formula: 'C₁₁H₁₇N₃O₈', mw: '319.27', category: 'Neurotoxin', mechanism: 'Sodium channel blocker', source: 'Pufferfish', smiles: 'OC1C(O)C2(O)C(=O)[NH]C3(O)CC(O)(CO)C1(O)C23' },
  { name: 'Lidocaine', cid: '3676', formula: 'C₁₄H₂₂N₂O', mw: '234.34', category: 'Anesthetic', mechanism: 'Nav1.5 channel blocker', source: 'Synthetic', smiles: 'CCN(CC)CC(=O)NC1=CC=CC(C)=C1C' },
  { name: 'Conotoxin', cid: '16133820', formula: 'C₅₅H₈₂N₁₈O₁₈S₄', mw: '1264.5', category: 'Peptide Toxin', mechanism: 'nAChR antagonist', source: 'Cone snail', smiles: 'CC(C)CC1NC(=O)C(CC(=O)O)NC(=O)C(CSSC...)NC1=O' },
  { name: 'Silymarin', cid: '5280443', formula: 'C₂₅H₂₂O₁₀', mw: '482.44', category: 'Flavonoid', mechanism: 'Hepatoprotective antioxidant', source: 'Milk thistle', smiles: 'COC1=CC(=CC(OC)=C1O)C1OC2=CC(=CC(O)=C2C1=O)O' },
  { name: 'Captopril', cid: '44093', formula: 'C₉H₁₅NO₃S', mw: '217.28', category: 'ACE Inhibitor', mechanism: 'ACE active site binding', source: 'Snake venom-derived', smiles: 'CC(CS)C(=O)N1CCCC1C(=O)O' },
  { name: 'Zinc Gluconate', cid: '443', formula: 'C₁₂H₂₂O₁₄Zn', mw: '455.7', category: 'Supplement', mechanism: 'Metalloprotease inhibition', source: 'Synthetic', smiles: 'OCC(O)C(O)C(O)C(O)C(=O)[O-].[O-]C(=O)C(O)C(O)C(O)C(O)CO.[Zn+2]' },
  { name: 'Suramin', cid: '5284355', formula: 'C₅₁H₄₀N₆O₂₃S₆', mw: '1297.3', category: 'Antiparasitic', mechanism: 'Toxin neutralization', source: 'Synthetic', smiles: 'OC(=O)C1=CC(NC(=O)C2=CC=C(NC(=O)NC3=CC=CC=C3)C=C2)=CC(=C1)S' },
];

const SIM_RESULTS = [
  { rank: 1, drug: 'Tetrodotoxin', protein: 'CfTX-1', affinity: -9.8, hbonds: 6, hydro: 12, rating: 'Excellent' },
  { rank: 2, drug: 'Conotoxin', protein: 'CfTX-2', affinity: -9.2, hbonds: 5, hydro: 10, rating: 'Excellent' },
  { rank: 3, drug: 'Suramin', protein: 'CfTX-1', affinity: -8.7, hbonds: 8, hydro: 15, rating: 'Good' },
  { rank: 4, drug: 'Captopril', protein: 'CaTX-A', affinity: -7.9, hbonds: 4, hydro: 8, rating: 'Good' },
  { rank: 5, drug: 'Lidocaine', protein: 'CfTX-1', affinity: -7.3, hbonds: 2, hydro: 9, rating: 'Moderate' },
  { rank: 6, drug: 'Silymarin', protein: 'CfTX-A', affinity: -6.8, hbonds: 3, hydro: 7, rating: 'Moderate' },
  { rank: 7, drug: 'Zinc Gluconate', protein: 'SmTX-1', affinity: -6.1, hbonds: 4, hydro: 5, rating: 'Weak' },
  { rank: 8, drug: 'Lidocaine', protein: 'CfTX-2', affinity: -5.8, hbonds: 1, hydro: 6, rating: 'Weak' },
  { rank: 9, drug: 'Silymarin', protein: 'SmTX-1', affinity: -5.2, hbonds: 2, hydro: 4, rating: 'Weak' },
  { rank: 10, drug: 'Zinc Gluconate', protein: 'CfTX-A', affinity: -4.5, hbonds: 1, hydro: 3, rating: 'Very Weak' },
];

const NAV = ['Dashboard', 'Proteins', 'Drugs', 'Simulation', 'Results', 'Export'];

const ratingClass = (r: string) => {
  if (r === 'Excellent') return 'rating-excellent';
  if (r === 'Good') return 'rating-good';
  if (r === 'Moderate') return 'rating-moderate';
  if (r === 'Weak') return 'rating-weak';
  return 'rating-poor';
};

const pillColor = (cat: string) => {
  if (cat.includes('Toxin') || cat.includes('Neurotoxin')) return 'coral';
  if (cat.includes('Peptide') || cat.includes('Inhibitor')) return 'teal';
  return 'purple';
};

/* ═══════════════════════════════════════════
   PAGE: DASHBOARD
   ═══════════════════════════════════════════ */
const DashboardTab: React.FC = () => (
  <div className="page-fade">
    <div className="stat-bubbles" style={{ marginBottom: '1.5rem' }}>
      {[
        { num: 12, desc: 'Toxin Proteins' },
        { num: 48, desc: 'Drug Compounds' },
        { num: 156, desc: 'Simulations Run' },
        { num: '92%', desc: 'Success Rate' },
      ].map(s => (
        <div className="stat-bubble" key={s.desc}>
          <div className="num">{s.num}</div>
          <div className="desc">{s.desc}</div>
        </div>
      ))}
    </div>

    <div className="organic-grid-3">
      {[
        { icon: '\u{1F9EC}', title: 'Protein Database', desc: 'Browse and filter box jellyfish toxin proteins with 3D structure visualization.', bg: 'linear-gradient(135deg, #a8edea33, #a8edea11)' },
        { icon: '\u{1F48A}', title: 'Drug Database', desc: 'Explore therapeutic compounds and their molecular properties for toxin analysis.', bg: 'linear-gradient(135deg, #fed6e333, #fed6e311)' },
        { icon: '\u{1F52C}', title: 'Docking Simulation', desc: 'Run molecular docking to predict drug-protein binding affinity and interactions.', bg: 'linear-gradient(135deg, #ffeaa733, #ffeaa711)' },
      ].map(f => (
        <div className="feature-card" key={f.title}>
          <div className="feature-icon" style={{ background: f.bg }}>
            {f.icon}
          </div>
          <h4>{f.title}</h4>
          <p>{f.desc}</p>
        </div>
      ))}
    </div>

    <div className="organic-grid" style={{ marginTop: '1.5rem' }}>
      <div className="organic-card full-width">
        <h3>Research Workflow</h3>
        {[
          { n: 1, title: 'Select Proteins', desc: 'Choose target toxin proteins from the database', color: '#00b894' },
          { n: 2, title: 'Choose Drugs', desc: 'Pick candidate drug compounds for analysis', color: '#6c5ce7' },
          { n: 3, title: 'Configure Simulation', desc: 'Set docking parameters and run molecular simulation', color: '#e17055' },
          { n: 4, title: 'Analyze Results', desc: 'Review binding affinities, rankings, and interactions', color: '#0984e3' },
          { n: 5, title: 'Export Data', desc: 'Download results as CSV/Excel for publication', color: '#fdcb6e' },
        ].map(s => (
          <div className="step-row" key={s.n}>
            <div className="step-num" style={{ background: s.color }}>{s.n}</div>
            <div className="step-text">
              <h5>{s.title}</h5>
              <p>{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>

    <div className="organic-grid" style={{ marginTop: '1.5rem' }}>
      <div className="organic-card">
        <h3>Best Inhibitor</h3>
        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#00b894' }}>Tetrodotoxin</div>
          <div style={{ fontSize: '0.8rem', color: '#b2bec3', marginTop: '0.25rem' }}>Binding Affinity</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#6c5ce7', marginTop: '0.25rem' }}>-9.8 kcal/mol</div>
        </div>
      </div>
      <div className="organic-card">
        <h3>Recent Activity</h3>
        {[
          'Simulation #156 completed',
          'CfTX-2 structure resolved via AlphaFold',
          'Tetrodotoxin docking finished',
          'New PDB entry: 6D1T added',
          'Suramin analysis completed',
        ].map((log, i) => (
          <div className="detail-row" key={i}>
            <span className="label">{`${(i + 1) * 4}m ago`}</span>
            <span>{log}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

/* ═══════════════════════════════════════════
   PAGE: PROTEINS
   ═══════════════════════════════════════════ */
const ProteinsTab: React.FC = () => {
  const [filter, setFilter] = useState('All');
  const [expanded, setExpanded] = useState<string | null>(null);

  const organisms = ['All', ...Array.from(new Set(PROTEINS.map(p => p.organism)))];
  const filtered = filter === 'All' ? PROTEINS : PROTEINS.filter(p => p.organism === filter);

  return (
    <div className="page-fade">
      <div className="filter-row">
        <select className="filter-select" value={filter} onChange={e => setFilter(e.target.value)}>
          {organisms.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <span style={{ fontSize: '0.8rem', color: '#b2bec3' }}>
          Showing <span style={{ fontWeight: 700, color: '#2d3436' }}>{filtered.length}</span> proteins
        </span>
      </div>

      {filtered.map(p => (
        <div className="expand-card" key={p.id}>
          <div className="expand-header" onClick={() => setExpanded(expanded === p.id ? null : p.id)}>
            <div>
              <h4>{p.name}</h4>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                <span className="pill teal">{p.organism}</span>
                <span className="pill coral">{p.type}</span>
              </div>
            </div>
            <div className="expand-meta">
              <span style={{ fontSize: '0.75rem', color: '#b2bec3' }}>{p.id}</span>
              <div className={`expand-chevron ${expanded === p.id ? 'open' : ''}`}>&#9662;</div>
            </div>
          </div>
          {expanded === p.id && (
            <div className="expand-body">
              <div className="organic-grid" style={{ gap: '1rem' }}>
                <div>
                  {[
                    ['UniProt ID', p.id],
                    ['Organism', p.organism],
                    ['Type', p.type],
                    ['Function', p.function],
                    ['Length', `${p.length} aa`],
                    ['Molecular Weight', p.mw],
                  ].map(([k, v]) => (
                    <div className="detail-row" key={k}>
                      <span className="label">{k}</span>
                      <span>{v}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="viewer-placeholder" style={{ height: 200 }}>
                    [ 3D Protein Structure ]
                  </div>
                </div>
              </div>
              <div style={{ marginTop: '1rem' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#b2bec3', marginBottom: '0.5rem' }}>
                  Sequence
                </div>
                <div className="seq-block">{p.sequence}</div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

/* ═══════════════════════════════════════════
   PAGE: DRUGS
   ═══════════════════════════════════════════ */
const DrugsTab: React.FC = () => {
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [selected, setSelected] = useState<typeof DRUGS[0] | null>(null);

  const categories = ['All', ...Array.from(new Set(DRUGS.map(d => d.category)))];
  const filtered = DRUGS.filter(d => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === 'All' || d.category === catFilter;
    return matchSearch && matchCat;
  });

  return (
    <div className="page-fade">
      <div className="filter-row">
        <input
          className="search-bar"
          style={{ flex: 1, maxWidth: 320 }}
          placeholder="Search drugs by name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className="filter-select" value={catFilter} onChange={e => setCatFilter(e.target.value)}>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="organic-grid">
        <div className="organic-card organic-table" style={{ gridColumn: selected ? '1' : '1 / -1' }}>
          <h3>Drug Compounds ({filtered.length})</h3>
          <table>
            <thead>
              <tr><th>Name</th><th>Formula</th><th>MW (Da)</th><th>Category</th><th>Source</th></tr>
            </thead>
            <tbody>
              {filtered.map(d => (
                <tr
                  key={d.name}
                  onClick={() => setSelected(d)}
                  style={{ cursor: 'pointer', outline: selected?.name === d.name ? '2px solid #a8edea' : 'none', borderRadius: '14px' }}
                >
                  <td style={{ fontWeight: 700 }}>{d.name}</td>
                  <td>{d.formula}</td>
                  <td>{d.mw}</td>
                  <td><span className={`pill ${pillColor(d.category)}`}>{d.category}</span></td>
                  <td>{d.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selected && (
          <div className="organic-card" style={{ gridColumn: '2' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <h3 style={{ marginBottom: 0 }}>Drug Detail</h3>
              <button
                onClick={() => setSelected(null)}
                style={{ background: '#f5f3ef', border: 'none', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', fontSize: '0.8rem', color: '#b2bec3' }}
              >
                ✕
              </button>
            </div>
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#2d3436' }}>{selected.name}</span>
            </div>
            <div className="viewer-placeholder" style={{ height: 180, marginBottom: '1rem' }}>
              [ 3D Molecule ]
            </div>
            {[
              ['CID', selected.cid],
              ['Formula', selected.formula],
              ['Molecular Weight', `${selected.mw} Da`],
              ['Category', selected.category],
              ['Mechanism', selected.mechanism],
              ['Source', selected.source],
            ].map(([k, v]) => (
              <div className="detail-row" key={k}>
                <span className="label">{k}</span>
                <span>{v}</span>
              </div>
            ))}
            <div style={{ marginTop: '1rem' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#b2bec3', marginBottom: '0.5rem' }}>
                SMILES
              </div>
              <div className="seq-block" style={{ fontSize: '0.65rem' }}>{selected.smiles}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════
   PAGE: SIMULATION
   ═══════════════════════════════════════════ */
const SimulationTab: React.FC = () => {
  const [selProteins, setSelProteins] = useState<string[]>(['CfTX-1']);
  const [selDrugs, setSelDrugs] = useState<string[]>(['Tetrodotoxin', 'Lidocaine']);
  const [exhaustiveness, setExhaustiveness] = useState(8);
  const [poses, setPoses] = useState(9);
  const [seed, setSeed] = useState(42);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  const toggleProtein = (name: string) => {
    setSelProteins(prev => prev.includes(name) ? prev.filter(p => p !== name) : [...prev, name]);
  };
  const toggleDrug = (name: string) => {
    setSelDrugs(prev => prev.includes(name) ? prev.filter(d => d !== name) : [...prev, name]);
  };

  const runSim = () => {
    setRunning(true);
    setProgress(0);
    setDone(false);
    let p = 0;
    const iv = setInterval(() => {
      p += Math.random() * 15 + 5;
      if (p >= 100) {
        p = 100;
        clearInterval(iv);
        setRunning(false);
        setDone(true);
      }
      setProgress(Math.min(p, 100));
    }, 400);
  };

  return (
    <div className="page-fade">
      <div className="organic-grid">
        <div className="organic-card">
          <h3>Select Proteins ({selProteins.length})</h3>
          <label className="checkbox-row" style={{ borderBottom: '2px solid #f5f3ef', paddingBottom: '0.6rem', marginBottom: '0.25rem' }}>
            <input
              type="checkbox"
              checked={selProteins.length === PROTEINS.length}
              onChange={() => setSelProteins(selProteins.length === PROTEINS.length ? [] : PROTEINS.map(p => p.name))}
            />
            <span style={{ fontWeight: 700 }}>Select All</span>
          </label>
          {PROTEINS.map(p => (
            <label className="checkbox-row" key={p.name}>
              <input type="checkbox" checked={selProteins.includes(p.name)} onChange={() => toggleProtein(p.name)} />
              <span>{p.name}</span>
              <span className="pill teal" style={{ marginLeft: 'auto', fontSize: '0.65rem' }}>{p.organism.split(' ')[0][0]}. {p.organism.split(' ')[1]}</span>
            </label>
          ))}
        </div>

        <div className="organic-card">
          <h3>Select Drugs ({selDrugs.length})</h3>
          <label className="checkbox-row" style={{ borderBottom: '2px solid #f5f3ef', paddingBottom: '0.6rem', marginBottom: '0.25rem' }}>
            <input
              type="checkbox"
              checked={selDrugs.length === DRUGS.length}
              onChange={() => setSelDrugs(selDrugs.length === DRUGS.length ? [] : DRUGS.map(d => d.name))}
            />
            <span style={{ fontWeight: 700 }}>Select All</span>
          </label>
          {DRUGS.map(d => (
            <label className="checkbox-row" key={d.name}>
              <input type="checkbox" checked={selDrugs.includes(d.name)} onChange={() => toggleDrug(d.name)} />
              <span>{d.name}</span>
              <span className={`pill ${pillColor(d.category)}`} style={{ marginLeft: 'auto', fontSize: '0.65rem' }}>{d.category}</span>
            </label>
          ))}
        </div>

        <div className="organic-card">
          <h3>Parameters</h3>
          <div className="sim-control">
            <div className="sim-label"><span>Exhaustiveness</span><span className="val">{exhaustiveness}</span></div>
            <input type="range" className="slider" min={1} max={32} value={exhaustiveness} onChange={e => setExhaustiveness(+e.target.value)} />
          </div>
          <div className="sim-control">
            <div className="sim-label"><span>Number of Poses</span><span className="val">{poses}</span></div>
            <input type="range" className="slider" min={1} max={20} value={poses} onChange={e => setPoses(+e.target.value)} />
          </div>
          <div className="sim-control">
            <div className="sim-label"><span>Random Seed</span><span className="val">{seed}</span></div>
            <input
              type="number" min={0} max={9999} value={seed}
              onChange={e => setSeed(+e.target.value)}
              className="search-bar"
              style={{ borderRadius: '14px', padding: '0.5rem 1rem' }}
            />
          </div>
        </div>

        <div className="organic-card">
          <h3>Run Simulation</h3>
          <div style={{ fontSize: '0.85rem', color: '#636e72', marginBottom: '1rem' }}>
            {selProteins.length} proteins &times; {selDrugs.length} drugs = <strong>{selProteins.length * selDrugs.length}</strong> docking jobs
          </div>
          <button
            className={`sim-btn ${running ? 'running' : ''}`}
            onClick={runSim}
            disabled={running || selProteins.length === 0 || selDrugs.length === 0}
          >
            {running ? 'Running Simulation...' : done ? 'Run Again' : 'Start Simulation'}
          </button>
          {(running || done) && (
            <div style={{ marginTop: '1rem' }}>
              <div className="progress-wrap">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <div style={{ fontSize: '0.8rem', color: '#b2bec3', textAlign: 'center' }}>
                {done ? 'Simulation complete!' : `${Math.round(progress)}% complete`}
              </div>
            </div>
          )}
          {done && (
            <div style={{ marginTop: '1rem' }}>
              <h3>Preview (Top 5)</h3>
              {SIM_RESULTS.slice(0, 5).map(r => (
                <div className="detail-row" key={r.rank}>
                  <span>
                    <span style={{ fontWeight: 700, marginRight: '0.5rem' }}>#{r.rank}</span>
                    {r.drug} → {r.protein}
                  </span>
                  <span className={ratingClass(r.rating)}>{r.affinity} kcal/mol</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════
   PAGE: RESULTS
   ═══════════════════════════════════════════ */
const ResultsTab: React.FC = () => {
  const [tab, setTab] = useState('all');

  const barData = [
    { label: '-10 to -9', val: 2, color: '#00b894' },
    { label: '-9 to -8', val: 1, color: '#00cec9' },
    { label: '-8 to -7', val: 2, color: '#6c5ce7' },
    { label: '-7 to -6', val: 2, color: '#fdcb6e' },
    { label: '-6 to -5', val: 2, color: '#e17055' },
    { label: '-5 to -4', val: 1, color: '#d63031' },
  ];
  const maxBar = Math.max(...barData.map(b => b.val));

  return (
    <div className="page-fade">
      <div className="stat-bubbles" style={{ marginBottom: '1.5rem' }}>
        {[
          { num: 10, desc: 'Total Results' },
          { num: 8, desc: 'Successful Bindings' },
          { num: '80%', desc: 'Success Rate' },
          { num: '-9.8', desc: 'Best Affinity (kcal/mol)' },
        ].map(s => (
          <div className="stat-bubble" key={s.desc}>
            <div className="num">{s.num}</div>
            <div className="desc">{s.desc}</div>
          </div>
        ))}
      </div>

      <div className="tab-row">
        {['all', 'charts', 'top10', 'analysis'].map(t => (
          <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t === 'all' ? 'All Results' : t === 'charts' ? 'Charts' : t === 'top10' ? 'Top 10' : 'Analysis'}
          </button>
        ))}
      </div>

      {tab === 'all' && (
        <div className="organic-card organic-table">
          <table>
            <thead>
              <tr><th>#</th><th>Drug</th><th>Protein</th><th>Affinity</th><th>H-Bonds</th><th>Contacts</th><th>Rating</th></tr>
            </thead>
            <tbody>
              {SIM_RESULTS.map(r => (
                <tr key={r.rank}>
                  <td style={{ fontWeight: 700 }}>{r.rank}</td>
                  <td style={{ fontWeight: 700 }}>{r.drug}</td>
                  <td>{r.protein}</td>
                  <td style={{ fontWeight: 700 }}>{r.affinity}</td>
                  <td>{r.hbonds}</td>
                  <td>{r.hydro}</td>
                  <td><span className={`pill ${r.rating === 'Excellent' ? 'teal' : r.rating === 'Good' ? 'purple' : 'coral'}`}>{r.rating}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'charts' && (
        <div className="organic-grid">
          <div className="organic-card">
            <h3>Binding Affinity Distribution</h3>
            <div className="bar-chart">
              {barData.map(b => (
                <div className="bar-col" key={b.label}>
                  <div className="bar-val">{b.val}</div>
                  <div className="bar" style={{ height: `${(b.val / maxBar) * 120}px`, background: b.color }} />
                  <div className="bar-label">{b.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="organic-card">
            <h3>Results by Rating</h3>
            <div
              className="pie-chart"
              style={{
                background: `conic-gradient(
                  #00b894 0deg 72deg,
                  #6c5ce7 72deg 144deg,
                  #fdcb6e 144deg 216deg,
                  #e17055 216deg 324deg,
                  #d63031 324deg 360deg
                )`,
              }}
            />
            <div className="pie-legend">
              {[
                { color: '#00b894', label: 'Excellent', count: 2 },
                { color: '#6c5ce7', label: 'Good', count: 2 },
                { color: '#fdcb6e', label: 'Moderate', count: 2 },
                { color: '#e17055', label: 'Weak', count: 3 },
                { color: '#d63031', label: 'Very Weak', count: 1 },
              ].map(l => (
                <div className="legend-item" key={l.label}>
                  <div className="legend-dot" style={{ background: l.color }} />
                  <span>{l.label}</span>
                  <span style={{ marginLeft: 'auto', fontWeight: 700, color: '#636e72' }}>{l.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'top10' && (
        <div>
          {SIM_RESULTS.map(r => (
            <div className="expand-card" key={r.rank}>
              <div className="expand-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div className="step-num" style={{ background: r.rating === 'Excellent' ? '#00b894' : r.rating === 'Good' ? '#6c5ce7' : r.rating === 'Moderate' ? '#fdcb6e' : '#e17055', width: 32, height: 32, fontSize: '0.8rem', borderRadius: 10 }}>
                    {r.rank}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.9rem' }}>{r.drug} → {r.protein}</h4>
                    <span className={`pill ${r.rating === 'Excellent' ? 'teal' : r.rating === 'Good' ? 'purple' : 'coral'}`} style={{ marginTop: '0.25rem' }}>{r.rating}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className={ratingClass(r.rating)} style={{ fontSize: '1.1rem' }}>{r.affinity} kcal/mol</div>
                  <div style={{ fontSize: '0.7rem', color: '#b2bec3' }}>{r.hbonds} H-bonds, {r.hydro} contacts</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'analysis' && (
        <div className="organic-grid">
          <div className="organic-card organic-table">
            <h3>By Protein</h3>
            <table>
              <thead><tr><th>Protein</th><th>Best Affinity</th><th>Avg Affinity</th><th>Drugs Tested</th></tr></thead>
              <tbody>
                {['CfTX-1', 'CfTX-2', 'CaTX-A', 'CfTX-A', 'SmTX-1'].map(p => {
                  const hits = SIM_RESULTS.filter(r => r.protein === p);
                  if (hits.length === 0) return null;
                  return (
                    <tr key={p}>
                      <td style={{ fontWeight: 700 }}>{p}</td>
                      <td className="rating-excellent">{Math.min(...hits.map(h => h.affinity)).toFixed(1)}</td>
                      <td>{(hits.reduce((a, h) => a + h.affinity, 0) / hits.length).toFixed(1)}</td>
                      <td>{hits.length}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="organic-card organic-table">
            <h3>By Drug</h3>
            <table>
              <thead><tr><th>Drug</th><th>Best Affinity</th><th>Avg Affinity</th><th>Proteins Tested</th></tr></thead>
              <tbody>
                {Array.from(new Set(SIM_RESULTS.map(r => r.drug))).map(d => {
                  const hits = SIM_RESULTS.filter(r => r.drug === d);
                  return (
                    <tr key={d}>
                      <td style={{ fontWeight: 700 }}>{d}</td>
                      <td className="rating-excellent">{Math.min(...hits.map(h => h.affinity)).toFixed(1)}</td>
                      <td>{(hits.reduce((a, h) => a + h.affinity, 0) / hits.length).toFixed(1)}</td>
                      <td>{hits.length}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════
   PAGE: EXPORT
   ═══════════════════════════════════════════ */
const ExportTab: React.FC = () => {
  const [exported, setExported] = useState<string | null>(null);

  return (
    <div className="page-fade">
      <div className="stat-bubbles" style={{ marginBottom: '1.5rem' }}>
        {[
          { num: 10, desc: 'Total Results' },
          { num: 8, desc: 'Successful Bindings' },
          { num: '-9.8', desc: 'Best Affinity' },
        ].map(s => (
          <div className="stat-bubble" key={s.desc}>
            <div className="num">{s.num}</div>
            <div className="desc">{s.desc}</div>
          </div>
        ))}
      </div>

      <div className="organic-grid-3" style={{ marginBottom: '1.5rem' }}>
        {[
          { icon: '\u{1F4C4}', title: 'CSV Export', desc: 'Comma-separated values for spreadsheets and data tools', bg: '#e0f7f1', color: '#00b894' },
          { icon: '\u{1F4CA}', title: 'Excel Export', desc: 'Full workbook with formatted tables and charts', bg: '#ede7f6', color: '#6c5ce7' },
          { icon: '\u{1F4D1}', title: 'Publication Table', desc: 'Clean format ready for scientific paper submission', bg: '#fde8e4', color: '#e17055' },
        ].map(e => (
          <div
            className="export-card"
            key={e.title}
            onClick={() => setExported(e.title)}
            style={{ borderColor: exported === e.title ? e.color : 'transparent' }}
          >
            <div className="export-icon" style={{ background: e.bg }}>
              {e.icon}
            </div>
            <h4>{e.title}</h4>
            <p>{e.desc}</p>
            {exported === e.title && (
              <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', fontWeight: 700, color: e.color }}>
                Downloaded!
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="organic-card organic-table">
        <h3>Data Preview (First 10 Rows)</h3>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr><th>#</th><th>Drug</th><th>MW</th><th>Protein</th><th>Organism</th><th>Affinity</th><th>H-Bonds</th><th>Rating</th></tr>
            </thead>
            <tbody>
              {SIM_RESULTS.map(r => {
                const drug = DRUGS.find(d => d.name === r.drug);
                const protein = PROTEINS.find(p => p.name === r.protein);
                return (
                  <tr key={r.rank}>
                    <td style={{ fontWeight: 700 }}>{r.rank}</td>
                    <td style={{ fontWeight: 700 }}>{r.drug}</td>
                    <td>{drug?.mw || ''}</td>
                    <td>{r.protein}</td>
                    <td>{protein?.organism || ''}</td>
                    <td style={{ fontWeight: 700 }}>{r.affinity}</td>
                    <td>{r.hbonds}</td>
                    <td><span className={`pill ${r.rating === 'Excellent' ? 'teal' : r.rating === 'Good' ? 'purple' : 'coral'}`}>{r.rating}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════
   MAIN: ORGANIC FLOW FULL DEMO
   ═══════════════════════════════════════════ */
const TABS: Record<string, React.FC> = {
  Dashboard: DashboardTab,
  Proteins: ProteinsTab,
  Drugs: DrugsTab,
  Simulation: SimulationTab,
  Results: ResultsTab,
  Export: ExportTab,
};

export const OrganicFlowDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [fadeKey, setFadeKey] = useState(0);

  const switchTab = (tab: string) => {
    setActiveTab(tab);
    setFadeKey(k => k + 1);
  };

  const TabContent = TABS[activeTab];

  return (
    <div className="c6">
      {/* Background blobs */}
      <div className="blob-bg" style={{ width: 450, height: 450, top: -120, right: -80, background: 'radial-gradient(circle, #a8edea55, transparent 70%)' }} />
      <div className="blob-bg" style={{ width: 400, height: 400, bottom: -100, left: -60, background: 'radial-gradient(circle, #fed6e355, transparent 70%)', animationDelay: '2s' }} />
      <div className="blob-bg" style={{ width: 300, height: 300, top: '40%', left: '55%', background: 'radial-gradient(circle, #ffeaa744, transparent 70%)', animationDelay: '4s' }} />
      <div className="blob-bg" style={{ width: 200, height: 200, top: '20%', left: '10%', background: 'radial-gradient(circle, #dfe6e933, transparent 70%)', animationDelay: '6s' }} />

      <div className="content">
        {/* Top Navigation */}
        <div className="topnav">
          <h1>BoxJellyProt</h1>
          <div className="bubble-nav">
            {NAV.map(item => (
              <button
                key={item}
                className={activeTab === item ? 'active' : ''}
                onClick={() => switchTab(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Page Content */}
        <div key={fadeKey}>
          <TabContent />
        </div>
      </div>
    </div>
  );
};
