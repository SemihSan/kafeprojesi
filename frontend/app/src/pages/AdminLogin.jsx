import { useState } from 'react'
import api, { setAuthToken } from '../lib/api'
import { useNavigate } from 'react-router-dom'

export default function AdminLogin() {
  const [email, setEmail] = useState('owner@cafe.local')
  const [password, setPassword] = useState('admin123')
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  async function login(e) {
    e.preventDefault()
    try {
      const res = await api.post('/admin/login', { email, password })
      const { token } = res.data
      localStorage.setItem('token', token)
      setAuthToken(token)
      navigate('/admin/dashboard')
    } catch (err) {
      setError('Giriş başarısız')
    }
  }

  return (
    <div className="p-6 max-w-sm mx-auto">
      <h1 className="text-2xl font-bold mb-4">Admin Giriş</h1>
      <form onSubmit={login} className="space-y-3">
        <input className="w-full border rounded px-3 py-2" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="w-full border rounded px-3 py-2" placeholder="Şifre" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button className="w-full py-2 bg-black text-white rounded">Giriş Yap</button>
      </form>
    </div>
  )
}


