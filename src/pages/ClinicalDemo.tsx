import React, { useState } from 'react';
import './ClinicalDemo.css';

/* ── Data ── */
const PROTEINS = [
  { id: 'P0DL47', name: 'CfTX-1', organism: 'Chironex fleckeri', type: 'Cytotoxin', fn: 'Pore-forming toxin', length: 436, mw: '46.8 kDa', seq: 'MKSFLLLVALVAGAAQALPYGEFSQLREKNPHVSYDTCAEGFRGGKTCHSHGKDMIGRDCKGDVDCAST...' },
  { id: 'P0DL48', name: 'CfTX-2', organism: 'Chironex fleckeri', type: 'Cytotoxin', fn: 'Membrane disruption', length: 458, mw: '49.2 kDa', seq: 'MKSFLLVLALVAGAAQALPFGQFSQMREKYPHVSYDTCAEGFRGKKTCHSHGKDLIGRDCKGDVDCAST...' },
  { id: 'Q9GV72', name: 'CfTX-A', organism: 'Chironex fleckeri', type: 'Hemolysin', fn: 'Hemolytic activity', length: 412, mw: '44.1 kDa', seq: 'MKTFLLLVSLVAGAAQGLPYAEYSQMREKNPHVSFDTCAEGFRGGKTCHSHGKDMIGRDCKGDVDCAST...' },
  { id: 'A0A1B2', name: 'CaTX-A', organism: 'Carukia barnesi', type: 'Neurotoxin', fn: 'Ion channel modulation', length: 324, mw: '35.6 kDa', seq: 'MKSFLLLVALVAGAKQTLPFGEYSQLRERNPHVSYDTCAEGFRGGKTCHSHGKDMIGRDCKGDVDCAST...' },
  { id: 'B3EWI9', name: 'SmTX-1', organism: 'Stomolophus meleagris', type: 'Metalloprotease', fn: 'ECM degradation', length: 298, mw: '32.4 kDa', seq: 'MKGFLALVALVTGAAQSLPFGEFSQLRQKNPHVSHDTCAEGFRGGKTCHSHGKDLIGRDCKGDVDCAST...' },
];

const DRUGS = [
  { name: 'Tetrodotoxin', cid: '11174599', formula: 'C\u2081\u2081H\u2081\u2087N\u2083O\u2088', mw: '319.27', cat: 'Neurotoxin', mech: 'Na\u207A channel blocker', src: 'Pufferfish', smiles: 'OC1C(O)C2(O)C(=O)[NH]C3(O)CC(O)(CO)C1(O)C23' },
  { name: 'Lidocaine', cid: '3676', formula: 'C\u2081\u2084H\u2082\u2082N\u2082O', mw: '234.34', cat: 'Anesthetic', mech: 'Nav1.5 blocker', src: 'Synthetic', smiles: 'CCN(CC)CC(=O)NC1=CC=CC(C)=C1C' },
  { name: 'Conotoxin', cid: '16133820', formula: 'C\u2085\u2085H\u2088\u2082N\u2081\u2088O\u2081\u2088S\u2084', mw: '1264.5', cat: 'Peptide', mech: 'nAChR antagonist', src: 'Cone snail', smiles: 'CC(C)CC1NC(=O)C(CC(=O)O)NC(=O)...' },
  { name: 'Silymarin', cid: '5280443', formula: 'C\u2082\u2085H\u2082\u2082O\u2081\u2080', mw: '482.44', cat: 'Flavonoid', mech: 'Hepatoprotective', src: 'Milk thistle', smiles: 'COC1=CC(=CC(OC)=C1O)C1OC2=CC...' },
  { name: 'Captopril', cid: '44093', formula: 'C\u2089H\u2081\u2085NO\u2083S', mw: '217.28', cat: 'Inhibitor', mech: 'ACE binding', src: 'Snake venom-derived', smiles: 'CC(CS)C(=O)N1CCCC1C(=O)O' },
  { name: 'Zinc Gluconate', cid: '443', formula: 'C\u2081\u2082H\u2082\u2082O\u2081\u2084Zn', mw: '455.7', cat: 'Supplement', mech: 'Metalloprotease inhibition', src: 'Synthetic', smiles: 'OCC(O)C(O)C(O)C(O)C(=O)[O-]...' },
  { name: 'Suramin', cid: '5284355', formula: 'C\u2085\u2081H\u2084\u2080N\u2086O\u2082\u2083S\u2086', mw: '1297.3', cat: 'Antiparasitic', mech: 'Toxin neutralization', src: 'Synthetic', smiles: 'OC(=O)C1=CC(NC(=O)C2=CC=C...)...' },
];

