import React from 'react'

export default function Publications({items=[]}){
  return (
    <div className="card pubs">
      <h3>Publications</h3>
      <div className="pub-list">
        {items.map(p => (
          <article key={p.id} className="pub-item">
            <div className="pub-title">{p.title}</div>
            <div className="pub-meta">{p.authors.join(', ')} — {p.year}</div>
          </article>
        ))}
      </div>
    </div>
  )
}
