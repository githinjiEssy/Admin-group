import React, { useEffect, useState } from "react";
import { api } from "../../api.js";
import { useAuth } from "../../context/AuthContext.jsx";

export default function Messages() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    api.getLecturerMessages(user.id).then(setMessages);
  }, []);

  const readMessage = async (id) => {
    await api.markMessageRead(id);
    setMessages(await api.getLecturerMessages(user.id));
  };

  return (
    <div>
      <h2>Messages from Admin</h2>

      {messages.length === 0 && <p>No messages yet.</p>}

      {messages.map((m) => (
        <div key={m.id} className="p-2 border my-2">
          <p><strong>Message:</strong> {m.message}</p>
          <p><strong>Related Issue ID:</strong> {m.issueId}</p>
          <p><strong>Status:</strong> {m.read ? "Read" : "Unread"}</p>

          {!m.read && <button onClick={() => readMessage(m.id)}>Mark Read</button>}
        </div>
      ))}
    </div>
  );
}
