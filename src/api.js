import { v4 as uuid } from 'uuid'

const STORAGE_KEY = 'gps2_db_v5'
const BASE_URL = "http://localhost:5000"

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

function readDb() {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    // Seed data remains the same...
    const students = Array.from({ length: 10 }).map((_, i) => ({
      id: `s${i + 1}`,
      name: `Student ${i + 1}`,
      email: `student${i + 1}@example.com`,
      role: 'student'
    }))
    const lecturers = Array.from({ length: 5 }).map((_, i) => ({
      id: `l${i + 1}`,
      name: `Lecturer ${i + 1}`,
      email: `lecturer${i + 1}@example.com`,
      role: 'lecturer'
    }))
    const admins = [
      { id: 'a1', name: 'Admin One', email: 'admin1@example.com', role: 'admin' },
      { id: 'a2', name: 'Admin Two', email: 'admin2@example.com', role: 'admin' }
    ]

    const courses = [
      { id: 'c1', code: 'CS101', title: 'Intro to CS', lecturerIds: [lecturers[0].id] },
      { id: 'c2', code: 'CS102', title: 'Data Structures', lecturerIds: [lecturers[1].id] },
      { id: 'c3', code: 'CS103', title: 'Databases', lecturerIds: [lecturers[2].id] },
      { id: 'c4', code: 'CS104', title: 'Web Development', lecturerIds: [lecturers[3].id] },
      { id: 'c5', code: 'CS105', title: 'Software Engineering', lecturerIds: [lecturers[4].id] }
    ]

    const registrations = []
    students.forEach(s => {
      const chosen = new Set()
      while (chosen.size < 3) {
        chosen.add(courses[randInt(0, courses.length - 1)].id)
      }
      Array.from(chosen).forEach(courseId => {
        const course = courses.find(c => c.id === courseId)
        const lecturerId = course.lecturerIds.length ? course.lecturerIds[randInt(0, course.lecturerIds.length - 1)] : null
        registrations.push({ id: uuid(), studentId: s.id, courseId, lecturerId })
      })
    })

    const db = {
      users: [...students, ...lecturers, ...admins],
      courses,
      registrations,
      marks: [],
      issues: [],
      messages: [],
      notifications: []
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
    return db
  }
  return JSON.parse(raw)
}

function writeDb(db) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
}

