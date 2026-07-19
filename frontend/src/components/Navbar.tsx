import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState } from '../store'
import { logout } from '../store/userSlice'

export default function Navbar() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state: RootState) => state.user)

  const handleLogout = () => {
    dispatch(logout())
    navigate('/')
  }

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="font-bold text-2xl">
          NagarSeva
        </Link>
        <div className="flex gap-6 items-center">
          <Link to="/" className="hover:text-blue-200">Home</Link>
          <Link to="/report" className="hover:text-blue-200">Report Issue</Link>
          <Link to="/safety-map" className="hover:text-blue-200">Safety Map</Link>
          {user && (
            <>
              <Link to="/my-complaints" className="hover:text-blue-200">My Complaints</Link>
              <Link to="/dashboard" className="hover:text-blue-200">Dashboard</Link>
              <span className="text-sm">{user.email}</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
              >
                Logout
              </button>
            </>
          )}
          {!user && (
            <>
              <Link to="/login" className="hover:text-blue-200">Login</Link>
              <Link to="/register" className="bg-green-500 px-3 py-1 rounded hover:bg-green-600">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
