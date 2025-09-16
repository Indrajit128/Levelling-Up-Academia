import React, { useEffect, useState, useMemo } from 'react'
import { getPublications, getFeedback, aiAnalyze, getUserWeights, postUserWeights } from './api'
import Scorecard from './components/Scorecard'
import Publications from './components/Publications'
import Feedback from './components/Feedback'
import WeightControls from './components/WeightControls'
import SearchBar from './components/SearchBar'
import TrendChart from './components/TrendChart'
import AIChat from './components/AIChat'
import ConfirmModal from './components/ConfirmModal'

export default function App(){
  const [pubs, setPubs] = useState([])
  const [fb, setFb] = useState([])
  const [query, setQuery] = useState('')
  const [yearFilter, setYearFilter] = useState(null)
  const [weights, setWeights] = useState({research:50, teaching:30, collaboration:15, outreach:5})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [aiReply, setAiReply] = useState(null)
  const [pendingSuggestion, setPendingSuggestion] = useState(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmPayload, setConfirmPayload] = useState(null)
  const [undoState, setUndoState] = useState(null)

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
    // load persisted weights
    try{
      const saved = localStorage.getItem('ai_weights')
      if(saved){ setWeights(JSON.parse(saved)) }
    }catch(e){ /* ignore */ }
  },[])

  // fetch server-stored weights and prefer them over localStorage if present
  useEffect(()=>{
    let mounted = true
    getUserWeights('default').then(r=>{
      if(!mounted) return
      if(r && r.ok && r.weights){
        setWeights(r.weights)
        try{ localStorage.setItem('ai_weights', JSON.stringify(r.weights)) }catch(e){}
      }
    }).catch(()=>{})
    return ()=>{ mounted = false }
  },[])

  const handleUndo = async ()=>{
    if(!undoState || !undoState.previous) return
    const prev = undoState.previous
    setWeights(prev)
    try{ localStorage.setItem('ai_weights', JSON.stringify(prev)) }catch(e){}
    try{ await postUserWeights('default', prev) }catch(e){ console.warn('server restore failed', e) }
    setUndoState(null)
  }

  // filtered publications
  const filteredPubs = useMemo(()=>{
    return pubs.filter(p=>{
      if(yearFilter && p.year !== yearFilter) return false
      if(!query) return true
      const q = query.toLowerCase()
      return p.title.toLowerCase().includes(q) || p.authors.join(' ').toLowerCase().includes(q)
    })
  },[pubs, query, yearFilter])

  // compute simple feature scores and combine into AII
  const aiScores = useMemo(()=>{
    // research: normalized citation sum
    const totalCitations = pubs.reduce((s,p)=>s + (p.citation_count||0),0)
    const research = totalCitations ? Math.min(100, Math.round((totalCitations/50)*10)) : 0
    // teaching: average rating scaled to 0-100
    const avgRating = fb.length ? (fb.reduce((s,f)=>s+ (f.rating||0),0)/fb.length) : 0
    const teaching = Math.round((avgRating/5)*100)
    // collaboration: avg number of authors
    const avgAuthors = pubs.length ? pubs.reduce((s,p)=>s + (p.authors? p.authors.length:1),0)/pubs.length : 0
    const collaboration = Math.min(100, Math.round((avgAuthors/5)*100))
    // outreach: placeholder small score
    const outreach = Math.min(100, Math.round((pubs.length/10)*10))

    // normalize weights
    const wSum = weights.research + weights.teaching + weights.collaboration + weights.outreach || 1
    const norm = {
      research: weights.research / wSum,
      teaching: weights.teaching / wSum,
      collaboration: weights.collaboration / wSum,
      outreach: weights.outreach / wSum,
    }

    const ai = Math.round(
      research*norm.research + teaching*norm.teaching + collaboration*norm.collaboration + outreach*norm.outreach
    )

    return {research, teaching, collaboration, outreach, ai}
  },[pubs, fb, weights])

  return (
    <div className="app-root">
      <header className="app-header">
        <h1>Levelling Up Academia</h1>
        <p className="subtitle">Academic Impact Index — Interactive MVP Dashboard</p>
      </header>

      {loading && <div className="center">Loading sample data...</div>}
      {error && <div className="center error">Error: {error}</div>}

      <main className="grid">
        <aside className="left-col">
          <Scorecard score={aiScores.ai} breakdown={{research:aiScores.research, teaching:aiScores.teaching, collaboration:aiScores.collaboration, outreach:aiScores.outreach}} />
          <WeightControls weights={weights} onChange={setWeights} previewWeights={pendingSuggestion?.preview} />
          <TrendChart publications={pubs} />
          <AIChat onSend={async (text)=>{
            setAiReply(null)
            setPendingSuggestion(null)
            try{
              const r = await aiAnalyze(text)
              if(r && r.ok){
                setAiReply(r)
                const delta = r.suggested_weights_delta || {}
                // compute preview weights (do not apply automatically)
                setPendingSuggestion({delta, preview: (()=>{
                  const next = {...weights}
                  Object.keys(delta).forEach(k=>{ if(typeof delta[k] === 'number') next[k] = Math.max(0, Math.min(100, next[k] + delta[k])) })
                  return next
                })()})
              }else{
                alert('AI returned an error: '+(r.error||'unknown'))
              }
            }catch(e){
              alert('AI call failed: '+(e.message||e))
            }
          }} />
          {pendingSuggestion && (
            <div className="card ai-suggestion" style={{marginTop:8}}>
              <strong>AI suggested weight changes (preview)</strong>
              <div style={{display:'flex', gap:8, marginTop:8}}>
                {Object.keys(pendingSuggestion.preview).map(k=> (
                  <div key={k} style={{flex:1, padding:6, borderRadius:6, background:'#fff'}}>
                    <div style={{fontSize:12, color:'#666'}}>{k}</div>
                    <div style={{fontWeight:700}}>{pendingSuggestion.preview[k]}%</div>
                    <div style={{fontSize:11, color:'#444'}}>{(pendingSuggestion.delta[k]||0) >=0 ? '+'+pendingSuggestion.delta[k] : pendingSuggestion.delta[k]}</div>
                  </div>
                ))}
              </div>
              <div style={{display:'flex', gap:8, justifyContent:'flex-end', marginTop:8}}>
                <button onClick={()=>{ setPendingSuggestion(null) }}>Reject</button>
                <button onClick={()=>{
                  // open confirm modal with payload
                  setConfirmPayload({ pending: pendingSuggestion, preview: pendingSuggestion.preview, previous: {...weights} })
                  setConfirmOpen(true)
                }}>Accept</button>
              </div>
            </div>
          )}

          <ConfirmModal open={confirmOpen} onClose={()=>{ setConfirmOpen(false); setConfirmPayload(null) }} onConfirm={async ()=>{
            // apply confirm
            if(!confirmPayload) return
            const suggestion = confirmPayload.pending
            const newWeights = { ...weights }
            Object.keys(suggestion.delta || {}).forEach(k => {
              newWeights[k] = Math.max(0, Math.min(100, (newWeights[k] || 0) + suggestion.delta[k]))
            })
            setUndoState({ previous: {...weights} })
            setWeights(newWeights)
            setPendingSuggestion(null)
            setConfirmOpen(false)
            setConfirmPayload(null)
            try{ localStorage.setItem('ai_weights', JSON.stringify(newWeights)) }catch(e){}
            try{ await postUserWeights('default', newWeights) }catch(e){ console.warn('server save failed', e) }
            // auto-clear undo after a while
            setTimeout(()=> setUndoState(null), 8000)
          }} preview={confirmPayload?.preview} previous={confirmPayload?.previous} />
          {aiReply && (
            <div className="card" style={{marginTop:8}}>
              <strong>AI Reply:</strong>
              <p style={{fontSize:13}}>{aiReply.reply_text}</p>
              {aiReply.explanation && <ul>{aiReply.explanation.map((x,i)=><li key={i}>{x}</li>)}</ul>}
            </div>
          )}
        </aside>

        <section className="main-col">
          <div className="controls-row">
            <SearchBar query={query} onQuery={setQuery} year={yearFilter} onYear={setYearFilter} />
          </div>
          <Publications items={filteredPubs} />
          <Feedback items={fb} />
        </section>
      </main>
      {undoState && (
        <div className="undo-toast">
          <div>Weights updated</div>
          <button onClick={handleUndo}>Undo</button>
        </div>
      )}
    </div>
  )
}
