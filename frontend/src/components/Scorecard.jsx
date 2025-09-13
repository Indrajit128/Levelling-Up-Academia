import React from 'react'

export default function Scorecard({score = 72, breakdown={research:40, teaching:20, collaboration:10, outreach:2}}){
  return (
    <div className="card scorecard">
      <div className="score-main">
        <div className="score-value">{score}</div>
        <div className="score-label">AII</div>
      </div>
      <div className="score-breakdown">
        <div>Research <strong>{breakdown.research}</strong></div>
        <div>Teaching <strong>{breakdown.teaching}</strong></div>
        <div>Collab <strong>{breakdown.collaboration}</strong></div>
        <div>Outreach <strong>{breakdown.outreach}</strong></div>
      </div>
    </div>
  )
}
