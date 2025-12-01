import React, { createContext, useContext, useEffect, useState } from 'react'
import { api } from '../api.js'

const DataContext = createContext()

export function DataProvider({ children }) {
  const [courses, setCourses] = useState([])
  const [users, setUsers] = useState([])
  const [registrations, setRegistrations] = useState([])
  const [marks, setMarks] = useState([])
  const [issues, setIssues] = useState([])
  const [messages, setMessages] = useState([])

  const refreshAll = async () => {
    setCourses(await api.listCourses())
    setUsers(await api.getUsers())
    // we load registrations/marks/issues too from localStorage directly
    setRegistrations((await api.getRegistrationsByStudent('')) || []) // fallback; we'll call others where needed
    setMarks(await api.getAllMarks())
    setIssues(await api.getIssues())
    // messages are per-lecturer; fetch on demand
  }

  useEffect(()=> {
    // initial
    (async () => {
      setCourses(await api.listCourses())
      setUsers(await api.getUsers())
      setRegistrations(readRegistrations())
      setMarks(await api.getAllMarks())
      setIssues(await api.getIssues())
    })()
    // eslint-disable-next-line
  }, [])

  // helper to read registrations via api (no endpoint to list all regs, so derive)
  async function readRegistrations() {
    // workaround: read registrations by iterating students
    const db = JSON.parse(localStorage.getItem('gps2_db_v2') || '{}')
    return db.registrations || []
  }

  return (
    <DataContext.Provider value={{
      courses, users, registrations, marks, issues, messages,
      refreshAll,
      reloadMarks: async ()=> setMarks(await api.getAllMarks()),
      reloadIssues: async ()=> setIssues(await api.getIssues())
    }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() { return useContext(DataContext) }
