import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import Sidebar from './components/Sidebar.jsx'
import Topbar from './components/Topbar.jsx'

// Pages
import Login from './pages/Auth/Login.jsx'
import AdminDashboard from './pages/Admin/AdminDashboard.jsx'
import AdminUsers from './pages/Admin/Users.jsx'
import ConsolidatedSheet from './pages/Admin/ConsolidatedSheet.jsx'
import Issues from './pages/Admin/Issues.jsx'

import StudentDashboard from './pages/Student/Dashboard.jsx'
import RaiseIssue from './pages/Student/RaiseIssue.jsx'
import CourseDetails from './pages/Student/CourseDetails.jsx'
import CourseRegister from "./pages/Student/CourseRegister.jsx";
import EditRegistration from './pages/Student/EditRegistration.jsx'

import LecturerDashboard from './pages/Lecturer/Dashboard.jsx'
import LecturerRegister from './pages/Lecturer/Register.jsx'
import Messages from './pages/Lecturer/Messages.jsx'
import LecturerNotifications from './pages/Lecturer/Notifications.jsx'

function PrivateRoute({ children, role }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (role && user.role !== role) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main">
        <Topbar />
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Admin */}
          <Route path="/admin" element={<PrivateRoute role="admin"><AdminDashboard /></PrivateRoute>} />
          <Route path="/admin/users" element={<PrivateRoute role="admin"><AdminUsers /></PrivateRoute>} />
          <Route path="/admin/consolidated" element={<PrivateRoute role="admin"><ConsolidatedSheet /></PrivateRoute>} />
          <Route path="/admin/issues" element={<PrivateRoute role="admin"><Issues /></PrivateRoute>} />

          {/* Student */}
          <Route path="/student" element={<PrivateRoute role="student"><StudentDashboard /></PrivateRoute>} />
          <Route path="/student/raise-issue" element={<PrivateRoute role="student"><RaiseIssue /></PrivateRoute>} />
          <Route path="/student/course/:courseId" element={<PrivateRoute role="student"><CourseDetails /></PrivateRoute>} />
          <Route path="/student/register-course" element={<PrivateRoute role="student"><CourseRegister /></PrivateRoute>} />
          <Route path="/student/edit-registration/:regId" element={<PrivateRoute role="student"><EditRegistration /></PrivateRoute>} />

          {/* Lecturer */}
          <Route path="/lecturer" element={<PrivateRoute role="lecturer"><LecturerDashboard /></PrivateRoute>} />
          <Route path="/lecturer/course/:courseId" element={<PrivateRoute role="lecturer"><LecturerRegister /></PrivateRoute>} />
          <Route path="/lecturer/messages" element={<PrivateRoute role="lecturer"><Messages /></PrivateRoute>} />
          <Route path="/lecturer/notifications" element={<PrivateRoute role="lecturer"><LecturerNotifications /></PrivateRoute>} />

          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </div>
  )
}
