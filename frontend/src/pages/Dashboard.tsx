import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
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

interface ComplaintData {
  id: number
  user_id: number
  description: string
  status: string
  priority: string
  location_lat: number
  location_lon: number
  location_address: string | null
  created_at: string
  images: any[]
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { user } = useSelector((state: RootState) => state.user)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [complaints, setComplaints] = useState<ComplaintData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [statsRes, complaintsRes] = await Promise.all([
        complaintApi.getDashboardStats(),
        complaintApi.listComplaints({
          status: statusFilter,
          priority: priorityFilter,
          limit: 100,
        }),
      ])

      setStats(statsRes.data)
      setComplaints(complaintsRes.data || [])
      setError(null)
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to fetch data'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    fetchData()

    const onComplaintStatusChanged = () => {
      fetchData()
    }

    window.addEventListener('complaint-status-changed', onComplaintStatusChanged)
    return () => window.removeEventListener('complaint-status-changed', onComplaintStatusChanged)
  }, [user, statusFilter, priorityFilter, navigate])

  const filteredComplaints = complaints.filter((c) => {
    if (statusFilter && c.status !== statusFilter) return false
    if (priorityFilter && c.priority !== priorityFilter) return false
    return true
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN')
  }

  const getStatusBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      submitted: 'bg-blue-100 text-blue-800',
      assigned: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-purple-100 text-purple-800',
      resolved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    }
    return colors[status] || colors.submitted
  }

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'text-green-600',
      medium: 'text-yellow-600',
      high: 'text-orange-600',
      critical: 'text-red-600',
    }
    return colors[priority] || colors.medium
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Monitor and manage all civic complaints</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        {loading && !stats ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        ) : stats ? (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              {/* Total Complaints */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-gray-600 text-sm font-semibold mb-2">Total Complaints</h3>
                <p className="text-4xl font-bold text-blue-600">{stats.total_complaints}</p>
              </div>

              {/* Resolved */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-gray-600 text-sm font-semibold mb-2">Resolved</h3>
                <p className="text-4xl font-bold text-green-600">{stats.resolved_count}</p>
                <p className="text-gray-500 text-xs mt-2">
                  {stats.total_complaints > 0
                    ? `${Math.round((stats.resolved_count / stats.total_complaints) * 100)}%`
                    : '0%'}
                </p>
              </div>

              {/* Pending */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-gray-600 text-sm font-semibold mb-2">Pending</h3>
                <p className="text-4xl font-bold text-yellow-600">{stats.pending_count}</p>
              </div>

              {/* In Progress */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-gray-600 text-sm font-semibold mb-2">In Progress</h3>
                <p className="text-4xl font-bold text-purple-600">{stats.in_progress_count}</p>
              </div>

              {/* Avg Response Time */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-gray-600 text-sm font-semibold mb-2">Avg Response (hrs)</h3>
                <p className="text-4xl font-bold text-orange-600">
                  {stats.avg_resolution_time_hours
                    ? Math.round(stats.avg_resolution_time_hours)
                    : '—'}
                </p>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-lg font-semibold mb-4">Filters</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={statusFilter || ''}
                    onChange={(e) => setStatusFilter(e.target.value || null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Statuses</option>
                    <option value="submitted">Submitted</option>
                    <option value="assigned">Assigned</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={priorityFilter || ''}
                    onChange={(e) => setPriorityFilter(e.target.value || null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Priorities</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setStatusFilter(null)
                      setPriorityFilter(null)
                    }}
                    className="w-full bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>

            {/* Complaints Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Priority</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredComplaints.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                          No complaints found
                        </td>
                      </tr>
                    ) : (
                      filteredComplaints.map((complaint) => (
                        <tr key={complaint.id} className="border-b hover:bg-gray-50">
                          <td className="px-6 py-3 text-sm text-gray-900">#{complaint.id}</td>
                          <td className="px-6 py-3 text-sm text-gray-900 max-w-xs truncate">
                            {complaint.description}
                          </td>
                          <td className="px-6 py-3 text-sm">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(complaint.status)}`}>
                              {complaint.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className={`px-6 py-3 text-sm font-semibold ${getPriorityColor(complaint.priority)}`}>
                            {complaint.priority}
                          </td>
                          <td className="px-6 py-3 text-sm text-gray-600">
                            {formatDate(complaint.created_at)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}
