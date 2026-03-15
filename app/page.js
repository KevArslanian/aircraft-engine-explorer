'use client';
import { useState, useEffect, useRef, useCallback } from 'react';

const ENGINES = [
  {
    id: 'turbofan',
    name: 'Turbofan',
    color: '#3b82f6',
    icon: '✈️',
    example: 'GE90-115B (Boeing 777)',
    description: 'Mesin jet paling umum di penerbangan komersial. Menggunakan fan besar di depan untuk menghasilkan sebagian besar thrust melalui bypass air.',
    specs: {
      thrust: '115,300 lbf (513 kN)',
      bypassRatio: '8.7:1',
      pressureRatio: '42.2:1',
      massFlow: '1,350 kg/s',
      sfc: '0.545 lb/(lbf·h)',
      weight: '8,283 kg',
      diameter: '3.25 m',
      length: '7.29 m',
      rpm: '2,235 (fan) / 9,332 (HP)',
      egt: '607°C'
    },
    perf: { thrust: 95, efficiency: 85, speed: 70, weight: 40, cost: 35, reliability: 90 },
    maxThrust: 115300, maxEGT: 607, maxFuelFlow: 4.2, maxRPM: 9332
  },
  {
    id: 'turbojet',
    name: 'Turbojet',
    color: '#ef4444',
    icon: '🚀',
    example: 'P&W J58 (SR-71 Blackbird)',
    description: 'Mesin jet murni tanpa bypass fan. Semua udara melewati core engine. Cocok untuk kecepatan supersonik tinggi.',
    specs: {
      thrust: '34,000 lbf (151 kN)',
      bypassRatio: '0:1 (tanpa bypass)',
      pressureRatio: '8.8:1',
      massFlow: '140 kg/s',
      sfc: '1.9 lb/(lbf·h) (afterburner)',
      weight: '2,722 kg',
      diameter: '1.42 m',
      length: '5.72 m',
      rpm: '8,500 (HP)',
      egt: '850°C'
    },
    perf: { thrust: 65, efficiency: 40, speed: 95, weight: 70, cost: 60, reliability: 70 },
    maxThrust: 34000, maxEGT: 850, maxFuelFlow: 8.5, maxRPM: 8500
  },
  {
    id: 'turboprop',
    name: 'Turboprop',
    color: '#22c55e',
    icon: '🛩️',
    example: 'PW127M (ATR 72-600)',
    description: 'Turbin gas yang menggerakkan propeller melalui gearbox. Sangat efisien pada kecepatan rendah hingga sedang (<450 knots).',
    specs: {
      thrust: '2,750 shp (2,051 kW)',
      bypassRatio: 'N/A (propeller)',
      pressureRatio: '15:1',
      massFlow: '8.5 kg/s',
      sfc: '0.459 lb/(shp·h)',
      weight: '481 kg',
      diameter: '0.66 m (core)',
      length: '2.13 m',
      rpm: '1,200 (prop) / 33,000 (PT)',
      egt: '550°C'
    },
    perf: { thrust: 30, efficiency: 95, speed: 35, weight: 90, cost: 85, reliability: 92 },
    maxThrust: 2750, maxEGT: 550, maxFuelFlow: 0.8, maxRPM: 33000
  },
  {
    id: 'turboshaft',
    name: 'Turboshaft',
    color: '#a855f7',
    icon: '🚁',
    example: 'GE T700-701D (Black Hawk)',
    description: 'Mirip turboprop tapi output shaft menggerakkan rotor helikopter. Dioptimalkan untuk menghasilkan shaft power, bukan thrust langsung.',
    specs: {
      thrust: '2,000 shp (1,491 kW)',
      bypassRatio: 'N/A (shaft)',
      pressureRatio: '18.5:1',
      massFlow: '4.6 kg/s',
      sfc: '0.40 lb/(shp·h)',
      weight: '192 kg',
      diameter: '0.58 m',
      length: '1.17 m',
      rpm: '20,900 (gas gen)',
      egt: '810°C'
    },
    perf: { thrust: 25, efficiency: 80, speed: 20, weight: 95, cost: 75, reliability: 88 },
    maxThrust: 2000, maxEGT: 810, maxFuelFlow: 0.5, maxRPM: 20900
  },
  {
    id: 'ramjet',
    name: 'Ramjet',
    color: '#f59e0b',
    icon: '⚡',
    example: 'MBDA Meteor (Missile)',
    description: 'Mesin tanpa bagian bergerak. Mengkompresi udara hanya dari kecepatan maju (ram effect). Hanya bekerja di kecepatan supersonik (Mach 2-6).',
    specs: {
      thrust: '~15,000 lbf (varies)',
      bypassRatio: 'N/A',
      pressureRatio: '~36:1 (at Mach 5)',
      massFlow: '~65 kg/s',
      sfc: '4.5 lb/(lbf·h)',
      weight: '~200 kg',
      diameter: '0.30 m',
      length: '3.65 m',
      rpm: 'N/A (tanpa turbin)',
      egt: '2,200°C'
    },
    perf: { thrust: 50, efficiency: 30, speed: 100, weight: 98, cost: 50, reliability: 45 },
    maxThrust: 15000, maxEGT: 2200, maxFuelFlow: 12, maxRPM: 0
  },
  {
    id: 'piston',
    name: 'Piston',
    color: '#06b6d4',
    icon: '⚙️',
    example: 'Lycoming IO-540 (Cessna 206)',
    description: 'Mesin pembakaran dalam klasik dengan piston dan silinder. Digunakan pada pesawat kecil GA (General Aviation). Sederhana dan handal.',
    specs: {
      thrust: '300 hp (224 kW)',
      bypassRatio: 'N/A (propeller)',
      pressureRatio: '8.7:1 (kompresi)',
      massFlow: 'N/A',
      sfc: '0.42 lb/(hp·h)',
      weight: '194 kg',
      diameter: '0.85 m',
      length: '0.99 m',
      rpm: '2,700 (max)',
      egt: '480°C'
    },
    perf: { thrust: 10, efficiency: 70, speed: 15, weight: 92, cost: 95, reliability: 85 },
    maxThrust: 300, maxEGT: 480, maxFuelFlow: 0.12, maxRPM: 2700
  }
];

