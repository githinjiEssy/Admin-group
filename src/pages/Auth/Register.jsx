import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

export default function Register(){
  const { register } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', role: 'student' })
  const nav = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    await register(form)
    nav('/')
  }

  return (
    <form onSubmit={submit} className="max-w-lg">
      <h2>Register</h2>
      <label>Name
        <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/>
      </label>
      <label>Email
        <input value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required/>
      </label>
      <label>Role
        <select value={form.role} onChange={e=>setForm({...form,role:e.target.value})}>
          <option value="student">Student</option>
          <option value="lecturer">Lecturer</option>
          <option value="admin">Admin</option>
        </select>
      </label>
      <button type="submit">Register</button>
    </form>
  )
}
