import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Navbar() {
  const { user, logout } = useAuth()
  return (
    <nav className="bg-white shadow p-3">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link to="/" className="font-bold">Online Exam System</Link>
        </div>
        <div className="flex items-center gap-3">
          {!user && <><Link to="/login">Login</Link><Link to="/register">Register</Link></>}
          {user && (
            <>
              <span className="px-2 py-1 rounded bg-gray-100">{user.name} ({user.role})</span>
              <button onClick={logout} className="underline">Logout</button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
