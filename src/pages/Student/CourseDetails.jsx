import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { api } from '../../api.js'

export default function CourseDetails() {
  const { courseId } = useParams()
  const { user } = useAuth()

  // 🔥 IMPORTANT: mark is NEVER null now
  const [mark, setMark] = useState({
    assignment: null,
    quiz: null,
    project: null,
    midsem: null,
    endsem: null
  })

  const [course, setCourse] = useState(null)

  useEffect(() => {
    const load = async () => {
      const courses = await api.listCourses()
      const found = courses.find(c => c.id === courseId)
      setCourse(found || {})

      const marks = await api.getMarksByStudent(user.id)
      const rec = marks.find(m => m.courseId === courseId)

      if (rec) {
        setMark({
          assignment: rec.assignment ?? null,
          quiz: rec.quiz ?? null,
          project: rec.project ?? null,
          midsem: rec.midsem ?? null,
          endsem: rec.endsem ?? null
        })
      }
    }

    load()
  }, [courseId, user])

  const show = (v) => (v === null || v === undefined ? "-" : v)
  const val = (v) => (v === null || v === undefined ? 0 : v)

  // Calculate totals safely
  const total =
    val(mark.assignment) +
    val(mark.quiz) +
    val(mark.project) +
    val(mark.midsem) +
    val(mark.endsem)

  const percentage = total

  if (!course || !course.code) {
    return (
      <div className="card">
        <h2 className="text-xl font-semibold">Course Not Found</h2>
        <p>This course does not exist or was removed.</p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl mb-4">{course.code} — {course.title}</h2>

      <div className="card text-lg space-y-2">
        <div><strong>Assignment (10):</strong> {show(mark.assignment)}</div>
        <div><strong>Quiz (15):</strong> {show(mark.quiz)}</div>
        <div><strong>Project (25):</strong> {show(mark.project)}</div>
        <div><strong>Midsem (20):</strong> {show(mark.midsem)}</div>
        <div><strong>Endsem (30):</strong> {show(mark.endsem)}</div>

        <hr className="my-3" />

        <div><strong>Total Marks:</strong> {total} / 100</div>
        <div><strong>Percentage:</strong> {percentage}%</div>
      </div>
    </div>
  )
}
