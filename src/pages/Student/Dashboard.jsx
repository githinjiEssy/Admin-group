import React, { useEffect, useState } from 'react'
import { api } from '../../api.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { Link, useNavigate } from 'react-router-dom'

export default function StudentDashboard(){
  const { user } = useAuth()
  const nav = useNavigate()
  const [regs, setRegs] = useState([])
  const [courses, setCourses] = useState([])
  const [users, setUsers] = useState([])

  useEffect(()=> {
    const load = async () => {
      if (!user) return
      setCourses(await api.listCourses())
      setRegs(await api.getRegistrationsByStudent(user.id))
      setUsers(await api.getUsers())
    }
    load()
  }, [user])

  const findLecturer = (lecturerId) => {
    if (!lecturerId) return 'Not chosen'
    const l = users.find(u => u.id === lecturerId)
    return l ? `${l.name} (${l.email})` : lecturerId
  }

  const edit = (regId) => {
    nav(`/student/edit-registration/${regId}`)
  }

  const del = async (regId) => {
    if (!confirm('Delete this registration?')) return
    await api.deleteRegistration(regId)
    setRegs(await api.getRegistrationsByStudent(user.id))
    alert('Registration deleted')
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl">My Courses</h2>
        <Link to="/student/register-course" className="bg-indigo-600 text-white px-3 py-1 rounded">Register Course</Link>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {regs.length === 0 && <div className="card">You are not registered for any courses yet.</div>}
        {regs.map(r => {
          const c = courses.find(x=>x.id===r.courseId) || { code: r.courseId, title: '' }
          return (
            <div key={r.id} className="card">
              <h3 className="font-semibold">{c.code} — {c.title}</h3>
              <div className="mt-2 text-sm">Lecturer: {findLecturer(r.lecturerId)}</div>
              <div className="mt-3 flex gap-2">
                <Link to={`/student/course/${c.id}`} className="link-btn">View Marks</Link>
                <button onClick={()=>edit(r.id)} className="bg-yellow-500 text-white px-2 py-1 rounded">Edit</button>
                <button onClick={()=>del(r.id)} className="bg-red-500 text-white px-2 py-1 rounded">Delete</button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
