import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../api.js'
import { Link } from 'react-router-dom'

export default function Topbar(){
  const { user } = useAuth()
  const [notifCount, setNotifCount] = useState(0)

  useEffect(()=> {
    let mounted = true
    const load = async () => {
      if (!user) return setNotifCount(0)
      const nots = await api.getNotifications(user.id)
      if (!mounted) return
      const unread = nots.filter(n => !n.read).length
      setNotifCount(unread)
    }
    load()
    // poll every 10s for notification updates
    const t = setInterval(load, 10000)
    return ()=> { mounted = false; clearInterval(t) }
  }, [user])

  return (
    <div className="topbar">
      <div>
        <h1 className="text-2xl font-semibold">Welcome{user ? `, ${user.name}` : ''}</h1>
      </div>
      <div className="flex items-center gap-4">
        {user && user.role === 'lecturer' && (
          <Link to="/lecturer/notifications" className="relative">
            <span className="px-3 py-1 rounded bg-white shadow">Notifications</span>
            {notifCount > 0 && (
              <span className="absolute -top-1 -right-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                {notifCount}
              </span>
            )}
          </Link>
        )}
        <div className="text-sm text-slate-600">
          {user ? `${user.role.toUpperCase()} • ${user.email || ''}` : 'Not logged in'}
        </div>
      </div>
    </div>
  )
}
