import React, { useEffect, useState } from 'react'
import { api } from '../../api.js'
import { useAuth } from '../../context/AuthContext.jsx'

export default function LecturerNotifications(){
  const { user } = useAuth()
  const [nots, setNots] = useState([])

  const load = async () => {
    if (!user) return
    const arr = await api.getNotifications(user.id)
    setNots(arr)
  }

  useEffect(()=> { load() }, [user])

  const markRead = async (id) => {
    await api.markNotificationRead(id)
    await load()
  }

  return (
    <div>
      <h2 className="text-2xl mb-4">Notifications</h2>
      {nots.length === 0 && <div className="card">No notifications.</div>}
      {nots.map(n => (
        <div key={n.id} className={`card mb-3 ${n.read ? '' : 'border-2 border-indigo-200'}`}>
          <div className="flex justify-between items-start">
            <div>
              <div className="font-semibold">{n.type.replace('_',' ')}</div>
              <div className="text-sm text-slate-600">{new Date(n.createdAt).toLocaleString()}</div>
              <pre className="mt-2 text-sm">{JSON.stringify(n.payload, null, 2)}</pre>
            </div>
            {!n.read && <button className="bg-green-600 text-white px-3 py-1 rounded" onClick={()=>markRead(n.id)}>Mark Read</button>}
          </div>
        </div>
      ))}
    </div>
  )
}
