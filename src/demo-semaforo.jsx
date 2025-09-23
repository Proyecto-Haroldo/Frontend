import React, { useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import TrafficLight from './components/semaforo/TrafficLight'
import { scoreToStatus } from './components/semaforo/useSemaforo'
import './semaforo.css'

function DemoSemaforo() {
  const [kpi, setKpi] = useState({ calidad: 72, entrega: 55, cumplimiento: 88 })
  const [weights, setWeights] = useState({ calidad: 0.4, entrega: 0.3, cumplimiento: 0.3 })
  const [warn, setWarn] = useState(60)
  const [ok, setOk] = useState(80)
  const [pulse, setPulse] = useState(true)

  const composite = useMemo(() => {
    const wsum = weights.calidad + weights.entrega + weights.cumplimiento || 1
    const norm = {
      calidad: (weights.calidad || 0) / wsum,
      entrega: (weights.entrega || 0) / wsum,
      cumplimiento: (weights.cumplimiento || 0) / wsum,
    }
    return Math.round(
      (kpi.calidad * norm.calidad) + (kpi.entrega * norm.entrega) + (kpi.cumplimiento * norm.cumplimiento)
    )
  }, [kpi, weights])

  const status = scoreToStatus(composite, { warn: Number(warn), ok: Number(ok) })

  return (
    <div style={{maxWidth:980, margin:'32px auto', padding:24}}>
      <h1>Semáforo de Diagnóstico (Playground)</h1>
      <p>Esta página es independiente del app/login. Úsala solo para probar el componente.</p>

      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:16}}>
        <div>
          <h3>Indicadores (0–100)</h3>
          <label>Calidad</label>
          <input type="number" min="0" max="100" value={kpi.calidad}
                 onChange={e => setKpi(v => ({ ...v, calidad: +e.target.value }))} />
          <label>Entrega</label>
          <input type="number" min="0" max="100" value={kpi.entrega}
                 onChange={e => setKpi(v => ({ ...v, entrega: +e.target.value }))} />
          <label>Cumplimiento</label>
          <input type="number" min="0" max="100" value={kpi.cumplimiento}
                 onChange={e => setKpi(v => ({ ...v, cumplimiento: +e.target.value }))} />
        </div>

        <div>
          <h3>Ponderaciones</h3>
          <label>Calidad (0–1)</label>
          <input type="number" step="0.1" min="0" max="1" value={weights.calidad}
                 onChange={e => setWeights(w => ({ ...w, calidad: +e.target.value }))} />
          <label>Entrega (0–1)</label>
          <input type="number" step="0.1" min="0" max="1" value={weights.entrega}
                 onChange={e => setWeights(w => ({ ...w, entrega: +e.target.value }))} />
          <label>Cumplimiento (0–1)</label>
          <input type="number" step="0.1" min="0" max="1" value={weights.cumplimiento}
                 onChange={e => setWeights(w => ({ ...w, cumplimiento: +e.target.value }))} />
        </div>

        <div>
          <h3>Umbrales</h3>
          <label>Advertencia (amarillo) desde</label>
          <input type="number" min="0" max="100" value={warn} onChange={e => setWarn(+e.target.value)} />
          <label>Óptimo (verde) desde</label>
          <input type="number" min="0" max="100" value={ok} onChange={e => setOk(+e.target.value)} />
          <div style={{marginTop:12}}>
            <button onClick={()=>setPulse(p=>!p)}>{pulse ? 'Detener animación' : 'Animar semáforo'}</button>
          </div>
        </div>
      </div>

      <hr style={{margin:'16px 0'}} />

      <div>
        <p>Puntaje compuesto: <b>{composite}</b></p>
        <TrafficLight status={status} pulse={pulse} label="Diagnóstico Global" />
        <div className="legend" style={{marginTop:12}}>
          <div className="chip"><span className="dot red" /> Malo {"<"} {warn}</div>
          <div className="chip"><span className="dot yellow" /> Atención ≥ {warn} y {"<"} {ok}</div>
          <div className="chip"><span className="dot green" /> Óptimo ≥ {ok}</div>
        </div>
      </div>
    </div>
  )
}

createRoot(document.getElementById('root')).render(<DemoSemaforo />)
