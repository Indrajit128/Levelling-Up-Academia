import axios from 'axios'

const BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8001'

export async function getPublications(){
  const r = await axios.get(`${BASE}/sample/publications`)
  return r.data
}

export async function getFeedback(){
  const r = await axios.get(`${BASE}/sample/feedback`)
  return r.data
}
