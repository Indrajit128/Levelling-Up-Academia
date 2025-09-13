import React from 'react'

export default function WeightControls({weights, onChange}){
  const handle = (k) => (e) => {
    const val = Number(e.target.value)
    onChange({...weights, [k]: val})
  }
  return (
    <div className="card weight-controls">
      <h3>Adjust AII Weights</h3>
      <div className="weights-grid">
        <label>Research <input type="range" min="0" max="100" value={weights.research} onChange={handle('research')} /></label>
        <label>Teaching <input type="range" min="0" max="100" value={weights.teaching} onChange={handle('teaching')} /></label>
        <label>Collab <input type="range" min="0" max="100" value={weights.collaboration} onChange={handle('collaboration')} /></label>
        <label>Outreach <input type="range" min="0" max="100" value={weights.outreach} onChange={handle('outreach')} /></label>
      </div>
      <div className="weights-summary">
        <small>Normalized: </small>
        <div>Research {weights.research}%</div>
        <div>Teaching {weights.teaching}%</div>
        <div>Collab {weights.collaboration}%</div>
        <div>Outreach {weights.outreach}%</div>
      </div>
    </div>
  )
}
