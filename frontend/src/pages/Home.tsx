import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import type { RootState } from '../store'
import { complaintApi } from '../services/api'

interface DashboardStats {
  total_complaints: number
  resolved_count: number
  pending_count: number
  in_progress_count: number
  avg_resolution_time_hours: number | null
  by_priority: Record<string, number>
  by_status: Record<string, number>
}

export default function Home() {
  const navigate = useNavigate()
  const { user } = useSelector((state: RootState) => state.user)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await complaintApi.getDashboardStats()
        setStats(response.data)
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const resolvedPercentage = stats && stats.total_complaints > 0
    ? Math.round((stats.resolved_count / stats.total_complaints) * 100)
    : 0

  return (
    <div className="min-h-screen bg-transparent">
      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-800 to-cyan-600 text-white py-20">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.5),_transparent_35%)]" />
        <div className="relative max-w-6xl mx-auto px-4 text-center">
          <p className="text-sm uppercase tracking-[0.45em] text-cyan-200 mb-5">Community safety made simple</p>
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6">NagarSeva makes civic reporting faster and easier.</h1>
          <p className="mx-auto max-w-3xl text-lg md:text-xl text-slate-200 leading-8 mb-10">
            Share issues from potholes to broken streetlights, track status clearly, and make your neighborhood safer.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => (user ? navigate('/report') : navigate('/register'))}
              className="btn-primary btn-float px-8 py-4 rounded-full text-lg font-semibold shadow-xl hover:scale-[1.02]"
            >
              {user ? 'Report an Issue' : 'Get Started'}
            </button>
            <button
              onClick={() => navigate('/safety-map')}
              className="btn-secondary px-8 py-4 rounded-full text-lg font-semibold hover:bg-slate-100"
            >
              Explore Safety Map
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 text-center">
            <p className="text-sm uppercase tracking-[0.35em] text-slate-500 mb-3">Platform impact</p>
            <h2 className="text-4xl md:text-5xl font-bold section-heading">Performance at a glance</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="card-smooth p-7 hover:-translate-y-1 hover:shadow-xl transition-transform duration-300">
              <p className="text-sm font-semibold text-slate-500 uppercase mb-3">Total Complaints</p>
              <p className="text-5xl font-bold text-slate-900">{stats?.total_complaints ?? '—'}</p>
            </div>
            <div className="card-smooth p-7 hover:-translate-y-1 hover:shadow-xl transition-transform duration-300">
              <p className="text-sm font-semibold text-slate-500 uppercase mb-3">Resolved Rate</p>
              <p className="text-5xl font-bold text-slate-900">{resolvedPercentage}%</p>
            </div>
            <div className="card-smooth p-7 hover:-translate-y-1 hover:shadow-xl transition-transform duration-300">
              <p className="text-sm font-semibold text-slate-500 uppercase mb-3">Pending</p>
              <p className="text-5xl font-bold text-slate-900">{stats?.pending_count ?? '—'}</p>
            </div>
            <div className="card-smooth p-7 hover:-translate-y-1 hover:shadow-xl transition-transform duration-300">
              <p className="text-sm font-semibold text-slate-500 uppercase mb-3">In Progress</p>
              <p className="text-5xl font-bold text-slate-900">{stats?.in_progress_count ?? '—'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card-smooth p-8 hover:-translate-y-1 hover:shadow-xl transition-transform duration-300">
              <div className="text-5xl mb-4">📸</div>
              <h3 className="text-2xl font-semibold mb-3">Report with Photo</h3>
              <p className="text-slate-600 leading-8">
                Capture the issue with a photo and let the system automatically classify it for faster service.
              </p>
            </div>
            <div className="card-smooth p-8 hover:-translate-y-1 hover:shadow-xl transition-transform duration-300">
              <div className="text-5xl mb-4">🗺️</div>
              <h3 className="text-2xl font-semibold mb-3">Auto-Location & Routing</h3>
              <p className="text-slate-600 leading-8">
                Your location is detected automatically so complaints reach the right department quickly.
              </p>
            </div>
            <div className="card-smooth p-8 hover:-translate-y-1 hover:shadow-xl transition-transform duration-300">
              <div className="text-5xl mb-4">✅</div>
              <h3 className="text-2xl font-semibold mb-3">Track Progress</h3>
              <p className="text-slate-600 leading-8">
                Follow every issue from submission to resolution with cleaner, clearer status updates.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