const PERF_LABELS = ['Thrust','Efisiensi','Kecepatan','Ringan','Biaya','Reliabilitas'];
const PERF_KEYS = ['thrust','efficiency','speed','weight','cost','reliability'];


function RadarChart({ data, color, size = 200 }) {
  const cx = size / 2, cy = size / 2, r = size * 0.38;
  const pts = PERF_KEYS.map((k, i) => {
    const angle = (Math.PI * 2 * i) / 6 - Math.PI / 2;
    const val = data[k] / 100;
    return { x: cx + r * val * Math.cos(angle), y: cy + r * val * Math.sin(angle), lx: cx + (r + 18) * Math.cos(angle), ly: cy + (r + 18) * Math.sin(angle), label: PERF_LABELS[i] };
  });
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + 'Z';
  const grid = [0.25, 0.5, 0.75, 1].map(s =>
    PERF_KEYS.map((_, i) => {
      const a = (Math.PI * 2 * i) / 6 - Math.PI / 2;
      return `${cx + r * s * Math.cos(a)},${cy + r * s * Math.sin(a)}`;
    }).join(' ')
  );
  return (
    <svg width={size} height={size} className="mx-auto">
      {grid.map((g, i) => <polygon key={i} points={g} fill="none" stroke="#333" strokeWidth="0.5" />)}
      {PERF_KEYS.map((_, i) => {
        const a = (Math.PI * 2 * i) / 6 - Math.PI / 2;
        return <line key={i} x1={cx} y1={cy} x2={cx + r * Math.cos(a)} y2={cy + r * Math.sin(a)} stroke="#333" strokeWidth="0.5" />;
      })}
      <polygon points={pts.map(p => `${p.x},${p.y}`).join(' ')} fill={color + '30'} stroke={color} strokeWidth="2" />
      {pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="3" fill={color} />)}
      {pts.map((p, i) => <text key={i} x={p.lx} y={p.ly} textAnchor="middle" dominantBaseline="middle" fill="#999" fontSize="9">{p.label}</text>)}
    </svg>
  );
}

function GaugeRing({ value, max, label, unit, color, size = 80 }) {
  const r = size * 0.38, circ = 2 * Math.PI * r, pct = Math.min(value / max, 1);
  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#222" strokeWidth="6" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="6" strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)} strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`} style={{ transition: 'stroke-dashoffset 0.3s' }} />
        <text x={size/2} y={size/2 - 4} textAnchor="middle" fill="#fff" fontSize="11" fontWeight="bold">{typeof value === 'number' ? value.toLocaleString() : value}</text>
        <text x={size/2} y={size/2 + 10} textAnchor="middle" fill="#888" fontSize="8">{unit}</text>
      </svg>
      <span className="text-xs text-gray-500 mt-1">{label}</span>
    </div>
  );
}

