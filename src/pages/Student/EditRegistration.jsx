import React, { useEffect, useState } from 'react'
import { api } from '../../api.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { useParams, useNavigate } from 'react-router-dom'

export default function EditRegistration(){
  const { regId } = useParams()
  const { user } = useAuth()
  const nav = useNavigate()
  const [registration, setRegistration] = useState(null)
  const [course, setCourse] = useState(null)
  const [lecturers, setLecturers] = useState([])
  const [selectedLecturer, setSelectedLecturer] = useState('')

  useEffect(()=> {
    const load = async () => {
      const regs = await api.listAllRegistrations()
      const reg = regs.find(r => r.id === regId)
      if (!reg) return alert('Registration not found')
      setRegistration(reg)
      const courses = await api.listCourses()
      const c = courses.find(x => x.id === reg.courseId)
      setCourse(c)
      const users = await api.getUsers()
      const lecs = (c?.lecturerIds || []).map(id => users.find(u => u.id === id)).filter(Boolean)
      setLecturers(lecs)
      setSelectedLecturer(reg.lecturerId || '')
    }
    load()
  }, [regId])

  const save = async () => {
    try {
      await api.updateRegistrationLecturer(registration.id, selectedLecturer || null)
      alert('Updated registration')
      nav('/student')
    } catch (err) {
      alert(err.message)
    }
  }

  const remove = async () => {
    if (!confirm('Delete this registration?')) return
    await api.deleteRegistration(registration.id)
    alert('Deleted')
    nav('/student')
  }

  if (!registration) return <div>Loading...</div>

  return (
    <div className="card max-w-lg">
      <h2 className="text-xl mb-3">Edit Registration</h2>
      <div><strong>Course:</strong> {course?.code} — {course?.title}</div>
      <label className="mt-3">Select Lecturer</label>
      <select className="border p-2 rounded w-full" value={selectedLecturer} onChange={e=>setSelectedLecturer(e.target.value)}>
        <option value="">-- none --</option>
        {lecturers.map(l => <option key={l.id} value={l.id}>{l.name} ({l.email})</option>)}
      </select>

      <div className="mt-4 flex gap-2">
        <button className="bg-green-600 text-white px-3 py-1 rounded" onClick={save}>Save</button>
        <button className="bg-red-600 text-white px-3 py-1 rounded" onClick={remove}>Delete Registration</button>
      </div>
    </div>
  )
}
