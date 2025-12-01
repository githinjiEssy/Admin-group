import React, { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { api } from '../../api.js'

export default function MyStudents(){
  const { user } = useAuth()
  const [myMarks, setMyMarks] = useState([])

  useEffect(()=>{ if (user) api.getMarksByLecturer(user.id).then(setMyMarks) }, [user])

  return (
    <div>
      <h2>My Marks</h2>
      <pre>{JSON.stringify(myMarks, null, 2)}</pre>
    </div>
  )
}