const RESULTS = [
  { rank: 1, drug: 'Tetrodotoxin', protein: 'CfTX-1', affinity: -9.8, hbonds: 6, hydro: 12, rating: 'Excellent' as const },
  { rank: 2, drug: 'Conotoxin', protein: 'CfTX-2', affinity: -9.2, hbonds: 5, hydro: 10, rating: 'Excellent' as const },
  { rank: 3, drug: 'Suramin', protein: 'CfTX-1', affinity: -8.7, hbonds: 8, hydro: 15, rating: 'Good' as const },
  { rank: 4, drug: 'Captopril', protein: 'CaTX-A', affinity: -7.9, hbonds: 4, hydro: 8, rating: 'Good' as const },
  { rank: 5, drug: 'Lidocaine', protein: 'CfTX-1', affinity: -7.3, hbonds: 2, hydro: 9, rating: 'Moderate' as const },
  { rank: 6, drug: 'Silymarin', protein: 'CfTX-A', affinity: -6.8, hbonds: 3, hydro: 7, rating: 'Moderate' as const },
  { rank: 7, drug: 'Zinc Gluconate', protein: 'SmTX-1', affinity: -6.1, hbonds: 4, hydro: 5, rating: 'Weak' as const },
  { rank: 8, drug: 'Lidocaine', protein: 'CfTX-2', affinity: -5.8, hbonds: 1, hydro: 6, rating: 'Weak' as const },
  { rank: 9, drug: 'Silymarin', protein: 'SmTX-1', affinity: -5.2, hbonds: 2, hydro: 4, rating: 'Weak' as const },
  { rank: 10, drug: 'Zinc Gluconate', protein: 'CfTX-A', affinity: -4.5, hbonds: 1, hydro: 3, rating: 'Very Weak' as const },
];

type Rating = 'Excellent' | 'Good' | 'Moderate' | 'Weak' | 'Very Weak';
const badgeClass = (r: Rating) =>
  r === 'Excellent' ? 'cl-badge-green' :
  r === 'Good' ? 'cl-badge-blue' :
  r === 'Moderate' ? 'cl-badge-amber' :
  'cl-badge-red';

const affinityColor = (a: number) =>
  a <= -9 ? '#059669' : a <= -7 ? '#2563EB' : a <= -6 ? '#D97706' : '#DC2626';

/* ═══════════════════════════════════════════
   DASHBOARD
   ═══════════════════════════════════════════ */
