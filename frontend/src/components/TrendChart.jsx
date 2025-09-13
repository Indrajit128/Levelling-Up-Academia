import React, {useEffect, useRef} from 'react'
import Plotly from 'plotly.js-basic-dist'

export default function TrendChart({publications=[]}){
  const ref = useRef(null)
  useEffect(()=>{
    const counts = {}
    publications.forEach(p=> counts[p.year] = (counts[p.year]||0) + (p.citation_count||0))
    const years = Object.keys(counts).sort()
    const vals = years.map(y=>counts[y])
    const data = [{ x: years, y: vals, type: 'scatter', mode: 'lines+markers', name: 'Citations' }]
    const layout = {margin:{t:20},height:240}
    if(ref.current){
      Plotly.newPlot(ref.current, data, layout, {responsive:true})
    }
  },[publications])
  return <div className="card trend-chart"><h3>Citation trend</h3><div ref={ref}></div></div>
}
