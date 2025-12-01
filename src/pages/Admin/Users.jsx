import React, { useEffect, useState } from 'react'
import { api } from '../../api.js'
import { useData } from '../../context/DataContext.jsx'

export default function AdminUsers(){
  const { courses, users: ctxUsers, refreshAll } = useData()
  const [allUsers, setAllUsers] = useState([])
  const [students, setStudents] = useState([]) // New state for students
  const [lecturers, setLecturers] = useState([]) // New state for lecturers
  const [form, setForm] = useState({ name: '', email: '', role: 'student' })
  const [selectedCourse, setSelectedCourse] = useState('')
  const [chosenLecturerForAssign, setChosenLecturerForAssign] = useState('')
  const [selectedStudent, setSelectedStudent] = useState('')
  const [selectedLecturerForRegistration, setSelectedLecturerForRegistration] = useState('')
  const [registrations, setRegistrations] = useState([])
  const [editing, setEditing] = useState({}) // regId -> lecturerId
  const [editingUser, setEditingUser] = useState(null)
  const [selectedStudentDetails, setSelectedStudentDetails] = useState(null) // For student details modal

  // ===================================================================================================================
  // get all students from API
  useEffect(()=>{
    (async ()=> {
      setAllUsers(await api.getUsers())
      setRegistrations(await api.listAllRegistrations())
      
      // Fetch students from your backend
      try {
        const backendStudents = await api.getStudents()
        console.log('Backend students:', backendStudents)
        setStudents(backendStudents)
      } catch (error) {
        console.error('Failed to fetch students:', error)
      }

      // Fetch lecturers from your backend
      try {
        const backendLecturers = await api.getLecturers()
        console.log('Backend lecturers:', backendLecturers)
        setLecturers(backendLecturers)
      } catch (error) {
        console.error('Failed to fetch lecturers:', error)
      }
    })()
  }, [])

  // Function to reload users and registrations
  const reload = async () => {
    setAllUsers(await api.getUsers())
    setRegistrations(await api.listAllRegistrations())
    
    // Also reload backend data
    try {
      setStudents(await api.getStudents())
      setLecturers(await api.getLecturers())
    } catch (error) {
      console.error('Error reloading backend data:', error)
    }
    
    await refreshAll()
  }

  // Function to view student details
  const viewStudentDetails = async (student) => {
    setSelectedStudentDetails(student)
  }

  // Function to close student details
  const closeStudentDetails = () => {
    setSelectedStudentDetails(null)
  }

  // Function to get lecturer name by ID
  const getLecturerName = (lecturerId) => {
    const lecturer = lecturers.find(l => l._id === lecturerId || l.id === lecturerId)
    return lecturer ? lecturer.name : 'Unknown Lecturer'
  }

  // Function to get course name from lecturer's course field
  const getCourseName = (lecturerId) => {
    const lecturer = lecturers.find(l => l._id === lecturerId || l.id === lecturerId)
    return lecturer ? lecturer.course : 'Unknown Course'
  }

  // ===============================================================================================================================
  const createUser = async (e) => {
    e.preventDefault()
    try {
      await api.createUser(form)
      alert('User created')
      setForm({ name: '', email: '', role: 'student' })
      await reload()
    } catch (err) { alert(err.message) }
  }

  const startEditUser = (u) => setEditingUser({ ...u })

  const saveUserEdit = async () => {
    try {
      await api.updateUser(editingUser.id, { name: editingUser.name, email: editingUser.email, role: editingUser.role })
      alert('User updated')
      setEditingUser(null)
      await reload()
    } catch (err) { alert(err.message) }
  }

  const deleteUser = async (id) => {
    if (!confirm('Delete user? This will remove registrations and marks.')) return
    await api.deleteUser(id)
    alert('Deleted')
    await reload()
  }

  const assignLecturerToCourse = async () => {
    if (!selectedCourse || !chosenLecturerForAssign) return alert('Select course and lecturer to assign')
    await api.assignLecturerToCourse(selectedCourse, chosenLecturerForAssign)
    alert('Lecturer assigned to course')
    await reload()
  }

  const registerStudentToCourse = async () => {
    if (!selectedCourse || !selectedStudent) return alert('Pick student and course')
    try {
      await api.registerStudentToCourse({
        studentId: selectedStudent,
        courseId: selectedCourse,
        lecturerId: selectedLecturerForRegistration || null
      })
      alert('Student registered')
      setRegistrations(await api.listAllRegistrations())
      await reload()
    } catch (err) { alert(err.message) }
  }

  const deleteRegistration = async (regId) => {
    if (!confirm('Delete registration?')) return
    await api.deleteRegistration(regId)
    alert('Registration deleted')
    setRegistrations(await api.listAllRegistrations())
    await reload()
  }

  const startEdit = (regId, currentLecturerId) => {
    setEditing(prev => ({ ...prev, [regId]: currentLecturerId || '' }))
  }

  const saveEdit = async (regId) => {
    const newLecturerId = editing[regId] || null
    try {
      await api.updateRegistrationLecturer(regId, newLecturerId)
      alert('Registration updated. Lecturer notified.')
      setRegistrations(await api.listAllRegistrations())
      await reload()
    } catch (err) { alert(err.message) }
  }

  return (
    <div>
      <h2 className="text-2xl mb-4">User Management</h2>
{/* 
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold mb-2">Create or Edit user</h3>
          {!editingUser && (
            <form onSubmit={createUser}>
              <label className="text-sm">Name</label>
              <input className="border p-2 rounded w-full" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} required />
              <label className="text-sm mt-2">Email</label>
              <input className="border p-2 rounded w-full" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} required />
              <label className="text-sm mt-2">Role</label>
              <select className="border p-2 rounded w-full" value={form.role} onChange={e=>setForm({...form, role:e.target.value})}>
                <option value="student">Student</option>
                <option value="lecturer">Lecturer</option>
                <option value="admin">Admin</option>
              </select>
              <button className="mt-3 bg-green-600 text-white px-3 py-2 rounded">Create</button>
            </form>
          )}

          {editingUser && (
            <div>
              <label className="text-sm">Name</label>
              <input className="border p-2 rounded w-full" value={editingUser.name} onChange={e=>setEditingUser({...editingUser, name:e.target.value})} />
              <label className="text-sm mt-2">Email</label>
              <input className="border p-2 rounded w-full" value={editingUser.email} onChange={e=>setEditingUser({...editingUser, email:e.target.value})} />
              <label className="text-sm mt-2">Role</label>
              <select className="border p-2 rounded w-full" value={editingUser.role} onChange={e=>setEditingUser({...editingUser, role:e.target.value})}>
                <option value="student">Student</option>
                <option value="lecturer">Lecturer</option>
                <option value="admin">Admin</option>
              </select>
              <div className="mt-3 flex gap-2">
                <button className="bg-indigo-600 text-white px-3 py-2 rounded" onClick={saveUserEdit}>Save</button>
                <button className="bg-gray-400 text-white px-3 py-2 rounded" onClick={()=>setEditingUser(null)}>Cancel</button>
              </div>
            </div>
          )}
        </div>

        <div className="card">
          <h3 className="font-semibold mb-2">Assign lecturer / register student</h3>

          <label className="text-sm">Select course</label>
          <select className="border p-2 rounded w-full" value={selectedCourse} onChange={e=>setSelectedCourse(e.target.value)}>
            <option value="">-- choose --</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.code} - {c.title}</option>)}
          </select>

          <label className="text-sm mt-2">Select lecturer to assign</label>
          <select className="border p-2 rounded w-full" value={chosenLecturerForAssign} onChange={e=>setChosenLecturerForAssign(e.target.value)}>
            <option value="">-- choose lecturer --</option>
            {allUsers.filter(u=>u.role==='lecturer').map(l=> <option key={l.id} value={l.id}>{l.name} ({l.email})</option>)}
          </select>
          <div className="flex gap-2 mt-2">
            <button className="bg-blue-600 text-white px-3 py-2 rounded" onClick={assignLecturerToCourse}>Assign</button>
            <button className="bg-yellow-600 text-white px-3 py-2 rounded" onClick={async ()=>{ await api.resetDatabase(); alert('Reset DB; reloading'); window.location.reload() }}>Reset DB</button>
          </div>

          <hr className="my-3"/>

          <label className="text-sm">Register student to selected course</label>
          <select className="border p-2 rounded w-full" value={selectedStudent} onChange={e=>setSelectedStudent(e.target.value)}>
            <option value="">-- choose student --</option>
            {allUsers.filter(u=>u.role==='student').map(s=> <option key={s.id} value={s.id}>{s.name} ({s.email})</option>)}
          </select>

          <label className="text-sm mt-2">Choose lecturer for this student's registration (optional)</label>
          <select className="border p-2 rounded w-full" value={selectedLecturerForRegistration} onChange={e=>setSelectedLecturerForRegistration(e.target.value)}>
            <option value="">-- choose lecturer (optional) --</option>
            {(courses.find(c=>c.id===selectedCourse)?.lecturerIds || []).map(id => {
              const u = allUsers.find(x => x.id === id)
              return <option key={id} value={id}>{u?.name} ({u?.email})</option>
            })}
          </select>

          <button className="mt-3 bg-indigo-600 text-white px-3 py-2 rounded" onClick={registerStudentToCourse}>Register Student</button>
        </div>
      </div> */}

      {/* displaying student details */}
      <div className="mt-6 card">
        <h3 className="font-semibold">All Registrations</h3>
        
        {/* ======================================================================================================================= */}
        {/* Testing backend end points- retreiving students from backend */}
        <div className="mb-6 p-4 border rounded">
          <h4 className="font-semibold text-lg mb-3">Students from Backend (Testing)</h4>
          <div className="overflow-auto">
            <table className="table w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left p-3">First Name</th>
                  <th className="text-left p-3">Last Name</th>
                  <th className="text-left p-3">Email</th>
                  <th className="text-left p-3">School ID</th>
                  <th className="text-left p-3">Major</th>
                  <th className="text-left p-3">Year</th>
                  <th className="text-left p-3">Courses Count</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.length > 0 ? (
                  students.map(student => (
                    <tr key={student._id || student.id} className="border-b">
                      <td className="p-3">{student.firstName}</td>
                      <td className="p-3">{student.lastName}</td>
                      <td className="p-3">{student.email}</td>
                      <td className="p-3">{student.schoolID}</td>
                      <td className="p-3">{student.major}</td>
                      <td className="p-3">{student.currentYear}</td>
                      <td className="p-3">
                        {student.selections ? student.selections.length : 0} courses
                      </td>
                      <td className="p-3">
                        <button 
                          className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                          onClick={() => viewStudentDetails(student)}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="p-3 text-center text-gray-500">
                      No students found or failed to fetch from backend
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ======================================================================================================================================== */}
      </div>

      {/* ============================================================================================================================================== */}
      {/* Student Details Modal */}
      {selectedStudentDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">
                  Student Details: {selectedStudentDetails.firstName} {selectedStudentDetails.lastName}
                </h3>
                <button 
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                  onClick={closeStudentDetails}
                >
                  ×
                </button>
              </div>
              
              {/* Student Information */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="font-semibold">Email:</label>
                  <p>{selectedStudentDetails.email}</p>
                </div>
                <div>
                  <label className="font-semibold">School ID:</label>
                  <p>{selectedStudentDetails.schoolID}</p>
                </div>
                <div>
                  <label className="font-semibold">Major:</label>
                  <p>{selectedStudentDetails.major}</p>
                </div>
                <div>
                  <label className="font-semibold">Current Year:</label>
                  <p>{selectedStudentDetails.currentYear}</p>
                </div>
                <div>
                  <label className="font-semibold">Age:</label>
                  <p>{selectedStudentDetails.age}</p>
                </div>
              </div>

              {/* Courses and Lecturers */}
              <div>
                <h4 className="font-semibold text-lg mb-3">Courses and Lecturers</h4>
                {selectedStudentDetails.selections && selectedStudentDetails.selections.length > 0 ? (
                  <div className="overflow-auto">
                    <table className="table w-full">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="text-left p-3">Course Name</th>
                          <th className="text-left p-3">Lecturer</th>
                          <th className="text-left p-3">Marks</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedStudentDetails.selections.map((selection, index) => (
                          <tr key={index} className="border-b">
                            <td className="p-3">{getCourseName(selection.lecturer)}</td>
                            <td className="p-3">{getLecturerName(selection.lecturer)}</td>
                            <td className="p-3">
                              {selection.marks !== undefined ? `${selection.marks}%` : 'No marks yet'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500">No courses registered yet.</p>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button 
                  className="bg-gray-500 text-white px-4 py-2 rounded"
                  onClick={closeStudentDetails}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}