import React, { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useData } from '../../context/DataContext.jsx'
import { api } from '../../api.js'

export default function RegisterStudent(){
  const { user } = useAuth()
  const { courses } = useData()
  const [selected, setSelected] = useState([])

  useEffect(()=> { if (!selected.length && courses.length) setSelected(courses.slice(0,3).map(c=>({courseId:c.id, lecturerId:''})) ) }, [courses])

  const toggleCourse = (courseId) => {
    if (selected.find(s=>s.courseId===courseId)) setSelected(selected.filter(s=>s.courseId!==courseId))
    else setSelected([...selected, { courseId, lecturerId: '' }])
  }

  const setLecturer = (courseId, lecturerId) => {
    setSelected(selected.map(s=> s.courseId===courseId ? {...s, lecturerId} : s))
  }

  const submit = async (e)=>{
    e.preventDefault()
    await api.saveRegistration({ studentId: user.id, courses: selected })
    alert('Registered!')
  }

  return (
    <div>
      <h2>Register for courses</h2>
      <form onSubmit={submit}>
        <div>
          {courses.map(c => (
            <div key={c.id} className="p-2 border my-1">
              <label>
                <input type="checkbox" checked={!!selected.find(s=>s.courseId===c.id)} onChange={()=>toggleCourse(c.id)} />
                {c.code} - {c.title}
              </label>
              {selected.find(s=>s.courseId===c.id) && (
                <div>
                  <label>Choose Lecturer (type email of existing lecturer)</label>
                  <input onChange={e=>setLecturer(c.id, e.target.value)} placeholder="lecturer email" />
                </div>
              )}
            </div>
          ))}
        </div>
        <button type="submit">Save Registration</button>
      </form>
    </div>
  )
}
