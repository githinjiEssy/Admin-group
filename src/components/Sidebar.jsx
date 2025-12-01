import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Sidebar() {
  const { user, logout } = useAuth()
  const nav = useNavigate()

  const doLogout = () => {
    logout()
    nav('/login')
  }

  return (
    <aside className="sidebar">
      <div className="mb-6">
        <h2 className="text-xl font-bold">Online Course and Exam System</h2>
      </div>

      {!user && (
        <div>
          <Link to="/login" className="block py-2">Login</Link>
        </div>
      )}

      {user && user.role === 'admin' && (
        <div>
          <Link to="/admin" className="block py-2">Dashboard</Link>
          <Link to="/admin/users" className="block py-2">User Management</Link>
          <Link to="/admin/consolidated" className="block py-2">Consolidated Results</Link>
          <Link to="/admin/issues" className="block py-2">Student Issues</Link>
          <button onClick={doLogout} className="mt-4 text-sm text-red-600">Logout</button>
        </div>
      )}

      {user && user.role === 'lecturer' && (
        <div>
          <Link to="/lecturer" className="block py-2">Dashboard</Link>
          <Link to="/lecturer/messages" className="block py-2">Messages</Link>
          <button onClick={doLogout} className="mt-4 text-sm text-red-600">Logout</button>
        </div>
      )}

      {user && user.role === 'student' && (
        <div>
          <Link to="/student" className="block py-2">My Courses</Link>
          <Link to="/student/raise-issue" className="block py-2">Raise Issue</Link>
          <button onClick={doLogout} className="mt-4 text-sm text-red-600">Logout</button>
        </div>
      )}
    </aside>
  )
}