function EngineCanvas({ engineId, throttle, color }) {
  const canvasRef = useRef(null);
  const frameRef = useRef(0);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    const draw = () => {
      frameRef.current += 0.02 + throttle * 0.08;
      const t = frameRef.current;
      const w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#0d0d15';
      ctx.fillRect(0, 0, w, h);
      const cx = w / 2, cy = h / 2;
      // Nacelle body
      ctx.beginPath();
      ctx.ellipse(cx, cy, 90, 50, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#1a1a2e';
      ctx.fill();
      ctx.strokeStyle = color + '60';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      // Engine-specific animation
      if (engineId === 'turbofan' || engineId === 'turbojet') {
        // Spinning fan blades
        const blades = engineId === 'turbofan' ? 22 : 12;
        for (let i = 0; i < blades; i++) {
          const angle = (Math.PI * 2 * i) / blades + t;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + Math.cos(angle) * 42, cy + Math.sin(angle) * 42);
          ctx.strokeStyle = color + (throttle > 0.5 ? 'cc' : '88');
          ctx.lineWidth = engineId === 'turbofan' ? 3 : 2;
          ctx.stroke();
        }
        // Exhaust glow
        if (throttle > 0.1) {
          const grad = ctx.createRadialGradient(cx + 70, cy, 0, cx + 70, cy, 30 + throttle * 50);
          grad.addColorStop(0, color + '80');
          grad.addColorStop(1, 'transparent');
          ctx.fillStyle = grad;
          ctx.fillRect(cx + 40, cy - 60, 120, 120);
        }
      } else if (engineId === 'turboprop' || engineId === 'piston') {
        // Propeller
        const propBlades = 4;
        for (let i = 0; i < propBlades; i++) {
          const angle = (Math.PI * 2 * i) / propBlades + t * 1.5;
          ctx.beginPath();
          ctx.ellipse(cx - 60 + Math.cos(angle) * 35, cy + Math.sin(angle) * 35, 8, 2, angle, 0, Math.PI * 2);
          ctx.fillStyle = color + 'cc';
          ctx.fill();
        }
        // Prop disc
        if (throttle > 0.3) {
          ctx.beginPath();
          ctx.arc(cx - 60, cy, 38, 0, Math.PI * 2);
          ctx.strokeStyle = color + '30';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      } else if (engineId === 'turboshaft') {
        // Rotor blades (top view)
        const rotorBlades = 4;
        for (let i = 0; i < rotorBlades; i++) {
          const angle = (Math.PI * 2 * i) / rotorBlades + t * 0.8;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + Math.cos(angle) * 70, cy + Math.sin(angle) * 20);
          ctx.strokeStyle = color + 'bb';
          ctx.lineWidth = 4;
          ctx.stroke();
        }
      } else if (engineId === 'ramjet') {
        // Shockwave cones
        if (throttle > 0.2) {
          for (let i = 0; i < 3; i++) {
            const offset = ((t * 80 + i * 40) % 120);
            ctx.beginPath();
            ctx.moveTo(cx - 80 + offset, cy - 30 - i * 5);
            ctx.lineTo(cx - 60 + offset, cy);
            ctx.lineTo(cx - 80 + offset, cy + 30 + i * 5);
            ctx.strokeStyle = color + (60 - i * 15).toString(16).padStart(2, '0');
            ctx.lineWidth = 2;
            ctx.stroke();
          }
        }
        // Flame
        if (throttle > 0.1) {
          const flameLen = throttle * 80;
          const grad = ctx.createLinearGradient(cx + 50, cy, cx + 50 + flameLen, cy);
          grad.addColorStop(0, '#ff6600cc');
          grad.addColorStop(0.5, '#ff3300aa');
          grad.addColorStop(1, 'transparent');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.moveTo(cx + 50, cy - 15);
          ctx.quadraticCurveTo(cx + 50 + flameLen * 0.7, cy - 5 + Math.sin(t * 10) * 5, cx + 50 + flameLen, cy);
          ctx.quadraticCurveTo(cx + 50 + flameLen * 0.7, cy + 5 + Math.sin(t * 10 + 1) * 5, cx + 50, cy + 15);
          ctx.fill();
        }
      }
      // Center hub
      ctx.beginPath();
      ctx.arc(cx, cy, 6, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      // Throttle indicator text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`THR ${Math.round(throttle * 100)}%`, w - 10, 20);
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animId);
  }, [engineId, throttle, color]);
  return <canvas ref={canvasRef} width={400} height={220} className="w-full rounded-lg border border-gray-800" />;
}

