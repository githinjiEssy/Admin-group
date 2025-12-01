import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

export default function Login(){
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const nav = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const u = await login(email)
      // redirect by role
      if (u.role === 'admin') nav('/admin')
      else if (u.role === 'lecturer') nav('/lecturer')
      else if (u.role === 'student') nav('/student')
      else nav('/')
    } catch (err) {
      alert('No user found with that email. Ask Admin to create account or check seeded emails.')
    } finally { setLoading(false) }
  }

  return (
    <div className="max-w-md mx-auto card">
      <h2 className="text-xl font-semibold mb-4">Login (Email only)</h2>
      <form onSubmit={submit}>
        <label className="block text-sm">Email</label>
        <input className="border p-2 rounded w-full" value={email} onChange={e=>setEmail(e.target.value)} required />
        <button className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <div className="mt-4 text-sm text-slate-500">
        Seeded example emails: student1@example.com ... student10@example.com, lecturer1@example.com ... lecturer5@example.com, admin1@example.com
      </div>
    </div>
  )
}
