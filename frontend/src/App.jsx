import React, { useEffect, useState, useMemo } from 'react'
import { getPublications, getFeedback } from './api'
import Scorecard from './components/Scorecard'
import Publications from './components/Publications'
import Feedback from './components/Feedback'
import WeightControls from './components/WeightControls'
import SearchBar from './components/SearchBar'
import TrendChart from './components/TrendChart'

export default function App(){
  const [pubs, setPubs] = useState([])
  const [fb, setFb] = useState([])
  const [query, setQuery] = useState('')
  const [yearFilter, setYearFilter] = useState(null)
  const [weights, setWeights] = useState({research:50, teaching:30, collaboration:15, outreach:5})
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
          <WeightControls weights={weights} onChange={setWeights} />
          <TrendChart publications={pubs} />
        </aside>

        <section className="main-col">
          <div className="controls-row">
            <SearchBar query={query} onQuery={setQuery} year={yearFilter} onYear={setYearFilter} />
          </div>
          <Publications items={filteredPubs} />
          <Feedback items={fb} />
        </section>
      </main>
    </div>
  )
}
