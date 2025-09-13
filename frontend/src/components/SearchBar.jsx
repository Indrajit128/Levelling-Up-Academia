import React from 'react'

export default function SearchBar({query, onQuery, year, onYear}){
  return (
    <div className="searchbar">
      <input placeholder="Search publications by title or author" value={query} onChange={e=>onQuery(e.target.value)} />
      <input type="number" placeholder="Year (e.g. 2023)" value={year||''} onChange={e=>onYear(e.target.value?Number(e.target.value):null)} />
    </div>
  )
}
