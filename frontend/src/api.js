import axios from 'axios'

const BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000'

export async function getPublications(){
  const r = await axios.get(`${BASE}/sample/publications`)
  return r.data
}

export async function getFeedback(){
  const r = await axios.get(`${BASE}/sample/feedback`)
  return r.data
}

export async function aiAnalyze(text){
  const r = await axios.post(`${BASE}/ai/analyze`, { text })
  return r.data
}

export async function getUserWeights(user_id='default'){
  const r = await axios.get(`${BASE}/user/weights`, { params: { user_id } })
  return r.data
}

export async function postUserWeights(user_id='default', weights={}){
  const r = await axios.post(`${BASE}/user/weights`, { user_id, weights })
  return r.data
}
