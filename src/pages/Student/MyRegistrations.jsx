import React, { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { api } from '../../api.js'

export default function MyRegistrations(){
  const { user } = useAuth()
  const [regs, setRegs] = useState([])

  useEffect(()=>{ if (user) api.getRegistrationsByStudent(user.id).then(setRegs) }, [user])

  return (
    <div>
      <h2>My Registrations</h2>
      <pre>{JSON.stringify(regs, null, 2)}</pre>
    </div>
  )
}
