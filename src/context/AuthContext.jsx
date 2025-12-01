import React, { createContext, useContext, useState } from 'react'
import { api } from '../api.js'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('gp2_user')) } catch { return null }
  })

  const login = async (email) => {
    const u = await api.loginByEmail(email)
    setUser(u)
    sessionStorage.setItem('gp2_user', JSON.stringify(u))
    return u
  }

  const logout = () => {
    setUser(null)
    sessionStorage.removeItem('gp2_user')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() { return useContext(AuthContext) }
