import React from 'react'

export default function Feedback({items=[]}){
  return (
    <div className="card feedback">
      <h3>Student Feedback</h3>
      <ul className="fb-list">
        {items.map(f => (
          <li key={f.id} className="fb-item">
            <div className="fb-meta"><strong>{f.instructor}</strong> — {f.course} ({f.semester})</div>
            <div className="fb-rating">Rating: {f.rating}</div>
            <div className="fb-comments">"{f.comments}"</div>
          </li>
        ))}
      </ul>
    </div>
  )
}
