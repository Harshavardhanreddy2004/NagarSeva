import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState } from '../store'
import { logout } from '../store/userSlice'
import { complaintApi } from '../services/api'

export default function Navbar() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state: RootState) => state.user)
  const [complaintCount, setComplaintCount] = useState<number | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    dispatch(logout())
    navigate('/')
  }

  useEffect(() => {
    if (!user) {
      setComplaintCount(null)
      return
    }

    const fetchCount = async () => {
      try {
        const response = await complaintApi.getDashboardStats()
        setComplaintCount(response.data.total_complaints)
      } catch {
        setComplaintCount(null)
      }
    }

    fetchCount()
  }, [user])

  return (
    <nav className="backdrop-blur-xl bg-white/90 border-b border-slate-200 shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <Link to="/" className="font-semibold text-3xl tracking-tight text-slate-900 hover:text-slate-700 transition-colors duration-200">
            NagarSeva
          </Link>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white p-2 text-slate-700 shadow-sm transition-colors duration-200 sm:hidden"
            aria-expanded={menuOpen}
            aria-label="Toggle navigation menu"
          >
            <span className="sr-only">Toggle navigation menu</span>
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {menuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <>
                  <path d="M4 7h16" />
                  <path d="M4 12h16" />
                  <path d="M4 17h16" />
                </>
              )}
            </svg>
          </button>

          <div className="hidden sm:flex items-center gap-3 text-base">
            {user ? (
              <>
                <span className="rounded-full bg-slate-100 px-4 py-2 font-semibold text-slate-700">{user.email}</span>
                <button
                  onClick={handleLogout}
                  className="rounded-full bg-red-500 px-5 py-2 text-base font-semibold text-white hover:bg-red-600 shadow-sm transition-colors duration-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-base font-semibold text-slate-700 hover:text-slate-900 transition-colors duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="rounded-full bg-blue-600 px-5 py-2 text-base font-semibold text-white hover:bg-blue-700 shadow-sm transition-colors duration-200"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>

        <div className={`${menuOpen ? 'block' : 'hidden'} mt-4 rounded-3xl border border-slate-200 bg-white/95 p-4 shadow-md sm:block`}> 
          <div className="flex flex-col gap-3 text-base text-slate-700 sm:flex-row sm:flex-wrap sm:items-center sm:gap-5">
            <Link to="/" onClick={() => setMenuOpen(false)} className="hover:text-slate-900 transition-colors duration-200">Home</Link>
            <Link to="/report" onClick={() => setMenuOpen(false)} className="hover:text-slate-900 transition-colors duration-200">Report Issue</Link>
            <Link to="/my-complaints" onClick={() => setMenuOpen(false)} className="hover:text-slate-900 transition-colors duration-200">My Complaints</Link>
            <Link to="/safety-map" onClick={() => setMenuOpen(false)} className="hover:text-slate-900 transition-colors duration-200">Safety Map</Link>
            {user && (
              <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="hover:text-slate-900 transition-colors duration-200">Dashboard</Link>
            )}
            {user && complaintCount !== null && (
              <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                {complaintCount} complaint{complaintCount === 1 ? '' : 's'}
              </span>
            )}
          </div>

          <div className="mt-4 flex flex-col gap-3 text-base sm:hidden">
            {user ? (
              <>
                <span className="rounded-full bg-slate-100 px-4 py-2 font-semibold text-slate-700">{user.email}</span>
                <button
                  onClick={() => {
                    handleLogout()
                    setMenuOpen(false)
                  }}
                  className="rounded-full bg-red-500 px-5 py-2 text-base font-semibold text-white hover:bg-red-600 shadow-sm transition-colors duration-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="text-base font-semibold text-slate-700 hover:text-slate-900 transition-colors duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-full bg-blue-600 px-5 py-2 text-base font-semibold text-white hover:bg-blue-700 shadow-sm transition-colors duration-200"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
