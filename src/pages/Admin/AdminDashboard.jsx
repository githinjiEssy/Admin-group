import React from 'react'
import { Link } from 'react-router-dom'

export default function AdminDashboard(){
  return (
    <div>
      <h2 className="text-2xl mb-4">Admin Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/admin/users" className="card">User Management</Link>
        <Link to="/admin/consolidated" className="card">Consolidated Results</Link>
        <Link to="/admin/issues" className="card">Student Issues</Link>
      </div>
    </div>
  )
}
