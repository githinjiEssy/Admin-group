import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useData } from "../../context/DataContext.jsx";
import { api } from "../../api.js";

export default function RaiseIssue() {
  const { user } = useAuth();
  const { courses } = useData();

  const [form, setForm] = useState({
    issueType: "",
    description: "",
    courseId: ""
  });

  const submit = async (e) => {
    e.preventDefault();
    await api.raiseIssue({
      studentId: user.id,
      ...form
    });
    alert("Issue submitted to Admin");
  };

  return (
    <div>
      <h2>Raise an Issue</h2>

      <form onSubmit={submit} className="max-w-lg">
        <label>Issue Type</label>
        <select
          required
          onChange={(e) => setForm({ ...form, issueType: e.target.value })}
        >
          <option value="">-- Select Issue --</option>
          <option value="Missing Marks">Missing Marks</option>
          <option value="Wrong Marks">Wrong Marks</option>
          <option value="Personal Details">Personal Details</option>
          <option value="Fees Related">Fees Related</option>
        </select>

        <label>Description</label>
        <textarea
          required
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <label>Course (optional)</label>
        <select
          onChange={(e) => setForm({ ...form, courseId: e.target.value })}
        >
          <option value="">Not related to a course</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.code} - {c.title}
            </option>
          ))}
        </select>

        <button type="submit">Submit Issue</button>
      </form>
    </div>
  );
}
