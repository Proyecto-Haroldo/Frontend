import React from 'react'

type TrafficLightStatus = 'bad' | 'warn' | 'ok'

interface Props {
  status?: TrafficLightStatus
  label?: string
  pulse?: boolean
}

export default function TrafficLight({
  status = 'ok',
  label = 'Estado',
  pulse = false,
}: Props) {
  const is = (key: TrafficLightStatus) => status === key

  return (
    <div className="semaforo" role="status" aria-live="polite">
      <div className="lights" title={label}>
        <div className={`light red ${is('bad') ? 'on ' + (pulse ? 'pulse' : '') : ''}`} />
        <div className={`light yellow ${is('warn') ? 'on ' + (pulse ? 'pulse' : '') : ''}`} />
        <div className={`light green ${is('ok') ? 'on ' + (pulse ? 'pulse' : '') : ''}`} />
      </div>
      <span className="badge">
        {label} · {status === 'ok' ? 'Óptimo' : status === 'warn' ? 'Atención' : 'Crítico'}
      </span>
    </div>
  )
}
