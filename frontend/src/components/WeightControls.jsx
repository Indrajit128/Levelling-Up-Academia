import React, { useEffect, useRef, useState } from 'react'

function useAnimatedNumber(value, duration=300){
  const [display, setDisplay] = useState(value)
  const raf = useRef(null)
  const start = useRef(null)
  const from = useRef(value)

  useEffect(()=>{
    cancelAnimationFrame(raf.current)
    from.current = display
    const diff = value - from.current
    const startTime = performance.now()
    function step(ts){
      const t = Math.min(1, (ts - startTime)/duration)
      const eased = 1 - Math.pow(1-t, 3)
      setDisplay(Math.round(from.current + diff * eased))
      if(t < 1) raf.current = requestAnimationFrame(step)
    }
    raf.current = requestAnimationFrame(step)
    return ()=> cancelAnimationFrame(raf.current)
  },[value])

  return display
}

export default function WeightControls({weights, onChange, previewWeights}){
  const handle = (k) => (e) => {
    const val = Number(e.target.value)
    onChange({...weights, [k]: val})
  }

  const dResearch = useAnimatedNumber(weights.research)
  const dTeaching = useAnimatedNumber(weights.teaching)
  const dCollab = useAnimatedNumber(weights.collaboration)
  const dOutreach = useAnimatedNumber(weights.outreach)

  return (
    <div className="card weight-controls">
      <h3>Adjust AII Weights</h3>
      <div className="weights-grid">
        <label>Research <input type="range" min="0" max="100" value={weights.research} onChange={handle('research')} data-preview={previewWeights?.research} /></label>
        <label>Teaching <input type="range" min="0" max="100" value={weights.teaching} onChange={handle('teaching')} data-preview={previewWeights?.teaching} /></label>
        <label>Collab <input type="range" min="0" max="100" value={weights.collaboration} onChange={handle('collaboration')} data-preview={previewWeights?.collaboration} /></label>
        <label>Outreach <input type="range" min="0" max="100" value={weights.outreach} onChange={handle('outreach')} data-preview={previewWeights?.outreach} /></label>
      </div>
      <div className="weights-summary">
        <small>Normalized: </small>
        <div>Research {dResearch}% {previewWeights && previewWeights.research !== undefined && <span className={previewWeights.research>weights.research? 'delta-up':'delta-down'}>→ {previewWeights.research}%</span>}</div>
        <div>Teaching {dTeaching}% {previewWeights && previewWeights.teaching !== undefined && <span className={previewWeights.teaching>weights.teaching? 'delta-up':'delta-down'}>→ {previewWeights.teaching}%</span>}</div>
        <div>Collab {dCollab}% {previewWeights && previewWeights.collaboration !== undefined && <span className={previewWeights.collaboration>weights.collaboration? 'delta-up':'delta-down'}>→ {previewWeights.collaboration}%</span>}</div>
        <div>Outreach {dOutreach}% {previewWeights && previewWeights.outreach !== undefined && <span className={previewWeights.outreach>weights.outreach? 'delta-up':'delta-down'}>→ {previewWeights.outreach}%</span>}</div>
      </div>
    </div>
  )
}
