import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { api } from '../../api.js'

export default function EnterMarks(){
  const { user } = useAuth()
  const [marks, setMarks] = useState({ studentEmail: '', courseId: '', mark: '' })

  const submit = async (e)=>{
    e.preventDefault()
    // Find student id by email
    const users = await api.getUsers()
    const student = users.find(u => u.email === marks.studentEmail)
    if (!student) return alert('Student email not found')
    await api.enterMark({ studentId: student.id, courseId: marks.courseId, lecturerId: user.id, mark: Number(marks.mark) })
    alert('Saved mark')
  }

  return (
    <div>
      <h2>Enter Marks</h2>
      <form onSubmit={submit}>
        <label>Student email
          <input value={marks.studentEmail} onChange={e=>setMarks({...marks,studentEmail:e.target.value})} required/>
        </label>
        <label>Course id
          <input value={marks.courseId} onChange={e=>setMarks({...marks,courseId:e.target.value})} required/>
        </label>
        <label>Mark
          <input type="number" value={marks.mark} onChange={e=>setMarks({...marks,mark:e.target.value})} required/>
        </label>
        <button type="submit">Save</button>
      </form>
    </div>
  )
}
