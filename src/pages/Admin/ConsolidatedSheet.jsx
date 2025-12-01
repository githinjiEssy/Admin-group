import React, { useEffect, useState } from 'react'
import { api } from '../../api.js'
import { useData } from '../../context/DataContext.jsx'
import { Link } from 'react-router-dom'

function average(arr){
  if(!arr.length) return 0
  return arr.reduce((a,b)=>a+b,0)/arr.length
}

export default function ConsolidatedSheet(){
  const [marks, setMarks] = useState([])
  const [users, setUsers] = useState([])
  const { courses } = useData()

  useEffect(()=>{
    api.getAllMarks().then(setMarks)
    api.getUsers().then(setUsers)
  }, [])

  const byStudent = {}
  marks.forEach(m => {
    if (!byStudent[m.studentId]) byStudent[m.studentId] = []
    byStudent[m.studentId].push(m)
  })

  return (
    <div>
      <h2 className="text-2xl mb-4">Consolidated Mark Sheets</h2>

      {Object.keys(byStudent).length === 0 && <p>No marks recorded yet.</p>}

      {Object.keys(byStudent).map(sid => {
        const student = users.find(u=>u.id===sid) || { name: sid, email: '' }
        const arr = byStudent[sid]
        const avg = average(arr.map(a=> ( (a.quiz1||0) + (a.midsem||0) + (a.quiz2||0) + (a.endsem||0) ) ))

        return (
          <div key={sid} className="p-3 border my-2 rounded">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">{student.name} ({student.email})</h3>
              <Link to={`/student/course/${sid}`} className="link-btn">View Profile</Link>
            </div>

            <ul className="mt-3">
              {arr.map(m=> {
                const course = courses.find(c => c.id === m.courseId) || { code: m.courseId }
                return (
                  <li key={m.id} className="mb-1">
                    <strong>{course.code} - {course.title}</strong>
                    : Quiz1 {m.quiz1 ?? '-'} | Midsem {m.midsem ?? '-'} | Quiz2 {m.quiz2 ?? '-'} | Endsem {m.endsem ?? '-'}
                  </li>
                )
              })}
            </ul>

          </div>
        )
      })}
    </div>
  )
}