export default function Page() {
  const [sel, setSel] = useState(0);
  const [tab, setTab] = useState('overview');
  const [throttle, setThrottle] = useState(0);
  const [showCompare, setShowCompare] = useState(false);
  const engine = ENGINES[sel];
  const simThrust = Math.round(engine.maxThrust * throttle);
  const simEGT = Math.round(engine.maxEGT * (0.3 + throttle * 0.7));
  const simFuel = (engine.maxFuelFlow * (0.1 + throttle * 0.9)).toFixed(2);
  const simEff = Math.round(engine.perf.efficiency * (throttle < 0.3 ? 0.6 : throttle < 0.7 ? 1 : 0.85));

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-200">
      {/* Header */}
      <header className="border-b border-gray-800 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: engine.color }}>Aircraft Engine Explorer</h1>
            <p className="text-sm text-gray-500">Jenis-Jenis Mesin Pesawat &bull; Spesifikasi &bull; Simulasi Interaktif</p>
          </div>
          <button onClick={() => setShowCompare(!showCompare)} className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-700 hover:bg-gray-800 transition">
            {showCompare ? 'Tutup Tabel' : 'Bandingkan Semua'}
          </button>
        </div>
      </header>

      {/* Engine Selector */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto flex overflow-x-auto gap-1 px-4 py-2">
          {ENGINES.map((e, i) => (
            <button key={e.id} onClick={() => { setSel(i); setThrottle(0); }} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${ sel === i ? 'text-white' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'}`} style={sel === i ? { background: e.color + '20', color: e.color, boxShadow: `0 0 15px ${e.color}30` } : {}}>
              <span>{e.icon}</span> {e.name}
            </button>
          ))}
        </div>
      </div>

      {showCompare ? (
        /* Comparison Table */
        <div className="max-w-7xl mx-auto p-4 overflow-x-auto">
          <h2 className="text-xl font-bold mb-4">Tabel Perbandingan Mesin</h2>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left py-2 px-3 text-gray-400">Spesifikasi</th>
                {ENGINES.map(e => <th key={e.id} className="py-2 px-3 text-center" style={{ color: e.color }}>{e.icon} {e.name}</th>)}
              </tr>
            </thead>
            <tbody>
              {Object.keys(ENGINES[0].specs).map(key => (
                <tr key={key} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                  <td className="py-2 px-3 text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</td>
                  {ENGINES.map(e => <td key={e.id} className="py-2 px-3 text-center text-gray-300">{e.specs[key]}</td>)}
                </tr>
              ))}
              <tr className="border-b border-gray-800/50">
                <td className="py-2 px-3 text-gray-400">Contoh</td>
                {ENGINES.map(e => <td key={e.id} className="py-2 px-3 text-center text-gray-300">{e.example}</td>)}
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        /* Main Content */
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-4 p-4">
          {/* Left Panel */}
          <div className="flex-1">
            {/* Tabs */}
            <div className="flex gap-1 mb-4">
              {['overview','specs','simulation'].map(t => (
                <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition ${ tab === t ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-gray-300'}`}>
                  {t === 'overview' ? 'Ringkasan' : t === 'specs' ? 'Spesifikasi' : 'Simulasi'}
                </button>
              ))}
            </div>

            {tab === 'overview' && (
              <div className="space-y-4">
                <div className="rounded-xl p-6 border border-gray-800" style={{ background: `linear-gradient(135deg, ${engine.color}08, ${engine.color}03)` }}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-4xl">{engine.icon}</span>
                    <div>
                      <h2 className="text-2xl font-bold" style={{ color: engine.color }}>{engine.name}</h2>
                      <p className="text-sm text-gray-400">{engine.example}</p>
                    </div>
                  </div>
                  <p className="text-gray-300 leading-relaxed">{engine.description}</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[['Thrust', engine.specs.thrust],['Berat', engine.specs.weight],['Diameter', engine.specs.diameter],['SFC', engine.specs.sfc],['Bypass', engine.specs.bypassRatio],['EGT', engine.specs.egt]].map(([l, v]) => (
                    <div key={l} className="rounded-lg p-3 bg-gray-900/50 border border-gray-800">
                      <div className="text-xs text-gray-500">{l}</div>
                      <div className="text-sm font-medium text-gray-200 mt-1">{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === 'specs' && (
              <div className="rounded-xl border border-gray-800 overflow-hidden">
                <div className="p-4 border-b border-gray-800" style={{ background: engine.color + '10' }}>
                  <h3 className="font-bold" style={{ color: engine.color }}>{engine.icon} {engine.name} - Spesifikasi Lengkap</h3>
                  <p className="text-xs text-gray-500">{engine.example}</p>
                </div>
                <div className="divide-y divide-gray-800/50">
                  {Object.entries(engine.specs).map(([k, v]) => (
                    <div key={k} className="flex justify-between px-4 py-3 hover:bg-gray-800/30">
                      <span className="text-gray-400 capitalize text-sm">{k.replace(/([A-Z])/g, ' $1')}</span>
                      <span className="text-gray-200 text-sm font-medium">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === 'simulation' && (
              <div className="space-y-4">
                <EngineCanvas engineId={engine.id} throttle={throttle} color={engine.color} />
                <div className="rounded-xl p-4 border border-gray-800 bg-gray-900/30">
                  <label className="text-sm text-gray-400 mb-2 block">Throttle: <span className="font-bold text-white">{Math.round(throttle * 100)}%</span></label>
                  <input type="range" min="0" max="100" value={Math.round(throttle * 100)} onChange={e => setThrottle(e.target.value / 100)} className="w-full h-2 rounded-lg appearance-none cursor-pointer" style={{ accentColor: engine.color }} />
                  <div className="flex justify-between text-xs text-gray-600 mt-1"><span>IDLE</span><span>TOGA</span></div>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  <GaugeRing value={simThrust} max={engine.maxThrust} label="Thrust" unit={engine.id === 'piston' ? 'hp' : 'lbf'} color={engine.color} />
                  <GaugeRing value={simEGT} max={engine.maxEGT} label="EGT" unit="\u00b0C" color="#ef4444" />
                  <GaugeRing value={parseFloat(simFuel)} max={engine.maxFuelFlow} label="Fuel Flow" unit="kg/s" color="#f59e0b" />
                  <GaugeRing value={simEff} max={100} label="Efisiensi" unit="%" color="#22c55e" />
                </div>
              </div>
            )}
          </div>

          {/* Right Panel */}
          <div className="w-full lg:w-80 space-y-4">
            <div className="rounded-xl p-4 border border-gray-800 bg-gray-900/30">
              <h3 className="text-sm font-bold text-gray-400 mb-3">Radar Performa</h3>
              <RadarChart data={engine.perf} color={engine.color} />
            </div>
            <div className="rounded-xl p-4 border border-gray-800 bg-gray-900/30">
              <h3 className="text-sm font-bold text-gray-400 mb-3">Quick Stats</h3>
              <div className="space-y-2">
                {PERF_KEYS.map((k, i) => (
                  <div key={k}>
                    <div className="flex justify-between text-xs mb-1"><span className="text-gray-500">{PERF_LABELS[i]}</span><span style={{ color: engine.color }}>{engine.perf[k]}%</span></div>
                    <div className="h-1.5 rounded-full bg-gray-800"><div className="h-full rounded-full transition-all duration-500" style={{ width: `${engine.perf[k]}%`, background: engine.color }} /></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl p-4 border border-gray-800 bg-gray-900/30">
              <h3 className="text-sm font-bold text-gray-400 mb-2">Semua Tipe</h3>
              <div className="space-y-1">
                {ENGINES.map((e, i) => (
                  <button key={e.id} onClick={() => { setSel(i); setThrottle(0); }} className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition ${ sel === i ? 'bg-gray-800' : 'hover:bg-gray-800/50'}`}>
                    <span>{e.icon}</span>
                    <span style={sel === i ? { color: e.color } : { color: '#999' }}>{e.name}</span>
                    <span className="ml-auto text-xs text-gray-600">{e.specs.thrust.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
