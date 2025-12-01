import React, { useEffect, useState } from 'react'
import { api } from '../../api.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { useNavigate } from 'react-router-dom'

export default function CourseRegister(){
  const { user } = useAuth()
  const nav = useNavigate()
  const [courses, setCourses] = useState([])
  const [lecturersByCourse, setLecturersByCourse] = useState({})
  const [selectedCourse, setSelectedCourse] = useState('')
  const [selectedLecturer, setSelectedLecturer] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(()=> {
    const load = async () => {
      const cs = await api.listCourses()
      const users = await api.getUsers()
      setCourses(cs)
      const map = {}
      cs.forEach(c => {
        const lecs = (c.lecturerIds || []).map(id => users.find(u => u.id === id)).filter(Boolean)
        map[c.id] = lecs
      })
      setLecturersByCourse(map)
    }
    load()
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (!selectedCourse) return setError('Please choose a course.')
    setLoading(true)
    try {
      const regs = await api.getRegistrationsByStudent(user.id)
      if (regs.length >= 5) {
        setError('You cannot register for more than 5 courses.')
        setLoading(false)
        return
      }
      const lecturerId = selectedLecturer || null
      await api.registerStudentToCourse({ studentId: user.id, courseId: selectedCourse, lecturerId })
      alert('Registered for course')
      nav('/student')
    } catch (err) {
      setError(err.message || 'Failed to register.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 className="text-2xl mb-4">Register for a Course</h2>
      <div className="card max-w-md">
        <form onSubmit={submit}>
          <label className="text-sm">Course</label>
          <select className="border p-2 rounded w-full mb-3" value={selectedCourse} onChange={e=> {
            setSelectedCourse(e.target.value)
            setSelectedLecturer('')
          }}>
            <option value="">-- choose course --</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.code} — {c.title}</option>)}
          </select>

          <label className="text-sm">Lecturer (choose if multiple assigned)</label>
          <select className="border p-2 rounded w-full mb-3" value={selectedLecturer} onChange={e=>setSelectedLecturer(e.target.value)} disabled={!selectedCourse}>
            <option value="">-- choose lecturer (optional) --</option>
            {(lecturersByCourse[selectedCourse] || []).map(l => (
              <option key={l.id} value={l.id}>{l.name} — {l.email}</option>
            ))}
          </select>

          {error && <div className="text-red-600 mb-2">{error}</div>}

          <button className="bg-indigo-600 text-white px-3 py-2 rounded" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
      </div>
    </div>
  )
}
