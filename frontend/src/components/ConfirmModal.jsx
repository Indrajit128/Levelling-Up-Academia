import React from 'react'

export default function ConfirmModal({open, onClose, onConfirm, preview, previous}){
  if(!open) return null
  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <h3>Confirm apply suggested weights</h3>
        <p>Previous vs suggested (preview)</p>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginTop:8}}>
          <div><strong>Metric</strong></div>
          <div><strong>Previous</strong></div>
          <div><strong>Suggested</strong></div>
          {Object.keys(preview || {}).map(k=> (
            <React.Fragment key={k}>
              <div style={{textTransform:'capitalize'}}>{k}</div>
              <div>{previous?.[k]}%</div>
              <div>{preview?.[k]}%</div>
            </React.Fragment>
          ))}
        </div>
        <div style={{display:'flex', gap:8, justifyContent:'flex-end', marginTop:12}}>
          <button onClick={onClose}>Cancel</button>
          <button onClick={onConfirm}>Confirm</button>
        </div>
      </div>
    </div>
  )
}
