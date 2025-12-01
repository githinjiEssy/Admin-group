import React from 'react'
import { Link } from 'react-router-dom'

export default function Home(){
  return (
    <div className="prose">
      <h1>Class Project — Online Examination System</h1>
      <p>Choose your role and go to the appropriate module (student / lecturer / admin).</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <Link to="/student/register" className="card">Student Portal</Link>
        <Link to="/lecturer/enter-marks" className="card">Lecturer Portal</Link>
        <Link to="/admin/consolidated" className="card">Admin Portal</Link>
      </div>
    </div>
  )
}
