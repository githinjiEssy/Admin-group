import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../../api.js'
import { useAuth } from '../../context/AuthContext.jsx'

export default function LecturerRegister(){
  const { courseId } = useParams()
  const { user } = useAuth()
  const [registrations, setRegistrations] = useState([])
  const [studentsMap, setStudentsMap] = useState({})
  const [marksMap, setMarksMap] = useState({})

  useEffect(()=> {
    const load = async () => {
      // get registrations for this course that chose this lecturer
      const regs = await api.getRegistrationsByCourse(courseId, user.id)
      setRegistrations(regs)
      const users = await api.getUsers()
      const students = regs.map(r => users.find(u => u.id === r.studentId))
      const map = {}
      students.forEach(s => { if (s) map[s.id] = s })
      setStudentsMap(map)

      // load marks for this course where lecturerId === user.id
      const marks = (await api.getAllMarks()).filter(m => m.courseId === courseId && m.lecturerId === user.id)
      const mm = {}
      marks.forEach(m => mm[m.studentId] = m)
      setMarksMap(mm)
    }
    load()
  }, [courseId, user])

  const setField = (studentId, field, value) => {
    setMarksMap(prev => {
      const copy = {...prev}
      const rec = copy[studentId] ? {...copy[studentId]} : { studentId, courseId, lecturerId: user.id }
      rec[field] = value === '' ? null : Number(value)
      copy[studentId] = rec
      return copy
    })
  }

  const saveAll = async () => {
    for (const studentId of Object.keys(marksMap)) {
      const rec = marksMap[studentId]
      await api.saveOrUpdateMarks({
        studentId,
        courseId,
        lecturerId: user.id,
        assignment: rec.assignment ?? null,
        quiz: rec.quiz ?? null,
        project: rec.project ?? null,
        midsem: rec.midsem ?? null,
        endsem: rec.endsem ?? null
      })
    }
    alert('Saved marks')
  }

  const clearMarks = async (studentId) => {
    if (!confirm('Clear marks for this student?')) return
    await api.deleteMarks(studentId, courseId)
    const marks = await api.getAllMarks()
    const mm = {}
    marks.filter(m => m.courseId === courseId && m.lecturerId === user.id).forEach(m => mm[m.studentId] = m)
    setMarksMap(mm)
    alert('Cleared marks')
  }

  return (
    <div>
      <h2 className="text-2xl mb-4">Course Register</h2>
      <div className="card overflow-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Assignment (10)</th>
              <th>Quiz (15)</th>
              <th>Project (25)</th>
              <th>Midsem (20)</th>
              <th>Endsem (30)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {registrations.map(r => {
              const s = studentsMap[r.studentId]
              const m = marksMap[r.studentId] || {}
              return (
                <tr key={r.id}>
                  <td>{s?.name} ({s?.email})</td>
                  <td><input type="number" min="0" max="10" value={m.assignment ?? ''} onChange={e=>setField(r.studentId, 'assignment', e.target.value)} className="border p-1 rounded w-20" /></td>
                  <td><input type="number" min="0" max="15" value={m.quiz ?? ''} onChange={e=>setField(r.studentId, 'quiz', e.target.value)} className="border p-1 rounded w-20" /></td>
                  <td><input type="number" min="0" max="25" value={m.project ?? ''} onChange={e=>setField(r.studentId, 'project', e.target.value)} className="border p-1 rounded w-24" /></td>
                  <td><input type="number" min="0" max="20" value={m.midsem ?? ''} onChange={e=>setField(r.studentId, 'midsem', e.target.value)} className="border p-1 rounded w-20" /></td>
                  <td><input type="number" min="0" max="30" value={m.endsem ?? ''} onChange={e=>setField(r.studentId, 'endsem', e.target.value)} className="border p-1 rounded w-20" /></td>
                  <td>
                    <button className="bg-indigo-600 text-white px-2 py-1 rounded mr-2" onClick={saveAll}>Save All</button>
                    <button className="bg-red-500 text-white px-2 py-1 rounded" onClick={()=>clearMarks(r.studentId)}>Clear</button>
                  </td>
                </tr>
              )
            })}
            {registrations.length === 0 && <tr><td colSpan={7}>No students assigned to you for this course.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
