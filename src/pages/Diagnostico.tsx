import React, { useMemo, useState } from 'react'
import TrafficLight from '../components/semaforo/TrafficLight'
import { scoreToStatus } from '../components/semaforo/useSemaforo'
import '../semaforo.css'

export default function Diagnostico() {
  const [kpi, setKpi] = useState({ calidad: 72, entrega: 55, cumplimiento: 88 })
  const [weights, setWeights] = useState({
    calidad: 0.4,
    entrega: 0.3,
    cumplimiento: 0.3,
  })
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
      kpi.calidad * norm.calidad +
        kpi.entrega * norm.entrega +
        kpi.cumplimiento * norm.cumplimiento
    )
  }, [kpi, weights])

  const status = scoreToStatus(composite, { warn: Number(warn), ok: Number(ok) })

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Diagnóstico – Semáforo</h1>
      <p className="mb-8 text-base-content/70">
        Controla tus indicadores y visualiza el estado general con el semáforo.
      </p>

      {/* Secciones de inputs */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Indicadores */}
        <div className="card bg-base-100 shadow-xl p-4">
          <h3 className="text-lg font-semibold mb-3">Indicadores (0–100)</h3>
          <label className="label">Calidad</label>
          <input
            type="number"
            className="input input-bordered input-sm w-full"
            min="0"
            max="100"
            value={kpi.calidad}
            onChange={(e) =>
              setKpi((v) => ({ ...v, calidad: +e.target.value }))
            }
          />
          <label className="label">Entrega</label>
          <input
            type="number"
            className="input input-bordered input-sm w-full"
            min="0"
            max="100"
            value={kpi.entrega}
            onChange={(e) =>
              setKpi((v) => ({ ...v, entrega: +e.target.value }))
            }
          />
          <label className="label">Cumplimiento</label>
          <input
            type="number"
            className="input input-bordered input-sm w-full"
            min="0"
            max="100"
            value={kpi.cumplimiento}
            onChange={(e) =>
              setKpi((v) => ({ ...v, cumplimiento: +e.target.value }))
            }
          />
        </div>

        {/* Ponderaciones */}
        <div className="card bg-base-100 shadow-xl p-4">
          <h3 className="text-lg font-semibold mb-3">Ponderaciones</h3>
          <label className="label">Calidad (0–1)</label>
          <input
            type="number"
            className="input input-bordered input-sm w-full"
            step="0.1"
            min="0"
            max="1"
            value={weights.calidad}
            onChange={(e) =>
              setWeights((w) => ({ ...w, calidad: +e.target.value }))
            }
          />
          <label className="label">Entrega (0–1)</label>
          <input
            type="number"
            className="input input-bordered input-sm w-full"
            step="0.1"
            min="0"
            max="1"
            value={weights.entrega}
            onChange={(e) =>
              setWeights((w) => ({ ...w, entrega: +e.target.value }))
            }
          />
          <label className="label">Cumplimiento (0–1)</label>
          <input
            type="number"
            className="input input-bordered input-sm w-full"
            step="0.1"
            min="0"
            max="1"
            value={weights.cumplimiento}
            onChange={(e) =>
              setWeights((w) => ({ ...w, cumplimiento: +e.target.value }))
            }
          />
        </div>

        {/* Umbrales */}
        <div className="card bg-base-100 shadow-xl p-4">
          <h3 className="text-lg font-semibold mb-3">Umbrales</h3>
          <label className="label">Advertencia (amarillo) desde</label>
          <input
            type="number"
            className="input input-bordered input-sm w-full"
            min="0"
            max="100"
            value={warn}
            onChange={(e) => setWarn(+e.target.value)}
          />
          <label className="label">Óptimo (verde) desde</label>
          <input
            type="number"
            className="input input-bordered input-sm w-full"
            min="0"
            max="100"
            value={ok}
            onChange={(e) => setOk(+e.target.value)}
          />
          <div className="mt-4">
            <button
              className="btn btn-primary btn-sm w-full"
              onClick={() => setPulse((p) => !p)}
            >
              {pulse ? 'Detener animación' : 'Animar semáforo'}
            </button>
          </div>
        </div>
      </div>

      {/* Resultado */}
      <div className="card bg-base-100 shadow-xl p-6 mt-8">
        <p className="mb-4 text-base-content/80">
          Puntaje compuesto: <b>{composite}</b>
        </p>
        <TrafficLight status={status} pulse={pulse} label="Diagnóstico Global" />

        <div className="legend mt-6">
          <div className="chip">
            <span className="dot red" /> Malo {"<"} {warn}
          </div>
          <div className="chip">
            <span className="dot yellow" /> Atención ≥ {warn} y {"<"} {ok}
          </div>
          <div className="chip">
            <span className="dot green" /> Óptimo ≥ {ok}
          </div>
        </div>
      </div>
    </div>
  )
}
