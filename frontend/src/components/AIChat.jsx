import React, { useState } from 'react'

export default function AIChat({onSend}){
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)

  const send = async ()=>{
    if(!text.trim()) return
    setBusy(true)
    try{
      await onSend(text)
      setText('')
    }catch(e){
      console.error(e)
      alert('AI call failed: '+(e.message||e))
    }finally{ setBusy(false) }
  }

  return (
    <div className="card ai-chat">
      <h3>AI Assistant</h3>
      <textarea rows={4} value={text} onChange={e=>setText(e.target.value)} placeholder="Ask the assistant to suggest weight adjustments or summarize strengths..." style={{width:'100%', padding:8, borderRadius:6}} />
      <div style={{display:'flex', justifyContent:'flex-end', marginTop:8}}>
        <button onClick={send} disabled={busy} style={{padding:'8px 12px', borderRadius:6}}>{busy? 'Thinking...':'Analyze'}</button>
      </div>
    </div>
  )
}
