import React, { useEffect, useState } from "react";
import { api } from "../../api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { Link } from "react-router-dom";

export default function LecturerDashboard() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [registrations, setRegistrations] = useState([]);

  useEffect(() => {
    const load = async () => {
      const allCourses = await api.listCourses();
      const allRegs = await api.listAllRegistrations();

      // FIX: Filter courses where lecturerId is included in lecturerIds array
      const myCourses = allCourses.filter(c =>
        (c.lecturerIds || []).includes(user.id)
      );

      setCourses(myCourses);

      // get only registrations tied to this lecturer
      const myRegs = allRegs.filter(r => r.lecturerId === user.id);
      setRegistrations(myRegs);
    };
    load();
  }, [user]);

  const studentCount = (courseId) =>
    registrations.filter((r) => r.courseId === courseId).length;

  return (
    <div>
      <h2 className="text-2xl mb-4">Lecturer Dashboard</h2>

      {courses.length === 0 && (
        <div className="card">You have not been assigned to any course yet.</div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {courses.map((course) => (
          <div key={course.id} className="card">
            <h3 className="font-semibold text-lg">
              {course.code} — {course.title}
            </h3>
            <p className="text-sm mt-2">
              Students assigned to you: {studentCount(course.id)}
            </p>
            <Link
              to={`/lecturer/course/${course.id}`}
              className="link-btn mt-3 inline-block"
            >
              Open Register →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
