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
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">NagarSeva</h1>
          <p className="text-xl mb-8">Civic Grievance Reporting & Community Safety</p>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Report civic issues in your neighborhood. From potholes to street lights, 
            your complaints help make our cities safer and better.
          </p>
          {user ? (
            <button
              onClick={() => navigate('/report')}
              className="bg-green-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-600 transition"
            >
              Report an Issue
            </button>
          ) : (
            <button
              onClick={() => navigate('/register')}
              className="bg-green-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-600 transition"
            >
              Get Started
            </button>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Platform Impact</h2>
          
          {loading ? (
            <div className="text-center py-8">Loading stats...</div>
          ) : stats ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Total Complaints */}
              <div className="bg-blue-50 p-6 rounded-lg shadow-md">
                <h3 className="text-gray-600 text-sm font-semibold mb-2">Total Complaints</h3>
                <p className="text-4xl font-bold text-blue-600">{stats.total_complaints}</p>
                <p className="text-gray-500 text-sm mt-2">All time</p>
              </div>

              {/* Resolved Percentage */}
              <div className="bg-green-50 p-6 rounded-lg shadow-md">
                <h3 className="text-gray-600 text-sm font-semibold mb-2">Resolved Rate</h3>
                <p className="text-4xl font-bold text-green-600">{resolvedPercentage}%</p>
                <p className="text-gray-500 text-sm mt-2">{stats.resolved_count} resolved</p>
              </div>

              {/* Pending */}
              <div className="bg-yellow-50 p-6 rounded-lg shadow-md">
                <h3 className="text-gray-600 text-sm font-semibold mb-2">Pending</h3>
                <p className="text-4xl font-bold text-yellow-600">{stats.pending_count}</p>
                <p className="text-gray-500 text-sm mt-2">Awaiting action</p>
              </div>

              {/* In Progress */}
              <div className="bg-purple-50 p-6 rounded-lg shadow-md">
                <h3 className="text-gray-600 text-sm font-semibold mb-2">In Progress</h3>
                <p className="text-4xl font-bold text-purple-600">{stats.in_progress_count}</p>
                <p className="text-gray-500 text-sm mt-2">Being worked on</p>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="text-4xl mb-4">📸</div>
              <h3 className="text-xl font-bold mb-4">Report with Photo</h3>
              <p className="text-gray-600">
                Take a photo of the civic issue in your area. Our AI automatically 
                detects and categorizes the problem.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="text-4xl mb-4">🗺️</div>
              <h3 className="text-xl font-bold mb-4">Auto-Location & Routing</h3>
              <p className="text-gray-600">
                Your location is automatically detected. The complaint is routed 
                to the right department.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="text-4xl mb-4">✅</div>
              <h3 className="text-xl font-bold mb-4">Track Progress</h3>
              <p className="text-gray-600">
                Monitor your complaint status from submission to resolution. 
                Get real-time updates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Make a Difference Today</h2>
          <p className="mb-6 text-lg">
            Join thousands of citizens making their neighborhoods safer and cleaner.
          </p>
          {user ? (
            <button
              onClick={() => navigate('/report')}
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Report an Issue Now
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate('/register')}
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition mr-4"
              >
                Sign Up
              </button>
              <button
                onClick={() => navigate('/login')}
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Log In
              </button>
            </>
          )}
        </div>
      </section>
    </div>
  )
}