const Dashboard: React.FC = () => (
  <div className="cl-fade">
    <div className="cl-grid-4" style={{ marginBottom: '1.25rem' }}>
      {[
        { label: 'Proteins', value: '12', sub: 'Toxin structures' },
        { label: 'Drug Compounds', value: '48', sub: 'In database' },
        { label: 'Simulations', value: '156', sub: 'Completed runs' },
        { label: 'Success Rate', value: '92%', sub: 'Binding detected' },
      ].map(s => (
        <div className="cl-stat" key={s.label}>
          <div className="label">{s.label}</div>
          <div className="value">{s.value}</div>
          <div className="sub">{s.sub}</div>
        </div>
      ))}
    </div>

    <div className="cl-grid-3" style={{ marginBottom: '1.25rem' }}>
      {[
        { icon: '\u03B1', title: 'Protein Database', desc: 'Browse toxin protein structures with 3D visualization and sequence data.' },
        { icon: '\u2B22', title: 'Drug Library', desc: 'Search and filter therapeutic compounds by category and properties.' },
        { icon: '\u2261', title: 'Docking Simulation', desc: 'Run molecular docking to predict binding affinity between proteins and drugs.' },
      ].map(f => (
        <div className="cl-feature" key={f.title}>
          <div className="cl-feature-icon">{f.icon}</div>
          <h4>{f.title}</h4>
          <p>{f.desc}</p>
        </div>
      ))}
    </div>

    <div className="cl-grid-2">
      <div className="cl-card">
        <div className="cl-card-title">Workflow</div>
        {[
          { n: 1, t: 'Select Proteins', d: 'Choose target toxin proteins' },
          { n: 2, t: 'Choose Drugs', d: 'Pick candidate compounds' },
          { n: 3, t: 'Run Simulation', d: 'Configure and execute docking' },
          { n: 4, t: 'Analyze Results', d: 'Review binding affinities and rankings' },
          { n: 5, t: 'Export Data', d: 'Download for publication' },
        ].map(s => (
          <div className="cl-step" key={s.n}>
            <div className="cl-step-num">{s.n}</div>
            <div>
              <h5>{s.t}</h5>
              <p>{s.d}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="cl-card">
        <div className="cl-card-title">Best Inhibitor</div>
        <div style={{ textAlign: 'center', padding: '1.5rem 0 1rem' }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827' }}>Tetrodotoxin</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#059669', letterSpacing: '-0.03em', margin: '0.5rem 0', fontFamily: "'IBM Plex Mono', monospace" }}>-9.8</div>
          <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>kcal/mol binding affinity</div>
        </div>
        <div className="cl-card-title" style={{ marginTop: '1.5rem' }}>Recent Activity</div>
        {['Simulation #156 completed', 'CfTX-2 resolved via AlphaFold', 'Tetrodotoxin docking finished', 'New PDB entry: 6D1T'].map((log, i) => (
          <div className="cl-detail" key={i}>
            <span className="k">{(i + 1) * 4}m ago</span>
            <span className="v" style={{ fontWeight: 400, fontSize: '0.8rem' }}>{log}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

/* ═══════════════════════════════════════════
   PROTEINS
   ═══════════════════════════════════════════ */
const ProteinsPage: React.FC = () => {
  const [filter, setFilter] = useState('All');
  const [expanded, setExpanded] = useState<string | null>(null);
  const organisms = ['All', ...Array.from(new Set(PROTEINS.map(p => p.organism)))];
  const filtered = filter === 'All' ? PROTEINS : PROTEINS.filter(p => p.organism === filter);

  return (
    <div className="cl-fade">
      <div className="cl-filter-row">
        <select className="cl-select" value={filter} onChange={e => setFilter(e.target.value)}>
          {organisms.map(o => <option key={o}>{o}</option>)}
        </select>
        <span style={{ fontSize: '0.775rem', color: '#9CA3AF' }}>
          {filtered.length} protein{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {filtered.map(p => (
        <div className="cl-expand" key={p.id}>
          <div className="cl-expand-header" onClick={() => setExpanded(expanded === p.id ? null : p.id)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <h4>{p.name}</h4>
              <span className="cl-badge cl-badge-gray">{p.type}</span>
              <span className="cl-badge cl-badge-blue">{p.organism}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#9CA3AF', fontFamily: "'IBM Plex Mono', monospace" }}>{p.id}</span>
              <span className={`cl-expand-chevron ${expanded === p.id ? 'open' : ''}`}>&#9662;</span>
            </div>
          </div>
          {expanded === p.id && (
            <div className="cl-expand-body">
              <div className="cl-grid-2" style={{ gap: '1.25rem' }}>
                <div>
                  {[
                    ['UniProt ID', p.id], ['Organism', p.organism], ['Type', p.type],
                    ['Function', p.fn], ['Length', `${p.length} aa`], ['Molecular Weight', p.mw],
                  ].map(([k, v]) => (
                    <div className="cl-detail" key={k}><span className="k">{k}</span><span className="v">{v}</span></div>
                  ))}
                  <div style={{ marginTop: '1rem' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Sequence</div>
                    <div className="cl-code">{p.seq}</div>
                  </div>
                </div>
                <div className="cl-viewer" style={{ height: 240 }}>3D Protein Structure</div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

/* ═══════════════════════════════════════════
   DRUGS
   ═══════════════════════════════════════════ */
const DrugsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('All');
  const [selected, setSelected] = useState<typeof DRUGS[0] | null>(null);
  const cats = ['All', ...Array.from(new Set(DRUGS.map(d => d.cat)))];
  const filtered = DRUGS.filter(d => {
    const m1 = d.name.toLowerCase().includes(search.toLowerCase());
    const m2 = cat === 'All' || d.cat === cat;
    return m1 && m2;
  });

  return (
    <div className="cl-fade">
      <div className="cl-filter-row">
        <input className="cl-input" style={{ maxWidth: 280 }} placeholder="Search by name..." value={search} onChange={e => setSearch(e.target.value)} />
        <select className="cl-select" value={cat} onChange={e => setCat(e.target.value)}>
          {cats.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      <div className="cl-grid-2" style={{ gridTemplateColumns: selected ? '1.3fr 1fr' : '1fr' }}>
        <div className="cl-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="cl-table-wrap">
            <table className="cl-table">
              <thead>
                <tr><th>Name</th><th>Formula</th><th>MW (Da)</th><th>Category</th><th>Source</th></tr>
              </thead>
              <tbody>
                {filtered.map(d => (
                  <tr key={d.name} onClick={() => setSelected(d)} className={selected?.name === d.name ? 'selected' : ''} style={{ cursor: 'pointer' }}>
                    <td className="primary">{d.name}</td>
                    <td className="mono">{d.formula}</td>
                    <td className="mono">{d.mw}</td>
                    <td><span className={`cl-badge ${d.cat === 'Neurotoxin' || d.cat === 'Peptide' ? 'cl-badge-red' : d.cat === 'Inhibitor' ? 'cl-badge-blue' : 'cl-badge-gray'}`}>{d.cat}</span></td>
                    <td>{d.src}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {selected && (
          <div className="cl-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div className="cl-card-title" style={{ marginBottom: 0 }}>Drug Detail</div>
              <button onClick={() => setSelected(null)} className="cl-btn cl-btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem' }}>Close</button>
            </div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '1rem' }}>{selected.name}</div>
            <div className="cl-viewer" style={{ height: 180, marginBottom: '1rem' }}>3D Molecule</div>
            {[
              ['CID', selected.cid], ['Formula', selected.formula], ['MW', `${selected.mw} Da`],
              ['Category', selected.cat], ['Mechanism', selected.mech], ['Source', selected.src],
            ].map(([k, v]) => (
              <div className="cl-detail" key={k}><span className="k">{k}</span><span className="v">{v}</span></div>
            ))}
            <div style={{ marginTop: '1rem' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>SMILES</div>
              <div className="cl-code">{selected.smiles}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════
   SIMULATION
   ═══════════════════════════════════════════ */
const SimulationPage: React.FC = () => {
  const [selP, setSelP] = useState<string[]>(['CfTX-1']);
  const [selD, setSelD] = useState<string[]>(['Tetrodotoxin', 'Lidocaine']);
  const [exh, setExh] = useState(8);
  const [poses, setPoses] = useState(9);
  const [seed, setSeed] = useState(42);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  const toggle = (_arr: string[], set: React.Dispatch<React.SetStateAction<string[]>>, val: string) =>
    set(prev => prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val]);

  const run = () => {
    setRunning(true); setProgress(0); setDone(false);
    let p = 0;
    const iv = setInterval(() => {
      p += Math.random() * 15 + 5;
      if (p >= 100) { p = 100; clearInterval(iv); setRunning(false); setDone(true); }
      setProgress(Math.min(p, 100));
    }, 400);
  };

  return (
    <div className="cl-fade">
      <div className="cl-grid-2" style={{ marginBottom: '1rem' }}>
        <div className="cl-card">
          <div className="cl-card-title">Proteins ({selP.length})</div>
          <label className="cl-checkbox" style={{ borderBottom: '1px solid #F3F4F6', paddingBottom: '0.5rem', marginBottom: '0.25rem' }}>
            <input type="checkbox" checked={selP.length === PROTEINS.length} onChange={() => setSelP(selP.length === PROTEINS.length ? [] : PROTEINS.map(p => p.name))} />
            <span style={{ fontWeight: 600 }}>Select All</span>
          </label>
          {PROTEINS.map(p => (
            <label className="cl-checkbox" key={p.name}>
              <input type="checkbox" checked={selP.includes(p.name)} onChange={() => toggle(selP, setSelP, p.name)} />
              <span>{p.name}</span>
              <span className="cl-badge cl-badge-gray" style={{ marginLeft: 'auto' }}>{p.organism.split(' ')[0][0]}. {p.organism.split(' ')[1]}</span>
            </label>
          ))}
        </div>
        <div className="cl-card">
          <div className="cl-card-title">Drugs ({selD.length})</div>
          <label className="cl-checkbox" style={{ borderBottom: '1px solid #F3F4F6', paddingBottom: '0.5rem', marginBottom: '0.25rem' }}>
            <input type="checkbox" checked={selD.length === DRUGS.length} onChange={() => setSelD(selD.length === DRUGS.length ? [] : DRUGS.map(d => d.name))} />
            <span style={{ fontWeight: 600 }}>Select All</span>
          </label>
          {DRUGS.map(d => (
            <label className="cl-checkbox" key={d.name}>
              <input type="checkbox" checked={selD.includes(d.name)} onChange={() => toggle(selD, setSelD, d.name)} />
              <span>{d.name}</span>
              <span className={`cl-badge ${d.cat === 'Neurotoxin' ? 'cl-badge-red' : 'cl-badge-gray'}`} style={{ marginLeft: 'auto' }}>{d.cat}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="cl-grid-2">
        <div className="cl-card">
          <div className="cl-card-title">Parameters</div>
          <div className="cl-control">
            <div className="cl-control-label"><span>Exhaustiveness</span><span className="val">{exh}</span></div>
            <input type="range" className="cl-slider" min={1} max={32} value={exh} onChange={e => setExh(+e.target.value)} />
          </div>
          <div className="cl-control">
            <div className="cl-control-label"><span>Number of Poses</span><span className="val">{poses}</span></div>
            <input type="range" className="cl-slider" min={1} max={20} value={poses} onChange={e => setPoses(+e.target.value)} />
          </div>
          <div className="cl-control">
            <div className="cl-control-label"><span>Random Seed</span></div>
            <input type="number" className="cl-input" min={0} max={9999} value={seed} onChange={e => setSeed(+e.target.value)} />
          </div>
        </div>
        <div className="cl-card">
          <div className="cl-card-title">Execute</div>
          <div style={{ fontSize: '0.825rem', color: '#6B7280', marginBottom: '1.25rem' }}>
            {selP.length} proteins &times; {selD.length} drugs = <strong style={{ color: '#111827' }}>{selP.length * selD.length}</strong> docking jobs
          </div>
          <button className={`cl-btn cl-btn-primary`} style={{ width: '100%', padding: '0.625rem' }} onClick={run} disabled={running || selP.length === 0 || selD.length === 0}>
            {running ? 'Running...' : done ? 'Run Again' : 'Start Simulation'}
          </button>
          {(running || done) && (
            <>
              <div className="cl-progress" style={{ marginTop: '1rem' }}>
                <div className="cl-progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <div style={{ fontSize: '0.75rem', color: '#9CA3AF', textAlign: 'center', marginTop: '0.5rem' }}>
                {done ? 'Complete' : `${Math.round(progress)}%`}
              </div>
            </>
          )}
          {done && (
            <div style={{ marginTop: '1.25rem' }}>
              <div className="cl-card-title">Top 5 Preview</div>
              {RESULTS.slice(0, 5).map(r => (
                <div className="cl-detail" key={r.rank}>
                  <span style={{ fontSize: '0.8rem' }}>
                    <span style={{ fontWeight: 600, marginRight: '0.5rem', color: '#9CA3AF' }}>#{r.rank}</span>
                    {r.drug} &rarr; {r.protein}
                  </span>
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, color: affinityColor(r.affinity) }}>{r.affinity}</span>
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
   RESULTS
   ═══════════════════════════════════════════ */
const ResultsPage: React.FC = () => {
  const [tab, setTab] = useState('all');
  const bars = [
    { label: '-10 to -9', val: 2, color: '#059669' },
    { label: '-9 to -8', val: 1, color: '#0D9488' },
    { label: '-8 to -7', val: 2, color: '#2563EB' },
    { label: '-7 to -6', val: 2, color: '#D97706' },
    { label: '-6 to -5', val: 2, color: '#EA580C' },
    { label: '-5 to -4', val: 1, color: '#DC2626' },
  ];
  const maxB = Math.max(...bars.map(b => b.val));

  return (
    <div className="cl-fade">
      <div className="cl-grid-4" style={{ marginBottom: '1.25rem' }}>
        {[
          { label: 'Total Results', value: '10' },
          { label: 'Successful', value: '8' },
          { label: 'Success Rate', value: '80%' },
          { label: 'Best Affinity', value: '-9.8' },
        ].map(s => (
          <div className="cl-stat" key={s.label}>
            <div className="label">{s.label}</div>
            <div className="value">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="cl-tabs">
        {[['all', 'All Results'], ['charts', 'Charts'], ['top10', 'Top 10'], ['analysis', 'Analysis']].map(([k, l]) => (
          <button key={k} className={`cl-tab ${tab === k ? 'active' : ''}`} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      {tab === 'all' && (
        <div className="cl-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="cl-table-wrap">
            <table className="cl-table">
              <thead>
                <tr><th>#</th><th>Drug</th><th>Protein</th><th>Affinity</th><th>H-Bonds</th><th>Contacts</th><th>Rating</th></tr>
              </thead>
              <tbody>
                {RESULTS.map(r => (
                  <tr key={r.rank}>
                    <td className="mono" style={{ fontWeight: 600, color: '#9CA3AF' }}>{r.rank}</td>
                    <td className="primary">{r.drug}</td>
                    <td>{r.protein}</td>
                    <td className="mono" style={{ fontWeight: 600, color: affinityColor(r.affinity) }}>{r.affinity}</td>
                    <td className="mono">{r.hbonds}</td>
                    <td className="mono">{r.hydro}</td>
                    <td><span className={`cl-badge ${badgeClass(r.rating)}`}>{r.rating}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'charts' && (
        <div className="cl-grid-2">
          <div className="cl-card">
            <div className="cl-card-title">Binding Affinity Distribution</div>
            <div className="cl-bars">
              {bars.map(b => (
                <div className="cl-bar-col" key={b.label}>
                  <div className="cl-bar-val">{b.val}</div>
                  <div className="cl-bar" style={{ height: `${(b.val / maxB) * 110}px`, background: b.color }} />
                  <div className="cl-bar-label">{b.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="cl-card">
            <div className="cl-card-title">Results by Rating</div>
            <div className="cl-donut" style={{ background: `conic-gradient(#059669 0deg 72deg, #2563EB 72deg 144deg, #D97706 144deg 216deg, #EA580C 216deg 324deg, #DC2626 324deg 360deg)` }}>
              <div className="cl-donut-hole">
                <div className="num">10</div>
                <div className="label">Total</div>
              </div>
            </div>
            <div className="cl-legend">
              {[
                { c: '#059669', l: 'Excellent', n: 2 }, { c: '#2563EB', l: 'Good', n: 2 },
                { c: '#D97706', l: 'Moderate', n: 2 }, { c: '#EA580C', l: 'Weak', n: 3 },
                { c: '#DC2626', l: 'Very Weak', n: 1 },
              ].map(x => (
                <div className="cl-legend-item" key={x.l}>
                  <div className="cl-legend-dot" style={{ background: x.c }} />
                  <span>{x.l}</span>
                  <span className="count">{x.n}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'top10' && (
        <div>
          {RESULTS.map(r => (
            <div className="cl-rank-card" key={r.rank}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div className="cl-rank-num">{r.rank}</div>
                <div className="info">
                  <h5>{r.drug} &rarr; {r.protein}</h5>
                  <span><span className={`cl-badge ${badgeClass(r.rating)}`}>{r.rating}</span></span>
                </div>
              </div>
              <div className="metrics">
                <div className="affinity" style={{ color: affinityColor(r.affinity) }}>{r.affinity} kcal/mol</div>
                <div className="meta">{r.hbonds} H-bonds &middot; {r.hydro} contacts</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'analysis' && (
        <div className="cl-grid-2">
          <div className="cl-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.25rem 0' }}><div className="cl-card-title">By Protein</div></div>
            <table className="cl-table">
              <thead><tr><th>Protein</th><th>Best</th><th>Avg</th><th>Tested</th></tr></thead>
              <tbody>
                {['CfTX-1', 'CfTX-2', 'CaTX-A', 'CfTX-A', 'SmTX-1'].map(p => {
                  const h = RESULTS.filter(r => r.protein === p);
                  if (!h.length) return null;
                  return (
                    <tr key={p}>
                      <td className="primary">{p}</td>
                      <td className="mono" style={{ color: '#059669', fontWeight: 600 }}>{Math.min(...h.map(x => x.affinity)).toFixed(1)}</td>
                      <td className="mono">{(h.reduce((a, x) => a + x.affinity, 0) / h.length).toFixed(1)}</td>
                      <td className="mono">{h.length}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="cl-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.25rem 0' }}><div className="cl-card-title">By Drug</div></div>
            <table className="cl-table">
              <thead><tr><th>Drug</th><th>Best</th><th>Avg</th><th>Tested</th></tr></thead>
              <tbody>
                {Array.from(new Set(RESULTS.map(r => r.drug))).map(d => {
                  const h = RESULTS.filter(r => r.drug === d);
                  return (
                    <tr key={d}>
                      <td className="primary">{d}</td>
                      <td className="mono" style={{ color: '#059669', fontWeight: 600 }}>{Math.min(...h.map(x => x.affinity)).toFixed(1)}</td>
                      <td className="mono">{(h.reduce((a, x) => a + x.affinity, 0) / h.length).toFixed(1)}</td>
                      <td className="mono">{h.length}</td>
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
   EXPORT
   ═══════════════════════════════════════════ */
const ExportPage: React.FC = () => {
  const [exported, setExported] = useState<string | null>(null);

  return (
    <div className="cl-fade">
      <div className="cl-grid-3" style={{ marginBottom: '1.25rem' }}>
        {[
          { label: 'Total Results', value: '10' },
          { label: 'Successful', value: '8' },
          { label: 'Best Affinity', value: '-9.8' },
        ].map(s => (
          <div className="cl-stat" key={s.label}>
            <div className="label">{s.label}</div>
            <div className="value">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="cl-grid-3" style={{ marginBottom: '1.25rem' }}>
        {[
          { id: 'csv', title: 'CSV Export', desc: 'Comma-separated values for data analysis tools' },
          { id: 'excel', title: 'Excel Export', desc: 'Formatted workbook with tables and charts' },
          { id: 'pub', title: 'Publication Table', desc: 'Clean format for scientific paper submission' },
        ].map(e => (
          <div
            key={e.id}
            className={`cl-export-card ${exported === e.id ? 'selected' : ''}`}
            onClick={() => setExported(e.id)}
          >
            <h4>{e.title}</h4>
            <p>{e.desc}</p>
            {exported === e.id && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', fontWeight: 600, color: '#2563EB' }}>Downloaded</div>
            )}
          </div>
        ))}
      </div>

      <div className="cl-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem 0' }}>
          <div className="cl-card-title">Data Preview</div>
        </div>
        <div className="cl-table-wrap">
          <table className="cl-table">
            <thead>
              <tr><th>#</th><th>Drug</th><th>MW</th><th>Protein</th><th>Organism</th><th>Affinity</th><th>H-Bonds</th><th>Rating</th></tr>
            </thead>
            <tbody>
              {RESULTS.map(r => {
                const drug = DRUGS.find(d => d.name === r.drug);
                const prot = PROTEINS.find(p => p.name === r.protein);
                return (
                  <tr key={r.rank}>
                    <td className="mono" style={{ color: '#9CA3AF' }}>{r.rank}</td>
                    <td className="primary">{r.drug}</td>
                    <td className="mono">{drug?.mw || ''}</td>
                    <td>{r.protein}</td>
                    <td style={{ fontSize: '0.775rem' }}>{prot?.organism || ''}</td>
                    <td className="mono" style={{ fontWeight: 600, color: affinityColor(r.affinity) }}>{r.affinity}</td>
                    <td className="mono">{r.hbonds}</td>
                    <td><span className={`cl-badge ${badgeClass(r.rating)}`}>{r.rating}</span></td>
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
   MAIN
   ═══════════════════════════════════════════ */
const NAV = [
  { key: 'dashboard', label: 'Dashboard', icon: '\u25A3' },
  { key: 'proteins', label: 'Proteins', icon: '\u03B1' },
  { key: 'drugs', label: 'Drugs', icon: '\u2B22' },
  { key: 'simulation', label: 'Simulation', icon: '\u2697' },
  { key: 'results', label: 'Results', icon: '\u2261' },
  { key: 'export', label: 'Export', icon: '\u21E3' },
];

const PAGES: Record<string, { title: string; desc: string; component: React.FC }> = {
  dashboard: { title: 'Dashboard', desc: 'Overview of your research data and activity', component: Dashboard },
  proteins: { title: 'Proteins', desc: 'Toxin protein database with structure visualization', component: ProteinsPage },
  drugs: { title: 'Drugs', desc: 'Therapeutic compound library and molecular data', component: DrugsPage },
  simulation: { title: 'Simulation', desc: 'Configure and run molecular docking simulations', component: SimulationPage },
  results: { title: 'Results', desc: 'Binding affinity analysis and rankings', component: ResultsPage },
  export: { title: 'Export', desc: 'Download results for publication and analysis', component: ExportPage },
};

export const ClinicalDemo: React.FC = () => {
  const [page, setPage] = useState('dashboard');
  const [fadeKey, setFadeKey] = useState(0);
  const current = PAGES[page];
  const PageComp = current.component;

  const nav = (key: string) => { setPage(key); setFadeKey(k => k + 1); };

  return (
    <div className="clinical">
      <div className="cl-sidebar">
        <div className="cl-logo">
          <h2>BoxJellyProt</h2>
          <span>Toxin Analysis Platform</span>
        </div>
        <div className="cl-nav">
          {NAV.map(n => (
            <button key={n.key} className={`cl-nav-item ${page === n.key ? 'active' : ''}`} onClick={() => nav(n.key)}>
              <span className="cl-nav-icon">{n.icon}</span>
              {n.label}
            </button>
          ))}
        </div>
        <div className="cl-sidebar-footer">v2.0 &middot; Clinical White</div>
      </div>
      <div className="cl-main">
        <div className="cl-header">
          <h1>{current.title}</h1>
          <p>{current.desc}</p>
        </div>
        <div className="cl-body" key={fadeKey}>
          <PageComp />
        </div>
      </div>
    </div>
  );
};