export const api = {
  // REAL BACKEND API CALLS
  async getStudents() {
    try {
      const response = await fetch(`${BASE_URL}/students`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const students = await response.json()
      console.log('Fetched students from backend:', students)
      return students
    } catch (error) {
      console.error('Error fetching students from backend:', error)
      // Fallback to localStorage students if backend fails
      const db = readDb()
      const localStudents = db.users.filter(u => u.role === 'student')
      console.log('Using fallback students from localStorage:', localStudents)
      return localStudents
    }
  },

  async getLecturers() {
    try {
      const response = await fetch(`${BASE_URL}/lecturers`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const lecturers = await response.json()
      console.log('Fetched lecturers from backend:', lecturers)
      return lecturers
    } catch (error) {
      console.error('Error fetching lecturers from backend:', error)
      // Fallback to localStorage lecturers if backend fails
      const db = readDb()
      const localLecturers = db.users.filter(u => u.role === 'lecturer')
      console.log('Using fallback lecturers from localStorage:', localLecturers)
      return localLecturers
    }
  },

  // EXISTING LOCALSTORAGE FUNCTIONS (keep all your existing functions)
  createUser({ name, email, role }) {
    const db = readDb()
    if (db.users.some(u => u.email === email)) return Promise.reject(new Error('Email already exists'))
    const newUser = { id: uuid(), name, email, role }
    db.users.push(newUser)
    writeDb(db)
    return Promise.resolve(newUser)
  },

  updateUser(id, patch) {
    const db = readDb()
    const u = db.users.find(x => x.id === id)
    if (!u) return Promise.reject(new Error('User not found'))
    Object.assign(u, patch)
    writeDb(db)
    return Promise.resolve(u)
  },

  deleteUser(id) {
    const db = readDb()
    db.users = db.users.filter(u => u.id !== id)
    db.registrations = db.registrations.filter(r => r.studentId !== id)
    db.marks = db.marks.filter(m => m.studentId !== id && m.lecturerId !== id)
    db.notifications = db.notifications.filter(n => n.userId !== id)
    db.messages = db.messages.filter(m => m.adminId !== id && m.lecturerId !== id)
    writeDb(db)
    return Promise.resolve(true)
  },

  getUsers() {
    return Promise.resolve(readDb().users)
  },

  loginByEmail(email) {
    const db = readDb()
    const user = db.users.find(u => u.email === email)
    if (!user) return Promise.reject(new Error('User not found'))
    return Promise.resolve(user)
  },

  // COURSES
  listCourses() {
    return Promise.resolve(readDb().courses)
  },

  createCourse({ code, title }) {
    const db = readDb()
    const course = { id: uuid(), code, title, lecturerIds: [] }
    db.courses.push(course)
    writeDb(db)
    return Promise.resolve(course)
  },

  assignLecturerToCourse(courseId, lecturerId) {
    const db = readDb()
    const c = db.courses.find(x => x.id === courseId)
    if (!c) return Promise.reject(new Error('Course not found'))
    if (!c.lecturerIds) c.lecturerIds = []
    if (!c.lecturerIds.includes(lecturerId)) c.lecturerIds.push(lecturerId)
    writeDb(db)
    return Promise.resolve(c)
  },

  removeLecturerFromCourse(courseId, lecturerId) {
    const db = readDb()
    const c = db.courses.find(x => x.id === courseId)
    if (!c) return Promise.reject(new Error('Course not found'))
    c.lecturerIds = (c.lecturerIds || []).filter(id => id !== lecturerId)
    writeDb(db)
    return Promise.resolve(c)
  },

  // REGISTRATIONS
  registerStudentToCourse({ studentId, courseId, lecturerId = null }) {
    const db = readDb()
    const course = db.courses.find(c => c.id === courseId)
    if (!course) return Promise.reject(new Error('Course not found'))
    if (lecturerId && !(course.lecturerIds || []).includes(lecturerId)) return Promise.reject(new Error('Lecturer not assigned to this course'))

    const existing = db.registrations.filter(r => r.studentId === studentId)
    if (existing.length >= 5) return Promise.reject(new Error('Student cannot register for more than 5 courses'))

    if (db.registrations.some(r => r.studentId === studentId && r.courseId === courseId)) return Promise.reject(new Error('Already registered'))
    const reg = { id: uuid(), studentId, courseId, lecturerId }
    db.registrations.push(reg)

    if (lecturerId) {
      db.notifications.push({
        id: uuid(),
        userId: lecturerId,
        type: 'new_registration',
        payload: { registrationId: reg.id, studentId, courseId },
        read: false,
        createdAt: new Date().toISOString()
      })
    }
    writeDb(db)
    return Promise.resolve(reg)
  },

  updateRegistrationLecturer(registrationId, lecturerId) {
    const db = readDb()
    const reg = db.registrations.find(r => r.id === registrationId)
    if (!reg) return Promise.reject(new Error('Registration not found'))
    const course = db.courses.find(c => c.id === reg.courseId)
    if (!course) return Promise.reject(new Error('Course not found'))
    if (lecturerId && !(course.lecturerIds || []).includes(lecturerId)) return Promise.reject(new Error('Lecturer not assigned to this course'))
    reg.lecturerId = lecturerId

    if (lecturerId) {
      db.notifications.push({
        id: uuid(),
        userId: lecturerId,
        type: 'registration_assigned',
        payload: { registrationId: reg.id, studentId: reg.studentId, courseId: reg.courseId },
        read: false,
        createdAt: new Date().toISOString()
      })
    }
    writeDb(db)
    return Promise.resolve(reg)
  },

  deleteRegistration(registrationId) {
    const db = readDb()
    db.registrations = db.registrations.filter(r => r.id !== registrationId)
    db.marks = db.marks.filter(m => m.id && m.courseId !== registrationId)
    writeDb(db)
    return Promise.resolve(true)
  },

  getRegistrationsByStudent(studentId) {
    const db = readDb()
    return Promise.resolve(db.registrations.filter(r => r.studentId === studentId))
  },

  getRegistrationsByCourse(courseId, lecturerId = null) {
    const db = readDb()
    let res = db.registrations.filter(r => r.courseId === courseId)
    if (lecturerId) res = res.filter(r => r.lecturerId === lecturerId)
    return Promise.resolve(res)
  },

  listAllRegistrations() {
    const db = readDb()
    return Promise.resolve(db.registrations)
  },

  // MARKS
  saveOrUpdateMarks({ studentId, courseId, lecturerId, assignment = null, quiz = null, project = null, midsem = null, endsem = null }) {
    const db = readDb()
    let rec = db.marks.find(m => m.studentId === studentId && m.courseId === courseId)
    if (!rec) {
      rec = { id: uuid(), studentId, courseId, lecturerId, assignment, quiz, project, midsem, endsem }
      db.marks.push(rec)
    } else {
      if (lecturerId) rec.lecturerId = lecturerId
      if (assignment !== null) rec.assignment = assignment
      if (quiz !== null) rec.quiz = quiz
      if (project !== null) rec.project = project
      if (midsem !== null) rec.midsem = midsem
      if (endsem !== null) rec.endsem = endsem
    }
    writeDb(db)
    return Promise.resolve(rec)
  },

  deleteMarks(studentId, courseId) {
    const db = readDb()
    db.marks = db.marks.filter(m => !(m.studentId === studentId && m.courseId === courseId))
    writeDb(db)
    return Promise.resolve(true)
  },

  getMarksByCourseForLecturer({ lecturerId, courseId }) {
    const db = readDb()
    return Promise.resolve(db.marks.filter(m => m.courseId === courseId && m.lecturerId === lecturerId))
  },

  getMarksByStudent(studentId) {
    const db = readDb()
    return Promise.resolve(db.marks.filter(m => m.studentId === studentId))
  },

  getAllMarks() {
    return Promise.resolve(readDb().marks)
  },

  // ISSUES & MESSAGES
  raiseIssue({ studentId, issueType, description, courseId = null }) {
    const db = readDb()
    const issue = { id: uuid(), studentId, issueType, description, courseId, status: 'open', createdAt: new Date().toISOString() }
    db.issues.push(issue)
    writeDb(db)
    return Promise.resolve(issue)
  },

  getIssues() {
    return Promise.resolve(readDb().issues)
  },

  // 
  updateIssueStatus(issueId, status) {
    const db = readDb()
    const i = db.issues.find(x => x.id === issueId)
    if (!i) return Promise.reject(new Error('Issue not found'))
    i.status = status
    writeDb(db)
    return Promise.resolve(i)
  },

  sendMessageToLecturer({ lecturerId, issueId, message, adminId }) {
    const db = readDb()
    const m = { id: uuid(), lecturerId, issueId, message, adminId, read: false, createdAt: new Date().toISOString() }
    db.messages.push(m)
    writeDb(db)
    return Promise.resolve(m)
  },

  getLecturerMessages(lecturerId) {
    const db = readDb()
    return Promise.resolve(db.messages.filter(x => x.lecturerId === lecturerId))
  },

  markMessageRead(messageId) {
    const db = readDb()
    const m = db.messages.find(x => x.id === messageId)
    if (!m) return Promise.reject(new Error('Message not found'))
    m.read = true
    writeDb(db)
    return Promise.resolve(m)
  },

  // NOTIFICATIONS
  addNotification({ userId, type, payload }) {
    const db = readDb()
    const n = { id: uuid(), userId, type, payload, read: false, createdAt: new Date().toISOString() }
    db.notifications.push(n)
    writeDb(db)
    return Promise.resolve(n)
  },

  getNotifications(userId) {
    const db = readDb()
    return Promise.resolve((db.notifications || []).filter(n => n.userId === userId).sort((a,b)=> new Date(b.createdAt)-new Date(a.createdAt)))
  },

  markNotificationRead(notificationId) {
    const db = readDb()
    const n = db.notifications.find(x => x.id === notificationId)
    if (!n) return Promise.reject(new Error('Notification not found'))
    n.read = true
    writeDb(db)
    return Promise.resolve(n)
  },

  // UTIL
  resetDatabase() {
    localStorage.removeItem(STORAGE_KEY)
    return Promise.resolve(true)
  },

  // ISSUES - Backend API calls
  async getIssues(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await fetch(`${BASE_URL}/issues?${queryParams}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching issues from backend:', error);
      // Fallback to localStorage
      return Promise.resolve(readDb().issues);
    }
  },

  async createIssue(issueData) {
    try {
      const response = await fetch(`${BASE_URL}/issues`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(issueData)
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error creating issue:', error);
      // Fallback to localStorage
      const db = readDb();
      const newIssue = {
        id: uuid(),
        ...issueData,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      db.issues.push(newIssue);
      writeDb(db);
      return Promise.resolve(newIssue);
    }
  },

  async updateIssueStatus(issueId, updateData) {
    try {
      console.log('Calling updateIssueStatus with:', { issueId, updateData });
      
      // Don't clean the ID - use it as is
      console.log('Using issue ID as-is:', issueId);
      
      const response = await fetch(`${BASE_URL}/issues/${issueId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error text:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Update successful:', result);
      return result;
      
    } catch (error) {
      console.error('Error updating issue status:', error);
      // Fallback to localStorage
      const db = readDb();
      const issue = db.issues.find(i => i.id === issueId || i._id === issueId);
      if (issue) {
        Object.assign(issue, updateData);
        if (updateData.status === 'resolved' || updateData.status === 'rejected') {
          issue.resolvedAt = new Date().toISOString();
        }
        writeDb(db);
        return Promise.resolve(issue);
      }
      return Promise.reject(error);
    }
  }
}