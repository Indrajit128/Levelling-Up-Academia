import React, { useEffect, useState } from 'react'
import { getPublications, getFeedback } from './api'

export default function App(){
  const [pubs, setPubs] = useState([])
  const [fb, setFb] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(()=>{
    async function load(){
      try{
        const p = await getPublications()
        const f = await getFeedback()
        setPubs(p.items)
        setFb(f.items)
      }catch(e){
        setError(e.message || String(e))
      }finally{
        setLoading(false)
      }
    }
    load()
  },[])

  return (
    <div style={{padding:20,fontFamily:'Arial'}}>
      <h1>Levelling Up Academia — Dashboard (MVP)</h1>
      {loading && <p>Loading sample data...</p>}
      {error && <p style={{color:'red'}}>Error: {error}</p>}

      <section>
        <h2>Publications ({pubs.length})</h2>
        <ul>
          {pubs.map(p=> <li key={p.id}><strong>{p.title}</strong> — {p.authors.join(', ')} ({p.year})</li>)}
        </ul>
      </section>

      <section>
        <h2>Student Feedback ({fb.length})</h2>
        <ul>
          {fb.map(f=> <li key={f.id}><strong>{f.instructor}</strong> ({f.course}): {f.rating} — "{f.comments}"</li>)}
        </ul>
      </section>
    </div>
  )
}
